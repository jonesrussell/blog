# Web Developer Blog (Hugo)

A Hugo blog migrated from Jekyll, using the PaperMod theme.

## Quick Start

```bash
# Start development server
hugo server -D

# Build for production
hugo --gc --minify
```

## Project Structure

```
├── archetypes/         # Post templates
├── content/
│   ├── posts/         # Blog posts
│   ├── about.md       # About page
│   ├── search.md      # Search page
│   └── archives.md    # Archives page
├── static/            # Static assets (images, favicon)
├── themes/PaperMod/   # PaperMod theme
└── hugo.toml          # Hugo configuration
```

## Creating Posts

```bash
hugo new posts/my-new-post.md
```

## Writing Style

All posts follow specific style guidelines:
- Start with "Ahnii!" greeting
- End with "Baamaapii 👋" farewell
- Maximum 4 tags per post
- Clear section headers
- Concise writing

## Features

- Dark/Light mode toggle
- Search functionality (Fuse.js)
- Social links
- Categories and tags
- Series support
- RSS feed
- Table of Contents

## Deployment

Built for GitHub Pages deployment at `https://jonesrussell.github.io/blog/`

## License

MIT License
