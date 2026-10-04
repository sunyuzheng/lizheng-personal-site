#!/usr/bin/env python3
"""Build the free Chinese edition of Growth Data Analytics Playbook.

The source is content/books/growth-data-analytics-playbook-zh/: book.json (chapter list and page
descriptions), chapters/*.md, images/*.png, cover/ and styles/. Run this locally after changing any of it:

    python3 scripts/books/build_gdap_zh.py

It needs pandoc 3, Pillow, pypdf, and Node with Playwright (see render.mjs), and writes

    content/books/growth-data-analytics-playbook-zh/html/   chapter bodies that scripts/prerender-book.ts
                                                            wraps into pages during the site build
    client/public/book/growth-data-analytics-playbook/      web figures, cover, share image, EPUB and PDF

Commit both. The site build itself never runs pandoc or Chromium.
"""
from __future__ import annotations

import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "content/books/growth-data-analytics-playbook-zh"
OUT_HTML = SRC / "html"
PUBLIC = ROOT / "client/public/book/growth-data-analytics-playbook"
RENDER = ROOT / "scripts/books/render.mjs"
WEB_WIDTH = 1400  # figures show at most 700 CSS pixels wide on the site
SEP = "　"  # between a chapter's number and its title, as in the headings


def load_book() -> dict:
    return json.loads((SRC / "book.json").read_text(encoding="utf-8"))


def split_chapter(text: str) -> tuple[str, str, str]:
    """A chapter's H1, the original chapter it follows (the 「对应原书」 line), and the rest."""
    lines = text.rstrip("\n").split("\n")
    if not lines[0].startswith("# "):
        raise SystemExit("each chapter must start with an H1")
    heading = lines[0][2:].strip()
    i = 1
    while i < len(lines) and not lines[i].strip():
        i += 1
    original = ""
    if i < len(lines) and lines[i].startswith("> 对应原书"):
        original = lines[i][len("> 对应原书"):].strip()
        i += 1
    return heading, original, "\n".join(lines[i:]).strip() + "\n"


def pandoc(markdown: str, *args: str) -> str:
    run = subprocess.run(
        ["pandoc", "-f", "markdown", "-t", "html5", "--wrap=none", *args],
        input=markdown, capture_output=True, text=True, check=True,
    )
    return run.stdout


def figure_names(markdown: str) -> list[str]:
    return re.findall(r"\]\(images/([\w.-]+\.png)\)", markdown)


def web_figures(names: set[str]) -> dict[str, tuple[int, int]]:
    """WebP copies for the site, with the size each <img> declares."""
    target = PUBLIC / "images"
    target.mkdir(parents=True, exist_ok=True)
    sizes = {}
    for name in sorted(names):
        image = Image.open(SRC / "images" / name)
        if image.width > WEB_WIDTH:
            image = image.resize((WEB_WIDTH, round(image.height * WEB_WIDTH / image.width)), Image.LANCZOS)
        image.save(target / f"{Path(name).stem}.webp", "WEBP", quality=80, method=6)
        sizes[name] = image.size
    wanted = {f"{Path(name).stem}.webp" for name in names}
    for stale in target.glob("*.webp"):
        if stale.name not in wanted:
            stale.unlink()
    return sizes


def web_body(markdown: str, sizes: dict[str, tuple[int, int]], web_path: str) -> str:
    """A chapter body as the site shows it: WebP figures with their sizes, scrollable tables, titled notes."""
    body = pandoc(markdown)

    def image(match: re.Match) -> str:
        attrs = match.group(1)
        name = re.search(r'src="images/([^"]+)"', attrs).group(1)
        alt = re.search(r'alt="([^"]*)"', attrs)
        width, height = sizes[name]
        return (f'<img src="{web_path}/images/{Path(name).stem}.webp" alt="{alt.group(1) if alt else ""}" '
                f'width="{width}" height="{height}" loading="lazy" decoding="async" />')

    body = re.sub(r"<img ([^>]*?)\s*/?>", image, body)
    body = body.replace("<table>", '<div class="table"><table>').replace("</table>", "</table></div>")
    body = body.replace('role="doc-endnotes">\n<hr />', 'role="doc-endnotes">\n<h2 class="notes-title">注释</h2>')
    return body


def run_render(*args: str) -> None:
    subprocess.run(["node", str(RENDER), *args], check=True)


def render_cover(work: Path) -> Path:
    shutil.copytree(SRC / "cover", work / "cover")
    png = work / "cover/cover.png"
    run_render("shot", str(work / "cover/cover.html"), str(png), "1600", "2400")
    image = Image.open(png).convert("RGB")
    image.save(PUBLIC / "cover.jpg", "JPEG", quality=88, optimize=True, progressive=True)
    small = image.resize((640, 960), Image.LANCZOS)
    small.save(PUBLIC / "cover.webp", "WEBP", quality=84, method=6)
    og = work / "cover/og.png"
    run_render("shot", str(work / "cover/og.html"), str(og), "1200", "630")
    Image.open(og).convert("RGB").save(PUBLIC / "og.jpg", "JPEG", quality=88, optimize=True, progressive=True)
    return PUBLIC / "cover.jpg"


def colophon_lines(book: dict) -> list[str]:
    original = book["original"]
    return [
        f"原书：{book['title']}，{original['publisher']}，{original['year']}年。",
        "作者：" + "、".join(book["authors"]) + "。",
        f"中文版：{book['datePublished'][:4]}年{int(book['datePublished'][5:7])}月，由孙煜征（立正）在lizheng.ai免费发布。"
        "按立正的中文表达习惯改写，改写由AI协助完成。",
        f"在线阅读：https://www.lizheng.ai{book['path']}",
        "可以免费阅读、下载和分享本书的链接；未经许可，请勿整本转载或用于商业用途。",
    ]


def build_epub(book: dict, cover: Path, work: Path) -> Path:
    meta = {
        "title": f"{book['title']} {book['edition']}",
        "subtitle": book["subtitle"],
        "author": book["authors"],
        "lang": "zh-CN",
        "date": book["dateModified"],
        "publisher": "lizheng.ai",
        "rights": colophon_lines(book)[-1],
        "description": book["description"],
    }
    (work / "epub.yaml").write_text(json.dumps(meta, ensure_ascii=False), encoding="utf-8")
    colophon = "# 版权信息 {.unnumbered .unlisted}\n\n" + "\n\n".join(colophon_lines(book)) + "\n"
    (work / "colophon.md").write_text(colophon, encoding="utf-8")
    files = [str(work / "colophon.md"), str(SRC / "chapters" / book["front"])]
    files += [str(SRC / "chapters" / chapter["file"]) for chapter in book["chapters"]]
    files += [str(SRC / "chapters" / book["back"])]
    out = PUBLIC / book["files"]["epub"]
    subprocess.run([
        "pandoc", *files, "-f", "markdown", "-t", "epub3", "-o", str(out),
        "--metadata-file", str(work / "epub.yaml"), "--epub-cover-image", str(cover),
        "--css", str(SRC / "styles/epub.css"), "--toc", "--toc-depth=1", "--split-level=1",
        "--reference-location=section", "--resource-path", str(SRC),
    ], check=True)
    return out


PRINT_WIDTH = 1200  # about 270 dpi across the PDF's text width


def print_figures(work: Path) -> Path:
    """Smaller copies of the figures for the PDF, which embeds them uncompressed otherwise."""
    target = work / "print-images"
    target.mkdir()
    for source in (SRC / "images").glob("*.png"):
        image = Image.open(source)
        if image.width > PRINT_WIDTH:
            image = image.resize((PRINT_WIDTH, round(image.height * PRINT_WIDTH / image.width)), Image.LANCZOS)
        # Chromium embeds a JPEG as it is, but re-encodes a PNG at several times the size.
        image.convert("L").save(target / f"{source.stem}.jpg", "JPEG", quality=90, optimize=True)
    return target


def print_document(book: dict, images: Path) -> str:
    """One HTML document for the PDF: title page, colophon, contents, then every chapter."""
    parts = []
    entries = [("about", "", "关于这本书", book["front"])]
    entries += [(f"ch-{c['slug']}", c["label"], c["title"], c["file"]) for c in book["chapters"]]
    entries += [("authors", "", "关于作者", book["back"])]
    toc = []
    for anchor, label, title, file in entries:
        heading, original, body = split_chapter((SRC / "chapters" / file).read_text(encoding="utf-8"))
        body = pandoc(body, f"--id-prefix={anchor}-")
        body = re.sub(r'src="images/([\w.-]+)\.png"', lambda m: f'src="{images.as_uri()}/{m.group(1)}.jpg"', body)
        orig = f'<p class="orig">对应原书 {html.escape(original)}</p>' if original else ""
        parts.append(f'<section class="chapter" id="{anchor}"><h1>{html.escape(heading)}</h1>{orig}{body}</section>')
        number = label if label and label != title else ""
        toc.append(f'<li><a href="#{anchor}"><span class="n">{html.escape(number)}</span>{html.escape(title)}</a></li>')
    authors = "<br>".join(html.escape(author) for author in book["authors"])
    colophon = "".join(f"<p>{html.escape(line)}</p>" for line in colophon_lines(book))
    return f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>{html.escape(book['title'])} {book['edition']}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700;900&display=block" rel="stylesheet">
<link rel="stylesheet" href="{(SRC / 'styles/print.css').as_uri()}"></head>
<body>
<section class="title-page"><p class="kicker">免费电子书 · lizheng.ai</p><p class="book-title">{html.escape(book['title'])}</p>
<p class="edition">{book['edition']}</p><p class="subtitle">{html.escape(book['subtitle'])}</p><p class="authors">{authors}</p></section>
<section class="colophon">{colophon}</section>
<nav class="toc"><h2>目录</h2><ol>{''.join(toc)}</ol></nav>
{''.join(parts)}
</body></html>
"""


def build_pdf(book: dict, cover: Path, work: Path) -> Path:
    (work / "print.html").write_text(print_document(book, print_figures(work)), encoding="utf-8")
    (work / "cover-page.html").write_text(
        f'<!doctype html><html><body style="margin:0"><img src="{cover.as_uri()}" '
        'style="display:block;width:140mm;height:210mm;object-fit:cover"></body></html>', encoding="utf-8")
    run_render("pdf", str(work / "cover-page.html"), str(work / "cover.pdf"), "--cover")
    run_render("pdf", str(work / "print.html"), str(work / "body.pdf"))
    writer = PdfWriter()
    writer.append(PdfReader(str(work / "cover.pdf")))
    writer.append(PdfReader(str(work / "body.pdf")), import_outline=True)
    writer.add_metadata({"/Title": f"{book['title']} {book['edition']}", "/Author": "、".join(book["authors"]),
                         "/Subject": book["subtitle"], "/Creator": "lizheng.ai"})
    out = PUBLIC / book["files"]["pdf"]
    with out.open("wb") as handle:
        writer.write(handle)
    return out


def main() -> None:
    book = load_book()
    PUBLIC.mkdir(parents=True, exist_ok=True)
    OUT_HTML.mkdir(parents=True, exist_ok=True)

    sources = {"about": book["front"], "authors": book["back"]}
    sources.update({chapter["slug"]: chapter["file"] for chapter in book["chapters"]})
    texts = {slug: (SRC / "chapters" / file).read_text(encoding="utf-8") for slug, file in sources.items()}

    for chapter in book["chapters"]:
        heading = split_chapter(texts[chapter["slug"]])[0]
        expected = chapter["title"] if chapter["label"] == chapter["title"] else f"{chapter['label']}{SEP}{chapter['title']}"
        if heading != expected:
            raise SystemExit(f"{chapter['file']}: H1 「{heading}」 does not match book.json 「{expected}」")

    names = set()
    for text in texts.values():
        names.update(figure_names(text))
    missing = sorted(name for name in names if not (SRC / "images" / name).exists())
    if missing:
        raise SystemExit(f"missing figures: {missing}")
    sizes = web_figures(names)

    for stale in OUT_HTML.glob("*.html"):
        stale.unlink()
    for slug, text in texts.items():
        heading, original, body = split_chapter(text)
        (OUT_HTML / f"{slug}.html").write_text(web_body(body, sizes, book["path"]), encoding="utf-8")
        print(f"html  {slug:<10} {heading}")

    with tempfile.TemporaryDirectory() as temp:
        work = Path(temp)
        cover = render_cover(work)
        epub = build_epub(book, cover, work)
        pdf = build_pdf(book, cover, work)
    for path in (PUBLIC / "cover.jpg", PUBLIC / "og.jpg", epub, pdf):
        print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    sys.exit(main())
