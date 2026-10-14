/**
 * The page of a shared answer at ask.lizheng.ai/s/<date>/<word> (shared/ask-share-link.ts). Since
 * 2026-10-13 (the owner: opening the link should show what the asker sees) it is ask.lizheng.ai's own
 * page, copied from ask-lizheng by scripts/sync-ask-app.mjs (shared/ask-app-shell.js), with the
 * question and answer in it: the page opens them as the conversation, its map, sources and share bar
 * included, and its reader can follow them up; the asker's address bar already shows this address.
 * Never the situation the asker wrote, and no transcript excerpts. It is public and given to search
 * engines, every one (the owner's rule: what can be shared goes to search), with the answer in the
 * first HTML for them and for link previews (WeChat, iMessage, Slack: the question, the opening of
 * the answer and the 问问立正 card).
 *
 * The page lives on ask.lizheng.ai, where only the routes vercel.json names reach this site: the
 * page's scripts and styles come from /ask-app/assets/, the missing page's from /s/.
 */
import { ASK_APP, chineseDate, clip, escapeHtml, paragraphs, phrases, plainText, SITE_URL, sourceKind, STYLE, type PublicDetail, type PublicSource } from "./ask-public-page.js";
import { ASK_APP_HTML } from "./ask-app-shell.js";
import { SEAL } from "./ask-seal.js";
import { sourceAttributionLabel } from "./ask-source-attribution.js";
import { SHARE_ORIGIN, shareUrl, type SharedAnswer } from "./ask-share-link.js";

export const SHARE_IMAGE = `${SITE_URL}/og/ask-share.jpg`;
export const SHARE_THUMB = `${SITE_URL}/og/ask-share-square.jpg`;
const PERSON_ID = `${SITE_URL}/#person`;
const PRIVACY = `${SITE_URL}/ask/privacy`;
const QUESTIONS = `${SITE_URL}/ask`;

// The share page's own additions to the public pages' look (the missing page).
const SHARE_STYLE = `
.next .asks-title{margin-top:26px;font-size:14.5px;color:var(--muted)}
.next .asks-title+.asks{margin-top:10px}
`;

const askLink = (question: string) => `${ASK_APP}?q=${encodeURIComponent(question)}`;

/** The link a public question (别人在问什么) is shared by: this page with it in (renderPublicAnswerPage). */
export const publicAnswerUrl = (id: string) => `${SHARE_ORIGIN}/q/${id}`;

/** One answer on ask.lizheng.ai's own page: a shared record's (/s/<date>/<word>) or a public question's
 * (/q/<id>). `url` is the page's own address, the one its share bar copies; `canonical` the one search
 * engines keep (a public question's is its page on www.lizheng.ai, which also carries the structured
 * data); `data` what else #ask-shared says about it. */
type AppPage = {
  url: string; canonical: string; question: string; intent: string; created_at: string; structured: boolean;
  answer: Pick<SharedAnswer["answer"], "summary" | "limitations" | "followups"> & {
    sections: { heading: string; body: string; kind: string; source_ids: string[] }[];
    sources: object[];
  };
  data: Record<string, string>;
};

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

/** What ask.lizheng.ai's page needs of an answer to show it as its asker saw it: everything but the
 * transcript excerpts, which no page search engines read carries (as /ask/<id> and these pages). */
function pageData(page: AppPage) {
  const answer = { status: "answered", clarifying_questions: [], ...page.answer, sources: page.answer.sources.map(source => {
    const { excerpt: _excerpt, ...rest } = source as Record<string, unknown>;
    return rest;
  }) };
  return JSON.stringify({ url: page.url, ...page.data, question: page.question, intent: page.intent, created_at: page.created_at, answer })
    .replace(/</g, "\\u003c");
}

/** One shared question and its answer: ask.lizheng.ai's own page with the answer in it (#ask-shared),
 * which opens it as the conversation, as its asker saw it, and lets its reader follow it up. Search
 * engines, link previews and readers without scripts get the same answer in the first HTML, laid out
 * with the page's own classes, so nothing moves when the page takes over. */
export function renderSharePage(share: SharedAnswer): string {
  const url = shareUrl(share.day, share.slug);
  return renderAppPage({ url, canonical: url, question: share.question, intent: share.intent, created_at: share.created_at,
    structured: true, answer: share.answer, data: { day: share.day, slug: share.slug } });
}

/** A question from 别人在问什么, shared from its card (2026-10-14, the owner: its link should open
 * 问问立正 too): the same page with its answer in it, at ask.lizheng.ai/q/<id>. Search engines are
 * pointed at its page on www.lizheng.ai, which stays the one they read. */
export function renderPublicAnswerPage(detail: PublicDetail): string {
  return renderAppPage({ url: publicAnswerUrl(detail.public_id), canonical: `${SITE_URL}/ask/${detail.public_id}`,
    question: detail.question, intent: "understand", created_at: detail.published_at, structured: false,
    answer: detail.answer, data: { public_id: detail.public_id } });
}

function renderAppPage(page: AppPage): string {
  const { answer, url } = page;
  const ids = new Set(answer.sources.map(source => (source as PublicSource).id));
  const sections = answer.sections.map(section => {
    const marked = /\[S\d{1,2}\]/.test(section.body);
    const loose = marked ? "" : section.source_ids.filter(id => ids.has(id))
      .map(id => `<a class="cite" href="#source-${id.slice(1)}" aria-label="出处${id.slice(1)}">${id.slice(1)}</a>`).join(" ");
    // An application to the asker's own situation says so; otherwise it is the AI's reasoning.
    const label = section.kind === "source" ? "材料里的观点" : section.kind === "application" ? (page.intent === "apply" ? "结合提问者的处境" : "AI推演") : "";
    const kind = label ? `<span class="kind kind-${escapeHtml(section.kind)}">${label}</span>` : "";
    return `<section class="answer-section"><div class="section-head"><h3>${escapeHtml(section.heading)}</h3>${kind}</div>${paragraphs(section.body, ids)}${loose ? `<p class="section-sources"><span>出处</span> ${loose}</p>` : ""}</section>`;
  }).join("\n");
  const limits = answer.limitations
    ? `<div class="limits">${paragraphs(answer.limitations.replace(/\[?\b(S\d{1,2})\b\]?/g, "[$1]"), ids)}</div>` : "";
  const sources = answer.sources.map(raw => {
    const source = raw as unknown as PublicSource;
    let kind: string;
    try { kind = sourceKind(source); } catch { return ""; }
    const attribution = sourceAttributionLabel(source);
    // The same owned labels as the public answer pages: kind, who speaks, date.
    const meta = [`<span>${source.id.slice(1)}</span>`, `<span${/会员/.test(kind) ? ' class="member"' : ""}>${escapeHtml(kind)}</span>`, attribution ? `<span>${escapeHtml(attribution)}</span>` : "",
      source.date && /^\d{4}-\d{2}-\d{2}/.test(source.date) ? `<span>${source.date.slice(0, 10)}</span>` : ""].join(" ");
    return `<article class="source" id="source-${source.id.slice(1)}"><p class="source-meta">${meta}</p><a class="source-title" href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.title)} ↗</a>${source.reason ? `<p class="source-reason">${escapeHtml(source.reason)}</p>` : ""}</article>`;
  }).filter(Boolean).join("\n");
  const followups = answer.followups.length
    ? `<div class="followups"><p>也可以接着问</p>${answer.followups.map(q => `<a href="${escapeHtml(askLink(q))}" rel="nofollow">${escapeHtml(q)}</a>`).join("")}</div>` : "";
  const description = clip(plainText(answer.summary) || page.question, 110);
  const title = `${clip(page.question, 56)} · 问问立正`;
  const ogTitle = clip(page.question, 60);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": url, url, name: page.question, description, inLanguage: "zh-CN",
        ...(page.created_at ? { datePublished: page.created_at } : {}), publisher: { "@id": PERSON_ID }, mainEntity: { "@id": `${url}#question` } },
      { "@type": "Question", "@id": `${url}#question`, name: page.question, text: page.question,
        ...(page.created_at ? { dateCreated: page.created_at } : {}), answerCount: 1,
        acceptedAnswer: {
          "@type": "Answer", url: `${url}#answer`,
          text: [answer.summary, ...answer.sections.map(s => `${s.heading}：${s.body}`)].map(plainText).join("\n\n"),
          citation: answer.sources.map(raw => raw as PublicSource).map(source => ({ "@type": "CreativeWork", name: source.title, url: source.url })),
        } },
    ],
  };
  const head = `<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(page.canonical)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="问问立正">
<meta property="og:locale" content="zh_CN">
<meta property="og:title" content="${escapeHtml(ogTitle)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:image" content="${SHARE_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="问问立正">
<meta name="twitter:card" content="summary_large_image">
<meta itemprop="name" content="${escapeHtml(ogTitle)}">
<meta itemprop="description" content="${escapeHtml(description)}">
<meta itemprop="image" content="${SHARE_THUMB}">
${page.structured ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ""}`;
  const fallback = `<header class="header"><div class="header-inner"><a class="brand" href="${ASK_APP}">${SEAL.replace("<svg ", '<svg class="mark" ')}<span>问问立正</span></a><nav class="header-nav" aria-label="页面"><a class="header-link new-chat" href="${ASK_APP}">新问题</a><a class="header-link site-link" href="${SITE_URL}/">lizheng.ai</a></nav></div></header>
<main id="main-content"><div class="layout"><div class="thread-column"><section class="thread"><article class="turn" id="answer">
<header class="question"><h2>${phrases(page.question)}</h2>${page.created_at ? `<p class="question-when"><time datetime="${escapeHtml(page.created_at)}">${chineseDate(page.created_at)}</time>提问</p>` : ""}</header>
<div class="answer"><p class="answer-meta"><span>AI根据立正公开的文章和视频整理，不是他本人回复</span></p>
<div class="summary">${paragraphs(answer.summary, ids)}</div>
${sections}
${limits}
${sources ? `<details class="inline-sources" open><summary>回到${answer.sources.length}份原文</summary><div>\n${sources}\n</div></details>` : ""}
${followups}
</div></article></section></div></div></main>`;
  return ASK_APP_HTML
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/\s*<meta name="description"[^>]*>/, "")
    .replace(/\s*<link rel="canonical"[^>]*>/, "")
    .replace(/\s*<meta property="og:[^"]*"[^>]*>/g, "")
    .replace(/\s*<meta name="twitter:[^"]*"[^>]*>/g, "")
    .replace("</head>", `${head}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${fallback}</div>\n<script type="application/json" id="ask-shared">${pageData(page)}</script>`);
}

/** An address with no shared answer behind it: never shared, or deleted; for a public question's
 * link (`question`), withdrawn from 别人在问什么. */
export function renderShareMissingPage(question = false): string {
  const what = question ? "这条问答" : "这个分享";
  return frame({
    title: `${what}不在了 · 问问立正`, ogTitle: "问问立正", description: "卡住的时候，问问立正。", url: SHARE_ORIGIN + "/", robots: "noindex, follow",
    head: `<div class="head"><h1>${what}不在了</h1><p class="lede">它可能已经${question ? "撤下" : "删除"}，或者地址有误。</p><a class="button" href="${ASK_APP}" data-to="ask">去问问立正</a></div>`,
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
