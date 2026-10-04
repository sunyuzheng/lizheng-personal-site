#!/usr/bin/env node
/**
 * ask.lizheng.ai's page is served from this site, so it opens at once even while Builder, which
 * answers the questions, is asleep. This copies the page from the ask-lizheng repository: it
 * builds that repository at its current commit for the path /ask-app/ and puts index.html and
 * its scripts and styles in client/public/ask-app/. The title fonts are this site's own
 * (identical files, same @fontsource version), served by vercel.json. The previous release's
 * files stay one more release, for pages opened just before an update. It also copies the words
 * about public Q&A (src/public-qa.js) to shared/ask-public-qa.js, which the homepage section uses
 * and the privacy policy is tested against, so the three never say different things.
 *
 *   pnpm sync:ask-app [path to ask-lizheng]   (default /Users/sunyuzheng/Desktop/AI/apps/ask-lizheng)
 *
 * Then commit and release this site as usual. See docs/ask-lizheng.md.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASK = path.resolve(process.argv[2] || process.env.ASK_APP_REPO || "/Users/sunyuzheng/Desktop/AI/apps/ask-lizheng");
const OUT = path.join(ROOT, "client", "public", "ask-app");
const FONT = /^noto-serif-sc-.+\.woff2$/;
const PUBLIC_QA = path.join(ROOT, "shared", "ask-public-qa.js");
const git = (...args) => execFileSync("git", ["-C", ASK, ...args], { encoding: "utf8" }).trim();
const fail = message => { console.error(`✗ ${message}`); process.exit(1); };

if (!fs.existsSync(path.join(ASK, "package.json"))) fail(`no ask-lizheng repository at ${ASK}`);
if (git("status", "--porcelain")) fail(`${ASK} has uncommitted changes; the page must come from a commit`);
const commit = git("rev-parse", "HEAD");
let onMain = false;
try { git("fetch", "-q", "origin", "main"); onMain = !!git("branch", "-r", "--contains", commit, "origin/main"); } catch {}
if (!onMain) console.warn(`! ${commit.slice(0, 7)} is not on origin/main yet; push it before releasing`);

const version = dir => JSON.parse(fs.readFileSync(path.join(dir, "node_modules", "@fontsource", "noto-serif-sc", "package.json"), "utf8")).version;
if (version(ASK) !== version(ROOT)) fail(`@fontsource/noto-serif-sc differs (ask ${version(ASK)}, site ${version(ROOT)}); the page's fonts come from this site`);

const build = fs.mkdtempSync(path.join(os.tmpdir(), "ask-app-"));
execFileSync("npx", ["vite", "build", "--base=/ask-app/", "--outDir", build, "--emptyOutDir", "--logLevel", "warn"], { cwd: ASK, stdio: "inherit" });

const files = fs.readdirSync(path.join(build, "assets")).filter(name => !FONT.test(name));
const previous = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(OUT, "version.json"), "utf8")).files || []; } catch { return []; }
})();
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
for (const name of fs.readdirSync(path.join(OUT, "assets")))
  if (!files.includes(name) && !previous.includes(name)) fs.rmSync(path.join(OUT, "assets", name));
for (const name of files) fs.copyFileSync(path.join(build, "assets", name), path.join(OUT, "assets", name));
fs.copyFileSync(path.join(build, "index.html"), path.join(OUT, "index.html"));
const publicQa = `// Copied from ask-lizheng src/public-qa.js by scripts/sync-ask-app.mjs. Edit it there, then sync.\n${fs.readFileSync(path.join(ASK, "src", "public-qa.js"), "utf8")}`;
fs.writeFileSync(PUBLIC_QA, publicQa);
const public_qa_sha256 = createHash("sha256").update(publicQa).digest("hex");
fs.writeFileSync(path.join(OUT, "version.json"), `${JSON.stringify({ commit, built_at: new Date().toISOString(), files, public_qa_sha256 }, null, 2)}\n`);
fs.rmSync(build, { recursive: true, force: true });
console.log(`✓ ask.lizheng.ai page from ask-lizheng ${commit.slice(0, 7)}: index.html and ${files.length} files in client/public/ask-app/, and shared/ask-public-qa.js`);
