---
title: "Fix CLI Browser Hangs in WSL"
date: 2026-02-27
categories: [wsl]
tags: [wsl, cli, linux]
summary: "Use BROWSER=echo to prevent CLI tools from hanging when they try to open a browser in WSL."
slug: "wsl-browser-env-fix"
draft: false
---

Ahnii!

CLI tools that need browser authentication — like [GitHub CLI](https://cli.github.com/), `azure-cli`, `gcloud`, or `netlify-cli` — often hang in WSL when they try to launch your browser. This post covers a one-line fix that works for any of them.

## Why CLI Tools Hang When Opening a Browser in WSL

When a CLI tool needs to open a browser for OAuth or device authentication:

```bash
gh auth refresh -h github.com -s workflow
```

It prints a one-time code and tries to launch your default browser. In WSL, this often hangs with errors like:

```
! First copy your one-time code: XXXX-XXXX
Press Enter to open https://github.com/login/device in your browser...

ERROR:dbus/object_proxy.cc:572
  Failed to call method: org.freedesktop.DBus.Properties.GetAll
  org.freedesktop.DBus.Error.ServiceUnknown:
  The name org.freedesktop.UPower was not provided by any .service files
```

The browser never opens, and you're stuck hitting Ctrl+C.

This happens because WSL doesn't have a native display server, and browser detection often fails or triggers broken xdg-open paths.

## Fix WSL Browser Hangs With BROWSER=echo

Set `BROWSER=echo` to print the URL instead of launching it:

```bash
BROWSER=echo gh auth refresh -h github.com -s workflow
```

The CLI outputs the URL to your terminal. Copy it, open it in your Windows browser, complete the authentication, and the CLI continues normally.

This works with any tool that respects the `BROWSER` environment variable:

```bash
BROWSER=echo az login
BROWSER=echo gcloud auth login
BROWSER=echo netlify login
```

Each of these commands prints the authentication URL to your terminal instead of attempting to launch a browser, so you can paste it into your Windows browser manually.

## Set BROWSER Environment Variable Permanently in WSL

Add this to your `~/.bashrc` or `~/.zshrc`:

```bash
export BROWSER=echo
```

Every CLI tool will print URLs instead of trying to launch a browser. You copy and paste once, but authentication always completes.

If you'd rather open URLs automatically in Windows, you can point to the Windows browser directly:

```bash
export BROWSER='/mnt/c/Program Files/Google/Chrome/Application/chrome.exe'
```

This launches Chrome on the Windows side. Adjust the path for your browser of choice.

Either way, you'll land on the authentication page (or login page in my case) where you can enter your code and complete the flow:

![GitHub device authorization sign-in page](/blog/images/posts/wsl-browser-env-fix/github-device-auth.png)

Baamaapii
