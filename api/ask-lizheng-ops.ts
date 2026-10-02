import type { IncomingMessage, ServerResponse } from "node:http";
import {
  AccessError,
  requireOpsOwner,
  sameOrigin,
} from "../shared/ask-access.js";
import {
  opsRange,
  opsRecords,
  opsSummary,
  type OpsSummary,
  type OpsTotals,
} from "../shared/ask-ops-reader.js";
import {
  deleteOpsRecord,
  opsRecords as archiveRecords,
  opsSummary as archiveSummary,
} from "../shared/ask-ops-storage.js";

function normalizeTotals(row: Record<string, unknown>): OpsTotals {
  return {
    questions: Number(row.questions),
    question_chars: Number(row.question_chars),
    completed: Number(row.completed),
    duration_ms: Number(row.duration_ms),
    status: {
      answered: Number(row.answered),
      clarify: Number(row.clarify),
      unsupported: Number(row.unsupported),
      "sources-only": Number(row["sources-only"]),
      error: Number(row.error),
      cancelled: Number(row.cancelled),
      generating: Number(row.generating),
    },
  };
}
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  res.setHeader("Cache-Control", "no-store, no-transform");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Vary", "Cookie");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    if (req.headers.host !== "www.lizheng.ai")
      throw new AccessError("invalid_origin", 403);
    const url = new URL(req.url || "/", "https://www.lizheng.ai");
    if (url.origin !== "https://www.lizheng.ai")
      throw new AccessError("invalid_origin", 403);
    if (req.headers.origin && req.headers.origin !== "https://www.lizheng.ai")
      throw new AccessError("invalid_origin", 403);
    const headers = new Headers();
    for (const name of ["cookie", "origin"])
      if (typeof req.headers[name] === "string")
        headers.set(name, req.headers[name]);
    const request = new Request(url, { method: req.method || "GET", headers });
    const owner = await requireOpsOwner(request);
    const action =
      url.searchParams.get("__route") || url.pathname.split("/").at(-1);
    if (
      !["session", "summary", "records", "export", "delete"].includes(
        action || ""
      )
    )
      throw new AccessError("invalid_request", 400);
    const dataset = url.searchParams.get("dataset") || "legacy";
    if (!["archive", "legacy"].includes(dataset))
      throw new AccessError("invalid_request", 400);
    let result: unknown;
    if (action === "delete") {
      if (req.method !== "POST")
        throw new AccessError("method_not_allowed", 405);
      sameOrigin(request);
      if (dataset !== "archive") throw new AccessError("invalid_request", 400);
      result = await deleteOpsRecord(url.searchParams.get("record_id") || "");
    } else {
      if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        throw new AccessError("method_not_allowed", 405);
      }
      if (action === "session")
        result = {
          owner: true,
          email: owner.email,
          retention_days: 30,
          archive_retention: "until_deleted",
        };
      else {
        const range = opsRange(url.searchParams.get("range") ?? "7");
        if (action === "summary") {
          if (dataset === "legacy") result = await opsSummary(range);
          else {
            const summary = await archiveSummary(range);
            result = {
              totals: normalizeTotals(summary.totals),
              daily: summary.daily.map(row => ({
                ...normalizeTotals(row),
                date: row.day,
              })),
              generated_at: summary.generated_at,
              visitors: summary.visitors,
              conversations: summary.conversations,
              truncated: false,
            } satisfies OpsSummary;
          }
        } else if (dataset === "legacy")
          result = await opsRecords(
            range,
            action === "export" ? 100 : 25,
            url.searchParams.has("cursor")
              ? url.searchParams.get("cursor")!
              : undefined
          );
        else
          result = {
            ...(await archiveRecords(
              range,
              url.searchParams.get("cursor"),
              10,
              action === "records"
                ? url.searchParams.get("conversation") || undefined
                : undefined
            )),
            truncated: false,
          };
      }
    }
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (error) {
    const failure =
      error instanceof AccessError
        ? error
        : new AccessError("ops_read_unavailable");
    res.statusCode = failure.status;
    res.end(JSON.stringify({ code: failure.code }));
  }
}
