/**
 * 分享这条回答 on the homepage's Ask section: an answered question gets its own public page at
 * ask.lizheng.ai/s/<date>/<word> (shared/ask-share-link.ts); the page stays. Each answered result carries `share`:
 * the record, its address word and Builder's proof, which only this page holds. A share may give
 * back one of today's questions; that offer never shows inside WeChat, which forbids rewarding shares.
 * ask.lizheng.ai has the same module (ask-lizheng's src/share-link.js).
 */
import type { AskShare } from "./ask-lizheng";

export const IN_WECHAT = typeof navigator !== "undefined" && /MicroMessenger/i.test(navigator.userAgent);
export type ShareResult = { url: string; bonus: "granted" | "claimed" | "unused" | "unlimited" | "off"; remaining?: number };

async function post(path: string, body: unknown) {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    credentials: "same-origin", cache: "no-store" });
  const value = await response.json().catch(() => null);
  if (!response.ok || !value) throw new Error(value?.code || "share_failed");
  return value;
}

/** Makes (or finds) the answer's page; `bonus` asks for today's question back. */
export async function createShareLink(share: AskShare, options: { bonus: boolean }): Promise<ShareResult> {
  const value = await post("/api/ask-lizheng/share", { record_id: share.record_id, word: share.word, proof: share.proof, surface: "home", bonus: options.bonus });
  if (typeof value.url !== "string" || !value.url.startsWith("https://ask.lizheng.ai/s/")) throw new Error("share_failed");
  return value as ShareResult;
}

/** Copies text that is still on its way. Safari lets a page write the clipboard only while the
 * click lasts, so the write starts now and waits for the text; elsewhere it is written when it comes. */
export async function copyWhenReady(text: string | Promise<string>): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ "text/plain": Promise.resolve(text).then(value => new Blob([value], { type: "text/plain" })) })]);
      return true;
    }
  } catch { /* Fall back to a plain write below. */ }
  try { await navigator.clipboard.writeText(await text); return true; } catch { return false; }
}

/** The address as people read it: without https://. */
export const shareDisplay = (url: string) => url.replace(/^https:\/\//, "");
