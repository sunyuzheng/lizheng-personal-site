/**
 * The free Chinese edition of Growth Data Analytics Playbook at /book/growth-data-analytics-playbook:
 * a contents page and one page per chapter, written as static HTML during the build so the whole
 * text is in the first HTML a crawler reads. The chapter bodies come from
 * content/books/growth-data-analytics-playbook-zh/html/, which scripts/books/build_gdap_zh.py
 * makes from the Markdown chapters together with the cover, figures, EPUB and PDF (see that folder's
 * README). The site's other book page, /book, links here; nothing in the React app renders these.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEAL } from "../shared/ask-seal.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "content", "books", "growth-data-analytics-playbook-zh");
const SITE_URL = "https://www.lizheng.ai";
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const ORIGINAL_BOOK_ID = `${SITE_URL}/book#growth-data-analytics-playbook`;
const AMAZON_URL = "https://www.amazon.com/Growth-Data-Analytics-Playbook-Product-Market/dp/1544549822";

interface Chapter {
  slug: string;
  file: string;
  label: string;
  title: string;
  original: string;
  description: string;
}

interface Book {
  slug: string;
  path: string;
  title: string;
  edition: string;
  subtitle: string;
  description: string;
  authors: string[];
  original: { title: string; publisher: string; year: number; isbn: string; language: string };
  datePublished: string;
  dateModified: string;
  files: { pdf: string; epub: string; downloadName: string };
  chapters: Chapter[];
}

export function loadBook(): Book {
  return JSON.parse(fs.readFileSync(path.join(SOURCE, "book.json"), "utf-8"));
}

const bookUrl = (book: Book) => `${SITE_URL}${book.path}`;
const chapterPath = (book: Book, chapter: Chapter) => `${book.path}/${chapter.slug}`;
const fullTitle = (book: Book) => `${book.title} ${book.edition}`;
const heading = (chapter: Chapter) => (chapter.label === chapter.title ? chapter.title : `${chapter.label}　${chapter.title}`);

/** The addresses the sitemap lists, with the date the text last changed. */
export function bookSitemapUrls(): Array<{ loc: string; lastmod: string }> {
  const book = loadBook();
  return [
    { loc: bookUrl(book), lastmod: book.dateModified },
    ...book.chapters.map(chapter => ({ loc: `${SITE_URL}${chapterPath(book, chapter)}`, lastmod: book.dateModified })),
  ];
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function body(slug: string): string {
  return fs.readFileSync(path.join(SOURCE, "html", `${slug}.html`), "utf-8").trim();
}

/** The about and authors texts sit under the contents page's own headings, one level down. */
function demote(html: string): string {
  return html.replace(/<(\/?)h2\b/g, "<$1h3");
}

function megabytes(file: string): string {
  return `${(fs.statSync(file).size / 1e6).toFixed(1)}MB`;
}

const STYLE = `
:root{--paper:#fbf9f5;--ink:#141714;--ink-2:#3b3f3a;--muted:#6b6e67;--faint:#9a9b93;--rule:#e6e0d4;--rule-2:#d5cebf;--green:#238343;--green-deep:#1c6f38;--green-text:#1c6b37;--forest:#0f3d23;--forest-2:#0b2f1b;--forest-glow:#1a5132;--on-forest:#f8f1e4;--on-forest-2:rgb(248 241 228/.78);--on-forest-3:rgb(248 241 228/.56);--serif:"Noto Serif SC","Songti SC","STSong",serif;--sans:"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--measure:700px;--gut:clamp(20px,5vw,56px);color-scheme:light}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.75 var(--sans);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
a{color:inherit;text-decoration:none}h1,h2,h3,p,ol,ul,figure,blockquote{margin:0}
:focus-visible{outline:2px solid var(--green);outline-offset:3px;border-radius:3px}
.skip{position:absolute;left:-9999px}.skip:focus{left:16px;top:12px;z-index:2;padding:8px 12px;background:var(--on-forest);color:var(--forest)}
.stage{background:radial-gradient(110% 90% at 92% -10%,var(--forest-glow) 0%,rgb(26 81 50/0) 60%),linear-gradient(180deg,var(--forest) 0%,var(--forest-2) 100%);color:var(--on-forest)}
.stage-inner,.body{max-width:calc(var(--measure) + 2*var(--gut));margin:0 auto;padding-left:var(--gut);padding-right:var(--gut)}
.wide .stage-inner{max-width:calc(980px + 2*var(--gut))}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:22px;font-size:14px}
.brand{display:inline-flex;align-items:center;gap:10px;font:700 16px/1 var(--serif);letter-spacing:.06em;color:var(--on-forest)}
.brand svg{width:38px;height:auto;fill:var(--on-forest)}
.bar nav{display:flex;gap:20px;color:var(--on-forest-2)}.bar nav a:hover{color:var(--on-forest)}
.head{padding:clamp(44px,7vw,88px) 0 clamp(40px,6vw,72px)}
.kicker{font-size:13.5px;color:var(--on-forest-3)}
.kicker a:hover{color:var(--on-forest)}
.kicker>*+*::before{content:"·";margin:0 8px}
.head h1{margin-top:14px;font:900 clamp(30px,4.6vw,48px)/1.28 var(--serif);letter-spacing:.005em;font-feature-settings:"palt";text-wrap:balance}
.orig{margin-top:14px;font-size:13.5px;color:var(--on-forest-3)}
.lede{margin-top:18px;max-width:30em;font-size:clamp(16px,1.6vw,18.5px);color:var(--on-forest-2)}
.cover-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:clamp(28px,6vw,72px);align-items:center}
.cover-head img{width:clamp(150px,22vw,230px);height:auto;border-radius:3px 7px 7px 3px;box-shadow:0 26px 44px -22px rgba(0,0,0,.7),inset 3px 0 0 rgba(255,255,255,.2)}
.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
.button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 22px;border-radius:10px;background:var(--green);color:#fff;font-size:15.5px;font-weight:600;transition:background .2s}
.button:hover{background:var(--green-deep)}
.stage .button{background:var(--on-forest);color:var(--forest)}.stage .button:hover{background:#fff}
.stage .button.ghost{background:transparent;color:var(--on-forest);box-shadow:inset 0 0 0 1px var(--on-forest-3)}.stage .button.ghost:hover{background:rgb(248 241 228/.08)}
.button .size{font-weight:400;opacity:.7;font-size:13px}
.body{padding-top:clamp(36px,5vw,56px);padding-bottom:72px}
.prose>*:first-child{margin-top:0}
.prose h2{margin-top:52px;font:700 clamp(21px,2.2vw,24px)/1.45 var(--serif);scroll-margin-top:24px}
.prose h3{margin-top:34px;font:700 18.5px/1.55 var(--serif);scroll-margin-top:24px}
.prose p,.prose li{font-size:17px;line-height:1.9;color:var(--ink-2)}
.prose p{margin-top:14px}
.prose ul,.prose ol{margin:14px 0 0;padding-left:1.4em}
.prose li+li{margin-top:6px}.prose li>p{margin-top:6px}.prose li>p:first-child{margin-top:0}
.prose li::marker{color:var(--green)}
.prose strong{color:var(--ink)}
.prose em{font-style:normal;color:var(--muted)}
.prose blockquote{margin-top:22px;padding:2px 0 2px 16px;border-left:3px solid var(--green)}
.prose blockquote p{margin-top:8px;color:var(--ink)}.prose blockquote p:first-child{margin-top:0}
.prose figure{margin-top:30px}
.prose figure img{display:block;width:100%;height:auto;border-radius:6px;background:#fff;box-shadow:0 0 0 1px var(--rule)}
.prose figcaption{margin-top:10px;font-size:13.5px;line-height:1.75;color:var(--muted)}
.prose .table{margin-top:22px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.prose table{border-collapse:collapse;min-width:100%;font-size:15px;line-height:1.7;font-variant-numeric:tabular-nums}
.prose th,.prose td{padding:10px 12px;border-bottom:1px solid var(--rule);text-align:left;vertical-align:top}
.prose th{color:var(--ink);font-weight:700;border-bottom:2px solid var(--ink);white-space:nowrap}
.prose a{color:var(--green-text);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;overflow-wrap:anywhere}
.prose .footnote-ref{text-decoration:none;font-size:.75em;vertical-align:super;line-height:1;padding:0 1px}
.prose .footnotes{margin-top:56px;padding-top:4px;border-top:1px solid var(--rule)}
.prose .notes-title{margin-top:20px;font:700 17px/1.5 var(--serif)}
.prose .footnotes li,.prose .footnotes p{font-size:14px;line-height:1.8;color:var(--muted)}
.prose .footnote-back{text-decoration:none}
.block{margin-top:64px}
.block>h2{padding-bottom:10px;border-bottom:1px solid var(--ink);font:700 clamp(21px,2.2vw,24px)/1.45 var(--serif)}
.toc{list-style:none;padding:0}
.toc li{border-bottom:1px solid var(--rule)}
.toc a{display:grid;grid-template-columns:4.6em minmax(0,1fr);gap:0 12px;padding:18px 0}
.toc .n{font:700 15px/1.6 var(--serif);color:var(--green-text)}
.toc b{display:block;font:700 18px/1.55 var(--serif);color:var(--ink);transition:color .2s}
.toc p{grid-column:2;margin-top:6px;font-size:14.5px;line-height:1.8;color:var(--muted)}
.toc a:hover b{color:var(--green-text)}
.pager{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:64px;padding-top:24px;border-top:2px solid var(--ink)}
.pager a{display:block;padding:14px 16px;border-radius:10px;box-shadow:0 0 0 1px var(--rule);transition:box-shadow .2s}
.pager a:hover{box-shadow:0 0 0 1px var(--green)}
.pager span{display:block;font-size:12.5px;color:var(--muted)}
.pager b{display:block;margin-top:4px;font:700 15.5px/1.55 var(--serif);color:var(--ink)}
.pager .next{text-align:right;grid-column:2}
.get{margin-top:40px;padding:22px 0 0;border-top:1px solid var(--rule)}
.get h2{font:700 18px/1.5 var(--serif)}
.get p{margin-top:6px;font-size:14.5px;color:var(--muted)}
.get .actions{margin-top:16px}
.get .button.ghost{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1px var(--rule-2)}.get .button.ghost:hover{background:#f3efe6}
.facts{margin-top:18px;font-size:14.5px;line-height:1.85;color:var(--muted)}
.facts a{color:var(--green-text);text-decoration:underline;text-underline-offset:3px}
footer{border-top:1px solid var(--rule);color:var(--muted);font-size:13px}
footer .body{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 24px;padding-top:22px;padding-bottom:40px}
footer nav{display:flex;flex-wrap:wrap;gap:6px 18px}footer a:hover{color:var(--green-text)}
@media (max-width:640px){.bar nav a.wide-only{display:none}.prose td{min-width:6em}.cover-head{grid-template-columns:1fr}.cover-head img{order:-1;width:150px}.head h1{font-size:28px;line-height:1.35}.prose p,.prose li{font-size:16.5px}.pager{grid-template-columns:1fr}.pager .next{grid-column:1}.actions .button{flex:1 1 auto}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

const SCRIPT = `window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};document.addEventListener("click",function(e){var a=e.target&&e.target.closest?e.target.closest("a[data-download]"):null;if(a)window.va("event",{name:"Book Download",data:{format:a.getAttribute("data-download"),page:location.pathname}})});`;

function frame(book: Book, page: { title: string; description: string; canonical: string; type: "book" | "article"; jsonLd: unknown; head: string; main: string; wide?: boolean }): string {
  const index = book.path;
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
<meta property="og:image:alt" content="${escapeHtml(fullTitle(book))}封面">
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
<script>${SCRIPT}</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body${page.wide ? ' class="wide"' : ""}>
<a class="skip" href="#main">跳到正文</a>
<header class="stage">
<div class="stage-inner">
<div class="bar"><a class="brand" href="/" aria-label="孙煜征 · 课代表立正，回到首页">${SEAL}<span>孙煜征</span></a>
<nav aria-label="这本书"><a href="${index}#contents">目录</a><a href="${index}#download">下载</a><a class="wide-only" href="/book">书</a></nav></div>
${page.head}
</div>
</header>
<main id="main">
${page.main}
</main>
<footer><div class="body"><span>${escapeHtml(fullTitle(book))} · 免费阅读</span><nav aria-label="更多"><a href="${index}">目录</a><a href="/book">立正的书</a><a href="/">lizheng.ai</a></nav></div></footer>
</body>
</html>
`;
}

function downloads(book: Book, dist: string, ghost: boolean): string {
  const folder = path.join(dist, ...book.path.split("/").filter(Boolean));
  const link = (format: "pdf" | "epub", label: string, extra: string) =>
    `<a class="button${extra}" href="${book.path}/${book.files[format]}" download="${escapeHtml(`${book.files.downloadName}.${format}`)}" data-download="${format}">${label} <span class="size">${megabytes(path.join(folder, book.files[format]))}</span></a>`;
  return `${link("pdf", "下载PDF", ghost ? " ghost" : "")}${link("epub", "下载EPUB", " ghost")}`;
}

function bookNode(book: Book) {
  const url = bookUrl(book);
  return {
    "@type": "Book",
    "@id": `${url}#book`,
    name: fullTitle(book),
    alternateName: `${book.title}（中文版）`,
    description: book.description,
    url,
    image: `${SITE_URL}${book.path}/cover.jpg`,
    inLanguage: "zh-CN",
    bookFormat: "https://schema.org/EBook",
    isAccessibleForFree: true,
    datePublished: book.datePublished,
    dateModified: book.dateModified,
    author: [{ "@type": "Person", name: "Mengying Li" }, { "@type": "Person", name: "Joe Kumar" }, { "@id": PERSON_ID }],
    publisher: { "@id": PERSON_ID },
    isBasedOn: { "@id": ORIGINAL_BOOK_ID },
    associatedMedia: [
      { "@type": "MediaObject", contentUrl: `${SITE_URL}${book.path}/${book.files.pdf}`, encodingFormat: "application/pdf" },
      { "@type": "MediaObject", contentUrl: `${SITE_URL}${book.path}/${book.files.epub}`, encodingFormat: "application/epub+zip" },
    ],
    hasPart: book.chapters.map((chapter, i) => ({ "@type": "Chapter", "@id": `${SITE_URL}${chapterPath(book, chapter)}#chapter`, position: i + 1, name: heading(chapter), url: `${SITE_URL}${chapterPath(book, chapter)}` })),
  };
}

function breadcrumbs(book: Book, last?: { name: string; url: string }) {
  const items = [
    { name: "立正", url: `${SITE_URL}/` },
    { name: "书", url: `${SITE_URL}/book` },
    { name: fullTitle(book), url: bookUrl(book) },
    ...(last ? [last] : []),
  ];
  return { "@type": "BreadcrumbList", itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })) };
}

function renderIndex(book: Book, dist: string): string {
  const url = bookUrl(book);
  const contents = book.chapters.map(chapter =>
    `<li><a href="${chapterPath(book, chapter)}"><span class="n">${chapter.label === chapter.title ? "" : escapeHtml(chapter.label)}</span><span><b>${escapeHtml(chapter.title)}</b></span><p>${escapeHtml(chapter.description)}</p></a></li>`).join("\n");
  const original = book.original;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: fullTitle(book), description: book.description, inLanguage: "zh-CN", isPartOf: { "@id": WEBSITE_ID }, mainEntity: { "@id": `${url}#book` }, breadcrumb: { "@id": `${url}#breadcrumb` } },
      bookNode(book),
      { ...breadcrumbs(book), "@id": `${url}#breadcrumb` },
    ],
  };
  return frame(book, {
    title: `${fullTitle(book)}：免费在线读 · 孙煜征`,
    description: book.description,
    canonical: url,
    type: "book",
    jsonLd,
    wide: true,
    head: `<div class="head cover-head"><div><p class="kicker"><span>书</span><span>${book.edition}</span><span>免费阅读</span></p>
<h1>${escapeHtml(book.title)} ${book.edition}</h1>
<p class="lede">${escapeHtml(book.subtitle)}。Mengying Li、Joe Kumar和孙煜征合著；中文版按立正的中文习惯重写，保留全部图表和练习。</p>
<div class="actions"><a class="button" href="${chapterPath(book, book.chapters[0])}">从第1章读起</a>${downloads(book, dist, true)}</div></div>
<img src="${book.path}/cover.webp" alt="《${escapeHtml(fullTitle(book))}》封面" width="640" height="960" fetchpriority="high"></div>`,
    main: `<div class="body">
<section class="block" id="contents" aria-labelledby="contents-title" style="margin-top:0"><h2 id="contents-title">目录</h2><ol class="toc">
${contents}
</ol></section>
<section class="block prose" aria-labelledby="about-title"><h2 id="about-title">关于这本书</h2>
${demote(body("about"))}
</section>
<section class="block prose" id="authors" aria-labelledby="authors-title"><h2 id="authors-title">关于作者</h2>
${demote(body("authors"))}
</section>
<section class="block get" id="download" aria-labelledby="download-title"><h2 id="download-title">下载整本书</h2>
<p>PDF适合在电脑和平板上看，EPUB适合在微信读书、Apple Books、Kindle这类阅读器里看。</p>
<div class="actions">${downloads(book, dist, false)}</div>
<p class="facts">英文原书：${escapeHtml(original.title)}，${escapeHtml(original.publisher)}，${original.year}年，ISBN ${original.isbn}。<a href="${AMAZON_URL}" rel="noopener" target="_blank">在Amazon查看</a></p>
</section>
</div>`,
  });
}

function renderChapter(book: Book, index: number, dist: string): string {
  const chapter = book.chapters[index];
  const url = `${SITE_URL}${chapterPath(book, chapter)}`;
  const prev = index > 0 ? book.chapters[index - 1] : null;
  const next = index + 1 < book.chapters.length ? book.chapters[index + 1] : null;
  const pager = `<nav class="pager" aria-label="上一章和下一章">${
    prev ? `<a class="prev" href="${chapterPath(book, prev)}"><span>上一章</span><b>${escapeHtml(heading(prev))}</b></a>` : `<a class="prev" href="${book.path}"><span>回到</span><b>目录</b></a>`
  }${
    next ? `<a class="next" href="${chapterPath(book, next)}"><span>下一章</span><b>${escapeHtml(heading(next))}</b></a>` : `<a class="next" href="${book.path}#authors"><span>最后</span><b>关于作者</b></a>`
  }</nav>`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: heading(chapter), description: chapter.description, inLanguage: "zh-CN", isPartOf: { "@id": WEBSITE_ID }, mainEntity: { "@id": `${url}#chapter` }, breadcrumb: { "@id": `${url}#breadcrumb` } },
      { "@type": "Chapter", "@id": `${url}#chapter`, url, name: heading(chapter), description: chapter.description, position: index + 1, inLanguage: "zh-CN", isPartOf: { "@id": `${bookUrl(book)}#book` }, isAccessibleForFree: true, author: [{ "@type": "Person", name: "Mengying Li" }, { "@type": "Person", name: "Joe Kumar" }, { "@id": PERSON_ID }] },
      { ...breadcrumbs(book, { name: heading(chapter), url }), "@id": `${url}#breadcrumb` },
    ],
  };
  const kicker = chapter.label === chapter.title ? "" : `<span>${escapeHtml(chapter.label)}</span>`;
  return frame(book, {
    title: `${heading(chapter)} · ${fullTitle(book)}`,
    description: chapter.description,
    canonical: url,
    type: "article",
    jsonLd,
    head: `<div class="head"><p class="kicker"><a href="${book.path}">${escapeHtml(fullTitle(book))}</a>${kicker}</p>
<h1>${escapeHtml(chapter.title)}</h1>
${chapter.original && chapter.original !== "Conclusion" ? `<p class="orig">对应原书 ${escapeHtml(chapter.original)}</p>` : ""}</div>`,
    main: `<article class="body"><div class="prose">
${body(chapter.slug)}
</div>
${pager}
<section class="get" aria-labelledby="get-title"><h2 id="get-title">下载整本书</h2><p>${escapeHtml(fullTitle(book))}，免费下载。</p><div class="actions">${downloads(book, dist, false)}</div></section>
</article>`,
  });
}

/** Writes the contents page and every chapter page into the built site (dist/public). */
export function writeBookPages(dist: string): number {
  const book = loadBook();
  const write = (route: string, html: string) => {
    const directory = path.join(dist, ...route.split("/").filter(Boolean));
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "index.html"), html, "utf-8");
  };
  write(book.path, renderIndex(book, dist));
  book.chapters.forEach((chapter, i) => write(chapterPath(book, chapter), renderChapter(book, i, dist)));
  return book.chapters.length + 1;
}
