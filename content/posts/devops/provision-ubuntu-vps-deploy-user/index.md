---
title: "Provision an Ubuntu VPS and Create a Deploy User"
date: 2026-03-20
categories: [devops]
tags: [linux, security, digitalocean]
series: ["production-linux"]
series_order: 1
summary: "Set up a DigitalOcean droplet from scratch: first SSH connection, deploy user, UFW baseline, and unattended upgrades."
slug: "provision-ubuntu-vps-deploy-user"
draft: false
devto_id: 3378663
---

Ahnii!

> This is part 1 of the [Production Linux series]({{< relref "production-linux-series-index" >}}). It covers the first steps after creating a new VPS.

This post walks you through provisioning a fresh [DigitalOcean](https://www.digitalocean.com/) droplet — from your first root SSH connection to a locked-down baseline with a non-root deploy user, a UFW firewall, and automatic security patches. This covers Ubuntu 24.04 LTS only; the commands assume a clean droplet with no prior configuration.

## Prerequisites

- A DigitalOcean account (or any VPS provider running Ubuntu 24.04)
- An SSH key pair on your local machine (`~/.ssh/id_ed25519` and `~/.ssh/id_ed25519.pub`)

## Create the Droplet

The fastest path is [doctl](https://docs.digitalocean.com/reference/doctl/), the DigitalOcean CLI:

```bash
doctl compute droplet create my-server \
  --image ubuntu-24-04-x64 \
  --size s-1vcpu-1gb \
  --region tor1 \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header) \
  --wait
```

This creates a 1 vCPU / 1 GB droplet in Toronto using all SSH keys in your account. Swap `tor1` for your nearest region (`nyc3`, `sfo3`, `ams3`, etc.). The `--wait` flag blocks until provisioning is complete, then prints the droplet's public IP.

If you prefer the web console, create the droplet through the DigitalOcean dashboard and select your SSH key during setup. Either way, note the public IP before continuing.

## First SSH Connection

Connect as root using your SSH key:

```bash
ssh root@your-server-ip
```

On first login you will see the Ubuntu welcome banner, MOTD, and a summary of pending updates. Cloud-init has already configured the server with `PasswordAuthentication no` and your SSH public key in `/root/.ssh/authorized_keys`, so password login is disabled out of the box.

## Create a Deploy User

Running everything as root is a bad habit. Create a dedicated deploy user now:

```bash
adduser deployer
usermod -aG sudo deployer
```

`adduser` creates the home directory, prompts for a password, and sets up the default shell. `usermod -aG sudo deployer` grants the user passwordless-capable sudo access via the `sudo` group.

Copy root's authorized keys to the new user so you can SSH in as `deployer`:

```bash
rsync --archive --chown=deployer:deployer /root/.ssh /home/deployer/
```

`rsync` copies the `.ssh` directory with correct ownership in one step — no manual `chown` or `chmod` needed.

**Before closing your root session**, open a second terminal and verify the new user works:

```bash
ssh deployer@your-server-ip
sudo whoami
```

You should see `root` returned by `sudo whoami`. Only close the root session after confirming this. Locking yourself out of a new server is a rite of passage you can skip.

## Set Up UFW

[UFW](https://help.ubuntu.com/community/UFW) (Uncomplicated Firewall) is the standard iptables front end on Ubuntu:

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status verbose
```

The first two lines set the baseline policy: block all inbound, allow all outbound. The three `allow` rules open SSH, HTTP, and HTTPS. Enabling UFW applies the rules immediately — your existing SSH session stays connected because UFW handles established connections gracefully.

`ufw status verbose` confirms the active rules. You should see `Status: active` at the top and the three `ALLOW IN` entries listed.

## Enable Unattended Upgrades

Security patches should apply automatically. Install and configure the package:

```bash
apt update && apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

When prompted, select **Yes** to enable automatic updates. This writes the configuration to `/etc/apt/apt.conf.d/20auto-upgrades`.

Verify the file looks correct:

```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
```

You should see:

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

Both values set to `"1"` mean: refresh the package list daily and apply security upgrades daily.

## Verify Your Baseline

At this point your server has a working security foundation:

| Layer | What's in place |
|---|---|
| Network | UFW default-deny inbound; ports 22, 80, 443 open |
| SSH | Key-only authentication; password login disabled |
| User | Non-root `deployer` user with sudo access |
| Patches | Automatic daily security updates via unattended-upgrades |

If you want to automate this entire process with Ansible, see [Manage DigitalOcean Infrastructure With Ansible]({{< relref "ansible-manage-digitalocean-laravel-infrastructure" >}}).

Baamaapii
