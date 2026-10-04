#!/usr/bin/env python3
"""Build the Chinese editions of Yuzheng's Statsig blog posts for /writing/statsig.

The source is content/writing/statsig-blog-zh/: one Markdown file per post (YYYYMMDD-<slug>.md, opening
with the Chinese title and a list of 原文标题 / 原文链接 / 发布日期 / 作者 lines), images/<slug>/,
manifest.json (authors, original URLs and image sources) and collection.json (the page's own words,
one line per post, and the note shown above a co-written post or a recap). Run this locally after changing any of it:

    python3 scripts/writing/build_statsig_zh.py

It needs pandoc 3 and Pillow, and Node with Playwright for the share image (see scripts/books/render.mjs),
and writes

    content/writing/statsig-blog-zh/html/        each post's body, plus articles.json, which
                                                 scripts/writing-pages.ts wraps into pages during the build
    client/public/writing/statsig/               web images (WebP) and the share image

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

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "content/writing/statsig-blog-zh"
OUT_HTML = SRC / "html"
PUBLIC = ROOT / "client/public/writing/statsig"
RENDER = ROOT / "scripts/books/render.mjs"
WEB_WIDTH = 1400  # figures show at most 700 CSS pixels wide
YUZHENG = "yuzheng-sun"
HEADER_KEYS = ("原文标题", "原文链接", "发布日期", "作者", "合著说明", "说明")


def load_json(name: str) -> dict:
    return json.loads((SRC / name).read_text(encoding="utf-8"))


def split_post(text: str) -> tuple[str, dict[str, str], str]:
    """A post's H1, its header lines (原文标题, 原文链接, ...), and the body after them."""
    lines = text.rstrip("\n").split("\n")
    if not lines[0].startswith("# "):
        raise SystemExit("each post must start with an H1")
    title = lines[0][2:].strip()
    header: dict[str, str] = {}
    i = 1
    while i < len(lines) and not lines[i].strip():
        i += 1
    while i < len(lines) and lines[i].startswith("- "):
        key, _, value = lines[i][2:].partition("：")
        if key not in HEADER_KEYS:
            raise SystemExit(f"unexpected header line: {lines[i]}")
        header[key] = value.strip()
        i += 1
    for key in HEADER_KEYS[:4]:
        if key not in header:
            raise SystemExit(f"{title}: missing {key}")
    return title, header, "\n".join(lines[i:]).strip() + "\n"


def pandoc(markdown: str) -> str:
    run = subprocess.run(
        ["pandoc", "-f", "markdown", "-t", "html5", "--wrap=none", "--mathml"],
        input=markdown, capture_output=True, text=True, check=True,
    )
    return run.stdout


def web_image(slug: str, name: str) -> tuple[str, int, int]:
    """A WebP copy for the site; returns its path on the site and its size."""
    source = SRC / "images" / slug / name
    image = Image.open(source)
    image = image.convert("RGBA" if image.mode in ("RGBA", "LA", "P") else "RGB")
    if image.width > WEB_WIDTH:
        image = image.resize((WEB_WIDTH, round(image.height * WEB_WIDTH / image.width)), Image.LANCZOS)
    target = PUBLIC / "images" / slug
    target.mkdir(parents=True, exist_ok=True)
    out = target / f"{Path(name).stem}.webp"
    image.save(out, "WEBP", quality=82, method=6)
    return f"/writing/statsig/images/{slug}/{out.name}", image.width, image.height


def web_body(markdown: str, slug: str, used: set[str]) -> str:
    """A post body as the site shows it: WebP figures with their captions and sizes, scrollable tables."""
    body = pandoc(markdown)
    figure = re.compile(
        r'<figure>\s*<img src="images/([^"]+)" alt="([^"]*)" */?>\s*<figcaption[^>]*>.*?</figcaption>\s*</figure>\s*'
        r"<p><em>(.*?)</em></p>",
        re.S,
    )

    def replace(match: re.Match) -> str:
        rel, alt, caption = match.groups()
        folder, _, name = rel.partition("/")
        if folder != slug:
            raise SystemExit(f"{slug}: figure from another post's folder: {rel}")
        src, width, height = web_image(slug, name)
        used.add(name)
        return (f'<figure><img src="{src}" alt="{alt}" width="{width}" height="{height}" loading="lazy" decoding="async" />'
                f"<figcaption>{caption}</figcaption></figure>")

    body = figure.sub(replace, body)
    if "<figure>" in body.replace("<figure><img src=\"/writing/statsig/", ""):
        raise SystemExit(f"{slug}: a figure without its 图 caption line")
    body = body.replace("<table>", '<div class="table"><table>').replace("</table>", "</table></div>")
    return body.strip() + "\n"


def iso_date(value: str) -> str:
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        raise SystemExit(f"bad date {value}")
    return value


def build_posts() -> list[dict]:
    collection = load_json("collection.json")
    manifest = {article["slug"]: article for article in load_json("manifest.json")["articles"]}
    lines = {item["slug"]: item["description"] for item in collection["articles"]}
    site_notes = {item["slug"]: item["note"] for item in collection["articles"] if "note" in item}
    if set(lines) != set(manifest):
        raise SystemExit(f"collection.json and manifest.json list different posts: {set(lines) ^ set(manifest)}")
    OUT_HTML.mkdir(parents=True, exist_ok=True)
    for stale in OUT_HTML.glob("*.html"):
        stale.unlink()
    if (PUBLIC / "images").exists():
        shutil.rmtree(PUBLIC / "images")
    posts = []
    for slug, entry in sorted(manifest.items(), key=lambda kv: (kv[1]["published_date"], kv[0])):
        title, header, markdown = split_post((SRC / entry["file"]).read_text(encoding="utf-8"))
        if title != entry["title_zh"] or header["原文链接"] != entry["url"] or iso_date(header["发布日期"]) != entry["published_date"]:
            raise SystemExit(f"{slug}: the Markdown header and manifest.json disagree")
        used: set[str] = set()
        (OUT_HTML / f"{slug}.html").write_text(web_body(markdown, slug, used), encoding="utf-8")
        on_disk = {p.name for p in (SRC / "images" / slug).glob("*")} if (SRC / "images" / slug).exists() else set()
        if on_disk != used:
            raise SystemExit(f"{slug}: images not used or missing: {on_disk ^ used}")
        posts.append({
            "slug": slug,
            "title": title,
            "description": lines[slug],
            "originalTitle": header["原文标题"],
            "originalUrl": header["原文链接"],
            "date": header["发布日期"],
            "byline": header["作者"],
            # The page speaks in Yuzheng's voice; the archive's third-person note is the fallback.
            "notes": [site_notes[slug]] if slug in site_notes else [header[k] for k in ("合著说明", "说明") if k in header],
            "authors": [{"name": a["name"].replace(", PhD", ""), "role": a["role_on_page"], "yuzheng": a["is_yuzheng"]} for a in entry["authors"]],
            "coauthored": entry["coauthored"],
            "figures": len(used),
        })
    (OUT_HTML / "articles.json").write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return posts


def render_share_image(collection: dict, count: int) -> None:
    page = f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@500;700&family=Noto+Serif+SC:wght@900&display=block" rel="stylesheet">
<style>
html,body{{margin:0;padding:0}}body{{width:1200px;height:630px;overflow:hidden}}
.og{{width:1200px;height:630px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;padding:0 96px;color:#f8f1e4;
background:radial-gradient(110% 90% at 92% -10%,#1a5132 0%,rgb(26 81 50/0) 60%),linear-gradient(180deg,#0f3d23 0%,#0b2f1b 100%)}}
.kicker{{font:700 28px/1.4 "Noto Sans SC",sans-serif;color:#8fd6a9;letter-spacing:.04em}}
h1{{margin:26px 0 0;font:900 92px/1.15 "Noto Serif SC",serif;letter-spacing:.02em}}
.meta{{margin-top:34px;font:500 28px/1.6 "Noto Sans SC",sans-serif;color:rgb(248 241 228/.78)}}
</style></head><body><div class="og"><div class="kicker">{html.escape(collection['kicker'])} · {count}篇</div>
<h1>{html.escape(collection['title'])}</h1><div class="meta">A/B实验、统计与数据科学<br>孙煜征 · lizheng.ai</div></div>
<script>document.fonts.ready.then(()=>document.body.dataset.ready="1")</script></body></html>"""
    with tempfile.TemporaryDirectory() as tmp:
        source = Path(tmp) / "og.html"
        source.write_text(page, encoding="utf-8")
        png = Path(tmp) / "og.png"
        subprocess.run(["node", str(RENDER), "shot", str(source), str(png), "1200", "630"], check=True)
        Image.open(png).convert("RGB").save(PUBLIC / "og.jpg", "JPEG", quality=88, optimize=True, progressive=True)


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    posts = build_posts()
    if "--no-share-image" not in sys.argv:
        render_share_image(load_json("collection.json"), len(posts))
    figures = sum(post["figures"] for post in posts)
    print(f"{len(posts)} posts, {figures} figures → {OUT_HTML.relative_to(ROOT)} and {PUBLIC.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
