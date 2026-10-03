/**
 * Public answer pages for search: every question published on 「别人在问什么」 gets its own page at
 * www.lizheng.ai/ask/<public_id>, rendered on the server so the question, answer and sources are in
 * the first HTML a crawler reads. /ask lists them and /ask/sitemap.xml names them for search
 * engines. The questions were published from Ops with the asker's consent and personal details
 * removed (see docs/ask-lizheng.md); a withdrawn one stops existing here as well.
 *
 * Only the first wording of a question is indexed: the same question asked in other words (see
 * ask-question-shape.ts) keeps its page for links but asks search engines not to index it, and an
 * answer too thin to help someone arriving from search is not indexed either.
 */
import { sameQuestion } from "./ask-question-shape.js";
import { SEAL } from "./ask-seal.js";

// The site's ids in structured-data.ts, written out here: that module imports without file
// extensions, which a Vercel function cannot load.
const SITE_URL = "https://www.lizheng.ai";
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const ASK_APP = "https://ask.lizheng.ai/";
export const ASK_INDEX = `${SITE_URL}/ask`;
export const OG_IMAGE = `${SITE_URL}/og/home-zh.jpg`;
export const pageUrl = (id: string) => `${SITE_URL}/ask/${id}`;
export const PUBLIC_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export type PublicCard = {
  public_id: string; revision: number; topic_key: string; topic_label: string; question: string; summary: string;
  published_at: string; updated_at: string; asked_at?: string; topic_question_count: number; likes: number;
};
export type PublicSource = {
  id: string; title: string; url: string; date?: string; source_type?: string; reason?: string; source_visibility?: string;
};
export type PublicSection = { heading: string; body: string; kind: string; source_ids: string[] };
export type PublicAnswer = {
  status: string; summary: string; sections: PublicSection[]; sources: PublicSource[]; followups: string[]; limitations: string;
};
export type PublicDetail = {
  public_id: string; revision: number; topic_key: string; topic_label: string; question: string;
  answer: PublicAnswer; published_at: string; updated_at: string;
};

const text = (value: unknown, max: number): value is string =>
  typeof value === "string" && !!value.trim() && Array.from(value).length <= max;
const time = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));
const count = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;
function https(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}

/** A card from the Ops list, or null when it is not one. */
export function publicCard(value: unknown): PublicCard | null {
  const r = value as Record<string, unknown> | null;
  if (!r || typeof r !== "object" || typeof r.public_id !== "string" || !PUBLIC_ID.test(r.public_id) || !count(r.revision) ||
      typeof r.topic_key !== "string" || !text(r.topic_label, 80) || !text(r.question, 300) || typeof r.summary !== "string" ||
      !time(r.published_at) || !time(r.updated_at) || !count(r.topic_question_count) || !count(r.likes) ||
      (r.asked_at !== undefined && !time(r.asked_at))) return null;
  return {
    public_id: r.public_id, revision: r.revision as number, topic_key: r.topic_key, topic_label: r.topic_label as string,
    question: (r.question as string).trim(), summary: r.summary.trim(), published_at: r.published_at as string,
    updated_at: r.updated_at as string, topic_question_count: r.topic_question_count as number, likes: r.likes as number,
    ...(r.asked_at ? { asked_at: r.asked_at as string } : {}),
  };
}

/** A published question with its answer from Ops, or null when it is not one. */
export function publicDetail(value: unknown): PublicDetail | null {
  const r = value as Record<string, unknown> | null;
  const a = r?.answer as Record<string, unknown> | undefined;
  if (!r || typeof r !== "object" || typeof r.public_id !== "string" || !PUBLIC_ID.test(r.public_id) || !count(r.revision) ||
      typeof r.topic_key !== "string" || !text(r.topic_label, 80) || !text(r.question, 300) || !time(r.published_at) ||
      !time(r.updated_at) || !a || typeof a !== "object" || typeof a.status !== "string" || typeof a.summary !== "string" ||
      !Array.isArray(a.sections) || !Array.isArray(a.sources)) return null;
  const sources: PublicSource[] = [];
  for (const s of a.sources as Record<string, unknown>[]) {
    if (!s || typeof s.id !== "string" || !/^S\d{1,2}$/.test(s.id) || !text(s.title, 1000) || !https(s.url)) continue;
    const pick = (key: string) => (typeof s[key] === "string" && (s[key] as string).trim() ? { [key]: (s[key] as string).trim() } : {});
    sources.push({ id: s.id, title: (s.title as string).trim(), url: s.url as string, ...pick("date"), ...pick("source_type"),
      ...pick("reason"), ...pick("source_visibility") });
  }
  const sections: PublicSection[] = (a.sections as Record<string, unknown>[])
    .filter(s => s && typeof s.heading === "string" && typeof s.body === "string" && s.body.trim())
    .map(s => ({
      heading: (s.heading as string).trim(), body: (s.body as string).trim(), kind: typeof s.kind === "string" ? s.kind : "synthesis",
      source_ids: Array.isArray(s.source_ids) ? s.source_ids.filter((id): id is string => typeof id === "string" && /^S\d{1,2}$/.test(id)) : [],
    }));
  const strings = (value: unknown, max: number) =>
    Array.isArray(value) ? value.filter((v): v is string => text(v, 250)).map(v => v.trim()).slice(0, max) : [];
  return {
    public_id: r.public_id, revision: r.revision as number, topic_key: r.topic_key, topic_label: r.topic_label as string,
    question: (r.question as string).trim(), published_at: r.published_at as string, updated_at: r.updated_at as string,
    answer: {
      status: a.status, summary: a.summary.trim(), sections, sources, followups: strings(a.followups, 3),
      limitations: typeof a.limitations === "string" ? a.limitations.trim() : "",
    },
  };
}

const when = (card: Pick<PublicCard, "asked_at" | "published_at">) => Date.parse(card.asked_at ?? card.published_at);

/**
 * Which page stands for each question: questions asked in other words fall into one group, in
 * the order they were published, and the first one published stands for the group, so the page
 * search engines know never moves. Returns the representative's id for every card.
 */
export function representatives(cards: PublicCard[]): Map<string, string> {
  const ordered = [...cards].sort((a, b) => Date.parse(a.published_at) - Date.parse(b.published_at) || a.public_id.localeCompare(b.public_id));
  const groups: PublicCard[][] = [];
  for (const card of ordered) {
    const group = groups.find(members => members.some(other => sameQuestion(other.question, card.question)));
    if (group) group.push(card); else groups.push([card]);
  }
  return new Map(groups.flatMap(group => group.map(card => [card.public_id, group[0].public_id] as [string, string])));
}

/** How many similar askings a card stands for: its topic, plus its rewordings filed elsewhere. */
export function similarAskings(card: PublicCard, cards: PublicCard[], reps: Map<string, string>): number {
  const group = cards.filter(other => other.public_id !== card.public_id && other.topic_key !== card.topic_key &&
    reps.get(other.public_id) === reps.get(card.public_id));
  return card.topic_question_count + group.length;
}

/** The questions /ask and the sitemap list: one per question, newest asked first. */
export function listedCards(cards: PublicCard[]): PublicCard[] {
  const reps = representatives(cards);
  return cards.filter(card => reps.get(card.public_id) === card.public_id && Array.from(card.question).length >= 6)
    .sort((a, b) => when(b) - when(a) || b.public_id.localeCompare(a.public_id));
}

const bodyLength = (answer: PublicAnswer) => answer.sections.reduce((n, s) => n + Array.from(s.body).length, 0);

/**
 * Whether search engines should index a page: a full answer with sources, long enough to help
 * someone arriving from search, and the first wording of its question (rep is its group's page).
 */
export function indexable(detail: PublicDetail, rep?: string): boolean {
  return detail.answer.status === "answered" && detail.answer.sources.length > 0 && bodyLength(detail.answer) >= 200 &&
    Array.from(detail.question).length >= 6 && (!rep || rep === detail.public_id);
}

/* ---------- Text ---------- */

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ESCAPES[c]);
const clip = (value: string, max: number) => {
  const chars = Array.from(value.replace(/\s+/g, " ").trim());
  if (chars.length <= max) return chars.join("");
  const cut = chars.slice(0, max).join("");
  const stop = Math.max(...["。", "；", "，", "、", "？", "！"].map(mark => cut.lastIndexOf(mark)));
  return (stop > max * 0.6 ? cut.slice(0, stop) : cut).replace(/[，、；：\s]+$/, "") + "…";
};
/** 2026年10月3日, in Beijing time, where the questions are counted. */
export function chineseDate(iso: string): string {
  const d = new Date(Date.parse(iso) + 8 * 3_600_000);
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
}
const isoDay = (iso: string) => new Date(Date.parse(iso) + 8 * 3_600_000).toISOString().slice(0, 10);

/**
 * One answer paragraph as HTML: escaped text, **strong**, links reduced to their words (answers
 * never link out in the text), and [S3] as a footnote number joined to the word it marks.
 */
function inline(value: string, ids: Set<string>): string {
  const plain = value.replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, "$1").replace(/\s+(?=\[S\d{1,2}\])/g, "");
  // Marks side by side ([S1][S2]) read as 1,2, not as 12.
  return plain.split(/((?:\[S\d{1,2}\]\s*)+)/g).map(part => {
    if (/^(?:\[S\d{1,2}\]\s*)+$/.test(part)) {
      const marks = [...part.matchAll(/S(\d{1,2})/g)].filter(m => ids.has(`S${m[1]}`))
        .map(m => `<a class="cite" href="#source-${m[1]}" aria-label="出处${m[1]}">${m[1]}</a>`);
      return marks.length ? `\u2060${marks.join('<span class="cite-sep">,</span>')}` : "";
    }
    return escapeHtml(part).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }).join("");
}
function paragraphs(value: string, ids: Set<string>): string {
  return value.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean).map(block => {
    const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
    if (lines.length > 1 && lines.every(line => /^([-*•]|\d+[.、])\s+/.test(line)))
      return `<ul>${lines.map(line => `<li>${inline(line.replace(/^([-*•]|\d+[.、])\s+/, ""), ids)}</li>`).join("")}</ul>`;
    return `<p>${inline(lines.join(""), ids)}</p>`;
  }).join("");
}
const plainText = (value: string) => value.replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, "$1").replace(/\[S\d{1,2}\]/g, "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

const KIND: Record<string, string> = { source: "材料里的观点", application: "AI推演" };
/** A title in phrases that break only between them, at Chinese punctuation (as on the homepage). */
const phrases = (value: string) => (value.match(/[^，：；、？！。]+[，：；、？！。]*/g) ?? [value])
  .map(part => `<span class="phrase">${escapeHtml(part)}</span>`).join("");
function sourceKind(source: PublicSource): string {
  const host = new URL(source.url).hostname;
  const member = source.source_visibility === "members-only";
  if (/(^|\.)youtube\.com$|youtu\.be$/.test(host)) return member ? "会员视频" : "视频";
  if (/superlinear\.academy$/.test(host)) return member ? "超线性学院 · 会员" : "超线性学院";
  if (/(^|\.)lizheng\.ai$/.test(host)) return "文章";
  if (host === "github.com") return "GitHub";
  return host.replace(/^www\./, "");
}

/* ---------- Page ---------- */

const STYLE = `
:root{--paper:#fbf9f5;--ink:#141714;--ink-2:#3b3f3a;--muted:#6b6e67;--faint:#9a9b93;--rule:#e6e0d4;--rule-2:#d5cebf;--green:#238343;--green-deep:#1c6f38;--green-text:#1c6b37;--forest:#0f3d23;--forest-2:#0b2f1b;--forest-glow:#1a5132;--on-forest:#f8f1e4;--on-forest-2:rgb(248 241 228/.78);--on-forest-3:rgb(248 241 228/.56);--forest-rule:rgb(248 241 228/.18);--member:#79603f;--serif:"Noto Serif SC","Songti SC","STSong",serif;--sans:"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--measure:700px;--gut:clamp(20px,5vw,56px);color-scheme:light}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.75 var(--sans);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
a{color:inherit;text-decoration:none}h1,h2,h3,p,ol,ul{margin:0}
:focus-visible{outline:2px solid var(--green);outline-offset:3px;border-radius:3px}
.skip{position:absolute;left:-9999px}.skip:focus{left:16px;top:12px;z-index:2;padding:8px 12px;background:var(--on-forest);color:var(--forest)}
.stage{background:radial-gradient(110% 90% at 92% -10%,var(--forest-glow) 0%,rgb(26 81 50/0) 60%),linear-gradient(180deg,var(--forest) 0%,var(--forest-2) 100%);color:var(--on-forest)}
.stage-inner,.body{max-width:calc(var(--measure) + 2*var(--gut));margin:0 auto;padding-left:var(--gut);padding-right:var(--gut)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:22px;font-size:14px}
.brand{display:inline-flex;align-items:center;gap:10px;font:700 16px/1 var(--serif);letter-spacing:.06em;color:var(--on-forest)}
.brand svg{width:38px;height:auto;fill:var(--on-forest)}
.bar nav{display:flex;gap:20px;color:var(--on-forest-2)}.bar nav a:hover{color:var(--on-forest)}
.head{padding:clamp(48px,8vw,96px) 0 clamp(40px,6vw,72px)}
.kicker{font-size:13.5px;color:var(--on-forest-3);font-variant-numeric:tabular-nums}
.kicker span+span::before{content:"·";margin:0 8px}
.head h1{margin-top:14px;font:900 clamp(30px,4.6vw,48px)/1.28 var(--serif);letter-spacing:.005em;font-feature-settings:"palt"}
.phrase{display:inline-block;text-wrap:pretty}
.lede{margin-top:20px;max-width:34em;font-size:clamp(16px,1.5vw,18px);color:var(--on-forest-2)}
.lede+.button{margin-top:28px}
.button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 22px;border-radius:10px;background:var(--green);color:#fff;font-size:15.5px;font-weight:600;transition:background .2s}
.button:hover{background:var(--green-deep)}
.stage .button{background:var(--on-forest);color:var(--forest)}.stage .button:hover{background:#fff}
.body{padding-top:clamp(36px,5vw,56px);padding-bottom:72px}
.summary{font-size:clamp(18.5px,1.9vw,21px);font-weight:500;line-height:1.75;color:var(--ink)}
.summary p+p{margin-top:10px}
.note{margin-top:16px;padding-bottom:28px;border-bottom:2px solid var(--ink);font-size:13.5px;color:var(--muted)}
.section{margin-top:36px}
.section-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px}
.section h2{font-size:18.5px;font-weight:700;line-height:1.5}
.kind{font-size:12.5px;font-weight:600;color:var(--green-text);white-space:nowrap}.kind-application{color:#7a5512}
.section p,.section li{font-size:17px;line-height:1.9;color:var(--ink-2)}
.section p{margin-top:10px}.section ul{margin:10px 0 0;padding-left:1.3em}.section li+li{margin-top:4px}.section li::marker{color:var(--green)}
.section strong{color:var(--ink)}
.cite{position:relative;margin-left:1px;padding:1px 2px;border-radius:3px;color:var(--green-text);font-size:.68em;font-weight:700;line-height:1;vertical-align:super;font-variant-numeric:tabular-nums}
.cite::after{content:"";position:absolute;inset:-10px -7px}.cite:hover{background:var(--green);color:#fff}
.cite-sep{color:var(--green-text);font-size:.68em;vertical-align:super;line-height:1}
.cites{margin-top:8px}.cites .cite{font-size:12px;vertical-align:baseline}
.limits{margin-top:32px;padding-left:14px;border-left:2px solid var(--rule-2);font-size:14.5px;line-height:1.85;color:var(--muted)}
.limits .cite{font-size:.75em}
.block{margin-top:56px}
.block>h2{padding-bottom:10px;border-bottom:1px solid var(--ink);font:700 19px/1.4 var(--serif);letter-spacing:.02em}
.sources{list-style:none;padding:0}
.source{display:grid;grid-template-columns:2.2em 1fr;gap:0 4px;padding:16px 0;border-bottom:1px solid var(--rule);scroll-margin-top:24px}
.source:target{box-shadow:inset 2px 0 0 var(--green);padding-left:12px}
.num{font:700 15px/1.55 var(--serif);color:var(--green-text);font-variant-numeric:tabular-nums}
.source-title{font-size:15.5px;font-weight:600;line-height:1.55;color:var(--ink)}
.source-title:hover{color:var(--green-text)}.ext{margin-left:3px;color:var(--faint);font-weight:400}
.source-meta{grid-column:2;margin-top:4px;font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.source-meta .member{color:var(--member);font-weight:600}
.source-meta span+span::before{content:"·";margin:0 7px;color:var(--faint)}
.source-reason{grid-column:2;margin-top:6px;font-size:14px;line-height:1.8;color:var(--ink-2)}
.next{margin-top:56px;padding:28px 0 0;border-top:2px solid var(--ink)}
.next h2{font:900 clamp(22px,2.4vw,26px)/1.35 var(--serif)}
.next p{margin-top:10px;color:var(--ink-2)}
.next .button{margin-top:20px}
.asks{margin-top:22px;list-style:none;padding:0;border-top:1px solid var(--rule)}
.asks li{border-bottom:1px solid var(--rule)}
.asks a{display:block;padding:13px 0;font-size:15.5px;line-height:1.6;color:var(--ink-2)}
.asks a::after{content:"↗";margin-left:6px;color:var(--faint);font-size:13px}
.asks a:hover{color:var(--green-text)}
.list{list-style:none;padding:0}
.row{border-bottom:1px solid var(--rule)}
.row a{display:block;padding:20px 0}
.row .meta{font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.row .meta span+span::before{content:"·";margin:0 7px;color:var(--faint)}
.row b{display:block;margin-top:6px;font:700 clamp(17.5px,1.8vw,19.5px)/1.5 var(--serif);color:var(--ink);transition:color .2s}
.row p{margin-top:6px;font-size:14.5px;line-height:1.8;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.row a:hover b{color:var(--green-text)}
.all{display:inline-block;margin-top:18px;font-size:14.5px;font-weight:600;color:var(--green-text)}
.all:hover{color:var(--green-deep)}
footer{border-top:1px solid var(--rule);color:var(--muted);font-size:13px}
footer .body{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 24px;padding-top:22px;padding-bottom:40px}
footer nav{display:flex;flex-wrap:wrap;gap:6px 18px}footer a:hover{color:var(--green-text)}
@media (max-width:560px){.bar nav a:first-child{display:none}.head h1{font-size:28px;line-height:1.35}.section p,.section li{font-size:16.5px}.button{width:100%}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function frame(options: { title: string; description: string; canonical: string; robots: string; type: "article" | "website";
  jsonLd?: unknown; head: string; body: string }): string {
  const json = options.jsonLd ? `<script type="application/ld+json">${JSON.stringify(options.jsonLd).replace(/</g, "\\u003c")}</script>` : "";
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(options.title)}</title>
<meta name="description" content="${escapeHtml(options.description)}">
<link rel="canonical" href="${escapeHtml(options.canonical)}">
<meta name="robots" content="${options.robots}">
<meta property="og:type" content="${options.type}">
<meta property="og:site_name" content="立正 · Yuzheng Sun">
<meta property="og:locale" content="zh_CN">
<meta property="og:title" content="${escapeHtml(options.title)}">
<meta property="og:description" content="${escapeHtml(options.description)}">
<meta property="og:url" content="${escapeHtml(options.canonical)}">
<meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0f3d23">
<link rel="icon" href="/favicon.jpg">
<link rel="apple-touch-icon" href="/apple-touch-icon.jpg">
<link rel="preload" as="style" href="/fonts/serif.css">
<noscript><link rel="stylesheet" href="/fonts/serif.css"></noscript>
<style>${STYLE.trim()}</style>
${json}
<script defer src="/ask/page.js"></script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<a class="skip" href="#main">跳到正文</a>
<header class="stage">
<div class="stage-inner">
<div class="bar"><a class="brand" href="${ASK_APP}" data-to="ask">${SEAL}<span>问问立正</span></a>
<nav aria-label="问问立正"><a href="/ask" data-to="index">所有问题</a><a href="${ASK_APP}" data-to="ask">去提问</a></nav></div>
${options.head}
</div>
</header>
<main id="main">
${options.body}
</main>
<footer><div class="body"><span>问问立正是立正的AI问答，回答来自他公开的文章和视频。</span><nav aria-label="更多"><a href="/ask/privacy">隐私说明</a><a href="/ask" data-to="index">所有问题</a><a href="${SITE_URL}/" data-to="home">lizheng.ai</a></nav></div></footer>
</body>
</html>
`;
}

const askLink = (question: string) => `${ASK_APP}?q=${encodeURIComponent(question)}`;

/** One published question and its answer, as the page a search result opens. */
export function renderQuestionPage(detail: PublicDetail, context: {
  card?: PublicCard; related: PublicCard[]; similar: number; indexable: boolean;
}): string {
  const { answer } = detail;
  const ids = new Set(answer.sources.map(source => source.id));
  const url = pageUrl(detail.public_id);
  const askedAt = context.card?.asked_at;
  const kicker = [detail.topic_label, askedAt ? `${chineseDate(askedAt)}提问` : "常被问到", context.similar >= 2 ? `${context.similar}次类似提问` : ""]
    .filter(Boolean).map(part => `<span>${escapeHtml(part)}</span>`).join("");
  const sections = answer.sections.map(section => {
    const marked = /\[S\d{1,2}\]/.test(section.body);
    const loose = marked ? "" : section.source_ids.filter(id => ids.has(id))
      .map(id => `<a class="cite" href="#source-${id.slice(1)}" aria-label="出处${id.slice(1)}">${id.slice(1)}</a>`).join(" ");
    const kind = KIND[section.kind] ? `<span class="kind kind-${escapeHtml(section.kind)}">${KIND[section.kind]}</span>` : "";
    return `<section class="section"><div class="section-head"><h2>${escapeHtml(section.heading)}</h2>${kind}</div>${paragraphs(section.body, ids)}${loose ? `<p class="cites">出处 ${loose}</p>` : ""}</section>`;
  }).join("\n");
  const limits = answer.limitations
    ? `<div class="limits">${paragraphs(answer.limitations.replace(/\[?\b(S\d{1,2})\b\]?/g, "[$1]"), ids)}</div>` : "";
  const sources = answer.sources.map(source => {
    const kind = sourceKind(source);
    const meta = [`<span${/会员/.test(kind) ? ' class="member"' : ""}>${escapeHtml(kind)}</span>`, source.date && /^\d{4}-\d{2}-\d{2}/.test(source.date) ? `<span>${source.date.slice(0, 10)}</span>` : ""].join("");
    return `<li class="source" id="source-${source.id.slice(1)}"><span class="num">${source.id.slice(1)}</span><a class="source-title" href="${escapeHtml(source.url)}" target="_blank" rel="noopener" data-to="source">${escapeHtml(source.title)}<span class="ext" aria-hidden="true">↗</span></a><p class="source-meta">${meta}</p>${source.reason ? `<p class="source-reason">${escapeHtml(source.reason)}</p>` : ""}</li>`;
  }).join("\n");
  const followups = answer.followups.length
    ? `<ul class="asks">${answer.followups.map(q => `<li><a href="${escapeHtml(askLink(q))}" rel="nofollow" data-to="followup">${escapeHtml(q)}</a></li>`).join("")}</ul>` : "";
  const related = context.related.length ? `<section class="block" aria-labelledby="related"><h2 id="related">别人还问了</h2><ul class="list">${context.related.map(row).join("\n")}</ul><a class="all" href="/ask" data-to="index">所有问题 →</a></section>` : "";
  const description = clip(plainText(answer.summary) || detail.question, 110);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage", "@id": url, url, name: detail.question, description, inLanguage: "zh-CN",
        datePublished: detail.published_at, dateModified: detail.updated_at, isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": PERSON_ID }, mainEntity: { "@id": `${url}#question` },
      },
      {
        "@type": "Question", "@id": `${url}#question`, name: detail.question, text: detail.question,
        ...(askedAt ? { dateCreated: askedAt } : {}), answerCount: 1,
        acceptedAnswer: {
          "@type": "Answer", url: `${url}#answer`, dateCreated: detail.published_at,
          text: [answer.summary, ...answer.sections.map(s => `${s.heading}：${s.body}`)].map(plainText).join("\n\n"),
          citation: answer.sources.map(source => ({ "@type": "CreativeWork", name: source.title, url: source.url })),
        },
      },
    ],
  };
  return frame({
    title: `${clip(detail.question, 56)} · 问问立正`, description, canonical: url, type: "article", jsonLd,
    robots: context.indexable ? "index, follow, max-snippet:-1, max-image-preview:large" : "noindex, follow",
    head: `<div class="head"><p class="kicker">${kicker}</p><h1>${phrases(detail.question)}</h1></div>`,
    body: `<article class="body" id="answer">
<div class="summary">${paragraphs(answer.summary, ids)}</div>
<p class="note">AI根据立正公开的文章和视频整理，不是他本人回复。重要的判断，请回到出处核对。</p>
${sections}
${limits}
${sources ? `<section class="block" aria-labelledby="sources"><h2 id="sources">出处</h2><ol class="sources">\n${sources}\n</ol></section>` : ""}
<section class="next" aria-labelledby="ask-own"><h2 id="ask-own">你也有想问的？</h2><p>问问立正会从立正公开的文章和视频里找出相关内容，整理回答，并给出出处。</p><a class="button" href="${escapeHtml(askLink(detail.question))}" rel="nofollow" data-to="similar">问类似的问题</a>${followups ? `<p>也可以接着问：</p>${followups}` : ""}</section>
${related}
</article>`,
  });
}

function row(card: PublicCard & { similar?: number }): string {
  const meta = [card.topic_label, card.asked_at ? `${chineseDate(card.asked_at)}提问` : "常被问到", (card.similar ?? 0) >= 2 ? `${card.similar}次类似提问` : ""]
    .filter(Boolean).map(part => `<span>${escapeHtml(part)}</span>`).join("");
  return `<li class="row"><a href="/ask/${card.public_id}" data-to="question"><span class="meta">${meta}</span><b>${escapeHtml(card.question)}</b>${card.summary ? `<p>${escapeHtml(clip(card.summary, 120))}</p>` : ""}</a></li>`;
}

/** Up to six other questions a reader may want next: its own topic first, then the newest. */
export function relatedCards(detail: Pick<PublicDetail, "public_id" | "topic_key">, cards: PublicCard[], limit = 6): PublicCard[] {
  const listed = listedCards(cards).filter(card => card.public_id !== detail.public_id);
  const same = listed.filter(card => card.topic_key === detail.topic_key);
  return [...same, ...listed.filter(card => card.topic_key !== detail.topic_key)].slice(0, limit);
}

/** /ask: every published question, one per question, newest asked first. */
export function renderIndexPage(cards: PublicCard[]): string {
  const reps = representatives(cards);
  const listed = listedCards(cards).slice(0, 500).map(card => ({ ...card, similar: similarAskings(card, cards, reps) }));
  const description = "别人问问立正的真实问题，去掉个人信息后由AI挑选整理。回答来自立正公开的文章和视频，附出处。";
  return frame({
    title: "别人在问什么 · 问问立正", description, canonical: ASK_INDEX, type: "website", robots: "index, follow",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage", "@id": ASK_INDEX, url: ASK_INDEX, name: "别人在问什么", description, inLanguage: "zh-CN",
      isPartOf: { "@id": WEBSITE_ID }, publisher: { "@id": PERSON_ID },
      mainEntity: { "@type": "ItemList", numberOfItems: listed.length,
        itemListElement: listed.slice(0, 100).map((card, i) => ({ "@type": "ListItem", position: i + 1, url: pageUrl(card.public_id), name: card.question })) },
    },
    head: `<div class="head"><p class="kicker"><span>问问立正</span>${listed.length ? `<span>${listed.length}个问题</span>` : ""}</p><h1>别人在问什么</h1><p class="lede">真实的提问，去掉个人信息后由AI挑选整理。回答来自立正公开的文章和视频，每条都附出处。</p><a class="button" href="${ASK_APP}" data-to="ask">问你自己的问题</a></div>`,
    body: `<div class="body">${listed.length ? `<ul class="list">\n${listed.map(row).join("\n")}\n</ul>` : `<p class="note">还没有公开的问题。</p>`}</div>`,
  });
}

/** A question that is not public (never was, or was withdrawn). */
export function renderMissingPage(): string {
  return frame({
    title: "这个问题不在了 · 问问立正", description: "这个问题已经不公开了，或者地址有误。", canonical: ASK_INDEX, type: "website",
    robots: "noindex, follow",
    head: `<div class="head"><h1>这个问题不在了</h1><p class="lede">它可能已经撤下，或者地址有误。</p><a class="button" href="/ask" data-to="index">看别人在问什么</a></div>`,
    body: "",
  });
}

/** The sitemap of /ask and the questions it lists, with the date each last changed. */
export function renderSitemap(cards: PublicCard[]): string {
  const listed = listedCards(cards);
  const latest = cards.reduce((max, card) => Math.max(max, Date.parse(card.updated_at)), 0);
  const urls = [
    { loc: ASK_INDEX, lastmod: latest ? new Date(latest).toISOString() : "" },
    ...listed.map(card => ({ loc: pageUrl(card.public_id), lastmod: card.updated_at })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeHtml(url.loc)}</loc>
${url.lastmod ? `    <lastmod>${isoDay(url.lastmod)}</lastmod>\n` : ""}  </url>`).join("\n")}
</urlset>
`;
}
