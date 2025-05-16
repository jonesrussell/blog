---
layout: post
title: "Bad Technical Advice Can Wreck Your System"
date: 2025-05-16
categories: [Tech, Linux]
tags: [Ubuntu, WebKitGTK, Troubleshooting, System Administration]
description: "Learn why mixing Ubuntu package versions is dangerous and how to avoid common system-breaking advice."
---

Ahnii!

Some advice isn't just wrong—it breaks your system. Case in point: installing `libwebkit2gtk-4.0` on Ubuntu 24.04 by pulling packages from `jammy`. This issue came up while working on [ojivid](https://github.com/jonesrussell/ojivid), a kiosk-style video recorder project using [webview_go](https://github.com/webview/webview_go). Let's break down why this is dangerous and what to do instead.

### Understanding the Basics

- **APT (Advanced Package Tool)**  
  APT is how Ubuntu installs software. When you run `sudo apt install`, it pulls programs from trusted repositories.

- **Sources List (`/etc/apt/sources.list`)**  
  This file tells APT where to get software. Adding the wrong sources can introduce unstable or insecure packages.

- **Ubuntu Versions**  
  Ubuntu releases follow a specific naming and versioning scheme:

| Version | Code Name | Release Date | Support Until | Status |
|---------|-----------|--------------|---------------|---------|
| 24.04   | Noble     | April 2024   | April 2029    | LTS     |
| 23.10   | Mantic    | October 2023 | July 2024     | EOL     |
| 23.04   | Lunar     | April 2023   | January 2024  | EOL     |
| 22.10   | Kinetic   | October 2022 | July 2023     | EOL     |
| 22.04   | Jammy     | April 2022   | April 2027    | LTS     |
| 21.10   | Impish    | October 2021 | July 2022     | EOL     |
| 21.04   | Hirsute   | April 2021   | January 2022  | EOL     |
| 20.10   | Groovy    | October 2020 | July 2021     | EOL     |
| 20.04   | Focal     | April 2020   | April 2025    | LTS     |
| 19.10   | Eoan      | October 2019 | July 2020     | EOL     |
| 19.04   | Disco     | April 2019   | January 2020  | EOL     |
| 18.10   | Cosmic    | October 2018 | July 2019     | EOL     |
| 18.04   | Bionic    | April 2018   | April 2023    | EOL     |

### Why It's a Bad Idea

- **Stability Risks** – Mixing Ubuntu versions leads to **Cocytus**, the frozen lake in Hell.
- **Security Risks** – Old packages lack updates, exposing vulnerabilities.
- **Compatibility Issues** – Ubuntu 24.04 ships `webkit2gtk-4.1`, not `webkit2gtk-4.0`.

### Better Solutions

- **Use `webkit2gtk-4.1`** – Many apps work fine with minor adjustments.
- **Check for Updates** – Some projects dropped the `webkit2gtk-4.0` requirement.
- **Build WebKitGTK** – If necessary, compile it from source.

### Final Thoughts

Always verify before acting. Bad advice can waste hours—or wreck your system.

Got a better fix? Drop a comment below.

Baamaapii 👋
