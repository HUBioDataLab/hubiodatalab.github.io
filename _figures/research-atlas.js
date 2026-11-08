// Resolve illustrative leaders from live SVG geometry, after the embedded font
// loads. Changing the artwork or annotations does not leave detached connectors.
window.addEventListener('load',async()=>{
  await document.fonts.ready;
  const NS='http://www.w3.org/2000/svg';
  document.querySelectorAll('.atlas-canvas > svg').forEach(svg=>{
    const layer=svg.querySelector('#connections');
    const point=id=>{
      const e=svg.querySelector('#'+id);if(!e)throw Error('Missing endpoint '+id);
      const r=e.getBoundingClientRect(),p=svg.createSVGPoint();p.x=r.left+r.width/2;p.y=r.top+r.height/2;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    };
    svg.querySelectorAll('[data-from]').forEach(e=>{
      const a=point(e.dataset.from),b=point(e.dataset.to),dx=b.x-a.x,dy=b.y-a.y;
      const bend=Number(e.dataset.bend||0),c=e.dataset.color;
      const p=document.createElementNS(NS,'path');
      p.setAttribute('d',`M${a.x} ${a.y} C${a.x+dx*.43-dy*bend} ${a.y+dy*.12+dx*bend} ${b.x-dx*.36-dy*bend} ${b.y-dy*.15+dx*bend} ${b.x} ${b.y}`);
      p.setAttribute('stroke',c);p.setAttribute('stroke-width','2');p.setAttribute('fill','none');p.setAttribute('opacity','.65');
      if(e.dataset.dash==='true')p.setAttribute('stroke-dasharray','5 7');
      if(e.dataset.arrow==='true'){
        const id='arrow-'+e.dataset.from;
        const defs=document.createElementNS(NS,'defs');
        defs.innerHTML=`<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 1 L9 5 L0 9" fill="none" stroke="${c}" stroke-width="1.5"/></marker>`;
        svg.append(defs);p.setAttribute('marker-end',`url(#${id})`);
      }
      layer.append(p);
    });
  });
  document.body.dataset.ready='1';
});
