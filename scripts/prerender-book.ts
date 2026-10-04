// Writes the Chinese edition of Growth Data Analytics Playbook into the built site (scripts/book-pages.ts).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeBookPages } from "./book-pages.ts";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "public");
console.log(`✅ 书的页面：${writeBookPages(dist)} 页`);
