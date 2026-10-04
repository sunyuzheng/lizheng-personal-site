import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError } from "../shared/ask-access.js";
import { watchDatabase } from "../shared/ask-db-watch.js";

// Vercel Cron calls this once a day (vercel.json). With CRON_SECRET set, only the cron may; without
// it, any caller gets the same check, which mails only when the plan changed.
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
    const result = await watchDatabase();
    res.statusCode = 200;
    res.end(JSON.stringify({ result }));
  } catch (error) {
    const failure = error instanceof AccessError ? error : new AccessError("watch_unavailable");
    res.statusCode = failure.status;
    res.end(JSON.stringify({ code: failure.code }));
  }
}
