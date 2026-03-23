---
categories: []
date: "2026-03-23T01:34:40.655Z"
devto: true
devto_id: 3386539
draft: true
slug: ssh-hardening-ed25519-keys-and-disabling-root-login-45ng
summary: Lock down SSH access with ed25519 keys, disable root login, and remove unused authentication methods.
tags:
    - linux
    - security
    - ssh
title: 'SSH Hardening: Ed25519 Keys and Disabling Root Login'
---

Ahnii!

> This is part 2 of the [Production Linux series](https://jonesrussell.github.io/blog/production-linux-series-index/). Previous: [Provision an Ubuntu VPS and Create a Deploy User](https://jonesrussell.github.io/blog/provision-ubuntu-vps-deploy-user/).

SSH is the front door to your server. A default installation leaves several doors unlocked: root login allowed, RSA keys accepted, authentication methods enabled that you never use. This post locks all of that down with ed25519 keys, full root login denial, and a minimal drop-in config file.

## Generate an Ed25519 Key

Run this on your local machine, not the server:

```bash
ssh-keygen -t ed25519 -C "your@email.com"
```

This creates `~/.ssh/id_ed25519` (private) and `~/.ssh/id_ed25519.pub` (public). The `-C` flag adds a comment to the public key to help you identify it later.

Ed25519 is the current standard over RSA. The key is smaller, the math is faster, and the implementation has fewer side-channel risks. An RSA key at 4096 bits is still considered safe, but ed25519 achieves stronger security guarantees with 256 bits.

Copy the public key to your server:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub deployer@your-server-ip
```

This appends your public key to `~/.ssh/authorized_keys` on the server and sets correct permissions. Test the key-based login before you disable password auth — you want to confirm the key works while you still have a fallback.

## Disable Root Login

Ubuntu and most VPS providers ship with `PermitRootLogin prohibit-password`, which still allows root login via SSH key. That is weaker than you want. Your deploy user has `sudo` access, so root never needs a direct SSH session.

Use a drop-in file rather than editing the main config:

```bash
sudo nano /etc/ssh/sshd_config.d/99-hardening.conf
```

Add:

```ssh
PermitRootLogin no
PasswordAuthentication no
```

Drop-in files in `/etc/ssh/sshd_config.d/` override the main `sshd_config`. Using a separate file keeps your changes isolated and easy to audit. The `99-` prefix ensures it loads last, after any distribution defaults.

Setting `PermitRootLogin no` closes the remaining gap from `prohibit-password`. An attacker who finds or steals an SSH key still cannot get a root shell directly — they would also need the deploy user's sudo password.

## Restrict Key Types

Add this line to the same drop-in file:

```ssh
PubkeyAcceptedAlgorithms ssh-ed25519,sk-ssh-ed25519@openssh.com
```

This tells sshd to reject any public key that is not ed25519. RSA keys, ECDSA keys, and DSA keys will all be refused. The `sk-ssh-ed25519@openssh.com` algorithm is the FIDO2 hardware key variant — worth including if you ever move to a YubiKey or similar device, which is the strongest auth method available for SSH.

## Disable Unused Auth Methods

Add these lines to the drop-in:

```ssh
KbdInteractiveAuthentication no
GSSAPIAuthentication no
X11Forwarding no
```

`KbdInteractiveAuthentication no` disables challenge-response authentication, which is the mechanism PAM uses for interactive password prompts. Even with `PasswordAuthentication no`, leaving this enabled creates a redundant attack surface.

`GSSAPIAuthentication no` disables Kerberos-based authentication. Unless you are running an Active Directory or MIT Kerberos environment, this is dead code that adds handshake overhead on every connection.

`X11Forwarding no` prevents tunneling graphical application windows over SSH. Servers do not run GUI applications, and X11 forwarding has a documented history of privilege escalation vulnerabilities.

Reload sshd to apply the config:

```bash
sudo systemctl reload ssh
```

Keep your current terminal session open and test from a second terminal before closing anything.

## Verify the Active Config

`sshd -T` dumps the full resolved configuration — all files merged, all defaults applied:

```bash
sudo sshd -T | grep -E "permitrootlogin|pubkeyaccepted|gssapi|x11|kbdinteractive"
```

Expected output:

```ssh
permitrootlogin no
pubkeyacceptedalgorithms ssh-ed25519,sk-ssh-ed25519@openssh.com
gssapiauthentication no
x11forwarding no
kbdinteractiveauthentication no
```

Each line confirms one setting is active. If any line shows a different value, your drop-in file may have a syntax error or a conflict with another config file in `sshd_config.d/`. Run `sudo sshd -t` to check for syntax errors without reloading the daemon.

## SSH Certificates (Looking Ahead)

Standard SSH uses authorized_keys files: each public key listed in that file is trusted forever, or until you manually remove it. SSH certificates add a layer on top: a Certificate Authority (CA) signs short-lived certificates, and the server trusts the CA rather than individual keys. A certificate can be valid for one hour, one day, or one month.

For a team environment, certificates solve real problems. When a developer leaves, you revoke their certificate at the CA — you do not need to hunt through authorized_keys files on dozens of servers. Certificates can encode principals (which users the cert can log in as), source addresses, and permitted commands, all signed and auditable.

For a single-admin VPS, certificates are overkill. You manage one key on one or two servers. The operational overhead of running a CA outweighs the benefit. The setup covered in this post — ed25519 keys, no root login, no weak auth methods — is the right baseline for a personal or small-team server.

If you grow to a team of developers or a fleet of servers, look at [Smallstep](https://smallstep.com/) for a modern SSH CA implementation. It is worth knowing the pattern exists before you need it.

## What's next

The next post covers [UFW, fail2ban, and banning repeat offenders](https://jonesrussell.github.io/blog/ufw-fail2ban-intrusion-response/) — your server's intrusion response layer.

Baamaapii
