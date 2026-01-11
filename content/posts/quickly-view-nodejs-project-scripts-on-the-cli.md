---
title: "Quickly View Node.js Project Scripts on the CLI"
date: 2020-12-21
categories: [cli, nodejs]
tags: [cli, nodejs, npm, productivity]
summary: "Create a simple CLI tool to view your Node.js project's npm scripts directly from the terminal."
slug: "quickly-view-nodejs-project-scripts-on-the-cli"
images:
  - /images/screenshot-scripts.png
---

Ahnii! I previously wrote a command line utility named '[packages](/quickly-view-project-dependencies-on-the-cli/)' which simply prints a list of project dependencies on the command line.

I found that I also often want to see a list of scripts in package.json, so I wrote another utility I've named 'scripts', observe:

![scripts screenshot](/images/screenshot-scripts.png)

You can accomplish the same with 'sed', but it's quite a command to remember, observe:

```bash
sed -n -e '/scripts/,/},/ p' package.json
```

![scripts sed screenshot](/images/screenshot-scripts-sed.png)

Check it out at [https://github.com/jonesrussell/scripts](https://github.com/jonesrussell/scripts) or simply install it and try:

```sh
npm i -g @jonesrussell42/scripts
```

Meegwetch!
