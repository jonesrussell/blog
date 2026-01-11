---
title: "Cleaning Up Modified Vendor Packages: Step-by-Step"
date: 2025-09-19
categories: [PHP, Composer, Maintenance]
tags: [Composer, Patches, Vendor, Maintenance]
summary: "Learn how to properly clean up projects with modified vendor packages using Composer patches. Follow along with our example repository."
slug: "cleaning-up-modified-vendor-packages"
draft: true
---

Ahnii! You've inherited a project where the previous developers modified files directly in the `vendor` directory. Now every package update breaks the site, and you're stuck with outdated dependencies. This is a common nightmare scenario that can be fixed with proper patch management.

**Follow along**: Clone the example repository at [github.com/jonesrussell/composer-patches-tutorial](https://github.com/jonesrussell/composer-patches-tutorial) and checkout the different branches as you progress through this tutorial.

## The Problem

Direct modifications to vendor packages create several issues:

- **Update blockers**: Package updates overwrite your changes
- **Deployment risks**: Changes aren't tracked in version control  
- **Team confusion**: Other developers don't know about modifications
- **Security vulnerabilities**: Outdated packages can't be updated

The solution is to move these modifications into proper Composer patches that are tracked, documented, and automatically applied.

## Step 1: Install the Patches Plugin

First, we need the Composer patches plugin:

```bash
composer require cweagans/composer-patches
```

## Step 2: Identifying Modified Files

Create a backup of your current vendor directory and compare with a fresh install:

```bash
# Create a backup of current vendor
cp -r vendor vendor-backup

# Remove and reinstall packages to get clean versions
rm -rf vendor composer.lock
composer install

# Compare directories to find differences
diff -r vendor vendor-backup > modifications.txt
```

## Step 3: Creating Patches

For each modified package, we'll create a proper patch file.

## Step 4: Configure Composer Patches

Add patch configuration to your `composer.json`:

```json
{
  "extra": {
    "patches": {
      "monolog/monolog": {
        "Fix stream handler logging format": "patches/monolog-streamhandler-fix.patch"
      }
    }
  }
}
```

## Conclusion

With patches properly implemented, you can now:

- Update packages safely without losing modifications
- Track all changes in version control
- Share modifications transparently with your team  
- Maintain security updates
- Deploy with confidence

Baamaapii 👋
