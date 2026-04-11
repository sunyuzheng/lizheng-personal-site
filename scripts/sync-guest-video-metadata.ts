import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GUESTS_DATA_URL =
  "https://raw.githubusercontent.com/sunyuzheng/kedaibiao-content-tools/main/guests.json";

interface LocalVideoMetadata {
  video_id: string;
  title?: string;
  published_at?: string;
  view_count?: number | string;
}

interface RemoteGuest {
  all_video_ids: string[];
  all_urls?: string[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_CONTENT_REPO_DIR =
  process.env.KEDAIBIAO_CHANNEL_DIR ||
  "/Users/sunyuzheng/Desktop/AI/content/kedaibiao-channel";
const LOCAL_VIDEO_METADATA_PATH = path.join(
  DEFAULT_CONTENT_REPO_DIR,
  "guest_video_metadata.json"
);
const LOCAL_GUESTS_PATH = path.join(DEFAULT_CONTENT_REPO_DIR, "guests.json");
const OUTPUT_PATH = path.join(ROOT, "shared", "guest-video-metadata.ts");
const ROSTER_OUTPUT_PATH = path.join(ROOT, "shared", "guest-roster-snapshot.ts");

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

function extractYouTubeVideoId(url: string): string | undefined {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0];
    }

    if (
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "m.youtube.com"
    ) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v") || undefined;
      }

      if (
        parsed.pathname.startsWith("/shorts/") ||
        parsed.pathname.startsWith("/embed/")
      ) {
        return parsed.pathname.split("/").filter(Boolean)[1];
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getRequiredGuestVideoIds(guests: RemoteGuest[]): string[] {
  const requiredIds: string[] = [];
  const seen = new Set<string>();

  for (const guest of guests) {
    for (const url of guest.all_urls || []) {
      const videoId = extractYouTubeVideoId(url);
      if (!videoId || seen.has(videoId)) continue;
      seen.add(videoId);
      requiredIds.push(videoId);
    }

    for (const videoId of guest.all_video_ids || []) {
      if (!videoId || seen.has(videoId)) continue;
      seen.add(videoId);
      requiredIds.push(videoId);
    }
  }

  return requiredIds;
}

async function main() {
  assertFileExists(LOCAL_VIDEO_METADATA_PATH);
  assertFileExists(LOCAL_GUESTS_PATH);

  const localVideos = JSON.parse(
    fs.readFileSync(LOCAL_VIDEO_METADATA_PATH, "utf8")
  ) as LocalVideoMetadata[];
  const localGuests = JSON.parse(
    fs.readFileSync(LOCAL_GUESTS_PATH, "utf8")
  ) as RemoteGuest[];
  const localVideoById = new Map(
    localVideos.map(video => [video.video_id, video])
  );

  const requiredIds = getRequiredGuestVideoIds(localGuests);

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
  const header = `// AUTO-GENERATED FILE. DO NOT EDIT BY HAND.\n//\n// Upstream source of truth:\n// - Guest roster and episode membership: ${GUESTS_DATA_URL}\n// - Guest page video metadata authority: ${LOCAL_VIDEO_METADATA_PATH}\n// - Fallback for IDs missing in local metadata: YouTube oEmbed\n//\n// Refresh command:\n//   pnpm sync:guest-video-metadata\n\n`;
  const body = `export const guestVideoMetadata = ${JSON.stringify(output, null, 2)} as const;\n`;
  const rosterHeader = `// AUTO-GENERATED FILE. DO NOT EDIT BY HAND.\n//\n// Upstream source of truth:\n// - Guest roster and episode membership: ${LOCAL_GUESTS_PATH}\n// - Canonical published source: ${GUESTS_DATA_URL}\n//\n// Refresh command:\n//   pnpm sync:guest-video-metadata\n\n`;
  const rosterBody = `export const guestRosterSnapshot = ${JSON.stringify(localGuests, null, 2)} as const;\n`;

  fs.writeFileSync(OUTPUT_PATH, header + body, "utf8");
  fs.writeFileSync(ROSTER_OUTPUT_PATH, rosterHeader + rosterBody, "utf8");

  console.log(
    `Wrote ${output.length} guest video metadata records to ${OUTPUT_PATH}`
  );
  console.log(`Wrote ${localGuests.length} guest roster records to ${ROSTER_OUTPUT_PATH}`);
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
