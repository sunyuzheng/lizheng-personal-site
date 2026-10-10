import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { deckSitemapUrls, writeDeckPages } from "../scripts/deck-pages.ts";
import { DECK_LIBRARY } from "../shared/deck-index.ts";

const ROOT = path.resolve(__dirname, "..");
const dist = fs.mkdtempSync(path.join(os.tmpdir(), "deck-pages-"));
const count = writeDeckPages(dist);
const pages = DECK_LIBRARY.flatMap(deck => [deck.page, deck.alternateEdition?.page]).filter(Boolean) as string[];
const read = (page: string) => fs.readFileSync(path.join(dist, ...page.split("/").filter(Boolean), "index.html"), "utf-8");
const fileOf = (page: string) => page.replace(/^\/decks\//, "").replaceAll("/", "-");
// Routes for www.lizheng.ai: the ones limited to another host (ask.lizheng.ai, speaker.…) never see these paths.
const wwwRoutes = (JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8")).routes as Array<{ src?: string; dest?: string; has?: Array<{ type: string; value: string }> }>).filter(
  r => !r.has?.some(h => h.type === "host" && !new RegExp(`^${h.value}$`).test("www.lizheng.ai"))
);
const matches = (src: string, pathname: string) => new RegExp(`^${src.replace(/^\^/, "").replace(/\$$/, "")}$`).test(pathname);

describe("deck web versions", () => {
  it("writes one page for every card that has a web version", () => {
    expect(count).toBe(pages.length);
    expect(deckSitemapUrls().map(u => u.loc).sort()).toEqual(pages.map(p => `https://www.lizheng.ai${p}`).sort());
  });

  it.each(pages)("%s has its words, pictures and canonical in the first HTML", page => {
    const html = read(page);
    const capture = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "decks", "pages", `${fileOf(page)}.json`), "utf-8"));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain(`<link rel="canonical" href="https://www.lizheng.ai${page}">`);
    expect(html.match(/<section class="slide /g)).toHaveLength(capture.slides.length);
    for (const slide of capture.slides) {
      expect(fs.existsSync(path.join(ROOT, "client", "public", "deck-slides", fileOf(page), slide.image))).toBe(true);
    }
    expect(fs.existsSync(path.join(ROOT, "client", "public", "deck-slides", fileOf(page), "og.jpg"))).toBe(true);
    for (const json of html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) ?? []) {
      expect(() => JSON.parse(json.replace(/^<script[^>]*>|<\/script>$/g, ""))).not.toThrow();
    }
    // Speaker notes appear only for the decks listed with `notes` in sources.json.
    const withNotes = capture.slides.some((s: { notes: string[] }) => s.notes.length);
    expect(html.includes('class="script-label"')).toBe(withNotes);
  });

  it("no route in vercel.json sends a web version away to a deck origin", () => {
    const proxies = wwwRoutes.filter(r => r.src && r.dest?.startsWith("http"));
    for (const page of pages) {
      for (const route of proxies) expect(matches(route.src!, page), `${route.src} matches ${page}`).toBe(false);
    }
  });

  it("slides that moved under /slides still reach their deck", () => {
    const onSite = DECK_LIBRARY.flatMap(deck => [deck.href, deck.alternateEdition?.href])
      .filter((href): href is string => !!href && href.startsWith("https://www.lizheng.ai/decks/") && href.endsWith("/slides"))
      .map(href => href.replace("https://www.lizheng.ai", ""));
    expect(onSite.length).toBeGreaterThan(0);
    for (const slides of onSite) {
      const route = wwwRoutes.find(r => r.src && r.dest && matches(r.src, slides));
      // The AIE slides are a page of this site (no proxy); the rest go to their deck project.
      if (slides === "/decks/aie-shanghai-2026/slides") expect(route).toBeUndefined();
      else expect(route?.dest).toMatch(/^https:\/\//);
    }
  });
});
