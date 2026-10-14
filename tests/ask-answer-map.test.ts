import { afterEach, describe, expect, it, vi } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import handler, { ANSWER_MAP_CACHE, ANSWER_MAP_SOURCE } from "../api/ask-lizheng-answer-map";

type Reply = { statusCode: number; headers: Map<string, unknown>; body: string | undefined };
async function call(method = "GET"): Promise<Reply> {
  const reply = { statusCode: 200, headers: new Map<string, unknown>(), body: undefined as string | undefined,
    setHeader(name: string, value: unknown) { this.headers.set(name.toLowerCase(), value); },
    end(value?: string) { this.body = value; } };
  await handler({ method, headers: {} } as unknown as IncomingMessage, reply as unknown as ServerResponse);
  return reply;
}
afterEach(() => { vi.unstubAllGlobals(); });

describe("the answer map's layout", () => {
  it("comes from Builder and is kept at the edge an hour, then served stale while it refreshes", async () => {
    const layout = JSON.stringify({ v: 1, kinds: "vw", keys: ["videos/x", "community-posts/y"] });
    const fetcher = vi.fn(async () => new Response(layout, { headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetcher);
    const reply = await call();
    expect(fetcher.mock.calls[0][0]).toBe(ANSWER_MAP_SOURCE);
    expect(reply.statusCode).toBe(200);
    expect(reply.body).toBe(layout);
    expect(reply.headers.get("cache-control")).toBe(ANSWER_MAP_CACHE);
    expect(ANSWER_MAP_CACHE).toMatch(/s-maxage=3600.*stale-while-revalidate/);
  });

  it("keeps nothing when Builder cannot answer or answers something else", async () => {
    for (const answer of [new Response("down", { status: 503 }), new Response("<html>", { status: 200 }), new Response("{}", { status: 200 })]) {
      vi.stubGlobal("fetch", vi.fn(async () => answer));
      const reply = await call();
      expect(reply.statusCode).toBe(503);
      expect(reply.headers.get("cache-control")).toBe("no-store");
    }
    expect((await call("POST")).statusCode).toBe(405);
  });

  it("is where both hosts send the map's address", () => {
    const routes = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")).routes as { src?: string; dest?: string }[];
    expect(routes.filter(route => route.dest === "/api/ask-lizheng-answer-map").map(route => route.src).sort())
      .toEqual(["^/api/answer-map$", "^/api/ask-lizheng/answer-map$"]);
    // Ahead of the route that hands everything else on ask.lizheng.ai to Builder.
    const index = (src: string) => routes.findIndex(route => route.src === src);
    expect(index("^/api/answer-map$")).toBeLessThan(routes.findIndex(route => route.src === "/(.*)" && String(route.dest).includes("ai-builders.space")));
  });
});
