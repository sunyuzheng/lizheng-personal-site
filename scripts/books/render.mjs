// Renders the Chinese edition's cover, share image and PDF with Chromium (Playwright).
// Called by build_gdap_zh.py; Playwright is not a dependency of the site, so the module comes from
// PLAYWRIGHT_MODULE (default: the copy npx caches on this Mac).
//
//   node scripts/books/render.mjs shot <page.html> <out.png> <width> <height>
//   node scripts/books/render.mjs pdf <page.html> <out.pdf> [--cover]
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const moduleDir =
  process.env.PLAYWRIGHT_MODULE ||
  "/Users/sunyuzheng/.npm/_npx/361ceb562f3b3235/node_modules/playwright";
const { chromium } = createRequire(import.meta.url)(moduleDir);

const [mode, input, output, ...rest] = process.argv.slice(2);
const url = pathToFileURL(input).href;
const browser = await chromium.launch();

try {
  if (mode === "shot") {
    const [width, height] = rest.map(Number);
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(url);
    await page.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 60000 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: output, type: "png" });
  } else if (mode === "pdf") {
    const cover = rest.includes("--cover");
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: output,
      width: "140mm",
      height: "210mm",
      printBackground: true,
      outline: !cover,
      tagged: !cover,
      displayHeaderFooter: !cover,
      headerTemplate: "<span></span>",
      footerTemplate:
        '<div style="width:100%;text-align:center;font-size:7.5px;color:#8a8a82;font-family:\'PingFang SC\',sans-serif"><span class="pageNumber"></span></div>',
      margin: cover
        ? { top: "0", right: "0", bottom: "0", left: "0" }
        : { top: "16mm", right: "14mm", bottom: "17mm", left: "14mm" },
    });
  } else {
    throw new Error(`unknown mode ${mode}`);
  }
} finally {
  await browser.close();
}
