// Draw connectors from measured geometry. On .fig, data-links="a b > x y; x > z"
// connects every source id to every target id through one vertical bus placed in
// the middle of the gutter between them. Nothing here uses hand-entered coordinates.
// A one-to-one link whose centres differ is drawn as an elbow and reported, because
// in these figures it means a box is off its row. "a v b" draws a straight downward arrow.
(function(){
  const INK = '#4a4a4a', W = 1.6, HEAD = 9;
  const NS = 'http://www.w3.org/2000/svg';
  function draw(fig){
    const host = fig.getBoundingClientRect();
    const svg = document.createElementNS(NS,'svg'); svg.setAttribute('class','wires');
    fig.prepend(svg);
    const R = id => { const e = document.getElementById(id); if(!e) throw new Error('no #'+id);
      const r = e.getBoundingClientRect();
      return {id, l:r.left-host.left, r:r.right-host.left, t:r.top-host.top, b:r.bottom-host.top,
              cx:Math.round(r.left-host.left+r.width/2)+.5, cy:Math.round(r.top-host.top+r.height/2)+.5}; };
    const path = d => { const p=document.createElementNS(NS,'path'); p.setAttribute('d',d);
      p.setAttribute('fill','none'); p.setAttribute('stroke',INK); p.setAttribute('stroke-width',W);
      p.setAttribute('stroke-linecap','butt'); p.setAttribute('stroke-linejoin','miter'); svg.appendChild(p); };
    const head = (x,y,down) => { const p=document.createElementNS(NS,'path');
      p.setAttribute('d', down ? `M${x-HEAD*.55} ${y-HEAD} L${x+HEAD*.55} ${y-HEAD} L${x} ${y} Z`
                               : `M${x-HEAD} ${y-HEAD*.55} L${x-HEAD} ${y+HEAD*.55} L${x} ${y} Z`);
      p.setAttribute('fill',INK); svg.appendChild(p); };
    for (const spec of (fig.dataset.links||'').split(';').map(s=>s.trim()).filter(Boolean)){
      if (/\sv\s/.test(spec)){                       // "a v b": straight down, same column
        const [a,b] = spec.split(/\sv\s/).map(s=>R(s.trim()));
        if (Math.abs(a.cx-b.cx)>0.6) console.log(`[links] ${a.id} v ${b.id}: centres differ by ${(b.cx-a.cx).toFixed(1)}px`);
        path(`M${a.cx} ${a.b} V${b.t-HEAD+.5}`); head(a.cx,b.t,true); continue;
      }
      const [a,b] = spec.split('>').map(s=>s.trim().split(/\s+/).map(R));
      const right = Math.max(...a.map(s=>s.r)), left = Math.min(...b.map(t=>t.l));
      const bx = Math.round((right+left)/2)+.5;
      if (a.length===1 && b.length===1){
        if (Math.abs(a[0].cy-b[0].cy)<0.6){ path(`M${a[0].r} ${a[0].cy} H${b[0].l-HEAD+.5}`); head(b[0].l,a[0].cy); continue; }
        console.log(`[links] ${a[0].id} > ${b[0].id}: centres differ by ${(b[0].cy-a[0].cy).toFixed(1)}px (elbow)`);
      }
      const ys = a.concat(b).map(o=>o.cy);
      // vertical bus first, with square ends so the elbows close cleanly
      const y0 = Math.min(...ys), y1 = Math.max(...ys);
      if (y1 - y0 > 0.5) path(`M${bx} ${y0-W/2} V${y1+W/2}`);
      a.forEach(s=>path(`M${s.r} ${s.cy} H${bx}`));
      b.forEach(t=>{ path(`M${bx} ${t.cy} H${t.l-HEAD+.5}`); head(t.l,t.cy); });
    }
  }
  window.addEventListener('load', async () => {
    await document.fonts.ready;
    document.querySelectorAll('.fig').forEach(draw);
    document.body.dataset.h = Math.ceil(document.documentElement.getBoundingClientRect().height);
    document.body.dataset.ready = '1';
  });
})();
