// Render a hand-authored HTML figure to a 4K PNG + a vector PDF with real text.
//
//   node render.mjs [figure.html] [outDir] [cssWidth]
//
// Defaults: figure.html, ./out, 1920 (x2 device scale -> 3840 px = 4K).
// Requires: npm install puppeteer-core   (drives the system Chrome, no download)

import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const [, , htmlArg = 'figure.html', outArg = 'out', widthArg = '1920'] = process.argv;
const HTML  = path.resolve(htmlArg);
const OUT   = path.resolve(outArg);
const WIDTH = parseInt(widthArg, 10);
const BASE  = path.basename(HTML, path.extname(HTML));

const CHROME = process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

if (!fs.existsSync(HTML))   { console.error(`no such file: ${HTML}`); process.exit(1); }
if (!fs.existsSync(CHROME)) { console.error(`no Chrome at ${CHROME}; set CHROME_PATH`); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,              // NOT 'shell' -- the old shell emits Type3 PDF fonts
  args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files'],
});

const page = await browser.newPage();
page.on('console',   m => console.log('  [console]', m.text()));
page.on('pageerror', e => console.log('  [pageerror]', e.message));

await page.setViewport({ width: WIDTH, height: 1200, deviceScaleFactor: 2 });
await page.goto('file://' + HTML, { waitUntil: 'networkidle0' });

// the figure signals it has drawn its measured arrows
await page.waitForSelector('body[data-ready="1"]', { timeout: 20000 })
  .catch(() => console.log('  [warn] no body[data-ready], rendering anyway'));
await page.evaluate(() => document.fonts.ready);

const H = await page.evaluate(
  () => Math.ceil(document.documentElement.getBoundingClientRect().height));
console.log(`page: ${WIDTH} x ${H} css px  ->  ${WIDTH * 2} x ${H * 2} device px`);

// ---- 4K raster -------------------------------------------------------------
await page.setViewport({ width: WIDTH, height: H, deviceScaleFactor: 2 });
await new Promise(r => setTimeout(r, 400));          // let the relayout settle
await page.screenshot({
  path: path.join(OUT, `${BASE}_4k.png`),
  clip: { x: 0, y: 0, width: WIDTH, height: H },
  captureBeyondViewport: true,
});

// ---- vector PDF ------------------------------------------------------------
await page.pdf({
  path: path.join(OUT, `${BASE}.pdf`),
  width: `${WIDTH}px`,
  height: `${H}px`,
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  preferCSSPageSize: false,
});

await browser.close();

// ---- prove the PDF holds real text, not outlines ---------------------------
const pdf  = fs.readFileSync(path.join(OUT, `${BASE}.pdf`));
const subs = new Set([...pdf.toString('latin1').matchAll(/\/Subtype\s*\/(\w+)/g)].map(m => m[1]));
const files = (pdf.toString('latin1').match(/\/FontFile2/g) || []).length;
const ok = files > 0 && !subs.has('Type3');
console.log(`pdf fonts: ${[...subs].join(', ')} | FontFile2 x${files}  -> ` +
  (ok ? 'REAL TEXT' : 'TYPE3 OUTLINES -- use static per-weight fonts, not a variable font'));
console.log('done');
process.exit(ok ? 0 : 2);
