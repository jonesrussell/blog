---
categories: []
date: "2020-01-20T07:53:37.601Z"
devto: true
devto_id: 241571
draft: true
slug: install-composer-in-custom-docker-image-3f71
summary: Install software in Docker with multi-stage builds
tags:
    - docker
    - php
title: Install composer in custom Docker image
---
---
title: Install composer in custom Docker image
published: true
description: Install software in Docker with multi-stage builds
tags: docker, php
---

Before Docker 17.05 dropped mid-2017, installing software inside a custom Docker image followed the same process as installing it on the host. 

For example, you can install *composer* to */usr/local/bin* on a desktop by running the following *curl* command as **root**.

```bash
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
```

To install it in a custom Docker image just prepend "RUN" and stick it into a Dockerfile:

```yml
# Dockerfile
FROM php:7.4.1-fpm
# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
```

### Watch

{% asciinema 294076 %}

**Ta-da!**

It works, but it relies on *curl* and an internet connection. Docker 17.05 brought a cleaner, less *curl-y*, *internet-y* way.

## Multi-stage builds and COPY

Simply replace the RUN instruction with the COPY instruction seen below.

You can see that we are copying from the [*composer*](https://hub.docker.com/_/composer) image from **/usr/bin/composer** to **/usr/bin/composer** in the new image.

Now let's see it in action, (as documented at https://hub.docker.com/_/composer):

```ymlhttps://docs.docker.com/engine/reference/builder/#copy
# Dockerfile
FROM php:7.4.1-fpm
# Install Composer
COPY --from=composer /usr/bin/composer /usr/bin/composer
```

### Watch

{% asciinema 294077 %}

**Ta-da*2!**

I hope this helps someone.
