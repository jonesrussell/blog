---
categories: []
date: "2024-01-29T08:05:29.500Z"
devto: true
devto_id: 1744328
draft: true
slug: how-to-install-docker-on-ubuntu-for-laravel-development-e2p
summary: Docker is an essential tool for developing web applications with Laravel and most other projects. It...
tags:
    - webdev
    - beginners
    - tutorial
    - docker
title: How to Install Docker on Ubuntu for Development
---
Docker is an essential tool for developing web applications with Laravel and most other projects. It allows you to create and run isolated containers that contain everything you need to run your code.

To [install Docker]([Install Docker Engine on Ubuntu | Docker Docs](https://docs.docker.com/engine/install/ubuntu/#installation-methods)
) on Ubuntu, start by running the following command in our terminal to download and execute the Docker installation step.

```
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

Verify that Docker is installed correctly by running:

```
docker --version
```

You should see something like this:

```
Docker version 20.10.8, build 3967b7d
```

## Adding the User to the Docker Group

To run docker commands without sudo, you need to add your user account to the docker group. This will also prevent permission errors when working with docker files and directories.

To add your user to the docker group, follow these steps:

- Create the docker group if it doesn't exist:

```bash
sudo groupadd docker
```

- Add your user to the docker group, replacing `$USER` with your username:

```bash
sudo usermod -aG docker $USER
```

- Log out and log back in for the changes to take effect. Alternatively, you can run this command to activate the changes:

```bash
newgrp docker
```

- Verify that you can run docker commands without sudo:

```bash
docker run hello-world
```

You should see a message saying "Hello from Docker!" This means that you have successfully added your user to the docker group.

You have successfully installed Docker on Ubuntu. You can now create and run containers for your Laravel projects.

Next, we will use DDEV to make Laravel development easier in Docker.

