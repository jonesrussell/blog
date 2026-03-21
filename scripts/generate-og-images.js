const { chromium } = require('playwright');
const matter = require('gray-matter');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SERIES_MAP = {
  'waaseyaa':          { gradient: '#667eea, #764ba2',   label: 'Waaseyaa' },
  'php-fig-standards': { gradient: '#0f9b8e, #1a5276',   label: 'PHP-FIG Standards' },
  'codified-context':  { gradient: '#f093fb, #f5576c',   label: 'Codified Context' },
  'production-linux':  { gradient: '#e65100, #bf360c',   label: 'Production Linux' },
  '_default':          { gradient: '#2c3e50, #4ca1af',   label: 'Blog' },
};

const TEMPLATE_PATH = path.join(__dirname, 'og-template.html');
const OUTPUT_DIR = path.join(__dirname, '..', 'static', 'images', 'og');
const HASH_FILE = path.join(OUTPUT_DIR, '.og-template-hash');

function getFontSize(title) {
  if (title.length < 40) return 64;
  if (title.length <= 80) return 48;
  return 36;
}

function getSeriesInfo(series) {
  if (!series || series.length === 0) return SERIES_MAP['_default'];
  const key = Array.isArray(series) ? series[0] : series;
  return SERIES_MAP[key] || SERIES_MAP['_default'];
}

function findPosts() {
  const postsDir = path.join(__dirname, '..', 'content', 'posts');
  const posts = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name === 'index.md') {
        const raw = fs.readFileSync(full, 'utf-8');
        const { data } = matter(raw);
        if (data.slug && data.title) {
          posts.push({
            slug: data.slug,
            title: data.title,
            series: data.series || [],
          });
        }
      }
    }
  }

  walk(postsDir);
  return posts;
}

async function main() {
  const force = process.argv.includes('--force');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const templateHash = crypto.createHash('sha256').update(template).digest('hex');

  let regenerateAll = force;
  if (!force && fs.existsSync(HASH_FILE)) {
    const oldHash = fs.readFileSync(HASH_FILE, 'utf-8').trim();
    if (oldHash !== templateHash) {
      console.log('Template changed — regenerating all images');
      regenerateAll = true;
    }
  } else if (!force) {
    regenerateAll = true;
  }

  const posts = findPosts();
  const toGenerate = regenerateAll
    ? posts
    : posts.filter(p => !fs.existsSync(path.join(OUTPUT_DIR, `${p.slug}.png`)));

  if (toGenerate.length === 0) {
    console.log('All OG images up to date');
    return;
  }

  console.log(`Generating ${toGenerate.length} OG image(s)...`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });

  for (const post of toGenerate) {
    const info = getSeriesInfo(post.series);
    const fontSize = getFontSize(post.title);

    const html = template
      .replace(/\{\{gradient\}\}/g, info.gradient)
      .replace(/\{\{series\}\}/g, info.label)
      .replace(/\{\{title\}\}/g, post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;'))
      .replace(/\{\{fontSize\}\}/g, String(fontSize))
      .replace(/\{\{author\}\}/g, 'Russell Jones');

    await page.setContent(html, { waitUntil: 'load' });
    const outputPath = path.join(OUTPUT_DIR, `${post.slug}.png`);
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(`  ✓ ${post.slug}.png`);
  }

  await browser.close();

  fs.writeFileSync(HASH_FILE, templateHash);
  console.log('Done');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
