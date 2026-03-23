---
categories: []
date: "2024-02-01T06:06:25.308Z"
devto: true
devto_id: 1744329
draft: true
slug: install-ddev-the-popup-php-development-environment-31kf
summary: DDEV is a fantastic open-source tool that can help you set up your local PHP development environments...
tags:
    - webdev
    - php
    - docker
    - devops
title: Install DDEV, the Popup PHP Development Environment
---
DDEV is a fantastic open-source tool that can help you set up your local PHP development environments with ease.

If you've been following our small series on Laravel development, you probably already have Homebrew and Docker installed. To complete this series, you'll need to add DDEV and Laravel to your toolkit.

1. [Homebrew](https://dev.to/jonesrussell/install-homebrew-for-easy-package-management-4i2k)
2. [Docker](https://dev.to/jonesrussell/how-to-install-docker-on-ubuntu-for-laravel-development-e2p)
3. DDEV
4. Laravel

## Docker and DDEV

Docker is a tool that helps you create and run isolated and reproducible environments for your projects.

With DDEV, incorporating Docker into your workflow is made easy.

It supports various PHP frameworks such as Laravel, Symfony, Drupal, and WordPress. DDEV integrates with popular tools like Composer, Xdebug, and PHPUnit.

## Install DDEV

To install DDEV using Homebrew, run

```
brew install ddev/ddev/ddev
```

and then check the version using:

```
ddev --version
```

_For alternative installation instructions, please refer to https://ddev.readthedocs.io/en/latest/users/install/ddev-installation/._

## Run DDEV

To see DDEV in action with a simple index.php file, just follow these steps:

1. Create a new folder for your project and navigate to it in your terminal.

```
export MY_PROJECT=simpleproject
mkdir $MY_PROJECT
cd $MY_PROJECT
```


2. Generate a basic configuration file for your project

```
ddev config --auto
```

Output

```
Creating a new DDEV project config in the current directory (/home/russell/simpleproject)
Once completed, your configuration will be written to /home/russell/simpleproject/.ddev/config.yaml

Configuring unrecognized codebase as project of type 'php' at /home/russell/simpleproject
Configuration complete. You may now run 'ddev start'.
```

3. Create a file named index.php in your project folder and write some PHP code in it.

```
touch index.php
echo '<?php echo "Hello, world!"; ?>' > index.php
```

4. Run the command 'ddev start' to launch your local development environment. This command will start the necessary Docker containers for your project.

Output

```
Network ddev_default created

 TIP OF THE DAY
 If you miss phpMyAdmin in DDEV, run `ddev get ddev/ddev-phpmyadmin`

Starting simpleproject...
Network ddev-simpleproject_default created
 Container ddev-ssh-agent  Created
 Container ddev-ssh-agent  Started
ssh-agent container is running: If you want to add authentication to the ssh-agent container, run 'ddev auth ssh' to enable your keys.
Building project images...
Project images built in 1s.
 Container ddev-simpleproject-db  Created
 Container ddev-simpleproject-web  Created
 Container ddev-simpleproject-web  Started
 Container ddev-simpleproject-db  Started
Waiting for web/db containers to become ready: [web db]
Starting ddev-router if necessary...
 Container ddev-router  Created
 Container ddev-router  Started
Waiting for additional project containers to become ready...
All project containers are now ready.
Successfully started simpleproject
Project can be reached at https://simpleproject.ddev.site https://127.0.0.1:65482
```

5. You can manually open a browser and navigate to https://simpleproject.ddev.site, or you can run:

```
ddev launch
```

Your browser should open at http://simpleproject.ddev.site and say "Hello, world!"


![Hello World](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/iayhad5frva8w2blnmio.png)

Well done! You have now successfully tested DDEV with a basic PHP project. For further details on DDEV's features and options, please consult their documentation.

## Laravel

Now you're ready to proceed to installing Laravel.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/f6vpxyatuusft2y8dlep.jpg)



