/**
 * The Chinese editions of Yuzheng's Statsig blog posts at /writing/statsig: a list page and one page per
 * post, written as static HTML during the build so the whole text is in the first HTML a crawler reads.
 * The post bodies and their details come from content/writing/statsig-blog-zh/html/, which
 * scripts/writing/build_statsig_zh.py makes from the Markdown posts (see that folder's README).
 * The about page and the Chinese footer link here; nothing in the React app renders these pages.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEAL } from "../shared/ask-seal.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "content", "writing", "statsig-blog-zh");
const SITE_URL = "https://www.lizheng.ai";
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

interface Collection {
  path: string;
  title: string;
  kicker: string;
  lede: string;
  description: string;
  datePublished: string;
  dateModified: string;
}

interface Post {
  slug: string;
  title: string;
  description: string;
  originalTitle: string;
  originalUrl: string;
  date: string;
  notes: string[];
  authors: Array<{ name: string; role: string; yuzheng: boolean }>;
  coauthored: boolean;
  figures: number;
}

function loadCollection(): Collection {
  return JSON.parse(fs.readFileSync(path.join(SOURCE, "collection.json"), "utf-8"));
}

/** Oldest first, as build_statsig_zh.py writes them. */
function loadPosts(): Post[] {
  return JSON.parse(fs.readFileSync(path.join(SOURCE, "html", "articles.json"), "utf-8"));
}

const postPath = (collection: Collection, post: Post) => `${collection.path}/${post.slug}`;
const authorName = (author: Post["authors"][number]) => (author.yuzheng ? "孙煜征" : author.name);
const others = (post: Post) => post.authors.filter(author => !author.yuzheng).map(author => author.name).join("、");

/** 2024-07-22 → 2024年7月22日 */
function chineseDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

/** The addresses the sitemap lists, with the date the Chinese text last changed. */
export function writingSitemapUrls(): Array<{ loc: string; lastmod: string }> {
  const collection = loadCollection();
  return [
    { loc: `${SITE_URL}${collection.path}`, lastmod: collection.dateModified },
    ...loadPosts().map(post => ({ loc: `${SITE_URL}${postPath(collection, post)}`, lastmod: collection.dateModified })),
  ];
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function body(slug: string): string {
  return fs.readFileSync(path.join(SOURCE, "html", `${slug}.html`), "utf-8").trim();
}

const STYLE = `
:root{--paper:#fbf9f5;--ink:#141714;--ink-2:#3b3f3a;--muted:#6b6e67;--faint:#9a9b93;--rule:#e6e0d4;--rule-2:#d5cebf;--green:#238343;--green-deep:#1c6f38;--green-text:#1c6b37;--forest:#0f3d23;--forest-2:#0b2f1b;--forest-glow:#1a5132;--on-forest:#f8f1e4;--on-forest-2:rgb(248 241 228/.78);--on-forest-3:rgb(248 241 228/.56);--serif:"Noto Serif SC","Songti SC","STSong",serif;--sans:"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;--measure:700px;--gut:clamp(20px,5vw,56px);color-scheme:light}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.75 var(--sans);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
a{color:inherit;text-decoration:none}h1,h2,h3,h4,p,ol,ul,figure,blockquote{margin:0}
:focus-visible{outline:2px solid var(--green);outline-offset:3px;border-radius:3px}
.skip{position:absolute;left:-9999px}.skip:focus{left:16px;top:12px;z-index:2;padding:8px 12px;background:var(--on-forest);color:var(--forest)}
.stage{background:radial-gradient(110% 90% at 92% -10%,var(--forest-glow) 0%,rgb(26 81 50/0) 60%),linear-gradient(180deg,var(--forest) 0%,var(--forest-2) 100%);color:var(--on-forest)}
.stage-inner,.body{max-width:calc(var(--measure) + 2*var(--gut));margin:0 auto;padding-left:var(--gut);padding-right:var(--gut)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:22px;font-size:14px}
.brand{display:inline-flex;align-items:center;gap:10px;font:700 16px/1 var(--serif);letter-spacing:.06em;color:var(--on-forest)}
.brand svg{width:38px;height:auto;fill:var(--on-forest)}
.bar nav{display:flex;gap:20px;color:var(--on-forest-2)}.bar nav a:hover{color:var(--on-forest)}
.head{padding:clamp(44px,7vw,88px) 0 clamp(40px,6vw,72px)}
.kicker{font-size:13.5px;color:var(--on-forest-3)}
.kicker a:hover{color:var(--on-forest)}
.kicker>*+*::before{content:"·";margin:0 8px}
.head h1{margin-top:14px;font:900 clamp(30px,4.6vw,46px)/1.3 var(--serif);letter-spacing:.005em;font-feature-settings:"palt";text-wrap:balance}
.orig{margin-top:14px;font-size:14px;line-height:1.7;color:var(--on-forest-3)}
.orig a{color:var(--on-forest-2);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}.orig a:hover{color:var(--on-forest)}
.lede{margin-top:18px;max-width:32em;font-size:clamp(16px,1.6vw,18px);color:var(--on-forest-2)}
.body{padding-top:clamp(36px,5vw,56px);padding-bottom:72px}
.note{margin-bottom:36px;padding:14px 18px;border-left:3px solid var(--green);background:#f3efe6;font-size:15px;line-height:1.8;color:var(--ink-2)}
.note p+p{margin-top:6px}
.prose>*:first-child{margin-top:0}
.prose h2{margin-top:52px;font:700 clamp(21px,2.2vw,24px)/1.45 var(--serif);scroll-margin-top:24px}
.prose h3{margin-top:34px;font:700 18.5px/1.55 var(--serif);scroll-margin-top:24px}
.prose h4{margin-top:26px;font:700 16.5px/1.6 var(--sans);color:var(--ink)}
.prose p,.prose li{font-size:17px;line-height:1.9;color:var(--ink-2)}
.prose p{margin-top:14px}
.prose ul,.prose ol{margin:14px 0 0;padding-left:1.4em}
.prose li+li{margin-top:6px}.prose li>p{margin-top:6px}.prose li>p:first-child{margin-top:0}.prose li>ul,.prose li>ol{margin-top:6px}
.prose li::marker{color:var(--green)}
.prose strong{color:var(--ink)}
.prose em{font-style:normal;color:var(--muted)}
.prose strong em,.prose em strong{color:var(--ink)}
.prose code{font:14.5px/1.6 var(--mono);padding:2px 6px;border-radius:4px;background:#efe9dd;color:var(--ink)}
.prose blockquote{margin-top:22px;padding:2px 0 2px 16px;border-left:3px solid var(--green)}
.prose blockquote p{margin-top:8px;color:var(--ink)}.prose blockquote p:first-child{margin-top:0}
.prose figure{margin-top:30px}
.prose figure img{display:block;width:100%;height:auto;border-radius:6px;background:#fff;box-shadow:0 0 0 1px var(--rule)}
.prose figcaption{margin-top:10px;font-size:13.5px;line-height:1.75;color:var(--muted)}
.prose figcaption a{color:var(--green-text)}
.prose .table{margin-top:22px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.prose table{border-collapse:collapse;min-width:100%;font-size:15px;line-height:1.7;font-variant-numeric:tabular-nums}
.prose th,.prose td{padding:10px 12px;border-bottom:1px solid var(--rule);text-align:left;vertical-align:top}
.prose th{color:var(--ink);font-weight:700;border-bottom:2px solid var(--ink)}
.prose a{color:var(--green-text);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;overflow-wrap:anywhere}
.prose hr{margin:40px 0 0;border:0;border-top:1px solid var(--rule)}
.prose math{font-size:1.06em}
.prose math[display="block"]{display:block;margin:6px 0;overflow-x:auto;overflow-y:hidden;padding:4px 0}
.posts{list-style:none;padding:0;border-top:2px solid var(--ink)}
.posts li{border-bottom:1px solid var(--rule)}
.posts a{display:grid;grid-template-columns:6.6em minmax(0,1fr);gap:0 16px;padding:20px 0}
.posts time{font:600 14px/1.9 var(--sans);color:var(--muted);font-variant-numeric:tabular-nums}
.posts b{display:block;font:700 18.5px/1.55 var(--serif);color:var(--ink);transition:color .2s}
.posts p{grid-column:2;margin-top:6px;font-size:15px;line-height:1.8;color:var(--ink-2)}
.posts .with{grid-column:2;margin-top:4px;font-size:13.5px;color:var(--muted)}
.posts a:hover b{color:var(--green-text)}
.pager{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:64px;padding-top:24px;border-top:2px solid var(--ink)}
.pager a{display:block;padding:14px 16px;border-radius:10px;box-shadow:0 0 0 1px var(--rule);transition:box-shadow .2s}
.pager a:hover{box-shadow:0 0 0 1px var(--green)}
.pager span{display:block;font-size:12.5px;color:var(--muted)}
.pager b{display:block;margin-top:4px;font:700 15.5px/1.55 var(--serif);color:var(--ink)}
.pager .next{text-align:right;grid-column:2}
.closing{margin-top:28px;font-size:14px;line-height:1.8;color:var(--muted)}
.closing a{color:var(--green-text);text-decoration:underline;text-underline-offset:3px}
footer{border-top:1px solid var(--rule);color:var(--muted);font-size:13px}
footer .body{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 24px;padding-top:22px;padding-bottom:40px}
footer nav{display:flex;flex-wrap:wrap;gap:6px 18px}footer a:hover{color:var(--green-text)}
@media (max-width:640px){.bar nav a.wide-only{display:none}.head h1{font-size:27px;line-height:1.4}.prose p,.prose li{font-size:16.5px}.prose td{min-width:7em}.posts a{grid-template-columns:1fr}.posts time{line-height:1.6}.posts b{margin-top:4px}.posts p,.posts .with{grid-column:1}.pager{grid-template-columns:1fr}.pager .next{grid-column:1}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function frame(collection: Collection, page: { title: string; description: string; canonical: string; type: "website" | "article"; jsonLd: unknown; head: string; main: string }): string {
  const index = collection.path;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.description)}">
<link rel="canonical" href="${escapeHtml(page.canonical)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta property="og:type" content="${page.type}">
<meta property="og:site_name" content="立正 · Yuzheng Sun">
<meta property="og:locale" content="zh_CN">
<meta property="og:title" content="${escapeHtml(page.title)}">
<meta property="og:description" content="${escapeHtml(page.description)}">
<meta property="og:url" content="${escapeHtml(page.canonical)}">
<meta property="og:image" content="${SITE_URL}${index}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(collection.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(page.title)}">
<meta name="twitter:description" content="${escapeHtml(page.description)}">
<meta name="twitter:image" content="${SITE_URL}${index}/og.jpg">
<meta name="theme-color" content="#0f3d23">
<link rel="icon" href="/favicon.jpg">
<link rel="apple-touch-icon" href="/apple-touch-icon.jpg">
<link rel="preload" as="style" href="/fonts/serif.css" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/fonts/serif.css"></noscript>
<style>${STYLE.trim()}</style>
<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, "\\u003c")}</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<a class="skip" href="#main">跳到正文</a>
<header class="stage">
<div class="stage-inner">
<div class="bar"><a class="brand" href="/" aria-label="孙煜征 · 课代表立正，回到首页">${SEAL}<span>孙煜征</span></a>
<nav aria-label="这组文章"><a href="${index}">全部文章</a><a href="/about">关于我</a><a class="wide-only" href="/book">书</a></nav></div>
${page.head}
</div>
</header>
<main id="main">
${page.main}
</main>
<footer><div class="body"><span>${escapeHtml(collection.title)} · 中文版</span><nav aria-label="更多"><a href="${index}">全部文章</a><a href="/about">关于我</a><a href="/">lizheng.ai</a></nav></div></footer>
</body>
</html>
`;
}

function authorNodes(post: Post) {
  return post.authors.map(author => (author.yuzheng ? { "@id": PERSON_ID } : { "@type": "Person", name: author.name }));
}

function breadcrumbs(collection: Collection, last?: { name: string; url: string }) {
  const items = [
    { name: "立正", url: `${SITE_URL}/` },
    { name: collection.title, url: `${SITE_URL}${collection.path}` },
    ...(last ? [last] : []),
  ];
  return { "@type": "BreadcrumbList", itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })) };
}

function renderIndex(collection: Collection, posts: Post[]): string {
  const url = `${SITE_URL}${collection.path}`;
  const newest = [...posts].reverse();
  const items = newest.map(post =>
    `<li><a href="${postPath(collection, post)}"><time datetime="${post.date}">${post.date.replaceAll("-", ".")}</time><span><b>${escapeHtml(post.title)}</b></span><p>${escapeHtml(post.description)}</p>${post.coauthored ? `<span class="with">与${escapeHtml(others(post))}合写</span>` : ""}</a></li>`).join("\n");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": `${url}#webpage`, url, name: collection.title, description: collection.description, inLanguage: "zh-CN", isPartOf: { "@id": WEBSITE_ID }, author: { "@id": PERSON_ID }, datePublished: collection.datePublished, dateModified: collection.dateModified, mainEntity: { "@id": `${url}#posts` }, breadcrumb: { "@id": `${url}#breadcrumb` } },
      { "@type": "ItemList", "@id": `${url}#posts`, numberOfItems: newest.length, itemListElement: newest.map((post, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}${postPath(collection, post)}`, name: post.title })) },
      { ...breadcrumbs(collection), "@id": `${url}#breadcrumb` },
    ],
  };
  return frame(collection, {
    title: `${collection.title}（中文版）· 孙煜征`,
    description: collection.description,
    canonical: url,
    type: "website",
    jsonLd,
    head: `<div class="head"><p class="kicker"><span>${escapeHtml(collection.kicker)}</span><span>${posts.length}篇</span></p>
<h1>${escapeHtml(collection.title)}</h1>
<p class="lede">${escapeHtml(collection.lede)}</p></div>`,
    main: `<div class="body"><ol class="posts" reversed>
${items}
</ol></div>`,
  });
}

function renderPost(collection: Collection, posts: Post[], index: number): string {
  const post = posts[index];
  const url = `${SITE_URL}${postPath(collection, post)}`;
  const older = index > 0 ? posts[index - 1] : null;
  const newer = index + 1 < posts.length ? posts[index + 1] : null;
  const pager = `<nav class="pager" aria-label="更早的和更新的文章">${
    older ? `<a class="prev" href="${postPath(collection, older)}"><span>更早的一篇</span><b>${escapeHtml(older.title)}</b></a>` : `<a class="prev" href="${collection.path}"><span>回到</span><b>全部文章</b></a>`
  }${
    newer ? `<a class="next" href="${postPath(collection, newer)}"><span>更新的一篇</span><b>${escapeHtml(newer.title)}</b></a>` : `<a class="next" href="${collection.path}"><span>回到</span><b>全部文章</b></a>`
  }</nav>`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: post.title, description: post.description, inLanguage: "zh-CN", isPartOf: { "@id": WEBSITE_ID }, mainEntity: { "@id": `${url}#article` }, breadcrumb: { "@id": `${url}#breadcrumb` } },
      {
        "@type": "Article",
        "@id": `${url}#article`,
        url,
        headline: post.title,
        description: post.description,
        inLanguage: "zh-CN",
        author: authorNodes(post),
        publisher: { "@id": PERSON_ID },
        datePublished: collection.datePublished,
        dateModified: collection.dateModified,
        isAccessibleForFree: true,
        image: `${SITE_URL}${collection.path}/og.jpg`,
        isPartOf: { "@id": `${SITE_URL}${collection.path}#webpage` },
        translationOfWork: {
          "@type": "BlogPosting",
          headline: post.originalTitle,
          url: post.originalUrl,
          inLanguage: "en",
          datePublished: post.date,
          author: authorNodes(post),
          publisher: { "@type": "Organization", name: "Statsig", url: "https://www.statsig.com" },
        },
      },
      { ...breadcrumbs(collection, { name: post.title, url }), "@id": `${url}#breadcrumb` },
    ],
  };
  const byline = post.coauthored ? `<p class="orig">作者：${post.authors.map(author => escapeHtml(authorName(author))).join("、")}（按原文署名顺序）</p>` : "";
  const notes = post.notes.length ? `<div class="note">${post.notes.map(note => `<p>${escapeHtml(note)}</p>`).join("")}</div>\n` : "";
  return frame(collection, {
    title: `${post.title} · 孙煜征`,
    description: post.description,
    canonical: url,
    type: "article",
    jsonLd,
    head: `<div class="head"><p class="kicker"><a href="${collection.path}">${escapeHtml(collection.title)}</a><time datetime="${post.date}">${chineseDate(post.date)}</time></p>
<h1>${escapeHtml(post.title)}</h1>
<p class="orig">原文：<a href="${escapeHtml(post.originalUrl)}" rel="noopener" target="_blank">${escapeHtml(post.originalTitle)} ↗</a></p>
${byline}</div>`,
    main: `<article class="body">${notes}<div class="prose">
${body(post.slug)}
</div>
${pager}
<p class="closing">这是Statsig博客英文原文的中文版，原文发表于${chineseDate(post.date)}，图表来自原文。<a href="${collection.path}">看全部${posts.length}篇</a></p>
</article>`,
  });
}

/** Writes the list page and every post page into the built site (dist/public). */
export function writeWritingPages(dist: string): number {
  const collection = loadCollection();
  const posts = loadPosts();
  const write = (route: string, html: string) => {
    const directory = path.join(dist, ...route.split("/").filter(Boolean));
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "index.html"), html, "utf-8");
  };
  write(collection.path, renderIndex(collection, posts));
  posts.forEach((_, i) => write(postPath(collection, posts[i]), renderPost(collection, posts, i)));
  return posts.length + 1;
}
