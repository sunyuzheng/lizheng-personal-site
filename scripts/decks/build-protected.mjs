import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ITERATIONS = 600_000;

/** Read the canonical PNG/PDF export locally; only ciphertext goes into output. */
export function buildProtected({ source, output, password, slug, title }) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Invalid slug");
  if (password.length < 8) throw new Error("Use a password of at least 8 characters");
  source = path.resolve(source);
  output = path.resolve(output);
  if (output === source || source.startsWith(output + path.sep)) throw new Error("Output must not contain the source");
  const marker = path.join(output, ".protected-deck-build");
  if (fs.existsSync(output) && (!fs.existsSync(marker) || fs.readFileSync(marker, "utf8") !== slug)) {
    throw new Error("Refusing to replace a directory not owned by this build");
  }
  const files = fs.readdirSync(path.join(source, "assets")).filter(name => /^slide-\d{2}\.png$/.test(name)).sort();
  if (!files.length || files.some((name, i) => name !== `slide-${String(i + 1).padStart(2, "0")}.png`)) {
    throw new Error("Expected a complete, sequential slide PNG export");
  }
  const pdf = fs.readFileSync(path.join(source, "deck.pdf"));
  if (pdf.subarray(0, 5).toString() !== "%PDF-") throw new Error("Invalid PDF");
  const images = files.map(file => fs.readFileSync(path.join(source, "assets", file)));
  if (images.some(data => !data.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")))) throw new Error("Invalid PNG");
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");
  const seal = data => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    return Buffer.concat([iv, cipher.update(data), cipher.final(), cipher.getAuthTag()]);
  };
  const manifest = {
    version: 1,
    title,
    slides: files.map((_, i) => ({ file: `slide-${String(i + 1).padStart(2, "0")}.enc`, type: "image/png" })),
    pdf: { file: "handout.enc", type: "application/pdf", name: "Judgment-Engineering.pdf" },
  };
  const config = { version: 1, slug, iterations: ITERATIONS, salt: salt.toString("base64") };
  const escape = text => text.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const template = fs.readFileSync(path.join(HERE, "protected-template.html"), "utf8");
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(marker, slug);
  fs.writeFileSync(path.join(output, "index.html"), template.replaceAll("__TITLE__", escape(title)));
  fs.copyFileSync(path.join(HERE, "protected-viewer.js"), path.join(output, "viewer.js"));
  fs.writeFileSync(path.join(output, "config.json"), JSON.stringify(config));
  fs.writeFileSync(path.join(output, "manifest.enc"), seal(Buffer.from(JSON.stringify(manifest))));
  images.forEach((image, i) => fs.writeFileSync(path.join(output, manifest.slides[i].file), seal(image)));
  fs.writeFileSync(path.join(output, "handout.enc"), seal(pdf));
  fs.writeFileSync(path.join(output, "robots.txt"), "User-agent: *\nDisallow: /\n");
  fs.writeFileSync(path.join(output, "vercel.json"), JSON.stringify({
    cleanUrls: true,
    trailingSlash: false,
    headers: [{ source: "/(.*)", headers: [
      { key: "Cache-Control", value: "no-store" },
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Content-Security-Policy", value: "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; img-src blob: data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" },
    ] }],
  }, null, 2) + "\n");
  return { slides: images.length, files: fs.readdirSync(output).length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: {
    source: { type: "string" }, output: { type: "string" },
    "password-file": { type: "string" }, slug: { type: "string" }, title: { type: "string" },
  } });
  if (Object.values(values).length !== 5) throw new Error("Required: --source --output --password-file --slug --title");
  const password = fs.readFileSync(values["password-file"], "utf8").trim();
  console.log(buildProtected({ ...values, password }));
}
