/**
 * Builds the data for community.lizheng.ai: every Superlinear Academy member,
 * and a line between two members wherever one has commented on, replied to or
 * liked the other's post or comment (docs/community-graph.md).
 *
 *   pnpm community:graph --fetch-only        # refresh the local caches only
 *   pnpm community:graph                     # caches → graph, written locally
 *   pnpm community:graph --upload            # … then publish it to Vercel Blob
 *
 * Caches live in --cache-dir (default tmp/community-graph, git-ignored):
 * members.json (one Admin API read, reused for a week unless
 * --refresh-members), interactions.ndjson with a read cursor (Data API, read
 * incrementally; --seed=a.ndjson,b.ndjson imports minimized
 * circle-data-analytics exports first so a new cache need not reread
 * history), and avatars/ (one small square per profile picture).
 *
 * --min-age-days=N skips the run (no Circle requests) while the published
 * graph is younger than N days, as the homepage map's build does.
 *
 * Reads CIRCLE_ADMIN_API, CIRCLE_DATA_API and, for --upload,
 * BLOB_READ_WRITE_TOKEN from the environment, .env or .env.local. The Data
 * API is separate from the Admin API's monthly cap; it allows 600 requests a
 * minute and returns 2,000 events per request.
 */
import { BlobNotFoundError, head, put } from "@vercel/blob";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { buildAtlas } from "./community/avatars";
import {
  fetchMembers,
  InteractionCache,
  type MemberRecord,
} from "./community/circle";
import { buildGraph, ringLayout, type Built } from "./community/graph";
import { toGraphFile, type GraphFile } from "./community/output";

const DAY = 24 * 60 * 60 * 1000;
const BLOB_DIR = "community";

const args = new Map(
  process.argv.slice(2).map(arg => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value] as const;
  })
);
const cacheDir = path.resolve(args.get("cache-dir") ?? "tmp/community-graph");
const outDir = path.resolve(args.get("out-dir") ?? "client/public/community");

async function loadMembers(): Promise<MemberRecord[]> {
  const file = path.join(cacheDir, "members.json");
  if (fs.existsSync(file) && !args.has("refresh-members")) {
    const cached = JSON.parse(fs.readFileSync(file, "utf8")) as {
      fetchedAt: number;
      members: MemberRecord[];
    };
    if (Date.now() - cached.fetchedAt < 7 * DAY) {
      console.log(
        `Members: ${cached.members.length} from cache (${new Date(cached.fetchedAt).toISOString().slice(0, 10)})`
      );
      return cached.members;
    }
  }
  const token = process.env.CIRCLE_ADMIN_API?.trim();
  if (!token)
    throw new Error("Set CIRCLE_ADMIN_API (Circle Admin API v2 token) first.");
  fs.mkdirSync(cacheDir, { recursive: true });
  const members = await fetchMembers(
    token,
    Number(args.get("max-admin-requests") ?? 300),
    path.join(cacheDir, "members.progress.json")
  );
  fs.writeFileSync(file, JSON.stringify({ fetchedAt: Date.now(), members }));
  return members;
}

async function loadInteractions() {
  const cache = new InteractionCache(cacheDir);
  const seed = args.get("seed");
  if (seed) await cache.seed(seed.split(",").map(file => path.resolve(file)));
  if (!args.has("skip-events")) {
    const token = process.env.CIRCLE_DATA_API?.trim();
    if (!token)
      throw new Error("Set CIRCLE_DATA_API (Circle Data API token) first.");
    await cache.pull(token, Number(args.get("max-data-requests") ?? 3000));
  }
  console.log(`Interactions: ${cache.items.length} (through ${cache.cursor})`);
  return cache.items;
}

function report(built: Built) {
  const ties = [0, 0, 0, 0];
  let staffPairs = 0;
  for (const pair of built.pairs) {
    ties[pair.tie]++;
    if (built.staff.has(pair.a) || built.staff.has(pair.b)) staffPairs++;
  }
  console.log(
    `${built.order.length} members · ${built.active} connected · ${built.pairs.length} pairs (点赞之交 ${ties[1]}, 聊过几句 ${ties[2]}, 常来常往 ${ties[3]}) · ${built.staff.size} staff · ${((1 - staffPairs / Math.max(1, built.pairs.length)) * 100).toFixed(1)}% between members`
  );
  console.log("Not counted:", built.dropped);
}

/** Connected members with a picture, most connected first, as page indices. */
function avatarCandidates(built: Built, joinOrder: number[]) {
  const strength = new Float64Array(built.order.length);
  for (const pair of built.pairs) {
    const weight = pair.likes + 3 * pair.comments;
    strength[pair.a] += weight;
    strength[pair.b] += weight;
  }
  const pageIndex = new Int32Array(built.order.length);
  joinOrder.forEach((member, k) => (pageIndex[member] = k));
  return built.order
    .map((member, i) => ({ i, member }))
    .filter(
      ({ i, member }) => i < built.active && /^https:\/\//.test(member.avatar)
    )
    .sort((a, b) => strength[b.i] - strength[a.i])
    .map(({ i, member }) => ({ index: pageIndex[i], avatar: member.avatar }));
}

function write(file: GraphFile) {
  const json = JSON.stringify(file);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "graph.json"), json);
  const compressed = zlib.brotliCompressSync(Buffer.from(json)).length;
  console.log(
    `Wrote ${path.relative(process.cwd(), path.join(outDir, "graph.json"))} (${(Buffer.byteLength(json) / 1024).toFixed(0)} KB, ${(compressed / 1024).toFixed(0)} KB compressed)`
  );
  return json;
}

// Publishes the picture sheet first (under a new name each time, so a cached
// page never pairs new data with an old sheet), then the graph, refusing a
// graph much smaller than the one online, and reads the graph back.
async function publish(json: string, file: GraphFile) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error("Set BLOB_READ_WRITE_TOKEN to upload.");
  const graphPath = `${BLOB_DIR}/graph.json`;
  try {
    const current = await head(graphPath, { token });
    const online = (await (
      await fetch(`${current.url}?check=${Date.now()}`)
    ).json()) as GraphFile;
    const shrank =
      file.count < online.count * 0.9 ||
      file.pairs.b.length < online.pairs.b.length * 0.9;
    if (shrank && !args.has("force")) {
      throw new Error(
        `New data has ${file.count} members and ${file.pairs.b.length} pairs; online has ${online.count} and ${online.pairs.b.length}. Use --force if this is right.`
      );
    }
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) throw error;
  }
  if (file.avatars) {
    await put(
      `${BLOB_DIR}/${file.avatars.file}`,
      fs.readFileSync(path.join(outDir, file.avatars.file)),
      {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "image/webp",
        cacheControlMaxAge: 31536000,
        token,
      }
    );
  }
  const blob = await put(graphPath, json, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 3600,
    token,
  });
  // An overwrite can take up to a minute to reach the CDN.
  for (let attempt = 0; attempt < 8; attempt++) {
    if (attempt) await new Promise(resolve => setTimeout(resolve, 15000));
    const published = (await (
      await fetch(`${blob.url}?check=${Date.now()}`)
    ).json()) as GraphFile;
    if (
      published.count === file.count &&
      published.generatedAt === file.generatedAt
    ) {
      console.log(`Published ${blob.url}`);
      return;
    }
  }
  throw new Error(
    `Uploaded, but ${blob.url} still shows the old data after two minutes.`
  );
}

// Days since the published graph was generated (Infinity if none yet).
async function publishedAgeDays() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error("Set BLOB_READ_WRITE_TOKEN to check the age.");
  try {
    const current = await head(`${BLOB_DIR}/graph.json`, { token });
    const online = (await (
      await fetch(`${current.url}?check=${Date.now()}`)
    ).json()) as GraphFile;
    return (Date.now() - Date.parse(`${online.generatedAt}T00:00:00Z`)) / DAY;
  } catch (error) {
    if (error instanceof BlobNotFoundError) return Infinity;
    throw error;
  }
}

async function main() {
  const minAgeDays = Number(args.get("min-age-days") ?? 0);
  if (minAgeDays > 0) {
    const age = await publishedAgeDays();
    if (age < minAgeDays) {
      console.log(
        `Published graph is ${age.toFixed(1)} days old (< ${minAgeDays}). Skipping.`
      );
      return;
    }
  }
  const members = await loadMembers();
  const interactions = await loadInteractions();
  if (args.has("fetch-only")) return;
  const now = new Date();
  const built = buildGraph(members, interactions, now);
  report(built);
  const rings = ringLayout(built, {
    iterations: Number(args.get("iterations") ?? 40),
    band: Number(args.get("band") ?? 120),
    inertia: Number(args.get("inertia") ?? 1.5),
    tieWeights: [1, 3, 8],
  });
  const { file, joinOrder } = toGraphFile(built, rings, now);
  if (!args.has("no-avatars")) {
    const atlas = await buildAtlas(avatarCandidates(built, joinOrder), {
      cell: 64,
      max: Number(args.get("avatars") ?? 1024),
      cacheDir,
      outDir,
    });
    if (atlas) file.avatars = atlas;
  }
  const json = write(file);
  if (args.has("upload")) await publish(json, file);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
