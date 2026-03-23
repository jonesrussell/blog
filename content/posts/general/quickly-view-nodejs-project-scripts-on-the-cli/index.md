---
title: "Quickly View Node.js Project Scripts on the CLI"
date: 2020-12-21
categories: [cli, nodejs]
tags: [cli, nodejs, npm, productivity]
summary: "Create a simple CLI tool to view your Node.js project's npm scripts directly from the terminal."
slug: "quickly-view-nodejs-project-scripts-on-the-cli"
draft: false
images:
  - /images/screenshot-scripts.png
archived: true
archived_date: 2026-02-22
sitemap:
  disable: true
robotsNoIndex: true
devto_id: 549243
---

Ahnii!

A companion to the [packages]({{< relref "quickly-view-project-dependencies-on-the-cli" >}}) utility, this tool prints a list of scripts from `package.json` on the command line.

![scripts screenshot](/images/screenshot-scripts.png)

You can accomplish the same with `sed`, but it's quite a command to remember:

```bash
sed -n -e '/scripts/,/},/ p' package.json
```

![scripts sed screenshot](/images/screenshot-scripts-sed.png)

Check it out at [https://github.com/jonesrussell/scripts](https://github.com/jonesrussell/scripts) or simply install it and try:

```sh
npm i -g @jonesrussell42/scripts
```

Baamaapii
