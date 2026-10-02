import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash, createHmac, webcrypto } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  admission,
  createSession,
  decryptRecord,
  encryptRecord,
  requireOpsOwner,
  resolveIdentity,
  resolveOpsVisitor,
} from "../shared/ask-access";
import {
  opsEvent,
  OPS_PREFIX,
  rangeBounds,
  storeOpsEvent,
  verifyOpsProof,
} from "../shared/ask-ops-storage";
import opsHandler from "../api/ask-lizheng-ops";
import { archivedAnswer } from "../shared/ask-archive-answer";
import relay from "../api/ask-lizheng";
const SECRET = "a".repeat(64),
  ID = "01234567-89ab-4cde-8f01-23456789abcd";
const store = new Map<string, string>();
const start = () => ({
  v: 3,
  event: "start",
  record_id: ID,
  question: "synthetic ops question😀",
  created_at: new Date().toISOString(),
  model: "deepseek-v4-flash",
  visitor_id: "a".repeat(64),
  conversation_id: "b".repeat(64),
  intent: "find",
  entrypoint: "home",
});
const answer = () => ({
  status: "answered",
  summary: "synthetic complete answer",
  sections: [
    {
      heading: "synthetic heading",
      body: "synthetic validated paragraph",
      kind: "synthesis",
      source_ids: ["S1"],
    },
  ],
  sources: [
    {
      id: "S1",
      title: "synthetic source",
      url: "https://www.lizheng.ai/",
      excerpt: "synthetic source snapshot",
    },
  ],
  followups: [],
  clarifying_questions: [],
  limitations: "synthetic limitation",
});
function proof(body: Buffer, seconds = 45, prefix = "ask-ops-store") {
  const exp = Math.floor(Date.now() / 1000) + seconds;
  return `v3.${exp}.${createHmac("sha256", SECRET)
    .update(
      `${prefix}:v3:${exp}:${createHash("sha256").update(body).digest("hex")}`
    )
    .digest("hex")}`;
}
function withRedis(upstream: ReturnType<typeof vi.fn>) {
  return vi.fn(async (url: unknown, init?: RequestInit) => {
    if (!String(url).includes("upstash.io")) return upstream(url, init);
    const args = JSON.parse(String(init?.body));
    return Response.json({
      result: args[0] === "EVAL" ? 1 : args[0] === "DECR" ? 0 : null,
    });
  });
}
const request = (cookie?: string) =>
  new Request("https://www.lizheng.ai/api/ask-lizheng/ops/session", {
    headers: cookie ? { cookie } : {},
  });
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  store.clear();
  for (const name of [
    "ASK_QUOTA_ENABLED",
    "ASK_QUERY_LOG_ENABLED",
    "ASK_OPS_ENABLED",
  ])
    vi.stubEnv(name, "true");
  vi.stubEnv("ASK_OPS_ADMIN_EMAILS", "owner@example.com");
  vi.stubEnv("ASK_AUTH_SECRET", "synthetic-secret-of-at-least-32-bytes");
  vi.stubEnv(
    "ASK_ADMISSION_SECRET",
    "synthetic-admission-of-at-least-32-bytes"
  );
  vi.stubEnv("ASK_QUOTA_STORE_SECRET", SECRET);
  vi.stubEnv("ASK_AUTH_REDIS_REST_URL", "https://synthetic.upstash.io");
  vi.stubEnv("ASK_AUTH_REDIS_REST_TOKEN", "synthetic-token");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: unknown, init?: RequestInit) => {
      const cmd = JSON.parse(String(init?.body));
      let result: unknown = null;
      if (cmd[0] === "GET") result = store.get(cmd[1]) ?? null;
      if (cmd[0] === "SET") {
        store.set(cmd[1], cmd[2]);
        result = "OK";
      }
      if (cmd[0] === "EVAL") result = 1;
      return Response.json({ result });
    })
  );
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
async function call(
  path: string,
  cookie?: string,
  method = "GET",
  origin?: string
) {
  const res = {
    statusCode: 0,
    headers: new Map<string, string>(),
    body: "",
    setHeader(k: string, v: string) {
      this.headers.set(k, v);
    },
    end(v: string) {
      this.body = v;
    },
  };
  await opsHandler(
    {
      url: path,
      method,
      headers: { host: "www.lizheng.ai", cookie, origin },
    } as unknown as IncomingMessage,
    res as unknown as ServerResponse
  );
  return { ...res, value: JSON.parse(res.body) };
}
describe("ops authorization", () => {
  it.each(["summary", "records", "legacy", "export", "delete"])(
    "requires verified owner before %s reads",
    async action => {
      const r = await call(`/api/ask-lizheng/ops/${action}?record_id=${ID}`);
      expect(r.statusCode).toBe(401);
      expect(fetch).not.toHaveBeenCalled();
      expect(r.headers.get("Cache-Control")).toContain("no-store");
      expect(r.headers.get("X-Robots-Tag")).toContain("noindex");
    }
  );
  it("does not admit Founding membership or browser claims", async () => {
    const cookie = (
      await createSession(`user:${"b".repeat(43)}`, "member@example.com", true)
    ).split(";")[0];
    vi.mocked(fetch).mockClear();
    expect(
      (await call("/api/ask-lizheng/ops/records", cookie)).statusCode
    ).toBe(403);
    expect(vi.mocked(fetch).mock.calls).toHaveLength(1); // session only, no question read
    await expect(
      requireOpsOwner(
        new Request(request().url, {
          headers: { "X-Email": "owner@example.com", "X-Founding": "true" },
        })
      )
    ).rejects.toMatchObject({ status: 401 });
  });
  it("uses the verified owner session without a Circle dependency and respects expiration/logout", async () => {
    const cookie = (
      await createSession(`user:${"c".repeat(43)}`, "owner@example.com", false)
    ).split(";")[0];
    const [key, value] = [...store][0],
      record = (await decryptRecord(value)) as Record<string, unknown>;
    record.checkedAt = 1;
    store.set(key, await encryptRecord(record));
    expect(await requireOpsOwner(request(cookie))).toEqual({
      email: "owner@example.com",
    });
    expect(
      (await call("/api/ask-lizheng-ops?__route=session", cookie)).value.owner
    ).toBe(true);
    record.expiresAt = 1;
    store.set(key, await encryptRecord(record));
    await expect(requireOpsOwner(request(cookie))).rejects.toMatchObject({
      status: 401,
    });
    store.clear();
    await expect(requireOpsOwner(request(cookie))).rejects.toMatchObject({
      status: 401,
    });
  });
  it("fails closed without allowlist and rejects cross-origin deletes before mutation", async () => {
    vi.stubEnv("ASK_OPS_ADMIN_EMAILS", "");
    await expect(requireOpsOwner(request())).rejects.toMatchObject({
      code: "ops_unavailable",
    });
    expect(fetch).not.toHaveBeenCalled();
    vi.stubEnv("ASK_OPS_ADMIN_EMAILS", "owner@example.com");
    const cookie = (
      await createSession(`user:${"c".repeat(43)}`, "owner@example.com", false)
    ).split(";")[0];
    vi.mocked(fetch).mockClear();
    expect(
      (
        await call(
          `/api/ask-lizheng/ops/delete?record_id=${ID}`,
          cookie,
          "POST",
          "https://attacker.example"
        )
      ).statusCode
    ).toBe(403);
    expect(vi.mocked(fetch).mock.calls).toHaveLength(0);
  });
});
describe("public durable-storage failure", () => {
  it.each([true, false])(
    "only passes the fixed marked failure (marked=%s)",
    async marked => {
      // This test isolates response sanitization; authenticated quota/refund is covered by relay tests.
      const upstream = vi.fn().mockResolvedValue(
        Response.json(
          {
            code: "ops_storage_unavailable",
            private_detail: "synthetic-private-value",
          },
          {
            status: 503,
            headers: marked
              ? { "X-Ask-Error-Code": "ops_storage_unavailable" }
              : {},
          }
        )
      );
      vi.stubGlobal("fetch", withRedis(upstream));
      /* upstream fixture below is replaced by the network-aware wrapper. */
      const response = await relay(
        new Request("https://www.lizheng.ai/api/ask-lizheng/ask", {
          method: "POST",
          body: JSON.stringify({
            question: "synthetic",
            context: "",
            intent: "find",
            history: [],
            query_log_notice: "v3",
            conversation_id: ID,
          }),
          headers: { origin: "https://www.lizheng.ai" },
        })
      );
      const value = await response.json();
      expect(value.code).toBe(
        marked ? "ops_storage_unavailable" : "upstream_unavailable"
      );
      expect(JSON.stringify(value)).not.toContain("synthetic-private-value");
      if (marked) expect(value.message).toContain("没有开始生成");
    }
  );
});
describe("trusted v3 intake boundary", () => {
  it("archives the complete displayed answer and source snapshot with the same final status", async () => {
    const finish = {
      v: 3,
      event: "finish",
      record_id: ID,
      status: "answered",
      duration_ms: 1200,
      answer: answer(),
      error_code: null,
    };
    const body = Buffer.from(JSON.stringify(finish));
    expect(opsEvent(body)).toEqual(finish);
    expect(await storeOpsEvent(body, proof(body))).toEqual({ ok: true });
    const command = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(JSON.parse(command.at(-2))).toEqual(finish.answer);
    expect(command[1]).not.toMatch(/EXPIRE/);
    expect(() =>
      opsEvent(Buffer.from(JSON.stringify({ ...finish, answer: null })))
    ).toThrow();
    expect(() =>
      opsEvent(Buffer.from(JSON.stringify({ ...finish, status: "error" })))
    ).toThrow();
    expect(
      opsEvent(
        Buffer.from(
          JSON.stringify({
            ...finish,
            status: "cancelled",
            answer: null,
            error_code: "client_cancelled",
          })
        )
      )
    ).toMatchObject({ answer: null, error_code: "client_cancelled" });
  });
  it("rejects arbitrary model metadata, private input, unsafe links and unsupported citations", () => {
    for (const mutation of [
      { quota: {} },
      { context: "synthetic private background" },
      { reasoning: "synthetic hidden reasoning" },
    ])
      expect(() => archivedAnswer({ ...answer(), ...mutation })).toThrow();
    expect(() =>
      archivedAnswer({
        ...answer(),
        sources: [{ ...answer().sources[0], url: "javascript:alert(1)" }],
      })
    ).toThrow();
    expect(() =>
      archivedAnswer({
        ...answer(),
        sources: [{ ...answer().sources[0], email: "synthetic@example.test" }],
      })
    ).toThrow();
    expect(() => archivedAnswer({ ...answer(), sources: [] })).toThrow();
    expect(() =>
      archivedAnswer({
        ...answer(),
        sections: [{ ...answer().sections[0], body: "x".repeat(2601) }],
      })
    ).toThrow();
  });
  it("uses body-bound v3 domain and deadline, rejects replay in v1/quota domain", () => {
    const body = Buffer.from(JSON.stringify(start()));
    verifyOpsProof(body, proof(body));
    for (const sig of [
      proof(body, 46),
      proof(body, 0),
      proof(body, 45, "ask-query-store"),
      proof(Buffer.from("different")),
      "v1.1234567890." + "a".repeat(64),
    ])
      expect(() => verifyOpsProof(body, sig)).toThrow("invalid_admission");
  });
  it.each([
    "context",
    "history",
    "email",
    "subject",
    "answer",
    "reasoning",
    "turn_number",
    "command",
  ])("rejects extra %s before writing", async field => {
    const body = Buffer.from(
      JSON.stringify({ ...start(), [field]: "synthetic-extra" })
    );
    await expect(storeOpsEvent(body, proof(body))).rejects.toMatchObject({
      code: "invalid_request",
    });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("validates pseudonyms, canonical question encoding, enums and times", () => {
    for (const mutation of [
      { visitor_id: "guest:cookie" },
      { conversation_id: ID },
      { intent: "ops" },
      { entrypoint: "evil" },
      { question: "\ud800" },
      { question: "a".repeat(2001) },
      { created_at: "2026-02-30T00:00:00.000Z" },
    ])
      expect(() =>
        opsEvent(Buffer.from(JSON.stringify({ ...start(), ...mutation })))
      ).toThrow("invalid_request");
    expect(() => opsEvent(Buffer.from([255]))).toThrow("invalid_request");
  });
  it("intake stores only fixed namespace and Unicode char count, without expiry", async () => {
    const r = start(),
      body = Buffer.from(JSON.stringify(r));
    expect(await storeOpsEvent(body, proof(body))).toEqual({ ok: true });
    const command = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(command[3]).toBe(OPS_PREFIX + "record:" + ID);
    expect(command.at(-3)).toBe(Array.from(r.question).length);
    expect(command[1]).not.toMatch(/EXPIRE/); // only deletion tombstones expire
  });
  it("counts Beijing calendar days, including UTC boundary", () => {
    expect(
      rangeBounds("today", Date.parse("2026-10-01T16:00:00Z"))
    ).toMatchObject({
      today: "2026-10-02",
      min: Date.parse("2026-10-01T16:00:00Z"),
    });
    expect(rangeBounds("7", Date.parse("2026-10-01T15:59:59Z")).min).toBe(
      Date.parse("2026-09-24T16:00:00Z")
    );
  });
  it("keeps anonymous visitor across membership sign-in and only signs pair for v3", async () => {
    const guest = await resolveIdentity(request()),
      cookie = guest.cookie!.split(";")[0];
    const user = (
      await createSession(`user:${"b".repeat(43)}`, "member@example.com", true)
    ).split(";")[0];
    const browser = await resolveOpsVisitor(request(`${cookie}; ${user}`));
    expect(browser.sub).toBe(guest.sub);
    const bytes = new TextEncoder().encode("{}");
    const old = await admission(guest, "POST", "/api/ask", bytes);
    const current = await admission(guest, "POST", "/api/ask", bytes, {
      visitor: browser.sub,
      entrypoint: "home",
    });
    expect(
      JSON.parse(Buffer.from(old.split(".")[1], "base64url").toString())
    ).not.toHaveProperty("visitor");
    expect(
      JSON.parse(Buffer.from(current.split(".")[1], "base64url").toString())
    ).toMatchObject({ visitor: guest.sub, entrypoint: "home" });
  });
  it.each([
    ["/api/ask-lizheng/ask", "home"],
    ["/api/ask", "standalone"],
  ])("relay derives v3 visitor and entrypoint %s", async (path, entrypoint) => {
    const body = JSON.stringify({
      question: "synthetic",
      context: "",
      intent: "understand",
      history: [],
      query_log_notice: "v3",
      conversation_id: ID,
    });
    const upstream = vi.fn().mockResolvedValue(
      new Response('event: result\ndata: {"status":"answered"}\n\n', {
        headers: { "Content-Type": "text/event-stream" },
      })
    );
    vi.stubGlobal("fetch", withRedis(upstream));
    const response = await relay(
      new Request(
        `https://${entrypoint === "home" ? "www" : "ask"}.lizheng.ai${path}`,
        {
          method: "POST",
          body,
          headers: {
            origin: `https://${entrypoint === "home" ? "www" : "ask"}.lizheng.ai`,
          },
        }
      )
    );
    expect(response.status).toBe(200);
    const claims = JSON.parse(
      Buffer.from(
        upstream.mock.calls[0][1].headers["X-Ask-Admission"].split(".")[1],
        "base64url"
      ).toString()
    );
    expect(claims.visitor).toMatch(/^guest:[A-Za-z0-9_-]{43}$/);
    expect(claims.entrypoint).toBe(entrypoint);
    expect(claims).not.toHaveProperty("question");
    await response.text();
  });
});
