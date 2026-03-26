---
title: "Secrets, Certificates, and Credential Rotation"
date: 2026-03-26
categories: [devops]
tags: [security, linux, ansible]
series: ["production-linux"]
series_order: 7
summary: "Manage .env files, encrypt secrets with Ansible Vault, and rotate credentials without downtime."
slug: "secrets-certificates-credential-management"
draft: false
devto_id: 3386537
---

Ahnii!

> This is part 7 of the [Production Linux series]({{< relref "production-linux-series-index" >}}). Previous: [Kernel and Systemd Service Hardening]({{< relref "kernel-systemd-hardening" >}}).

Your server is locked down. But secrets still need managing — .env files, database credentials, SSH keys, and TLS certificates all require attention. This post covers practical credential management for a solo developer running one or two VPSes.

## .env File Permissions

Your application's `.env` file holds database passwords, API keys, and other credentials. Set ownership and permissions immediately after deployment.

```bash
chown deployer:www-data .env
chmod 0640 .env
```

The `chown` sets the owner to your deploy user and the group to `www-data`. The `chmod 0640` gives the owner read/write, the group read-only, and no access to everyone else.

The reason for `0640` instead of `0600` is that PHP-FPM runs as `www-data` and needs read access to the file. If you use `0600`, PHP-FPM cannot read the credentials and your application will fail silently or throw database errors.

Verify the result:

```bash
ls -la .env
stat -c '%a %U:%G' .env
```

`ls -la` shows the symbolic permissions and ownership. `stat -c '%a %U:%G'` gives you the octal mode and `user:group` in a format that's easy to script or check at a glance.

## Ansible Vault for Server Secrets

[Ansible Vault](https://docs.ansible.com/ansible/latest/vault_guide/index.html) encrypts secrets inside your Ansible repository so they can be committed to version control safely. The encrypted values are useless without the vault password.

For the full Ansible setup, see [Manage DigitalOcean Infrastructure With Ansible]({{< relref "ansible-manage-digitalocean-laravel-infrastructure" >}}).

Encrypt a single value inline:

```bash
ansible-vault encrypt_string 'supersecretpassword' --name 'db_password'
```

This outputs an encrypted block you paste directly into a variables file. Ansible decrypts it at runtime when you supply the vault password.

To edit an already-encrypted file:

```bash
ansible-vault edit group_vars/all/secrets.yml
```

This opens the file in your `$EDITOR` after decrypting it in memory. Changes are re-encrypted on save.

The key principle: secrets live in your Ansible repository encrypted, not in plaintext files on the server, not on sticky notes, and not in Slack messages. If someone clones your repo without the vault password, they get nothing useful.

## TLS Certificates With Caddy

[Caddy](https://caddyserver.com/) handles ACME/Let's Encrypt certificate issuance and renewal automatically. You configure a domain and Caddy does the rest — no certbot cron jobs, no manual renewal scripts.

What to watch: certificate expiry. Caddy renews certificates well before expiry under normal conditions, but DNS misconfigurations or firewall rules blocking port 80 can cause renewal failures. Monitoring certificate expiry is covered in Post 9 of this series.

If auto-renewal fails and you need to force a reload after fixing the underlying issue:

```bash
caddy reload --config /etc/caddy/Caddyfile
```

This reloads the Caddyfile without dropping connections. Caddy will reattempt ACME validation on the next cycle.

Common reasons for renewal failure: the domain's DNS no longer points to the server, port 80 is blocked by a firewall rule, or the ACME challenge directory is inaccessible. Fix the root cause first, then reload.

## Database Credential Rotation

Rotating database credentials without downtime requires a brief period where two users have access simultaneously. The sequence matters.

Create the new database user first:

```sql
CREATE USER 'app_new'@'localhost' IDENTIFIED BY 'newpassword';
GRANT SELECT, INSERT, UPDATE, DELETE ON appdb.* TO 'app_new'@'localhost';
FLUSH PRIVILEGES;
```

This creates the replacement user and grants the same permissions as the existing one. Your application still connects with the old credentials at this point.

Then update your `.env` and deploy:

```bash
# Update DB_USERNAME and DB_PASSWORD in .env
# Run your deployment process
```

After deployment, verify the application connects successfully. Check logs for database errors and run a quick functional test. Once confirmed, remove the old user:

```sql
DROP USER 'app_old'@'localhost';
```

Do not rotate credentials during peak traffic hours. Schedule rotations during low-traffic periods and have a rollback plan — keep the old credentials available until you've confirmed the new ones work in production.

## SSH Key Rotation

Rotate SSH keys when a team member leaves, when you suspect a key has been compromised, or on an annual schedule as policy.

The rotation sequence prevents lockout. Add the new key first:

```bash
echo "ssh-ed25519 AAAA... newcomment" >> ~/.ssh/authorized_keys
```

Test that you can log in with the new key before removing the old one. Open a second terminal, connect using the new key explicitly, and confirm access. Then remove the old key from `authorized_keys`.

Never remove a key before confirming the replacement works. A mistake here can lock you out of the server entirely.

For GitHub Actions deploy keys, generate a separate key pair per repository:

```bash
ssh-keygen -t ed25519 -C "deploy-key-reponame" -f ~/.ssh/deploy_reponame -N ""
```

Add the public key as a deploy key in the GitHub repository settings. Store the private key in the repository's Actions secrets as `SSH_PRIVATE_KEY`. Per-repository keys limit blast radius — a compromised key for one repo does not affect others.

Credential management is not a one-time setup. It is an ongoing practice: enforce file permissions after every deployment, keep secrets encrypted in version control, monitor certificate expiry, and rotate credentials on a schedule. The habits you build now prevent the incidents you would otherwise spend a weekend recovering from.

Next up: Automated Patching and Server Maintenance covers unattended-upgrades, scheduled maintenance windows, and keeping your server current without surprises.

Baamaapii
