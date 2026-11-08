// Render and verify the six research figures. Uses the installed browser and
// embedded static fonts, following the html-vector-figures skill.
//   CHROME_PATH=/path/to/chrome node _figures/render-research.mjs [overview ...]
// The optional names limit a revision pass to figures that changed.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const ALL=['overview','knowledge-graphs','protein-function','drug-target','generative-design','representation-learning'];
const preview=process.argv.includes('--preview');
const requested=process.argv.slice(2).filter(n=>n!=='--preview');
const names=requested.length?requested:ALL;
if(names.some(n=>!ALL.includes(n)))throw Error('Unknown figure name');
const chrome=process.env.CHROME_PATH || path.join(os.homedir(),'.cache/ms-playwright/chromium-1124/chrome-linux/chrome');
const out=path.join(ROOT,'out');fs.mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-gpu','--allow-file-access-from-files']});
if(preview){
  try{
    const page=await browser.newPage();
    for(const width of [1100,390]){
      await page.setViewport({width,height:900,deviceScaleFactor:1});
      await page.goto('file://'+path.join(out,'research-web-preview.html'),{waitUntil:'networkidle0'});
      await page.evaluate(()=>document.fonts.ready);
      const result=await page.evaluate(()=>({
        images:[...document.images].length,
        loaded:[...document.images].every(i=>i.complete&&i.naturalWidth===1800),
        overflow:document.documentElement.scrollWidth>innerWidth,
        inside:[...document.images].every(i=>{const r=i.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})
      }));
      if(result.images!==6||!result.loaded||result.overflow||!result.inside)throw Error(JSON.stringify(result));
      await (await page.$('section')).screenshot({path:path.join(out,width===1100?'research-live-size.png':'research-mobile.png')});
      console.log(JSON.stringify({viewport:width,checks:'PASS — all six SVGs load and fit the page'}));
    }
  }finally{await browser.close();}
  process.exit(0);
}
let failures=0;
try {
  for(const name of names){
    const page=await browser.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewport({width:1920,height:1200,deviceScaleFactor:2});
    await page.goto('file://'+path.join(ROOT,`research-${name}.html`),{waitUntil:'networkidle0'});
    await page.waitForSelector('body[data-ready="1"]',{timeout:15000});
    const checks=await page.evaluate(()=>{
      const bad=[]; const tol=.15;
      const rect=e=>{const r=e.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top,b:r.bottom,w:r.width,h:r.height};};
      // Peer panels share their widths, heights, top/bottom edges and gutters.
      document.querySelectorAll('[data-peers]').forEach(row=>{
        const rs=[...row.children].map(rect);
        for(const key of ['t','b','w','h'])if(Math.max(...rs.map(r=>r[key]))-Math.min(...rs.map(r=>r[key]))>tol)bad.push(`${row.dataset.peers}: unequal ${key}`);
        const gaps=rs.slice(1).map((r,i)=>r.l-rs[i].r);
        if(gaps.length>1&&Math.max(...gaps)-Math.min(...gaps)>tol)bad.push(`${row.dataset.peers}: uneven gutters`);
      });
      // Read actual painted descendant and text-node rects, not scrollWidth.
      document.querySelectorAll('.panel,.evaluation,.figure-head,.note-band,.dataset-note,.figure-foot,.data-line').forEach(box=>{
        const B=rect(box);
        const test=(r,label)=>{if(r.left<B.l-1||r.right>B.r+1||r.top<B.t-1||r.bottom>B.b+1)bad.push(`${box.id||box.className}: overflow ${label}`);};
        box.querySelectorAll('h1,h2,h3,p,span,strong,svg text').forEach(el=>test(el.getBoundingClientRect(),el.textContent.slice(0,50)));
        const walker=document.createTreeWalker(box,NodeFilter.SHOW_TEXT);
        let n;while((n=walker.nextNode()))if(n.textContent.trim()&&!n.parentElement.closest('svg')){
          const range=document.createRange();range.selectNodeContents(n);for(const r of range.getClientRects())test(r,n.textContent.trim().slice(0,50));
        }
      });
      // Scientific glyphs and SVG text remain within their allocated art panels.
      document.querySelectorAll('.art').forEach(art=>{
        const B=rect(art);
        art.querySelectorAll('svg path,svg rect,svg circle,svg ellipse,svg text,svg line').forEach(e=>{
          const r=e.getBoundingClientRect();
          if(r.left<B.l-2||r.right>B.r+2||r.top<B.t-2||r.bottom>B.b+2)bad.push(`art ${art.dataset.art}: drawing outside panel`);
        });
      });
      const panels=[...document.querySelectorAll('.panel')].map(e=>[e.id,rect(e)]);
      for(let i=0;i<panels.length;i++)for(let j=i+1;j<panels.length;j++){
        const [a,A]=panels[i],[b,B]=panels[j];if(A.l<B.r-1&&A.r>B.l+1&&A.t<B.b-1&&A.b>B.t+1)bad.push(`overlap ${a}/${b}`);
      }
      // An external connector must never pass through an unrelated panel.
      document.querySelectorAll('.wires > path').forEach(p=>{
        const host=p.closest('[data-research-figure]').getBoundingClientRect();
        for(let d=3;d<p.getTotalLength()-3;d+=5){const q=p.getPointAtLength(d),x=q.x+host.left,y=q.y+host.top;
          for(const [id,r] of panels)if(x>r.l+2&&x<r.r-2&&y>r.t+2&&y<r.b-2){bad.push('connector crosses '+id);break;}
        }
      });
      const H=Math.ceil(document.querySelector('[data-research-figure]').getBoundingClientRect().height);
      return {bad:[...new Set(bad)],height:H,width:document.documentElement.scrollWidth};
    });
    checks.bad.push(...errors);
    if(checks.width!==1920)checks.bad.push(`unexpected document width ${checks.width}`);
    // Export the open scientific drawing itself for the website. The page already
    // supplies its own heading, caption and tool links, so the web figure omits
    // the document header/footer and stays sharp at every zoom level.
    const fontCSS=fs.readFileSync(path.join(ROOT,'font.css'),'utf8');
    const standalone=await page.evaluate(css=>{
      const svg=document.querySelector('.atlas-canvas > svg').cloneNode(true);
      svg.setAttribute('width','1800');svg.setAttribute('height',svg.viewBox.baseVal.height);
      const style=document.createElementNS('http://www.w3.org/2000/svg','style');
      style.textContent=css+"\ntext { font-family: 'FigSans', sans-serif; }";
      svg.prepend(style);
      return new XMLSerializer().serializeToString(svg);
    },fontCSS);
    fs.writeFileSync(path.join(out,`research-${name}.svg`),standalone);
    await page.setViewport({width:1920,height:checks.height,deviceScaleFactor:2});
    await page.screenshot({path:path.join(out,`research-${name}_4k.png`),fullPage:true});
    const pdf=path.join(out,`research-${name}.pdf`);
    await page.pdf({path:pdf,width:'1920px',height:`${checks.height}px`,printBackground:true,margin:{top:0,bottom:0,left:0,right:0},preferCSSPageSize:false});
    const data=fs.readFileSync(pdf).toString('latin1');
    const fonts=(data.match(/\/FontFile2/g)||[]).length;
    if(!fonts||/\/Subtype\s*\/Type3\b/.test(data))checks.bad.push('PDF font embedding failed');
    const extracted=execFileSync('pdftotext',['-layout',pdf,'-'],{encoding:'utf8'});
    const heading=await page.$eval('h1',e=>e.textContent);
    if(!extracted.replace(/\s+/g,' ').includes(heading.replace(/\s+/g,' ')))checks.bad.push('PDF heading is not extractable');
    if(/\/Subtype\s*\/Image\b/.test(data))checks.bad.push('Unexpected raster in vector PDF');
    failures+=checks.bad.length;
    console.log(JSON.stringify({name,size:[3840,checks.height*2],embeddedFonts:fonts,checks:checks.bad.length?checks.bad:'PASS — SVG bounds, text overflow, embedded fonts, extractable vector text'}));
    await page.close();
  }
} finally {await browser.close();}
process.exitCode=failures?1:0;
