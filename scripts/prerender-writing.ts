// Writes the Chinese editions of the Statsig blog posts into the built site (scripts/writing-pages.ts).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeWritingPages } from "./writing-pages.ts";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "public");
console.log(`✅ Statsig文章：${writeWritingPages(dist)} 页`);
