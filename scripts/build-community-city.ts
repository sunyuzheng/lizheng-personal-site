/**
 * Builds the data for the homepage community map ("我们在建一座城"): one entry
 * per Superlinear Academy member, sorted most active first.
 *
 *   pnpm community:city --dry-run            # 1 request: member count and cost
 *   pnpm community:city                      # full snapshot, written locally
 *   pnpm community:city --upload             # full snapshot, then publish it
 *   pnpm community:city --demo               # no API calls
 *
 * --min-age-days=N skips the run (no Circle requests) while the published
 * snapshot is younger than N days; the monthly schedule uses it so a manual
 * run near the end of a month does not repeat on the 1st.
 *
 * Reads CIRCLE_ADMIN_API (Circle Admin API v2 token) and, for --upload,
 * BLOB_READ_WRITE_TOKEN from the environment, .env or .env.local. A monthly
 * GitHub workflow (.github/workflows/community-city.yml) runs --upload.
 * The Admin API has a monthly request cap shared with other Superlinear tools;
 * a snapshot costs ceil(members / 100) requests and stops at --max-requests.
 *
 * Output (client/public/community/city.json, git-ignored; published to Vercel
 * Blob at community/city.json):
 *   { version, generatedAt, count, heat, linked, names, demo? }
 * - heat[i] is one digit 0–9 per member, from posts × 3 + comments (members
 *   with neither get 0–2 from how recently they visited);
 * - linked[i] is member i's public profile id and names[i] their display name.
 * E-mail addresses, other profile fields, exact counts and visit dates never
 * leave this script.
 */
import { BlobNotFoundError, head, put } from "@vercel/blob";
import fs from "node:fs";
import path from "node:path";

const API = "https://app.circle.so/api/admin/v2";
const PER_PAGE = 100;
const DAY = 24 * 60 * 60 * 1000;
const BLOB_PATH = "community/city.json";

interface Member {
  public_uid?: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  posts_count?: number;
  comments_count?: number;
  last_seen_at?: string | null;
  created_at?: string;
}

interface Entry {
  uid: string;
  name: string;
  score: number;
  heat: number;
  created: number;
}

interface CityFile {
  version: 1;
  generatedAt: string;
  count: number;
  heat: string;
  linked: string[];
  names: string[];
  demo?: true;
}

const args = new Map(
  process.argv.slice(2).map(arg => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value] as const;
  })
);
const outFile = path.resolve(
  args.get("out") ?? "client/public/community/city.json"
);
const maxRequests = Number(args.get("max-requests") ?? 300);
const now = Date.now();

function heatFor(member: Member) {
  const score = (member.posts_count ?? 0) * 3 + (member.comments_count ?? 0);
  if (score > 0) {
    const steps = [3, 10, 30, 100, 300, 1000];
    return { score, heat: 3 + steps.filter(step => score >= step).length };
  }
  const seen = member.last_seen_at ? Date.parse(member.last_seen_at) : 0;
  const heat = now - seen < 30 * DAY ? 2 : now - seen < 180 * DAY ? 1 : 0;
  return { score: 0, heat };
}

// The name members show on their profile. Anything that looks like contact
// details (an e-mail address or a phone number) is left out.
function displayName(member: Member) {
  const raw =
    member.name ||
    [member.first_name, member.last_name].filter(Boolean).join(" ");
  const name = String(raw ?? "")
    .normalize("NFC")
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!name || name.includes("@") || /\d{6,}/.test(name.replace(/[\s-]/g, "")))
    return "";
  return [...name].slice(0, 40).join("");
}

async function request(page: number, token: string) {
  const url = `${API}/community_members?per_page=${PER_PAGE}&page=${page}&status=active`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // Circle rejects requests without a browser-like user agent.
        "User-Agent": "Mozilla/5.0",
      },
    });
    if (response.ok) {
      if (page === 1) {
        // Show any quota headers Circle sends, to keep an eye on the budget.
        for (const [key, value] of response.headers) {
          if (/rate|limit|quota/i.test(key)) console.log(`  ${key}: ${value}`);
        }
      }
      return (await response.json()) as {
        count: number;
        has_next_page: boolean;
        records: Member[];
      };
    }
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`Circle API ${response.status} on page ${page}`);
    }
    await new Promise(resolve => setTimeout(resolve, 2000 * 2 ** attempt));
  }
  throw new Error(`Circle API kept failing on page ${page}`);
}

function build(entries: Entry[], demo = false): CityFile {
  entries.sort(
    (a, b) => b.score - a.score || b.heat - a.heat || a.created - b.created
  );
  const histogram = new Array(10).fill(0);
  for (const entry of entries) histogram[entry.heat]++;
  console.log(
    `${entries.length} members · ${entries.filter(entry => entry.name).length} with a display name · heat histogram ${histogram.join(" ")}`
  );
  return {
    version: 1,
    generatedAt: new Date(now).toISOString().slice(0, 10),
    count: entries.length,
    heat: entries.map(entry => entry.heat).join(""),
    linked: entries.map(entry => entry.uid),
    names: entries.map(entry => entry.name),
    ...(demo ? { demo: true as const } : {}),
  };
}

function write(data: CityFile) {
  const json = JSON.stringify(data);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, json);
  console.log(
    `Wrote ${path.relative(process.cwd(), outFile)} (${(Buffer.byteLength(json) / 1024).toFixed(0)} KB)`
  );
  return json;
}

// Days since the published snapshot was generated (Infinity if none yet).
async function publishedAgeDays() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error("Set BLOB_READ_WRITE_TOKEN to check the age.");
  try {
    const current = await head(BLOB_PATH, { token });
    const online = (await (
      await fetch(`${current.url}?check=${now}`)
    ).json()) as CityFile;
    return (now - Date.parse(`${online.generatedAt}T00:00:00Z`)) / DAY;
  } catch (error) {
    if (error instanceof BlobNotFoundError) return Infinity;
    throw error;
  }
}

// Publishes to Vercel Blob, refusing a snapshot that is much smaller than the
// one already online, then reads the public file back to confirm it changed.
async function publish(json: string, data: CityFile) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error("Set BLOB_READ_WRITE_TOKEN to upload.");
  try {
    const current = await head(BLOB_PATH, { token });
    const online = (await (
      await fetch(`${current.url}?check=${now}`)
    ).json()) as CityFile;
    if (data.count < online.count * 0.9 && !args.has("force")) {
      throw new Error(
        `New snapshot has ${data.count} members, online has ${online.count}. Use --force if this is right.`
      );
    }
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) throw error;
  }
  const blob = await put(BLOB_PATH, json, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 3600,
    token,
  });
  const published = (await (
    await fetch(`${blob.url}?check=${now}`)
  ).json()) as CityFile;
  if (
    published.count !== data.count ||
    published.generatedAt !== data.generatedAt
  ) {
    throw new Error(`Uploaded, but ${blob.url} does not show the new data.`);
  }
  console.log(`Published ${blob.url}`);
}

// Simulated long-tail activity for local design review. Every link opens one
// consenting profile (by default Yuzheng's own), and the page says "demo".
function demo() {
  const count = Number(args.get("count") ?? 24531);
  const profile = args.get("demo-profile") ?? "452cd000";
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const entries: Entry[] = [];
  for (let index = 0; index < count; index++) {
    const active = random() < 0.2;
    const score = active ? Math.floor(1 / Math.pow(random() + 1e-4, 1.25)) : 0;
    const heat = active
      ? heatFor({ posts_count: 0, comments_count: Math.max(1, score) }).heat
      : Math.floor(random() * 3);
    entries.push({ uid: profile, name: "", score, heat, created: index });
  }
  // The most active dot is Yuzheng; everyone else is a numbered placeholder.
  entries.sort((a, b) => b.score - a.score || b.heat - a.heat);
  entries.forEach((entry, index) => {
    entry.created = index;
    entry.name =
      index === 0 ? "立正" : `示例成员${String(index).padStart(5, "0")}`;
  });
  write(build(entries, true));
}

async function main() {
  if (args.has("demo")) return demo();

  const minAgeDays = Number(args.get("min-age-days") ?? 0);
  if (minAgeDays > 0) {
    const age = await publishedAgeDays();
    if (age < minAgeDays) {
      console.log(
        `Published snapshot is ${age.toFixed(1)} days old (< ${minAgeDays}). Skipping.`
      );
      return;
    }
  }

  const token = process.env.CIRCLE_ADMIN_API?.trim();
  if (!token) {
    throw new Error("Set CIRCLE_ADMIN_API (Circle Admin API v2 token) first.");
  }

  const first = await request(1, token);
  const pages = Math.ceil(first.count / PER_PAGE);
  console.log(`${first.count} active members → ${pages} requests needed`);
  if (args.has("dry-run")) return;
  if (pages > maxRequests) {
    throw new Error(
      `Needs ${pages} requests, above --max-requests=${maxRequests}. Reserve budget first.`
    );
  }

  const entries: Entry[] = [];
  const add = (records: Member[]) => {
    for (const member of records) {
      if (!member.public_uid) continue;
      const { score, heat } = heatFor(member);
      entries.push({
        uid: member.public_uid,
        name: displayName(member),
        score,
        heat,
        created: member.created_at ? Date.parse(member.created_at) : 0,
      });
    }
  };
  add(first.records);
  for (let page = 2; page <= pages; page++) {
    const result = await request(page, token);
    add(result.records);
    if (page % 25 === 0) console.log(`  page ${page}/${pages}`);
    await new Promise(resolve => setTimeout(resolve, 250));
    if (!result.has_next_page) break;
  }
  // A short read (an API hiccup mid-way) must not replace a full snapshot.
  if (entries.length < first.count * 0.98) {
    throw new Error(
      `Only ${entries.length} of ${first.count} members came back. Not writing.`
    );
  }

  const data = build(entries);
  const json = write(data);
  if (args.has("upload")) await publish(json, data);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
