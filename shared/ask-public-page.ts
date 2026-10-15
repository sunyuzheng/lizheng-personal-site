/**
 * Public answer pages for search: every question published on 「别人在问什么」 gets its own page at
 * www.lizheng.ai/ask/<public_id>, rendered on the server so the question, answer and sources are in
 * the first HTML a crawler reads. /ask lists them and /ask/sitemap.xml names them for search
 * engines. The questions were published from Ops as they were asked (see docs/ask-lizheng.md); a
 * withdrawn one stops existing here as well. Each also has its own page in 问问立正,
 * ask.lizheng.ai/s/<day>/<word> (share_url, since 2026-10-14), the page its asker got. A question is a
 * whole conversation (2026-10-15): its page shows the follow-ups asked after it, read from the live
 * records, under the first answer.
 *
 * Only the first wording of a question is indexed: the same question asked in other words keeps its
 * page for links but asks search engines not to index it, and an answer too thin to help someone
 * arriving from search is not indexed either. Ops decides which is a later wording as it writes the
 * files (duplicate_of); since 2026-10-15 no page compares questions or reads every one of them
 * (the owner: 不应该每次访问实时计算; assume 1,000,000 public answers): a question's page reads its
 * own file, its topic's newest questions and the newest lists; /ask the newest days; each day has
 * its own page and sitemap.
 */
import { SEAL } from "./ask-seal.js";
import { sourceAttributionLabel } from "./ask-source-attribution.js";

// The site's ids in structured-data.ts, written out here: that module imports without file
// extensions, which a Vercel function cannot load.
export const SITE_URL = "https://www.lizheng.ai";
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const ASK_APP = "https://ask.lizheng.ai/";
export const ASK_INDEX = `${SITE_URL}/ask`;
export const OG_IMAGE = `${SITE_URL}/og/home-zh.jpg`;
/** A question's page here: /ask/<day>/<word>, the same address as its own page in 问问立正
 * (ask.lizheng.ai/s/<day>/<word>, its share_url), since 2026-10-14; /ask/<public_id> for one without. */
export function wwwPagePath(card: { public_id: string; share_url?: string }): string {
  const parts = card.share_url?.match(/^https:\/\/ask\.lizheng\.ai\/s\/(\d{4}-\d{2}-\d{2})\/([a-z0-9-]+)$/);
  return parts ? `/ask/${parts[1]}/${parts[2]}` : `/ask/${card.public_id}`;
}
export const pageUrl = (card: { public_id: string; share_url?: string }) => `${SITE_URL}${wwwPagePath(card)}`;
export const PUBLIC_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export type PublicCard = {
  public_id: string; revision: number; topic_key: string; topic_label: string; question: string; summary: string;
  published_at: string; updated_at: string; asked_at?: string; topic_question_count?: number; share_url?: string;
  // A later wording of the question this one names, first asked in its topic (Ops, as it writes the files).
  duplicate_of?: string;
};
export type PublicSource = {
  id: string; title: string; url: string; date?: string; source_type?: string; reason?: string; source_visibility?: string;
} & Partial<Record<
  "excerpt" | "author" | "attribution_note" | "public_copy_url" | "evidence_role" | "timecode" |
  "text_access" | "membership_platform" | "membership_url" | "membership_verified_at" |
  "transcript_source_kind" | "transcript_quality" | "speaker_classification" |
  "data_layer" | "speaker_id" | "speaker_name" | "speaker_status" | "fragment_id" |
  "source_snapshot_sha256" | "participant_names" | "participant_entity_ids" | "participant_aliases" |
  "participant_metadata_basis" | "speech_act" | "content_origin" | "generation_method", string
>>;
const SOURCE_METADATA = [
  "excerpt", "author", "attribution_note", "public_copy_url", "evidence_role", "timecode",
  "text_access", "membership_platform", "membership_url", "membership_verified_at",
  "transcript_source_kind", "transcript_quality", "speaker_classification",
  "data_layer", "speaker_id", "speaker_name", "speaker_status", "fragment_id",
  "source_snapshot_sha256", "participant_names", "participant_entity_ids", "participant_aliases",
  "participant_metadata_basis", "speech_act", "content_origin", "generation_method",
] as const;
export type PublicSection = { heading: string; body: string; kind: string; source_ids: string[] };
export type PublicAnswer = {
  status: string; summary: string; sections: PublicSection[]; sources: PublicSource[]; followups: string[]; limitations: string;
};
export type PublicDetail = {
  public_id: string; revision: number; topic_key: string; topic_label: string; question: string;
  answer: PublicAnswer; published_at: string; updated_at: string; share_url?: string; duplicate_of?: string;
};
/** A topic's newest questions and how many questions it gathers (Ops' public/topic/<topic>.json). */
export type PublicTopicFile = { topic_key: string; topic_label: string; count: number; cards: PublicCard[] };
/** The questions asked on one day, newest first (public/days/<day>.json). */
export type PublicDayFile = { day: string; cards: PublicCard[] };
/** Every day with public questions, newest first, and how many in all (public/days.json). */
export type PublicDaysFile = { days: { day: string; count: number }[]; total: number };
/** A question's own page in 问问立正: ask.lizheng.ai/s/<day>/<word>. */
export const ANSWER_PAGE = /^https:\/\/ask\.lizheng\.ai\/s\/\d{4}-\d{2}-\d{2}\/[a-z0-9]{1,40}(?:-[a-z0-9]{1,40}){0,4}$/;
const page = (value: unknown) => (typeof value === "string" && ANSWER_PAGE.test(value) ? { share_url: value } : {});

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

const firstOf = (value: unknown) => (typeof value === "string" && PUBLIC_ID.test(value) ? { duplicate_of: value } : {});
/** A card from Ops' public files, or null when it is not one. Likes are not shown on these pages. */
export function publicCard(value: unknown): PublicCard | null {
  const r = value as Record<string, unknown> | null;
  if (!r || typeof r !== "object" || typeof r.public_id !== "string" || !PUBLIC_ID.test(r.public_id) || !count(r.revision) ||
      typeof r.topic_key !== "string" || !text(r.topic_label, 80) || !text(r.question, 2000) || typeof r.summary !== "string" ||
      !time(r.published_at) || !time(r.updated_at) || (r.topic_question_count !== undefined && !count(r.topic_question_count)) ||
      (r.asked_at !== undefined && !time(r.asked_at))) return null;
  return {
    public_id: r.public_id, revision: r.revision as number, topic_key: r.topic_key, topic_label: r.topic_label as string,
    question: (r.question as string).trim(), summary: r.summary.trim(), published_at: r.published_at as string,
    updated_at: r.updated_at as string, ...(count(r.topic_question_count) ? { topic_question_count: r.topic_question_count } : {}),
    ...(r.asked_at ? { asked_at: r.asked_at as string } : {}), ...page(r.share_url), ...firstOf(r.duplicate_of),
  };
}
const cardsOf = (value: unknown) => (Array.isArray(value) ? value.map(publicCard).filter((card): card is PublicCard => !!card) : null);
const DAY = /^\d{4}-\d{2}-\d{2}$/;
/** A topic's file, or null when it is not one. */
export function publicTopicFile(value: unknown): PublicTopicFile | null {
  const r = value as Record<string, unknown> | null, cards = cardsOf(r?.cards);
  if (!r || typeof r.topic_key !== "string" || !text(r.topic_label, 80) || !count(r.count) || !cards) return null;
  return { topic_key: r.topic_key, topic_label: r.topic_label as string, count: r.count as number, cards };
}
/** A day's file, or null when it is not one. */
export function publicDayFile(value: unknown): PublicDayFile | null {
  const r = value as Record<string, unknown> | null, cards = cardsOf(r?.cards);
  if (!r || typeof r.day !== "string" || !DAY.test(r.day) || !cards) return null;
  return { day: r.day, cards };
}
/** The list of days, or null when it is not one. */
export function publicDaysFile(value: unknown): PublicDaysFile | null {
  const r = value as Record<string, unknown> | null;
  if (!r || !Array.isArray(r.days) || !count(r.total)) return null;
  const days = (r.days as Record<string, unknown>[]).filter(d => d && typeof d.day === "string" && DAY.test(d.day) && count(d.count))
    .map(d => ({ day: d.day as string, count: d.count as number }));
  return { days, total: r.total as number };
}

/** A published question with its answer from Ops, or null when it is not one. */
export function publicDetail(value: unknown): PublicDetail | null {
  const r = value as Record<string, unknown> | null;
  const a = r?.answer as Record<string, unknown> | undefined;
  if (!r || typeof r !== "object" || typeof r.public_id !== "string" || !PUBLIC_ID.test(r.public_id) || !count(r.revision) ||
      typeof r.topic_key !== "string" || !text(r.topic_label, 80) || !text(r.question, 2000) || !time(r.published_at) ||
      !time(r.updated_at) || !a || typeof a !== "object" || typeof a.status !== "string" || typeof a.summary !== "string" ||
      !Array.isArray(a.sections) || !Array.isArray(a.sources)) return null;
  const sources: PublicSource[] = [];
  for (const s of a.sources as Record<string, unknown>[]) {
    if (!s || typeof s.id !== "string" || !/^S\d{1,2}$/.test(s.id) || !text(s.title, 1000) || !https(s.url)) continue;
    const pick = (key: string) => (typeof s[key] === "string" && (s[key] as string).trim() ? { [key]: (s[key] as string).trim() } : {});
    sources.push({ id: s.id, title: (s.title as string).trim(), url: s.url as string, ...pick("date"), ...pick("source_type"),
      ...pick("reason"), ...pick("source_visibility"),
      ...Object.fromEntries(SOURCE_METADATA.filter(key => typeof s[key] === "string").map(key => [key, s[key]])) });
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
    ...page(r.share_url), ...firstOf(r.duplicate_of),
    answer: {
      status: a.status, summary: a.summary.trim(), sections, sources, followups: strings(a.followups, 3),
      limitations: typeof a.limitations === "string" ? a.limitations.trim() : "",
    },
  };
}

/** A question a listing shows: its first wording, long enough to stand alone. */
export const listable = (card: Pick<PublicCard, "question" | "duplicate_of">) => !card.duplicate_of && Array.from(card.question).length >= 6;
/** The day a question was asked (Beijing), as its page's address names it. */
export const dayOf = (card: { share_url?: string }) => card.share_url?.match(/\/s\/(\d{4}-\d{2}-\d{2})\//)?.[1];

const bodyLength = (answer: PublicAnswer) => answer.sections.reduce((n, s) => n + Array.from(s.body).length, 0);

/**
 * Whether search engines should index a page: a full answer with sources, long enough to help
 * someone arriving from search, and the first wording of its question.
 */
export function indexable(detail: PublicDetail): boolean {
  return detail.answer.status === "answered" && detail.answer.sources.length > 0 && bodyLength(detail.answer) >= 200 &&
    Array.from(detail.question).length >= 6 && !detail.duplicate_of;
}

/* ---------- Text ---------- */

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ESCAPES[c]);
export const clip = (value: string, max: number) => {
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
// `anchor` starts the id of each source a mark links to: source-1, or t2-source-1 for a follow-up's.
function inline(value: string, ids: Set<string>, anchor = "source-"): string {
  const plain = value.replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, "$1").replace(/\s+(?=\[S\d{1,2}\])/g, "");
  // Marks side by side ([S1][S2]) read as 1,2, not as 12.
  return plain.split(/((?:\[S\d{1,2}\]\s*)+)/g).map(part => {
    if (/^(?:\[S\d{1,2}\]\s*)+$/.test(part)) {
      const marks = [...part.matchAll(/S(\d{1,2})/g)].filter(m => ids.has(`S${m[1]}`))
        .map(m => `<a class="cite" href="#${anchor}${m[1]}" aria-label="出处${m[1]}">${m[1]}</a>`);
      return marks.length ? `\u2060${marks.join('<span class="cite-sep">,</span>')}` : "";
    }
    return escapeHtml(part).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }).join("");
}
export function paragraphs(value: string, ids: Set<string>, anchor = "source-"): string {
  return value.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean).map(block => {
    const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
    if (lines.length > 1 && lines.every(line => /^([-*•]|\d+[.、])\s+/.test(line)))
      return `<ul>${lines.map(line => `<li>${inline(line.replace(/^([-*•]|\d+[.、])\s+/, ""), ids, anchor)}</li>`).join("")}</ul>`;
    return `<p>${inline(lines.join(""), ids, anchor)}</p>`;
  }).join("");
}
export const plainText = (value: string) => value.replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, "$1").replace(/\[S\d{1,2}\]/g, "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

const KIND: Record<string, string> = { source: "材料里的观点", application: "AI推演" };
/** A title in phrases that break only between them, at Chinese punctuation (as on the homepage). */
export const phrases = (value: string) => (value.match(/[^，：；、？！。]+[，：；、？！。]*/g) ?? [value])
  .map(part => `<span class="phrase">${escapeHtml(part)}</span>`).join("");
export function sourceKind(source: PublicSource): string {
  const host = new URL(source.url).hostname;
  const member = source.source_visibility === "members-only";
  if (source.source_type === "course-lesson") return member ? "会员课程" : "课程";
  if (source.source_type === "book-chapter") return "书";
  if (source.source_type === "blog-post") return "Statsig博客";
  if (/(^|\.)youtube\.com$|youtu\.be$/.test(host)) return member ? "会员视频" : "视频";
  if (/superlinear\.academy$/.test(host)) return member ? "超线性学院 · 会员" : "超线性学院";
  if (/(^|\.)lizheng\.ai$/.test(host)) return "文章";
  if (host === "github.com") return "GitHub";
  return host.replace(/^www\./, "");
}

/* ---------- Page ---------- */

export const STYLE = `
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
.turn{margin-top:64px;padding-top:26px;border-top:2px solid var(--ink);scroll-margin-top:24px}
.turn-kicker{font-size:13.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.turn-kicker span+span::before{content:"·";margin:0 8px}
.turn-question{margin:10px 0 20px;font:900 clamp(23px,2.8vw,30px)/1.38 var(--serif);letter-spacing:.005em;font-feature-settings:"palt"}
.section h3{font-size:18.5px;font-weight:700;line-height:1.5}
.turn .block{margin-top:40px}
.turn .block>h3{padding-bottom:10px;border-bottom:1px solid var(--ink);font:700 17px/1.4 var(--serif);letter-spacing:.02em}
.next{margin-top:56px;padding:28px 0 0;border-top:2px solid var(--ink)}
.next h2{font:900 clamp(22px,2.4vw,26px)/1.35 var(--serif)}
.next p{margin-top:10px;color:var(--ink-2)}
.next .buttons{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}
.button.line{background:transparent;color:var(--green);box-shadow:inset 0 0 0 1.5px var(--green)}.button.line:hover{background:transparent;color:var(--green-deep);box-shadow:inset 0 0 0 1.5px var(--green-deep)}
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
.days{list-style:none;padding:0}
.days li{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 16px;padding:14px 0;border-bottom:1px solid var(--rule);font-variant-numeric:tabular-nums}
.days .month{flex:0 0 6.5em;font-weight:600;color:var(--ink)}
.days a{font-size:15px;color:var(--ink-2)}.days a:hover{color:var(--green-text)}
.days small{margin-left:4px;font-size:12px;color:var(--faint)}
.pager{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 24px;margin-top:36px;font-size:14.5px;font-weight:600;color:var(--green-text)}
.pager a:hover{color:var(--green-deep)}
footer{border-top:1px solid var(--rule);color:var(--muted);font-size:13px}
footer .body{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 24px;padding-top:22px;padding-bottom:40px}
footer nav{display:flex;flex-wrap:wrap;gap:6px 18px}footer a:hover{color:var(--green-text)}
@media (max-width:560px){.bar nav a:first-child{display:none}.days .month{flex-basis:100%}.head h1{font-size:28px;line-height:1.35}.section p,.section li{font-size:16.5px}.button{width:100%}}
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
/** A follow-up asked after the question, as its page shows it. */
export type PageFollowUp = { question: string; created_at: string; answer: PublicAnswer };

/** One follow-up under the first answer: #answer-<n> (n from 2), its sources #t<n>-source-<id>. */
function followUpSection(turn: PageFollowUp, n: number): string {
  const { answer } = turn;
  const ids = new Set(answer.sources.map(source => source.id));
  const anchor = `t${n}-source-`;
  const sections = answer.sections.map(section => {
    const marked = /\[S\d{1,2}\]/.test(section.body);
    const loose = marked ? "" : section.source_ids.filter(id => ids.has(id))
      .map(id => `<a class="cite" href="#${anchor}${id.slice(1)}" aria-label="出处${id.slice(1)}">${id.slice(1)}</a>`).join(" ");
    const kind = KIND[section.kind] ? `<span class="kind kind-${escapeHtml(section.kind)}">${KIND[section.kind]}</span>` : "";
    return `<section class="section"><div class="section-head"><h3>${escapeHtml(section.heading)}</h3>${kind}</div>${paragraphs(section.body, ids, anchor)}${loose ? `<p class="cites">出处 ${loose}</p>` : ""}</section>`;
  }).join("\n");
  const limits = answer.limitations
    ? `<div class="limits">${paragraphs(answer.limitations.replace(/\[?\b(S\d{1,2})\b\]?/g, "[$1]"), ids, anchor)}</div>` : "";
  const sources = answer.sources.map(source => {
    let kind: string;
    try { kind = sourceKind(source); } catch { return ""; }
    const attribution = sourceAttributionLabel(source);
    const meta = [`<span${/会员/.test(kind) ? ' class="member"' : ""}>${escapeHtml(kind)}</span>`, attribution ? `<span>${escapeHtml(attribution)}</span>` : "", source.date && /^\d{4}-\d{2}-\d{2}/.test(source.date) ? `<span>${source.date.slice(0, 10)}</span>` : ""].join("");
    return `<li class="source" id="${anchor}${source.id.slice(1)}"><span class="num">${source.id.slice(1)}</span><a class="source-title" href="${escapeHtml(source.url)}" target="_blank" rel="noopener" data-to="source">${escapeHtml(source.title)}<span class="ext" aria-hidden="true">↗</span></a><p class="source-meta">${meta}</p>${source.reason ? `<p class="source-reason">${escapeHtml(source.reason)}</p>` : ""}</li>`;
  }).filter(Boolean).join("\n");
  const when = turn.created_at && Number.isFinite(Date.parse(turn.created_at)) ? `<span>${escapeHtml(chineseDate(turn.created_at))}</span>` : "";
  return `<section class="turn" id="answer-${n}" aria-labelledby="question-${n}">
<p class="turn-kicker"><span>追问</span>${when}</p>
<h2 class="turn-question" id="question-${n}">${phrases(turn.question)}</h2>
<div class="summary">${paragraphs(answer.summary, ids, anchor)}</div>
${sections}
${limits}
${sources ? `<section class="block"><h3>出处</h3><ol class="sources">\n${sources}\n</ol></section>` : ""}
</section>`;
}

export function renderQuestionPage(detail: PublicDetail, context: {
  // How many questions its topic gathers (its file's count): 类似提问 from two.
  related: PublicCard[]; similar: number; indexable: boolean;
  // The follow-ups asked after it in the same conversation (2026-10-15), oldest first.
  followUps?: PageFollowUp[];
}): string {
  const { answer } = detail;
  const followUps = context.followUps ?? [];
  const ids = new Set(answer.sources.map(source => source.id));
  const url = pageUrl(detail);
  // The day it was asked, Beijing time, as its address names it.
  const askedAt = dayOf(detail);
  const kicker = [detail.topic_label, askedAt ? `${chineseDate(askedAt)}提问` : "常被问到", followUps.length ? `追问${followUps.length}次` : "",
    context.similar >= 2 ? `${context.similar}次类似提问` : ""]
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
    const attribution = sourceAttributionLabel(source);
    const meta = [`<span${/会员/.test(kind) ? ' class="member"' : ""}>${escapeHtml(kind)}</span>`, attribution ? `<span>${escapeHtml(attribution)}</span>` : "", source.date && /^\d{4}-\d{2}-\d{2}/.test(source.date) ? `<span>${source.date.slice(0, 10)}</span>` : ""].join("");
    return `<li class="source" id="source-${source.id.slice(1)}"><span class="num">${source.id.slice(1)}</span><a class="source-title" href="${escapeHtml(source.url)}" target="_blank" rel="noopener" data-to="source">${escapeHtml(source.title)}<span class="ext" aria-hidden="true">↗</span></a><p class="source-meta">${meta}</p>${source.reason ? `<p class="source-reason">${escapeHtml(source.reason)}</p>` : ""}</li>`;
  }).join("\n");
  // What to ask next: the last answer's suggestions.
  const next = (followUps.at(-1)?.answer ?? answer).followups;
  const followups = next.length
    ? `<ul class="asks">${next.map(q => `<li><a href="${escapeHtml(askLink(q))}" rel="nofollow" data-to="followup">${escapeHtml(q)}</a></li>`).join("")}</ul>` : "";
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
${followUps.map((turn, i) => followUpSection(turn, i + 2)).join("\n")}
<section class="next" aria-labelledby="ask-own"><h2 id="ask-own">你也有想问的？</h2><p>卡住的时候，问问立正：回答附有出处，可以点回原文核对。</p><div class="buttons">${detail.share_url ? `<a class="button" href="${escapeHtml(detail.share_url)}" data-to="continue">在问问立正里接着问</a>` : ""}<a class="button${detail.share_url ? " line" : ""}" href="${escapeHtml(askLink(detail.question))}" rel="nofollow" data-to="similar">问类似的问题</a></div>${followups ? `<p>也可以接着问：</p>${followups}` : ""}</section>
${related}
</article>`,
  });
}

function row(card: PublicCard): string {
  const meta = [card.topic_label, card.asked_at ? `${chineseDate(card.asked_at)}提问` : "常被问到"]
    .filter(Boolean).map(part => `<span>${escapeHtml(part)}</span>`).join("");
  return `<li class="row"><a href="${wwwPagePath(card)}" data-to="question"><span class="meta">${meta}</span><b>${escapeHtml(card.question)}</b>${card.summary ? `<p>${escapeHtml(clip(card.summary, 120))}</p>` : ""}</a></li>`;
}

/** Up to six other questions a reader may want next: its topic's newest first, then the newest asked. */
export function relatedOf(detail: Pick<PublicDetail, "public_id">, topic: PublicTopicFile | null, recent: PublicCard[], limit = 6): PublicCard[] {
  const seen = new Set([detail.public_id]), out: PublicCard[] = [];
  for (const card of [...(topic?.cards ?? []), ...recent]) {
    if (out.length >= limit) break;
    if (seen.has(card.public_id) || !listable(card)) continue;
    seen.add(card.public_id);
    out.push(card);
  }
  return out;
}

// The days of one month under /ask: 10月15日 (24).
function months(days: PublicDaysFile["days"]): string {
  const byMonth = new Map<string, PublicDaysFile["days"]>();
  for (const day of days) byMonth.set(day.day.slice(0, 7), [...(byMonth.get(day.day.slice(0, 7)) ?? []), day]);
  return [...byMonth].map(([month, list]) => `<li><span class="month">${Number(month.slice(0, 4))}年${Number(month.slice(5))}月</span>${list
    .map(day => `<a href="/ask/${day.day}" data-to="day">${Number(day.day.slice(8))}日<small>${day.count}</small></a>`).join("")}</li>`).join("\n");
}
const dayHead = (day: string) => `${Number(day.slice(0, 4))}年${Number(day.slice(5, 7))}月${Number(day.slice(8))}日`;

/** /ask: the newest questions, one per question, newest asked first, and every day that has some. */
export function renderIndexPage(days: PublicDaysFile, newest: PublicCard[]): string {
  const listed = newest.filter(listable);
  const description = "别人问问立正的真实问题，原样展示。回答来自立正公开的文章和视频，附出处。";
  const archive = days.days.length ? `<section class="block" aria-labelledby="by-day"><h2 id="by-day">按日期</h2><ul class="days">\n${months(days.days)}\n</ul></section>` : "";
  return frame({
    title: "别人在问什么 · 问问立正", description, canonical: ASK_INDEX, type: "website", robots: "index, follow",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage", "@id": ASK_INDEX, url: ASK_INDEX, name: "别人在问什么", description, inLanguage: "zh-CN",
      isPartOf: { "@id": WEBSITE_ID }, publisher: { "@id": PERSON_ID },
      mainEntity: { "@type": "ItemList", numberOfItems: listed.length,
        itemListElement: listed.slice(0, 100).map((card, i) => ({ "@type": "ListItem", position: i + 1, url: pageUrl(card), name: card.question })) },
    },
    head: `<div class="head"><p class="kicker"><span>问问立正</span>${days.total ? `<span>${days.total}个问题</span>` : ""}</p><h1>别人在问什么</h1><p class="lede">真实的提问，原样展示。回答来自立正公开的文章和视频，每条都附出处。</p><a class="button" href="${ASK_APP}" data-to="ask">问你自己的问题</a></div>`,
    body: `<div class="body">${listed.length ? `<ul class="list">\n${listed.map(row).join("\n")}\n</ul>` : `<p class="note">还没有公开的问题。</p>`}
${archive}</div>`,
  });
}

/** /ask/<day>: the questions asked that day (Beijing time), newest first; the days before and after. */
export function renderDayPage(day: PublicDayFile, days: PublicDaysFile | null): string {
  const listed = day.cards.filter(listable);
  const url = `${ASK_INDEX}/${day.day}`;
  const at = days?.days.findIndex(other => other.day === day.day) ?? -1;
  // Newest first: the next day is the one before it in the list.
  const later = at > 0 ? days!.days[at - 1].day : null, earlier = at >= 0 ? days!.days[at + 1]?.day ?? null : null;
  const nav = [earlier ? `<a href="/ask/${earlier}" data-to="day">← ${dayHead(earlier)}</a>` : "", `<a href="/ask" data-to="index">所有问题</a>`,
    later ? `<a href="/ask/${later}" data-to="day">${dayHead(later)} →</a>` : ""].filter(Boolean).join("");
  return frame({
    title: `${dayHead(day.day)}的提问 · 问问立正`, description: `${dayHead(day.day)}别人问问立正的问题，原样展示，回答附出处。`,
    canonical: url, type: "website",
    // A list for finding questions; the questions' own pages are what search shows.
    robots: "noindex, follow",
    head: `<div class="head"><p class="kicker"><span>问问立正</span><span>${day.cards.length}个问题</span></p><h1>${dayHead(day.day)}的提问</h1></div>`,
    body: `<div class="body">${listed.length ? `<ul class="list">\n${listed.map(row).join("\n")}\n</ul>` : `<p class="note">这一天的问题都已在别处问过。</p>`}
<nav class="pager" aria-label="按日期">${nav}</nav></div>`,
  });
}

/** A question, or a day, that is not public (never was, or was withdrawn). */
export function renderMissingPage(what: "question" | "day" = "question"): string {
  const [title, lede] = what === "day" ? ["这一天没有公开的问题", "换一天看看，或者看最新的问题。"] : ["这个问题不在了", "它可能已经撤下，或者地址有误。"];
  return frame({
    title: `${title} · 问问立正`, description: what === "day" ? "这一天没有公开的问题。" : "这个问题已经不公开了，或者地址有误。",
    canonical: ASK_INDEX, type: "website", robots: "noindex, follow",
    head: `<div class="head"><h1>${title}</h1><p class="lede">${lede}</p><a class="button" href="/ask" data-to="index">看别人在问什么</a></div>`,
    body: "",
  });
}

/** /ask/sitemap.xml: one sitemap per day with public questions, newest first. */
export function renderSitemapIndex(days: PublicDaysFile): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${days.days.map(day => `  <sitemap>
    <loc>${ASK_INDEX}/sitemap/${day.day}.xml</loc>
  </sitemap>`).join("\n")}
</sitemapindex>
`;
}

/** One day's sitemap: the questions asked that day that /ask lists, with the date each last
 * changed; the newest day's also has /ask itself. */
export function renderDaySitemap(day: PublicDayFile, newest: boolean): string {
  const listed = day.cards.filter(listable);
  const latest = day.cards.reduce((max, card) => Math.max(max, Date.parse(card.updated_at)), 0);
  const urls = [
    ...(newest ? [{ loc: ASK_INDEX, lastmod: latest ? new Date(latest).toISOString() : "" }] : []),
    ...listed.map(card => ({ loc: pageUrl(card), lastmod: card.updated_at })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeHtml(url.loc)}</loc>
${url.lastmod ? `    <lastmod>${isoDay(url.lastmod)}</lastmod>\n` : ""}  </url>`).join("\n")}
</urlset>
`;
}
