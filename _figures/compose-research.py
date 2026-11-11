"""Author the research atlas as native SVG inside HTML, with selectable labels.

Scientific drawings are conceptual. RDKit supplies chemically valid coordinates for
illustrative molecules; protein ribbons and embedding geometry are schematic.
No performance, experimental structure or model-generated candidate is depicted.
"""
from pathlib import Path
import html
import math
import sys
import numpy as np
from rdkit import Chem
from rdkit.Chem import rdDepictor

ROOT = Path(__file__).resolve().parent
TAU = math.tau
INK, MUTED, LINE = '#203448', '#526777', '#dbe3e8'
TEAL, BLUE, GOLD, ROSE, VIOLET = '#147d86', '#3868bc', '#c68529', '#bc526e', '#8061ad'
COLORS = [TEAL, BLUE, GOLD, ROSE, VIOLET]


def fmt(v):
    return f'{v:.2f}'.rstrip('0').rstrip('.')


def attrs(**kw):
    return ' '.join(f'{k.replace("_", "-")}="{html.escape(str(v), quote=True)}"' for k, v in kw.items() if v is not None)


def element(tag, body='', **kw):
    return f'<{tag} {attrs(**kw)}>{body}</{tag}>'


def group(body, x=0, y=0, scale=1, **kw):
    return element('g', body, transform=f'translate({fmt(x)} {fmt(y)}) scale({fmt(scale)})', **kw)


def path(d, color=INK, width=2, fill='none', **kw):
    return element('path', d=d, stroke=color, stroke_width=width, fill=fill, stroke_linecap='round', stroke_linejoin='round', **kw)


def line(a, b, color=LINE, width=2, **kw):
    return element('line', x1=fmt(a[0]), y1=fmt(a[1]), x2=fmt(b[0]), y2=fmt(b[1]), stroke=color, stroke_width=width, **kw)


def circle(x, y, radius, color=TEAL, fill='white', width=2, **kw):
    return element('circle', cx=fmt(x), cy=fmt(y), r=fmt(radius), stroke=color, fill=fill, stroke_width=width, **kw)


def ellipse(x, y, rx, ry, color=LINE, fill='none', width=2, **kw):
    return element('ellipse', cx=x, cy=y, rx=rx, ry=ry, stroke=color, fill=fill, stroke_width=width, **kw)


def label(x, y, content, color=INK, size=30, weight=400, anchor='start', **kw):
    # Use real SVG text throughout. Font metrics are checked in the rendered DOM.
    rows = content.split('\n')
    body = ''.join(element('tspan', html.escape(row), x=x, dy=0 if i == 0 else fmt(size * 1.3)) for i, row in enumerate(rows))
    return element('text', body, x=x, y=y, fill=color, font_size=size, font_weight=weight, text_anchor=anchor, **kw)


def port(name, x, y):
    return circle(x, y, .1, 'none', 'none', 0, id=name, data_port='true')


def connection(source, target, color, bend=0, dash=False, arrow=False):
    # Actual path endpoints are resolved from the DOM by research-figures.js.
    return element('g', '', data_from=source, data_to=target, data_color=color, data_bend=bend, data_dash=str(dash).lower(), data_arrow=str(arrow).lower())


def shade(color, value):
    rgb=np.array([int(color[i:i+2], 16) for i in (1, 3, 5)])
    if value > 1:
        rgb=rgb+(255-rgb)*(value-1)
    else:
        rgb=rgb*value
    return '#' + ''.join(f'{round(v):02x}' for v in np.clip(rgb, 0, 255))


def molecule(smiles, x, y, size=250, color=INK, rotation=0, balls=False):
    mol=Chem.MolFromSmiles(smiles)
    Chem.Kekulize(mol, clearAromaticFlags=True)
    rdDepictor.Compute2DCoords(mol)
    pts=np.array([[mol.GetConformer().GetAtomPosition(i).x, -mol.GetConformer().GetAtomPosition(i).y] for i in range(mol.GetNumAtoms())])
    a=math.radians(rotation)
    pts=pts@np.array([[math.cos(a), math.sin(a)], [-math.sin(a), math.cos(a)]])
    pts-=np.mean([pts.min(axis=0), pts.max(axis=0)], axis=0)
    pts*=size/max(np.ptp(pts, axis=0))
    pts+=np.array([x, y])
    pieces=[]
    for bond in mol.GetBonds():
        p,q=pts[bond.GetBeginAtomIdx()],pts[bond.GetEndAtomIdx()]
        delta=q-p; normal=np.array([-delta[1],delta[0]])/np.linalg.norm(delta)
        n=int(bond.GetBondTypeAsDouble())
        for offset in ([-3.5,3.5] if n==2 else [-6,0,6] if n==3 else [0]):
            pieces.append(line(p+normal*offset,q+normal*offset,color,3.4 if size>180 else 2.6))
    for atom,(px,py) in zip(mol.GetAtoms(),pts):
        sym=atom.GetSymbol()
        if balls:
            ac={'N':BLUE,'O':ROSE,'S':GOLD}.get(sym,color)
            pieces.append(circle(px,py,10 if sym!='C' else 7,ac,shade(ac,1.5),2))
        elif sym!='C':
            ac={'N':BLUE,'O':ROSE,'S':GOLD}.get(sym,color)
            h=atom.GetTotalNumHs()
            sym=sym+('H' if h==1 else f'H{h}' if h>1 else '')
            font=max(16,min(28,size*.12))
            pieces.append(circle(px,py,font*.60,'none','#fff',0))
            pieces.append(label(px,py+font*.32,sym,ac,font,600,'middle'))
    return ''.join(pieces)


ASPIRIN='CC(=O)Oc1ccccc1C(=O)O'
CAFFEINE='Cn1c(=O)c2c(ncn2C)n(C)c1=O'
IBUPROFEN='CC(C)Cc1ccc(cc1)C(C)C(=O)O'


def ribbon_fold(x, y, scale=1, palette=(TEAL, BLUE, VIOLET), angle=0, ghost=False):
    """A detailed schematic cartoon: shaded alpha helices, beta strands and loops.

    Ribbon segments are projected from 3D and sorted by depth. This is a conceptual
    fold, not a PDB structure. Every surface remains an ordinary vector polygon.
    """
    surfaces=[]
    endpoints=[]
    def proj(p):
        # Orthographic camera with visible depth, then an in-plane rotation.
        xx=p[0]+.30*p[2]; yy=p[1]-.23*p[2]
        a=math.radians(angle)
        return np.array([xx*math.cos(a)-yy*math.sin(a),xx*math.sin(a)+yy*math.cos(a)])
    helices=[((-95,-58,-22),(-122,58,4),17,3.2),((-53,68,25),(16,-85,28),19,4.0),((75,-55,-8),(110,68,-4),19,3.3),((73,85,30),(-28,93,35),16,2.6)]
    for k,(start,end,radius,turns) in enumerate(helices):
        start,end=np.array(start,dtype=float),np.array(end,dtype=float)
        axis=(end-start)/np.linalg.norm(end-start)
        u=np.cross(axis,[0,0,1]);u/=np.linalg.norm(u);v=np.cross(axis,u)
        samples=[]
        for t in np.linspace(0,1,180):
            phase=t*TAU*turns
            radial=u*math.cos(phase)+v*math.sin(phase)
            center=start+(end-start)*t+radius*radial
            tangent=(end-start)+radius*TAU*turns*(-u*math.sin(phase)+v*math.cos(phase))
            tangent/=np.linalg.norm(tangent)
            side=np.cross(radial,tangent);side/=np.linalg.norm(side)
            samples.append((center,center-side*9.5,center+side*9.5,radial))
        endpoints.append((samples[0][0],samples[-1][0]))
        color=palette[k%len(palette)]
        for a,b in zip(samples,samples[1:]):
            coords=[proj(p) for p in [a[1],a[2],b[2],b[1]]]
            light=.62+.70*(a[3][2]+1)/2
            fill=shade(color,light) if not ghost else '#cdd8de'
            s=element('polygon',points=' '.join(','.join(fmt(z) for z in p) for p in coords),fill=fill,stroke=fill,stroke_width=.5)
            surfaces.append(((a[0][2]+b[0][2])/2,s))
    # Three beta strands form an open sheet behind the helix bundle.
    for k in range(3):
        start=np.array([-47+k*32,45,-38.]);end=np.array([-39+k*32,-45,-38.])
        if k%2:start,end=end,start
        d=end-start;d/=np.linalg.norm(d); side=np.array([-d[1],d[0],0])*9
        neck=end-d*28
        ps=[start-side,start+side,neck+side,neck+side*1.8,end,neck-side*1.8,neck-side]
        color=palette[(k+1)%len(palette)] if not ghost else '#dbe3e8'
        coords=[proj(p) for p in ps]
        surfaces.append((-38,element('polygon',points=' '.join(','.join(fmt(z) for z in p) for p in coords),fill=shade(color,1.28),stroke=shade(color,.85),stroke_width=1)))
    loops=''
    for i in range(len(endpoints)-1):
        p,q=proj(endpoints[i][1]),proj(endpoints[i+1][0])
        bend=-35 if i%2 else 38
        loops+=path(f'M{fmt(p[0])} {fmt(p[1])} C{fmt(p[0]+bend)} {fmt(p[1]+22)} {fmt(q[0]-bend)} {fmt(q[1]+28)} {fmt(q[0])} {fmt(q[1])}',palette[i%len(palette)] if not ghost else '#cdd8de',4.6)
    return group(loops+''.join(s for _,s in sorted(surfaces,key=lambda p:p[0])),x,y,scale)


def cell(x,y,scale=1):
    body=ellipse(0,0,128,104,TEAL,'#edf7f3',2.5)
    body+=ellipse(0,0,120,96,'#68a59f','none',1.5)
    body+=ellipse(-4,-5,49,44,VIOLET,'#e6dff0',2)
    body+=ellipse(9,-2,16,14,VIOLET,'#bca4d2',1)
    for i,(xx,yy,a) in enumerate([(-73,-43,-25),(72,-37,25),(-74,39,30),(63,48,-32),(15,74,10),(-22,-75,15)]):
        d=element('g',ellipse(0,0,22,10,GOLD,'#f6e5b7',1.5)+path('M-14 0 Q-8 -8 -3 0 T8 0 T16 0',GOLD,1.5),transform=f'translate({xx} {yy}) rotate({a})')
        body+=d
    # Endoplasmic reticulum / membrane detail and ribosomes.
    for k in range(4):body+=path(f'M40 {-17+k*9} Q80 {-25+k*9} 83 {-2+k*9}',TEAL,2,opacity='.45')
    for i in range(23):
        a=i*2.3999;r=70+(i%5)*7
        body+=circle(math.cos(a)*r,math.sin(a)*r*.69,1.8,TEAL,TEAL,0,opacity='.45')
    return group(body,x,y,scale)


def dna(x,y,scale=1,color=BLUE):
    body=''
    for i in range(90):
        t=i/89*TAU*2
        nx=(i+1)/89*TAU*2
        if i<89:
            for shift in [0,math.pi]:
                body+=line((math.cos(t+shift)*24,i*2.6),(math.cos(nx+shift)*24,(i+1)*2.6),color,3.2)
        if i%5==0:body+=line((math.cos(t)*24,i*2.6),(-math.cos(t)*24,i*2.6),color,2,opacity='.35')
    return group(body,x,y,scale)


def network(cx,cy,rx,ry,n=60,color=TEAL,seed=4):
    rng=np.random.default_rng(seed)
    angles=np.arange(n)*math.pi*(3-math.sqrt(5))
    rr=np.sqrt((np.arange(n)+.6)/n)
    points=np.column_stack((cx+rx*rr*np.cos(angles),cy+ry*rr*np.sin(angles)))
    points+=rng.normal(0,3,points.shape)
    edges=set();body=''
    for i,p in enumerate(points):
        close=np.argsort(np.linalg.norm(points-p,axis=1))[1:4]
        for j in close:edges.add(tuple(sorted((i,int(j)))))
    for i,j in sorted(edges):body+=line(points[i],points[j],color,1.5,opacity='.28')
    for i,(x,y) in enumerate(points):
        r=4+(i%7==0)*3+(i%17==0)*3
        body+=circle(x,y,r,color,shade(color,1.7) if i%5 else color,1.6)
    return body,points


def manifold(cx,cy,scale=1,seed=4,multi=True):
    rng=np.random.default_rng(seed)
    colors=[BLUE,VIOLET,TEAL,GOLD] if multi else [VIOLET]*4
    points=[]
    for i in range(1000):
        t=rng.uniform(1.15*math.pi,3.9*math.pi)
        z=rng.uniform(-2.5,2.5)
        rad=14+4.2*t
        xx=rad*math.cos(t); yy=rad*math.sin(t)
        px=xx*3.9+z*15;py=yy*1.3-z*34
        k=min(3,int((t-1.15*math.pi)/(2.75*math.pi)*4))
        points.append((yy,px,py,colors[k],i))
    body=''
    # Fine cross-sections reveal the continuous latent surface.
    for z in np.linspace(-2.5,2.5,14):
        ps=[]
        for t in np.linspace(1.15*math.pi,3.9*math.pi,180):
            rad=14+4.2*t;xx=rad*math.cos(t);yy=rad*math.sin(t)
            ps.append((xx*3.9+z*15,yy*1.3-z*34))
        body+=path('M'+' L'.join(' '.join(fmt(v) for v in p) for p in ps),VIOLET,.8,opacity='.13')
    for _,x,y,c,i in sorted(points):body+=circle(x,y,1.9+(i%9==0)*1.5,c,c,0,opacity='.72')
    return group(body,cx,cy,scale)


def plate(x,y,scale=1):
    body=element('rect',x=0,y=0,width=170,height=114,rx=10,fill='#fbfcfc',stroke=LINE,stroke_width=2)
    for i in range(4):
        for j in range(6):
            c=[TEAL,BLUE,ROSE,VIOLET][(i+j)%4]
            body+=circle(19+j*26,18+i*26,7,c,shade(c,1.65),1.5)
    return group(body,x,y,scale)


def chart(x,y,width=340,height=220):
    body=line((0,0),(0,height),MUTED,2)+line((0,height),(width,height),MUTED,2)
    for j,c in enumerate([GOLD,ROSE,BLUE]):
        pts=[]
        for t in np.linspace(0,1,100):
            yy=18+(height-34)/(1+math.exp(-(t-(.34+j*.12))*13))
            pts.append((width*t,yy))
        body+=path('M'+' L'.join(' '.join(fmt(v) for v in p) for p in pts),c,3.4)
    body+=label(width/2,height+42,'Drug concentration',MUTED,26,400,'middle')
    body+=label(-35,height/2,'Viability',MUTED,26,400,'middle',transform=f'rotate(-90 -35 {height/2})')
    return group(body,x,y)


def contours(x,y,scale=1,color=VIOLET):
    body=''
    for k in range(14):
        rr=25+k*12
        pts=[]
        for t in np.linspace(0,TAU,150):
            r=rr*(1+.12*math.sin(3*t)+.06*math.cos(5*t))
            pts.append((r*math.cos(t),r*.53*math.sin(t)))
        body+=path('M'+' L'.join(' '.join(fmt(v) for v in p) for p in pts)+' Z',color,1.15,opacity=fmt(.12+k*.018))
    return group(body,x,y,scale)


def soft_shape(d,color,opacity=.075):
    return path(d,'none',0,color,opacity=opacity)


def overview():
    a=''
    # Five biological motifs occupy one connected field, not five containers.
    for d,c in [
        ('M170 110 C390 0 560 130 555 280 C540 370 255 380 140 280 Z',TEAL),
        ('M745 120 C730 10 1080 10 1115 200 C1130 340 820 370 745 220 Z',BLUE),
        ('M1290 100 C1410 5 1745 100 1705 315 C1670 420 1360 405 1280 260 Z',ROSE),
        ('M160 490 C200 380 665 390 690 600 C700 785 225 800 160 660 Z',VIOLET),
        ('M1130 470 C1320 365 1720 420 1735 630 C1710 830 1190 805 1130 640 Z',GOLD),
    ]:a+=soft_shape(d,c)
    # Coloured ribbons meet around a shared conceptual centre.
    stems=[('M490 290 C630 315 650 398 790 404',TEAL),('M913 290 C913 340 931 365 929 391',BLUE),('M1328 303 C1180 355 1170 417 1075 432',ROSE),('M590 552 C690 500 730 487 802 470',VIOLET),('M1220 555 C1135 510 1115 490 1070 480',GOLD)]
    for d,c in stems:a+=path(d,c,22,opacity='.09')+path(d,c,2.1,opacity='.65')
    a+=label(934,437,'Shared evidence',INK,34,600,'middle')+label(934,480,'& learned models',INK,34,600,'middle')
    graph,_=network(350,222,175,115,40,TEAL,9);a+=graph
    a+=label(112,70,'Knowledge graphs',TEAL,36,600)+label(112,109,'Connect biomedical evidence',MUTED,27)
    a+=ribbon_fold(926,242,.92,(TEAL,BLUE,VIOLET),-13)
    a+=label(755,48,'Protein function',BLUE,36,600)+label(755,88,'From sequence to biological role',MUTED,27)
    a+=molecule(ASPIRIN,1425,217,190,ROSE,-12)+ribbon_fold(1650,250,.52,(ROSE,VIOLET,BLUE),18)
    a+=label(1300,67,'Generative design',ROSE,36,600)+label(1300,107,'New molecules and proteins',MUTED,27)
    a+=contours(422,592,1.1,VIOLET)+manifold(430,578,.75,8,True)
    a+=label(154,770,'Molecular representations',VIOLET,36,600)+label(154,810,'Reusable features and foundation models',MUTED,27)
    a+=molecule(IBUPROFEN,1275,574,200,GOLD,22)+cell(1510,578,.78)
    a+=label(1138,770,'Interactions & drug response',GOLD,36,600)+label(1138,810,'From target binding to cellular context',MUTED,27)
    return a,860


def knowledge():
    a=''
    clusters=[(760,370,205,165,37,TEAL),(600,150,135,104,21,BLUE),(1104,206,170,124,27,GOLD),(1120,585,180,132,29,ROSE),(568,607,160,108,25,VIOLET)]
    sets=[]
    for idx,(cx,cy,rx,ry,n,c) in enumerate(clusters):
        a+=ellipse(cx,cy,rx+22,ry+16,'none',shade(c,1.91),0,transform=f'rotate({idx*11-15} {cx} {cy})')
        drawing,pts=network(cx,cy,rx,ry,n,c,idx+8);sets.append(pts)
        a+=drawing
    # Heterogeneous relations bridge local neighbourhoods.
    bridges=''
    for i,j in [(0,1),(0,2),(0,3),(0,4),(1,4),(2,3),(1,2),(3,4)]:
        for k in [2,8,13]:bridges+=line(sets[i][k%len(sets[i])],sets[j][(k+4)%len(sets[j])],shade(COLORS[i],1.1),1.3,opacity='.28')
    a=bridges+a
    a+=label(585,44,'Genes',BLUE,30,600)+label(720,392,'Proteins',TEAL,32,600,'middle',stroke='white',stroke_width=8,paint_order='stroke')
    a+=label(1090,48,'Compounds',GOLD,30,600)+label(1100,771,'Diseases',ROSE,30,600)+label(450,765,'Pathways',VIOLET,30,600)
    # One highlighted query path, plus a visibly inferred relation.
    route=[sets[1][7],sets[0][12],sets[0][0],sets[2][4],sets[3][6]]
    for p,q in zip(route,route[1:]):a+=line(p,q,GOLD,3.4,opacity='.9')
    for p in route:a+=circle(*p,10,GOLD,'#fff6df',3)
    a+=line(sets[4][9],sets[3][11],ROSE,3.2,stroke_dasharray='7 8')
    a+=label(12,88,'34 sources',TEAL,48,600)+label(12,130,'Connected with provenance',MUTED,27)
    for i,(name,c) in enumerate([('Genes & proteins',BLUE),('Compounds & drugs',GOLD),('Diseases & phenotypes',ROSE),('Pathways & functions',VIOLET)]):
        y=254+i*94
        a+=circle(30,y,7,c,c,0)+label(55,y+9,name,MUTED,28)
        a+=port('source'+str(i),325,y)+port('graph'+str(i),[467,483,575,411][i],[180,310,540,597][i])+connection('source'+str(i),'graph'+str(i),c,-.1)
    a+=label(1430,179,'Ask the graph',TEAL,34,600)+label(1430,225,'Find relationships across\nbiological scales.',MUTED,28)
    a+=path('M1435 285 Q1425 285 1425 295 V345 Q1425 355 1435 355 H1630 L1655 374 V355 H1740 Q1750 355 1750 345 V295 Q1750 285 1740 285 Z',TEAL,1.6,fill='#f3f9f7')
    a+=label(1450,328,'Natural-language queries',TEAL,27)
    a+=label(1405,545,'Infer a missing link',ROSE,34,600)
    a+=circle(1470,630,25,ROSE,shade(ROSE,1.87),2)+circle(1685,630,25,TEAL,shade(TEAL,1.87),2)+line((1498,630),(1656,630),ROSE,3,stroke_dasharray='8 9')
    a+=label(1410,709,'Prediction over heterogeneous\nbiomedical relations',MUTED,27)
    return a,820


def protein():
    a=''
    a+=soft_shape('M335 250 C435 80 875 84 1070 264 C1290 510 1020 720 729 724 C455 744 247 520 335 250 Z',BLUE,.055)
    a+=ribbon_fold(732,435,2.25,(TEAL,BLUE,VIOLET),-17)
    # An illustrative residue substitution is linked to the structural view.
    a+=label(55,70,'Sequence',BLUE,30,600)
    residues='M A K L V G A S R T K'.split()
    for i,aa in enumerate(residues):
        xx=62+i*49
        if i==4:a+=element('rect',x=xx-17,y=100,width=35,height=47,rx=5,fill='#f8e2e7')
        a+=label(xx,134,aa,ROSE if i==4 else BLUE,33,600,'middle')
    a+=label(224,191,'V → I',ROSE,30,600)+port('variant',259,204)+port('site',644,386)+connection('variant','site',ROSE,-.15)
    a+=circle(644,386,28,ROSE,'none',2.8)+circle(644,386,6,ROSE,ROSE,0)
    a+=label(55,547,'Structure',TEAL,32,600)+label(55,591,'Sequence, structure\n& biological context',MUTED,28)
    a+=port('struct-label',274,555)+port('struct-site',409,492)+connection('struct-label','struct-site',TEAL,.15)
    a+=label(1260,89,'Functional annotation',BLUE,36,600)
    # A branching hierarchy represents the semantic structure of annotation.
    a+=circle(1188,340,12,BLUE,'white',3)
    for j,(name,c,yy) in enumerate([('Molecular function',TEAL,189),('Biological process',BLUE,321),('Cellular location',VIOLET,453)]):
        a+=path(f'M1204 340 C1240 340 1218 {yy} 1260 {yy}',c,2.2)
        a+=circle(1271,yy,7,c,c,0)+label(1293,yy+10,name,c,30,600)
        for k in range(3):
            xx=1330+k*78; y2=yy+54
            a+=path(f'M1271 {yy+9} Q1271 {y2} {xx} {y2}',c,1.4,opacity='.55')+circle(xx,y2,4,c,shade(c,1.7),1.5)
    a+=port('fold-out',1050,392)+port('annotation',1171,340)+connection('fold-out','annotation',BLUE,.2)
    a+=label(1280,626,'Variant effects',ROSE,34,600)
    a+=ribbon_fold(1382,710,.43,(TEAL,BLUE,VIOLET),-17,True)+ribbon_fold(1460,710,.43,(TEAL,ROSE,VIOLET),-7)
    a+=label(1280,808,'Interpret changes in function',MUTED,28)
    return a,840


def drug():
    a=''
    a+=label(45,48,'Target binding',TEAL,34,600)+label(808,48,'Cellular context',VIOLET,34,600)+label(1372,48,'Drug response',GOLD,34,600)
    # A transparent pocket and a ribbon make the molecular scale prominent.
    a+=soft_shape('M85 190 C140 54 339 142 420 151 C594 100 684 290 615 391 C704 517 483 594 363 552 C141 628 58 470 122 376 C33 312 25 268 85 190 Z',TEAL,.13)
    a+=ribbon_fold(329,335,1.75,(TEAL,BLUE,TEAL),-20)
    a+=molecule(ASPIRIN,439,382,238,GOLD,15,True)
    a+=ellipse(445,381,171,109,GOLD,'none',1.7,stroke_dasharray='6 8',transform='rotate(15 445 381)')
    a+=label(68,652,'Compound–protein interactions',TEAL,30,600)+label(68,695,'Binding, affinity and domain-level associations',MUTED,27)
    a+=cell(1000,396,1.53)
    # Multi-omics is a contextual input, visually distinct from a binding pocket.
    a+=label(813,658,'Cell-line multi-omics',VIOLET,29,600)
    for i in range(4):
        c=[TEAL,VIOLET,GOLD,ROSE][i]
        for j in range(12):
            a+=element('rect',x=815+j*29,y=682+i*17,width=23,height=10,rx=2,fill=c,opacity=[.22,.4,.7,.95][(i*3+j)%4])
    a+=chart(1400,230,330,250)
    a+=label(1370,656,'Response as pIC50',GOLD,30,600)+label(1370,699,'The same drug can act differently\nin different cellular contexts.',MUTED,27)
    # Dashed leaders connect scales without asserting binding determines response.
    a+=port('binding',650,380)+port('cell',777,396)+connection('binding','cell',MUTED,.12,True)
    a+=port('cell-out',1223,396)+port('curve',1350,350)+connection('cell-out','curve',GOLD,.14,True)
    a+=port('omics',993,646)+port('cell-bottom',999,573)+connection('omics','cell-bottom',VIOLET,.12)
    return a,800


def design():
    a=''
    # Two equal, independent halves: drug design first, protein design second.
    a+=line((900,20),(900,820),LINE,2)
    a+=label(450,65,'Drug design',GOLD,42,600,'middle')
    a+=label(450,110,'Target-guided molecular design',MUTED,27,400,'middle')
    a+=label(1350,65,'Protein design',BLUE,42,600,'middle')
    a+=label(1350,110,'Function-guided sequence and structure design',MUTED,27,400,'middle')

    # Drug half: a target protein guides candidates in chemical space.
    a+=ribbon_fold(170,270,.72,(TEAL,BLUE,VIOLET),-18)
    a+=circle(198,253,17,ROSE,'none',2)
    a+=label(170,410,'Target protein',MUTED,27,400,'middle')
    a+=contours(570,390,.98,GOLD)
    a+=molecule(ASPIRIN,470,325,150,GOLD,-12)
    a+=molecule(CAFFEINE,700,370,130,GOLD,18)
    a+=molecule(IBUPROFEN,570,480,165,GOLD,-12)
    a+=label(570,610,'Candidate molecules',GOLD,29,600,'middle')
    a+=plate(170,720,.75)+label(350,775,'Synthesis & assays',GOLD,29,600)
    a+=port('drug-objective',290,275)+port('drug-space',355,345)
    a+=connection('drug-objective','drug-space',GOLD,-.1,False,True)
    a+=port('drug-candidates',570,640)+port('drug-evaluation',530,715)
    a+=connection('drug-candidates','drug-evaluation',GOLD,.1,False,True)

    # Protein half: functional constraints guide sequence/backbone generation.
    a+=ribbon_fold(1110,260,.66,(TEAL,BLUE,VIOLET),-18)
    a+=circle(1136,244,16,BLUE,'none',2)
    a+=label(1110,395,'Target function',MUTED,27,400,'middle')
    rng=np.random.default_rng(31)
    for i in range(90):
        xx,yy=rng.normal(1110,46),rng.normal(520,40)
        a+=circle(xx,yy,2+(i%4==0),VIOLET,VIOLET,0,opacity='.56')
    for k in range(19):
        yy=455+k*7
        a+=path(f'M1200 {yy} C1270 {yy-50} 1335 {580-k*4} 1405 {485+k*2}',BLUE if k%2 else VIOLET,1.35,opacity='.25')
    a+=ribbon_fold(1575,490,.98,(TEAL,BLUE,VIOLET),-14)
    a+=label(1500,640,'Candidate proteins',BLUE,29,600,'middle')
    a+=label(1500,681,'Sequences + backbones',MUTED,26,400,'middle')
    a+=contours(1115,758,.47,VIOLET)+label(1290,775,'Structure & physics',BLUE,29,600)
    a+=port('protein-objective',1230,280)+port('protein-space',1350,450)
    a+=connection('protein-objective','protein-space',BLUE,-.1,False,True)
    a+=port('protein-candidates',1500,700)+port('protein-evaluation',1470,725)
    a+=connection('protein-candidates','protein-evaluation',BLUE,.1,False,True)
    return a,840


def representations():
    a=''
    a+=label(38,53,'Different molecular views',MUTED,31,600)
    source_ys=[145,316,478,675]
    a+=label(52,135,'[C][C][O]',BLUE,35,600)+label(52,180,'SELFIES strings',BLUE,28)
    a+=molecule(ASPIRIN,152,270,132,GOLD,-10)+label(52,388,'Molecular graphs',GOLD,28)
    for i,w in enumerate([190,225,158,210]):a+=line((53,423+i*13),(53+w,423+i*13),TEAL,4,opacity=fmt(.3+i*.13))
    a+=label(52,517,'Molecular text',TEAL,28)
    small,_=network(156,642,95,55,15,VIOLET,5);a+=small+label(52,736,'Knowledge graphs',VIOLET,28)
    # Multiple coloured views enter a continuous latent geometry.
    a+=soft_shape('M597 220 C766 77 1253 121 1339 385 C1450 673 1060 784 754 669 C589 597 505 383 597 220 Z',VIOLET,.055)
    a+=manifold(971,411,1.5,13,True)
    a+=label(934,66,'A shared molecular representation',VIOLET,36,600,'middle')
    a+=label(934,751,'Pre-training · multimodal alignment · transfer',MUTED,28,400,'middle')
    for i,(y,c) in enumerate(zip(source_ys,[BLUE,GOLD,TEAL,VIOLET])):
        # Hairline ribbons echo alignment rather than a generic neural-network icon.
        for k in range(5):a+=path(f'M333 {y+k*5} C490 {y+k*5} 500 {300+i*60+k*3} 650 {300+i*60+k*3}',c,1.2,opacity='.2')
        a+=port(f'view{i}',332,y)+port(f'latent{i}',650,303+i*60)+connection(f'view{i}',f'latent{i}',c,.15)
    a+=label(1490,129,'Properties',TEAL,32,600)+molecule(IBUPROFEN,1592,222,161,TEAL,10)
    a+=label(1490,410,'Interactions',GOLD,32,600)+ribbon_fold(1570,496,.47,(BLUE,TEAL,VIOLET),-12)+molecule(ASPIRIN,1694,504,80,GOLD,-10)
    a+=label(1490,671,'Generation',ROSE,32,600)+molecule(CAFFEINE,1580,752,124,ROSE,10)
    for i,y in enumerate([205,485,729]):
        a+=port(f'emb-out{i}',1328,345+i*74)+port(f'task{i}',1462,y)+connection(f'emb-out{i}',f'task{i}',[TEAL,GOLD,ROSE][i],-.05,False,True)
    return a,840


SPECS = [
    ('overview','Biological data science, across scales','Five connected research directions — from integrated evidence to prediction and design.',overview,
     'Hacettepe University · Biological Data Science Lab','Research connections shown conceptually'),
    ('knowledge-graphs','Biomedical knowledge graphs','Connecting genes, proteins, compounds, pathways and disease.',knowledge,
     'CROssBARv2 · CROssBAR-LLM · ProtHGT · GLaDiGAtor · ECLIPSE','~2.7 M nodes · 12.6 M edges · 34 sources'),
    ('protein-function','Protein function and variation','From sequence and structure to functional annotation and variant effects.',protein,
     'ProtHGT · DEEPred · Domain2GO · ASCARIS · ContVAR','PROBE · ProFAB · CAFA'),
    ('drug-target','Drug–target interactions and cellular response','Interactions at the protein scale; drug response in the context of a cell.',drug,
     'DEEPScreen2 · MDeePred · DRUIDom','DeepResponse · illustrative response curves'),
    ('generative-design','Generative molecule and protein design','Drug design on the left; protein design on the right.',design,
     'Target- and function-guided generation, followed by evaluation.','Molecules, folds and design spaces are illustrative'),
    ('representation-learning','Molecular representations and foundation models','Connecting molecular structure, language and biological context through pre-training.',representations,
     'SELFormer · SELFormerMM · MoCL-GAT','ChemPile · TURMIND · illustrative latent geometry'),
]


def build(names=None):
    requested=set(names or [spec[0] for spec in SPECS])
    unknown=requested-{spec[0] for spec in SPECS}
    if unknown:
        raise SystemExit('Unknown figure name: '+', '.join(sorted(unknown)))
    for name,title,sub,draw,foot,aside in SPECS:
        if name not in requested:
            continue
        art,height=draw()
        svg=element('svg',element('g','',id='connections')+art,xmlns='http://www.w3.org/2000/svg',viewBox=f'0 0 1800 {height}',role='img',aria_label=sub)
        output=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{html.escape(title)}</title>
<link rel="stylesheet" href="font.css"><link rel="stylesheet" href="research-atlas.css">
<script src="research-atlas.js" defer></script></head>
<body><main class="research-fig atlas {name}" data-research-figure>
<header class="figure-head"><h1>{html.escape(title)}</h1><p class="subtitle">{html.escape(sub)}</p></header>
<div class="art atlas-canvas">{svg}</div>
<footer class="figure-foot"><p>{html.escape(foot)}</p><p class="aside">{html.escape(aside)}</p></footer>
</main></body></html>
'''
        (ROOT/f'research-{name}.html').write_text(output)
        print(f'{name}: native SVG composed, 1800 × {height}')


if __name__=='__main__':
    build(sys.argv[1:])
