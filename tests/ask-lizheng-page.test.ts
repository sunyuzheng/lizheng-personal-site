import { afterEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import handler, { WAKE_WAIT_MS, WAKING_SCRIPT } from "../api/ask-lizheng-page";

const page = "<!doctype html><title>问问立正</title><div id=root></div>";
const get = (host = "ask.lizheng.ai", method = "GET") => handler(new Request(`https://${host}/api/ask-lizheng-page`, { method }));
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("ask.lizheng.ai page while Builder sleeps", () => {
  it("passes the page through when Builder answers in time", async () => {
    const upstream = vi.fn(async () => new Response(page, { headers: { "Content-Type": "text/html; charset=utf-8" } }));
    vi.stubGlobal("fetch", upstream);
    const response = await get();
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(page);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(upstream).toHaveBeenCalledWith("https://ask-lizheng.ai-builders.space/", expect.objectContaining({ redirect: "manual" }));
  });

  it("says the service is waking once Builder is slower than the wait", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => {})));
    const pending = get();
    await vi.advanceTimersByTimeAsync(WAKE_WAIT_MS);
    const response = await pending;
    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("5");
    const body = await response.text();
    expect(body).toContain("问答服务刚才在休眠，正在唤醒…");
    // The only script is the one the policy allows by hash; it asks /api/meta, same origin.
    const scripts = [...body.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
    expect(scripts).toEqual([WAKING_SCRIPT]);
    const csp = String(response.headers.get("content-security-policy"));
    expect(csp).toContain(`script-src 'sha256-${createHash("sha256").update(WAKING_SCRIPT).digest("base64")}'`);
    expect(csp).toContain("connect-src 'self'");
    expect(body).not.toMatch(/ on[a-z]+=/);
  });

  it("shows the waking page instead of an error or a redirect from Builder", async () => {
    for (const upstream of [
      vi.fn(async () => { throw new TypeError("network"); }),
      vi.fn(async () => new Response("Bad gateway", { status: 502 })),
      vi.fn(async () => new Response(null, { status: 302, headers: { Location: "https://example.com/" } })),
    ]) {
      vi.stubGlobal("fetch", upstream);
      const response = await get();
      expect(response.status).toBe(503);
      expect(await response.text()).toContain("正在唤醒");
    }
  });

  it("answers only for ask.lizheng.ai and only GET or HEAD", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(page, { headers: { "Content-Type": "text/html" } })));
    expect((await get("www.lizheng.ai")).status).toBe(404);
    expect((await get("ask.lizheng.ai", "POST")).status).toBe(405);
    const head = await get("ask.lizheng.ai", "HEAD");
    expect(head.status).toBe(200);
    expect(await head.text()).toBe("");
  });
});
