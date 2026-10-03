import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import handler from "../api/ask-lizheng-usage";
import { recordUsage, usageDay, usageEvent, USAGE_PREFIX, USAGE_RECORD_SCRIPT, USAGE_TTL_SECONDS } from "../shared/ask-usage";
import { linkTarget } from "../client/src/lib/link-target";

const NOW = Date.parse("2026-10-03T12:00:00.000Z");
const TODAY = usageDay(NOW);
const CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const event = (extra: Record<string, unknown> = {}) => Buffer.from(JSON.stringify({ v: 1, surface: "ask", view: 1, engaged_ms: 0, marks: ["d_shown"], ...extra }));
const request = (headers: Record<string, string> = {}, host = "ask.lizheng.ai") =>
  new Request(`https://${host}/api/ask-lizheng/usage`, { method: "POST", headers: { "user-agent": CHROME, origin: `https://${host}`, "x-vercel-forwarded-for": "203.0.113.9", ...headers } });
function upstash(result: unknown = 1) {
  const fetcher = vi.fn(async (_url: string, _init: RequestInit) => new Response(JSON.stringify({ result })));
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}
const command = (fetcher: ReturnType<typeof upstash>) => JSON.parse(String(fetcher.mock.calls[0][1].body)) as (string | number)[];

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(NOW);
  vi.stubEnv("ASK_AUTH_SECRET", "s".repeat(48));
  vi.stubEnv("ASK_AUTH_REDIS_REST_URL", "https://synthetic.upstash.io");
  vi.stubEnv("ASK_AUTH_REDIS_REST_TOKEN", "synthetic-not-live");
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("what a page may send", () => {
  it("takes a view, reading time and known marks, nothing else", () => {
    expect(usageEvent(event({ marks: ["t10", "s50", "d_open", "ask"] }))).toMatchObject({ surface: "ask", marks: ["t10", "s50", "d_open", "ask"] });
    // The homepage's chapters, as they come into view.
    const chapters = ["c_works", "c_city", "c_talks", "c_calls", "c_writing", "c_join"];
    expect(usageEvent(event({ surface: "home", marks: chapters })).marks).toEqual(chapters);
    for (const bad of [
      event({ question: "synthetic text" }), event({ marks: ["typed:hello"] }), event({ marks: ["t10", "t10"] }),
      event({ surface: "admin" }), event({ view: 2 }), event({ engaged_ms: -1 }), event({ engaged_ms: 1.5 }),
      event({ engaged_ms: 3 * 3_600_000 }), event({ v: 2 }), Buffer.from("not json"), Buffer.from("[]"), Buffer.alloc(1025, 32),
    ]) expect(() => usageEvent(bad)).toThrow("invalid_request");
  });
});

describe("counting a send", () => {
  it("counts under fixed keys with a keyed browser digest, and sets the browser and its first day", async () => {
    const fetcher = upstash();
    const cookies = await recordUsage(request(), event({ engaged_ms: 4200, marks: ["d_shown", "t10"] }));
    const sent = command(fetcher);
    expect(sent.slice(0, 3)).toEqual(["EVAL", USAGE_RECORD_SCRIPT, 1]);
    expect(String(sent[3])).toMatch(new RegExp(`^${USAGE_PREFIX.replace(/[{}]/g, "\\$&")}net:[A-Za-z0-9_-]{43}:${TODAY}$`));
    expect(sent.slice(4, 10)).toEqual([USAGE_PREFIX, TODAY, TODAY, "ask", 1, 4200]);
    expect(String(sent[10])).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(sent.slice(11)).toEqual([USAGE_TTL_SECONDS, 600, "h_seen,d_seen,d_open,ask,answer", "d_shown", "t10"]);
    // No address or user agent goes to storage.
    expect(JSON.stringify(sent)).not.toMatch(/203\.0\.113|Chrome/);
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toMatch(/^__Secure-ask-guest=[a-f0-9]{64}\.[A-Za-z0-9_-]{43}; Domain=lizheng\.ai; Path=\/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax$/);
    expect(cookies[1]).toBe(`__Secure-ask-first=${TODAY}; Domain=lizheng.ai; Path=/; Max-Age=${USAGE_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`);
  });

  it("keeps the same browser and its first day on a later visit", async () => {
    upstash();
    const [guest] = await recordUsage(request(), event());
    const fetcher = upstash();
    const cookie = `${guest.split(";")[0]}; __Secure-ask-first=${TODAY - 3}`;
    const first = await recordUsage(request({ cookie }), event());
    const again = await recordUsage(request({ cookie }), event({ view: 0 }));
    expect(first).toEqual([]);
    expect(again).toEqual([]);
    const [one, two] = fetcher.mock.calls.map(call => JSON.parse(String(call[1].body)));
    expect(one[6]).toBe(TODAY - 3);
    expect(one[10]).toBe(two[10]);
  });

  it("does not count crawlers, previews or headless browsers, nor when switched off", async () => {
    const fetcher = upstash();
    for (const agent of ["Googlebot/2.1", "Mozilla/5.0 HeadlessChrome/141.0", "facebookexternalhit/1.1", ""])
      expect(await recordUsage(request({ "user-agent": agent }), event())).toEqual([]);
    vi.stubEnv("ASK_USAGE_ENABLED", "false");
    expect(await recordUsage(request(), event())).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("the endpoint", () => {
  async function post(body: unknown, headers: Record<string, string> = {}, method = "POST", url = "/api/ask-lizheng/usage") {
    const out: Record<string, unknown> = {};
    let output = "";
    const res = { statusCode: 0, setHeader: (key: string, value: unknown) => { out[key] = value; }, end: (value = "") => { output = value; } };
    await handler({ method, url, body, headers: { host: "www.lizheng.ai", origin: "https://www.lizheng.ai", "user-agent": CHROME, ...headers } } as unknown as IncomingMessage,
      res as unknown as ServerResponse);
    return { status: res.statusCode, headers: out, body: output };
  }

  it("answers 204 and sets the cookies for a send from its own page", async () => {
    upstash();
    const result = await post(event().toString());
    expect(result.status).toBe(204);
    expect(result.headers["Set-Cookie"]).toHaveLength(2);
    expect(result.headers["Cache-Control"]).toBe("no-store, no-transform");
  });

  it("refuses other origins and hosts, other methods, parameters and oversized bodies", async () => {
    const fetcher = upstash();
    expect((await post(event().toString(), { origin: "https://example.com" })).status).toBe(403);
    expect((await post(event().toString(), { host: "lizheng-personal-sitecodex.vercel.app", origin: "https://lizheng-personal-sitecodex.vercel.app" })).status).toBe(403);
    expect((await post(event().toString(), {}, "GET")).status).toBe(405);
    expect((await post(event().toString(), {}, "POST", "/api/ask-lizheng/usage?x=1")).status).toBe(400);
    expect((await post("x".repeat(1025))).status).toBe(413);
    expect((await post("{\"v\":1}")).status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("homepage link labels", () => {
  it("names a link by page, anchor, or site and first path part", () => {
    const here = "https://www.lizheng.ai/";
    expect(linkTarget("https://www.superlinear.academy/", here)).toBe("superlinear.academy/");
    expect(linkTarget("https://www.superlinear.academy/c/ai-resources/verb", here)).toBe("superlinear.academy/c");
    expect(linkTarget("https://www.youtube.com/@kedaibiao", here)).toBe("youtube.com/@kedaibiao");
    expect(linkTarget("/guests/reynold-xin", here)).toBe("/guests");
    expect(linkTarget("/en/collab/enterprise", "https://www.lizheng.ai/en")).toBe("/collab");
    expect(linkTarget("#join", here)).toBe("#join");
    expect(linkTarget("/", "https://www.lizheng.ai/about")).toBe("/");
  });
});
