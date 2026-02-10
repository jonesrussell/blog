---
title: "Using Laravel Boost With DDEV"
date: 2026-02-10
categories: [Laravel]
tags: [laravel, ddev, mcp, ai]
summary: "Set up Laravel Boost as an MCP server inside DDEV, with a WSL configuration for Windows users."
slug: "laravel-boost-ddev"
draft: false
---

Ahnii!

[Laravel Boost](https://laravel.com/docs/12.x/boost) is an official MCP server that gives AI coding agents deep context about your Laravel application — routes, schema, logs, config, and more. If you develop with [DDEV](https://ddev.readthedocs.io/), Boost runs inside the container, and your editor just needs to know how to reach it.

This post covers the standard DDEV setup and the extra step needed for WSL.

## Prerequisites

- A Laravel project running in DDEV
- An editor that supports MCP (Cursor, VS Code with Copilot, Claude Code, etc.)

## Install Boost

From your project root:

```bash
ddev composer require laravel/boost --dev
ddev artisan boost:install
```

The install command generates guideline and skill files for your chosen AI agent. You can add these generated files to `.gitignore` since `boost:install` recreates them.

## Configure the MCP Server

### Standard Setup (Linux / macOS)

Create a `.mcp.json` in your project root:

```json
{
    "mcpServers": {
        "laravel-boost": {
            "command": "ddev",
            "args": [
                "artisan",
                "boost:mcp"
            ]
        }
    }
}
```

That's it. DDEV provides `ddev artisan` as a shorthand for `ddev exec php artisan`, so the config stays minimal. It runs `boost:mcp` inside the container and exposes it over stdio to your editor.

### WSL Setup (Windows)

If your editor runs on Windows but your DDEV project lives in WSL, the editor can't call `ddev` directly. Wrap the command with `wsl.exe` and point `cwd` to the WSL project path:

```json
{
    "mcpServers": {
        "laravel-boost": {
            "command": "wsl.exe",
            "args": [
                "ddev",
                "artisan",
                "boost:mcp"
            ],
            "cwd": "/home/your-user/dev/your-project"
        }
    }
}
```

`wsl.exe` bridges from Windows into your default WSL distro, where `ddev` is available on the PATH. The `cwd` tells it which directory to run from so DDEV picks up the right project.

If you use a non-default distro, add `-d your-distro` before `ddev` in the args array.

## Verify It Works

Open your editor and ask the AI agent something project-specific, like "What routes does this app have?" or "Show me the database schema." If Boost is connected, the agent will use its tools to answer from your actual application state instead of guessing.

You can also check the available tools directly. In Claude Code:

```bash
claude mcp list
```

You should see `laravel-boost` with its 15+ tools listed.

## Keeping Boost Updated

When you update Laravel or your dependencies:

```bash
ddev composer update laravel/boost
ddev artisan boost:update
```

Or add `boost:update` to your Composer `post-update-cmd` scripts to automate it.

Baamaapii
