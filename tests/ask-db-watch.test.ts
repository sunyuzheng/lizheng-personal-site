import { afterEach, describe, expect, it, vi } from "vitest";
import { DB_WATCH_KEY, planBytes, planSize, sendMail, watchDatabase, watchMail, watchMemberChecks, type Mail } from "../shared/ask-db-watch.js";
import { CIRCLE_MONTHLY_LIMIT, memberBudgetKey } from "../shared/ask-access.js";

const MB256 = 268435456, GB1 = 1073741824;
const info = (bytes: number) => `# Memory\r\nused_memory:334774\r\nused_memory_human:326.928KB\r\nmaxmemory:${bytes}\r\nmaxmemory_human:256.000MB\r\nmaxmemory_policy:noeviction\r\n`;
function store(plan: number, seen?: number) {
  const hash: Record<string, string> = seen ? { plan_bytes: String(seen) } : {};
  const send = vi.fn(async (command: (string | number)[]) => {
    if (command[0] === "INFO") return info(plan);
    if (command[0] === "HGET") return hash[String(command[2])] ?? null;
    if (command[0] === "HSET") { for (let i = 2; i < command.length; i += 2) hash[String(command[i])] = String(command[i + 1]); return 1; }
    throw new Error("unexpected command");
  });
  return { send, hash };
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("the database plan check", () => {
  it("reads the plan's size from INFO memory", () => {
    expect(planBytes(info(MB256))).toBe(MB256);
    expect(planBytes("# Memory\nused_memory:1\n")).toBeNull();
    expect([planSize(MB256), planSize(GB1), planSize(5 * GB1)]).toEqual(["256MB", "1GB", "5GB"]);
  });

  it("says once that it is on, then stays quiet while the plan is the same", async () => {
    const { send, hash } = store(MB256);
    const mail = vi.fn(async (_: Mail) => {});
    expect(await watchDatabase(send, mail)).toBe("started");
    expect(mail).toHaveBeenCalledTimes(1);
    expect(mail.mock.calls[0][0].subject).toBe("问问立正：数据库升级提醒已开启");
    expect(mail.mock.calls[0][0].text).toContain("现在的上限是256MB，每月$10");
    expect(hash.plan_bytes).toBe(String(MB256));
    expect(await watchDatabase(send, mail)).toBe("unchanged");
    expect(mail).toHaveBeenCalledTimes(1);
    // It reads the plan and its own key, nothing else.
    expect(send.mock.calls.every(([command]) => command[0] === "INFO" || command[1] === DB_WATCH_KEY)).toBe(true);
  });

  it("mails when Upstash upgrades the plan, with the new size and price", async () => {
    const { send, hash } = store(GB1, MB256);
    const mail = vi.fn(async (_: Mail) => {});
    expect(await watchDatabase(send, mail)).toBe("upgraded");
    expect(mail.mock.calls[0][0].subject).toBe("问问立正的数据库自动升级了：256MB → 1GB");
    expect(mail.mock.calls[0][0].text).toContain("新的上限是1GB，每月$20");
    expect(hash.plan_bytes).toBe(String(GB1));
    expect(watchMail("changed", GB1, MB256).subject).toBe("问问立正的数据库换了套餐：1GB → 256MB");
  });

  it("tries again tomorrow when the mail does not go out", async () => {
    const { send, hash } = store(GB1, MB256);
    await expect(watchDatabase(send, async () => { throw new Error("down"); })).rejects.toThrow();
    expect(hash.plan_bytes).toBe(String(MB256));
  });

  it("sends from the agent sender to the owner, once per change", async () => {
    vi.stubEnv("ASK_AUTH_EMAIL_API_KEY", "synthetic-key");
    const fetch = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    await sendMail(watchMail("upgraded", MB256, GB1));
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe(`ask-db-watch:${MB256}:${GB1}`);
    expect(JSON.parse(String(init.body))).toMatchObject({ from: "立正 <podcast@notify.lizheng.ai>", to: ["sunyuzheng@gmail.com"], reply_to: "sunyuzheng@gmail.com" });
  });
});

describe("the member-check count", () => {
  const NOW = Date.parse("2026-10-20T01:00:00Z");
  function counts(used: number) {
    const hash: Record<string, string> = {};
    const send = vi.fn(async (command: (string | number)[]) => {
      if (command[0] === "GET" && command[1] === memberBudgetKey("2026-10")) return used ? String(used) : null;
      if (command[0] === "HGET" && command[1] === DB_WATCH_KEY) return hash[String(command[2])] ?? null;
      if (command[0] === "HSET" && command[1] === DB_WATCH_KEY) { hash[String(command[2])] = String(command[3]); return 1; }
      throw new Error("unexpected command");
    });
    return { send, hash };
  }

  it("stays quiet below 80% of the month's limit", async () => {
    const { send } = counts(CIRCLE_MONTHLY_LIMIT * 0.8 - 1);
    const mail = vi.fn(async (_: Mail) => {});
    expect(await watchMemberChecks(send, mail, NOW)).toBe("quiet");
    expect(mail).not.toHaveBeenCalled();
  });

  it("mails once a month from 80%", async () => {
    const { send, hash } = counts(CIRCLE_MONTHLY_LIMIT * 0.8);
    const mail = vi.fn(async (_: Mail) => {});
    expect(await watchMemberChecks(send, mail, NOW)).toBe("mailed");
    expect(await watchMemberChecks(send, mail, NOW + 86_400_000)).toBe("quiet");
    expect(mail).toHaveBeenCalledTimes(1);
    expect(mail.mock.calls[0][0].subject).toBe("问问立正：会员核验本月已查800次（上限1000次）");
    expect(mail.mock.calls[0][0].text).toContain("查过的人照旧按原来的身份");
    expect(hash.member_checks_mailed).toBe("2026-10");
  });
});
