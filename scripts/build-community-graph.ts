/**
 * Builds the community data, read from Circle once a day
 * (docs/community-graph.md):
 * - graph.json and a picture sheet for city.lizheng.ai and the homepage
 *   window onto it: every Superlinear Academy member, and a line between two
 *   members wherever one has commented on, replied to or liked the other's
 *   post or comment;
 * - city.json for the homepage's dot map, the fallback where the city cannot
 *   be drawn: the same members, most active first.
 *
 *   pnpm community:graph --fetch-only        # refresh the local caches only
 *   pnpm community:graph                     # caches → files, written locally
 *   pnpm community:graph --upload            # … then publish them to Vercel Blob
 *
 * Caches live in --cache-dir (default tmp/community-graph, git-ignored):
 * members.json (read in full from the Admin API about once a week, topped up
 * with new members on every run; --refresh-members reads it in full now),
 * interactions.ndjson with a read cursor (Data API, read
 * incrementally; --seed=a.ndjson,b.ndjson imports minimized
 * circle-data-analytics exports first so a new cache need not reread
 * history), and avatars/ (one small square per profile picture).
 *
 * Reads CIRCLE_ADMIN_API, CIRCLE_DATA_API and, for --upload,
 * BLOB_READ_WRITE_TOKEN from the environment, .env or .env.local. The Data
 * API is separate from the Admin API's monthly cap; it allows 600 requests a
 * minute and returns 2,000 events per request.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { buildAtlas } from "./community/avatars";
import {
  BLOB_DIR,
  publishFile,
  publishJson,
  readPublished,
  removeOthers,
} from "./community/blob";
import {
  fetchMembers,
  fetchNewMembers,
  InteractionCache,
  type MemberRecord,
} from "./community/circle";
import { toCityFile, type CityFile } from "./community/city";
import { buildGraph, ringLayout, type Built } from "./community/graph";
import { toGraphFile, type GraphFile } from "./community/output";

const DAY = 24 * 60 * 60 * 1000;

const args = new Map(
  process.argv.slice(2).map(arg => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value] as const;
  })
);
const cacheDir = path.resolve(args.get("cache-dir") ?? "tmp/community-graph");
const outDir = path.resolve(args.get("out-dir") ?? "client/public/community");

interface MembersCache {
  /** When the list was last brought up to date, and last read in full. */
  fetchedAt: number;
  fullAt?: number;
  members: MemberRecord[];
}

/**
 * The member list, read in full from the Admin API about once a week
 * (ceil(members / 100) requests) and topped up daily with whoever joined
 * since (usually one request). A list that has drifted from Circle's count
 * (people leaving) is read in full again. Without a token the cache is used
 * as it is.
 */
async function loadMembers(): Promise<MemberRecord[]> {
  const file = path.join(cacheDir, "members.json");
  const token = process.env.CIRCLE_ADMIN_API?.trim();
  const save = (cache: MembersCache) => {
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(cache));
  };
  if (fs.existsSync(file) && !args.has("refresh-members")) {
    const cached = JSON.parse(fs.readFileSync(file, "utf8")) as MembersCache;
    const fullAt = cached.fullAt ?? cached.fetchedAt;
    const day = (time: number) => new Date(time).toISOString().slice(0, 10);
    if (!token) {
      console.log(
        `Members: ${cached.members.length} from cache (${day(cached.fetchedAt)})`
      );
      return cached.members;
    }
    if (Date.now() - fullAt < 7 * DAY) {
      const known = new Set(cached.members.map(member => member.id));
      const { added, count } = await fetchNewMembers(token, known);
      const members = [...added, ...cached.members];
      if (Math.abs(members.length - count) <= Math.max(20, count * 0.002)) {
        console.log(
          `Members: ${members.length} (${added.length} new since ${day(cached.fetchedAt)}; full read ${day(fullAt)}; Circle counts ${count})`
        );
        save({ fetchedAt: Date.now(), fullAt, members });
        return members;
      }
      console.log(
        `Members: the list has ${members.length}, Circle counts ${count}; reading in full.`
      );
    }
  }
  if (!token)
    throw new Error("Set CIRCLE_ADMIN_API (Circle Admin API v2 token) first.");
  fs.mkdirSync(cacheDir, { recursive: true });
  const members = await fetchMembers(
    token,
    Number(args.get("max-admin-requests") ?? 300),
    path.join(cacheDir, "members.progress.json")
  );
  save({ fetchedAt: Date.now(), fullAt: Date.now(), members });
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

function write(name: string, data: unknown) {
  const json = JSON.stringify(data);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, name), json);
  const compressed = zlib.brotliCompressSync(Buffer.from(json)).length;
  console.log(
    `Wrote ${path.relative(process.cwd(), path.join(outDir, name))} (${(Buffer.byteLength(json) / 1024).toFixed(0)} KB, ${(compressed / 1024).toFixed(0)} KB compressed)`
  );
  return json;
}

/**
 * Publishes the picture sheet first (under a new name whenever it changes,
 * so a cached page never pairs new data with an old sheet), then the graph
 * and the dot map's file, refusing data much smaller than what is online.
 * Sheets older than the one just replaced are deleted.
 */
async function publish(
  graph: { json: string; file: GraphFile },
  city: { json: string; file: CityFile }
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error("Set BLOB_READ_WRITE_TOKEN to upload.");
  const graphPath = `${BLOB_DIR}/graph.json`;
  const cityPath = `${BLOB_DIR}/city.json`;
  const online = await readPublished<GraphFile>(graphPath, token);
  const { file } = graph;
  if (
    online &&
    !args.has("force") &&
    (file.count < online.count * 0.9 ||
      file.pairs.b.length < online.pairs.b.length * 0.9)
  ) {
    throw new Error(
      `New data has ${file.count} members and ${file.pairs.b.length} pairs; online has ${online.count} and ${online.pairs.b.length}. Use --force if this is right.`
    );
  }
  if (file.avatars) {
    await publishFile(
      `${BLOB_DIR}/${file.avatars.file}`,
      fs.readFileSync(path.join(outDir, file.avatars.file)),
      "image/webp",
      token
    );
  }
  const sameAs =
    (made: { count: number; generatedAt: string }) =>
    (published: { count: number; generatedAt: string }) =>
      published.count === made.count &&
      published.generatedAt === made.generatedAt;
  await publishJson(graphPath, graph.json, token, sameAs(file));
  await publishJson(cityPath, city.json, token, sameAs(city.file));
  // Pages that loaded the previous graph within the hour may still ask for
  // its sheet, so that one stays until the next run.
  const keep = [file.avatars?.file, online?.avatars?.file]
    .filter(Boolean)
    .map(name => `${BLOB_DIR}/${name}`);
  if (keep.length) {
    const removed = await removeOthers(`${BLOB_DIR}/avatars-`, keep, token);
    if (removed) console.log(`Removed ${removed} older picture sheets`);
  }
}

async function main() {
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
  const city = toCityFile(members, now);
  // The two files describe the same members on the same day.
  city.generatedAt = file.generatedAt;
  const graphJson = write("graph.json", file);
  const cityJson = write("city.json", city);
  if (args.has("upload"))
    await publish({ json: graphJson, file }, { json: cityJson, file: city });
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
