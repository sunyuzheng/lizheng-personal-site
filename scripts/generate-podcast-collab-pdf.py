#!/usr/bin/env python3
"""Generate the Chinese podcast and video guest collaboration PDF."""

from __future__ import annotations

import hashlib
import re
import shutil
from pathlib import Path

from PIL import Image
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "client" / "public"
OUTPUT = PUBLIC / "collab" / "podcast-kit-zh.pdf"
BUSINESS_COPY = Path(
    "/Users/sunyuzheng/Desktop/superlinear/0-常用素材/播客与视频访谈资料.pdf"
)
IMAGE_CACHE = ROOT / "tmp" / "pdfs" / "image-cache"
TULONG_SCREENSHOT = ROOT / "scripts" / "assets" / "tulong-xiaohongshu-performance.png"

W, H = A4
M = 42

NAVY = HexColor("#0B0F1A")
NAVY_2 = HexColor("#111722")
NAVY_3 = HexColor("#171E2B")
PAPER = HexColor("#FBF9F5")
PAPER_2 = HexColor("#EDE7DA")
INK = HexColor("#17151D")
BODY = HexColor("#4B4238")
MUTED = HexColor("#777064")
WHITE = HexColor("#FFFFFF")
SOFT_WHITE = HexColor("#D9DCE3")
# Superlinear brand accents: light green on dark surfaces, deep green on paper.
ACCENT_ON_DARK = HexColor("#A4D9B5")
BRAND_DEEP = HexColor("#155D30")
BRAND = HexColor("#238343")
LINE_DARK = Color(1, 1, 1, alpha=0.12)
LINE_LIGHT = HexColor("#EDE7DA")

FONT_REGULAR = "HeitiLight"
FONT_BOLD = "HeitiMedium"
FONT_SERIF = "Songti"
FONT_MONO = "Courier"
FONT_MONO_BOLD = "Courier-Bold"

URL_COLLAB = "https://www.lizheng.ai/zh/collab/creators"
URL_ABOUT = "https://www.lizheng.ai/zh/about"
URL_HEADSHOT = "https://www.lizheng.ai/yuzheng-sun-headshot.jpg"
URL_CHATGPT = "https://www.superlinear.academy/c/ai-resources/chatgpt"
URL_PUBLIC_TRAINING = "https://www.superlinear.academy/c/public"
URL_KOJI = "https://www.xiaoyuzhoufm.com/episode/6a275ed57444b5722235a897"
URL_TULONG_BILI = "https://www.bilibili.com/video/BV1krM46BEpn"
URL_TULONG_YT = "https://youtu.be/vd_oYgwQSBM"
URL_TULONG_COMMENT = (
    "https://www.youtube.com/watch?v=vd_oYgwQSBM"
    "&lc=UgxFa4IYFTFcAJUFOsd4AaABAg"
)
URL_LIU_JIA_YT = "https://www.youtube.com/watch?v=-Et3GJRSI_0"
URL_LIU_JIA_BILI = "https://www.bilibili.com/video/BV1VvQ1BmE4T"
EMAIL = "yz@superlinear.academy"


def register_fonts() -> None:
    pdfmetrics.registerFont(
        TTFont(FONT_REGULAR, "/System/Library/Fonts/STHeiti Light.ttc")
    )
    pdfmetrics.registerFont(
        TTFont(FONT_BOLD, "/System/Library/Fonts/STHeiti Medium.ttc")
    )
    pdfmetrics.registerFont(
        TTFont(FONT_SERIF, "/System/Library/Fonts/Supplemental/Songti.ttc")
    )


def tokenize(text: str) -> list[str]:
    return re.findall(r"[A-Za-z0-9][A-Za-z0-9_+./:@-]*|\s+|.", text, re.S)


def wrap_text(text: str, font: str, size: float, width: float) -> list[str]:
    lines: list[str] = []
    current = ""
    for token in tokenize(text):
        if token.isspace():
            if current and not current.endswith(" "):
                current += " "
            continue
        candidate = current + token
        if pdfmetrics.stringWidth(candidate, font, size) <= width:
            current = candidate
            continue
        if current.strip():
            lines.append(current.rstrip())
            current = ""
        if pdfmetrics.stringWidth(token, font, size) <= width:
            current = token
            continue
        for char in token:
            candidate = current + char
            if current and pdfmetrics.stringWidth(candidate, font, size) > width:
                lines.append(current.rstrip())
                current = char
            else:
                current = candidate
    if current.strip():
        lines.append(current.rstrip())
    return lines


def draw_paragraph(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    font: str = FONT_REGULAR,
    size: float = 10,
    leading: float | None = None,
    color=BODY,
    max_lines: int | None = None,
) -> float:
    leading = leading or size * 1.55
    lines = wrap_text(text, font, size, width)
    if max_lines is not None:
        lines = lines[:max_lines]
    c.setFillColor(color)
    c.setFont(font, size)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_label(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    color=BRAND_DEEP,
    font: str = FONT_MONO_BOLD,
    size: float = 8.5,
) -> None:
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, text)


def prepared_image(
    path: Path,
    box: tuple[float, float, float, float],
    crop: tuple[int, int, int, int] | None = None,
    fit: str = "cover",
    scale: float = 2.25,
) -> Path:
    """Create a right-sized JPEG so the PDF remains easy to send by chat."""
    _, _, w, h = box
    target_w = max(1, int(w * scale))
    target_h = max(1, int(h * scale))
    cache_key = repr((path.resolve(), path.stat().st_mtime_ns, crop, fit, target_w, target_h))
    digest = hashlib.sha256(cache_key.encode("utf-8")).hexdigest()[:18]
    cached = IMAGE_CACHE / f"{digest}.jpg"
    if cached.exists():
        return cached

    image = Image.open(path).convert("RGB")
    if crop:
        image = image.crop(crop)
    target_ratio = w / h
    source_ratio = image.width / image.height
    if fit == "cover":
        if source_ratio > target_ratio:
            new_width = int(image.height * target_ratio)
            left = (image.width - new_width) // 2
            image = image.crop((left, 0, left + new_width, image.height))
        else:
            new_height = int(image.width / target_ratio)
            top = (image.height - new_height) // 2
            image = image.crop((0, top, image.width, top + new_height))
    if fit == "contain":
        background = Image.new("RGB", (target_w, target_h), (17, 23, 34))
        resize_scale = min(target_w / image.width, target_h / image.height)
        resized = image.resize(
            (
                max(1, int(image.width * resize_scale)),
                max(1, int(image.height * resize_scale)),
            ),
            Image.Resampling.LANCZOS,
        )
        background.paste(
            resized,
            ((target_w - resized.width) // 2, (target_h - resized.height) // 2),
        )
        image = background
    else:
        image = image.resize((target_w, target_h), Image.Resampling.LANCZOS)

    IMAGE_CACHE.mkdir(parents=True, exist_ok=True)
    image.save(cached, format="JPEG", quality=86, optimize=True, progressive=True)
    return cached


def draw_image(
    c: canvas.Canvas,
    path: Path,
    x: float,
    y: float,
    w: float,
    h: float,
    crop: tuple[int, int, int, int] | None = None,
    fit: str = "cover",
    radius: int = 28,
) -> None:
    prepared = prepared_image(path, (x, y, w, h), crop=crop, fit=fit)
    c.saveState()
    clip = c.beginPath()
    clip.roundRect(x, y, w, h, radius / 2)
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(
        ImageReader(str(prepared)),
        x,
        y,
        w,
        h,
        mask="auto",
        preserveAspectRatio=False,
    )
    c.restoreState()


def draw_qr(c: canvas.Canvas, url: str, x: float, y: float, size: float) -> None:
    c.setFillColor(WHITE)
    c.roundRect(x - 5, y - 5, size + 10, size + 10, 7, fill=1, stroke=0)
    widget = qr.QrCodeWidget(url)
    bounds = widget.getBounds()
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    drawing = Drawing(
        size,
        size,
        transform=[size / width, 0, 0, size / height, 0, 0],
    )
    drawing.add(widget)
    renderPDF.draw(drawing, c, x, y)
    c.linkURL(url, (x - 5, y - 5, x + size + 5, y + size + 5), relative=0)


def draw_footer(c: canvas.Canvas, page: int, dark: bool = False) -> None:
    color = Color(1, 1, 1, alpha=0.42) if dark else MUTED
    c.setFillColor(color)
    c.setFont(FONT_REGULAR, 7.2)
    c.drawString(M, 24, "课代表立正 · 播客与视频访谈资料 · 2026.08")
    c.setFont(FONT_MONO, 7.2)
    c.drawRightString(W - M, 24, f"{page:02d} / 06")


def draw_metric(
    c: canvas.Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    value: str,
    label: str,
    signal: str,
    dark: bool,
) -> None:
    if dark:
        c.setFillColor(NAVY_2)
        c.setStrokeColor(Color(1, 1, 1, alpha=0.13))
        value_color, label_color, signal_color = WHITE, SOFT_WHITE, ACCENT_ON_DARK
    else:
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE_LIGHT)
        value_color, label_color, signal_color = INK, BODY, BRAND_DEEP
    c.roundRect(x, y, w, h, 9, fill=1, stroke=1)
    c.setFillColor(value_color)
    c.setFont(FONT_BOLD, 20)
    c.drawString(x + 12, y + h - 28, value)
    c.setFillColor(label_color)
    c.setFont(FONT_REGULAR, 8.5)
    c.drawString(x + 12, y + h - 45, label)
    c.setFillColor(signal_color)
    c.setFont(FONT_BOLD, 7.4)
    c.drawString(x + 12, y + 10, signal)


def draw_cover(c: canvas.Canvas) -> None:
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(BRAND)
    c.rect(M, H - 54, 34, 3, fill=1, stroke=0)
    draw_label(
        c,
        "PODCAST · VIDEO · LONG-FORM",
        M + 44,
        H - 57,
        color=ACCENT_ON_DARK,
        size=8,
    )
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 31)
    c.drawString(M, H - 112, "把一个真问题聊透，")
    c.drawString(M, H - 151, "也让它走得更远。")
    c.setFillColor(SOFT_WHITE)
    draw_paragraph(
        c,
        "你定问题。他带着亲历、证据和一个经得起追问的判断来。节目照你原本的方式做；双方愿意时，也可以一起剪辑、切片、跨平台分发和联合发布。",
        M,
        H - 181,
        W - 2 * M,
        size=9.4,
        leading=15,
        color=SOFT_WHITE,
        max_lines=3,
    )

    value_y, value_h = 551, 67
    c.setFillColor(Color(1, 1, 1, alpha=0.055))
    c.rect(M, value_y, W - 2 * M, value_h, fill=1, stroke=0)
    values = [
        ("少见的经历", "研究·大厂·创业·教育"),
        ("经得起追问", "观点、证据与反方"),
        ("音视频都成立", "长对话与短切片"),
        ("可以一起放大", "剪辑·分发·联合发布"),
    ]
    value_w = (W - 2 * M) / 4
    for index, (title, detail) in enumerate(values):
        x = M + index * value_w
        if index:
            c.setStrokeColor(Color(1, 1, 1, alpha=0.13))
            c.line(x, value_y + 13, x, value_y + value_h - 13)
        c.setFillColor(ACCENT_ON_DARK)
        c.setFont(FONT_BOLD, 8.3)
        c.drawString(x + 12, value_y + 39, title)
        c.setFillColor(SOFT_WHITE)
        c.setFont(FONT_REGULAR, 7.1)
        c.drawString(x + 12, value_y + 20, detail)

    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 7.8)
    c.drawString(
        M,
        532,
        "Cornell经济学博士 · Amazon · Meta · 腾讯 · Statsig早期成员（公司后被OpenAI收购）",
    )
    c.drawRightString(
        W - M,
        517,
        "200+场公开对谈 · 全网40万+关注者 · 截至2026.08",
    )

    image_y, image_h = 108, 400
    draw_image(
        c,
        PUBLIC / "hero" / "acquired-behind-scenes-desktop.webp",
        M,
        image_y,
        W - 2 * M,
        image_h,
        fit="cover",
        radius=34,
    )
    c.setFillColor(Color(0.04, 0.06, 0.10, alpha=0.84))
    c.roundRect(M + 16, image_y + 16, 340, 42, 8, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 8.8)
    c.drawString(M + 28, image_y + 40, "与Acquired主播Ben Gilbert、David Rosenthal对谈")
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 7.8)
    c.drawString(M + 28, image_y + 25, "Significance Summit")
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 10.5)
    c.drawRightString(W - M, 94, "学点真本事，做点真东西。")
    c.setFillColor(ACCENT_ON_DARK)
    c.setFont(FONT_MONO_BOLD, 7.2)
    c.drawRightString(W - M, 77, "MAKE WHAT LASTS. · lizheng.ai")
    c.linkURL("https://www.lizheng.ai", (W - 200, 66, W - M, 104), relative=0)
    c.setFillColor(Color(1, 1, 1, alpha=0.52))
    c.setFont(FONT_MONO, 7.5)
    c.drawString(M, 77, "SEATTLE · MANDARIN / ENGLISH · REMOTE / IN PERSON")


def draw_background_page(c: canvas.Canvas, page: int) -> None:
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_label(c, "01 / WHY THIS CONVERSATION", M, H - 50)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 27)
    c.drawString(M, H - 91, "这些问题，他在不止一个位置上处理过。")
    draw_paragraph(
        c,
        "他做过经济学家、数据科学家、大厂管理者和早期创业团队成员，也长期在课堂、企业和公开对谈中检验这些判断。因此同一个AI问题，他能同时谈机制、组织、产品和个人选择。",
        M,
        H - 122,
        W - 2 * M,
        size=10.5,
        leading=17,
        color=BODY,
    )

    timeline_x = M + 8
    timeline_top = 614
    timeline = [
        ("Cornell", "经济学博士"),
        ("Amazon", "经济学家"),
        ("Meta", "数据科学家"),
        ("腾讯IEG", "数据与AI副总监·30人团队·连续两期最高绩效"),
        ("Statsig", "早期成员·公司后被OpenAI收购"),
        ("现在", "Superlinear Academy创始人"),
    ]
    c.setStrokeColor(HexColor("#BDB5A9"))
    c.setLineWidth(1)
    c.line(timeline_x + 5, timeline_top - 8, timeline_x + 5, timeline_top - 211)
    for index, (org, role) in enumerate(timeline):
        y = timeline_top - index * 40
        c.setFillColor(BRAND_DEEP if index < 5 else BRAND)
        c.circle(timeline_x + 5, y - 5, 4, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 10)
        c.drawString(timeline_x + 20, y, org)
        c.setFillColor(BODY)
        c.setFont(FONT_REGULAR, 8.5)
        c.drawString(timeline_x + 20, y - 15, role)

    panel_x, panel_y, panel_w, panel_h = 343, 395, 210, 245
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE_LIGHT)
    c.roundRect(panel_x, panel_y, panel_w, panel_h, 12, fill=1, stroke=1)
    draw_label(
        c,
        "节目里，可以继续往下问",
        panel_x + 15,
        panel_y + panel_h - 27,
        color=BRAND_DEEP,
        font=FONT_BOLD,
        size=8.3,
    )
    c.setStrokeColor(LINE_LIGHT)
    c.line(
        panel_x + 15,
        panel_y + panel_h - 42,
        panel_x + panel_w - 15,
        panel_y + panel_h - 42,
    )
    lenses = [
        ("01", "机制", "明明都很理性，为什么结果还是坏的？"),
        ("02", "产品", "技术能做了，为什么公司还是用不起来？"),
        ("03", "组织", "数据在纠错，还是在替错误辩护？"),
        ("04", "个人", "AI越强，人该把什么练得更深？"),
    ]
    row_y = panel_y + panel_h - 65
    for index, (number, lens, question) in enumerate(lenses):
        if index:
            c.setStrokeColor(HexColor("#E3DFD6"))
            c.line(
                panel_x + 15,
                row_y + 13,
                panel_x + panel_w - 15,
                row_y + 13,
            )
        c.setFillColor(BRAND_DEEP)
        c.setFont(FONT_MONO_BOLD, 7.2)
        c.drawString(panel_x + 15, row_y, number)
        c.setFont(FONT_BOLD, 8.4)
        c.drawString(panel_x + 42, row_y, lens)
        draw_paragraph(
            c,
            question,
            panel_x + 42,
            row_y - 15,
            panel_w - 57,
            size=8.2,
            leading=11.5,
            color=BODY,
            max_lines=2,
        )
        row_y -= 45

    box_y, box_h = 117, 245
    c.setFillColor(INK)
    c.roundRect(M, box_y, W - 2 * M, box_h, 12, fill=1, stroke=0)
    draw_label(
        c,
        "2023.02 · GPT-4发布前 · 一条可检查的判断",
        M + 18,
        box_y + box_h - 26,
        color=ACCENT_ON_DARK,
        font=FONT_BOLD,
        size=8,
    )
    draw_paragraph(
        c,
        "“ChatGPT是‘自然语言计算机’，是人类调用数据与算力的近乎完美的形态。”",
        M + 18,
        box_y + box_h - 55,
        375,
        font=FONT_BOLD,
        size=12,
        leading=18,
        color=WHITE,
    )
    draw_paragraph(
        c,
        "同一篇文章还给出“每个人的数字学徒”“把编程提效十倍”“替我打工”等两年推演，并为每项标出概率。后来的复盘也保留了判断错误。",
        M + 18,
        box_y + box_h - 116,
        375,
        size=8.6,
        leading=14,
        color=SOFT_WHITE,
    )
    draw_qr(c, URL_CHATGPT, W - M - 70, box_y + 131, 55)
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 7.5)
    c.drawCentredString(W - M - 42.5, box_y + 118, "扫码读原文与复盘")
    c.linkURL(URL_CHATGPT, (M + 10, box_y + 98, W - M, box_y + box_h), relative=0)

    c.setStrokeColor(Color(1, 1, 1, alpha=0.14))
    c.line(M + 18, box_y + 74, W - M - 18, box_y + 74)
    draw_label(
        c,
        "STRONG OPINIONS, WEAKLY HELD",
        M + 18,
        box_y + 52,
        color=ACCENT_ON_DARK,
        size=7.7,
    )
    draw_paragraph(
        c,
        "观点会讲清，也会说明什么证据能推翻它。好的追问，真的可能改变他的判断。",
        M + 18,
        box_y + 29,
        W - 2 * M - 36,
        font=FONT_BOLD,
        size=9.6,
        leading=14,
        color=WHITE,
    )
    draw_footer(c, page)


def draw_koji_page(c: canvas.Canvas, page: int) -> None:
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_label(c, "02 / CASE STUDY · KOJI · REMOTE", M, H - 50, color=ACCENT_ON_DARK)
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 27)
    c.drawString(M, H - 91, "一场好对话，不只活在上线那天。")
    c.setFont(FONT_BOLD, 19)
    c.drawString(M, H - 120, "长音频有人听完，换成短视频也有人收藏、转发。")
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 9.5)
    c.drawString(M, H - 146, "《十字路口Crossing》×课代表立正")

    metrics = [
        ("6.7万", "小宇宙播放", "该节目播放量前二*"),
        ("1.2万", "抖音点赞", "账号历史最高*"),
        ("8,343", "小红书收藏", "账号年度最高*"),
        ("6,502", "视频号转发", "跨平台高转发"),
    ]
    metric_gap = 8
    metric_w = (W - 2 * M - 3 * metric_gap) / 4
    for index, metric in enumerate(metrics):
        draw_metric(
            c,
            M + index * (metric_w + metric_gap),
            590,
            metric_w,
            92,
            *metric,
            dark=True,
        )

    evidence_y, evidence_h = 236, 322
    images = [
        PUBLIC / "collab" / "creator-proof" / "koji-xiaohongshu.webp",
        PUBLIC / "collab" / "creator-proof" / "koji-douyin.webp",
    ]
    image_w = 145
    image_h = 258
    image_y = evidence_y + 32
    for index, path in enumerate(images):
        draw_image(
            c,
            path,
            M + index * (image_w + 10),
            image_y,
            image_w,
            image_h,
            fit="cover",
            radius=18,
        )

    panel_x = M + 2 * (image_w + 10) + 4
    panel_w = W - M - panel_x
    c.setFillColor(NAVY_2)
    c.setStrokeColor(Color(1, 1, 1, alpha=0.12))
    c.roundRect(panel_x, evidence_y, panel_w, evidence_h, 12, fill=1, stroke=1)
    draw_image(
        c,
        PUBLIC / "collab" / "creator-proof" / "koji-xiaoyuzhou.webp",
        panel_x + 12,
        evidence_y + evidence_h - 86,
        panel_w - 24,
        65,
        fit="contain",
        radius=12,
    )
    draw_paragraph(
        c,
        "同一场对话，在小宇宙有人完整听完。到了抖音、小红书和视频号，又有人收藏、转发。平台变了，内容仍然成立。",
        panel_x + 14,
        evidence_y + evidence_h - 112,
        panel_w - 28,
        font=FONT_BOLD,
        size=9.4,
        leading=16,
        color=WHITE,
    )
    draw_paragraph(
        c,
        "远程录了63分钟，Koji团队完成全部制作和发布。立正的账号没有联发，因此这组数据更接近题目和对话本身的表现。",
        panel_x + 14,
        evidence_y + 148,
        panel_w - 28,
        size=8.3,
        leading=14,
        color=SOFT_WHITE,
    )
    draw_qr(c, URL_KOJI, panel_x + 14, evidence_y + 25, 54)
    c.setFillColor(ACCENT_ON_DARK)
    c.setFont(FONT_BOLD, 8.2)
    c.drawString(panel_x + 80, evidence_y + 62, "去小宇宙听完整节目")
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 7.2)
    c.drawString(panel_x + 80, evidence_y + 46, "远程录制 · 63分钟")
    c.linkURL(URL_KOJI, (panel_x + 75, evidence_y + 36, W - M, evidence_y + 80))

    c.setFillColor(Color(1, 1, 1, alpha=0.08))
    c.roundRect(M, 94, W - 2 * M, 112, 10, fill=1, stroke=0)
    draw_label(c, "听众反馈", M + 16, 176, color=ACCENT_ON_DARK, font=FONT_BOLD)
    draw_paragraph(
        c,
        "“很有帮助的一期，最近正在从ChatGPT转Codex，也在积累上下文。”",
        M + 16,
        151,
        W - 2 * M - 32,
        font=FONT_SERIF,
        size=11.5,
        leading=19,
        color=WHITE,
    )
    c.setFillColor(Color(1, 1, 1, alpha=0.48))
    c.setFont(FONT_REGULAR, 7.4)
    c.drawString(
        M,
        69,
        "数据核对至2026-07-22；*播放排名、账号历史/年度最高据合作方提供的账号数据。平台口径不同。",
    )
    draw_footer(c, page, dark=True)


def draw_tulong_page(c: canvas.Canvas, page: int) -> None:
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_label(c, "03 / CASE STUDY · TULONG", M, H - 50)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 27)
    c.drawString(M, H - 91, "在小红书破圈，")
    c.drawString(M, H - 125, "也让YouTube的新观众认识屠龙。")
    c.setFillColor(BODY)
    c.setFont(FONT_REGULAR, 9.5)
    c.drawString(M, H - 153, "屠龙×课代表立正｜一次录制，两套编辑判断，多平台分发")

    metrics = [
        ("5.87万", "小红书点赞", "联合发布"),
        ("5.96万", "小红书收藏", "收藏高于点赞"),
        ("11万+", "YouTube观看", "新观众"),
        ("10.8万+", "B站播放", "长视频承接"),
    ]
    metric_gap = 8
    metric_w = (W - 2 * M - 3 * metric_gap) / 4
    for index, metric in enumerate(metrics):
        draw_metric(
            c,
            M + index * (metric_w + metric_gap),
            577,
            metric_w,
            88,
            *metric,
            dark=False,
        )

    phone_x, phone_y, phone_w, phone_h = 339, 94, 214, 466
    draw_image(
        c,
        TULONG_SCREENSHOT,
        phone_x,
        phone_y,
        phone_w,
        phone_h,
        fit="contain",
        radius=24,
    )

    left_x, left_w = M, 272
    draw_label(c, "同一场录制，多种内容形态", left_x, 548, color=BRAND_DEEP, font=FONT_BOLD)
    draw_paragraph(
        c,
        "屠龙团队保留自己的节目语言；立正团队再做长版和切片，分别发布到小红书、YouTube、B站和社区，让同一场对话在不同平台各自找到合适的形态。",
        left_x,
        521,
        left_w,
        size=10,
        leading=17,
        color=BODY,
    )

    c.setFillColor(INK)
    c.roundRect(left_x, 326, left_w, 105, 10, fill=1, stroke=0)
    draw_label(c, "三个平台，各自成立", left_x + 15, 406, color=ACCENT_ON_DARK, font=FONT_BOLD)
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 13)
    c.drawString(left_x + 15, 377, "YouTube11万+观看·3,600赞")
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 8.5)
    c.drawString(left_x + 15, 353, "小红书1.13万转发·1,088条评论")
    c.drawString(left_x + 15, 336, "B站10.8万+播放·8,026收藏")

    c.setFillColor(HexColor("#E8EFE5"))
    c.setStrokeColor(BRAND)
    c.roundRect(left_x, 199, left_w, 106, 10, fill=1, stroke=1)
    c.setFillColor(BRAND_DEEP)
    c.setFont(FONT_BOLD, 12)
    c.drawString(left_x + 15, 277, "新观众真的认识了她")
    draw_paragraph(
        c,
        "“之前並不認識這位女士，但她太酷了！希望能每年都和她聊一下一年的回顧和明年的展望，想窺視她的思想變化。”——YouTube观众",
        left_x + 15,
        254,
        left_w - 30,
        size=8.2,
        leading=13,
        color=BODY,
    )
    c.linkURL(URL_TULONG_COMMENT, (left_x, 199, left_x + left_w, 305), relative=0)

    draw_qr(c, URL_TULONG_YT, left_x, 102, 63)
    c.setFillColor(BRAND_DEEP)
    c.setFont(FONT_BOLD, 8.5)
    c.drawString(left_x + 79, 145, "看YouTube完整正片与评论")
    c.linkURL(URL_TULONG_YT, (left_x + 75, 135, left_x + 220, 157), relative=0)
    c.setFillColor(MUTED)
    c.setFont(FONT_REGULAR, 7.8)
    c.drawString(left_x + 79, 126, "B站正片也已10万+播放")
    c.linkURL(URL_TULONG_BILI, (left_x + 75, 114, left_x + 205, 137), relative=0)

    c.setFillColor(MUTED)
    c.setFont(FONT_REGULAR, 7.3)
    c.drawString(M, 72, "数据核对至2026-07-31；各平台统计口径不同。")
    draw_footer(c, page)


def draw_questions_page(c: canvas.Canvas, page: int) -> None:
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_label(c, "04 / EDITORIAL DIRECTIONS", M, H - 50)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 27)
    c.drawString(M, H - 91, "三个方向，选一个问题聊透。")
    c.setFillColor(BODY)
    c.setFont(FONT_REGULAR, 10)
    c.drawString(M, H - 118, "母题提供入口；真正的节目，从主持人的观众和问题出发。")

    topics = [
        (
            "方向一",
            "AI把“能做”变便宜以后，为什么更需要代表作？",
            "合格的第一版越来越多，真正稀缺的会转向选什么、做到什么程度、愿意为哪一种后果负责。",
            "适合：职业·个人成长·创作者·泛科技节目",
        ),
        (
            "方向二",
            "AI会消灭fake work，还是让fake work多到看不完？",
            "AI既能减少工作与结果之间的摩擦，也能更便宜地制造汇报、会议纪要和忙碌痕迹。组织该看什么？",
            "适合：管理·组织·商业·职业节目",
        ),
        (
            "方向三",
            "会用AI，和成为AI-native的人，中间差什么？",
            "工具熟练度只是表面。更深的变化，是从结果出发重算整套工作，和AI一起积累长期context，并继续为结果负责。",
            "适合：产品·企业·技术·AI节目",
        ),
    ]
    card_y = [568, 431, 294]
    card_h = 119
    for index, ((label, title, detail, fit), y) in enumerate(zip(topics, card_y), 1):
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE_LIGHT)
        c.roundRect(M, y, W - 2 * M, card_h, 11, fill=1, stroke=1)
        draw_label(c, label, M + 16, y + card_h - 24, color=BRAND_DEEP, font=FONT_BOLD)
        title_bottom = draw_paragraph(
            c,
            title,
            M + 16,
            y + card_h - 48,
            W - 2 * M - 32,
            font=FONT_BOLD,
            size=12.5,
            leading=17,
            color=INK,
            max_lines=2,
        )
        draw_paragraph(
            c,
            detail,
            M + 16,
            title_bottom - 4,
            W - 2 * M - 32,
            size=8.6,
            leading=13,
            color=BODY,
            max_lines=2,
        )
        c.setFillColor(BRAND_DEEP)
        c.setFont(FONT_BOLD, 7.6)
        c.drawString(M + 16, y + 14, fit)

    proof_y, proof_h = 68, 202
    c.setFillColor(INK)
    c.roundRect(M, proof_y, W - 2 * M, proof_h, 12, fill=1, stroke=0)
    draw_label(c, "这些问题一直在真实工作里接受检验", M + 16, proof_y + proof_h - 26, color=ACCENT_ON_DARK, font=FONT_BOLD)
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 15)
    c.drawString(M + 16, proof_y + proof_h - 53, "长期教学、企业现场与公开对话，持续给这些问题提供样本。")

    proof_metrics = [
        ("两年半·13期", "AI Builders持续迭代"),
        ("3,000+", "付费学员"),
        ("5.0/5", "Maven公开评分"),
    ]
    metric_y = proof_y + 77
    metric_w = 126
    for index, (value, label) in enumerate(proof_metrics):
        x = M + 16 + index * (metric_w + 8)
        c.setFillColor(NAVY_2)
        c.setStrokeColor(Color(1, 1, 1, alpha=0.13))
        c.roundRect(x, metric_y, metric_w, 58, 8, fill=1, stroke=1)
        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 13 if index == 0 else 17)
        c.drawString(x + 10, metric_y + 33, value)
        c.setFillColor(SOFT_WHITE)
        c.setFont(FONT_REGULAR, 7.3)
        c.drawString(x + 10, metric_y + 14, label)

    draw_qr(c, URL_PUBLIC_TRAINING, W - M - 58, proof_y + 78, 46)
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 8.2)
    c.drawString(M + 16, proof_y + 48, "企业现场：腾讯 · 小红书 · 美团 · DoorDash；三场培训实录公开可看")
    c.linkURL(URL_PUBLIC_TRAINING, (M + 12, proof_y + 36, W - M - 72, proof_y + 61), relative=0)
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 7.8)
    c.drawString(M + 16, proof_y + 25, "主持样本：与刘嘉教授近3小时对谈；YouTube剪辑版13万+观看")
    c.linkURL(URL_LIU_JIA_YT, (M + 12, proof_y + 13, W - M - 72, proof_y + 36), relative=0)
    draw_footer(c, page)


def draw_host_kit(c: canvas.Canvas, page: int) -> None:
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_label(c, "05 / HOST KIT & CONTACT", M, H - 50)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 27)
    c.drawString(M, H - 91, "问题值得聊透，录制就可以很简单。")

    draw_image(
        c,
        PUBLIC / "yuzheng-sun-headshot.jpg",
        M,
        520,
        165,
        190,
        fit="cover",
        radius=26,
    )
    c.linkURL(URL_HEADSHOT, (M, 520, M + 165, 710), relative=0)
    draw_label(c, "主持人可直接使用的短介绍", 228, 697, color=BRAND_DEEP, font=FONT_BOLD)
    draw_paragraph(
        c,
        "孙煜征（课代表立正），康奈尔大学经济学博士、Superlinear Academy创始人。曾任Amazon经济学家、Meta数据科学家、腾讯IEG数据与AI副总监，也是Statsig早期成员；Statsig后被OpenAI收购。他长期研究AI进入真实工作以后，什么能力和作品反而更重要。",
        228,
        668,
        W - M - 228,
        size=9.4,
        leading=16,
        color=BODY,
    )
    c.setFillColor(BRAND_DEEP)
    c.setFont(FONT_BOLD, 8)
    c.drawString(228, 548, "完整履历与高清头像")
    c.linkURL(URL_ABOUT, (225, 535, 345, 563), relative=0)
    c.setFillColor(MUTED)
    c.setFont(FONT_REGULAR, 7.5)
    c.drawString(228, 531, "lizheng.ai/zh/about")

    logistics = [
        ("语言", "中文或英文"),
        ("形式", "远程或西雅图线下"),
        ("时长", "通常60–120分钟"),
        ("时区", "美国太平洋时间"),
    ]
    gap = 8
    card_w = (W - 2 * M - 3 * gap) / 4
    for index, (label, value) in enumerate(logistics):
        x = M + index * (card_w + gap)
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE_LIGHT)
        c.roundRect(x, 432, card_w, 65, 9, fill=1, stroke=1)
        c.setFillColor(BRAND_DEEP)
        c.setFont(FONT_BOLD, 7.4)
        c.drawString(x + 11, 476, label)
        draw_paragraph(
            c,
            value,
            x + 11,
            455,
            card_w - 22,
            font=FONT_BOLD,
            size=8.3,
            leading=13,
            color=INK,
        )

    draw_label(
        c,
        "SUPERLINEAR ACADEMY · 做点真东西。",
        M,
        510,
        color=BRAND_DEEP,
        font=FONT_BOLD,
        size=8.5,
    )

    draw_label(c, "怎么一起录", M, 393, color=BRAND_DEEP, font=FONT_BOLD)
    principles = [
        "你定问题、节奏、标题和最终剪辑；通常不用提前给我完整问题清单，成片也不用给我审。",
        "我会准备原文、数据、案例和最强反方，但不背稿；事实、引述与合作边界可以发布前核对。",
        "如果双方都发，录前确认主版、剪辑责任、素材权限、切片和发布时间。",
    ]
    y = 364
    for index, text in enumerate(principles, 1):
        c.setFillColor(BRAND_DEEP)
        c.circle(M + 4, y + 2, 3, fill=1, stroke=0)
        draw_paragraph(
            c,
            text,
            M + 16,
            y + 6,
            W - 2 * M - 16,
            size=9.1,
            leading=15,
            color=BODY,
        )
        y -= 62

    contact_y, contact_h = 76, 142
    c.setFillColor(INK)
    c.roundRect(M, contact_y, W - 2 * M, contact_h, 13, fill=1, stroke=0)
    draw_label(c, "PROGRAM INVITATIONS", M + 18, contact_y + contact_h - 27, color=ACCENT_ON_DARK)
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 17)
    c.drawString(M + 18, contact_y + contact_h - 56, "如果你有一个值得聊透的问题，先发给我们。")
    draw_paragraph(
        c,
        "附上节目或频道链接、听众为什么会在意、想怎么录，以及大概时间。",
        M + 18,
        contact_y + contact_h - 80,
        340,
        size=8.5,
        leading=14,
        color=SOFT_WHITE,
    )
    c.setFillColor(ACCENT_ON_DARK)
    c.setFont(FONT_BOLD, 8.8)
    c.drawString(M + 18, contact_y + 27, "商务负责人：喵老师 · 微信：FM13870617")
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 7.6)
    c.drawString(M + 18, contact_y + 12, EMAIL)
    c.linkURL(f"mailto:{EMAIL}", (M + 15, contact_y + 5, M + 175, contact_y + 23))
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 7.6)
    c.drawString(M + 190, contact_y + 12, "creators.lizheng.ai")
    c.linkURL(URL_COLLAB, (M + 185, contact_y + 5, M + 305, contact_y + 23))
    draw_qr(c, URL_COLLAB, W - M - 83, contact_y + 28, 66)
    draw_footer(c, page)


def generate() -> Path:
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("课代表立正 - 播客与视频访谈资料")
    c.setAuthor("孙煜征（课代表立正）")
    c.setCreator("课代表立正 / Superlinear Academy")
    c.setSubject("Podcast and video guest collaboration kit")
    c.setKeywords(
        "课代表立正, 孙煜征, 播客, 视频访谈, 嘉宾资料, 学点真本事, 做点真东西, Make what lasts"
    )

    draw_cover(c)
    c.showPage()
    draw_background_page(c, 2)
    c.showPage()
    draw_koji_page(c, 3)
    c.showPage()
    draw_tulong_page(c, 4)
    c.showPage()
    draw_questions_page(c, 5)
    c.showPage()
    draw_host_kit(c, 6)
    c.save()
    BUSINESS_COPY.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OUTPUT, BUSINESS_COPY)
    return OUTPUT


if __name__ == "__main__":
    print(generate())
