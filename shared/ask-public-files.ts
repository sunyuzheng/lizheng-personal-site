/**
 * What readers see, from files (2026-10-04). The user asked that 别人在问什么, the public answer
 * pages and shared answers be written when they change rather than read from the database for each
 * reader, so they stay up while the database or Ops is down. Both sites read one private Vercel Blob
 * store with its own token (ASK_FILES_BLOB_TOKEN; never this project's BLOB_READ_WRITE_TOKEN, which
 * is the community map's public store):
 *
 * - public/: Ops writes the lists, the index and each published answer whenever they change, and a
 *   heartbeat after every complete export (ask-lizheng-ops shared/public-files.ts). While the
 *   heartbeat is a few minutes old the files are the answer, and a question they do not have is
 *   gone; otherwise Ops is asked, and only when Ops cannot answer either do the last files stand in.
 *   So a broken export can never keep a withdrawn question up.
 * - share/<day>/<slug>.json: this site writes a shared answer's copy when it is shared. The share
 *   page still reads the live record (a deleted record is gone at once, and the view is counted) and
 *   uses the copy only when the database cannot answer. Ops deletes the copy before the record.
 */
import { get, put } from "@vercel/blob";
import { AccessError } from "./ask-access.js";
import { archivedAnswer } from "./ask-archive-answer.js";
import { fetchOpsJson, OPS_GATEWAY_MAX_RESPONSE_BYTES, OPS_UUID } from "./ask-ops-gateway.js";
import { SHARE_DAY, SHARE_SLUG, type SharedAnswer } from "./ask-share-link.js";

export const PUBLIC_FILES = {
  state: "public/state.json",
  lists: "public/lists.json",
  index: "public/index.json",
  detail: (publicId: string) => `public/detail/${publicId}.json`,
};
export const shareFile = (day: string, slug: string) => `share/${day}/${slug}.json`;
// Ops beats the heartbeat every minute; three minutes leaves room for a late or skipped run.
const FRESH_MS = 180_000;
const TOKEN = /^vercel_blob_rw_[A-Za-z0-9]+_\S+$/;

export type FileReader = (pathname: string) => Promise<string | null>;
export type FileWriter = (pathname: string, body: string) => Promise<void>;
function token() {
  const value = process.env.ASK_FILES_BLOB_TOKEN?.trim();
  return value && TOKEN.test(value) ? value : null;
}
/** Reads a file past the cache, so a file Ops just removed is not read back. */
export function fileReader(): FileReader | null {
  const key = token();
  if (!key) return null;
  return async pathname => {
    const result = await get(pathname, { access: "private", token: key, useCache: false, abortSignal: AbortSignal.timeout(5_000) });
    if (!result) return null;
    if (result.statusCode !== 200 || !result.stream || (result.blob.size ?? 0) > OPS_GATEWAY_MAX_RESPONSE_BYTES) throw new Error("file_unreadable");
    return new Response(result.stream).text();
  };
}
export function fileWriter(): FileWriter | null {
  const key = token();
  if (!key) return null;
  return async (pathname, body) => {
    await put(pathname, body, { access: "private", token: key, allowOverwrite: true, addRandomSuffix: false,
      contentType: "application/json; charset=utf-8", cacheControlMaxAge: 60, abortSignal: AbortSignal.timeout(5_000) });
  };
}

/** Which file holds one of Ops' public reads; the older paged list has none. */
export function publicFileFor(opsPath: string): string | null {
  const url = new URL(opsPath, "https://ops.invalid");
  const keys = [...url.searchParams.keys()];
  if (url.pathname !== "/api/discovery") return null;
  const action = url.searchParams.get("action");
  if ((action === "lists" || action === "index") && keys.length === 1) return action === "lists" ? PUBLIC_FILES.lists : PUBLIC_FILES.index;
  const id = url.searchParams.get("public_id") || "";
  if (action === "detail" && keys.length === 2 && OPS_UUID.test(id)) return PUBLIC_FILES.detail(id);
  return null;
}

// A warm function asks for the heartbeat at most every 15 seconds.
let heartbeat: { at: number; fresh: boolean } | undefined;
export function forgetHeartbeat() { heartbeat = undefined; }
async function filesFresh(read: FileReader, now: number) {
  if (heartbeat && now - heartbeat.at < 15_000 && now >= heartbeat.at) return heartbeat.fresh;
  let fresh = false;
  try {
    const raw = await read(PUBLIC_FILES.state);
    const state = raw === null ? null : JSON.parse(raw);
    const checked = Date.parse(String(state?.checked_at));
    fresh = state?.v === 1 && Number.isSafeInteger(state.epoch) && Number.isFinite(checked) && now - checked < FRESH_MS && checked - now < 60_000;
  } catch { fresh = false; }
  heartbeat = { at: now, fresh };
  return fresh;
}
function object(raw: string): Record<string, unknown> {
  const value = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("file_unreadable");
  return value as Record<string, unknown>;
}

/**
 * One of Ops' public reads (lists, index, a question's detail): from its file while the files are
 * fresh, otherwise from Ops, and from the last file only when Ops cannot answer. Errors are Ops':
 * public_item_unavailable (404) for a question that is not published.
 */
export async function publicJson(opsPath: string, options: { read?: FileReader | null; ops?: typeof fetchOpsJson; now?: number } = {}) {
  const ops = options.ops ?? fetchOpsJson;
  const read = options.read === undefined ? fileReader() : options.read;
  const file = publicFileFor(opsPath);
  if (!read || !file) return ops(opsPath, { method: "GET" });
  if (await filesFresh(read, options.now ?? Date.now())) {
    let raw: string | null | undefined;
    try { raw = await read(file); } catch { raw = undefined; }
    if (raw !== undefined) {
      if (raw === null && file.startsWith("public/detail/")) throw new AccessError("public_item_unavailable", 404);
      if (raw !== null) { try { return object(raw); } catch { /* ask Ops */ } }
    }
  }
  try { return await ops(opsPath, { method: "GET" }); }
  catch (error) {
    // Ops answered (a question that is not published): that stands. Ops could not answer: the last file.
    if (error instanceof AccessError && error.status !== 503) throw error;
    try { const raw = await read(file); if (raw !== null) return object(raw); } catch { /* none */ }
    throw error;
  }
}

/** Keeps a copy of a shared answer for when the database cannot answer. Never fails the share. */
export async function saveShareCopy(share: SharedAnswer, write: FileWriter | null = fileWriter()) {
  if (!write) return false;
  try {
    await write(shareFile(share.day, share.slug), JSON.stringify({ v: 1, ...share }));
    return true;
  } catch { return false; }
}

/** A shared answer's copy, or null: only while the database cannot say whether it is still shared. */
export async function readShareCopy(day: string, slug: string, read: FileReader | null = fileReader()): Promise<SharedAnswer | null> {
  if (!read || !SHARE_DAY.test(day) || !SHARE_SLUG.test(slug) || slug.length > 120) return null;
  try {
    const raw = await read(shareFile(day, slug));
    if (raw === null) return null;
    const value = object(raw);
    const answer = archivedAnswer(value.answer);
    if (value.v !== 1 || value.day !== day || value.slug !== slug || typeof value.question !== "string" || !value.question.trim() ||
        answer.status !== "answered" || typeof value.intent !== "string" || typeof value.created_at !== "string") return null;
    return { day, slug, question: value.question.trim(), answer, intent: value.intent, created_at: value.created_at };
  } catch { return null; }
}
