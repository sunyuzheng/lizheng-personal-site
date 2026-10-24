/**
 * The share images of city.lizheng.ai: client/public/community-app/og.jpg
 * (Chinese) and og-en.jpg (English), 1200×630. Each is the page itself at
 * rest, the tilted city with the title and the line under it, without the
 * search, the timeline and numbers, the join button or the names on the city.
 *
 *   pnpm community:og                     the live page: deployed code, today's data
 *   pnpm community:og --base=<address>    another copy, e.g. a local `pnpm dev`
 *                                         at http://localhost:5173/community-app/
 *
 * English is the same address with ?lang=en. With reduced motion the page
 * skips the opening and the city stands still at its starting angle, so the
 * picture changes only when the page or the data does.
 *
 * Playwright is not a dependency of the site, so the module comes from
 * PLAYWRIGHT_MODULE (default: the copy npx caches on this Mac, as in
 * scripts/decks/capture_decks.mjs), and the browser from PLAYWRIGHT_CHROME: a
 * full Chrome for Testing on Metal, since the city needs WebGL2.
 */
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const OUT = path.resolve("client/public/community-app");
const WIDTH = 1200;
const HEIGHT = 630;
// The page as it looks on a 1440×900 laptop, where the city clears the title
// (in smaller or shorter windows the line under the title runs into it). The
// cut to the image's shape takes off the bottom, the band the page keeps
// under the city for the timeline (layoutView in client/community-app/main.ts).
const WINDOW = { width: 1440, height: 900 };
const CUT = { x: 0, y: 0, width: 1440, height: 756 };
// Shot at twice the size, for smooth lines and lettering.
const SCALE = 2;

// Everything but the city, the title and the line under it. The veil behind
// the title stays; the ones behind the search and the bar go with them.
const HIDE = `
.bar, .find, .zoom, .hint, .status, .tip, .panel, .names, .sky-veil {
  visibility: hidden !important;
}
.city::after { content: none !important; }`;

const moduleDir =
  process.env.PLAYWRIGHT_MODULE ||
  "/Users/sunyuzheng/.npm/_npx/db89d7302a373f10/node_modules/playwright";
const { chromium } = createRequire(import.meta.url)(moduleDir);
const executablePath =
  process.env.PLAYWRIGHT_CHROME ||
  path.join(
    os.homedir(),
    "Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64",
    "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
  );

const base =
  process.argv.find(arg => arg.startsWith("--base="))?.slice(7) ||
  "https://city.lizheng.ai/";
const english = new URL(base);
english.searchParams.set("lang", "en");

const browser = await chromium.launch({
  executablePath,
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});
try {
  for (const [url, file] of [
    [base, "og.jpg"],
    [english.href, "og-en.jpg"],
  ]) {
    const page = await browser.newPage({
      viewport: WINDOW,
      deviceScaleFactor: SCALE,
      reducedMotion: "reduce",
    });
    await page.goto(url);
    await page.addStyleTag({ content: HIDE });
    // The loading line goes once the city is drawing (start() in main.ts);
    // it stays, with another message, when the data or WebGL2 fails.
    try {
      await page.waitForSelector("#status.off", {
        state: "attached",
        timeout: 60_000,
      });
    } catch {
      throw new Error(
        `${url}: the city did not start (${await page.textContent("#status")})`
      );
    }
    // The serif title arrives after first paint (fonts.css).
    await page.waitForFunction(() =>
      [...document.fonts].some(face =>
        /Noto Serif SC|Source Serif 4/.test(face.family)
      )
    );
    await page.evaluate(async () => {
      const title = document.querySelector("h1")!;
      const style = getComputedStyle(title);
      await document.fonts.load(
        `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
        title.textContent ?? ""
      );
      await document.fonts.ready;
    });
    await page.waitForTimeout(1000);
    const shot = await page.screenshot({ clip: CUT });
    await page.close();
    await sharp(shot)
      .resize(WIDTH, HEIGHT)
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(path.join(OUT, file));
    console.log(`✅ ${file} from ${url}`);
  }
} finally {
  await browser.close();
}
