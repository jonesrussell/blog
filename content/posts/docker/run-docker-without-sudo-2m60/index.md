---
categories: []
date: "2023-01-15T18:08:46.500Z"
devto: true
devto_id: 1330048
draft: true
archived: true
slug: run-docker-without-sudo-2m60
summary: 'Unsure how to run docker commands without "permission denied"?      Instructions:   sudo nano...'
tags:
    - solidprinciples
    - softwareengineering
    - learning
title: Run Docker without sudo
---
Unsure how to run docker commands without "permission denied"?

{% embed https://youtu.be/T9NXALfFpWA %}

Instructions:

1. sudo nano /etc/group
2. add your username to docker group, eg) docker:x:999:russell
3. Save (Ctrl-X, Y, <Enter>)
4. Logout/login or reboot