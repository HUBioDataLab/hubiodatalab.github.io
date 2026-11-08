/* Native SVG illustrations. The molecular, protein and cellular drawings are
   conceptual, not structures or experimental measurements from a particular study. */
(function () {
  'use strict';
  const R = '#a6192e', S = '#3a5579', G = '#77818b', L = '#dce0e4';
  const line = (x1,y1,x2,y2,c=G,w=3,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${extra}/>`;
  const circle = (x,y,r,c=R,fill='#fff',w=3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${c}" stroke-width="${w}"/>`;
  const text = (x,y,t,size=25,c=G,anchor='start',weight=400) => `<text x="${x}" y="${y}" font-size="${size}" fill="${c}" text-anchor="${anchor}" font-weight="${weight}">${t}</text>`;
  const path = (d,c=G,w=3,extra='') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const rect = (x,y,w,h,fill='#fff',stroke=L,r=5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  const group = (x,y,s,body) => `<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;
  function molecule(c=R) {
    return path('M50 10 L80 28 V62 L50 80 L20 62 V28 Z',c,3.5) +
      path('M47 19 L28 30 M72 32 V57 M47 71 L28 59',c,2.5) +
      line(80,28,104,14,c,3.5) + text(108,19,'O',22,c) +
      line(20,62,0,76,c,3.5);
  }
  function protein(c=S) {
    const d='M6 60 C5 24 45 15 48 43 C52 79 8 96 29 112 C51 130 85 88 67 57 C50 23 90 4 110 25 C140 58 81 80 99 110 C116 138 144 115 142 88 C139 56 170 50 179 75';
    return path(d,c,10) + path(d,'#fff',2.2) + circle(110,25,5,R,R,0);
  }
  function dna(c=G) {
    let out = path('M18 0 C78 22 2 50 62 74 C100 96 20 118 62 140',c,4) +
      path('M62 0 C2 22 78 50 18 74 C-20 96 60 118 18 140',c,4);
    [[27,10,53,10],[32,28,48,28],[20,49,60,49],[30,65,50,65],[30,87,50,87],[23,107,57,107],[30,129,50,129]].forEach(a=>out+=line(...a,c,2));
    return out;
  }
  function cell(c=S) {
    return `<ellipse cx="68" cy="66" rx="61" ry="52" fill="#fff" stroke="${c}" stroke-width="3"/>` +
      `<ellipse cx="65" cy="65" rx="23" ry="20" fill="#edf1f6" stroke="${c}" stroke-width="2.5"/>` +
      [[30,47],[98,44],[96,88],[40,90]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="9" ry="4" fill="none" stroke="${c}" stroke-width="2" transform="rotate(-25 ${x} ${y})"/>`).join('');
  }
  function graph(c=R) {
    const n=[[40,55],[115,20],[168,76],[95,118],[15,125],[175,145]];
    let a=''; [[0,1],[1,2],[0,3],[2,3],[3,4],[2,5],[3,5],[0,4]].forEach(([i,j])=>a+=line(...n[i],...n[j],c,2.5));
    n.forEach(([x,y],i)=>a+=circle(x,y,i===3?14:10,c,i===3?c:'#fff',2.5)); return a;
  }
  function matrix(x,y,cols=7,rows=4,c=R,step=23) {
    let s=''; for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const opacity=[.12,.28,.48,.7,.9][(row*3+col*2)%5];
      s+=`<rect x="${x+col*step}" y="${y+row*step}" width="${step-5}" height="${step-5}" rx="3" fill="${c}" opacity="${opacity}"/>`;
    } return s;
  }
  function network(c=R) {
    let s=''; const ys=[[32,84,136],[8,58,108,158],[32,84,136]];
    const xs=[25,115,205];
    for(let col=0;col<2;col++)for(const y of ys[col])for(const yy of ys[col+1])s+=line(xs[col],y,xs[col+1],yy,c,1.5,'opacity=".25"');
    ys.forEach((a,col)=>a.forEach(y=>s+=circle(xs[col],y,9,c,'#fff',2.8))); return s;
  }
  function assay(c=S) {
    let s=rect(0,0,142,88,'#fff',c,8);
    for(let i=0;i<3;i++)for(let j=0;j<5;j++)s+=circle(18+j*26,18+i*26,6,c,(i+j)%4===0?'#c3cedd':'#fff',1.5);
    return s;
  }
  function flask(c=S) {
    return path('M32 4 H66 M39 5 V48 L10 96 Q7 104 19 104 H79 Q90 104 85 96 L59 48 V5',c,3) +
      `<path d="M27 72 H71 L83 95 Q85 100 77 100 H21 Q12 100 17 94 Z" fill="${c}" opacity=".18"/>` + circle(45,77,3,c,c,0) + circle(57,90,4,c,c,0);
  }
  function sourceRecords() {
    const rows=[['Genes and proteins','dna'],['Compounds and drugs','molecule'],['Pathways and diseases','graph']];
    return rows.map(([t,k],i)=>{
      const y=12+i*78;
      const glyph=k==='dna'?group(23,y+4,.38,dna(G)):k==='molecule'?group(18,y+10,.46,molecule(G)):group(16,y+2,.29,graph(G));
      return rect(6,y,500,66,'#fff',L,6)+glyph+text(105,y+41,t,28,G);
    }).join('');
  }
  function typedGraph() {
    let a='';
    const ns=[[260,122],[110,48],[410,48],[85,190],[435,192]];
    [[0,1],[0,2],[0,3],[0,4],[1,3],[2,4]].forEach(([i,j])=>a+=line(...ns[i],...ns[j],R,3,'opacity=".38"'));
    a+=circle(260,122,47,R,'#fff',3)+group(228,90,.36,protein(R));
    a+=circle(110,48,33,G,'#fff',2.5)+group(94,19,.4,dna(G));
    a+=circle(410,48,33,G,'#fff',2.5)+group(390,30,.4,molecule(G));
    a+=circle(85,190,33,G,'#fff',2.5)+group(57,165,.4,cell(G));
    a+=circle(435,192,33,G,'#fff',2.5)+group(411,169,.28,graph(G));
    return a;
  }
  function queryPredict() {
    return rect(12,10,496,88,'#fff','#c5d0de')+text(35,46,'Ask in natural language',28,S,'start',600)+text(35,79,'CROssBAR-LLM',25,S)+
      rect(12,122,496,116,'#fff','#c5d0de')+text(35,161,'Predict missing relations',28,S,'start',600)+text(35,197,'ProtHGT · GLaDiGAtor',25,S)+text(35,226,'ECLIPSE',25,S);
  }
  function proteinInput() {
    let a=text(8,34,'Sequence and variation',27,G,'start',600);
    const wt='MAKLVGAS', va='MAKLIGAS';
    [wt,va].forEach((seq,row)=>seq.split('').forEach((t,i)=>{
      a+=rect(8+i*48,50+row*45,41,36,i===4?'#fbeced':'#fff',i===4?R:L,3)+text(28+i*48,77+row*45,t,26,i===4?R:G,'middle',600);
    }));
    return a+group(145,135,.64,protein(G))+text(305,215,'Structure',26,G);
  }
  function representationModel() {
    return group(24,26,.66,protein(R))+group(188,28,.83,network(R))+matrix(404,75,4,4,R,24)+
      text(260,228,'Sequence · structure · graph context',26,R,'middle');
  }
  function annotation() {
    return ['Molecular function','Biological process','Cellular location'].map((t,i)=>
      rect(18,5+i*63,484,51,'#fff','#c5d0de',5)+circle(43,30+i*63,6,S,S,0)+text(65,40+i*63,t,28,S)
    ).join('') + text(18,232,'Functions affected by a variant',26,S);
  }
  function compoundTarget() {
    return group(40,32,1.3,molecule(G))+group(260,0,1.2,protein(G))+path('M206 82 H248',R,3,'stroke-dasharray="5 7"');
  }
  function omics() {
    return group(8,32,.8,molecule(G))+matrix(161,33,6,4,G,26)+group(366,25,.94,cell(G));
  }
  function interactionModel() {
    return group(33,12,.88,network(R))+group(300,12,.88,graph(R));
  }
  function omicsModel() {
    return matrix(50,39,5,3,R,27)+group(252,9,.88,network(R));
  }
  function interactionOutput() {
    return matrix(80,15,7,5,S,27)+group(343,35,.7,molecule(S))+text(290,160,'Compound–protein associations',24,S,'middle');
  }
  function response() {
    return path('M95 15 V128 H466',S,2.4)+path('M110 30 C175 30 206 34 242 65 S301 113 445 114',S,5)+
      text(270,164,'Drug concentration',24,S,'middle')+`<text transform="translate(64 77) rotate(-90)" text-anchor="middle" font-size="23" fill="${S}">Viability</text>`;
  }
  function target() {
    return group(60,0,1.16,protein(G))+circle(188,29,24,R,'none',2)+group(340,38,1.07,molecule(G));
  }
  function proteinGoal() {
    return group(85,4,.96,dna(G))+group(265,0,1.1,protein(G));
  }
  function smallMoleculeGeneration() {
    let a=''; [[25,25],[50,64],[30,103],[76,17],[86,122],[108,66]].forEach(([x,y],i)=>a+=circle(x,y,3+i%3,R,R,0));
    a+=group(172,33,.95,molecule(R))+group(330,2,.66,molecule(R))+group(388,85,.61,molecule(R));return a;
  }
  function proteinGeneration() {
    return matrix(12,42,4,3,R,26)+group(169,2,1.05,protein(R))+text(386,63,'M A K L',28,R)+text(386,108,'V G S A',28,R);
  }
  function moleculeValidation() {return group(90,13,1.25,flask(S))+group(293,36,1.05,assay(S));}
  function proteinValidation() {
    return group(55,0,1.05,protein(S))+path('M285 25 V134 H480',S,2)+path('M295 46 Q317 122 352 108 T422 108 T471 115',S,3)+text(385,161,'Physics-based evaluation',24,S,'middle');
  }
  function modalities() {
    return rect(8,5,504,53,'#fff',L)+text(27,40,'[C][C][O]  ·  SELFIES',29,G)+
      group(34,82,.92,molecule(G))+text(178,125,'Molecular graphs',28,G)+
      group(35,178,.32,graph(G))+text(178,213,'Text + knowledge graphs',27,G);
  }
  function pretraining() {
    const pts=[[56,48],[71,109],[95,71],[121,126],[136,43],[165,94],[166,142],[190,66]];
    let a=''; pts.forEach(([x,y],i)=>a+=circle(x,y,7,R,i%3?'#fff':R,2));
    a+=path('M227 24 V174 M238 24 H414 M238 174 H414',R,2,'opacity=".35"')+matrix(269,50,7,4,R,23);
    return a+text(260,226,'Align views in a reusable latent space',26,R,'middle');
  }
  function tasks() {
    const names=['Molecular properties','Drug–target interactions','Molecular generation'];
    return names.map((t,i)=>rect(12,7+i*80,496,63,'#fff','#c5d0de')+circle(42,39+i*80,7,S,S,0)+text(68,48+i*80,t,28,S)).join('');
  }
  function overviewGraph() {return group(90,0,1.5,graph(R));}
  function overviewEmbedding() {return group(16,56,.9,molecule(R))+matrix(204,37,8,5,R,25);}
  function overviewProtein() {return group(85,9,1.12,protein(S))+group(345,16,.88,graph(S));}
  function overviewInteractions() {return group(65,33,1.16,molecule(S))+group(280,7,1.06,protein(S));}
  function overviewDesign() {return group(70,34,1.05,molecule(S))+group(285,4,1.03,protein(S))+path('M230 35 V133',L,2);}
  const scenes={sources:sourceRecords,graph:typedGraph,queries:queryPredict,'protein-input':proteinInput,'protein-model':representationModel,annotation,
    'compound-target':compoundTarget,omics,'interaction-model':interactionModel,'omics-model':omicsModel,'interaction-output':interactionOutput,response,
    target,'protein-goal':proteinGoal,'molecule-generation':smallMoleculeGeneration,'protein-generation':proteinGeneration,'molecule-validation':moleculeValidation,
    'protein-validation':proteinValidation,modalities,pretraining,tasks,'overview-graph':overviewGraph,'overview-embedding':overviewEmbedding,
    'overview-protein':overviewProtein,'overview-interactions':overviewInteractions,'overview-design':overviewDesign};
  document.querySelectorAll('[data-art]').forEach(el=>{
    const fn=scenes[el.dataset.art]; if(!fn) throw Error('Unknown illustration '+el.dataset.art);
    const short=el.closest('.lane-panel')||el.dataset.art.startsWith('overview-')&&!el.closest('.foundation');
    el.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 ${short?175:250}" aria-hidden="true">${fn()}</svg>`;
  });
})();
