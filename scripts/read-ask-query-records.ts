import { AccessError } from "../shared/ask-access.js";
import { readQueryRecords } from "../shared/ask-query-reader.js";

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log("pnpm exec tsx scripts/read-ask-query-records.ts [--limit 1..100] [--include-question]");
    return;
  }
  let limit = 20, includeQuestion = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--include-question") includeQuestion = true;
    else if (args[index] === "--limit" && /^\d+$/.test(args[index + 1] || "")) limit = Number(args[++index]);
    else throw new AccessError("invalid_request", 400);
  }
  // Credentials come only from the owner's explicit process environment.
  // No dotenv/config loading, no endpoint parameters, no public read route.
  console.log(JSON.stringify(await readQueryRecords(limit, includeQuestion)));
}
main().catch(error => {
  const code = error instanceof AccessError ? error.code : "query_read_failed";
  console.error(`Query record read failed (${code}).`);
  process.exitCode = 1;
});
