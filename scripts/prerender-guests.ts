import {
  SITE_URL,
  fetchGuestDirectory,
  getGuestPageMeta,
  getGuestsPageMeta,
  type GuestProfile,
} from "../shared/guest-data.ts";
import {
  COLLAB_PAGE_META,
  CREATOR_COLLAB_PAGE_META,
} from "../shared/collab-meta.ts";
import {
  ABOUT_PAGE_META,
  BOOKS_PAGE_META,
  HOME_PAGE_META,
  ZHENBENSHI_PAGE_META,
  languageAlternates,
  type PageMeta,
  type SiteLang,
} from "../shared/page-meta.ts";
import {
  buildAboutStructuredData,
  buildBooksStructuredData,
  buildGuestStructuredData,
  buildGuestsListStructuredData,
  buildHomeStructuredData,
  buildPersonWebPageStructuredData,
  buildZhenbenshiStructuredData,
} from "../shared/structured-data.ts";
import App from "../client/src/App.tsx";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToString } from "react-dom/server";
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

function stripHomeHeroPreloads(baseHtml: string) {
  return baseHtml.replace(
    /\s*<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bhref=["']\/hero\/acquired-behind-scenes-(?:desktop|mobile)\.webp["'])[^>]*>\s*/gi,
    "\n"
  );
}

function injectDocument(
  baseHtml: string,
  options: {
    head: string;
    bodyHtml: string;
    lang?: string;
    hydrate?: boolean;
    keepHomeHeroPreloads?: boolean;
  }
) {
  const sourceHtml = options.keepHomeHeroPreloads
    ? baseHtml
    : stripHomeHeroPreloads(baseHtml);
  const html = sourceHtml
    .replace("</head>", `${options.head}\n</head>`)
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
}) {
  return `
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />
  <meta name="robots" content="${escapeHtml(meta.robots || "index, follow")}" />
  <link rel="canonical" href="${escapeHtml(meta.canonical)}" />
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
  <meta property="og:locale" content="${escapeHtml(meta.locale || "zh_CN")}" />
  <meta property="og:site_name" content="课代表立正" />

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
    <h1>课代表立正 · 全部嘉宾（${guests.length} 位）</h1>
    <p>${escapeHtml(description)}</p>
    <ul>
        ${items}
    </ul>
  </main>`;
}

function buildGuestNoscript(guest: GuestProfile, description: string) {
  const items = guest.episodes
    .map(
      (episode, index) =>
        `<li><a href="${escapeHtml(episode.url)}">${escapeHtml(episode.title)}</a>（第 ${
          index + 1
        } 期${episode.isPrimary ? "，精选" : ""}）</li>`
    )
    .join("\n        ");

  return `
  <main style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
    <p><a href="${SITE_URL}/guests">返回全部嘉宾</a></p>
    <h1>${escapeHtml(guest.guest_name)}</h1>
    <p>${escapeHtml(description)}</p>
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
    { loc: `${SITE_URL}/`, lastmod: HOME_PAGE_META.en.lastModified },
    { loc: `${SITE_URL}/zh`, lastmod: HOME_PAGE_META.zh.lastModified },
    { loc: `${SITE_URL}/about`, lastmod: ABOUT_PAGE_META.en.lastModified },
    {
      loc: `${SITE_URL}/zh/about`,
      lastmod: ABOUT_PAGE_META.zh.lastModified,
    },
    { loc: `${SITE_URL}/book`, lastmod: BOOKS_PAGE_META.en.lastModified },
    {
      loc: `${SITE_URL}/zh/book`,
      lastmod: BOOKS_PAGE_META.zh.lastModified,
    },
    { loc: `${SITE_URL}/zbs`, lastmod: ZHENBENSHI_PAGE_META.lastModified },
    { loc: `${SITE_URL}/guests`, lastmod: latestGuestDate },
    { loc: `${SITE_URL}/collab`, lastmod: COLLAB_PAGE_META.en.lastModified },
    {
      loc: `${SITE_URL}/collab/creators`,
      lastmod: CREATOR_COLLAB_PAGE_META.en.lastModified,
    },
    {
      loc: `${SITE_URL}/zh/collab`,
      lastmod: COLLAB_PAGE_META.zh.lastModified,
    },
    {
      loc: `${SITE_URL}/zh/collab/creators`,
      lastmod: CREATOR_COLLAB_PAGE_META.zh.lastModified,
    },
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

function renderApp(route: string, lang: SiteLang) {
  const app = React.createElement(App, { defaultLang: lang });
  return renderToString(
    React.createElement(WouterRouter, { ssrPath: route, children: app })
  );
}

interface StaticPage {
  route: string;
  meta: PageMeta;
  lang: SiteLang;
  jsonLd: unknown;
  alternates?: Array<{ hrefLang: string; href: string }>;
  ogType?: string;
  imageAlt?: string;
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

const staticPages: StaticPage[] = [
  {
    route: "/",
    meta: HOME_PAGE_META.en,
    lang: "en",
    jsonLd: buildHomeStructuredData("en", HOME_PAGE_META.en.canonical),
    alternates: homeAlternates,
    ogType: "profile",
    imageAlt: "Yuzheng Sun with the hosts of Acquired",
  },
  {
    route: "/zh",
    meta: HOME_PAGE_META.zh,
    lang: "zh",
    jsonLd: buildHomeStructuredData("zh", HOME_PAGE_META.zh.canonical),
    alternates: homeAlternates,
    ogType: "profile",
    imageAlt: "孙煜征与 Acquired 两位主播对谈",
  },
  {
    route: "/about",
    meta: ABOUT_PAGE_META.en,
    lang: "en",
    jsonLd: buildAboutStructuredData("en", ABOUT_PAGE_META.en.canonical),
    alternates: aboutAlternates,
    ogType: "profile",
    imageAlt: "Portrait of Yuzheng Sun",
  },
  {
    route: "/zh/about",
    meta: ABOUT_PAGE_META.zh,
    lang: "zh",
    jsonLd: buildAboutStructuredData("zh", ABOUT_PAGE_META.zh.canonical),
    alternates: aboutAlternates,
    ogType: "profile",
    imageAlt: "孙煜征头像",
  },
  {
    route: "/book",
    meta: BOOKS_PAGE_META.en,
    lang: "en",
    jsonLd: buildBooksStructuredData("en", BOOKS_PAGE_META.en.canonical),
    alternates: booksAlternates,
    imageAlt: "Yuzheng Sun at the Growth Data Analytics Playbook launch",
  },
  {
    route: "/zh/book",
    meta: BOOKS_PAGE_META.zh,
    lang: "zh",
    jsonLd: buildBooksStructuredData("zh", BOOKS_PAGE_META.zh.canonical),
    alternates: booksAlternates,
    imageAlt: "孙煜征在 Growth Data Analytics Playbook 新书活动现场",
  },
  {
    route: "/zbs",
    meta: ZHENBENSHI_PAGE_META,
    lang: "zh",
    jsonLd: buildZhenbenshiStructuredData(),
    ogType: "book",
    imageAlt: "《真本事：从会工作到会赚钱》封面",
  },
  ...(["en", "zh"] as const).flatMap(lang => {
    const collabMeta = COLLAB_PAGE_META[lang];
    const creatorMeta = CREATOR_COLLAB_PAGE_META[lang];
    return [
      {
        route: lang === "en" ? "/collab" : "/zh/collab",
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
        imageAlt:
          lang === "en"
            ? "Yuzheng Sun leading an AI training session in Seattle"
            : "孙煜征在西雅图进行 AI 培训",
      },
      {
        route: lang === "en" ? "/collab/creators" : "/zh/collab/creators",
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
        imageAlt:
          lang === "en"
            ? "Yuzheng Sun in a long-form public conversation"
            : "孙煜征参与长访谈",
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
    }),
    bodyHtml: renderApp(page.route, page.lang),
    lang: page.lang === "en" ? "en-US" : "zh-CN",
    hydrate: true,
    keepHomeHeroPreloads:
      page.route === "/" ||
      page.route === "/zh" ||
      page.route.includes("/collab"),
  });
  const directory = routeDirectory(page.route);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), html, "utf-8");
}

const notFoundHtml = injectDocument(baseHtml, {
  head: buildHead({
    title: "Page not found · Yuzheng Sun",
    description: "This page does not exist.",
    canonical: `${SITE_URL}/404`,
    ogImage: HOME_PAGE_META.en.ogImage,
    locale: "en_US",
    robots: "noindex, follow",
  }),
  bodyHtml: renderApp("/404", "en"),
  lang: "en-US",
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

fs.writeFileSync(
  path.join(ROOT, "dist", "public", "sitemap.xml"),
  buildSitemapXml(guests),
  "utf-8"
);

console.log(
  `✅ 预渲染完成: ${staticPages.length} 个完整静态页 + 404 + /guests + ${guests.length} 个 guest 子页`
);
console.log(`✅ sitemap 已更新，包含 ${guests.length + 12} 个 URL`);
