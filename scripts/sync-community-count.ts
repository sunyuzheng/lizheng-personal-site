// Reads today's member count from the community map's published data and writes it into
// shared/community-count.generated.ts, so the pages built next say the current number.
// Runs at the start of `pnpm build`. It never fails the build: when the data cannot be read
// or looks wrong, the committed count stays.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CITY_DATA_URL } from "../shared/community-facts";
import { COMMUNITY_MEMBER_COUNT } from "../shared/community-count.generated";

const TARGET = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../shared/community-count.generated.ts"
);
const TIMEOUT_MS = 8000;

/** The count to use, or why not. A count may only grow, and not by half in one step. */
export function acceptCount(
  current: number,
  data: unknown
): { count: number; asOf: string } | { reason: string } {
  const { count, generatedAt } = (data ?? {}) as {
    count?: unknown;
    generatedAt?: unknown;
  };
  if (typeof count !== "number" || !Number.isInteger(count))
    return { reason: "no member count in the data" };
  if (typeof generatedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(generatedAt))
    return { reason: "no date in the data" };
  if (count < current) return { reason: `${count} is below the committed ${current}` };
  if (count > current * 1.5)
    return { reason: `${count} is more than half again the committed ${current}` };
  return { count, asOf: generatedAt };
}

async function main() {
  let data: unknown;
  try {
    const response = await fetch(CITY_DATA_URL, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.log(
      `   成员数：读不到社区地图的数据（${String(error)}），沿用 ${COMMUNITY_MEMBER_COUNT}`
    );
    return;
  }

  const result = acceptCount(COMMUNITY_MEMBER_COUNT, data);
  if ("reason" in result) {
    console.log(`   成员数：沿用 ${COMMUNITY_MEMBER_COUNT}（${result.reason}）`);
    return;
  }

  // On a developer's machine the file changes only when the figure the pages show changes
  // (a new thousand), so an ordinary build leaves the working tree clean. A deploy build
  // always takes today's count and date.
  const deploy = Boolean(process.env.VERCEL || process.env.CI);
  const sameThousand =
    Math.floor(result.count / 1000) === Math.floor(COMMUNITY_MEMBER_COUNT / 1000);
  if (!deploy && sameThousand) {
    console.log(`   成员数：${result.count}（页面写法没变，文件不动）`);
    return;
  }

  const source = await readFile(TARGET, "utf8");
  const next = source
    .replace(
      /COMMUNITY_MEMBER_COUNT = \d+;/,
      `COMMUNITY_MEMBER_COUNT = ${result.count};`
    )
    .replace(
      /COMMUNITY_MEMBER_COUNT_AS_OF = "[^"]*";/,
      `COMMUNITY_MEMBER_COUNT_AS_OF = "${result.asOf}";`
    );
  if (next !== source) await writeFile(TARGET, next);
  console.log(`   成员数：${result.count}（${result.asOf}）`);
}

// Only when run directly; tests import acceptCount.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
