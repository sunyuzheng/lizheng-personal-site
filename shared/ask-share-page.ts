/**
 * The page of a shared answer at ask.lizheng.ai/s/<date>/<word> (shared/ask-share-link.ts): the
 * question and the answer as the asker saw them, never the situation they wrote, in the look of the
 * public answer pages (ask-public-page.ts). It is public and given to search engines, every one
 * (the owner's rule: what can be shared goes to search). Its link preview (WeChat, iMessage, Slack)
 * is the question, the opening of the answer and the 问问立正 card.
 *
 * The page lives on ask.lizheng.ai, where only the routes vercel.json names reach this site: its
 * fonts and script come from /s/fonts.css and /s/page.js, everything else by full address.
 */
import { ASK_APP, chineseDate, clip, escapeHtml, paragraphs, phrases, plainText, SITE_URL, sourceKind, STYLE, type PublicSource } from "./ask-public-page.js";
import { SEAL } from "./ask-seal.js";
import { SHARE_ORIGIN, shareUrl, type SharedAnswer } from "./ask-share-link.js";

export const SHARE_IMAGE = `${SITE_URL}/og/ask-share.jpg`;
export const SHARE_THUMB = `${SITE_URL}/og/ask-share-square.jpg`;
const PERSON_ID = `${SITE_URL}/#person`;
const PRIVACY = `${SITE_URL}/ask/privacy`;
const QUESTIONS = `${SITE_URL}/ask`;

// The share page's own additions to the public pages' look.
const SHARE_STYLE = `
.next .asks-title{margin-top:26px;font-size:14.5px;color:var(--muted)}
.next .asks-title+.asks{margin-top:10px}
`;

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
    const meta = [`<span${/会员/.test(kind) ? ' class="member"' : ""}>${escapeHtml(kind)}</span>`, source.date && /^\d{4}-\d{2}-\d{2}/.test(source.date) ? `<span>${source.date.slice(0, 10)}</span>` : ""].join("");
    return `<li class="source" id="source-${source.id.slice(1)}"><span class="num">${source.id.slice(1)}</span><a class="source-title" href="${escapeHtml(source.url)}" target="_blank" rel="noopener" data-to="source">${escapeHtml(source.title)}<span class="ext" aria-hidden="true">↗</span></a><p class="source-meta">${meta}</p>${source.reason ? `<p class="source-reason">${escapeHtml(source.reason)}</p>` : ""}</li>`;
  }).filter(Boolean).join("\n");
  const followups = answer.followups.length
    ? `<p class="asks-title">也可以接着问：</p><ul class="asks">${answer.followups.map(q => `<li><a href="${escapeHtml(askLink(q))}" rel="nofollow" data-to="followup">${escapeHtml(q)}</a></li>`).join("")}</ul>` : "";
  const description = clip(plainText(answer.summary) || share.question, 110);
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
    head: `<div class="head">${share.created_at ? `<p class="kicker"><span>${chineseDate(share.created_at)}提问</span></p>` : ""}<h1>${phrases(share.question)}</h1></div>`,
    body: `<article class="body" id="answer">
<div class="summary">${paragraphs(answer.summary, ids)}</div>
<p class="note">AI根据立正公开的文章和视频整理，不是他本人回复。重要的判断，请回到出处核对。</p>
${sections}
${limits}
${sources ? `<section class="block" aria-labelledby="sources"><h2 id="sources">出处</h2><ol class="sources">\n${sources}\n</ol></section>` : ""}
<section class="next" aria-labelledby="ask-own"><h2 id="ask-own">你也有想问的？</h2><p>卡住的时候，问问立正：回答只从立正讲过、写过的东西里来，每一段都能点回原文。</p><a class="button" href="${ASK_APP}" data-to="ask">去问问立正</a>${followups}</section>
</article>`,
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
