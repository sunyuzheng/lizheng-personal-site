import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// ask.lizheng.ai's page is served from client/public/ask-app (scripts/sync-ask-app.mjs). Every file
// the page loads must be there, or the page breaks while Builder is fine.
const DIR = path.resolve(__dirname, "../client/public/ask-app");
const read = (file: string) => readFileSync(path.join(DIR, file), "utf8");

describe("ask.lizheng.ai page files", () => {
  it("has the page, its version and the ask host's robots.txt", () => {
    expect(read("index.html")).toContain('<div id="root"></div>');
    expect(JSON.parse(read("version.json")).commit).toMatch(/^[0-9a-f]{40}$/);
    expect(read("robots.txt")).toContain("Sitemap: https://www.lizheng.ai/ask/sitemap.xml");
  });

  it("names only files that are here, under /ask-app/assets/", () => {
    const present = new Set(readdirSync(path.join(DIR, "assets")));
    const named = new Set<string>();
    for (const file of ["index.html", ...[...present].filter(name => /\.(js|css)$/.test(name)).map(name => `assets/${name}`)])
      for (const [, name] of read(file).matchAll(/\/ask-app\/assets\/([A-Za-z0-9_.-]+\.(?:js|css))/g)) named.add(name);
    expect([...named].filter(name => !present.has(name))).toEqual([]);
    expect([...named].some(name => /^index-.+\.js$/.test(name))).toBe(true);
    expect(read("index.html")).not.toMatch(/(?:src|href)="\/assets\//);
  });

  it("keeps the files the last sync listed", () => {
    const { files } = JSON.parse(read("version.json"));
    expect(files.filter((name: string) => !existsSync(path.join(DIR, "assets", name)))).toEqual([]);
  });
});
