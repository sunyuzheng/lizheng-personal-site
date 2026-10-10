// Reads every deck listed in content/decks/sources.json from its public slides and writes what the
// web version at /decks/<slug> needs: content/decks/pages/<file>.json (each slide's title, text and,
// where the deck ships one, its talk script) plus one WebP per slide and a share image under
// client/public/deck-slides/<file>/. The site build only reads these files; it never opens a deck.
//
//   node scripts/decks/capture_decks.mjs                 every deck
//   node scripts/decks/capture_decks.mjs fake-work ...   only the pages whose slug contains a word
//
// Playwright is not a dependency of the site, so the module comes from PLAYWRIGHT_MODULE (default: the
// copy npx caches on this Mac), and Chromium from PLAYWRIGHT_CHROMIUM when the cached browser and the
// package disagree. Needs cwebp and sips (macOS) for the images.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SOURCES = path.join(ROOT, "content", "decks", "sources.json");
const PAGES = path.join(ROOT, "content", "decks", "pages");
const IMAGES = path.join(ROOT, "client", "public", "deck-slides");

const moduleDir = process.env.PLAYWRIGHT_MODULE || "/Users/sunyuzheng/.npm/_npx/db89d7302a373f10/node_modules/playwright";
const { chromium } = createRequire(import.meta.url)(moduleDir);
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM ||
  "/Users/sunyuzheng/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell";

const WIDTH = 1600;
const HEIGHT = 900;

/** /decks/fake-work-fake-learning/zh → fake-work-fake-learning-zh */
const fileName = page => page.replace(/^\/decks\//, "").replaceAll("/", "-");

// Everything a slide shows but a reader should not get as text: the deck's own controls and the
// speaker notes (those come separately, and only from the decks listed with `notes`).
const SKIP = "aside.notes,script,style,noscript,template,button,dialog,[aria-hidden='true'],.notes,.controls,.progress,.slide-number";

/** Runs in the page: the text blocks of one slide, in reading order, plus its links. */
function extractSlide({ selector, skip }) {
  const root = typeof selector === "string" ? document.querySelector(selector) : null;
  if (!root) return { blocks: [], links: [], title: "" };
  const BLOCKY = new Set(["block", "flex", "grid", "list-item", "table", "table-cell", "table-row", "table-caption", "flow-root", "inline-block", "inline-flex", "inline-grid"]);
  const visible = el => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const blocks = [];
  const links = [];
  const inlineText = node => {
    let s = "";
    for (const c of node.childNodes) {
      if (c.nodeType === 3) s += c.data;
      else if (c.nodeType === 1) {
        if (c.matches(skip)) continue;
        if (c.tagName === "BR") { s += "\n"; continue; }
        const cs = getComputedStyle(c);
        if (cs.display === "none" || BLOCKY.has(cs.display)) continue;
        s += inlineText(c);
      }
    }
    return s;
  };
  const walk = el => {
    if (el.matches(skip) || !visible(el)) return;
    if (el.tagName.toLowerCase() === "svg") {
      const labels = [...el.querySelectorAll("text")].map(t => t.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
      if (labels.length) {
        const r = el.getBoundingClientRect();
        blocks.push({ text: labels.join(" · "), tag: "svg", fs: 0, fw: 400, li: false, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] });
      }
      return;
    }
    const cs = getComputedStyle(el);
    const text = inlineText(el).replace(/[ \t\r\f\v ]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{2,}/g, "\n").trim();
    if (text) {
      const r = el.getBoundingClientRect();
      blocks.push({
        text,
        tag: el.tagName.toLowerCase(),
        fs: parseFloat(cs.fontSize),
        fw: Number(cs.fontWeight) || 400,
        li: cs.display === "list-item" || el.tagName === "LI",
        box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
      });
    }
    const descend = parent => {
      for (const c of parent.children) {
        if (c.matches(skip)) continue;
        const d = getComputedStyle(c).display;
        if (d === "none") continue;
        if (BLOCKY.has(d) || c.tagName.toLowerCase() === "svg") walk(c);
        else descend(c);
      }
    };
    descend(el);
  };
  walk(root);
  for (const a of root.querySelectorAll("a[href]")) {
    if (a.closest(skip) || !visible(a)) continue;
    const href = a.href;
    const text = a.textContent.replace(/\s+/g, " ").trim();
    if (/^https?:/.test(href) && !links.some(l => l.href === href)) links.push({ href, text });
  }
  const label = (root.getAttribute("aria-label") || "").match(/^(?:第\d+页[：:]|Slide \d+: )(.+)$/);
  const title = root.getAttribute("data-title") || (label ? label[1] : "");
  const chapter = (root.getAttribute("data-chapter") || "").replace(/\s+/g, " ").trim();
  return { blocks, links, title, chapter };
}

async function settle(page, ms = 700) {
  await page.waitForTimeout(ms);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); })));
  });
}

/** Reads the talk script for slide i, where the deck ships one. */
async function readNotes(page, source, i) {
  const notes = source.notes;
  if (!notes) return "";
  if (notes.from === "global") {
    return page.evaluate(({ expr, i }) => { try { return String(new Function("i", `return ${expr}`)(i) ?? ""); } catch { return ""; } }, { expr: notes.expr, i });
  }
  if (notes.from === "reveal") {
    return page.evaluate(i => {
      const slide = window.Reveal.getSlides()[i];
      const aside = slide && slide.querySelector("aside.notes");
      if (aside) return aside.innerText || aside.textContent || "";
      return slide?.getAttribute("data-notes") || "";
    }, i);
  }
  if (notes.from === "script-array") {
    return page.evaluate(({ name, i }) => {
      if (!window.__deckNotes) {
        const code = [...document.querySelectorAll("script:not([src])")].map(s => s.textContent).join("\n");
        const start = code.search(new RegExp(`(?:var|let|const)\\s+${name}\\s*=\\s*\\[`));
        if (start < 0) return "";
        let depth = 0, end = -1, quote = null;
        for (let k = code.indexOf("[", start); k < code.length; k++) {
          const ch = code[k];
          if (quote) { if (ch === "\\") k++; else if (ch === quote) quote = null; continue; }
          if (ch === "'" || ch === '"' || ch === "`") quote = ch;
          else if (ch === "[") depth++;
          else if (ch === "]" && --depth === 0) { end = k + 1; break; }
        }
        window.__deckNotes = new Function(`return ${code.slice(code.indexOf("[", start), end)}`)();
      }
      return String(window.__deckNotes[i] ?? "");
    }, { name: notes.name, i });
  }
  throw new Error(`Unknown notes source ${notes.from}`);
}

function cleanNotes(text) {
  return text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map(p => p.replace(/[ \t ]+/g, " ").replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

async function capture(browser, source) {
  const file = fileName(source.page);
  const imageDir = path.join(IMAGES, file);
  fs.rmSync(imageDir, { recursive: true, force: true });
  fs.mkdirSync(imageDir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `deck-${file}-`));

  const [width, height] = source.viewport || [WIDTH, HEIGHT];
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(source.capture, { waitUntil: "networkidle", timeout: 90000 });
  await settle(page, 1500);

  // Show every build step at once and hide the deck's own controls, so each picture is the finished slide.
  const hide = [".reveal .controls", ".reveal .progress", ".reveal .slide-number", ...(source.hide || [])];
  await page.addStyleTag({
    content: `${hide.join(",")}{display:none!important}
.reveal .slides section .fragment{opacity:1!important;visibility:inherit!important;transform:none!important}
*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important;caret-color:transparent!important}`,
  });

  let count = source.count;
  if (count) {
    // Listed in sources.json.
  } else if (source.nav === "reveal") count = await page.evaluate(() => window.Reveal.getTotalSlides());
  else if (source.active) count = await page.evaluate(sel => document.querySelectorAll(sel.replace(/\.active|:not\(\[hidden\]\)/g, "")).length, source.active);
  if (!count) throw new Error(`${source.page}: cannot tell how many slides there are`);

  if (source.nav === "keys") {
    await page.keyboard.press("Home");
    await settle(page);
  }

  const slides = [];
  for (let i = 0; i < count; i++) {
    if (source.nav === "reveal") {
      await page.evaluate(i => {
        const slide = window.Reveal.getSlides()[i];
        const { h, v } = window.Reveal.getIndices(slide);
        window.Reveal.slide(h, v || 0);
        slide.setAttribute("data-capture", "current");
        document.querySelectorAll("[data-capture]").forEach(el => { if (el !== slide) el.removeAttribute("data-capture"); });
      }, i);
    } else if (source.nav.startsWith("call:")) {
      await page.evaluate(({ fn, i }) => window[fn](i), { fn: source.nav.slice(5), i });
    } else if (source.nav === "keys" && i > 0) {
      await page.keyboard.press("ArrowRight");
    }
    await settle(page, source.wait ?? 900);

    const selector = source.nav === "reveal" ? "[data-capture='current']" : source.active || "body";
    const content = await page.evaluate(extractSlide, { selector, skip: SKIP });
    const notes = cleanNotes(await readNotes(page, source, i));

    const n = String(i + 1).padStart(2, "0");
    const png = path.join(tmp, `${n}.png`);
    if (source.shot) await page.locator(source.shot).first().screenshot({ path: png });
    else await page.screenshot({ path: png });
    execFileSync("cwebp", ["-quiet", "-q", "80", "-resize", "1280", "720", png, "-o", path.join(imageDir, `${n}.webp`)]);
    if (i === 0) {
      const cropped = path.join(tmp, "og.png");
      const box = source.shot ? await page.locator(source.shot).first().boundingBox() : { x: 0, y: 0, width, height };
      const clipHeight = box.width * 630 / 1200;
      await page.screenshot({ path: cropped, clip: { x: box.x, y: box.y + (box.height - clipHeight) / 2, width: box.width, height: clipHeight } });
      execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", "-z", "630", "1200", cropped, "--out", path.join(imageDir, "og.jpg")], { stdio: "ignore" });
    }
    slides.push({ n: i + 1, image: `${n}.webp`, ...content, notes });
    process.stdout.write(".");
  }
  await page.close();
  fs.rmSync(tmp, { recursive: true, force: true });

  const out = {
    page: source.page,
    deck: source.deck,
    language: source.language,
    capturedFrom: source.capture,
    capturedAt: new Date().toISOString().slice(0, 10),
    slides,
  };
  fs.mkdirSync(PAGES, { recursive: true });
  fs.writeFileSync(path.join(PAGES, `${file}.json`), `${JSON.stringify(out, null, 1)}\n`);
  console.log(` ${source.page}: ${slides.length} slides`);
}

const filters = process.argv.slice(2);
const { decks } = JSON.parse(fs.readFileSync(SOURCES, "utf-8"));
const selected = decks.filter(d => !filters.length || filters.some(f => d.page.includes(f)));
const browser = await chromium.launch({ executablePath });
let failed = 0;
for (const source of selected) {
  try {
    await capture(browser, source);
  } catch (error) {
    failed++;
    console.error(`\n✗ ${source.page}: ${error.message.split("\n")[0]}`);
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
