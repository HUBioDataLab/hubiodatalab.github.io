"""Export lossless web images, PNGs, PDFs and an overview sheet after validation."""
from pathlib import Path
import shutil

from PIL import Image

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
WEB = ROOT.parent / "images" / "figures"
NAMES = [
    "overview", "knowledge-graphs", "protein-function", "drug-target",
    "generative-design", "representation-learning",
]
WEB.mkdir(parents=True, exist_ok=True)
previews = []
for name in NAMES:
    image = Image.open(OUT / f"research-{name}_4k.png").convert("RGB")
    web_size = (2000, round(image.height * 2000 / image.width))
    web = image.resize(web_size, Image.Resampling.LANCZOS)
    web.save(WEB / f"{name}.png", optimize=True)
    web.save(WEB / f"{name}.webp", lossless=True, quality=100, method=6)
    shutil.copyfile(OUT / f"research-{name}.pdf", WEB / f"{name}.pdf")
    shutil.copyfile(OUT / f"research-{name}.svg", WEB / f"{name}.svg")
    preview = image.resize((1000, round(image.height * 1000 / image.width)), Image.Resampling.LANCZOS)
    preview.save(OUT / f"research-{name}-review.png")
    previews.append(preview)
    print(f"{name}: figure_size: [{web_size[0]}, {web_size[1]}]")

row_heights = [max(im.height for im in previews[i:i + 2]) + 40 for i in range(0, 6, 2)]
sheet = Image.new("RGB", (2080, sum(row_heights) + 20), "#e6e9ec")
y = 20
for row, height in enumerate(row_heights):
    for col in range(2):
        sheet.paste(previews[row * 2 + col], (20 + col * 1040, y))
    y += height
sheet.save(OUT / "research-contact-sheet.png", optimize=True)

# A local preview uses the exact standalone SVGs and the site's content width.
titles = [
    "Research overview", "Biomedical knowledge graphs", "Protein function and variation",
    "Drug–target interactions and cellular response", "Generative molecule and protein design",
    "Molecular representations and foundation models",
]
sections = []
for name, title in zip(NAMES, titles):
    src = f"../../images/figures/{name}.svg"
    sections.append(f'<section><h2>{title}</h2><a href="{src}"><img src="{src}" alt="{title}"></a></section>')
(OUT / "research-web-preview.html").write_text(
    '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1">'
    '<title>Research figures — website preview</title><link rel="stylesheet" href="../font.css">'
    '<style>*{box-sizing:border-box}body{margin:0;background:white;color:#203448;font-family:FigSans,sans-serif}'
    'main{max-width:1040px;padding:0 20px;margin:auto}section{padding:28px 0;border-bottom:1px solid #e0e7eb}'
    'h2{font-size:24px;font-weight:600;line-height:1.4;margin:0 0 12px}a{display:block;line-height:0}'
    'img{width:100%;height:auto;display:block}</style></head><body><main>'
    + ''.join(sections) + '</main></body></html>'
)
