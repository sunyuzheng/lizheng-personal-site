import { createHash, createHmac, webcrypto } from "node:crypto";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ owner: vi.fn(), voter: vi.fn(), realVoter: undefined as unknown as (r: Request) => Promise<string> }));
vi.mock("../shared/ask-access.js", async importOriginal => {
  const actual = await importOriginal<typeof import("../shared/ask-access.js")>();
  auth.realVoter = actual.resolveDiscoveryVoter;
  return { ...actual, requireOpsOwner: auth.owner, resolveDiscoveryVoter: auth.voter };
});
import { AccessError, authDigest, createSession, decryptRecord, encryptRecord } from "../shared/ask-access.js";
import ops from "../api/ask-lizheng-ops.js";
import discovery from "../api/ask-lizheng-discovery.js";
import { OPS_BACKEND_ORIGIN, OPS_GATEWAY_BODY_LIMIT } from "../shared/ask-ops-gateway.js";
import { discoveryRequestBody } from "../shared/ask-discovery-gateway.js";

const NOW = Date.parse("2026-10-02T03:00:00.000Z"), SECRET = "a".repeat(64);
const ID = "01234567-89ab-4cde-8f01-23456789abcd", VOTER = "b".repeat(43);
const answer = () => ({ status: "answered", summary: "Synthetic summary", sections: [{ heading: "Synthetic", body: "Synthetic [S1]", source_ids: ["S1"], kind: "synthesis" }],
  sources: [{ id: "S1", title: "Synthetic source", url: "https://example.test/source" }], followups: [], clarifying_questions: [], limitations: "" });
const draft = () => ({ record_id: ID, topic_label: "Synthetic topic", question: "Synthetic public question", answer: answer(),
  consent_reference: "", consent_confirmed: false, review_confirmed: false });
type Options = { method?: string; body?: unknown; headers?: Record<string, unknown>; chunks?: (Buffer | string)[]; req?: Readable };
async function call(fn: typeof ops, path: string, options: Options = {}) {
  const req = options.req || Readable.from(options.chunks || []);
  const method = options.method || "GET";
  Object.assign(req, { url: path, method, headers: { host: "www.lizheng.ai", cookie: "synthetic-owner-cookie",
    ...(method === "POST" ? { origin: "https://www.lizheng.ai" } : {}), ...options.headers } });
  if ("body" in options) Object.assign(req, { body: options.body });
  const headers: Record<string, string> = {};
  let raw = "";
  const res = { statusCode: 200, setHeader(name: string, value: string) { headers[name.toLowerCase()] = value; },
    removeHeader(name: string) { delete headers[name.toLowerCase()]; }, end(text: string) { raw = text; } };
  await fn(req as IncomingMessage, res as unknown as ServerResponse);
  return { status: res.statusCode, headers, body: JSON.parse(raw) };
}
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(NOW); vi.stubGlobal("crypto", webcrypto);
  vi.stubEnv("ASK_OPS_GATEWAY_SECRET", SECRET); vi.stubEnv("ASK_OPS_BACKEND_ORIGIN", OPS_BACKEND_ORIGIN);
  auth.owner.mockResolvedValue({ email: "synthetic-owner@example.test" }); auth.voter.mockResolvedValue(VOTER);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ok: true })));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); auth.owner.mockReset(); auth.voter.mockReset(); });

describe("owner review gateway", () => {
  it("forwards a private draft only, without inventing a topic key or publishing it", async () => {
    const body = draft();
    expect((await call(ops, "/api/ask-lizheng/ops/discovery-save", { method: "POST", body })).status).toBe(200);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(`${OPS_BACKEND_ORIGIN}/api/ops`);
    const raw = JSON.stringify({ v: 1, method: "POST", action: "discovery-save", params: body });
    expect(init?.body).toBe(raw);
    const expiry = String(Math.floor(NOW / 1000) + 20);
    const sig = createHmac("sha256", SECRET).update(`ask-ops-gateway:v1:${expiry}:${createHash("sha256").update(raw).digest("hex")}`).digest("hex");
    expect(init?.headers).toEqual({ "Content-Type": "application/octet-stream", "x-ask-ops-proof": `v1.${expiry}.${sig}` });
    expect(JSON.parse(raw).params).not.toHaveProperty("topic_key");
    expect(String(init?.body)).not.toMatch(/cookie|synthetic-owner@|email|identity/);
    expect(fetch).toHaveBeenCalledOnce();
  });
  it.each(["discovery-publish", "discovery-withdraw"])("sends an explicit revision-bound %s mutation", async action => {
    const params = { public_id: ID, expected_revision: 2 };
    expect((await call(ops, `/api/ask-lizheng/ops/${action}`, { method: "POST", body: Buffer.from(JSON.stringify(params)) })).status).toBe(200);
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body))).toEqual({ v: 1, method: "POST", action, params });
  });
  it("allows a reviewed update only with matching public ID/revision fields", async () => {
    const params = { ...draft(), public_id: ID, expected_revision: 2, topic_key: "a".repeat(32), consent_reference: "Synthetic consent", consent_confirmed: true, review_confirmed: true };
    expect((await call(ops, "/api/ask-lizheng-ops?__route=discovery-save", { method: "POST", body: JSON.stringify(params) })).status).toBe(200);
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)).params).toEqual(params);
  });
  it("lists private drafts with only an optional bounded opaque cursor", async () => {
    expect((await call(ops, "/api/ask-lizheng/ops/discovery-list?cursor=abc-_" )).status).toBe(200);
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body))).toEqual({ v: 1, method: "GET", action: "discovery-list", params: { cursor: "abc-_" } });
  });
  it.each(["discovery-save", "discovery-publish", "discovery-withdraw"])("requires owner and sameOrigin before reading %s input", async action => {
    auth.owner.mockRejectedValueOnce(new AccessError("ops_login_required", 401));
    expect((await call(ops, `/api/ask-lizheng/ops/${action}`, { method: "POST", headers: { "content-length": "999999" } })).status).toBe(401);
    expect((await call(ops, `/api/ask-lizheng/ops/${action}`, { method: "POST", headers: { origin: undefined, "content-length": "999999" } })).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([
    { public_id: ID }, { expected_revision: 2 }, { public_id: ID, expected_revision: 0 }, { public_id: ID, expected_revision: 1.2 },
    { topic_key: "bad" }, { question: "x".repeat(301) }, { topic_label: "x".repeat(81) }, { consent_reference: "x".repeat(501) },
    { consent_confirmed: "true" }, { review_confirmed: null }, { email: "synthetic-private@example.test" },
    { answer: { ...answer(), raw_reasoning: "synthetic-private" } }, { answer: { ...answer(), sections: [{ ...answer().sections[0], source_ids: ["S2"] }] } },
  ])("rejects malformed save fields without any upstream call", async patch => {
    expect((await call(ops, "/api/ask-lizheng/ops/discovery-save", { method: "POST", body: { ...draft(), ...patch } })).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(["?cursor=" + "x".repeat(513), "?cursor=1:uuid", "?limit=20", "?dataset=legacy", "?cursor=a&cursor=b"])(
    "rejects unexpected private-list params %s", async query => {
      expect((await call(ops, `/api/ask-lizheng/ops/discovery-list${query}`)).status).toBe(400); expect(fetch).not.toHaveBeenCalled();
    }
  );
  it("enforces mutation methods before attempting to read a body", async () => {
    expect((await call(ops, "/api/ask-lizheng/ops/discovery-save")).status).toBe(405);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("public read and account vote gateway", () => {
  it("reads only published public data with defaults and no identity/cookie headers", async () => {
    const result = await call(discovery, "/api/ask-lizheng/discovery/questions", { headers: { authorization: "synthetic-authorization" } });
    expect(result.status).toBe(200); expect(auth.owner).not.toHaveBeenCalled(); expect(auth.voter).not.toHaveBeenCalled();
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(`${OPS_BACKEND_ORIGIN}/api/discovery?action=list&window=this_week&sort=recent&limit=10`);
    expect(init).toMatchObject({ method: "GET", cache: "no-store", redirect: "manual", credentials: "omit" });
    expect(init).not.toHaveProperty("headers"); expect(init).not.toHaveProperty("body");
    expect(result.headers).toMatchObject({ "cache-control": "no-store, no-transform", "x-robots-tag": "noindex, nofollow, noarchive" });
  });
  it("forwards bounded read filters and detail only to their fixed paths", async () => {
    await call(discovery, "/api/ask-lizheng-discovery?__route=questions&window=7d&sort=liked&limit=20&cursor=abc-_" );
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(`${OPS_BACKEND_ORIGIN}/api/discovery?action=list&window=7d&sort=liked&limit=20&cursor=abc-_`);
    await call(discovery, `/api/ask-lizheng/discovery/detail?public_id=${ID}`);
    expect(vi.mocked(fetch).mock.calls[1][0]).toBe(`${OPS_BACKEND_ORIGIN}/api/discovery?action=detail&public_id=${ID}`);
  });
  it.each(["?window=today", "?sort=private", "?limit=0", "?limit=21", "?limit=01", "?limit=1.5", "?limit=1&limit=2",
    "?window=all&url=https%3A%2F%2Fevil.example", "?maxid=1", "?public_id=" + ID, "?cursor=bad:uuid", "?cursor=" + "x".repeat(513)])(
    "rejects extra or invalid read filters %s", async query => {
      expect((await call(discovery, `/api/ask-lizheng/discovery/questions${query}`)).status).toBe(400); expect(fetch).not.toHaveBeenCalled();
    }
  );
  it("reads 最近问 and 最常问 in one fixed call, and lets the CDN share them and each answer for a minute", async () => {
    vi.mocked(fetch).mockImplementation(async () => Response.json({ ok: true }));
    const lists = await call(discovery, "/api/ask-lizheng/discovery/lists", { headers: { cookie: "synthetic-cookie" } });
    expect(lists.status).toBe(200);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(`${OPS_BACKEND_ORIGIN}/api/discovery?action=lists`);
    expect(init).not.toHaveProperty("headers");
    expect(lists.headers["cache-control"]).toBe("public, max-age=0, s-maxage=60, stale-while-revalidate=60");
    expect(lists.headers).not.toHaveProperty("vary");
    const detail = await call(discovery, `/api/ask-lizheng/discovery/detail?public_id=${ID}`);
    expect(detail.headers["cache-control"]).toBe("public, max-age=0, s-maxage=60, stale-while-revalidate=60");
    // The older paged list carries a cursor per reader: never shared.
    expect((await call(discovery, "/api/ask-lizheng/discovery/questions")).headers["cache-control"]).toBe("no-store, no-transform");
    // A failure is never kept.
    vi.mocked(fetch).mockResolvedValue(new Response("{}", { status: 503 }));
    const failed = await call(discovery, "/api/ask-lizheng/discovery/lists");
    expect(failed.status).toBe(503);
    expect(failed.headers["cache-control"]).toBe("no-store, no-transform");
  });
  it.each(["?window=all", "?sort=recent", "?cursor=abc", `?public_id=${ID}`, "?__route=lists&__route=lists"])("takes no options for the lists %s", async query => {
    expect((await call(discovery, `/api/ask-lizheng/discovery/lists${query}`)).status).toBe(400); expect(fetch).not.toHaveBeenCalled();
  });
  it.each(["", "?public_id=bad", `?public_id=${ID}&range=all`, `?public_id=${ID}&public_id=${ID}`])("validates detail ID %s", async query => {
    expect((await call(discovery, `/api/ask-lizheng/discovery/detail${query}`)).status).toBe(400); expect(fetch).not.toHaveBeenCalled();
  });
  it("binds vote and revision to a separate proof with only a server-derived opaque voter", async () => {
    const value = { public_id: ID, expected_revision: 2, vote: false };
    expect((await call(discovery, "/api/ask-lizheng/discovery/vote", { method: "POST", body: value })).status).toBe(200);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    const raw = JSON.stringify({ ...value, voter_key: VOTER }), expiry = String(Math.floor(NOW / 1000) + 20);
    const sig = createHmac("sha256", SECRET).update(`ask-discovery-vote:v1:${expiry}:${createHash("sha256").update(raw).digest("hex")}`).digest("hex");
    expect(url).toBe(`${OPS_BACKEND_ORIGIN}/api/discovery-vote`);
    expect(init?.body).toBe(raw); expect(init?.headers).toEqual({ "Content-Type": "application/octet-stream", "x-ask-discovery-vote-proof": `v1.${expiry}.${sig}` });
    expect(raw).not.toMatch(/email|cookie|identity|subject/);
  });
  it("rejects an anonymous vote before reading its input", async () => {
    auth.voter.mockRejectedValue(new AccessError("discovery_login_required", 401));
    expect((await call(discovery, "/api/ask-lizheng/discovery/vote", { method: "POST", headers: { "content-length": "999999" } })).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects missing/foreign Origin before identity lookup or body input", async () => {
    for (const origin of [undefined, "https://ask.lizheng.ai", "https://evil.example"])
      expect((await call(discovery, "/api/ask-lizheng/discovery/vote", { method: "POST", headers: { origin } })).status).toBe(403);
    expect(auth.voter).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
  it.each([{ voter_key: "c".repeat(43) }, { email: "synthetic@example.test" }, { vote: "true" }, { expected_revision: 0 }, { expected_revision: "2" }, { public_id: "bad" }])(
    "rejects browser identity or invalid vote values", async patch => {
      expect((await call(discovery, "/api/ask-lizheng/discovery/vote", { method: "POST", body: { public_id: ID, expected_revision: 2, vote: true, ...patch } })).status).toBe(400);
      expect(fetch).not.toHaveBeenCalled();
    }
  );
  it.each([["questions", "POST", "GET"], ["detail", "OPTIONS", "GET"], ["vote", "GET", "POST"]])("enforces %s method", async (action, method, allow) => {
    expect(await call(discovery, `/api/ask-lizheng/discovery/${action}`, { method })).toMatchObject({ status: 405, headers: { allow } }); expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects foreign hosts, cross-host origins and absolute foreign URLs before any call", async () => {
    expect((await call(discovery, "/api/ask-lizheng/discovery/questions", { headers: { host: "evil.example" } })).status).toBe(403);
    expect((await call(discovery, "https://evil.example/api/ask-lizheng/discovery/questions")).status).toBe(403);
    expect((await call(discovery, "/api/ask-lizheng/discovery/questions",
      { headers: { host: "ask.lizheng.ai", origin: "https://www.lizheng.ai" } })).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("serves ask.lizheng.ai from its own origin, reads and signed-in votes alike", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ ok: true })));
    expect((await call(discovery, "/api/ask-lizheng/discovery/questions", { headers: { host: "ask.lizheng.ai" } })).status).toBe(200);
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(`${OPS_BACKEND_ORIGIN}/api/discovery?action=list&window=this_week&sort=recent&limit=10`);
    const vote = await call(discovery, "/api/ask-lizheng/discovery/vote", { method: "POST",
      headers: { host: "ask.lizheng.ai", origin: "https://ask.lizheng.ai" }, body: { public_id: ID, expected_revision: 2, vote: true } });
    expect(vote.status).toBe(200);
    expect(auth.voter).toHaveBeenCalledOnce();
  });
});

describe("bounded body and safe business failures", () => {
  it("bounds private and vote bodies by raw UTF-8 bytes before forwarding", async () => {
    expect((await call(ops, "/api/ask-lizheng/ops/discovery-save", { method: "POST", chunks: [Buffer.alloc(OPS_GATEWAY_BODY_LIMIT), Buffer.alloc(1)] })).status).toBe(413);
    expect((await call(discovery, "/api/ask-lizheng/discovery/vote", { method: "POST", body: "x".repeat(2049) })).status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("decodes split Unicode body bytes and preserves exact reviewed content", async () => {
    const value = { ...draft(), topic_label: "synthetic 合成😀" }, bytes = Buffer.from(JSON.stringify(value));
    expect((await call(ops, "/api/ask-lizheng/ops/discovery-save", { method: "POST", chunks: [...bytes].map(b => Buffer.from([b])) })).status).toBe(200);
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)).params.topic_label).toBe(value.topic_label);
  });
  it("times out unfinished input at3s without making an upstream call", async () => {
    const req = new Readable({ read() {} });
    const result = call(discovery, "/api/ask-lizheng/discovery/vote", { method: "POST", req });
    await vi.advanceTimersByTimeAsync(3000);
    expect((await result).status).toBe(400); expect(req.destroyed).toBe(true); expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects invalid UTF-8 JSON and oversized declared inputs", async () => {
    expect((await call(discovery, "/api/ask-lizheng/discovery/vote", { method: "POST", body: Buffer.from([255]) })).status).toBe(400);
    expect((await call(discovery, "/api/ask-lizheng/discovery/vote", { method: "POST", body: {}, headers: { "content-length": "2049" } })).status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([[400, "invalid_request"], [404, "discovery_not_found"], [409, "revision_conflict"], [422, "source_unavailable"], [422, "source_not_public_eligible"],
    [422, "publication_requires_consent"], [422, "publication_requires_review"], [422, "publication_requires_source"], [404, "public_item_unavailable"],
    [422, "discovery_capacity"], [409, "discovery_cursor_expired"], [429, "vote_rate_limited"]])(
    "returns only allowlisted error %s/%s", async (status, code) => {
      vi.mocked(fetch).mockResolvedValue(Response.json({ code, private_detail: "synthetic-private-error", email: "synthetic-private@example.test" }, { status }));
      const result = await call(ops, "/api/ask-lizheng/ops/discovery-publish", { method: "POST", body: { public_id: ID, expected_revision: 2 } });
      expect(result).toMatchObject({ status, body: { code } }); expect(Object.keys(result.body)).toEqual(["code"]);
    }
  );
  it.each(["discovery-save", "discovery-publish"])("preserves source eligibility refusal for %s without exposing private details", async action => {
    vi.mocked(fetch).mockResolvedValue(Response.json({ code: "source_not_public_eligible", notice_version: "v3", private_detail: "synthetic-private" }, { status: 422 }));
    const body = action === "discovery-save" ? draft() : { public_id: ID, expected_revision: 2 };
    const result = await call(ops, `/api/ask-lizheng/ops/${action}`, { method: "POST", body });
    expect(result).toMatchObject({ status: 422, body: { code: "source_not_public_eligible" } });
    expect(Object.keys(result.body)).toEqual(["code"]);
    expect(fetch).toHaveBeenCalledOnce();
  });
  it.each([[409, "unknown_private_error"], [500, "revision_conflict"], [400, "revision_conflict"], [429, "unknown_private_error"],
    [400, "source_not_public_eligible"], [500, "source_not_public_eligible"]])("sanitizes unapproved status/code pairs", async (status, code) => {
    vi.mocked(fetch).mockResolvedValue(Response.json({ code, detail: "synthetic-private" }, { status }));
    expect(await call(discovery, "/api/ask-lizheng/discovery/questions")).toMatchObject({ status: 503, body: { code: "ops_gateway_unavailable" } });
  });
  it.each([409, 429])("bounds marked business errors to4KB and1s instead of hanging on their bodies (%s)", async status => {
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const body = new ReadableStream<Uint8Array>({ cancel });
    vi.mocked(fetch).mockResolvedValue(new Response(body, { status, headers: { "content-type": "application/json" } }));
    const result = call(discovery, "/api/ask-lizheng/discovery/questions");
    await vi.advanceTimersByTimeAsync(1000);
    expect((await result).body).toEqual({ code: "ops_gateway_unavailable" }); expect(cancel).toHaveBeenCalledOnce(); expect(body.locked).toBe(false);
    vi.mocked(fetch).mockResolvedValue(Response.json({ code: "revision_conflict", padding: "x".repeat(4096) }, { status: 409 }));
    expect((await call(discovery, "/api/ask-lizheng/discovery/questions")).status).toBe(503);
  });
});

describe("verified-email voter continuity", () => {
  const store = new Map<string, string>();
  beforeEach(() => {
    vi.stubEnv("ASK_AUTH_SECRET", "test-auth-key-at-least32bytes-long");
    vi.stubEnv("ASK_AUTH_REDIS_REST_URL", "https://synthetic-test.upstash.io"); vi.stubEnv("ASK_AUTH_REDIS_REST_TOKEN", "synthetic-token");
    vi.stubEnv("ASK_CIRCLE_ADMIN_V2_TOKEN", ""); store.clear();
    vi.stubGlobal("fetch", vi.fn(async (_url, init) => {
      expect(String(_url)).toBe("https://synthetic-test.upstash.io/");
      const args = JSON.parse(String(init.body));
      if (args[0] === "SET") { store.set(args[1], args[2]); return Response.json({ result: "OK" }); }
      if (args[0] === "GET") return Response.json({ result: store.get(args[1]) ?? null });
      throw new Error("unexpected synthetic command");
    }));
  });
  it("deduplicates verified email/Logto sessions across subjects and browsers without membership refresh", async () => {
    const first = await createSession(`user:${"a".repeat(43)}`, " Synthetic@Example.test ", false);
    const second = await createSession(`user:${"b".repeat(43)}`, "synthetic@example.test", true);
    for (const [key, encrypted] of store) { const record = await decryptRecord(encrypted) as Record<string, unknown>; record.checkedAt = 0; store.set(key, await encryptRecord(record)); }
    const key1 = await auth.realVoter(new Request("https://www.lizheng.ai/api/ask-lizheng/discovery/vote", { headers: { cookie: first.split(";")[0] } }));
    const key2 = await auth.realVoter(new Request("https://www.lizheng.ai/api/ask-lizheng/discovery/vote", { headers: { cookie: second.split(";")[0] } }));
    expect(key1).toBe(key2); expect(key1).toBe(await authDigest("discovery-vote:v1:synthetic@example.test")); expect(key1).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(key1).not.toContain("synthetic");
    expect(vi.mocked(fetch).mock.calls).toHaveLength(4); //2 SET,2 GET; no Circle
  });
  it("rejects missing, forged and expired sessions without guest fallback", async () => {
    for (const cookie of [undefined, "__Host-ask-session=forged", `__Host-ask-session=${"f".repeat(64)}`])
      await expect(auth.realVoter(new Request("https://www.lizheng.ai/api/ask-lizheng/discovery/vote", { headers: cookie ? { cookie, "x-email": "synthetic@example.test" } : undefined }))).rejects.toMatchObject({ status: 401 });
    const cookie = await createSession(`user:${"a".repeat(43)}`, "synthetic@example.test", false);
    for (const [key, encrypted] of store) { const record = await decryptRecord(encrypted) as Record<string, unknown>; record.expiresAt = 1; store.set(key, await encryptRecord(record)); }
    await expect(auth.realVoter(new Request("https://www.lizheng.ai/api/ask-lizheng/discovery/vote", { headers: { cookie: cookie.split(";")[0] } }))).rejects.toMatchObject({ status: 401 });
  });
});
