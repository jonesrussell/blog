---
aliases:
    - /start-developing-with-laravel-in-ubuntu-20.04/
categories:
    - laravel
date: 2026-02-22T00:00:00Z
devto_id: 3386575
draft: false
images:
    - /images/laravel.png
slug: start-developing-with-laravel-in-ubuntu-24-04
summary: Get from Ubuntu 24.04 LTS to a running Laravel 12 app using the official installer first, then the DDEV option for container-based workflows.
tags:
    - laravel
    - ddev
    - ubuntu
    - web-development
title: Start developing with Laravel on Ubuntu 24.04 LTS
---

Ahnii!

[Ubuntu](https://ubuntu.com/download/desktop) 24.04 LTS is a solid base for learning web development. The [Laravel](https://laravel.com/docs/12.x/installation) docs recommend PHP, Composer, and the Laravel installer on your machine. This post follows that official path first, then shows the [DDEV](https://ddev.readthedocs.io/) option if you prefer a container-based stack.

## Prerequisites

- Ubuntu 24.04 LTS (desktop or server)
- For the official method: no PHP/Composer required yet — the install script adds them.
- For the DDEV method: [Docker and Docker Compose](https://ddev.readthedocs.io/en/stable/#installation).

## Official method: PHP, Composer, and Laravel installer

The [Laravel 12 installation guide](https://laravel.com/docs/12.x/installation) uses [php.new](https://php.new/) to install PHP 8.4, Composer, and the Laravel installer in one go. On Linux you run:

```bash
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.4)"
```

Restart your terminal after it finishes. That gives you PHP, Composer, and the `laravel` CLI. You also need [Node.js and npm](https://nodejs.org/) (or [Bun](https://bun.sh/)) to build frontend assets; install them via your package manager if needed (e.g. `sudo apt install nodejs npm` on Ubuntu).

### Create the application

Create a new Laravel app. The installer will prompt you for testing framework, database, and starter kit:

```bash
laravel new my-laravel-app
cd my-laravel-app
```

Then install frontend dependencies, build assets, and start the dev server:

```bash
npm install && npm run build
composer run dev
```

The app runs at [http://localhost:8000](http://localhost:8000). The `composer run dev` script starts Laravel's HTTP server plus the Vite dev server and queue worker.

### Verify it works

Open http://localhost:8000 in your browser. You should see the default Laravel welcome page.

![Laravel welcome page showing successful installation](/images/laravel.png)

## Alternatively: DDEV method

If you prefer to keep PHP and the database in containers, use [DDEV](https://ddev.readthedocs.io/en/stable/). Follow the [DDEV installation guide](https://ddev.readthedocs.io/en/stable/users/install/ddev-installation/#linux) for Linux, then use the [Laravel quickstart](https://ddev.readthedocs.io/en/stable/users/quickstart/#laravel): create the project directory, configure DDEV for Laravel, start the containers, and install Laravel via Composer:

```bash
mkdir my-laravel-site && cd my-laravel-site
ddev config --project-type=laravel --docroot=public
ddev start
ddev composer create-project "laravel/laravel:^12"
ddev launch
```

`ddev config` sets the project type and document root. `ddev start` brings up the web and database containers. `ddev composer create-project` installs Laravel 12 inside the web container. The Laravel project type in DDEV [automatically updates or creates the `.env` file](https://ddev.readthedocs.io/en/stable/users/quickstart/#laravel) with the database host, user, and password (`db`), so you don't run `key:generate` or edit `.env` by hand. `ddev launch` opens the app in your browser.

Baamaapii
