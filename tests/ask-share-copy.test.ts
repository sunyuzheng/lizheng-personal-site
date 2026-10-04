import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac, webcrypto } from "node:crypto";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";

// A shared answer's copy in the files store, for when the database cannot answer
// (shared/ask-public-files.ts): the store is an in-memory stand-in for @vercel/blob. Synthetic only.
const blobs = vi.hoisted(() => new Map<string, string>());
vi.mock("@vercel/blob", () => ({
  put: vi.fn(async (path: string, body: string) => { blobs.set(path, String(body)); return { pathname: path }; }),
  get: vi.fn(async (path: string) => blobs.has(path)
    ? { statusCode: 200, stream: new Response(blobs.get(path)).body, blob: { size: blobs.get(path)!.length } }
    : null),
}));
import handler from "../api/ask-lizheng-share";
import { SHARE_PAGE_SCRIPT, SHARE_SCRIPT } from "../shared/ask-share-link";

const SECRET = "a".repeat(64);
const RECORD = "00000000-0000-4000-8000-000000000001";
const COPY = "share/2026-10-04/career-choice.json";
const answer = {
  status: "answered", summary: "合成的摘要。", followups: [], clarifying_questions: [], limitations: "",
  sections: [{ heading: "合成的小标题", body: "合成的回答段落，用来测试分享页的副本。".repeat(12), kind: "synthesis", source_ids: [] }], sources: [],
};
const live = ["OK", "合成的问题：怎么选方向？", JSON.stringify(answer), "understand", "2026-10-04T02:00:00.000Z"];
const proof = createHmac("sha256", SECRET).update(`ask-share:v1:${RECORD}:career-choice`).digest("hex");

async function call(path: string, options: { method?: string; payload?: unknown } = {}) {
  const result = { statusCode: 200, headers: new Map<string, unknown>(), body: "",
    setHeader(name: string, value: unknown) { this.headers.set(name.toLowerCase(), value); },
    end(value = "") { this.body = String(value); } };
  const raw = options.payload === undefined ? "" : JSON.stringify(options.payload);
  const req = Object.assign(Readable.from(raw ? [Buffer.from(raw)] : []), {
    url: path, method: options.method || "GET",
    headers: { host: "ask.lizheng.ai", origin: options.payload ? "https://ask.lizheng.ai" : undefined, "user-agent": "Mozilla/5.0 Chrome/141",
      "content-length": String(Buffer.byteLength(raw)) },
  });
  await handler(req as unknown as IncomingMessage, result as unknown as ServerResponse);
  return result;
}
function upstash(reply: (command: (string | number)[]) => unknown) {
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => Response.json({ result: reply(JSON.parse(String(init.body))) })));
}

beforeEach(() => {
  blobs.clear();
  vi.stubGlobal("crypto", webcrypto);
  vi.stubEnv("ASK_QUOTA_STORE_SECRET", SECRET);
  vi.stubEnv("ASK_AUTH_REDIS_REST_URL", "https://synthetic.upstash.io");
  vi.stubEnv("ASK_AUTH_REDIS_REST_TOKEN", "synthetic-not-live");
  vi.stubEnv("ASK_FILES_BLOB_TOKEN", "vercel_blob_rw_synthetic_notlive");
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("a shared answer's copy", () => {
  it("is kept when the answer is shared", async () => {
    upstash(command => (command[1] === SHARE_SCRIPT ? ["NEW", "career-choice", "2026-10-04"] : command[1] === SHARE_PAGE_SCRIPT ? live : 1));
    const reply = await call("/api/ask-lizheng-share?__route=share", { method: "POST",
      payload: { record_id: RECORD, word: "career-choice", proof, surface: "ask", bonus: false } });
    expect(JSON.parse(reply.body)).toEqual({ url: "https://ask.lizheng.ai/s/2026-10-04/career-choice", bonus: "off" });
    expect(JSON.parse(blobs.get(COPY)!)).toMatchObject({ v: 1, day: "2026-10-04", slug: "career-choice", question: "合成的问题：怎么选方向？" });
  });

  it("stands in only while the database cannot answer", async () => {
    upstash(command => (command[1] === SHARE_SCRIPT ? ["NEW", "career-choice", "2026-10-04"] : command[1] === SHARE_PAGE_SCRIPT ? live : 1));
    await call("/api/ask-lizheng-share?__route=share", { method: "POST", payload: { record_id: RECORD, word: "career-choice", proof, surface: "ask", bonus: false } });
    upstash(() => { throw new Error("down"); });
    const page = await call("/api/ask-lizheng-share?__route=page&day=2026-10-04&slug=career-choice");
    expect(page.statusCode).toBe(200);
    expect(page.body).toContain("合成的问题：怎么选方向？");
    // The database says it is gone (deleted, or never shared): the copy never brings it back.
    upstash(() => ["MISSING"]);
    expect((await call("/api/ask-lizheng-share?__route=page&day=2026-10-04&slug=career-choice")).statusCode).toBe(404);
    // No copy and no database: unavailable, as before.
    blobs.clear();
    upstash(() => { throw new Error("down"); });
    expect((await call("/api/ask-lizheng-share?__route=page&day=2026-10-04&slug=career-choice")).statusCode).toBe(503);
  });
});
