#!/usr/bin/env python3
"""Base64 static woff2 files into a self-contained @font-face stylesheet.

    python3 embed-fonts.py <font-dir> [out.css] [family]

Expects files named like  inter-400.woff2 / inter-latin-600-normal.woff2  -- the
first 3-digit number in the filename is taken as the weight.

STATIC files only. A variable font makes Chrome emit /Subtype /Type3 in the PDF:
the text renders correctly but is not selectable, searchable or editable. Fetch
static instances from @fontsource, e.g.

  curl -o fonts/inter-400.woff2 \\
    https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.20/files/inter-latin-400-normal.woff2
"""
import base64
import pathlib
import re
import sys

RULE = ("@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};"
        "font-display:block;src:url(data:font/woff2;base64,{b64}) format('woff2');}}")


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    src = pathlib.Path(sys.argv[1])
    out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else 'font.css')
    fam = sys.argv[3] if len(sys.argv) > 3 else 'InterEmb'

    faces = []
    for f in sorted(src.glob('*.woff2')):
        head = f.read_bytes()[:4]
        if head != b'wOF2':
            print(f'  skip {f.name}: not woff2 (magic {head!r})')
            continue
        m = re.search(r'(\d{3})', f.stem)
        if not m:
            print(f'  skip {f.name}: no weight in filename')
            continue
        weight = int(m.group(1))
        b64 = base64.b64encode(f.read_bytes()).decode()
        faces.append((weight, RULE.format(fam=fam, w=weight, b64=b64)))
        print(f'  {f.name} -> weight {weight} ({f.stat().st_size // 1024} KB)')

    if not faces:
        print('no usable woff2 files found')
        return 1

    faces.sort()
    out.write_text('\n'.join(r for _, r in faces))
    print(f'wrote {out} ({out.stat().st_size // 1024} KB, {len(faces)} weights)')
    print(f"use:  font-family:'{fam}',...   and  <link rel=stylesheet href={out.name}>")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
