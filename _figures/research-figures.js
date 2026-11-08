/* Connect panels only after fonts and artwork have settled. Every endpoint and
   routing lane is measured from the DOM; figure edits cannot move an arrow off a panel. */
window.addEventListener('load', async () => {
  await document.fonts.ready;
  const NS='http://www.w3.org/2000/svg';
  document.querySelectorAll('[data-research-figure]').forEach(fig=>{
    const host=fig.getBoundingClientRect();
    const svg=document.createElementNS(NS,'svg'); svg.setAttribute('class','wires'); svg.setAttribute('aria-hidden','true'); fig.prepend(svg);
    const defs=document.createElementNS(NS,'defs');
    defs.innerHTML='<marker id="research-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#87939f"/></marker>';
    svg.append(defs);
    const R=id=>{ const el=fig.querySelector('#'+id); if(!el)throw Error('No panel #'+id); const r=el.getBoundingClientRect();return {l:r.left-host.left,r:r.right-host.left,t:r.top-host.top,b:r.bottom-host.top,cx:r.left-host.left+r.width/2,cy:r.top-host.top+r.height/2}; };
    const path=(d,arrow=true,dashed=false)=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke','#87939f');p.setAttribute('stroke-width','2.5');p.setAttribute('stroke-linejoin','miter');if(arrow)p.setAttribute('marker-end','url(#research-arrow)');if(dashed)p.setAttribute('stroke-dasharray','7 7');svg.append(p);};
    (fig.dataset.horizontal||'').split(';').map(s=>s.trim()).filter(Boolean).forEach(spec=>{
      const [a,b]=spec.split('>').map(id=>R(id.trim()));
      if(Math.abs(a.cy-b.cy)>.1)throw Error('Horizontal peers do not align: '+spec);
      path(`M${a.r} ${a.cy} H${b.l-5}`);
    });
    if(fig.dataset.foundations){
      const sources=fig.dataset.foundations.split(' ').map(R),targets=fig.dataset.applications.split(' ').map(R);
      const y=(Math.max(...sources.map(r=>r.b))+Math.min(...targets.map(r=>r.t)))/2;
      const xs=sources.concat(targets).map(r=>r.cx);
      path(`M${Math.min(...xs)} ${y} H${Math.max(...xs)}`,false);
      sources.forEach(r=>path(`M${r.cx} ${r.b} V${y}`,false));
      targets.forEach(r=>path(`M${r.cx} ${y} V${r.t-5}`));
      const evalBox=R('evaluation'), appBottom=Math.max(...targets.map(r=>r.b));
      targets.forEach(r=>path(`M${r.cx} ${appBottom} V${evalBox.t-5}`));
    }
  });
  document.body.dataset.ready='1';
});
