import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GUESTS_DATA_URL } from "../shared/guest-data.ts";

interface LocalVideoMetadata {
  video_id: string;
  title?: string;
  published_at?: string;
  view_count?: number | string;
}

interface RemoteGuest {
  all_video_ids: string[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_CONTENT_REPO_DIR =
  process.env.KEDAIBIAO_CHANNEL_DIR ||
  "/Users/sunyuzheng/Desktop/AI/content/kedaibiao-channel";
const LOCAL_VIDEO_METADATA_PATH = path.join(
  DEFAULT_CONTENT_REPO_DIR,
  "tools",
  "youtube",
  "all_videos_full.json"
);
const OUTPUT_PATH = path.join(ROOT, "shared", "guest-video-metadata.ts");

function assertFileExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
}

function toNumber(value?: number | string): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchOEmbedTitle(videoId: string): Promise<string> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const response = await fetch(url);
  if (!response.ok) return "";

  const payload = (await response.json()) as { title?: string };
  return payload.title?.trim() || "";
}

async function main() {
  assertFileExists(LOCAL_VIDEO_METADATA_PATH);

  const localVideos = JSON.parse(
    fs.readFileSync(LOCAL_VIDEO_METADATA_PATH, "utf8")
  ) as LocalVideoMetadata[];
  const localVideoById = new Map(
    localVideos.map(video => [video.video_id, video])
  );

  const guests = await fetchJson<RemoteGuest[]>(GUESTS_DATA_URL);
  const requiredIds = [
    ...new Set(guests.flatMap(guest => guest.all_video_ids)),
  ];

  const output: LocalVideoMetadata[] = [];
  for (const videoId of requiredIds) {
    const localVideo = localVideoById.get(videoId);
    let title = localVideo?.title?.trim() || "";

    if (!title) {
      title = await fetchOEmbedTitle(videoId);
    }

    output.push({
      video_id: videoId,
      title,
      published_at: localVideo?.published_at || "",
      view_count: toNumber(localVideo?.view_count),
    });
  }

  const missingTitles = output.filter(video => !video.title);
  const header = `// AUTO-GENERATED FILE. DO NOT EDIT BY HAND.\n//\n// Upstream source of truth:\n// - Guest roster and episode membership: ${GUESTS_DATA_URL}\n// - Video title authority: ${LOCAL_VIDEO_METADATA_PATH}\n// - Fallback for IDs missing in local metadata: YouTube oEmbed\n//\n// Refresh command:\n//   pnpm sync:guest-video-metadata\n\n`;
  const body = `export const guestVideoMetadata = ${JSON.stringify(output, null, 2)} as const;\n`;

  fs.writeFileSync(OUTPUT_PATH, header + body, "utf8");

  console.log(
    `Wrote ${output.length} guest video metadata records to ${OUTPUT_PATH}`
  );
  console.log(`Local metadata source: ${LOCAL_VIDEO_METADATA_PATH}`);
  if (missingTitles.length > 0) {
    console.warn(
      `Still missing ${missingTitles.length} titles: ${missingTitles
        .map(video => video.video_id)
        .join(", ")}`
    );
  }
}

await main();
