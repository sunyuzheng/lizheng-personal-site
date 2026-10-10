/**
 * The web versions of the decks at /decks/<slug>: one page per deck, written as static HTML during the
 * build so every slide's words (and the talk script, where the deck ships one) are in the first HTML a
 * crawler reads. Each slide shows as its own picture with its text beside it.
 *
 * What a page says comes from two places. The card in shared/deck-index.ts (title, occasion, audience,
 * takeaway, links) is the same text the /decks index shows. The slides come from
 * content/decks/pages/<file>.json and client/public/deck-slides/<file>/, which
 * scripts/decks/capture_decks.mjs reads from each deck's public slides (see content/decks/README.md).
 * The deck projects keep owning their slides; these pages are regenerated from them, never edited here.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEAL } from "../shared/ask-seal.ts";
import { fakeLearningCitations, renderFakeLearningFeature } from "./decks/fake-learning-feature.ts";
import {
  DECK_LIBRARY,
  deckForLanguage,
  localized,
  type DeckEntry,
} from "../shared/deck-index.ts";
import type { SiteLang } from "../shared/page-meta.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAPTURES = path.join(ROOT, "content", "decks", "pages");
const SITE_URL = "https://www.lizheng.ai";
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PERSON = { "@type": "Person", "@id": PERSON_ID, name: "Yuzheng Sun", alternateName: ["孙煜征", "立正", "课代表立正"], url: `${SITE_URL}/` };

interface Block {
  text: string;
  tag: string;
  fs: number;
  fw: number;
  li: boolean;
  box?: [number, number, number, number];
  /** Set when row merging joined table cells. */
  cell?: boolean;
}

interface CapturedSlide {
  n: number;
  image: string;
  title: string;
  chapter?: string;
  blocks: Block[];
  links: Array<{ href: string; text: string }>;
  notes: string[];
}

interface Capture {
  page: string;
  deck: string;
  language: "zh" | "en";
  capturedFrom: string;
  capturedAt: string;
  slides: CapturedSlide[];
}

type Line = { kind: "p" | "li" | "strong"; text: string };

interface Slide {
  n: number;
  image: string;
  title: string;
  kicker: string;
  chapter: string;
  lines: Line[];
  notes: string[];
  links: Array<{ href: string; text: string }>;
}

interface DeckPage {
  path: string;
  file: string;
  lang: SiteLang;
  card: DeckEntry;
  /** The other language's page of the same deck, if there is one. */
  alternate?: { path: string; lang: SiteLang; title: string };
  capturedAt: string;
  slides: Slide[];
}

// ---------- text ----------

const CJK = /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef\u3000-\u303f]/;

/** Joins a slide's visual line breaks back into running text. */
function joinLines(text: string): string {
  return text
    .split("\n")
    .map(part => part.trim())
    .filter(Boolean)
    .reduce((out, part) => {
      if (!out) return part;
      const a = out.at(-1) ?? "";
      const b = part[0] ?? "";
      return out + (CJK.test(a) || CJK.test(b) ? "" : " ") + part;
    }, "");
}

/** "结果 与过程" (a label's line break read as a space) → "结果与过程". */
const tightenCjk = (text: string) => text.replace(new RegExp(`(?<=${CJK.source}) (?=${CJK.source})`, "g"), "");

const norm = (text: string) => text.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");

function nearlySame(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const [short, long] = x.length < y.length ? [x, y] : [y, x];
  return long.includes(short) && short.length / long.length > 0.6;
}

const onlyMarks = (text: string) => /^[\s\p{P}\p{S}]*$/u.test(text);
const median = (values: number[]) => {
  if (!values.length) return 16;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

/** Items on one line of a slide (a number and its label, words split by arrows) become one line of text. */
function mergeRows(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (const block of blocks) {
    const last = out.at(-1);
    if (last?.box && block.box) {
      const [ax, ay, aw, ah] = last.box;
      const [bx, by, bw, bh] = block.box;
      const overlap = Math.min(ay + ah, by + bh) - Math.max(ay, by);
      const gap = bx - (ax + aw);
      if (overlap >= 0.5 * Math.min(ah, bh) && gap > -4 && gap < 90 && Math.max(ah, bh) < 3 * Math.min(ah, bh)) {
        const cells = /^t[dh]$/.test(last.tag) || /^t[dh]$/.test(block.tag) || last.cell;
        last.text = `${last.text}${cells ? " | " : " "}${block.text}`;
        last.cell = cells;
        last.box = [ax, Math.min(ay, by), bx + bw - ax, Math.max(ay + ah, by + bh) - Math.min(ay, by)];
        last.fs = Math.max(last.fs, block.fs);
        last.fw = Math.max(last.fw, block.fw);
        continue;
      }
    }
    out.push({ ...block });
  }
  return out;
}

/** Turns what the capture read off each slide into a title, a kicker and lines a reader can follow. */
function readSlides(capture: Capture): Slide[] {
  const total = capture.slides.length;
  // Text on many slides (deck title, speaker name, footer) is the deck's frame, not the slide's content.
  const seen = new Map<string, number>();
  for (const slide of capture.slides) {
    for (const key of new Set(slide.blocks.map(b => norm(b.text)))) seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const frame = (text: string) => total >= 6 && (seen.get(norm(text)) ?? 0) >= Math.max(3, Math.ceil(total * 0.3));

  return capture.slides.map(slide => {
    let blocks = mergeRows(slide.blocks.filter(b => b.text.trim() && !frame(b.text)));
    // Marks, small page numbers, "03 / 15" counters and "0:45–1:05" timecodes are the deck's furniture.
    blocks = blocks.filter(b => {
      const text = b.text.trim();
      return !onlyMarks(text) && !(/^\d{1,3}$/.test(text) && b.fs <= 14) && !/^\d{1,3}\s*\/\s*\d{1,3}$/.test(text) && !/^\d{1,2}:\d{2}\s*[–—-]\s*\d{1,2}:\d{2}$/.test(text);
    });

    let title = joinLines(slide.title || "");
    let titleAt = title ? blocks.findIndex(b => nearlySame(joinLines(b.text), title)) : -1;
    if (!title) {
      titleAt = blocks.findIndex(b => b.tag === "h1" || b.tag === "h2");
      if (titleAt < 0) {
        // No heading tag: the biggest short text on the slide.
        const sizes = blocks.map(b => (joinLines(b.text).length <= 90 && b.tag !== "svg" ? b.fs : 0));
        const biggest = Math.max(0, ...sizes);
        if (biggest > 0) titleAt = sizes.indexOf(biggest);
      }
      title = titleAt >= 0 ? joinLines(blocks[titleAt].text) : "";
    }
    const titleSize = titleAt >= 0 ? blocks[titleAt].fs : 40;

    // Small labels above the title: keep the nearest as the kicker, drop the numbering.
    let kicker = slide.chapter ? tightenCjk(joinLines(slide.chapter)) : "";
    if (titleAt > 0) {
      const before = blocks.slice(0, titleAt);
      const small = before.every(b => joinLines(b.text).length <= 36);
      if (small) {
        const label = [...before].reverse().find(b => !/^[\d\s.·/|-]+$/.test(b.text) && b.fs <= 0.6 * titleSize);
        if (label && !kicker) kicker = joinLines(label.text);
        blocks = blocks.slice(titleAt);
        titleAt = 0;
      }
    }
    if (titleAt >= 0) blocks.splice(titleAt, 1);
    blocks = blocks.filter(b => !nearlySame(b.text, title) && !(kicker && nearlySame(b.text, kicker)));

    // A short token (a number, "A组", "¥0") reads as the start of the line after it.
    const merged: Block[] = [];
    for (let i = 0; i < blocks.length; i++) {
      const text = joinLines(blocks[i].text);
      if (text.length <= 4 && i + 1 < blocks.length && blocks[i].tag !== "svg") {
        blocks[i + 1] = { ...blocks[i + 1], text: `${text} ${blocks[i + 1].text}` };
        continue;
      }
      merged.push({ ...blocks[i], text });
    }

    const body = median(merged.map(b => b.fs).filter(Boolean));
    const lines: Line[] = [];
    for (const block of merged) {
      const text = joinLines(block.text);
      if (!text || lines.at(-1)?.text === text) continue;
      lines.push({ kind: block.li ? "li" : block.fw >= 650 && block.fs >= body ? "strong" : "p", text });
    }

    return {
      n: slide.n,
      image: slide.image,
      title: title || (capture.language === "zh" ? `第${slide.n}页` : `Slide ${slide.n}`),
      kicker,
      chapter: slide.chapter ? tightenCjk(joinLines(slide.chapter)) : "",
      lines,
      // A paragraph that is only a bracketed cue ("[Pause about ten seconds.]") is for the speaker.
      notes: slide.notes.filter(p => !/^\s*[[［【][^\]］】]*[\]］】]\s*$/.test(p)),
      links: slide.links.filter(link => !/^https?:\/\/(www\.)?lizheng\.ai\/?$/.test(link.href)),
    };
  });
}

// ---------- data ----------

const fileOf = (page: string) => page.replace(/^\/decks\//, "").replaceAll("/", "-");

function loadPages(): DeckPage[] {
  if (!fs.existsSync(CAPTURES)) return [];
  const pages: DeckPage[] = [];
  for (const name of fs.readdirSync(CAPTURES).filter(f => f.endsWith(".json")).sort()) {
    const capture: Capture = JSON.parse(fs.readFileSync(path.join(CAPTURES, name), "utf-8"));
    const entry = DECK_LIBRARY.find(deck => deck.id === capture.deck);
    if (!entry) throw new Error(`${name}: no card in shared/deck-index.ts has id ${capture.deck}`);
    const lang: SiteLang = capture.language;
    const card = deckForLanguage(entry, lang);
    if (card.page !== capture.page) throw new Error(`${name}: the card for ${capture.deck} in ${lang} points to ${card.page}, not ${capture.page}`);
    const alt = card.alternateEdition?.page
      ? { path: card.alternateEdition.page, lang: card.alternateEdition.language as SiteLang, title: card.alternateEdition.title }
      : undefined;
    pages.push({ path: capture.page, file: fileOf(capture.page), lang, card, alternate: alt, capturedAt: capture.capturedAt, slides: readSlides(capture) });
  }
  for (const deck of DECK_LIBRARY) {
    for (const page of [deck.page, deck.alternateEdition?.page].filter(Boolean) as string[]) {
      if (!pages.some(p => p.path === page)) throw new Error(`shared/deck-index.ts: ${deck.id} has a web version at ${page}, but content/decks/pages/${fileOf(page)}.json is missing`);
    }
  }
  return pages;
}

/** The addresses the sitemap lists, with the date the slides were last read. */
export function deckSitemapUrls(): Array<{ loc: string; lastmod: string }> {
  return loadPages().map(page => ({ loc: `${SITE_URL}${page.path}`, lastmod: page.capturedAt }));
}

// ---------- html ----------

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function longDate(iso: string, lang: SiteLang): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (lang === "zh") return `${y}年${m}月${d}日`;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

const COPY = {
  zh: {
    htmlLang: "zh-CN",
    locale: "zh_CN",
    skip: "跳到正文",
    home: "孙煜征 · 课代表立正，回到首页",
    allDecks: "全部课件",
    enterprise: "企业培训",
    about: "关于我",
    enterpriseLabel: "企业定制",
    publicLabel: "公开分享",
    audience: "面向",
    pages: (n: number) => `${n}页`,
    play: "播放幻灯片",
    replay: "看完整实录",
    source: "查看源码",
    edition: { zh: "中文版", en: "English" },
    contents: "目录",
    slide: (n: number) => `第${n}页`,
    slideText: "本页文字",
    script: "讲稿",
    links: "本页链接",
    imageAlt: (n: number, title: string) => `第${n}页：${title}`,
    aboutTitle: "关于这份材料",
    aboutBody: (notes: boolean) => `这是幻灯片的网页版：每张图是原来的一页，文字取自幻灯片本身${notes ? "，讲稿取自讲者备注" : ""}。`,
    playFull: "全屏播放原幻灯片",
    enterpriseTitle: "你的团队，想把哪项工作做得更好？",
    enterpriseBody: "告诉我台下是谁、他们正在负责什么，以及听完之后，希望他们具体能做成什么。知道这三件事，就可以开始设计。",
    enterpriseCta: "聊聊企业AI项目",
    askTitle: "还有问题？",
    askBody: "可以去「问问立正」问，回答来自我公开讲过、写过的内容，每条都带出处。",
    askCta: "问问立正",
    related: "相关材料",
    more: "看全部课件",
    footer: "课件网页版",
    titleSuffix: "孙煜征",
  },
  en: {
    htmlLang: "en",
    locale: "en_US",
    skip: "Skip to content",
    home: "Yuzheng Sun, back to the homepage",
    allDecks: "All decks",
    enterprise: "Enterprise training",
    about: "About",
    enterpriseLabel: "Enterprise",
    publicLabel: "Public session",
    audience: "For",
    pages: (n: number) => `${n} slides`,
    play: "Play the slides",
    replay: "Watch the replay",
    source: "Source",
    edition: { zh: "中文版", en: "English" },
    contents: "Contents",
    slide: (n: number) => `Slide ${n}`,
    slideText: "Text on this slide",
    script: "Talk track",
    links: "Links on this slide",
    imageAlt: (n: number, title: string) => `Slide ${n}: ${title}`,
    aboutTitle: "About this page",
    aboutBody: (notes: boolean) =>
      `This is the web version of the slides. Each picture is one slide; the text comes from the slides themselves${notes ? ", and the talk track from the speaker notes" : ""}.`,
    playFull: "Play the original slides",
    enterpriseTitle: "What does your team need to do differently?",
    enterpriseBody: "Tell me who is in the room, what they are responsible for, and what should become possible afterward. That is enough to start designing the right session.",
    enterpriseCta: "Discuss an enterprise program",
    askTitle: "Still have a question?",
    askBody: "Ask Lizheng answers from what I have said and written in public, with a source for every answer.",
    askCta: "Ask Lizheng",
    related: "Related decks",
    more: "See all decks",
    footer: "Decks on the web",
    titleSuffix: "Yuzheng Sun",
  },
} as const;

const STYLE = `
:root{--paper:#fbf9f5;--card:#fff;--ink:#141714;--ink-2:#3b3f3a;--muted:#6b6e67;--faint:#9a9b93;--rule:#e6e0d4;--green:#238343;--green-text:#1c6b37;--forest:#0f3d23;--forest-2:#0b2f1b;--forest-glow:#1a5132;--on-forest:#f8f1e4;--on-forest-2:rgb(248 241 228/.78);--on-forest-3:rgb(248 241 228/.56);--serif:"Noto Serif SC","Songti SC","STSong",serif;--sans:"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--wide:1180px;--measure:680px;--gut:clamp(16px,4vw,48px);color-scheme:light}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-padding-top:72px}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.75 var(--sans);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
a{color:inherit;text-decoration:none}h1,h2,h3,p,ol,ul,figure{margin:0}img{max-width:100%}
:focus-visible{outline:2px solid var(--green);outline-offset:3px;border-radius:3px}
.skip{position:absolute;left:-9999px}.skip:focus{left:16px;top:12px;z-index:30;padding:8px 12px;background:var(--on-forest);color:var(--forest)}
.wrap{max-width:calc(var(--wide) + 2*var(--gut));margin:0 auto;padding-left:var(--gut);padding-right:var(--gut)}
.stage{background:radial-gradient(110% 90% at 92% -10%,var(--forest-glow) 0%,rgb(26 81 50/0) 60%),linear-gradient(180deg,var(--forest) 0%,var(--forest-2) 100%);color:var(--on-forest)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:22px;font-size:14px}
.brand{display:inline-flex;align-items:center;gap:10px;font:700 16px/1 var(--serif);letter-spacing:.06em;color:var(--on-forest)}
.brand svg{width:38px;height:auto;fill:var(--on-forest)}
.bar nav{display:flex;gap:20px;color:var(--on-forest-2)}.bar nav a:hover{color:var(--on-forest)}
.hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,520px);gap:clamp(28px,5vw,64px);align-items:center;padding:clamp(40px,6vw,80px) 0 clamp(40px,6vw,72px)}
.kicker{font-size:13.5px;color:var(--on-forest-3)}.kicker>*+*::before{content:"·";margin:0 8px}
.hero h1{margin-top:14px;font:900 clamp(30px,4.4vw,48px)/1.25 var(--serif);letter-spacing:.005em;font-feature-settings:"palt";text-wrap:balance}
.lede{margin-top:18px;font-size:clamp(16px,1.5vw,18px);line-height:1.8;color:var(--on-forest-2)}
.facts{margin-top:16px;font-size:14px;color:var(--on-forest-3)}
.actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;margin-top:26px;font-size:14.5px}
.play{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;background:var(--on-forest);color:var(--forest);font-weight:700;transition:transform .2s}
.play:hover{transform:translateY(-1px)}
.actions .alt{color:var(--on-forest-2);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}.actions .alt:hover{color:var(--on-forest)}
.cover{display:block;border-radius:10px;overflow:hidden;box-shadow:0 24px 60px rgb(0 0 0/.35),0 0 0 1px rgb(255 255 255/.08)}
.cover img{display:block;width:100%;height:auto;aspect-ratio:16/9}
.toc{position:sticky;top:0;z-index:20;background:rgb(251 249 245/.94);-webkit-backdrop-filter:saturate(1.4) blur(10px);backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid var(--rule)}
.toc .wrap{display:flex;align-items:center;gap:18px;height:58px}
.toc-title{flex:0 1 auto;min-width:0;font:700 15px/1.3 var(--serif);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:22em}
.chapters{flex:1 1 auto;display:flex;gap:4px 18px;overflow-x:auto;scrollbar-width:none;font-size:14px;color:var(--muted);white-space:nowrap}.chapters::-webkit-scrollbar{display:none}
.chapters a{padding:4px 0;border-bottom:2px solid transparent;transition:color .2s,border-color .2s}.chapters a:hover{color:var(--ink)}.chapters a[aria-current=true]{color:var(--ink);border-bottom-color:var(--green)}
.toc details{position:relative;flex:0 0 auto;margin-left:auto}
.toc summary{list-style:none;cursor:pointer;font-size:14px;color:var(--ink-2);padding:6px 2px}.toc summary::-webkit-details-marker{display:none}.toc summary::after{content:" ▾";color:var(--faint)}
.toc ol{position:absolute;right:0;top:40px;width:min(440px,calc(100vw - 32px));max-height:min(70vh,560px);overflow:auto;padding:10px;list-style:none;background:var(--card);border-radius:12px;box-shadow:0 18px 50px rgb(20 23 20/.16),0 0 0 1px var(--rule)}
.toc ol a{display:grid;grid-template-columns:2.4em minmax(0,1fr);gap:8px;padding:7px 8px;border-radius:8px;font-size:14px;line-height:1.5;color:var(--ink-2)}.toc ol a:hover{background:#f3efe6;color:var(--ink)}
.toc ol span{color:var(--faint);font-variant-numeric:tabular-nums}
.toc .play-sm{flex:0 0 auto;padding:7px 14px;border-radius:999px;background:var(--ink);color:#fff;font-size:13.5px;font-weight:700}
.progress{position:absolute;left:0;bottom:-1px;height:2px;width:0;background:var(--green)}
main{padding-bottom:40px}
.slide{padding:clamp(48px,6vw,84px) 0 0}
.slide+.slide{margin-top:clamp(8px,2vw,24px)}
.slide-kicker{display:flex;align-items:center;gap:10px;font-size:13px;letter-spacing:.04em;color:var(--muted)}
.slide-kicker::before{content:"";width:22px;height:1px;background:var(--faint)}
.slide-kicker b{font-weight:600;color:var(--ink-2);font-variant-numeric:tabular-nums}
.slide h2{margin-top:12px;max-width:30em;font:800 clamp(22px,2.6vw,32px)/1.4 var(--serif);font-feature-settings:"palt";text-wrap:balance}
.slide-body{display:grid;grid-template-columns:minmax(0,1fr);gap:24px;margin-top:22px}
.with-script .slide-body{grid-template-columns:minmax(0,5fr) minmax(0,7fr);align-items:start;gap:clamp(24px,4vw,48px)}
.with-script figure{order:2;position:sticky;top:76px}
.shot{display:block;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 1px 2px rgb(20 23 20/.06),0 10px 30px rgb(20 23 20/.08),0 0 0 1px var(--rule)}
.shot img{display:block;width:100%;height:auto;aspect-ratio:16/9}
.no-script figure{max-width:980px}
.script p{font-size:17px;line-height:1.95;color:var(--ink-2)}.script p+p{margin-top:14px}
.script .script-label{margin-bottom:10px;font-size:12.5px;line-height:1.6;letter-spacing:.08em;color:var(--faint)}
.lines{max-width:var(--measure)}
.lines p,.lines li{font-size:16.5px;line-height:1.85;color:var(--ink-2)}
.lines p+p,.lines p+ul,.lines ul+p{margin-top:10px}
.lines ul{padding-left:1.3em}.lines li+li{margin-top:4px}.lines li::marker{color:var(--green)}
.lines strong{display:block;color:var(--ink);font-weight:700}
.lines .strong{margin-top:16px}.lines .strong:first-child{margin-top:0}
.no-script .lines{columns:2 320px;column-gap:48px}
.no-script .lines>*{break-inside:avoid}
details.text{margin-top:18px;border-top:1px solid var(--rule);padding-top:12px}
details.text summary{cursor:pointer;font-size:13.5px;color:var(--muted)}details.text summary:hover{color:var(--ink)}
details.text .lines{margin-top:10px}details.text .lines p,details.text .lines li{font-size:15px;line-height:1.8}
.links{margin-top:16px;font-size:14.5px;line-height:1.7}.links span{display:block;font-size:12.5px;letter-spacing:.06em;color:var(--faint)}
.links a{display:inline-block;margin:4px 18px 0 0;color:var(--green-text);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;overflow-wrap:anywhere}
.end{margin-top:clamp(64px,8vw,104px);display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}
.panel{padding:24px;border-radius:14px;background:var(--card);box-shadow:0 0 0 1px var(--rule)}
.panel h2{font:700 19px/1.5 var(--serif)}.panel p{margin-top:10px;font-size:15px;line-height:1.8;color:var(--ink-2)}
.panel .go{display:inline-block;margin-top:14px;font-size:15px;font-weight:700;color:var(--green-text)}.panel .go:hover{text-decoration:underline;text-underline-offset:4px}
.related{margin-top:56px}.related h2{font:700 19px/1.5 var(--serif)}
.related ul{list-style:none;padding:0;margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}
.related a{display:block}.related img{display:block;width:100%;height:auto;aspect-ratio:16/9;border-radius:8px;box-shadow:0 0 0 1px var(--rule)}
.related b{display:block;margin-top:10px;font:700 16px/1.5 var(--serif);color:var(--ink)}.related a:hover b{color:var(--green-text)}
.related small{display:block;margin-top:4px;font-size:13px;color:var(--muted)}
.related .blank{display:flex;align-items:flex-end;aspect-ratio:16/9;padding:16px;border-radius:8px;background:linear-gradient(145deg,var(--forest),var(--forest-2));color:var(--on-forest-2);font:700 15px/1.5 var(--serif)}
footer{margin-top:72px;border-top:1px solid var(--rule);color:var(--muted);font-size:13px}
footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 24px;padding-top:22px;padding-bottom:40px}
footer nav{display:flex;flex-wrap:wrap;gap:6px 18px}footer a:hover{color:var(--green-text)}
@media (max-width:960px){.hero{grid-template-columns:1fr}.cover{max-width:640px}.with-script .slide-body{grid-template-columns:1fr}.with-script figure{order:0;position:static}.chapters{display:none}}
@media (max-width:640px){.bar nav a.wide-only{display:none}.hero h1{font-size:28px;line-height:1.35}.toc .wrap{gap:12px;height:54px}.toc-title{font-size:14px}.script p{font-size:16.5px}.slide h2{font-size:22px}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

// Highlights the chapter in view, fills the progress line, and sends old slide links (#s05, #slide-5,
// #/4) to the matching section.
const SCRIPT = `(()=>{const h=location.hash,m=h.match(/^#s(\\d+)$/)||h.match(/^#slide-0+(\\d+)$/)||h.match(/^#\\/(\\d+)/);if(m){const n=+m[1]+(h.startsWith("#/")?1:0),t=document.getElementById("slide-"+n);if(t){history.replaceState(null,"","#slide-"+n);t.scrollIntoView()}}
const bar=document.querySelector(".progress"),main=document.querySelector("main");const tick=()=>{if(!bar||!main)return;const b=main.getBoundingClientRect(),p=Math.min(1,Math.max(0,-b.top/(b.height-innerHeight)));bar.style.width=p*100+"%"};addEventListener("scroll",tick,{passive:true});tick();
const links=[...document.querySelectorAll(".chapters a")];if(links.length&&"IntersectionObserver"in window){const io=new IntersectionObserver(es=>{for(const e of es){if(!e.isIntersecting)continue;const c=e.target.dataset.chapter;links.forEach(a=>a.setAttribute("aria-current",String(a.dataset.chapter===c)))}},{rootMargin:"-40% 0px -55% 0px"});document.querySelectorAll(".slide").forEach(s=>io.observe(s))}
const d=document.querySelector(".toc details");if(d){d.addEventListener("click",e=>{if(e.target.closest("ol a"))d.open=false});document.addEventListener("click",e=>{if(d.open&&!d.contains(e.target))d.open=false})}})();`;

function slidesHref(card: DeckEntry): string | undefined {
  if (!card.href) return undefined;
  return card.href.replace(SITE_URL, "");
}

function renderLines(lines: Line[]): string {
  const out: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) out.push(`<ul>${list.join("")}</ul>`);
    list = [];
  };
  for (const line of lines) {
    if (line.kind === "li") {
      list.push(`<li>${escapeHtml(line.text)}</li>`);
      continue;
    }
    flush();
    out.push(line.kind === "strong" ? `<p class="strong"><strong>${escapeHtml(line.text)}</strong></p>` : `<p>${escapeHtml(line.text)}</p>`);
  }
  flush();
  return out.join("\n");
}

function chapterIds(slides: Slide[]): Map<string, { id: string; first: number }> {
  const chapters = new Map<string, { id: string; first: number }>();
  for (const slide of slides) {
    if (slide.chapter && !chapters.has(slide.chapter)) chapters.set(slide.chapter, { id: `slide-${slide.n}`, first: slide.n });
  }
  return chapters;
}

function renderSlide(page: DeckPage, slide: Slide): string {
  const t = COPY[page.lang];
  const hasScript = slide.notes.length > 0;
  const img = `/deck-slides/${page.file}/${slide.image}`;
  const eager = slide.n === 1;
  const figure = `<figure><a class="shot" href="${escapeHtml(img)}" aria-label="${escapeHtml(t.imageAlt(slide.n, slide.title))}"><img src="${escapeHtml(img)}" width="1280" height="720" alt="${escapeHtml(t.imageAlt(slide.n, slide.title))}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></a></figure>`;
  const lines = slide.lines.length ? `<div class="lines">\n${renderLines(slide.lines)}\n</div>` : "";
  const links = slide.links.length
    ? `<p class="links"><span>${t.links}</span>${slide.links.map(link => `<a href="${escapeHtml(link.href)}" rel="noopener" target="_blank">${escapeHtml(link.text || link.href)} ↗</a>`).join("")}</p>`
    : "";
  const text = hasScript
    ? `<div class="script"><p class="script-label">${t.script}</p>\n${slide.notes.map(p => `<p>${escapeHtml(p)}</p>`).join("\n")}${lines ? `\n<details class="text"><summary>${t.slideText}</summary>\n${lines}\n</details>` : ""}${links}</div>`
    : `<div>${lines}${links}</div>`;
  const kicker = [slide.kicker].filter(Boolean).map(k => ` · ${escapeHtml(k)}`).join("");
  return `<section class="slide ${hasScript ? "with-script" : "no-script"}" id="slide-${slide.n}"${slide.chapter ? ` data-chapter="${escapeHtml(slide.chapter)}"` : ""}>
<div class="wrap">
<p class="slide-kicker"><b>${String(slide.n).padStart(2, "0")}</b>${kicker}</p>
<h2>${escapeHtml(slide.title)}</h2>
<div class="slide-body">
${figure}
${text}
</div>
</div>
</section>`;
}

function related(page: DeckPage, pages: DeckPage[]): DeckEntry[] {
  const same = DECK_LIBRARY.filter(deck => deck.id !== page.card.id && deck.category === page.card.category && (deck.page || deck.href));
  const others = DECK_LIBRARY.filter(deck => deck.id !== page.card.id && !same.includes(deck) && deck.collection === page.card.collection && deck.page);
  return [...same, ...others].slice(0, 3);
}

function renderRelated(page: DeckPage, pages: DeckPage[]): string {
  const t = COPY[page.lang];
  const items = related(page, pages).map(original => {
    const deck = deckForLanguage(original, page.lang);
    const target = deck.page ? pages.find(p => p.path === deck.page) : undefined;
    const href = deck.page || deck.href || "/decks";
    const external = !deck.page;
    const picture = target
      ? `<img src="/deck-slides/${target.file}/01.webp" width="1280" height="720" alt="" loading="lazy" decoding="async">`
      : `<span class="blank">${escapeHtml(deck.organization)}</span>`;
    return `<li><a href="${escapeHtml(href)}"${external ? ' rel="noopener" target="_blank"' : ""}>${picture}<b>${escapeHtml(deck.title)}</b><small>${escapeHtml(deck.organization)} · ${escapeHtml(longDate(deck.date, page.lang))}</small></a></li>`;
  });
  if (!items.length) return "";
  return `<section class="related" aria-labelledby="related-title"><h2 id="related-title">${t.related}</h2><ul>${items.join("")}</ul></section>`;
}

/** Decks whose web version is written by hand (scripts/decks/) instead of generated from the slides. */
export const FEATURES = new Set(["/decks/fake-work-fake-learning", "/decks/fake-work-fake-learning/zh"]);

function jsonLd(page: DeckPage, pages: DeckPage[]) {
  const card = page.card;
  const url = `${SITE_URL}${page.path}`;
  const t = COPY[page.lang];
  const description = localized(card.takeaway, page.lang);
  const image = `${SITE_URL}/deck-slides/${page.file}/og.jpg`;
  const alternate = page.alternate ? pages.find(p => p.path === page.alternate?.path) : undefined;
  const document: Record<string, unknown> = {
    "@type": "PresentationDigitalDocument",
    "@id": `${url}#deck`,
    url,
    name: card.title,
    headline: card.title,
    description,
    inLanguage: t.htmlLang,
    author: PERSON,
    creator: PERSON,
    datePublished: card.date,
    dateModified: page.capturedAt,
    image,
    isAccessibleForFree: true,
    keywords: card.keywords.join(", "),
    audience: { "@type": "Audience", audienceType: localized(card.audience, page.lang) },
    isPartOf: { "@id": `${SITE_URL}${page.lang === "en" ? "/en/decks" : "/decks"}#webpage` },
    ...(card.href ? { associatedMedia: { "@type": "MediaObject", name: t.play, contentUrl: card.href, encodingFormat: "text/html" } } : {}),
  };
  if (FEATURES.has(page.path)) {
    // The hand-built page is an article written from the talk; the slides are what it is based on.
    document["@type"] = "Article";
    document.isBasedOn = { "@type": "PresentationDigitalDocument", name: card.title, url: card.href };
    document.citation = fakeLearningCitations();
    delete document.associatedMedia;
  }
  if (alternate) {
    const originalLanguage = DECK_LIBRARY.find(d => d.id === card.id)?.language;
    if (originalLanguage === page.lang) document.workTranslation = { "@id": `${SITE_URL}${alternate.path}#deck` };
    else document.translationOfWork = { "@id": `${SITE_URL}${alternate.path}#deck` };
  }
  const decksUrl = `${SITE_URL}${page.lang === "en" ? "/en/decks" : "/decks"}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: card.title, description, inLanguage: t.htmlLang, isPartOf: { "@id": WEBSITE_ID }, primaryImageOfPage: image, mainEntity: { "@id": `${url}#deck` }, breadcrumb: { "@id": `${url}#breadcrumb` } },
      document,
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: page.lang === "en" ? "Yuzheng Sun" : "立正", item: `${SITE_URL}${page.lang === "en" ? "/en" : "/"}` },
          { "@type": "ListItem", position: 2, name: t.allDecks, item: decksUrl },
          { "@type": "ListItem", position: 3, name: card.title, item: url },
        ],
      },
    ],
  };
}

function renderPage(page: DeckPage, pages: DeckPage[]): string {
  const t = COPY[page.lang];
  const card = page.card;
  const url = `${SITE_URL}${page.path}`;
  const occasion = card.occasion ? localized(card.occasion, page.lang) : "";
  const description = localized(card.takeaway, page.lang);
  const ownChannel = /课代表立正|Superlinear Academy/.test(card.organization) && card.collection === "public";
  const title = `${card.title}${ownChannel ? "" : page.lang === "zh" ? `（${card.organization}）` : ` (${card.organization})`} · ${t.titleSuffix}`;
  const image = `${SITE_URL}/deck-slides/${page.file}/og.jpg`;
  const play = slidesHref(card);
  const decks = page.lang === "en" ? "/en/decks" : "/decks";
  const enterprise = page.lang === "en" ? "/en/collab/enterprise" : "/collab/enterprise";
  const aboutHref = page.lang === "en" ? "/en/about" : "/about";
  const hreflang = page.alternate
    ? [
        `<link rel="alternate" hreflang="${COPY[page.lang].htmlLang}" href="${url}">`,
        `<link rel="alternate" hreflang="${COPY[page.alternate.lang].htmlLang}" href="${SITE_URL}${page.alternate.path}">`,
        `<link rel="alternate" hreflang="x-default" href="${SITE_URL}${page.lang === "zh" ? page.path : page.alternate.path}">`,
      ].join("\n")
    : "";
  const hasNotes = page.slides.some(s => s.notes.length);
  const chapters = chapterIds(page.slides);
  const chapterNav = chapters.size >= 3 && chapters.size <= 8
    ? `<nav class="chapters" aria-label="${t.contents}">${[...chapters].map(([name, c]) => `<a href="#${c.id}" data-chapter="${escapeHtml(name)}">${escapeHtml(name)}</a>`).join("")}</nav>`
    : `<span class="chapters"></span>`;
  const toc = `<details><summary>${t.contents}</summary><ol>${page.slides.map(s => `<li><a href="#slide-${s.n}"><span>${String(s.n).padStart(2, "0")}</span>${escapeHtml(s.title)}</a></li>`).join("")}</ol></details>`;
  const actions = [
    play ? `<a class="play" href="${escapeHtml(play)}"${play.startsWith("http") ? ' rel="noopener" target="_blank"' : ""}>▶ ${t.play}</a>` : "",
    page.alternate ? `<a class="alt" href="${escapeHtml(page.alternate.path)}" hreflang="${COPY[page.alternate.lang].htmlLang}" lang="${COPY[page.alternate.lang].htmlLang}">${t.edition[page.alternate.lang]}</a>` : "",
    card.secondaryHref && card.secondaryLinkKind === "replay" ? `<a class="alt" href="${escapeHtml(card.secondaryHref)}" rel="noopener" target="_blank">${t.replay}</a>` : "",
    card.sourceHref ? `<a class="alt" href="${escapeHtml(card.sourceHref)}" rel="noopener" target="_blank">${t.source}</a>` : "",
  ].filter(Boolean).join("");
  // The occasion often repeats the date the kicker already shows; then it is left out.
  const facts = [
    `${t.audience}${page.lang === "en" ? ": " : "："}${localized(card.audience, page.lang)}`,
    t.pages(page.slides.length),
    occasion && !occasion.includes(card.date.slice(0, 4)) ? occasion : "",
  ].filter(Boolean).join(" · ");
  const kicker = [card.collection === "enterprise" ? t.enterpriseLabel : t.publicLabel, card.organization, longDate(card.date, page.lang)];
  const askHref = "https://ask.lizheng.ai/";
  const endPanels = [
    `<div class="panel"><h2>${t.aboutTitle}</h2><p>${escapeHtml(t.aboutBody(hasNotes))}</p>${play ? `<a class="go" href="${escapeHtml(play)}"${play.startsWith("http") ? ' rel="noopener" target="_blank"' : ""}>${t.playFull} →</a>` : ""}</div>`,
    card.collection === "enterprise"
      ? `<div class="panel"><h2>${t.enterpriseTitle}</h2><p>${t.enterpriseBody}</p><a class="go" href="${enterprise}">${t.enterpriseCta} →</a></div>`
      : `<div class="panel"><h2>${t.askTitle}</h2><p>${t.askBody}</p><a class="go" href="${askHref}">${t.askCta} →</a></div>`,
  ].join("");
  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${url}">
${hreflang}
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="立正 · Yuzheng Sun">
<meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${escapeHtml(card.title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(card.title)}">
<meta property="article:published_time" content="${card.date}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(card.title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${image}">
<meta name="theme-color" content="#0f3d23">
<link rel="icon" href="/favicon.jpg">
<link rel="apple-touch-icon" href="/apple-touch-icon.jpg">
<link rel="preload" as="image" href="/deck-slides/${page.file}/01.webp" fetchpriority="high">
<link rel="preload" as="style" href="/fonts/serif.css" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/fonts/serif.css"></noscript>
<style>${STYLE.trim()}</style>
<script type="application/ld+json">${JSON.stringify(jsonLd(page, pages)).replace(/</g, "\\u003c")}</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<a class="skip" href="#main">${t.skip}</a>
<header class="stage">
<div class="wrap">
<div class="bar"><a class="brand" href="${page.lang === "en" ? "/en" : "/"}" aria-label="${t.home}">${SEAL}<span>${page.lang === "en" ? "Yuzheng Sun" : "孙煜征"}</span></a>
<nav aria-label="${t.allDecks}"><a href="${decks}">${t.allDecks}</a><a class="wide-only" href="${enterprise}">${t.enterprise}</a><a href="${aboutHref}">${t.about}</a></nav></div>
<div class="hero">
<div>
<p class="kicker">${kicker.map(k => `<span>${escapeHtml(k)}</span>`).join("")}</p>
<h1>${escapeHtml(card.title)}</h1>
<p class="lede">${escapeHtml(description)}</p>
<p class="facts">${escapeHtml(facts)}</p>
<div class="actions">${actions}</div>
</div>
<a class="cover" href="#slide-1" aria-label="${escapeHtml(t.imageAlt(1, page.slides[0]?.title ?? card.title))}"><img src="/deck-slides/${page.file}/01.webp" width="1280" height="720" alt="" fetchpriority="high"></a>
</div>
</div>
</header>
<div class="toc"><div class="wrap"><span class="toc-title">${escapeHtml(card.shortTitle || card.title)}</span>${chapterNav}${toc}${play ? `<a class="play-sm" href="${escapeHtml(play)}"${play.startsWith("http") ? ' rel="noopener" target="_blank"' : ""}>▶ ${t.play}</a>` : ""}</div><div class="progress"></div></div>
<main id="main">
${page.slides.map(slide => renderSlide(page, slide)).join("\n")}
<div class="wrap">
<div class="end">${endPanels}</div>
${renderRelated(page, pages)}
</div>
</main>
<footer><div class="wrap"><span>${t.footer} · ${page.lang === "en" ? "Yuzheng Sun" : "孙煜征"}</span><nav aria-label="${t.allDecks}"><a href="${decks}">${t.more}</a><a href="${aboutHref}">${t.about}</a><a href="${page.lang === "en" ? "/en" : "/"}">lizheng.ai</a></nav></div></footer>
<script>${SCRIPT}</script>
</body>
</html>
`;
}

/** Writes every deck's web version into the built site (dist/public). */
export function writeDeckPages(dist: string): number {
  const pages = loadPages();
  for (const page of pages) {
    const directory = path.join(dist, ...page.path.split("/").filter(Boolean));
    fs.mkdirSync(directory, { recursive: true });
    const html = FEATURES.has(page.path)
      ? renderFakeLearningFeature({
          lang: page.lang,
          url: `${SITE_URL}${page.path}`,
          alternatePath: page.alternate?.path ?? "/decks",
          slides: slidesHref(page.card) ?? page.path,
          description: localized(page.card.takeaway, page.lang),
          jsonLd: jsonLd(page, pages),
          image: `${SITE_URL}/deck-slides/${page.file}/og.jpg`,
        })
      : renderPage(page, pages);
    fs.writeFileSync(path.join(directory, "index.html"), html, "utf-8");
  }
  return pages.length;
}
