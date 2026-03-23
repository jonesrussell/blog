---
categories: []
date: "2024-01-29T07:48:46.258Z"
devto: true
devto_id: 1744322
draft: false
slug: install-homebrew-for-easy-package-management-4i2k
summary: Homebrew is the self-described “Missing Package Manager for macOS (or Linux)”.   It is handy for...
tags:
    - webdev
    - tutorial
    - linux
    - beginners
title: Install Latest Versions of Software with Homebrew for Easy Package Management
---
[Homebrew](https://brew.sh) is the self-described “Missing Package Manager for macOS (or Linux)”. 

It is handy for installing newer packages that you get through the system package manager. 

The installation process is easy and avoids the hassle of dealing with dependencies, permissions, and configurations. Homebrew maintains system cleanliness and organization by installing everything in a separate directory without interfering with system packages. 

**Dependencies**: Software often relies on other software to function correctly. These are known as dependencies. Managing these manually can be a complex task as you need to ensure that all required dependencies are installed and _are of the correct version_. Homebrew simplifies this by automatically checking for necessary dependencies and installs them before installing the software.

![Screenshot of installing certbot with apt in Ubuntu](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/w4xvdymqldh9wnhoqcfr.png)

**Permissions**: Software installation typically requires administrative (root) privileges, which can pose a security risk if misused. Homebrew mitigates this risk by allowing software installation in the user level, eliminating the need for `root` privileges. This approach enhances security as it restricts the installed software’s access only to the user directory, preventing it from affecting system-wide configurations.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/nkkqz9esr5zdlhvqdw7c.png)

**Configurations:** Configuring software involves setting up the software according to the user's preferences or system requirements. This process can be intricate and time-consuming. Homebrew eases this by providing sensible default configurations for software packages. Advanced users can further customize these configurations if needed.

**System Cleanliness and Organization:** Homebrew installs software in a separate directory (`/home/linuxbrew/.linuxbrew` by default),  keeping the system directories uncluttered. Each software package resides in its own subdirectory along with its dependencies, ensuring easy uninstallation and version management. This approach maintains system cleanliness and organization, making it easier to manage your installed software.

By handling dependencies, permissions, and configurations, and maintaining system cleanliness and organization, Homebrew provides an easy and efficient way for package management. It's a valuable tool for both novice users seeking simplicity and advanced users desiring flexibility and control.

## Install Homebrew

To install Homebrew, open a terminal and run the following command to install dependencies:

```
sudo apt-get install curl git
```

* curl: A command-line tool for transferring data with URL syntax.
* git: A distributed version control system for tracking changes in source code.

Now you can proceed to install Homebrew from https://brew.sh/. Run the command:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the instructions on the screen and enter your password when prompted. 

When it’s finished installing you will be shown “Next Steps”: 

![A screenshot of Ubuntu Terminal showing Homebrew's Next Steps](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/o05qiqkreviywx40j5id.png)

#### Add brew to your PATH permanently, but it won't take affect until you logout/login or reboot.

```
(echo; echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)")' >> /home/$USER/.bashrc
```

#### To bypass a reboot or logging out and back in, add brew to your PATH right now 

```
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
``` 

Run the following command to verify that Homebrew is installed correctly: 

```
brew --version
Homebrew 4.2.5
```

## Congratulations, Homebrew is installed.

For a quick preview of how easy it is to install packages with brew, try "btop", a customizable command-line utility for resource monitoring.

```
brew install btop
btop
```

![Screenshot of btop running in a Ubuntu VM](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ycoaq31nbq8frb6zd7l4.png)

