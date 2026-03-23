---
title: "Python Virtual Environments for Beginners"
date: 2024-11-29
summary: "Isolate Python project dependencies using virtual environments with venv, activation/deactivation, and best practices."
categories: [python]
tags: [python, virtual-environments, development, tutorial]
slug: "python-virtual-environments-for-beginners"
draft: false
devto_id: 2126676
---

Ahnii!

If you're new to [Python](https://www.python.org/), you might have heard about virtual environments but aren't sure what they are or why you need them. This post breaks it down in simple terms.

## What's a Virtual Environment?

Think of a virtual environment like a clean room for your Python project. It's an isolated space where you can install packages and dependencies without affecting your computer's main Python installation or other projects.

## Why Do You Need One?

Imagine you're working on two Python projects:

- Project A needs version 1.0 of a package
- Project B needs version 2.0 of the same package

Without virtual environments, you'd have a conflict! Virtual environments solve this by giving each project its own separate space with its own packages.

## How to Create a Virtual Environment

You only need two commands:

```bash
# Create the virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate
```

Let's break down that first command:

- `python3` - runs Python 3
- `-m venv` - tells Python to run the venv module
- The last `venv` - is just the name of the directory (you can name it anything)

## How to Know It's Working

When your virtual environment is active, you'll see `(venv)` at the start of your terminal prompt:

```bash
(venv) username@computer:~/project$
```

## Installing Packages

Once your virtual environment is active, you can install packages using [pip](https://pip.pypa.io/):

```bash
pip install requests
```

These packages will only be installed in your virtual environment, keeping your system Python clean.

## Common Commands

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install packages
pip install requests
pip install -r requirements.txt  # install from a requirements file

# See what's installed
pip list

# Deactivate when you're done
deactivate
```

These are the commands you'll use most often. The `requirements.txt` file is especially useful for sharing your project's dependencies with others or recreating the environment on another machine.

## Best Practices

1. Create a virtual environment for each Python project
2. Add `venv/` to your `.gitignore` file
3. Keep a `requirements.txt` file listing your project dependencies
4. Activate the virtual environment before working on your project

Virtual environments might seem like extra work at first, but they're a crucial tool for Python development. They keep your projects isolated, make them more portable, and help avoid dependency conflicts.

If you're starting a new Python project, creating a virtual environment should be your first step.

Baamaapii
