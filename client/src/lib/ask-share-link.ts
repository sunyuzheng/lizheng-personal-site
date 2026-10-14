/**
 * 分享这条回答 on the homepage's Ask section. An answered question has its own public page at
 * ask.lizheng.ai/s/<date>/<word> (shared/ask-share-link.ts), made when the answer is archived and sent
 * with it (`share.url`, since 2026-10-14); the page stays. Each answered result also carries the
 * record, its address word and Builder's proof, which only this page holds: with them it makes the page
 * of an answer about the asker's own situation when asked to, and reports the share, which may give
 * back one of today's questions (never inside WeChat, which forbids rewarding shares).
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

const PAGE = /^https:\/\/ask\.lizheng\.ai\/s\/\d{4}-\d{2}-\d{2}\/[a-z0-9]{1,40}(?:-[a-z0-9]{1,40}){0,4}$/;
/** Whether an address is an answer's own page. */
export const isAnswerPage = (url: unknown): url is string => typeof url === "string" && PAGE.test(url);
/** The answer's page as Builder sent it with the answer, or "" (from Builder before 2026-10-14, or one not made). */
export const answerPage = (share: AskShare) => (isAnswerPage(share.url) ? share.url : "");

/** Makes (or finds) the answer's page; `bonus` asks for today's question back. `auto` is the page made
 * as the answer arrives, before anyone shares it: not counted as a share (shared/ask-share-link.ts). */
export async function createShareLink(share: AskShare, options: { bonus: boolean; auto?: boolean }): Promise<ShareResult> {
  const value = await post("/api/ask-lizheng/share", { record_id: share.record_id, word: share.word, proof: share.proof, surface: "home",
    bonus: options.bonus, auto: options.auto === true });
  if (!isAnswerPage(value.url)) throw new Error("share_failed");
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
// A public question's page ends in its long id: it shows by the id's first part (the link stays whole).
export const shareDisplay = (url: string) => url.replace(/^https:\/\//, "").replace(/(\/(?:ask|q)\/[0-9a-f]{8})-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "$1…");
