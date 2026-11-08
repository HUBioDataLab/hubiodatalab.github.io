# Research page and home slider schematics

## Current research page figures

The six `research-*.html` figures are the set used by `/research/`. They follow the
Claude `html-vector-figures` skill: a 12-column grid at 1920 CSS px, measured connectors,
embedded static fonts, and native SVG scientific illustrations. The overview is a connected
map of five research areas. Each section has its own composition: a heterogeneous network,
a protein fold and annotation hierarchy, a ligand/cell/response view, two design spaces,
and a multimodal embedding manifold. Teal, blue, amber, rose and violet identify subjects.

- `compose-research.py`: source for all six illustrations and their HTML. Uses RDKit for
  valid chemical coordinates, projected and depth-sorted ribbon surfaces for schematic
  protein folds, and native vectors for networks, cells, contours and manifolds.
- `research-atlas.css`: open canvas, shared geometry and typography.
- `research-atlas.js`: connectors calculated from SVG endpoints after fonts load.
- `render-research.mjs`: exports 3840 px PNGs and vector PDFs; checks peer alignment,
  gutters, text and illustration overflow, connector crossings, embedded fonts, and
  extractable PDF headings. Rejects raster images in the PDFs. Also serialises standalone
  SVG artwork with embedded fonts and the resolved connectors.
- `export-research.py`: copies SVGs and PDFs to `images/figures/`, and makes 2000 px
  PNG and lossless WebP alternatives. The website uses the SVG drawings, without the
  extra document headings and footers, so the art integrates with the Research page.
  Also creates `out/research-contact-sheet.png` and previews at the page's 1000 px width.

```sh
python3 _figures/compose-research.py
CHROME_PATH=/path/to/chrome node _figures/render-research.mjs
python3 _figures/export-research.py
node _figures/render-research.mjs --preview
```

Run from the repository root. The renderer also accepts individual names, for example
`node _figures/render-research.mjs protein-function`. It discovers the existing local
Playwright Chromium installation when `CHROME_PATH` is omitted. It requires `pdftotext`
for the searchable-text check; the composer requires RDKit and NumPy, and the exporter
requires Pillow.

The final preview command checks that all six SVGs load as images and fit desktop
and mobile widths. It writes `out/research-live-size.png` and `out/research-mobile.png`;
`out/research-web-preview.html` is the local gallery used for that check.

Content and numbers come from `_data/research.yml` and `_data/software.yml`. All molecular
structures, sequences, matrices and curves are illustrative. Chemical structures are
examples, not candidates produced by the named models; protein folds are schematic, not
experimental structures. After changing content or geometry, compose, render, verify and
export again. Inspect the contact sheet and individual previews. The `figure_size` and
`overview_size` in `_data/research.yml` match the standalone SVG viewBox dimensions.

## Earlier source schematics

Hand-authored HTML/CSS figures (html-vector-figures skill). Jekyll ignores this folder.

- `<id>.html`: one figure each (`overview` plus one per `_data/research.yml` direction id).
- `fig.css`: shared palette, 12-column grid and box styles. The geometry rules are in its header comment.
- `fig.js`: draws the arrows from measured box positions. `data-links` on `.fig` takes
  `a b > x y` (bus from sources to targets) and `a v b` (straight down).
- `font.css`: Source Sans 3 400/600/700, static files embedded as base64 (family `FigSans`), so the PDFs
  contain real text. Rebuild it with `python3 embed-fonts.py fonts font.css`.
- `out/` (gitignored): 2400 px PNGs and vector PDFs.

## Re-render

```bash
cd _figures
npm install                       # puppeteer-core, first time only
export CHROME_PATH=/path/to/chrome   # e.g. ~/.cache/ms-playwright/chromium-1124/chrome-linux/chrome
for f in overview knowledge-graphs protein-function drug-target generative-design representation-learning; do
  node verify.mjs $f.html 1200 && node render.mjs $f.html out 1200
done
```

`verify.mjs` checks that every box has the same height, boxes in a stage share their edges, gutters are
equal, no text spills out of its box and no one-to-one arrow bends. `render.mjs` reports
`REAL TEXT` when the PDF embeds the fonts.

Then make the web copies (2000 px wide, 128-colour PNG):

```bash
python3 - <<'EOF'
from PIL import Image
for f in ['overview','knowledge-graphs','protein-function','drug-target','generative-design','representation-learning']:
    im = Image.open(f'out/{f}_4k.png').convert('RGB')
    im = im.resize((2000, round(im.height * 2000 / im.width)), Image.LANCZOS)
    im.quantize(colors=128, method=Image.MEDIANCUT, dither=Image.Dither.NONE).save(f'../images/figures/{f}.png', optimize=True)
    print(f, im.size)
EOF
```

If a figure's height changes, update its `figure_size` (or `overview_size`) in `_data/research.yml`.

Content comes only from `_data/research.yml` and `_data/software.yml`. Red = the lab's methods and tools,
grey = data, slate = outcomes.

## Home page slider figures (`hl-*.html`)

One compact schematic per slide in `_data/highlights.yml`: `hl-druggen`, `hl-selformermm`, `hl-crossbarv2`,
`hl-prothgt`, `hl-probe`, `hl-selformer`. Same palette, grid, boxes and arrows as above; `hl.css` (loaded after
`fig.css`) only changes the scale: authored at 900 CSS px with 27 px titles and 21 px notes, so the labels stay
readable in the ~520 px slider panel. Content comes only from `_data/highlights.yml`, `_data/software.yml` and the
tools' README files. The paper's original figure stays referenced as `paper_figure:` in `_data/highlights.yml`.

```bash
for f in hl-druggen hl-selformermm hl-crossbarv2 hl-prothgt hl-probe hl-selformer; do
  node verify.mjs $f.html 900 && node render.mjs $f.html out 900
done
python3 - <<'PY'
from PIL import Image
for f in ['hl-druggen','hl-selformermm','hl-crossbarv2','hl-prothgt','hl-probe','hl-selformer']:
    im = Image.open(f'out/{f}_4k.png').convert('RGB')
    im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
    im.quantize(colors=128, method=Image.MEDIANCUT, dither=Image.Dither.NONE).save(f'../images/figures/{f}.png', optimize=True)
PY
```
