import { createHash, createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ require: vi.fn() }));
vi.mock("../shared/ask-access.js", async importOriginal => ({
  ...await importOriginal<typeof import("../shared/ask-access.js")>(), requireOpsOwner: auth.require,
}));
import { AccessError } from "../shared/ask-access.js";
import handler from "../api/ask-lizheng-ops.js";
import pageHandler from "../api/ask-lizheng-ops-page.js";
import {
  OPS_BACKEND_ORIGIN, OPS_GATEWAY_MAX_RESPONSE_BYTES,
  opsGatewayEnvelope, proxyOps, type OpsGatewayEnvelope,
} from "../shared/ask-ops-gateway.js";

const NOW = Date.parse("2026-10-02T03:00:00.000Z");
const SECRET = "a".repeat(64);
const ID = "01234567-89ab-4cde-8f01-23456789abcd";
const CURSOR = `1790900000123:${ID}`;
const envelope: OpsGatewayEnvelope = { v: 1, method: "GET", action: "summary", params: { range: "7" } };
function url(path: string) { return new URL(path, "https://www.lizheng.ai"); }
async function call(path: string, method = "GET", extraHeaders: Record<string, unknown> = {}) {
  const headers: Record<string, string> = {};
  let text = "";
  const res = {
    statusCode: 200,
    setHeader(name: string, value: string) { headers[name.toLowerCase()] = value; },
    end(value: string) { text = value; },
  };
  await handler({
    url: path, method,
    headers: { host: "www.lizheng.ai", cookie: "synthetic-owner-cookie", ...extraHeaders },
  } as unknown as IncomingMessage, res as unknown as ServerResponse);
  return { status: res.statusCode, headers, value: JSON.parse(text) };
}
async function page(path: string, method = "GET", extraHeaders: Record<string, unknown> = {}) {
  const headers: Record<string, string> = {};
  let body: Buffer | undefined;
  const res = {
    statusCode: 200,
    setHeader(name: string, value: string | number) { headers[name.toLowerCase()] = String(value); },
    end(value?: string | Buffer) { body = value === undefined ? undefined : Buffer.from(value); },
  };
  await pageHandler({
    url: path, method, headers: { host: "www.lizheng.ai", cookie: "synthetic-owner-cookie", ...extraHeaders },
  } as unknown as IncomingMessage, res as unknown as ServerResponse);
  return { status: res.statusCode, headers, body, value: () => JSON.parse(body!.toString("utf8")) };
}
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(NOW);
  auth.require.mockResolvedValue({ email: "owner@example.test" });
  vi.stubEnv("ASK_OPS_GATEWAY_SECRET", SECRET);
  vi.stubEnv("ASK_OPS_BACKEND_ORIGIN", OPS_BACKEND_ORIGIN);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ records: [], next_cursor: null, truncated: false })));
});
afterEach(() => {
  vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); auth.require.mockReset();
});

describe("HOME owner boundary", () => {
  it.each([401, 403, 503])("gates all remote operations on existing owner auth (%s)", async status => {
    auth.require.mockRejectedValue(new AccessError("ops_login_required", status));
    const result = await call("/api/ask-lizheng/ops/records?dataset=legacy");
    expect(result).toMatchObject({ status, value: { code: "ops_login_required" } });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("serves owner session locally without a gateway key or remote lookup", async () => {
    vi.stubEnv("ASK_OPS_GATEWAY_SECRET", "");
    const result = await call("/api/ask-lizheng-ops?__route=session");
    expect(result).toMatchObject({ status: 200, value: {
      owner: true, email: "owner@example.test", archive_retention: "until_deleted",
    } });
    expect(result.value).not.toHaveProperty("retention_days");
    expect(fetch).not.toHaveBeenCalled();
    expect(result.headers).toMatchObject({ "cache-control": "no-store, no-transform", vary: "Cookie",
      "x-robots-tag": "noindex, nofollow, noarchive", "cross-origin-resource-policy": "same-origin",
      "referrer-policy": "no-referrer", "x-content-type-options": "nosniff" });
  });
  it.each([
    { host: "ask.lizheng.ai" }, { host: "www.lizheng.ai:443" }, { host: ["www.lizheng.ai"] },
    { origin: "https://evil.example" }, { origin: ["https://www.lizheng.ai"] },
  ])("rejects noncanonical host/origin before owner lookup", async headers => {
    expect((await call("/api/ask-lizheng/ops/session", "GET", headers)).status).toBe(403);
    expect(auth.require).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
  it("does not accept an absolute request URL on a different origin", async () => {
    expect((await call("https://evil.example/api/ask-lizheng/ops/summary")).status).toBe(403);
    expect(auth.require).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
  it("requires same-origin DELETE action even for a verified owner", async () => {
    const result = await call(`/api/ask-lizheng/ops/delete?record_id=${ID}`, "POST");
    expect(result.status).toBe(403); expect(fetch).not.toHaveBeenCalled();
    expect((await call(`/api/ask-lizheng/ops/delete?record_id=${ID}`, "POST", { origin: "https://www.lizheng.ai" })).status).toBe(200);
  });
  it("does not forward browser cookies, authorization, email or client URL fields", async () => {
    const result = await call("/api/ask-lizheng/ops/records", "GET", {
      authorization: "synthetic-browser-auth", "x-email": "untrusted@example.test", "x-ops-origin": "https://evil.example",
    });
    expect(result.status).toBe(200);
    const [, request] = vi.mocked(fetch).mock.calls[0];
    expect(Object.keys(request!.headers!)).toEqual(["Content-Type", "x-ask-ops-proof"]);
    expect(JSON.parse(String(request!.body))).toEqual({ v: 1, method: "GET", action: "records", params: { range: "7" } });
    expect(String(request!.body)).not.toMatch(/cookie|owner|email|identity|evil/);
    const ownerRequest = auth.require.mock.calls[0][0] as Request;
    expect(ownerRequest.headers.get("cookie")).toBe("synthetic-owner-cookie");
    expect(ownerRequest.headers.get("authorization")).toBeNull();
  });
});

describe("strict signed RPC contract", () => {
  it("signs exactly the UTF-8 compact JSON envelope using the UTF-8 hex secret", async () => {
    await call(`/api/ask-lizheng-ops?__route=records&dataset=archive&range=all&cursor=${encodeURIComponent(CURSOR)}&conversation=${"b".repeat(64)}`);
    const [destination, options] = vi.mocked(fetch).mock.calls[0];
    const raw = JSON.stringify({ v: 1, method: "GET", action: "records", params: { range: "all", cursor: CURSOR, conversation: "b".repeat(64) } });
    const expiry = String(Math.floor(NOW / 1000) + 20);
    const expected = createHmac("sha256", SECRET).update(`ask-ops-gateway:v1:${expiry}:${createHash("sha256").update(raw, "utf8").digest("hex")}`, "utf8").digest("hex");
    expect(destination).toBe(`${OPS_BACKEND_ORIGIN}/api/ops`);
    expect(options).toMatchObject({ method: "POST", body: raw, redirect: "manual", cache: "no-store", credentials: "omit",
      headers: { "Content-Type": "application/octet-stream", "x-ask-ops-proof": `v1.${expiry}.${expected}` } });
    expect(options!.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(raw)).not.toHaveProperty("dataset");
  });
  it("wraps a delete as POST with only the canonical record UUID", async () => {
    await call(`/api/ask-lizheng/ops/delete?record_id=${ID}&dataset=archive`, "POST", { origin: "https://www.lizheng.ai" });
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]!.body))).toEqual({ v: 1, method: "POST", action: "delete", params: { record_id: ID } });
  });
  it.each(["summary", "records", "export"])("defaults %s to archive/7 without transmitting legacy", action => {
    expect(opsGatewayEnvelope(url(`/api/ask-lizheng/ops/${action}`), "GET")).toEqual({ v: 1, method: "GET", action, params: { range: "7" } });
  });
  it.each(["records", "export"])("continues real timestamp/UUID seek pages for %s", async action => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ records: [{ record_id: ID }], next_cursor: CURSOR, truncated: false }))
      .mockResolvedValueOnce(Response.json({ records: [], next_cursor: null, truncated: false }));
    const first = await call(`/api/ask-lizheng/ops/${action}?range=all`);
    const second = await call(`/api/ask-lizheng/ops/${action}?range=all&cursor=${encodeURIComponent(first.value.next_cursor)}`);
    expect(second).toMatchObject({ status: 200, value: { records: [], next_cursor: null } });
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[1][1]!.body))).toEqual({
      v: 1, method: "GET", action, params: { range: "all", cursor: CURSOR },
    });
  });
  it.each([
    "records?dataset=legacy", "summary?range=90", "summary?cursor=x", "summary?record_id=" + ID,
    "session?range=7", "export?conversation=" + "b".repeat(64), "records?conversation=bad",
    "records?cursor=", "records?cursor=" + "a".repeat(257), "records?cursor=https%3A%2F%2Fevil.example",
    "records?cursor=abc-_", `records?cursor=12345678901234567:${ID}`, "records?cursor=1:bad",
    "records?url=https%3A%2F%2Fevil.example", "records?email=untrusted%40example.test", "records?range=7&range=all",
    "records?dataset=archive&dataset=archive", "records?__route=records&__route=summary", "unknown",
  ])("rejects invalid/foreign query parameters: %s", async path => {
    expect((await call(`/api/ask-lizheng/ops/${path}`)).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([
    `delete?record_id=${ID}&range=all`, `delete?record_id=${ID}&cursor=x`, "delete?record_id=bad", "delete",
  ])("rejects malformed delete parameters: %s", async path => {
    expect((await call(`/api/ask-lizheng/ops/${path}`, "POST", { origin: "https://www.lizheng.ai" })).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([["records", "POST", "GET"], ["delete", "GET", "POST"], ["session", "OPTIONS", "GET"]])(
    "enforces action method %s %s", async (action, method, allowed) => {
      const result = await call(`/api/ask-lizheng/ops/${action}`, method);
      expect(result).toMatchObject({ status: 405, headers: { allow: allowed } });
      expect(fetch).not.toHaveBeenCalled();
    }
  );
  it.each(["", "a".repeat(63), "A".repeat(64), "a".repeat(65)])("fails closed for an invalid signing key", async secret => {
    vi.stubEnv("ASK_OPS_GATEWAY_SECRET", secret);
    expect((await call("/api/ask-lizheng/ops/summary")).value).toEqual({ code: "ops_gateway_unavailable" });
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(["", "https://evil.example", `${OPS_BACKEND_ORIGIN}/`, `${OPS_BACKEND_ORIGIN}/api/ops`])(
    "rejects any configured origin except the exact fixed one", async origin => {
      vi.stubEnv("ASK_OPS_BACKEND_ORIGIN", origin);
      expect((await call("/api/ask-lizheng/ops/summary")).status).toBe(503);
      expect(fetch).not.toHaveBeenCalled();
    }
  );
});

describe("bounded sanitized upstream", () => {
  it.each([302, 307, 401, 403, 500])("never follows %s or reads an error response", async status => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({ cancel });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body, { status, headers: {
      location: "https://evil.example", "content-type": "application/json", "set-cookie": "synthetic-upstream-cookie",
    } })));
    const result = await call("/api/ask-lizheng/ops/records");
    expect(result).toMatchObject({ status: 503, value: { code: "ops_gateway_unavailable" } });
    expect(cancel).toHaveBeenCalledOnce(); expect(fetch).toHaveBeenCalledOnce();
    expect(result.headers).not.toHaveProperty("location"); expect(result.headers).not.toHaveProperty("set-cookie");
  });
  it("bounds declared size before reading a stalled body", async () => {
    const cancel = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new ReadableStream({ cancel }), { headers: {
      "content-type": "application/json", "content-length": String(OPS_GATEWAY_MAX_RESPONSE_BYTES + 1),
    } })));
    await expect(proxyOps(envelope)).rejects.toMatchObject({ code: "ops_gateway_unavailable" });
    expect(cancel).toHaveBeenCalledOnce();
  });
  it("bounds chunked bytes and cancels without awaiting a hanging cancel hook", async () => {
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new ReadableStream({
      start(controller) { controller.enqueue(new Uint8Array(OPS_GATEWAY_MAX_RESPONSE_BYTES)); controller.enqueue(new Uint8Array(1)); }, cancel,
    }), { headers: { "content-type": "application/json" } })));
    await expect(proxyOps(envelope)).rejects.toMatchObject({ code: "ops_gateway_unavailable" });
    expect(cancel).toHaveBeenCalledOnce();
  });
  it("decodes split multibyte UTF-8 JSON and returns only the JSON body", async () => {
    const data = new TextEncoder().encode(JSON.stringify({ records: [{ question: "synthetic 学习 😀" }], next_cursor: null }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new ReadableStream({
      start(controller) { for (const byte of data) controller.enqueue(Uint8Array.of(byte)); controller.close(); },
    }), { headers: { "content-type": "application/json", "set-cookie": "synthetic-private-cookie" } })));
    const result = await call("/api/ask-lizheng/ops/records");
    expect(result.value.records[0].question).toBe("synthetic 学习 😀");
    expect(result.headers).not.toHaveProperty("set-cookie");
  });
  it.each(["synthetic-private-invalid-json", "[]", "null", '{"error":"synthetic-private-error"}']) (
    "sanitizes malformed or error JSON without echoing its body", async body => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body, { headers: { "content-type": "application/json" } })));
      expect((await call("/api/ask-lizheng/ops/records")).value).toEqual({ code: "ops_gateway_unavailable" });
    }
  );
  it("rejects invalid UTF-8 rather than mutating archived question bytes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(Uint8Array.of(123, 34, 120, 34, 58, 34, 255, 34, 125), { headers: { "content-type": "application/json" } })));
    await expect(proxyOps(envelope)).rejects.toMatchObject({ code: "ops_gateway_unavailable" });
  });
  it("sanitizes a fetch exception without exposing its message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("synthetic-private-error")));
    expect((await call("/api/ask-lizheng/ops/summary")).value).toEqual({ code: "ops_gateway_unavailable" });
  });
  it("aborts a stalled fetch at the whole 20-second budget", async () => {
    vi.stubGlobal("fetch", vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(new Error("synthetic-abort-detail")), { once: true });
    })));
    const result = call("/api/ask-lizheng/ops/summary");
    await vi.advanceTimersByTimeAsync(20_000);
    expect(await result).toMatchObject({ status: 503, value: { code: "ops_gateway_unavailable" } });
    expect(vi.mocked(fetch).mock.calls[0][1]!.signal!.aborted).toBe(true);
  });
  it("uses the same total deadline for a stalled response body and releases its reader safely", async () => {
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const body = new ReadableStream<Uint8Array>({ cancel });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body, { headers: { "content-type": "application/json" } })));
    const result = call("/api/ask-lizheng/ops/summary");
    await vi.advanceTimersByTimeAsync(19_999);
    expect(cancel).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toMatchObject({ status: 503, value: { code: "ops_gateway_unavailable" } });
    await Promise.resolve(); await Promise.resolve();
    expect(cancel).toHaveBeenCalledOnce(); expect(body.locked).toBe(false);
  });
});

describe("separate frontend route boundary", () => {
  it("routes only the exact www bookmark and hashed JS/CSS to the local stripping gateway before catchalls", () => {
    const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
    const api = config.routes[0], page = config.routes[1], assets = config.routes[2];
    expect(api.dest).toBe("/api/ask-lizheng-ops?__route=$1");
    expect(new RegExp(api.src).test("/api/ask-lizheng/ops/records/extra")).toBe(false);
    expect(page.dest).toBe("/api/ask-lizheng-ops-page");
    expect(assets.dest).toBe("/api/ask-lizheng-ops-page?__asset=$1");
    for (const route of [page, assets]) {
      expect(route.has).toEqual([{ type: "host", value: "www\\.lizheng\\.ai" }]);
      expect(route.dest).not.toMatch(/^https?:/);
      expect(route.headers).toMatchObject({ "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" });
    }
    expect(new RegExp(page.src).test("/ops/ask-lizheng/extra")).toBe(false);
    expect(new RegExp(assets.src).test("/ops/ask-lizheng/assets/index-Abcdef12.js")).toBe(true);
    expect(new RegExp(assets.src).test("/ops/ask-lizheng/assets/index-Abcdef12.css")).toBe(true);
    expect(new RegExp(assets.src).test("/ops/ask-lizheng/assets/app.js")).toBe(false);
    expect(new RegExp(assets.src).test("/ops/ask-lizheng/api/ops")).toBe(false);
    expect(new RegExp(assets.src).test("/ops/ask-lizheng/assets/index-Abcdef12.js.map")).toBe(false);
    expect(new RegExp(assets.src).test("/ops/ask-lizheng-other/assets/app.js")).toBe(false);
  });
  it.each([["", "text/html", ""], ["index-Abcdef12.js", "text/javascript", "assets/index-Abcdef12.js"],
    ["index-Abcdef12.css", "text/css", "assets/index-Abcdef12.css"]])(
    "only fetches the fixed public shell/asset without inbound headers (%s)", async (asset, type, target) => {
      const bytes = Buffer.from("synthetic public body");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(bytes, { headers: {
        "content-type": type, "set-cookie": "synthetic-upstream-cookie", "x-private": "synthetic-private-value",
      } })));
      const result = await page(`/api/ask-lizheng-ops-page${asset ? `?__asset=${asset}` : ""}`, "GET", {
        authorization: "synthetic-browser-auth", origin: "https://www.lizheng.ai", "x-forwarded-for": "synthetic-ip",
        "x-email": "synthetic@example.test",
      });
      expect(result.status).toBe(200); expect(result.body).toEqual(bytes);
      const [destination, options] = vi.mocked(fetch).mock.calls[0];
      expect(destination).toBe(`${OPS_BACKEND_ORIGIN}/${target}`);
      expect(options).toMatchObject({ method: "GET", cache: "no-store", redirect: "manual", credentials: "omit" });
      expect(options).not.toHaveProperty("headers"); expect(options).not.toHaveProperty("body");
      expect(auth.require).not.toHaveBeenCalled();
      expect(result.headers).not.toHaveProperty("set-cookie"); expect(result.headers).not.toHaveProperty("x-private");
      expect(result.headers).toMatchObject({ "cache-control": "no-store, no-transform", "x-frame-options": "DENY",
        "x-robots-tag": "noindex, nofollow, noarchive", "cross-origin-resource-policy": "same-origin" });
    }
  );
  it("keeps login completion query local instead of forwarding it", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("synthetic", { headers: { "content-type": "text/html" } })));
    expect((await page("/ops/ask-lizheng?ask_login=done")).status).toBe(200);
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(`${OPS_BACKEND_ORIGIN}/`);
  });
  it.each([
    "?__asset=", "?__asset=api%2Fops", "?__asset=index-Abcdef12.js.map", "?__asset=..%2Fapi%2Fops",
    "?__asset=https%3A%2F%2Fevil.example%2Findex-Abcdef12.js", "?__asset=%252e%252e%252fapi%252fops",
    "?__asset=index-Abcdef12.js&__asset=index-Abcdef12.css", "?url=https%3A%2F%2Fevil.example", "?ask_login=bad",
  ])("rejects static target/path injection %s", async query => {
    expect((await page(`/api/ask-lizheng-ops-page${query}`)).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects non-www hosts and mutation methods before any static fetch", async () => {
    expect((await page("/ops/ask-lizheng", "GET", { host: "ask.lizheng.ai" })).status).toBe(403);
    expect((await page("/ops/ask-lizheng", "POST")).status).toBe(405);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("supports HEAD without sending the fetched body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("synthetic", { headers: { "content-type": "text/html" } })));
    expect(await page("/ops/ask-lizheng", "HEAD")).toMatchObject({ status: 200, body: undefined, headers: { "content-length": "9" } });
  });
  it.each([302, 404, 500])("does not follow static redirects/errors (%s) or propagate raw bodies", async status => {
    const cancel = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new ReadableStream({ cancel }), { status,
      headers: { "content-type": "text/html", location: "https://evil.example" } })));
    const result = await page("/ops/ask-lizheng");
    expect(result.status).toBe(503); expect(result.value()).toEqual({ code: "ops_page_unavailable" });
    expect(cancel).toHaveBeenCalledOnce(); expect(fetch).toHaveBeenCalledOnce();
    expect(result.headers).not.toHaveProperty("location");
  });
  it("rejects an unexpected MIME and an oversized HTML body", async () => {
    const cancel = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("synthetic-private", { headers: { "content-type": "application/json" } }))
      .mockResolvedValueOnce(new Response(new ReadableStream({ cancel }), { headers: {
        "content-type": "text/html", "content-length": "1000001",
      } })));
    expect((await page("/ops/ask-lizheng")).status).toBe(503);
    expect((await page("/ops/ask-lizheng")).status).toBe(503); expect(cancel).toHaveBeenCalledOnce();
  });
  it("bounds chunked JS bytes and cancels without waiting for a stuck cancel hook", async () => {
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new ReadableStream({
      start(controller) { controller.enqueue(new Uint8Array(4_400_001)); }, cancel,
    }), { headers: { "content-type": "application/javascript" } })));
    expect((await page("/api/ask-lizheng-ops-page?__asset=index-Abcdef12.js")).status).toBe(503);
    expect(cancel).toHaveBeenCalledOnce();
  });
  it("aborts a stalled static body at the total20s deadline and releases its reader", async () => {
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const body = new ReadableStream<Uint8Array>({ cancel });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body, { headers: { "content-type": "text/html" } })));
    const result = page("/ops/ask-lizheng");
    await vi.advanceTimersByTimeAsync(20_000);
    expect((await result).value()).toEqual({ code: "ops_page_unavailable" });
    expect(cancel).toHaveBeenCalledOnce(); expect(body.locked).toBe(false);
    expect(vi.mocked(fetch).mock.calls[0][1]!.signal!.aborted).toBe(true);
  });
});
