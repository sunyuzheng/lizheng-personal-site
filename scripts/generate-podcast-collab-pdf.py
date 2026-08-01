#!/usr/bin/env python3
"""Generate the Chinese podcast and video guest collaboration PDF."""

from __future__ import annotations

import hashlib
import re
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
OUTPUT = ROOT / "output" / "pdf" / "课代表立正_播客与视频访谈资料_2026-07.pdf"
IMAGE_CACHE = ROOT / "tmp" / "pdfs" / "image-cache"
TULONG_SCREENSHOT = ROOT / "scripts" / "assets" / "tulong-xiaohongshu-performance.png"

W, H = A4
M = 42

NAVY = HexColor("#0B0F1A")
NAVY_2 = HexColor("#111722")
NAVY_3 = HexColor("#171E2B")
PAPER = HexColor("#F2F0EA")
PAPER_2 = HexColor("#E8E4DC")
INK = HexColor("#191712")
BODY = HexColor("#4D4941")
MUTED = HexColor("#777064")
WHITE = HexColor("#FFFFFF")
SOFT_WHITE = HexColor("#D9DCE3")
AMBER = HexColor("#FBBF24")
AMBER_DARK = HexColor("#8B4A19")
LINE_DARK = Color(1, 1, 1, alpha=0.12)
LINE_LIGHT = HexColor("#D4D0C7")

FONT_REGULAR = "HeitiLight"
FONT_BOLD = "HeitiMedium"
FONT_SERIF = "Songti"
FONT_MONO = "Courier"
FONT_MONO_BOLD = "Courier-Bold"

URL_COLLAB = "https://www.lizheng.ai/zh/collab/creators"
URL_ABOUT = "https://www.lizheng.ai/zh/about"
URL_HEADSHOT = "https://www.lizheng.ai/yuzheng-sun-headshot.jpg"
URL_GROWTH = "https://youtu.be/D_-hU1O7IVw"
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
    color=AMBER_DARK,
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
    c.drawString(M, 24, "课代表立正 · 播客与视频访谈资料 · 2026.07")
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
        value_color, label_color, signal_color = WHITE, SOFT_WHITE, AMBER
    else:
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE_LIGHT)
        value_color, label_color, signal_color = INK, BODY, AMBER_DARK
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
    c.setFillColor(AMBER)
    c.rect(M, H - 54, 34, 3, fill=1, stroke=0)
    draw_label(
        c,
        "PODCAST · VIDEO · LONG-FORM",
        M + 44,
        H - 57,
        color=AMBER,
        size=8,
    )
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 31)
    c.drawString(M, H - 112, "你定问题，")
    c.drawString(M, H - 151, "我带着判断和证据来。")
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 12)
    c.drawString(M, H - 188, "课代表立正（孙煜征）｜播客与视频访谈资料")

    proof_y = H - 232
    proofs = [
        "康奈尔大学经济学博士",
        "Amazon · Meta · 腾讯 · Statsig（后被OpenAI收购）",
        "200+场公开对谈 · 截至2026.07",
        "小红书 · YouTube · B站40万+关注者 · 截至2026.07",
    ]
    for index, text in enumerate(proofs):
        col = index % 2
        row = index // 2
        x = M + col * 255
        y = proof_y - row * 29
        c.setFillColor(AMBER)
        c.circle(x + 4, y + 3, 2.2, fill=1, stroke=0)
        c.setFillColor(SOFT_WHITE)
        c.setFont(FONT_REGULAR, 9.2)
        c.drawString(x + 13, y, text)

    image_y, image_h = 115, 420
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
    c.setFillColor(Color(1, 1, 1, alpha=0.52))
    c.setFont(FONT_MONO, 7.5)
    c.drawString(M, 75, "SEATTLE · MANDARIN / ENGLISH · REMOTE / IN PERSON")
    c.setFillColor(AMBER)
    c.setFont(FONT_BOLD, 8.5)
    c.drawRightString(W - M, 75, "lizheng.ai")
    c.linkURL("https://www.lizheng.ai", (W - 105, 65, W - M, 84), relative=0)


def draw_background_page(c: canvas.Canvas, page: int) -> None:
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_label(c, "01 / WHY THIS CONVERSATION", M, H - 50)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 27)
    c.drawString(M, H - 91, "这组经历，通常不在同一个嘉宾身上出现。")
    draw_paragraph(
        c,
        "我既做过研究，也在中美大厂和创业公司一线做过业务、产品，也带过团队。现在我关心的是：AI让第一版越来越容易以后，人和公司怎样判断什么值得做，再把它做成真正属于自己的作品。同一个问题，我能从机制讲到现场，也愿意把做错过的判断摆出来。",
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
        ("腾讯IEG", "数据与AI副总监"),
        ("Statsig", "Principal Data Scientist · 公司唯一布道师"),
        ("现在", "Superlinear Academy / AI Builders创始人"),
    ]
    c.setStrokeColor(HexColor("#BDB5A9"))
    c.setLineWidth(1)
    c.line(timeline_x + 5, timeline_top - 8, timeline_x + 5, timeline_top - 211)
    for index, (org, role) in enumerate(timeline):
        y = timeline_top - index * 40
        c.setFillColor(AMBER_DARK if index < 5 else AMBER)
        c.circle(timeline_x + 5, y - 5, 4, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 10)
        c.drawString(timeline_x + 20, y, org)
        c.setFillColor(BODY)
        c.setFont(FONT_REGULAR, 8.5)
        c.drawString(timeline_x + 20, y - 15, role)

    portrait_x, portrait_y, portrait_w, portrait_h = 343, 395, 210, 245
    draw_image(
        c,
        PUBLIC / "book" / "author.jpg",
        portrait_x,
        portrait_y,
        portrait_w,
        portrait_h,
        fit="cover",
        radius=26,
    )
    c.setFillColor(MUTED)
    c.setFont(FONT_REGULAR, 7.5)
    c.drawRightString(W - M, portrait_y - 13, "现居西雅图")

    box_y, box_h = 248, 112
    c.setFillColor(INK)
    c.roundRect(M, box_y, W - 2 * M, box_h, 12, fill=1, stroke=0)
    draw_label(
        c,
        "STRONG OPINIONS, WEAKLY HELD",
        M + 18,
        box_y + box_h - 26,
        color=AMBER,
        size=8,
    )
    draw_paragraph(
        c,
        "观点要讲得足够明确，理由和反方也都摆出来。一个好问题真能改变我的判断，我会很高兴。",
        M + 18,
        box_y + box_h - 51,
        352,
        font=FONT_BOLD,
        size=11,
        leading=18,
        color=WHITE,
    )
    draw_qr(c, URL_GROWTH, W - M - 70, box_y + 20, 55)
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 7.5)
    c.drawRightString(W - M - 82, box_y + 21, "Growth Mindset相关视频")
    c.linkURL(URL_GROWTH, (M, box_y, W - M, box_y + box_h), relative=0)

    draw_label(c, "三个常聊方向", M, 204, color=AMBER_DARK, font=FONT_BOLD)
    topics = [
        ("01", "AI怎样改变工作的价值"),
        ("02", "公司怎样知道判断对不对"),
        ("03", "从完成任务，到做出代表作"),
    ]
    gap = 9
    card_w = (W - 2 * M - 2 * gap) / 3
    for index, (number, title) in enumerate(topics):
        x = M + index * (card_w + gap)
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE_LIGHT)
        c.roundRect(x, 102, card_w, 82, 9, fill=1, stroke=1)
        c.setFillColor(AMBER_DARK)
        c.setFont(FONT_MONO_BOLD, 8)
        c.drawString(x + 12, 161, number)
        draw_paragraph(
            c,
            title,
            x + 12,
            140,
            card_w - 24,
            font=FONT_BOLD,
            size=10,
            leading=16,
            color=INK,
        )
    draw_footer(c, page)


def draw_koji_page(c: canvas.Canvas, page: int) -> None:
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_label(c, "02 / CASE STUDY · KOJI · REMOTE", M, H - 50, color=AMBER)
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
        "同一场对话，在小宇宙有人完整听完；换到抖音、小红书和视频号，又有人收藏、转发。平台变了，内容仍然成立。",
        panel_x + 14,
        evidence_y + evidence_h - 112,
        panel_w - 28,
        font=FONT_BOLD,
        size=10,
        leading=17,
        color=WHITE,
    )
    draw_paragraph(
        c,
        "一次简单的远程连线，由Koji团队独立制作发布。我的账号没有参与联合发布——这个小点说明，成绩首先来自嘉宾的稀缺背景和内容质量，而不是我的账号流量。",
        panel_x + 14,
        evidence_y + 148,
        panel_w - 28,
        size=8.3,
        leading=14,
        color=SOFT_WHITE,
    )
    draw_qr(c, URL_KOJI, panel_x + 14, evidence_y + 25, 54)
    c.setFillColor(AMBER)
    c.setFont(FONT_BOLD, 8.2)
    c.drawString(panel_x + 80, evidence_y + 62, "去小宇宙听完整节目")
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 7.2)
    c.drawString(panel_x + 80, evidence_y + 46, "远程录制 · 63分钟")
    c.linkURL(URL_KOJI, (panel_x + 75, evidence_y + 36, W - M, evidence_y + 80))

    c.setFillColor(Color(1, 1, 1, alpha=0.08))
    c.roundRect(M, 94, W - 2 * M, 112, 10, fill=1, stroke=0)
    draw_label(c, "听众反馈", M + 16, 176, color=AMBER, font=FONT_BOLD)
    draw_paragraph(
        c,
        "“很有帮助的一期，最近正在从chatgpt转codex，也在积累上下文～”",
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
    draw_label(c, "同一场录制，多种内容形态", left_x, 548, color=AMBER_DARK, font=FONT_BOLD)
    draw_paragraph(
        c,
        "屠龙团队保留自己的节目语言；我们另做长版与切片，分别放到小红书、YouTube、B站和社群。不是把同一个文件机械搬运，而是让一场好对话用不同形态继续走。",
        left_x,
        521,
        left_w,
        size=10,
        leading=17,
        color=BODY,
    )

    c.setFillColor(INK)
    c.roundRect(left_x, 326, left_w, 105, 10, fill=1, stroke=0)
    draw_label(c, "三个平台，各自成立", left_x + 15, 406, color=AMBER, font=FONT_BOLD)
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 13)
    c.drawString(left_x + 15, 377, "YouTube11万+观看·3,600赞")
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 8.5)
    c.drawString(left_x + 15, 353, "小红书1.13万转发·1,088条评论")
    c.drawString(left_x + 15, 336, "B站10.8万+播放·8,026收藏")

    c.setFillColor(HexColor("#FFF4D6"))
    c.setStrokeColor(HexColor("#E6C46B"))
    c.roundRect(left_x, 199, left_w, 106, 10, fill=1, stroke=1)
    c.setFillColor(AMBER_DARK)
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
    c.setFillColor(AMBER_DARK)
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
    c.drawString(M, H - 91, "为什么AI越强，代表作越重要？")
    c.setFillColor(BODY)
    c.setFont(FONT_REGULAR, 10)
    c.drawString(M, H - 118, "普通产出会越来越多；真正稀缺的，是你选择了什么，最后又做成了什么。")

    questions = [
        "AI让每个人都能快速做出第一版，为什么真正能代表一个人的作品反而更稀缺？",
        "如果每天都在高效交付，却没有一件东西真正属于自己，职业价值最后沉淀在哪里？",
        "追求代表作，会不会把人带回完美主义？怎样让作品尽早遇到现实？",
        "Amazon、Meta、腾讯和Statsig通常怎样做判断，又怎样把自己带偏？",
        "回头看过去公开做过的AI判断，哪些说对了，哪些现在需要重新判断？",
    ]
    y = 670
    for index, question in enumerate(questions, 1):
        c.setStrokeColor(LINE_LIGHT)
        c.line(M, y - 15, W - M, y - 15)
        c.setFillColor(AMBER_DARK)
        c.setFont(FONT_MONO_BOLD, 9)
        c.drawString(M, y - 42, f"{index:02d}")
        draw_paragraph(
            c,
            question,
            M + 38,
            y - 36,
            W - 2 * M - 38,
            font=FONT_BOLD,
            size=13,
            leading=20,
            color=INK,
        )
        y -= 82

    c.setFillColor(INK)
    c.roundRect(M, 126, W - 2 * M, 132, 12, fill=1, stroke=0)
    draw_label(c, "做客记录", M + 16, 229, color=AMBER, font=FONT_BOLD)
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 17)
    c.drawString(M + 16, 199, "目前核实到21档节目 · 23期")
    draw_paragraph(
        c,
        "硅谷101 · What’s Next科技早知道 · 十字路口Crossing · 屠龙大实话 · INDIGO TALK · 牛油果烤面包 · AI炼金术 · 创见",
        M + 16,
        173,
        350,
        size=8.5,
        leading=14,
        color=SOFT_WHITE,
    )
    c.setFillColor(AMBER)
    c.setFont(FONT_BOLD, 8)
    c.drawString(M + 16, 139, "INDIGO TALK与The Build Log均再次邀请")
    draw_qr(c, URL_COLLAB, W - M - 72, 151, 58)
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 7.2)
    c.drawRightString(W - M - 86, 139, "查看完整清单")
    c.linkURL(URL_COLLAB, (W - M - 175, 130, W - M - 82, 150), relative=0)

    c.setFillColor(HexColor("#E7E2D8"))
    c.roundRect(M, 68, W - 2 * M, 42, 9, fill=1, stroke=0)
    c.setFillColor(AMBER_DARK)
    c.setFont(FONT_BOLD, 8.5)
    c.drawString(M + 14, 91, "我也坐过桌子的另一边")
    c.setFillColor(BODY)
    c.setFont(FONT_REGULAR, 7.8)
    c.drawString(M + 143, 91, "刘嘉教授：YouTube剪辑版13万+观看；B站完整版2小时53分")
    c.linkURL(URL_LIU_JIA_YT, (M + 140, 80, M + 360, 104), relative=0)
    c.linkURL(URL_LIU_JIA_BILI, (M + 360, 80, W - M, 104), relative=0)
    draw_footer(c, page)


def draw_host_kit(c: canvas.Canvas, page: int) -> None:
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_label(c, "05 / HOST KIT & CONTACT", M, H - 50)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 27)
    c.drawString(M, H - 91, "如果问题合适，录制可以很简单。")

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
    draw_label(c, "主持人可直接使用的短介绍", 228, 697, color=AMBER_DARK, font=FONT_BOLD)
    draw_paragraph(
        c,
        "孙煜征（课代表立正），康奈尔大学经济学博士，Superlinear Academy与AI Builders创始人。曾在Amazon、Meta、腾讯和Statsig从事经济学、数据与AI工作；Statsig后来被OpenAI收购。他关注的是：AI让第一版越来越容易以后，我们怎样选对值得做的事，做出自己的代表作。",
        228,
        668,
        W - M - 228,
        size=9.4,
        leading=16,
        color=BODY,
    )
    c.setFillColor(AMBER_DARK)
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
        c.setFillColor(AMBER_DARK)
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
        "SUPERLINEAR ACADEMY · 做出你的代表作。",
        M,
        510,
        color=AMBER_DARK,
        font=FONT_BOLD,
        size=8.5,
    )

    draw_label(c, "怎么一起录", M, 393, color=AMBER_DARK, font=FONT_BOLD)
    principles = [
        "你定问题、节奏、标题和最终剪辑；通常不用提前给我完整问题清单，成片也不用给我审。",
        "我会准备原文、数据、案例和最强反方，但不背稿；事实、引述与合作边界可以发布前核对。",
        "如果双方都发，录前确认主版、剪辑责任、素材权限、切片和发布时间。",
    ]
    y = 364
    for index, text in enumerate(principles, 1):
        c.setFillColor(AMBER_DARK)
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
    draw_label(c, "PROGRAM INVITATIONS", M + 18, contact_y + contact_h - 27, color=AMBER)
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 17)
    c.drawString(M + 18, contact_y + contact_h - 56, "邮件里先告诉我们：你最想追问什么。")
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
    c.setFillColor(AMBER)
    c.setFont(FONT_BOLD, 10)
    c.drawString(M + 18, contact_y + 22, EMAIL)
    c.linkURL(f"mailto:{EMAIL}", (M + 15, contact_y + 10, M + 200, contact_y + 38))
    c.setFillColor(SOFT_WHITE)
    c.setFont(FONT_REGULAR, 7.6)
    c.drawString(M + 190, contact_y + 23, "lizheng.ai/zh/collab/creators")
    c.linkURL(URL_COLLAB, (M + 185, contact_y + 10, M + 370, contact_y + 38))
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
        "课代表立正, 孙煜征, 播客, 视频访谈, 嘉宾资料, 做出你的代表作, Make what lasts"
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
    return OUTPUT


if __name__ == "__main__":
    print(generate())
