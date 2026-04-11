import {
  SITE_URL,
  fetchGuestDirectory,
  getGuestPageMeta,
  getGuestsPageMeta,
  type GuestProfile,
} from "../shared/guest-data.ts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Build-time SEO uses the same merged guest directory as the app runtime.
// Source-of-truth details live in docs/guest-data.md.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TODAY = new Date().toISOString().slice(0, 10);

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
    .replace(/<title>[^<]*<\/title>/gi, "")
    .replace(/\s*<meta name="description"[^>]*>\s*/gi, "\n")
    .replace(/\s*<link rel="canonical"[^>]*>\s*/gi, "\n")
    .replace(/\s*<link rel="alternate" hreflang="[^"]+"[^>]*>\s*/gi, "\n")
    .replace(/\s*<meta property="og:[^"]+"[^>]*>\s*/gi, "\n")
    .replace(/\s*<meta property="profile:[^"]+"[^>]*>\s*/gi, "\n")
    .replace(/\s*<meta name="twitter:[^"]+"[^>]*>\s*/gi, "\n")
    .replace(
      /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi,
      "\n"
    );
}

function injectDocument(
  baseHtml: string,
  options: { head: string; noscript: string }
) {
  return baseHtml
    .replace("</head>", `${options.head}\n</head>`)
    .replace('<div id="root">', `<div id="root">${options.noscript}`);
}

function buildHead(meta: {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  type?: string;
  jsonLd?: unknown;
}) {
  return `
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />
  <link rel="canonical" href="${escapeHtml(meta.canonical)}" />

  <meta property="og:type" content="${escapeHtml(meta.type || "website")}" />
  <meta property="og:url" content="${escapeHtml(meta.canonical)}" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(meta.description)}" />
  <meta property="og:image" content="${escapeHtml(meta.ogImage)}" />
  <meta property="og:locale" content="zh_CN" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
  <meta name="twitter:image" content="${escapeHtml(meta.ogImage)}" />
  ${
    meta.jsonLd
      ? `<script type="application/ld+json">${serializeJsonLd(meta.jsonLd)}</script>`
      : ""
  }`;
}

function buildGuestsListJsonLd(guests: GuestProfile[], description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "课代表立正 · 超级节点嘉宾库",
    description,
    url: `${SITE_URL}/guests`,
    numberOfItems: guests.length,
    itemListElement: guests.map((guest, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: guest.guest_name,
        ...(guest.guest_en_name ? { alternateName: guest.guest_en_name } : {}),
        ...(guest.guest_title ? { jobTitle: guest.guest_title } : {}),
        ...(guest.guest_company
          ? { worksFor: { "@type": "Organization", name: guest.guest_company } }
          : {}),
        url: guest.share_url,
      },
    })),
  };
}

function buildGuestJsonLd(guest: GuestProfile, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${guest.guest_name} · 课代表立正`,
    description,
    url: guest.share_url,
    mainEntity: {
      "@type": "Person",
      name: guest.guest_name,
      ...(guest.guest_en_name ? { alternateName: guest.guest_en_name } : {}),
      ...(guest.guest_title ? { jobTitle: guest.guest_title } : {}),
      ...(guest.guest_company
        ? { worksFor: { "@type": "Organization", name: guest.guest_company } }
        : {}),
    },
    hasPart: guest.episodes.map(episode => ({
      "@type": "VideoObject",
      name: episode.title,
      url: episode.url,
      thumbnailUrl: episode.thumbnailUrl,
      ...(episode.publishedAt ? { uploadDate: episode.publishedAt } : {}),
    })),
  };
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
<noscript>
  <div style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
    <h1>课代表立正 · 全部嘉宾（${guests.length} 位）</h1>
    <p>${escapeHtml(description)}</p>
    <ul>
        ${items}
    </ul>
  </div>
</noscript>`;
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
<noscript>
  <div style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
    <p><a href="${SITE_URL}/guests">返回全部嘉宾</a></p>
    <h1>${escapeHtml(guest.guest_name)}</h1>
    <p>${escapeHtml(description)}</p>
    <h2>全部访谈</h2>
    <ol>
        ${items}
    </ol>
  </div>
</noscript>`;
}

function buildSitemapXml(guests: GuestProfile[]) {
  const urls = [
    { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${SITE_URL}/book`, changefreq: "monthly", priority: "0.8" },
    { loc: `${SITE_URL}/guests`, changefreq: "weekly", priority: "0.8" },
    ...guests.map(guest => ({
      loc: guest.share_url,
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    url => `  <url>
    <loc>${escapeHtml(url.loc)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

const baseHtmlPath = path.join(ROOT, "dist", "public", "index.html");
if (!fs.existsSync(baseHtmlPath)) {
  console.error("dist/public/index.html 不存在，请先运行 vite build");
  process.exit(1);
}

const baseHtml = stripExistingSeo(fs.readFileSync(baseHtmlPath, "utf-8"));

let guests: GuestProfile[] = [];
try {
  guests = await fetchGuestDirectory();
  console.log(`   从 GitHub 拉取嘉宾数据：${guests.length} 条`);
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
    jsonLd: buildGuestsListJsonLd(guests, guestsPageMeta.description),
  }),
  noscript: buildGuestsNoscript(guests, guestsPageMeta.description),
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
      jsonLd: buildGuestJsonLd(guest, guestPageMeta.description),
    }),
    noscript: buildGuestNoscript(guest, guestPageMeta.description),
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

console.log(`✅ 预渲染完成: /guests + ${guests.length} 个 guest 子页`);
console.log(`✅ sitemap 已更新，包含 ${guests.length + 3} 个 URL`);
