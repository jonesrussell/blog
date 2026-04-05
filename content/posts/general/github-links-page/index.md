---
categories:
    - general
date: 2026-04-05T00:00:00Z
devto: true
devto_id: 3456799
draft: false
slug: github-links-page
summary: How to turn your GitHub profile into a links page you own, with zero dependencies and no monthly fee.
tags:
    - github
    - github-pages
    - html
    - personal-site
title: Build a free links page with GitHub Pages
---

Ahnii!

A [Bluesky thread](https://bsky.app/profile/rkrn.me/post/3milmywaclkno) recently reminded me how many developers still reach for [Linktree](https://linktr.ee/) or [Carrd](https://carrd.co/) when they need a simple links page. You don't need either. GitHub gives you two free surfaces that work as a links hub right now: a profile README and a Pages site. This post walks through both, then covers where to go if you want more.

## Why own your links page

Linktree, Carrd, and similar services are convenient. They're also someone else's domain, someone else's design constraints, and someone else's decision about whether your free tier keeps working next year.

A links page is one HTML file. It doesn't need a SaaS product. When you host it yourself, you control the URL, the design, and the uptime. GitHub Pages gives you HTTPS, a clean subdomain, and global CDN for free.

That's the pitch. Here's how to set it up.

## Option 1: the profile README

Every GitHub account has a special repo: `your-username/your-username`. Create it, add a `README.md`, and GitHub renders it at the top of your profile page.

### Create the repo

1. Go to [github.com/new](https://github.com/new)
2. Name the repo exactly the same as your GitHub username
3. Make it public
4. Check "Add a README file"
5. Click **Create repository**

GitHub shows a banner confirming this is a special repo. Your `README.md` now renders on your profile.

### Structure it as a links page

```markdown
# Hey, I'm [Your Name]

One-liner about what you do.

## Links

- [Portfolio](https://your-site.com)
- [Blog](https://your-blog.com)
- [LinkedIn](https://linkedin.com/in/your-handle)
- [Email](mailto:you@example.com)
```

That's a functional links page. Markdown supports links, headings, images, and badges. You can add project descriptions, tech stacks, or whatever context helps visitors understand who you are.

The profile README is a good starting point, but it lives on github.com. If you want a standalone URL you can share anywhere, GitHub Pages is the next step.

## Option 2: a GitHub Pages links site

[GitHub Pages](https://pages.github.com/) serves a static site from a repo. Create a repo named `your-username.github.io`, drop in an `index.html`, and you have a live site at `https://your-username.github.io`.

### Create the repo

1. Create a new repo named `your-username.github.io`
2. Clone it locally:

```bash
git clone https://github.com/your-username/your-username.github.io.git
cd your-username.github.io
```

This gives you an empty repo ready for your site files.

### Add a single-file links page

Create an `index.html`. Here's a minimal starting point:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Name</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: system-ui, sans-serif;
      background: #0a0f14;
      color: #e8eef4;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .container { width: 100%; max-width: 560px; }

    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }

    .tagline {
      color: #7a9ab5;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .links {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .link-card {
      padding: 1rem 1.25rem;
      background: #111820;
      border: 1px solid #1e2d3d;
      border-radius: 8px;
      text-decoration: none;
      color: #e8eef4;
      transition: border-color 0.15s ease;
    }

    .link-card:hover { border-color: #00b4a0; }

    .link-card .label { font-weight: 500; display: block; }
    .link-card .desc { font-size: 0.8rem; color: #7a9ab5; }

    @media (max-width: 420px) {
      h1 { font-size: 2rem; }
      .links { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your Name</h1>
    <p class="tagline">What you do, in one or two sentences.</p>

    <div class="links">
      <a class="link-card" href="https://your-portfolio.com">
        <span class="label">Portfolio</span>
        <span class="desc">Projects and work</span>
      </a>
      <a class="link-card" href="https://your-blog.com">
        <span class="label">Blog</span>
        <span class="desc">Writing and tutorials</span>
      </a>
      <a class="link-card" href="https://github.com/your-username">
        <span class="label">GitHub</span>
        <span class="desc">Open source</span>
      </a>
      <a class="link-card" href="https://linkedin.com/in/your-handle">
        <span class="label">LinkedIn</span>
        <span class="desc">Professional profile</span>
      </a>
    </div>
  </div>
</body>
</html>
```

This gives you a dark-themed, responsive two-column grid. No build tools, no dependencies, no framework. One file, under 100 lines of code.

### Push and go live

```bash
git add index.html
git commit -m "Add links page"
git push
```

Within a minute, your site is live at `https://your-username.github.io`. GitHub Pages is enabled by default for repos with this naming convention.

### Add Open Graph metadata

Social platforms pull title, description, and image from OG meta tags when someone shares your link. Add these inside `<head>`:

```html
<meta property="og:title" content="Your Name">
<meta property="og:description" content="Your one-liner.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://your-username.github.io">
<meta property="og:image" content="https://your-username.github.io/photo.jpg">
```

Drop a photo in the repo root and reference it in the `og:image` tag. Now when you share your link on LinkedIn or Bluesky, the preview card shows your face instead of a blank box.

## Use both together

The profile README and Pages site serve different audiences. The README catches developers who land on your GitHub profile. The Pages site gives you a clean URL to put in your social bios, email signature, and conference slides.

Point the README's links to your Pages site (or vice versa) so both surfaces reinforce each other. For example, the [jonesrussell profile README](https://github.com/jonesrussell) introduces the person and the work, while [jonesrussell.github.io](https://jonesrussell.github.io) is the shareable link card.

## Taking it further

A single HTML file covers most needs. If you outgrow it, here are three directions worth considering.

### Add a custom domain

GitHub Pages supports custom domains for free. In your repo settings under **Pages**, add your domain and configure a CNAME DNS record. GitHub handles the SSL certificate automatically. Your links page goes from `your-username.github.io` to `links.yourdomain.com` (or whatever you prefer).

### Use a static site generator

If you want templating, multiple pages, or a blog alongside your links page, a static site generator keeps things manageable:

- **[Astro](https://astro.build/)** is beginner-friendly and ships zero JavaScript by default. It has [link page themes](https://astro.build/themes/) ready to customize.
- **[Hugo](https://gohugo.io/)** is fast and works well if you're already writing markdown. This blog runs on Hugo.
- **[11ty](https://www.11ty.dev/)** is minimal and flexible, with no opinions about your frontend stack.

All three deploy to GitHub Pages with a simple Actions workflow.

### Try a CSS framework

If you want better design without writing all the CSS yourself, drop in a utility framework:

- **[Tailwind CSS](https://tailwindcss.com/)** via CDN for rapid styling without a build step
- **[Pico CSS](https://picocss.com/)** for classless styling that looks good out of the box
- A single `<link>` tag pointing to [Water.css](https://watercss.kognise.dev/) for a no-effort dark theme

None of these require a build tool. Add a `<link>` or `<script>` tag and start using them.

## Own your links, own your URL

Your links page is the one URL that represents you everywhere. Owning it means you decide how it looks, what it links to, and where it lives. GitHub gives you the hosting for free. The rest is just HTML.

Baamaapii
