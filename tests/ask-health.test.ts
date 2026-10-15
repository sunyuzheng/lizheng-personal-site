import { describe, expect, it, vi } from "vitest";
import { beijingDay, checkHealth, FEED_CAPACITY, HEALTH_KEY, healthMail, watchHealth } from "../shared/ask-health";

const NOW = Date.parse("2026-10-16T04:00:00.000Z");
const HOUR = 3_600_000;
const OPS = "ask-ops:{v3}:";

// A day the checks find nothing wrong with; each test changes one thing.
function day(change: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {
    [OPS + "day:" + beijingDay(NOW - 24 * HOUR)]: ["questions", "40", "answered", "31", "cancelled", "4", "generating", "0"],
    [OPS + "discovery:curate-health"]: JSON.stringify({ at: NOW - 10 * 60_000, cursor_at: NOW - 40 * 60_000, considered: 2, published: 1, stopped: null }),
    newest: NOW - 40 * 60_000,
    [OPS + "backup-health"]: JSON.stringify({ at: NOW - 43 * 60_000, day: "2026-10-16", keys: 3000, bytes: 9_000_000 }),
    items: 420,
    ...change,
  };
  const hash = new Map<string, string>();
  const send = vi.fn(async (command: (string | number)[]) => {
    const [name, key] = command;
    if (name === "HGETALL" || name === "GET") return values[String(key)] ?? (name === "HGETALL" ? [] : null);
    if (name === "ZREVRANGE") return values.newest === null ? [] : ["synthetic-id", String(values.newest)];
    if (name === "ZCARD") return values.items;
    if (name === "HGET") return hash.get(String(command[2])) ?? null;
    if (name === "HSET") { for (let i = 2; i + 1 < command.length; i += 2) hash.set(String(command[i]), String(command[i + 1])); return 1; }
    throw new Error("unexpected " + name);
  });
  const state = (values.files as string | undefined) ?? JSON.stringify({ v: 1, epoch: 9, checked_at: new Date(NOW - 60_000).toISOString() });
  const read = vi.fn(async () => state);
  const fetcher = vi.fn(async () => Response.json(values.meta ?? { model_ready: true, semantic_ready: true }));
  return { send, read, fetcher, hash };
}
const keys = async (change?: Record<string, unknown>) => {
  const { send, read, fetcher } = day(change);
  return (await checkHealth({ send, read, fetcher, now: NOW })).map(problem => problem.key);
};

describe("daily check", () => {
  it("finds nothing on an ordinary day, and mails nothing", async () => {
    expect(await keys()).toEqual([]);
    const { send, read, fetcher, hash } = day();
    const mail = vi.fn();
    expect(await watchHealth({ send, read, fetcher, mail, now: NOW })).toEqual({ problems: [], mailed: false });
    expect(mail).not.toHaveBeenCalled();
    expect(hash.get("checked_at")).toBe(new Date(NOW).toISOString());
  });

  it("notices when most of yesterday's questions were not answered, or never finished", async () => {
    expect(await keys({ [OPS + "day:" + beijingDay(NOW - 24 * HOUR)]: ["questions", "12", "answered", "3", "generating", "4"] }))
      .toEqual(["answers", "unfinished"]);
    // Too few questions to judge a rate.
    expect(await keys({ [OPS + "day:" + beijingDay(NOW - 24 * HOUR)]: ["questions", "3", "answered", "0"] })).toEqual([]);
  });

  it("notices a feed that has stopped, stalled or fallen behind", async () => {
    expect(await keys({ [OPS + "discovery:curate-health"]: null })).toEqual(["feed_unknown"]);
    expect(await keys({ [OPS + "discovery:curate-health"]: JSON.stringify({ at: NOW - 5 * HOUR, cursor_at: NOW - 40 * 60_000, stopped: null }) }))
      .toEqual(["feed_idle"]);
    expect(await keys({ [OPS + "discovery:curate-health"]: JSON.stringify({ at: NOW - 10 * 60_000, cursor_at: NOW - 40 * 60_000, stopped: "unreadable_record" }) }))
      .toEqual(["feed_stopped"]);
    expect(await keys({ [OPS + "discovery:curate-health"]: JSON.stringify({ at: NOW - 10 * 60_000, cursor_at: NOW - 9 * HOUR, stopped: "builder_unavailable" }), newest: NOW - 2 * HOUR }))
      .toEqual(["feed_behind"]);
    // A quiet night: no newer question, nothing behind.
    expect(await keys({ newest: NOW - 9 * HOUR, [OPS + "discovery:curate-health"]: JSON.stringify({ at: NOW - 10 * 60_000, cursor_at: NOW - 9 * HOUR, stopped: null }) }))
      .toEqual([]);
  });

  it("notices stale public files, a missing backup and a feed nearly full", async () => {
    expect(await keys({ files: JSON.stringify({ v: 1, epoch: 9, checked_at: new Date(NOW - 40 * 60_000).toISOString() }) })).toEqual(["files"]);
    expect(await keys({ [OPS + "backup-health"]: null })).toEqual(["backup"]);
    expect(await keys({ [OPS + "backup-health"]: JSON.stringify({ at: NOW - 50 * HOUR }) })).toEqual(["backup"]);
    expect(await keys({ items: FEED_CAPACITY * 0.8 })).toEqual(["capacity"]);
    // Without the files' token there is nothing to read there; the rest is still checked.
    const { send, fetcher } = day();
    expect(await checkHealth({ send, read: null, fetcher, now: NOW })).toEqual([]);
  });

  it("tries the answer service twice before saying it does not answer", async () => {
    expect(await keys({ meta: { model_ready: true, semantic_ready: false } })).toEqual(["builder"]);
    const { send, read } = day();
    const fetcher = vi.fn().mockRejectedValueOnce(new Error("waking")).mockResolvedValue(Response.json({ model_ready: true, semantic_ready: true }));
    expect(await checkHealth({ send, read, fetcher, now: NOW })).toEqual([]);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("mails the day's problems once, in plain words, and the capacity warning at most once a week", async () => {
    const { send, read, fetcher, hash } = day({ items: 4500, [OPS + "backup-health"]: null });
    const mail = vi.fn();
    expect(await watchHealth({ send, read, fetcher, mail, now: NOW })).toEqual({ problems: ["backup", "capacity"], mailed: true });
    const sent = mail.mock.calls[0][0];
    expect(sent.subject).toBe("问问立正每日体检：2件事要看一下");
    expect(sent.text).toContain("1. 没有找到每日备份的记录");
    expect(sent.key).toBe(`ask-health:${beijingDay(NOW)}:backup,capacity`);
    expect(hash.get("capacity_mailed_at")).toBe(String(NOW));
    // The next day, the same full feed is not mentioned again; the backup still is.
    const next = await watchHealth({ send, read, fetcher, mail, now: NOW + 24 * HOUR });
    expect(next.problems).toContain("backup");
    expect(next.problems).not.toContain("capacity");
    expect(hash.get(HEALTH_KEY)).toBeUndefined();
    expect(healthMail([{ key: "x", title: "t", detail: "d" }], "2026-10-16").text).toContain("修好后第二天就不再提");
  });
});
