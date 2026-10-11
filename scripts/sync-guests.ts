import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { validateGuestCatalog } from "../shared/guest-catalog";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILES = ["catalog/guests.json", "catalog/guest-articles.json"] as const;
const SHA = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const REPOSITORY = "sunyuzheng/lizheng-open-context";
export const digest = (data: Uint8Array | string): string => createHash("sha256").update(data).digest("hex");
export type GuestReleasePin = { schema_version: 2; repository: string; commit: string; manifest_sha256: string; snapshot_sha256: string };

export function verifyGuestRelease(snapshot: string, pin: GuestReleasePin): void {
  requireValue(pin.schema_version === 2 && pin.repository === REPOSITORY && COMMIT.test(pin.commit)
    && SHA.test(pin.manifest_sha256) && SHA.test(pin.snapshot_sha256), "guest_release_pin_invalid");
  requireValue(digest(snapshot) === pin.snapshot_sha256, "guest_snapshot_hash_drift");
  requireValue(snapshot.split("\n")[1] === `// Manifest SHA256: ${pin.manifest_sha256}`, "guest_snapshot_manifest_drift");
}

export function writeGuestRelease(directory: string, snapshot: string, pin: GuestReleasePin): void {
  verifyGuestRelease(snapshot, pin);
  noSymlinks(directory);
  const outputs = ["guest-catalog-snapshot.ts", "guest-catalog-pin.json"].map(name => path.join(directory, name));
  const previous = outputs.map(file => { if (!fs.existsSync(file)) return null; noSymlinks(file); return fs.readFileSync(file); });
  const temporary = outputs.map(file => `${file}.tmp-${process.pid}`);
  const values = [snapshot, JSON.stringify(pin, null, 2) + "\n"];
  let installed = 0;
  const created: string[] = [];
  try {
    temporary.forEach((file, i) => { fs.writeFileSync(file, values[i], { flag: "wx" }); created.push(file); });
    outputs.forEach((file, i) => { fs.renameSync(temporary[i], file); installed++; });
  } catch (error) {
    outputs.slice(0, installed).forEach((file, i) => {
      if (previous[i] === null) fs.rmSync(file); else fs.writeFileSync(file, previous[i]!);
    });
    throw error;
  } finally {
    created.forEach(file => fs.rmSync(file, { force: true }));
  }
}

function requireValue(value: unknown, code: string): asserts value { if (!value) throw new Error(code); }
function noSymlinks(file: string): void {
  for (let p = path.resolve(file); ; p = path.dirname(p)) {
    requireValue(!fs.lstatSync(p).isSymbolicLink(), "catalog_symlink_forbidden");
    if (path.dirname(p) === p) break;
  }
}
async function readRemote(commit: string, relative: string, cap: number): Promise<Buffer> {
  requireValue(COMMIT.test(commit) && ["release-manifest.json", ...FILES].includes(relative), "remote_pin_invalid");
  const response = await fetch(`https://raw.githubusercontent.com/${REPOSITORY}/${commit}/${relative}`, { redirect: "error", signal: AbortSignal.timeout(30_000) });
  requireValue(response.status === 200 && response.body, "remote_snapshot_unavailable");
  const chunks: Buffer[] = []; let bytes = 0;
  for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
    bytes += chunk.length; requireValue(bytes <= cap, "remote_snapshot_too_large"); chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
export async function loadGuestSnapshot(options: { contextDir?: string; manifestSha256: string; commit?: string }): Promise<{ snapshot: string; hashes: Record<string, string>; counts: Record<string, number> }> {
  requireValue(SHA.test(options.manifestSha256), "manifest_pin_required");
  if (options.contextDir) requireValue(path.isAbsolute(options.contextDir) && !options.commit, "local_context_path_invalid");
  else requireValue(options.commit && COMMIT.test(options.commit), "immutable_commit_required");
  const read = async (relative: string): Promise<Buffer> => {
    if (!options.contextDir) return readRemote(options.commit!, relative, 2 * 1024 * 1024);
    const file = path.join(options.contextDir, relative); noSymlinks(file);
    requireValue(fs.statSync(file).isFile() && fs.statSync(file).size <= 2 * 1024 * 1024, "catalog_file_invalid");
    return fs.readFileSync(file);
  };
  const manifestBytes = await read("release-manifest.json");
  requireValue(digest(manifestBytes) === options.manifestSha256, "manifest_hash_drift");
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  requireValue(manifest.schema_version === 3 && manifest.repository === REPOSITORY && manifest.intended_visibility === "public" && Array.isArray(manifest.files), "manifest_schema_invalid");
  const entries = new Map<string, { sha256: string; bytes: number }>();
  for (const e of manifest.files) {
    requireValue(e && typeof e.path === "string" && !entries.has(e.path) && SHA.test(e.sha256) && Number.isSafeInteger(e.bytes) && e.bytes >= 0, "manifest_entry_invalid");
    entries.set(e.path, e);
  }
  const blobs: Buffer[] = [], hashes: Record<string, string> = { "release-manifest.json": options.manifestSha256 };
  for (const relative of FILES) {
    const entry = entries.get(relative); requireValue(entry, "catalog_missing_from_manifest");
    const blob = await read(relative);
    requireValue(digest(blob) === entry.sha256 && blob.length === entry.bytes, "catalog_hash_drift");
    blobs.push(blob); hashes[relative] = entry.sha256;
  }
  const catalog = JSON.parse(blobs[0].toString("utf8")), articles = JSON.parse(blobs[1].toString("utf8"));
  validateGuestCatalog(catalog, articles);
  for (const [relative, hash] of Object.entries(hashes)) requireValue(digest(await read(relative)) === hash, "catalog_input_changed_during_read");
  const header = `// Generated from the pinned Open Context release. Do not edit by hand.\n// Manifest SHA256: ${options.manifestSha256}\n// guests.json SHA256: ${hashes[FILES[0]]}\n// guest-articles.json SHA256: ${hashes[FILES[1]]}\n`;
  return { snapshot: `${header}import type { GuestCatalog, GuestArticleCatalog } from "./guest-catalog";\n\nexport const guestCatalog: GuestCatalog = ${JSON.stringify(catalog, null, 2)};\n\nexport const guestArticleCatalog: GuestArticleCatalog = ${JSON.stringify(articles, null, 2)};\n`, hashes,
    counts: { entities: catalog.entities.length, sources: catalog.sources.length, appearances: catalog.appearances.length, articles: articles.articles.length } };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2); let contextDir: string | undefined, manifestSha256: string | undefined, apply = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--apply") { requireValue(!apply, "duplicate_option"); apply = true; }
    else if (args[i] === "--context-dir") { requireValue(!contextDir && args[i + 1], "context_dir_required"); contextDir = args[++i]; }
    else if (args[i] === "--manifest-sha256") { requireValue(!manifestSha256 && args[i + 1], "manifest_pin_required"); manifestSha256 = args[++i]; }
    else if (args[i] === "--help") { console.log("sync-guests [--context-dir ABSOLUTE --manifest-sha256 SHA256] [--apply]\nDefault: dry-run. Remote mode requires the committed guest-catalog-pin.json exact commit and manifest."); return; }
    else throw new Error("unknown_option");
  }
  let commit: string | undefined;
  if (contextDir) {
    requireValue(manifestSha256, "local_manifest_pin_required");
    commit = execFileSync("git", ["-C", contextDir, "rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const committed = execFileSync("git", ["-C", contextDir, "show", `${commit}:release-manifest.json`], { stdio: ["ignore", "pipe", "ignore"] });
    requireValue(COMMIT.test(commit) && digest(committed) === manifestSha256, "local_release_not_committed");
  }
  else {
    requireValue(!manifestSha256, "remote_pin_file_required");
    const file = path.join(ROOT, "shared/guest-catalog-pin.json"); noSymlinks(file);
    const pin = JSON.parse(fs.readFileSync(file, "utf8"));
    verifyGuestRelease(fs.readFileSync(path.join(ROOT, "shared/guest-catalog-snapshot.ts"), "utf8"), pin);
    commit = pin.commit; manifestSha256 = pin.manifest_sha256;
  }
  const result = await loadGuestSnapshot({ contextDir, commit: contextDir ? undefined : commit, manifestSha256: manifestSha256! });
  const pin: GuestReleasePin = { schema_version: 2, repository: REPOSITORY, commit: commit!, manifest_sha256: manifestSha256!, snapshot_sha256: digest(result.snapshot) };
  const output = path.join(ROOT, "shared/guest-catalog-snapshot.ts"); noSymlinks(path.dirname(output));
  if (fs.existsSync(output)) noSymlinks(output);
  if (apply) {
    writeGuestRelease(path.dirname(output), result.snapshot, pin);
  }
  console.log(JSON.stringify({ applied: apply, output: "shared/guest-catalog-snapshot.ts", pin, counts: result.counts, input_hashes: result.hashes, output_sha256: digest(result.snapshot) }));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => { const code = error instanceof Error && /^[a-z_]+$/.test(error.message) ? error.message : "unknown_failure"; console.error(`guest_catalog_sync_failed:${code}`); process.exitCode = 1; });
}
