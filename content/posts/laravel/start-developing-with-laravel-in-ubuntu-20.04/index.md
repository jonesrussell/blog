---
title: "Start Developing With Laravel in Ubuntu 20.04"
date: 2021-04-03
categories: [laravel]
tags: [web-development, install]
summary: "A guide to setting up Laravel development environment on Ubuntu 20.04, perfect for beginners in web development"
slug: "start-developing-with-laravel-in-ubuntu-20.04"
draft: false
images:
  - /images/laravel.png
archived: true
archived_date: 2026-02-22
sitemap:
  disable: true
robotsNoIndex: true
---

Ahnii!

[Ubuntu](https://ubuntu.com/tutorials/install-ubuntu-desktop#1-overview) is one of the easiest Linux distributions to install and best supported when learning web development. This post walks through setting up Laravel using DDEV on Ubuntu 20.04.

## OK, Ubuntu is running, what next?

Start by [installing Homebrew](https://blog.aamnah.com/sysadmin/install-homebrew-ubuntu-linux), "The Missing Package Manager for macOS (or Linux)". If you choose another path, you should still be able to follow along.

## Homebrew is installed, now what?

### Install DDEV

<blockquote>[DDEV](https://github.com/drud/ddev) is an open  source tool that makes it dead simple to get local PHP development  environments up and running within minutes. It's powerful and flexible  as a result of its per-project environment configurations, which can be  extended, version controlled, and shared. In short, DDEV aims to allow  development teams to use Docker in their workflow without the  complexities of bespoke configuration.</blockquote>

Follow the directions at <https://ddev.readthedocs.io/en/stable/#installation> which will ensure you have everything needed to install DDEV and then Laravel.

### Install Laravel

Copy and paste from below, replacing `MY_SITE` with the name you want for your site:

```bash
MY_SITE=my-laravel-app
mkdir $MY_SITE
cd $MY_SITE
ddev config --project-type=laravel --docroot=public --create-docroot
ddev start
ddev composer create --prefer-dist laravel/laravel
ddev exec "cat .env.example | sed  -E 's/DB_(HOST|DATABASE|USERNAME|PASSWORD)=(.*)/DB_\1=db/g' > .env"
ddev exec "php artisan key:generate"
ddev launch
```

## Verify it works

The `ddev launch` command should have opened your default browser to this screen:

![Laravel welcome page showing successful installation](/images/laravel.png)

Baamaapii
