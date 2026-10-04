import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError } from "../shared/ask-access.js";
import { watchDatabase, watchMemberChecks } from "../shared/ask-db-watch.js";

// Vercel Cron calls this once a day (vercel.json). With CRON_SECRET set, only the cron may; without
// it, any caller gets the same check, which mails only when the plan changed or member checks reach
// 80% of the month's limit (once a month).
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
    // The member-check count is looked at whatever the plan check does.
    const [database, members] = await Promise.allSettled([watchDatabase(), watchMemberChecks()]);
    if (database.status === "rejected") throw database.reason;
    res.statusCode = 200;
    res.end(JSON.stringify({ result: database.value, members: members.status === "fulfilled" ? members.value : "unavailable" }));
  } catch (error) {
    const failure = error instanceof AccessError ? error : new AccessError("watch_unavailable");
    res.statusCode = failure.status;
    res.end(JSON.stringify({ code: failure.code }));
  }
}
