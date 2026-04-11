import { guestVideoMetadata } from "./guest-video-metadata";

export const SITE_URL = "https://www.lizheng.ai";
export const GUESTS_DATA_URL =
  "https://raw.githubusercontent.com/sunyuzheng/kedaibiao-content-tools/main/guests.json";
// Guest roster source of truth:
// - kedaibiao-content-tools/guests.json
//
// Episode title source of truth:
// - local kedaibiao-channel/tools/youtube/all_videos_full.json
// - fallback: YouTube oEmbed for IDs missing from local metadata
//
// Deployed snapshot used by this repo:
// - shared/guest-video-metadata.ts
//
// See docs/guest-data.md for the full update workflow.

export interface RawGuestEpisode {
  video_id?: string;
  videoId?: string;
  title?: string;
  url?: string;
}

export interface RawGuest {
  guest_name: string;
  guest_en_name: string;
  guest_title: string;
  guest_company: string;
  xiaohongshu_url?: string;
  linkedin_url?: string;
  primary_video_id: string;
  all_video_ids: string[];
  max_views: number;
  thumbnail_url: string;
  primary_url: string;
  episode_count: number;
  all_urls: string[];
  slug?: string;
  episodes?: RawGuestEpisode[];
}

export interface RawVideoMetadata {
  video_id: string;
  title?: string;
  published_at?: string;
  view_count?: number | string;
}

export interface GuestEpisode {
  videoId: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  publishedAt?: string;
  viewCount?: number;
  isPrimary: boolean;
  index: number;
}

export interface GuestProfile {
  guest_name: string;
  guest_en_name: string;
  guest_title: string;
  guest_company: string;
  xiaohongshu_url?: string;
  linkedin_url?: string;
  primary_video_id: string;
  max_views: number;
  thumbnail_url: string;
  primary_url: string;
  episode_count: number;
  all_video_ids: string[];
  all_urls: string[];
  slug: string;
  share_url: string;
  episodes: GuestEpisode[];
  primary_episode: GuestEpisode;
}

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
}

function toNumber(value?: number | string): number | undefined {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function fallbackEpisodeTitle(index: number): string {
  return `第 ${index + 1} 期`;
}

function buildVideoLookup(
  videos: readonly RawVideoMetadata[]
): Map<string, RawVideoMetadata> {
  return new Map(videos.map(video => [video.video_id, video]));
}

function slugifyText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function buildGuestSlug(rawGuest: RawGuest, usedSlugs: Set<string>): string {
  const preferredBase =
    rawGuest.slug?.trim() ||
    slugifyText(rawGuest.guest_en_name || "") ||
    slugifyText(rawGuest.guest_name || "") ||
    `guest-${rawGuest.primary_video_id.toLowerCase()}`;

  let candidate = preferredBase;
  if (usedSlugs.has(candidate)) {
    candidate = `${preferredBase}-${rawGuest.primary_video_id.toLowerCase()}`;
  }

  let suffix = 2;
  while (usedSlugs.has(candidate)) {
    candidate = `${preferredBase}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(candidate);
  return candidate;
}

function buildGuestEpisode(
  rawGuest: RawGuest,
  videoId: string,
  index: number,
  videoLookup: Map<string, RawVideoMetadata>
): GuestEpisode {
  const explicitEpisode = rawGuest.episodes?.find(
    episode => (episode.video_id || episode.videoId) === videoId
  );
  const videoMeta = videoLookup.get(videoId);
  const title =
    explicitEpisode?.title?.trim() ||
    videoMeta?.title?.trim() ||
    fallbackEpisodeTitle(index);
  const url =
    explicitEpisode?.url?.trim() ||
    rawGuest.all_urls[index] ||
    `https://www.youtube.com/watch?v=${videoId}`;

  return {
    videoId,
    url,
    title,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    publishedAt: videoMeta?.published_at,
    viewCount: toNumber(videoMeta?.view_count),
    isPrimary: videoId === rawGuest.primary_video_id,
    index,
  };
}

export function buildGuestDirectory(
  rawGuests: RawGuest[],
  videos: RawVideoMetadata[]
): GuestProfile[] {
  const videoLookup = buildVideoLookup(videos);
  const usedSlugs = new Set<string>();

  return rawGuests.map(rawGuest => {
    const slug = buildGuestSlug(rawGuest, usedSlugs);
    const episodes = rawGuest.all_video_ids.map((videoId, index) =>
      buildGuestEpisode(rawGuest, videoId, index, videoLookup)
    );
    const primaryEpisode = episodes.find(episode => episode.isPrimary) ||
      episodes[0] || {
        videoId: rawGuest.primary_video_id,
        url: rawGuest.primary_url,
        title: rawGuest.guest_name,
        thumbnailUrl:
          rawGuest.thumbnail_url ||
          `https://img.youtube.com/vi/${rawGuest.primary_video_id}/mqdefault.jpg`,
        isPrimary: true,
        index: 0,
      };

    return {
      ...rawGuest,
      episode_count: episodes.length,
      slug,
      share_url: `${SITE_URL}/guests/${slug}`,
      episodes,
      primary_episode: primaryEpisode,
    };
  });
}

async function fetchJson<T>(url: string, fetchImpl: typeof fetch): Promise<T> {
  const response = await fetchImpl(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchGuestDirectory(
  fetchImpl: typeof fetch = fetch
): Promise<GuestProfile[]> {
  const rawGuests = await fetchJson<RawGuest[]>(GUESTS_DATA_URL, fetchImpl);
  return buildGuestDirectory(rawGuests, [...guestVideoMetadata]);
}

export function getGuestsPageMeta(guests: GuestProfile[]): PageMeta {
  const totalGuests = guests.length;
  const totalEpisodes = guests.reduce(
    (sum, guest) => sum + guest.episode_count,
    0
  );
  const topCompanies = [
    ...new Set(
      guests
        .slice(0, 30)
        .map(guest => guest.guest_company)
        .filter(Boolean)
    ),
  ]
    .slice(0, 6)
    .join("、");

  return {
    title: `全部嘉宾 · 课代表立正 — ${totalGuests}位科技领袖访谈`,
    description: `课代表立正访谈过的 ${totalGuests} 位嘉宾，${totalEpisodes} 期对话，涵盖 ${topCompanies} 等顶级科技公司的领袖、创始人与投资人。`,
    canonical: `${SITE_URL}/guests`,
    ogImage: `${SITE_URL}/profile.jpg`,
  };
}

export function getGuestPageMeta(guest: GuestProfile): PageMeta {
  const leadTitles = guest.episodes
    .slice(0, 3)
    .map(episode => `《${episode.title}》`)
    .join("、");
  const companyAndTitle = [guest.guest_company, guest.guest_title]
    .filter(Boolean)
    .join(" · ");
  const descriptionParts = [
    `${guest.guest_name}${companyAndTitle ? `，${companyAndTitle}` : ""}。`,
    `课代表立正共收录 ${guest.episode_count} 期相关访谈。`,
    leadTitles ? `代表内容包括 ${leadTitles}。` : "",
  ].filter(Boolean);

  return {
    title: `${guest.guest_name} · 课代表立正`,
    description: descriptionParts.join(" "),
    canonical: guest.share_url,
    ogImage: guest.primary_episode.thumbnailUrl || guest.thumbnail_url,
  };
}
