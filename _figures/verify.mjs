// Read box geometry out of the live DOM and report, in pixels, how far apart the
// things that are supposed to match actually are. Run after every content edit.
//
//   node verify.mjs <figure.html> [cssWidth]
//
// The groups are derived from the markup conventions shared by every figure here
// (see fig.css), so the same script checks all of them:
//   .box                 every box has the same height
//   .cN                  everything in stage column N (head + boxes) shares left, right, width
//   [data-peer="x"]      boxes that sit on one row share their top edge
//   .head                stage heads share top/bottom; gutters between them are equal
// plus: no text paints outside its box, no box overlaps another, nothing leaves the
// figure, and fig.js reported no off-row one-to-one link.

import puppeteer from 'puppeteer-core';
import path from 'path';

const [, , htmlArg = 'figure.html', widthArg = '1200'] = process.argv;
const HTML  = path.resolve(htmlArg);
const WIDTH = parseInt(widthArg, 10);
const CHROME = process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const CONTAINERS = '.box, .head, .lane-label, .foot';

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
const linkWarnings = [];
page.on('console', m => { if (m.text().startsWith('[links]')) linkWarnings.push(m.text()); });
page.on('pageerror', e => linkWarnings.push('[pageerror] ' + e.message));
await page.setViewport({ width: WIDTH, height: 1200, deviceScaleFactor: 1 });
await page.goto('file://' + HTML, { waitUntil: 'networkidle0' });
await page.waitForSelector('body[data-ready="1"]', { timeout: 20000 }).catch(() => {});

const groups = await page.evaluate(() => {
  const G = [{ label: 'all boxes', sel: '.box', keys: ['h'] },
             { label: 'stage heads', sel: '.head', keys: ['t', 'bo'] }];
  const cols = new Set(), peers = new Set();
  document.querySelectorAll('[class*=" c"], [class^="c"]').forEach(e =>
    e.classList.forEach(c => { if (/^c\d+$/.test(c)) cols.add(c); }));
  document.querySelectorAll('[data-peer]').forEach(e => peers.add(e.dataset.peer));
  [...cols].sort().forEach(c => G.push({ label: `stage ${c}`, sel: '.' + c, keys: ['l', 'r', 'w'] }));
  [...peers].forEach(p => G.push({ label: `row ${p}`, sel: `[data-peer="${p}"]`, keys: ['t'] }));
  return G;
});

const rect = sel => page.evaluate(s => [...document.querySelectorAll(s)].map(e => {
  const b = e.getBoundingClientRect();
  return { l: +b.left.toFixed(2), r: +b.right.toFixed(2), t: +b.top.toFixed(2),
           bo: +b.bottom.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
}), sel);

const TOL = 0.05;
let bad = 0;
const line = (ok, label, detail) => {
  if (!ok) bad++;
  console.log(`${ok ? '  ok  ' : 'FAIL  '}${label.padEnd(26)}${detail}`);
};

for (const g of groups) {
  const rs = await rect(g.sel);
  if (rs.length < 2) continue;
  for (const k of g.keys) {
    const v = rs.map(o => o[k]);
    const spread = +(Math.max(...v) - Math.min(...v)).toFixed(2);
    line(spread <= TOL, `${g.label} · ${k}`, `spread ${spread}px  (n=${v.length})`);
  }
}

const heads = (await rect('.head')).sort((a, b) => a.l - b.l);
if (heads.length > 2) {
  const gaps = heads.slice(1).map((o, i) => +(o.l - heads[i].r).toFixed(2));
  const spread = +(Math.max(...gaps) - Math.min(...gaps)).toFixed(2);
  line(spread <= TOL, 'stage gutters', JSON.stringify(gaps));
}

const geo = await page.evaluate(sel => {
  const out = { escapes: [], overlaps: [], outside: [] };
  for (const box of document.querySelectorAll(sel)) {
    const B = box.getBoundingClientRect();
    for (const el of box.querySelectorAll('*')) {
      if (el.tagName === 'svg' || el.closest('svg') || !el.textContent.trim()) continue;
      const r = el.getBoundingClientRect();
      const d = { right: r.right - B.right, bottom: r.bottom - B.bottom, left: B.left - r.left, top: B.top - r.top };
      const side = Object.keys(d).reduce((a, k) => d[k] > d[a] ? k : a, 'right');
      if (d[side] > 0.5) out.escapes.push({ box: box.id || box.className, txt: el.textContent.trim().slice(0, 30), side, px: +d[side].toFixed(1) });
    }
    // text must also clear the box padding on the right (inner breathing room >= 6px)
    if (box.classList.contains('box')) for (const el of box.children) {
      const r = el.getBoundingClientRect();
      if (B.right - r.right < 6) out.escapes.push({ box: box.id, txt: el.textContent.trim().slice(0, 30), side: 'right padding', px: +(6 - (B.right - r.right)).toFixed(1) });
    }
  }
  const boxes = [...document.querySelectorAll('.box')].map(e => [e.id, e.getBoundingClientRect()]);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const [a, A] = boxes[i], [b, Bb] = boxes[j];
    if (A.left < Bb.right - .5 && Bb.left < A.right - .5 && A.top < Bb.bottom - .5 && Bb.top < A.bottom - .5) out.overlaps.push(`${a} / ${b}`);
  }
  const F = document.querySelector('.fig').getBoundingClientRect();
  for (const [id, r] of boxes) if (r.left < F.left || r.right > F.right) out.outside.push(id);
  return out;
}, CONTAINERS);

line(!geo.escapes.length, 'content inside its box', geo.escapes.length ? `${geo.escapes.length} escape(s)` : 'none escape');
for (const e of geo.escapes.slice(0, 12)) console.log(`        #${e.box} · "${e.txt}" overflows ${e.side} by ${e.px}px`);
line(!geo.overlaps.length, 'boxes do not overlap', geo.overlaps.join(', ') || 'none');
line(!geo.outside.length, 'boxes inside figure', geo.outside.join(', ') || 'all');
line(!linkWarnings.length, 'links on their rows', linkWarnings.join(' | ') || 'all straight or bussed');

await browser.close();
console.log(bad ? `\n${bad} mismatch(es)` : '\nall groups aligned, nothing overflows');
process.exit(bad ? 1 : 0);
