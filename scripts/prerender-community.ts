/**
 * Writes the English page of community.lizheng.ai (/en) from the built Chinese
 * one, so the English address has its own title, description, canonical link
 * and visible words before any script runs. The page script still picks the
 * language from the address and applies the same words.
 */
import fs from "node:fs";
import path from "node:path";
import { COPY } from "../client/community-app/copy";

const dist = path.resolve("dist/public/community-app");
const source = path.join(dist, "index.html");

if (!fs.existsSync(source)) {
  console.log("community-app not built; skipping the English page");
  process.exit(0);
}

const zh = COPY.zh;
const en = COPY.en;
const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

let html = fs.readFileSync(source, "utf8");
const swap = (from: string, to: string) => {
  if (!html.includes(from))
    throw new Error(`Expected to find: ${from.slice(0, 80)}`);
  html = html.split(from).join(to);
};

swap('<html lang="zh-CN">', '<html lang="en">');
swap(`<title>${zh.title}</title>`, `<title>${escape(en.title)}</title>`);
swap(`content="${zh.description}"`, `content="${escape(en.description)}"`);
swap(
  '<link rel="canonical" href="https://community.lizheng.ai/" />',
  '<link rel="canonical" href="https://community.lizheng.ai/en" />'
);
swap(
  '<meta property="og:url" content="https://community.lizheng.ai/" />',
  '<meta property="og:url" content="https://community.lizheng.ai/en" />'
);
swap(
  `<meta property="og:title" content="${zh.heading}" />`,
  `<meta property="og:title" content="${escape(en.heading)}" />`
);
swap("/community-app/og.jpg", "/community-app/og-en.jpg");

// Visible words marked data-copy="key" (the same keys the script uses).
html = html.replace(
  /(data-copy="([a-z0-9.]+)"[^>]*>)([^<]*)</gi,
  (match, open: string, key: string) => {
    let value: unknown = en;
    for (const part of key.split("."))
      value = (value as Record<string, unknown>)?.[part];
    return typeof value === "string" ? `${open}${escape(value)}<` : match;
  }
);
html = html.replace(
  'placeholder="找一个人"',
  `placeholder="${escape(en.find.placeholder)}"`
);
html = html.replace(
  /<p class="noscript">[\s\S]*?<\/p>/,
  `<p class="noscript">The Superlinear Academy community map needs JavaScript. You can also see the map on <a href="https://www.lizheng.ai/en#superlinear">Yuzheng's homepage</a>, or <a href="https://www.superlinear.academy/">join Superlinear Academy free</a>.</p>`
);

fs.mkdirSync(path.join(dist, "en"), { recursive: true });
fs.writeFileSync(path.join(dist, "en", "index.html"), html);
console.log("✅ community.lizheng.ai: English page written");
