import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError } from "../shared/ask-access.js";
import { watchDatabase, watchMemberChecks } from "../shared/ask-db-watch.js";
import { watchHealth } from "../shared/ask-health.js";

// Vercel Cron calls this once a day (vercel.json, 04:00 UTC: after Ops' 03:17 backup). With
// CRON_SECRET set, only the cron may; without it, any caller gets the same check, which mails only
// when the plan changed, member checks reach 80% of the month's limit (once a month), or the daily
// check (shared/ask-health.ts) finds something wrong.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      throw new AccessError("method_not_allowed", 405);
    }
    const secret = process.env.CRON_SECRET?.trim();
    if (secret && req.headers.authorization !== `Bearer ${secret}`) throw new AccessError("unauthorized", 401);
    // Each check is looked at whatever the others do.
    const [database, members, health] = await Promise.allSettled([watchDatabase(), watchMemberChecks(), watchHealth()]);
    if (database.status === "rejected") throw database.reason;
    if (health.status === "rejected") console.error("health_check_unavailable", health.reason instanceof Error ? health.reason.message.slice(0, 200) : "unknown");
    res.statusCode = 200;
    res.end(JSON.stringify({ result: database.value, members: members.status === "fulfilled" ? members.value : "unavailable",
      health: health.status === "fulfilled" ? health.value : "unavailable" }));
  } catch (error) {
    const failure = error instanceof AccessError ? error : new AccessError("watch_unavailable");
    res.statusCode = failure.status;
    res.end(JSON.stringify({ code: failure.code }));
  }
}
