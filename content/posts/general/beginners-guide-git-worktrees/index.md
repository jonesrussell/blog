---
title: "A beginner's guide to Git worktrees: What they are, why they matter, and how to use them without breaking anything"
date: 2026-04-15
categories: ["general"]
tags: ["git", "git-worktree", "version-control", "beginner-guide"]
summary: "Learn what Git worktrees are, why they exist, and how to use them safely with a beginner-friendly workflow."
slug: "beginners-guide-git-worktrees"
draft: false
---

Ahnii!

If you have ever needed to work on two branches at the same time, Git worktrees can save you a lot of friction. This post covers what worktrees are, why they exist, and how you can use them safely as a beginner.

## Prerequisites

- You have [Git](https://git-scm.com/) installed
- You can run commands in your terminal
- You already have a local repository

## What Is a Git Worktree?

A Git worktree is an extra working folder connected to the same repository history.  
You can think of it as another checkout of your project, without making another full clone.

Your main folder still exists. A worktree gives you a second folder where a different branch can be checked out at the same time.

## Why Worktrees Exist

Git worktrees solve a practical problem. You may be in the middle of feature work, then need to fix a bug on another branch right away.

Without worktrees, you usually do one of these:

- Stash or commit unfinished work, then switch branches
- Open a second full clone of the same repository

Both options work, but both add overhead. Worktrees give you a cleaner path.

## Normal Clone vs Branch Checkout vs Worktree

Here is the simple difference:

### Normal clone

A clone is a separate copy of a repository with its own `.git` directory.

```bash
git clone https://github.com/example/project.git
```

You use this when you need the repository on your machine for the first time. It is fully independent from other clones.

### Branch checkout

A branch checkout changes which branch is active in your current folder.

```bash
git checkout feature/foo
```

This is fast, but only one branch can be active in that folder at a time.

### Worktree

A worktree creates another folder tied to the same repository, usually on a different branch.

```bash
git worktree add ../feature-foo feature/foo
```

Now you have two folders open at once: your main folder and `../feature-foo`. Each can point at a different branch.

## Core Benefits of Worktrees

### 1) Multiple branches checked out at once

You can keep your main branch open in one folder and your feature branch in another.  
No constant branch switching.

### 2) Isolated environments for experiments

You can test risky changes in one worktree without touching the working state in another folder.

### 3) No need for multiple full clones

Worktrees share repository data, so you avoid duplicate clones for everyday branch work.

## A Safe Beginner Workflow

This is a clean workflow you can use right away.

### 1) Create a worktree

```bash
git worktree add ../feature-foo feature/foo
```

This command creates a new folder named `../feature-foo` and checks out `feature/foo` there.  
If `feature/foo` does not exist yet, create it first with `git branch feature/foo`.

### 2) Switch into it

```bash
cd ../feature-foo
```

Now every Git command runs inside that worktree folder.  
Before you edit files, confirm where you are with `pwd` and `git branch --show-current`.

### 3) Commit from it

```bash
git add .
git commit -m "Add first pass of feature foo"
```

These commits belong to the branch checked out in that worktree.  
You do not need to return to your original folder to commit.

### 4) Remove it safely

First leave the worktree folder, then remove it with Git.

```bash
cd ../your-main-repo
git worktree remove ../feature-foo
```

This tells Git to unregister the worktree and remove the directory safely.  
Always prefer this over deleting the folder manually.

## How to See Your Current Worktrees

```bash
git worktree list
```

This shows every registered worktree path and branch.  
Use this often, especially when you are learning.

## Common Beginner Mistakes

### Deleting the directory without removing the worktree

If you run `rm -rf` on a worktree folder first, Git can keep stale metadata.  
Remove worktrees with `git worktree remove <path>` whenever possible.

### Forgetting which worktree you are in

It is easy to commit to the wrong branch when two folders look similar.  
Check `pwd` and `git branch --show-current` before making changes.

### Trying to check out the same branch twice

Git does not allow the same branch to be active in two worktrees at once.  
Create a new branch if you need a second experimental space.

## A Simple Mental Model for `.git/worktrees`

Your main repository still has the real Git database.  
Inside it, `.git/worktrees` stores small records that point to each extra working folder.

Think of it like a clipboard that says:

- Which extra folders exist
- Which branch each one uses
- Whether Git still expects them to be present

That is why manual deletion can confuse Git. The clipboard still has an entry, even if the folder is gone.

## How to Clean Up Orphaned Worktrees

Sometimes a worktree folder gets deleted outside Git.  
You can clean this up safely in a few steps.

### Step 1: List what Git thinks exists

```bash
git worktree list
```

Look for paths that no longer exist on disk.  
Those are likely orphans.

### Step 2: Prune stale metadata

```bash
git worktree prune
```

This removes stale worktree entries that no longer point to valid folders.  
It is a safe maintenance command for this situation.

### Step 3: Verify cleanup

```bash
git worktree list
```

Run the list command again to confirm orphan entries are gone.  
If everything looks clean, you are done.

## Verify It Works

Run this quick check whenever you start using worktrees:

```bash
git worktree list
git branch --show-current
pwd
```

These three commands tell you what worktrees exist, which branch is active, and which folder you are in.  
That simple habit prevents most beginner mistakes.

Baamaapii
