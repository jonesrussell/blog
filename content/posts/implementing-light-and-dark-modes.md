---
title: "Implementing Light and Dark Modes: A No-Nonsense Guide"
date: 2024-03-19
categories: [web-development, javascript]
tags: [theming, dark-mode, css-variables, user-experience]
description: "Learn how to implement a robust light/dark theme system using CSS variables and JavaScript, with full system preference support."
slug: "implementing-light-and-dark-modes"
draft: true
---

Ahnii,

Ever noticed how your eyes hurt when switching between apps with different themes? I recently tackled this on my own site, and I'll show you exactly how to implement a clean, maintainable theming system.

## The Basic Setup (5 minutes)

First, let's define our theme variables:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #333333;
  --accent-color: #0066cc;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  --accent-color: #66b3ff;
}
```

## Theme Switching (10 minutes)

Here's our theme toggle implementation:

```javascript
const themeToggle = () => {
  const theme = document.documentElement.getAttribute('data-theme');
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}
```

## System Preference Detection (5 minutes)

Let's respect the user's system preferences:

```javascript
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('data-theme', 'dark');
}
```

## Key Features to Implement

- Smooth transitions between themes
- Persistent theme selection
- System preference detection
- Accessible toggle controls

## Wrapping Up

With these pieces in place, you've got a solid foundation for a theme system that's both user-friendly and maintainable.

What theme do you prefer for coding? Light, dark, or system default? Let me know in the comments!

Baamaapii 👋
