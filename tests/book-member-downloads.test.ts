import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadBook, writeBookPages } from "../scripts/book-pages";

describe("Chinese book member downloads", () => {
  it("keeps every chapter readable and sends downloads to the existing member bookshelf", () => {
    const dist = mkdtempSync(path.join(tmpdir(), "growth-member-pages-"));
    try {
      const book = loadBook();
      expect(writeBookPages(dist)).toBe(book.chapters.length + 1);
      for (const suffix of ["", ...book.chapters.map((chapter) => `/${chapter.slug}`)]) {
        const html = readFileSync(path.join(dist, book.path, suffix, "index.html"), "utf8");
        expect(html).toContain("https://coffee.staysuperlinear.com/books#growth-data-analytics-playbook-zh");
        expect(html).toContain("Founding Member专属权益");
        expect(html).not.toContain("免费下载");
        expect(html).not.toContain(`${book.path}/${book.files.pdf}`);
        expect(html).not.toContain(`${book.path}/${book.files.epub}`);
        expect(html).toContain('<main id="main">');
        if (suffix) expect(html).toContain("<article");
      }
    } finally { rmSync(dist, { recursive: true, force: true }); }
  });

  it("blocks a public build that accidentally contains a full download", () => {
    const dist = mkdtempSync(path.join(tmpdir(), "growth-public-leak-"));
    try {
      const book = loadBook();
      mkdirSync(path.join(dist, book.path), { recursive: true });
      writeFileSync(path.join(dist, book.path, book.files.pdf), "synthetic leak fixture");
      expect(() => writeBookPages(dist)).toThrow("Member download must remain outside the public build");
    } finally { rmSync(dist, { recursive: true, force: true }); }
  });

  it("redirects both previous download URLs before static file handling", () => {
    const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
    for (const format of ["pdf", "epub"]) {
      const route = config.routes.find((entry: { src: string }) => new RegExp(entry.src).test(`/book/growth-data-analytics-playbook/growth-data-analytics-playbook-zh.${format}`));
      expect(route.status).toBe(307);
      expect(route.headers.Location).toBe("https://coffee.staysuperlinear.com/books#growth-data-analytics-playbook-zh");
      expect(route.headers["Cache-Control"]).toBe("no-store");
    }
  });
});
