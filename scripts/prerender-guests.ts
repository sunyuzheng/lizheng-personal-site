import {
  SITE_URL,
  fetchGuestDirectory,
  getGuestPageMeta,
  getGuestsPageMeta,
  type GuestProfile,
} from "../shared/guest-data.ts";
import { getGuestEnglishInsights } from "../shared/guest-insights.ts";
import {
  COLLAB_PAGE_META,
  CREATOR_COLLAB_PAGE_META,
  ENTERPRISE_TRAINING_PAGE_META,
} from "../shared/collab-meta.ts";
import {
  ABOUT_PAGE_META,
  AIE_SHANGHAI_DECK_PAGE_META,
  BOOKS_PAGE_META,
  HOME_PAGE_META,
  PODCAST_PAGE_META,
  GUEST_INVITATION_PAGE_META,
  DECKS_LANGUAGE_ALTERNATES,
  DECKS_PAGE_META,
  FAMILY_PARTY_CUE_CARDS_PAGE_META,
  ZHENBENSHI_PAGE_META,
  languageAlternates,
  type PageMeta,
  type SiteLang,
} from "../shared/page-meta.ts";
import {
  buildAboutStructuredData,
  buildAieShanghaiDeckStructuredData,
  buildBooksStructuredData,
  buildGuestStructuredData,
  buildGuestsListStructuredData,
  buildHomeStructuredData,
  buildPersonWebPageStructuredData,
  buildPodcastStructuredData,
  buildPodcastGuestInvitationStructuredData,
  buildDeckLibraryStructuredData,
  buildEnterpriseTrainingStructuredData,
  buildZhenbenshiStructuredData,
} from "../shared/structured-data.ts";
import App from "../client/src/App.tsx";
import { bookSitemapUrls } from "./book-pages.ts";
import { writingSitemapUrls } from "./writing-pages.ts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToReadableStream } from "react-dom/server.browser";
import { Router as WouterRouter } from "wouter";

// Build-time SEO uses the same merged guest directory as the app runtime.
// Source-of-truth details live in docs/guest-data.md.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// The Vite build uses the automatic JSX runtime. tsx executes these existing
// TSX modules with the classic runtime during static generation.
(globalThis as typeof globalThis & { React: typeof React }).React = React;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function stripExistingSeo(baseHtml: string) {
  return baseHtml
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, "")
    .replace(
      /\s*<meta\b(?=[^>]*\bname=["'](?:description|robots)["'])[^>]*>\s*/gi,
      "\n"
    )
    .replace(/\s*<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, "\n")
    .replace(/\s*<link\b(?=[^>]*\bhreflang=["'][^"']+["'])[^>]*>\s*/gi, "\n")
    .replace(
      /\s*<meta\b(?=[^>]*\bproperty=["'](?:og|profile):[^"']+["'])[^>]*>\s*/gi,
      "\n"
    )
    .replace(
      /\s*<meta\b(?=[^>]*\bname=["']twitter:[^"']+["'])[^>]*>\s*/gi,
      "\n"
    )
    .replace(
      /\s*<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi,
      "\n"
    );
}

// The template preloads the homepage portrait for the dev server. Static pages
// declare their own first-screen images instead.
function stripImagePreloads(baseHtml: string) {
  return baseHtml.replace(
    /\s*<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bas=["']image["'])[^>]*>\s*/gi,
    "\n"
  );
}

const HOME_IMAGE_PRELOADS = ["/home/portrait.webp"];
const ACQUIRED_IMAGE_PRELOADS = ["/hero/acquired-behind-scenes-desktop.webp"];

function imagePreloadTags(images: string[] = []) {
  return images
    .map(
      href =>
        `<link rel="preload" as="image" href="${escapeHtml(href)}" type="image/webp" fetchpriority="high" />`
    )
    .join("\n  ");
}

// Serif @font-face rules (fonts.css) load without blocking first paint.
function fontStylesheetTags(href: string) {
  const safe = escapeHtml(href);
  return `<link rel="preload" as="style" href="${safe}" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="${safe}" /></noscript>`;
}

function injectDocument(
  baseHtml: string,
  options: {
    head: string;
    bodyHtml: string;
    lang?: string;
    hydrate?: boolean;
    preloadImages?: string[];
  }
) {
  const head = [
    imagePreloadTags(options.preloadImages),
    fontStylesheetTags(fontStylesheet),
    options.head,
  ]
    .filter(Boolean)
    .join("\n  ");
  const html = stripImagePreloads(baseHtml)
    .replace("</head>", `${head}\n</head>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root"${options.hydrate ? ' data-ssr="true"' : ""}>${options.bodyHtml}</div>`
    );

  return options.lang
    ? html.replace(/<html lang="[^"]+">/, `<html lang="${options.lang}">`)
    : html;
}

function buildHead(meta: {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  type?: string;
  locale?: string;
  jsonLd?: unknown;
  alternates?: Array<{ hrefLang: string; href: string }>;
  robots?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  stylesheets?: string[];
}) {
  return `
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />
  <meta name="robots" content="${escapeHtml(meta.robots || "index, follow")}" />
  <link rel="canonical" href="${escapeHtml(meta.canonical)}" />
  ${(meta.stylesheets || [])
    .map(href => `<link rel="stylesheet" href="${escapeHtml(href)}" />`)
    .join("\n  ")}
  ${(meta.alternates || [])
    .map(
      alternate =>
        `<link rel="alternate" hreflang="${escapeHtml(alternate.hrefLang)}" href="${escapeHtml(alternate.href)}" />`
    )
    .join("\n  ")}

  <meta property="og:type" content="${escapeHtml(meta.type || "website")}" />
  <meta property="og:url" content="${escapeHtml(meta.canonical)}" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(meta.description)}" />
  <meta property="og:image" content="${escapeHtml(meta.ogImage)}" />
  <meta property="og:image:alt" content="${escapeHtml(meta.imageAlt || meta.title)}" />
  ${meta.imageWidth ? `<meta property="og:image:width" content="${meta.imageWidth}" />` : ""}
  ${meta.imageHeight ? `<meta property="og:image:height" content="${meta.imageHeight}" />` : ""}
  <meta property="og:locale" content="${escapeHtml(meta.locale || "zh_CN")}" />
  <meta property="og:site_name" content="立正 · Yuzheng Sun" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${escapeHtml(meta.canonical)}" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
  <meta name="twitter:image" content="${escapeHtml(meta.ogImage)}" />
  <meta name="twitter:image:alt" content="${escapeHtml(meta.imageAlt || meta.title)}" />
  ${
    meta.jsonLd
      ? `<script type="application/ld+json" data-page-structured-data="true">${serializeJsonLd(meta.jsonLd)}</script>`
      : ""
  }`;
}

function buildGuestsNoscript(guests: GuestProfile[], description: string) {
  const items = guests
    .map(
      guest =>
        `<li><a href="${escapeHtml(guest.share_url)}">${escapeHtml(guest.guest_name)}${
          guest.guest_company ? ` — ${escapeHtml(guest.guest_company)}` : ""
        }${guest.guest_title ? `，${escapeHtml(guest.guest_title)}` : ""}</a></li>`
    )
    .join("\n        ");

  return `
  <main style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
    <h1>课代表立正 · 全部嘉宾（${guests.length}位）</h1>
    <p>${escapeHtml(description)}</p>
    <ul>
        ${items}
    </ul>
  </main>`;
}

function buildGuestNoscript(guest: GuestProfile, description: string) {
  const insights = getGuestEnglishInsights(guest.slug)
    .map(
      article => `
    <section lang="en">
      <h2><a href="${escapeHtml(article.url)}">${escapeHtml(article.title)}</a></h2>
      <p>${escapeHtml(article.summary)}</p>
      ${article.takeaways?.length ? `<ul>${article.takeaways.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      <p><a href="${escapeHtml(article.url)}">Read the English insights</a></p>
    </section>`
    )
    .join("\n");
  const items = guest.episodes
    .map(
      (episode, index) =>
        `<li><a href="${escapeHtml(episode.url)}">${escapeHtml(episode.title)}</a>（第${
          index + 1
        }期${episode.isPrimary ? "，精选" : ""}）</li>`
    )
    .join("\n        ");

  return `
  <main style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
    <p><a href="${SITE_URL}/guests">返回全部嘉宾</a></p>
    <h1>${escapeHtml(guest.guest_name)}</h1>
    <p>${escapeHtml(description)}</p>
    ${guest.guest_bio ? `<p>${escapeHtml(guest.guest_bio)}</p>` : ""}
    ${guest.guest_bio_en ? `<p lang="en">${escapeHtml(guest.guest_bio_en)}</p>` : ""}
    ${guest.interview_date ? `<p>Recorded: ${escapeHtml(guest.interview_date)}</p>` : ""}
    ${insights}
    <h2>全部访谈</h2>
    <ol>
        ${items}
    </ol>
  </main>`;
}

function buildSitemapXml(guests: GuestProfile[]) {
  const latestGuestDate = latestDate(
    guests.flatMap(guest => guest.episodes.map(episode => episode.publishedAt))
  );
  const urls: Array<{ loc: string; lastmod?: string }> = [
    ...[
      HOME_PAGE_META,
      ABOUT_PAGE_META,
      BOOKS_PAGE_META,
      COLLAB_PAGE_META,
      CREATOR_COLLAB_PAGE_META,
      ENTERPRISE_TRAINING_PAGE_META,
    ].flatMap(meta =>
      (["zh", "en"] as const).map(lang => ({
        loc: meta[lang].canonical,
        lastmod: meta[lang].lastModified,
      }))
    ),
    { loc: `${SITE_URL}/zbs`, lastmod: ZHENBENSHI_PAGE_META.lastModified },
    { loc: `${SITE_URL}/guests`, lastmod: latestGuestDate },
    {
      loc: DECKS_PAGE_META.zh.canonical,
      lastmod: DECKS_PAGE_META.zh.lastModified,
    },
    {
      loc: DECKS_PAGE_META.en.canonical,
      lastmod: DECKS_PAGE_META.en.lastModified,
    },
    {
      loc: AIE_SHANGHAI_DECK_PAGE_META.canonical,
      lastmod: AIE_SHANGHAI_DECK_PAGE_META.lastModified,
    },
    {
      loc: `${SITE_URL}/decks/fake-work-fake-learning`,
      lastmod: "2026-09-28",
    },
    {
      loc: `${SITE_URL}/decks/fake-work-fake-learning/zh`,
      lastmod: "2026-09-29",
    },
    ...bookSitemapUrls(),
    ...writingSitemapUrls(),
    ...guests.map(guest => ({
      loc: guest.share_url,
      lastmod: latestDate(guest.episodes.map(episode => episode.publishedAt)),
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    url => `  <url>
    <loc>${escapeHtml(url.loc)}</loc>
${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>\n` : ""}  </url>`
  )
  .join("\n")}
</urlset>
`;
}

function latestDate(values: Array<string | undefined>): string | undefined {
  const dates = values
    .filter((value): value is string => Boolean(value))
    .map(value => value.slice(0, 10))
    .filter(value => /^\d{4}-\d{2}-\d{2}$/.test(value))
    .sort();

  return dates.at(-1);
}

const baseHtmlPath = path.join(ROOT, "dist", "public", "index.html");
if (!fs.existsSync(baseHtmlPath)) {
  console.error("dist/public/index.html 不存在，请先运行 vite build");
  process.exit(1);
}

const baseHtml = stripExistingSeo(fs.readFileSync(baseHtmlPath, "utf-8"));

function routeDirectory(route: string) {
  const segments = route.split("/").filter(Boolean);
  return path.join(ROOT, "dist", "public", ...segments);
}

// The language comes from the route itself (/en/… is English).
async function renderApp(route: string): Promise<string> {
  const app = React.createElement(App);
  const tree = React.createElement(WouterRouter, {
    ssrPath: route,
    children: app,
  });
  let renderError: unknown;
  const stream = await renderToReadableStream(tree, {
    onError(error) {
      renderError ||= error;
      console.error(`SSR failed for ${route}:`, error);
    },
  });
  await stream.allReady;
  if (renderError) throw renderError;
  return new Response(stream).text();
}

interface StaticPage {
  route: string;
  meta: PageMeta;
  lang: SiteLang;
  jsonLd: unknown;
  alternates?: Array<{ hrefLang: string; href: string }>;
  ogType?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  stylesheets?: string[];
  preloadImages?: string[];
}

function findBuiltStylesheet(pattern: RegExp): string {
  const assetsDirectory = path.join(ROOT, "dist", "public", "assets");
  const filename = fs
    .readdirSync(assetsDirectory)
    .find(asset => pattern.test(asset));
  if (!filename) {
    throw new Error(`Built stylesheet not found for ${pattern}`);
  }
  return `/assets/${filename}`;
}

const homeAlternates = languageAlternates(
  HOME_PAGE_META.en.canonical,
  HOME_PAGE_META.zh.canonical
);
const aboutAlternates = languageAlternates(
  ABOUT_PAGE_META.en.canonical,
  ABOUT_PAGE_META.zh.canonical
);
const booksAlternates = languageAlternates(
  BOOKS_PAGE_META.en.canonical,
  BOOKS_PAGE_META.zh.canonical
);
const collabAlternates = languageAlternates(
  COLLAB_PAGE_META.en.canonical,
  COLLAB_PAGE_META.zh.canonical
);
const creatorCollabAlternates = languageAlternates(
  CREATOR_COLLAB_PAGE_META.en.canonical,
  CREATOR_COLLAB_PAGE_META.zh.canonical
);
const enterpriseTrainingAlternates = languageAlternates(
  ENTERPRISE_TRAINING_PAGE_META.en.canonical,
  ENTERPRISE_TRAINING_PAGE_META.zh.canonical
);
const experimentMeta = {
  vercel: {
    en: {
      title: "Vercel Design Study · Yuzheng Sun",
      description:
        "A design experiment for Yuzheng Sun's personal site, applying the editorial and evidence-led principles of Vercel design.md.",
      canonical: `${SITE_URL}/en/experiment/vercel`,
      ogImage: HOME_PAGE_META.en.ogImage,
      lastModified: "2026-08-17",
      robots: "noindex, nofollow",
    },
    zh: {
      title: "Vercel设计原生实验 · 课代表立正",
      description:
        "课代表立正个人主页的Vercel design.md原生设计实验：编辑式构图、证据优先与近乎静态的阅读体验。",
      canonical: `${SITE_URL}/experiment/vercel`,
      ogImage: HOME_PAGE_META.zh.ogImage,
      lastModified: "2026-08-17",
      robots: "noindex, nofollow",
    },
  },
  emil: {
    en: {
      title: "Emil Motion Study · Yuzheng Sun",
      description:
        "A design experiment for Yuzheng Sun's personal site, applying Emil Kowalski's interaction and motion principles.",
      canonical: `${SITE_URL}/en/experiment/emil`,
      ogImage: HOME_PAGE_META.en.ogImage,
      lastModified: "2026-08-17",
      robots: "noindex, nofollow",
    },
    zh: {
      title: "Emil动效原生实验 · 课代表立正",
      description:
        "课代表立正个人主页的Emil Kowalski原生设计实验：以短促、可中断的状态切换组织内容与交互。",
      canonical: `${SITE_URL}/experiment/emil`,
      ogImage: HOME_PAGE_META.zh.ogImage,
      lastModified: "2026-08-17",
      robots: "noindex, nofollow",
    },
  },
} satisfies Record<"vercel" | "emil", Record<SiteLang, PageMeta>>;
const vercelExperimentAlternates = languageAlternates(
  experimentMeta.vercel.en.canonical,
  experimentMeta.vercel.zh.canonical
);
const emilExperimentAlternates = languageAlternates(
  experimentMeta.emil.en.canonical,
  experimentMeta.emil.zh.canonical
);
const fontStylesheet = findBuiltStylesheet(/^fonts-.+\.css$/);
// A fixed address for the same fonts, for pages rendered outside this build: the public answer
// pages at /ask/… (shared/ask-public-page.ts) link /fonts/serif.css.
fs.mkdirSync(path.join(ROOT, "dist", "public", "fonts"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "dist", "public", "fonts", "serif.css"),
  `@import url("${fontStylesheet}");\n`,
  "utf-8"
);
// ask.lizheng.ai's page (client/public/ask-app, from scripts/sync-ask-app.mjs) takes its title
// fonts from this build (vercel.json): every font its styles name must be here.
const askAppAssets = path.join(ROOT, "dist", "public", "ask-app", "assets");
if (fs.existsSync(askAppAssets)) {
  const built = new Set(fs.readdirSync(path.join(ROOT, "dist", "public", "assets")));
  const missing = new Set<string>();
  for (const name of fs.readdirSync(askAppAssets).filter(file => file.endsWith(".css")))
    for (const [, font] of fs.readFileSync(path.join(askAppAssets, name), "utf-8").matchAll(/\/ask-app\/assets\/(noto-serif-sc-[A-Za-z0-9_-]+\.woff2)/g))
      if (!built.has(font)) missing.add(font);
  if (missing.size)
    throw new Error(`ask.lizheng.ai's page needs ${missing.size} title fonts this build lacks (${[...missing][0]}, …); align @fontsource/noto-serif-sc and run pnpm sync:ask-app`);
  // The shared answer pages on ask.lizheng.ai (shared/ask-share-page.ts) take the same title fonts
  // from a fixed address there: /s/fonts.css names the current release's font styles.
  const release = JSON.parse(fs.readFileSync(path.join(ROOT, "dist", "public", "ask-app", "version.json"), "utf-8")) as { files: string[] };
  const titleStyles = release.files.filter(name => name.endsWith(".css") &&
    fs.readFileSync(path.join(askAppAssets, name), "utf-8").includes("/ask-app/assets/noto-serif-sc-"));
  if (!titleStyles.length) throw new Error("ask.lizheng.ai's page names no title font styles; the shared answer pages need them");
  fs.mkdirSync(path.join(ROOT, "dist", "public", "s"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "dist", "public", "s", "fonts.css"),
    titleStyles.map(name => `@import url("/ask-app/assets/${name}");\n`).join(""), "utf-8");
}
const vercelExperimentStylesheet = findBuiltStylesheet(
  /^home-experiment-(?!emil-).+\.css$/
);
const emilExperimentStylesheet = findBuiltStylesheet(
  /^home-experiment-emil-.+\.css$/
);
const staticPages: StaticPage[] = [
  {
    route: "/en",
    meta: HOME_PAGE_META.en,
    lang: "en",
    jsonLd: buildHomeStructuredData("en", HOME_PAGE_META.en.canonical),
    alternates: homeAlternates,
    ogType: "profile",
    imageAlt: "Yuzheng Sun (立正): MAKE WHAT LASTS.",
    imageWidth: 1200,
    imageHeight: 630,
    preloadImages: HOME_IMAGE_PRELOADS,
  },
  {
    route: "/",
    meta: HOME_PAGE_META.zh,
    lang: "zh",
    jsonLd: buildHomeStructuredData("zh", HOME_PAGE_META.zh.canonical),
    alternates: homeAlternates,
    ogType: "profile",
    imageAlt: "立正（孙煜征）：学点真本事，做点真东西。",
    imageWidth: 1200,
    imageHeight: 630,
    preloadImages: HOME_IMAGE_PRELOADS,
  },
  {
    route: "/en/about",
    meta: ABOUT_PAGE_META.en,
    lang: "en",
    jsonLd: buildAboutStructuredData("en", ABOUT_PAGE_META.en.canonical),
    alternates: aboutAlternates,
    ogType: "profile",
    imageAlt: "Portrait of Yuzheng Sun",
  },
  {
    route: "/about",
    meta: ABOUT_PAGE_META.zh,
    lang: "zh",
    jsonLd: buildAboutStructuredData("zh", ABOUT_PAGE_META.zh.canonical),
    alternates: aboutAlternates,
    ogType: "profile",
    imageAlt: "孙煜征头像",
  },
  {
    route: "/en/book",
    meta: BOOKS_PAGE_META.en,
    lang: "en",
    jsonLd: buildBooksStructuredData("en", BOOKS_PAGE_META.en.canonical),
    alternates: booksAlternates,
    imageAlt: "Yuzheng Sun at the Growth Data Analytics Playbook launch",
  },
  {
    route: "/book",
    meta: BOOKS_PAGE_META.zh,
    lang: "zh",
    jsonLd: buildBooksStructuredData("zh", BOOKS_PAGE_META.zh.canonical),
    alternates: booksAlternates,
    imageAlt: "孙煜征在《Growth Data Analytics Playbook》新书活动现场",
  },
  {
    route: "/zbs",
    meta: ZHENBENSHI_PAGE_META,
    lang: "zh",
    jsonLd: buildZhenbenshiStructuredData(),
    ogType: "book",
    imageAlt: "《真本事：从会工作到会赚钱》封面",
  },
  {
    route: "/podcast",
    meta: PODCAST_PAGE_META,
    lang: "zh",
    jsonLd: buildPodcastStructuredData(),
    imageAlt: "课代表立正Podcast节目封面",
  },
  {
    route: "/speaker",
    meta: GUEST_INVITATION_PAGE_META,
    lang: "zh",
    jsonLd: buildPodcastGuestInvitationStructuredData(),
    imageAlt: "课代表立正Podcast嘉宾邀请",
  },
  {
    route: "/decks",
    meta: DECKS_PAGE_META.zh,
    lang: "zh",
    jsonLd: buildDeckLibraryStructuredData("zh"),
    alternates: DECKS_LANGUAGE_ALTERNATES,
    imageAlt: "课代表立正在西雅图进行企业AI培训",
    imageWidth: 1280,
    imageHeight: 720,
  },
  {
    route: "/decks/aie-shanghai-2026",
    meta: AIE_SHANGHAI_DECK_PAGE_META,
    lang: "zh",
    jsonLd: buildAieShanghaiDeckStructuredData(),
    ogType: "article",
    imageAlt: "AIE Shanghai 2026合作会谈deck封面",
    imageWidth: 1280,
    imageHeight: 720,
  },
  {
    route: "/decks/0905",
    meta: FAMILY_PARTY_CUE_CARDS_PAGE_META,
    lang: "zh",
    jsonLd: null,
    imageAlt: "课代表立正",
  },
  {
    route: "/en/decks",
    meta: DECKS_PAGE_META.en,
    lang: "en",
    jsonLd: buildDeckLibraryStructuredData("en"),
    alternates: DECKS_LANGUAGE_ALTERNATES,
    imageAlt:
      "Yuzheng Sun leading an enterprise AI training session in Seattle",
    imageWidth: 1280,
    imageHeight: 720,
  },
  {
    route: "/en/experiment/vercel",
    meta: experimentMeta.vercel.en,
    lang: "en",
    jsonLd: null,
    alternates: vercelExperimentAlternates,
    imageAlt: "Vercel-inspired personal-site design study for Yuzheng Sun",
    stylesheets: [vercelExperimentStylesheet],
  },
  {
    route: "/experiment/vercel",
    meta: experimentMeta.vercel.zh,
    lang: "zh",
    jsonLd: null,
    alternates: vercelExperimentAlternates,
    imageAlt: "课代表立正个人主页的Vercel设计实验",
    stylesheets: [vercelExperimentStylesheet],
  },
  {
    route: "/en/experiment/emil",
    meta: experimentMeta.emil.en,
    lang: "en",
    jsonLd: null,
    alternates: emilExperimentAlternates,
    imageAlt: "Emil-inspired interaction and motion study for Yuzheng Sun",
    stylesheets: [emilExperimentStylesheet],
  },
  {
    route: "/experiment/emil",
    meta: experimentMeta.emil.zh,
    lang: "zh",
    jsonLd: null,
    alternates: emilExperimentAlternates,
    imageAlt: "课代表立正个人主页的Emil动效实验",
    stylesheets: [emilExperimentStylesheet],
  },
  ...(["en", "zh"] as const).flatMap(lang => {
    const collabMeta = COLLAB_PAGE_META[lang];
    const creatorMeta = CREATOR_COLLAB_PAGE_META[lang];
    const enterpriseMeta = ENTERPRISE_TRAINING_PAGE_META[lang];
    return [
      {
        route: lang === "en" ? "/en/collab" : "/collab",
        meta: collabMeta,
        lang,
        jsonLd: buildPersonWebPageStructuredData({
          canonical: collabMeta.canonical,
          name: collabMeta.title,
          description: collabMeta.description,
          lang,
          lastModified: collabMeta.lastModified,
        }),
        alternates: collabAlternates,
        preloadImages: ACQUIRED_IMAGE_PRELOADS,
        imageAlt:
          lang === "en"
            ? "Yuzheng Sun leading an AI training session in Seattle"
            : "孙煜征在西雅图进行AI培训",
      },
      {
        route: lang === "en" ? "/en/collab/creators" : "/collab/creators",
        meta: creatorMeta,
        lang,
        jsonLd: buildPersonWebPageStructuredData({
          canonical: creatorMeta.canonical,
          name: creatorMeta.title,
          description: creatorMeta.description,
          lang,
          lastModified: creatorMeta.lastModified,
        }),
        alternates: creatorCollabAlternates,
        preloadImages: ACQUIRED_IMAGE_PRELOADS,
        imageAlt:
          lang === "en"
            ? "Yuzheng Sun in a long-form public conversation"
            : "孙煜征参与长访谈",
      },
      {
        route: lang === "en" ? "/en/collab/enterprise" : "/collab/enterprise",
        meta: enterpriseMeta,
        lang,
        jsonLd: buildEnterpriseTrainingStructuredData(lang),
        alternates: enterpriseTrainingAlternates,
        imageAlt:
          lang === "en"
            ? "Yuzheng Sun leading enterprise AI training for DoorDash in Seattle"
            : "孙煜征在西雅图为DoorDash团队进行企业AI培训",
        imageWidth: 1280,
        imageHeight: 720,
      },
    ];
  }),
];

for (const page of staticPages) {
  const html = injectDocument(baseHtml, {
    head: buildHead({
      ...page.meta,
      locale: page.lang === "en" ? "en_US" : "zh_CN",
      type: page.ogType,
      alternates: page.alternates,
      jsonLd: page.jsonLd,
      imageAlt: page.imageAlt,
      imageWidth: page.imageWidth,
      imageHeight: page.imageHeight,
      stylesheets: page.stylesheets,
    }),
    bodyHtml: await renderApp(page.route),
    lang: page.lang === "en" ? "en-US" : "zh-CN",
    hydrate: true,
    preloadImages: page.preloadImages,
  });
  const directory = routeDirectory(page.route);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), html, "utf-8");
}

// Chinese like the site's default; the client re-renders /en/… misses in English.
const notFoundHtml = injectDocument(baseHtml, {
  head: buildHead({
    title: "页面不存在 · 孙煜征",
    description: "你访问的页面不存在。",
    canonical: `${SITE_URL}/404`,
    ogImage: HOME_PAGE_META.zh.ogImage,
    locale: "zh_CN",
    robots: "noindex, follow",
  }),
  bodyHtml: await renderApp("/404"),
  lang: "zh-CN",
  hydrate: false,
});
fs.writeFileSync(
  path.join(ROOT, "dist", "public", "404.html"),
  notFoundHtml,
  "utf-8"
);

let guests: GuestProfile[] = [];
try {
  guests = await fetchGuestDirectory();
  console.log(`   从部署快照读取嘉宾数据：${guests.length} 条`);
} catch (error) {
  console.error(
    `❌ 无法拉取 guest 数据：${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
}

const guestsPageMeta = getGuestsPageMeta(guests);
const guestsListHtml = injectDocument(baseHtml, {
  head: buildHead({
    ...guestsPageMeta,
    jsonLd: buildGuestsListStructuredData(guests, guestsPageMeta.description),
  }),
  bodyHtml: buildGuestsNoscript(guests, guestsPageMeta.description),
  lang: "zh-CN",
});

const guestsDir = path.join(ROOT, "dist", "public", "guests");
fs.mkdirSync(guestsDir, { recursive: true });
fs.writeFileSync(path.join(guestsDir, "index.html"), guestsListHtml, "utf-8");

for (const guest of guests) {
  const guestPageMeta = getGuestPageMeta(guest);
  const guestHtml = injectDocument(baseHtml, {
    head: buildHead({
      ...guestPageMeta,
      type: "profile",
      jsonLd: buildGuestStructuredData(guest, guestPageMeta.description),
    }),
    bodyHtml: buildGuestNoscript(guest, guestPageMeta.description),
    lang: "zh-CN",
  });

  const guestDir = path.join(guestsDir, guest.slug);
  fs.mkdirSync(guestDir, { recursive: true });
  fs.writeFileSync(path.join(guestDir, "index.html"), guestHtml, "utf-8");
}

const sitemapXml = buildSitemapXml(guests);
fs.writeFileSync(
  path.join(ROOT, "dist", "public", "sitemap.xml"),
  sitemapXml,
  "utf-8"
);

console.log(
  `✅ 预渲染完成: ${staticPages.length} 个完整静态页 + 404 + /guests + ${guests.length} 个 guest 子页`
);
console.log(
  `✅ sitemap 已更新，包含 ${(sitemapXml.match(/<url>/g) || []).length} 个 URL`
);
