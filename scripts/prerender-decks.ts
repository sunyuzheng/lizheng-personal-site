// Writes the web versions of the decks into the built site (scripts/deck-pages.ts).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeDeckPages } from "./deck-pages.ts";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "public");
console.log(`✅ 课件网页版：${writeDeckPages(dist)} 页`);
