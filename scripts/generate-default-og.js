const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const templatePath = path.join(__dirname, 'og-template.html');
  let html = fs.readFileSync(templatePath, 'utf-8');

  const gradient = '#2c3e50, #4ca1af';

  html = html.replace('{{gradient}}', gradient);
  html = html.replace('{{series}}', 'jonesrussell.github.io/blog');
  html = html.replace('{{title}}', 'Russell Jones');
  html = html.replace('{{fontSize}}', '64');
  html = html.replace('{{author}}', 'AI Operator | 1+N Agents');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: path.join(__dirname, '..', 'static', 'images', 'og-default.png'),
    type: 'png'
  });
  await browser.close();
  console.log('Generated new og-default.png');
})();
