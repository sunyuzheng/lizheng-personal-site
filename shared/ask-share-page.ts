/**
 * The page of a shared answer at ask.lizheng.ai/s/<date>/<word> (shared/ask-share-link.ts): the
 * question and the answer as the asker saw them, never the situation they wrote, in the look of the
 * public answer pages (ask-public-page.ts). It is public and given to search engines, every one
 * (the owner's rule: what can be shared goes to search). Its link preview (WeChat, iMessage, Slack)
 * is the question, the opening of the answer and the 问问立正 card.
 *
 * Since 2026-10-13 (the owner: make the page simple and clear, so people want to share it) it opens
 * with its own address to copy, send or show as a QR code, under the question and again at the end,
 * and draws the answer map after the summary, its numbered lights opening the sources below, as on
 * ask.lizheng.ai. Without scripts it is the same page without the map and the buttons' work.
 *
 * The page lives on ask.lizheng.ai, where only the routes vercel.json names reach this site: its
 * fonts and scripts come from /s/ (fonts.css, page.js, share.js and the answer map's answer-map.js,
 * copied from ask-lizheng), the map's layout from /api/answer-map there, everything else by full address.
 */
import qrcode from "qrcode-generator";
import { ASK_APP, chineseDate, clip, escapeHtml, paragraphs, phrases, plainText, SITE_URL, sourceKind, STYLE, type PublicSource } from "./ask-public-page.js";
import { SEAL } from "./ask-seal.js";
import { sourceAttributionLabel } from "./ask-source-attribution.js";
import { SHARE_ORIGIN, shareUrl, type SharedAnswer } from "./ask-share-link.js";

export const SHARE_IMAGE = `${SITE_URL}/og/ask-share.jpg`;
export const SHARE_THUMB = `${SITE_URL}/og/ask-share-square.jpg`;
const PERSON_ID = `${SITE_URL}/#person`;
const PRIVACY = `${SITE_URL}/ask/privacy`;
const QUESTIONS = `${SITE_URL}/ask`;

// The share page's own additions to the public pages' look: the address to share (on the stage under
// the question, and on paper at the end), its QR code, and the answer map on the forest of the stage.
const SHARE_STYLE = `
.next .asks-title{margin-top:26px;font-size:14.5px;color:var(--muted)}
.next .asks-title+.asks{margin-top:10px}
.share-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.share-row button{display:inline-flex;align-items:center;min-height:40px;padding:0 16px;border:0;border-radius:10px;background:none;box-shadow:inset 0 0 0 1px var(--forest-rule);color:var(--on-forest);font:500 14.5px/1 var(--sans);cursor:pointer;transition:box-shadow .2s,background .2s}
.share-row button:hover{box-shadow:inset 0 0 0 1px var(--on-forest-2)}
.share-row .primary{background:var(--on-forest);color:var(--forest);font-weight:600;box-shadow:none}
.share-row .primary:hover{background:#fff;box-shadow:none}
.share-row [hidden]{display:none}
.share-wechat{align-self:center;font-size:13px;color:var(--on-forest-3)}.share-end .share-wechat{color:var(--muted)}
.share-end{margin-top:52px}
.share-end h2{font:700 19px/1.4 var(--serif);letter-spacing:.02em}
.share-end .url{display:inline-block;margin-top:8px;font-size:16px;font-weight:600;color:var(--green-text);overflow-wrap:anywhere}
.share-end .url:hover{text-decoration:underline;text-underline-offset:3px}
.share-end .share-row{margin-top:14px}
.share-end .share-row button{box-shadow:inset 0 0 0 1px var(--rule-2);color:var(--ink-2)}
.share-end .share-row button:hover{box-shadow:inset 0 0 0 1px var(--green);color:var(--green-text)}
.share-end .share-row .primary{background:none;color:var(--green-text);font-weight:600;box-shadow:inset 0 0 0 1px var(--green)}
.share-end .share-row .primary:hover{background:none;color:var(--green-deep);box-shadow:inset 0 0 0 1px var(--green-deep)}
.qr{width:min(92vw,340px);padding:28px 28px 22px;border:0;border-radius:14px;background:var(--paper);color:var(--ink);text-align:center;box-shadow:0 24px 70px rgb(0 0 0/.3)}
.qr::backdrop{background:rgb(11 47 27/.6)}
.qr .code{width:220px;height:220px;margin:0 auto;padding:6px;border-radius:10px;background:#fff;box-shadow:inset 0 0 0 1px var(--rule)}
.qr .code svg{display:block;width:100%;height:100%}
.qr p{margin-top:16px;font-size:15px;font-weight:600}
.qr .url{display:block;margin-top:4px;font-size:13px;color:var(--muted);overflow-wrap:anywhere}
.qr button{margin-top:18px;min-height:40px;padding:0 20px;border:0;border-radius:10px;background:none;box-shadow:inset 0 0 0 1px var(--rule-2);color:var(--ink-2);font:500 14.5px/1 var(--sans);cursor:pointer}
.map{margin:28px 0 0;border-radius:10px;background:radial-gradient(85% 70% at 50% 44%,var(--forest-glow) 0%,var(--forest) 52%,var(--forest-2) 100%);color:var(--on-forest-2);overflow:hidden}
.map[hidden]{display:none}
.map-stage{height:clamp(230px,40vw,280px)}
.map canvas{display:block;width:100%;height:100%;cursor:grab;touch-action:pan-y}
.map figcaption{padding:0 18px 16px;font-size:13px;line-height:1.7}
.map .lead{font-size:14px;color:var(--on-forest)}
.map .legend{display:flex;flex-wrap:wrap;align-items:center;gap:2px 14px;margin-top:6px;font-size:12px;color:var(--on-forest-3)}
.map .legend span{display:inline-flex;align-items:center;gap:6px}
.map .legend i{width:6px;height:6px;border-radius:50%}
.map .legend .v{background:var(--on-forest)}.map .legend .t{background:#8fd4a4}.map .legend .c{background:#e2c27c}
.map .legend .axes{margin-left:auto}
.map+.note{margin-top:22px}
@media (max-width:560px){.map{margin-left:calc(-1*var(--gut));margin-right:calc(-1*var(--gut));border-radius:0}.map figcaption{padding:0 var(--gut) 16px}.map .legend .axes{margin-left:0}.share-row button{flex:1 1 auto;justify-content:center}}
`;

/** The address, to copy, send (where the phone can) or show as a QR code: share.js does the work. */
const shareRow = () => `<div class="share-row"><button type="button" class="primary" data-share="copy">复制链接</button><button type="button" data-share="qr" aria-haspopup="dialog">二维码</button><button type="button" data-share="send" hidden>发给朋友</button></div>`;

/** The page's QR code, drawn here so the page needs nothing more to show it. */
function qrSvg(url: string) {
  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
}

/** What the map needs of each source to find its light: its public copy, else its video. */
function mapSources(sources: { id: string; url: string; title: string; date?: string; public_copy_url?: string }[]) {
  const rows = sources.map(source => ({ id: source.id, url: source.url, title: source.title, ...(source.date ? { date: source.date } : {}),
    ...(source.public_copy_url ? { public_copy_url: source.public_copy_url } : {}) }));
  return JSON.stringify(rows).replace(/</g, "\\u003c");
}

const askLink = (question: string) => `${ASK_APP}?q=${encodeURIComponent(question)}`;
/** Whether the asker switched on 结合我的处境 for this answer. */
const personal = (share: SharedAnswer) => share.intent === "apply";

function frame(options: { title: string; ogTitle: string; description: string; url: string; robots: string; jsonLd?: unknown; head: string; body: string }) {
  const json = options.jsonLd ? `<script type="application/ld+json">${JSON.stringify(options.jsonLd).replace(/</g, "\\u003c")}</script>` : "";
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(options.title)}</title>
<meta name="description" content="${escapeHtml(options.description)}">
<link rel="canonical" href="${escapeHtml(options.url)}">
<meta name="robots" content="${options.robots}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="问问立正">
<meta property="og:locale" content="zh_CN">
<meta property="og:title" content="${escapeHtml(options.ogTitle)}">
<meta property="og:description" content="${escapeHtml(options.description)}">
<meta property="og:url" content="${escapeHtml(options.url)}">
<meta property="og:image" content="${SHARE_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="问问立正">
<meta name="twitter:card" content="summary_large_image">
<meta itemprop="name" content="${escapeHtml(options.ogTitle)}">
<meta itemprop="description" content="${escapeHtml(options.description)}">
<meta itemprop="image" content="${SHARE_THUMB}">
<meta name="theme-color" content="#0f3d23">
<link rel="icon" href="${SITE_URL}/favicon.jpg">
<link rel="apple-touch-icon" href="${SITE_URL}/apple-touch-icon.jpg">
<link rel="preload" as="style" href="/s/fonts.css">
<noscript><link rel="stylesheet" href="/s/fonts.css"></noscript>
<style>${STYLE.trim()}${SHARE_STYLE.trim()}</style>
${json}
<script defer src="/s/page.js"></script>
<script type="module" src="/s/share.js"></script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<a class="skip" href="#main">跳到正文</a>
<header class="stage">
<div class="stage-inner">
<div class="bar"><a class="brand" href="${ASK_APP}" data-to="ask">${SEAL}<span>问问立正</span></a>
<nav aria-label="问问立正"><a href="${QUESTIONS}" data-to="index">别人在问什么</a><a href="${ASK_APP}" data-to="ask">去提问</a></nav></div>
${options.head}
</div>
</header>
<main id="main">
${options.body}
</main>
<footer><div class="body"><span>问问立正是立正的AI问答，回答来自他公开的文章和视频。</span><nav aria-label="更多"><a href="${PRIVACY}">隐私说明</a><a href="${QUESTIONS}" data-to="index">别人在问什么</a><a href="${SITE_URL}/" data-to="home">lizheng.ai</a></nav></div></footer>
</body>
</html>
`;
}

/** One shared question and its answer. */
export function renderSharePage(share: SharedAnswer): string {
  const { answer } = share;
  const ids = new Set(answer.sources.map(source => source.id));
  const url = shareUrl(share.day, share.slug);
  const sections = answer.sections.map(section => {
    const marked = /\[S\d{1,2}\]/.test(section.body);
    const loose = marked ? "" : section.source_ids.filter(id => ids.has(id))
      .map(id => `<a class="cite" href="#source-${id.slice(1)}" aria-label="出处${id.slice(1)}">${id.slice(1)}</a>`).join(" ");
    // An application to the asker's own situation says so; otherwise it is the AI's reasoning.
    const label = section.kind === "source" ? "材料里的观点" : section.kind === "application" ? (personal(share) ? "结合提问者的处境" : "AI推演") : "";
    const kind = label ? `<span class="kind kind-${escapeHtml(section.kind)}">${label}</span>` : "";
    return `<section class="section"><div class="section-head"><h2>${escapeHtml(section.heading)}</h2>${kind}</div>${paragraphs(section.body, ids)}${loose ? `<p class="cites">出处 ${loose}</p>` : ""}</section>`;
  }).join("\n");
  const limits = answer.limitations
    ? `<div class="limits">${paragraphs(answer.limitations.replace(/\[?\b(S\d{1,2})\b\]?/g, "[$1]"), ids)}</div>` : "";
  const sources = answer.sources.map(raw => {
    const source = raw as unknown as PublicSource;
    let kind: string;
    try { kind = sourceKind(source); } catch { return ""; }
    const attribution = sourceAttributionLabel(source);
    const meta = [`<span${/会员/.test(kind) ? ' class="member"' : ""}>${escapeHtml(kind)}</span>`, attribution ? `<span>${escapeHtml(attribution)}</span>` : "", source.date && /^\d{4}-\d{2}-\d{2}/.test(source.date) ? `<span>${source.date.slice(0, 10)}</span>` : ""].join("");
    return `<li class="source" id="source-${source.id.slice(1)}"><span class="num">${source.id.slice(1)}</span><a class="source-title" href="${escapeHtml(source.url)}" target="_blank" rel="noopener" data-to="source">${escapeHtml(source.title)}<span class="ext" aria-hidden="true">↗</span></a><p class="source-meta">${meta}</p>${source.reason ? `<p class="source-reason">${escapeHtml(source.reason)}</p>` : ""}</li>`;
  }).filter(Boolean).join("\n");
  const followups = answer.followups.length
    ? `<p class="asks-title">也可以接着问：</p><ul class="asks">${answer.followups.map(q => `<li><a href="${escapeHtml(askLink(q))}" rel="nofollow" data-to="followup">${escapeHtml(q)}</a></li>`).join("")}</ul>` : "";
  const description = clip(plainText(answer.summary) || share.question, 110);
  const display = url.replace(/^https:\/\//, "");
  const cited = answer.sources.length;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": url, url, name: share.question, description, inLanguage: "zh-CN",
        ...(share.created_at ? { datePublished: share.created_at } : {}), publisher: { "@id": PERSON_ID }, mainEntity: { "@id": `${url}#question` } },
      { "@type": "Question", "@id": `${url}#question`, name: share.question, text: share.question,
        ...(share.created_at ? { dateCreated: share.created_at } : {}), answerCount: 1,
        acceptedAnswer: {
          "@type": "Answer", url: `${url}#answer`,
          text: [answer.summary, ...answer.sections.map(s => `${s.heading}：${s.body}`)].map(plainText).join("\n\n"),
          citation: answer.sources.map(source => ({ "@type": "CreativeWork", name: source.title, url: source.url })),
        } },
    ],
  };
  return frame({
    title: `${clip(share.question, 56)} · 问问立正`, ogTitle: clip(share.question, 60), description, url, jsonLd,
    robots: "index, follow, max-snippet:-1, max-image-preview:large",
    head: `<div class="head" data-share-url="${escapeHtml(url)}">${share.created_at ? `<p class="kicker"><span>${chineseDate(share.created_at)}提问</span></p>` : ""}<h1>${phrases(share.question)}</h1>${shareRow()}</div>`,
    body: `<article class="body" id="answer">
<div class="summary">${paragraphs(answer.summary, ids)}</div>
${cited ? `<figure class="map" data-map hidden><div class="map-stage"><canvas aria-hidden="true"></canvas></div><figcaption><p class="lead">图上标号的是回答引用的${cited}份材料，点编号看原文。</p><p class="legend"><span><i class="v"></i>视频与对谈</span><span><i class="t"></i>文字</span><span><i class="c"></i>课程与书</span><span class="axes">越往外越新，方向是主题</span></p></figcaption></figure>
<script type="application/json" id="answer-sources">${mapSources(answer.sources as unknown as Parameters<typeof mapSources>[0])}</script>` : ""}
<p class="note">AI根据立正公开的文章和视频整理，不是他本人回复。重要的判断，请回到出处核对。</p>
${sections}
${limits}
${sources ? `<section class="block" aria-labelledby="sources"><h2 id="sources">出处</h2><ol class="sources">\n${sources}\n</ol></section>` : ""}
<section class="share-end" aria-labelledby="share-title"><h2 id="share-title">把这一页发给需要的人</h2><a class="url" href="${escapeHtml(url)}">${escapeHtml(display)}</a>${shareRow()}</section>
<section class="next" aria-labelledby="ask-own"><h2 id="ask-own">你也有想问的？</h2><p>卡住的时候，问问立正：回答附有出处，可以点回原文核对。</p><a class="button" href="${ASK_APP}" data-to="ask">去问问立正</a>${followups}</section>
</article>
<dialog class="qr" id="qr" aria-labelledby="qr-title"><div class="code" aria-hidden="true">${qrSvg(url)}</div><p id="qr-title">用手机扫一扫，打开这一页</p><span class="url">${escapeHtml(display)}</span><button type="button" data-share="close">关闭</button></dialog>`,
  });
}

/** An address with no shared answer behind it: never shared, or deleted. */
export function renderShareMissingPage(): string {
  return frame({
    title: "这个分享不在了 · 问问立正", ogTitle: "问问立正", description: "卡住的时候，问问立正。", url: SHARE_ORIGIN + "/", robots: "noindex, follow",
    head: `<div class="head"><h1>这个分享不在了</h1><p class="lede">它可能已经删除，或者地址有误。</p><a class="button" href="${ASK_APP}" data-to="ask">去问问立正</a></div>`,
    body: "",
  });
}

/** The sitemap of shared pages, newest shared first. */
export function renderShareSitemap(shares: { day: string; slug: string; shared_at: string }[]): string {
  const urls = shares.map(share => ({ loc: shareUrl(share.day, share.slug), lastmod: share.shared_at.slice(0, 10) }));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeHtml(url.loc)}</loc>
${/^\d{4}-\d{2}-\d{2}$/.test(url.lastmod) ? `    <lastmod>${url.lastmod}</lastmod>\n` : ""}  </url>`).join("\n")}
</urlset>
`;
}
