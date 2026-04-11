/**
 * 构建时预渲染 /guests 页面
 *
 * 作用：生成 dist/public/guests/index.html，内含：
 *   - 页面专属 <title> / <meta description> / canonical / og 标签
 *   - JSON-LD ItemList（128 位嘉宾结构化数据）
 *   - <noscript> 纯文本嘉宾列表（供无 JS 爬虫读取）
 *
 * Vercel 静态部署时，真实文件优先于 rewrite 规则，
 * 所以 /guests 会直接命中这个文件，不走 index.html 的 rewrite。
 * React 仍然会正常 hydrate，提供完整交互体验。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── 读取数据 ──────────────────────────────────────────────────────────────
const guestsPath = path.join(ROOT, "client", "src", "data", "guests.json");
const guests = JSON.parse(fs.readFileSync(guestsPath, "utf-8"));

const baseHtmlPath = path.join(ROOT, "dist", "public", "index.html");
if (!fs.existsSync(baseHtmlPath)) {
  console.error("❌ dist/public/index.html 不存在，请先运行 vite build");
  process.exit(1);
}
let html = fs.readFileSync(baseHtmlPath, "utf-8");

// ── 构建注入内容 ───────────────────────────────────────────────────────────
const totalGuests = guests.length;
const totalEpisodes = guests.reduce((s, g) => s + g.episode_count, 0);

// 提取 top 公司用于 meta description
const topCompanies = [
  ...new Set(guests.slice(0, 30).map((g) => g.guest_company).filter(Boolean)),
]
  .slice(0, 6)
  .join("、");

const pageTitle = `全部嘉宾 · 课代表立正 — ${totalGuests}位科技领袖访谈`;
const pageDesc = `课代表立正访谈过的 ${totalGuests} 位嘉宾，${totalEpisodes} 期对话，涵盖 ${topCompanies} 等顶级科技公司的领袖、创始人与投资人。`;
const pageUrl = "https://www.lizheng.ai/guests";
const ogImage = "https://www.lizheng.ai/profile.jpg";

// JSON-LD：ItemList（每位嘉宾作为一条 ListItem + Person）
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "课代表立正 · 超级节点嘉宾库",
  description: pageDesc,
  url: pageUrl,
  numberOfItems: totalGuests,
  itemListElement: guests.map((g, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Person",
      name: g.guest_name,
      ...(g.guest_en_name ? { alternateName: g.guest_en_name } : {}),
      ...(g.guest_title ? { jobTitle: g.guest_title } : {}),
      ...(g.guest_company
        ? { worksFor: { "@type": "Organization", name: g.guest_company } }
        : {}),
      url: g.primary_url,
    },
  })),
};

// <noscript> 纯文本列表（无 JS 爬虫可读）
const noscriptItems = guests
  .map(
    (g) =>
      `<li><a href="${g.primary_url}">${g.guest_name}${g.guest_company ? ` — ${g.guest_company}` : ""}${g.guest_title ? `，${g.guest_title}` : ""}</a></li>`
  )
  .join("\n        ");

const noscript = `
<noscript>
  <div style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
    <h1>课代表立正 · 全部嘉宾（${totalGuests} 位）</h1>
    <p>${pageDesc}</p>
    <ul>
        ${noscriptItems}
    </ul>
  </div>
</noscript>`;

// ── 注入 <head> ────────────────────────────────────────────────────────────
const headInject = `
  <!-- /guests 页面专属 SEO（构建时预渲染注入） -->
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}" />
  <link rel="canonical" href="${pageUrl}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${pageTitle}" />
  <meta property="og:description" content="${pageDesc}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:locale" content="zh_CN" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${pageTitle}" />
  <meta name="twitter:description" content="${pageDesc}" />
  <meta name="twitter:image" content="${ogImage}" />

  <!-- JSON-LD 结构化数据 -->
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

// 在原 <title> 之前注入（替换 head 中的默认 title）
html = html
  .replace(/<title>[^<]*<\/title>/, "")           // 移除原 title（React 会用 useEffect 更新，但 SEO 需要静态 title）
  .replace("</head>", headInject + "\n</head>")   // 注入 SEO 标签
  .replace('<div id="root">', '<div id="root">' + noscript); // 注入 noscript 内容

// ── 写出文件 ───────────────────────────────────────────────────────────────
const outDir = path.join(ROOT, "dist", "public", "guests");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "index.html");
fs.writeFileSync(outPath, html, "utf-8");

console.log(`✅ 预渲染完成: dist/public/guests/index.html`);
console.log(`   嘉宾数: ${totalGuests}，期数: ${totalEpisodes}`);
console.log(`   JSON-LD ItemList: ${totalGuests} 条`);
console.log(`   <noscript> 列表: ${totalGuests} 项`);
