import type { GuestProfile } from "./guest-data";
import { compareGuestEpisodesByViews } from "./guest-episode-order";

export type GuestEntityType = "person" | "group" | "virtual-character" | "anonymous-label" | "unresolved";
export interface GuestIdentityBinding {
  source_guest_name: string;
  entity_id: string;
  entity_type: GuestEntityType;
  display_name: string;
  aliases: readonly string[];
  current_job_certified: false;
}
export interface GuestIdentityOverlay {
  schema_version: 1;
  source_bindings: readonly GuestIdentityBinding[];
  redirects: readonly { from_entity_id: string; canonical_entity_id: string; from_slug: string; canonical_slug: string }[];
  profile_aliases: readonly { entity_id: string; from_slug: string; canonical_slug: string; evidence_sha256: string }[];
  new_public_entities: readonly Omit<GuestIdentityBinding, "source_guest_name">[];
  programme_additions: readonly { entity_id: string; video_id: string; title: string; published_at: string; source_url: string }[];
}

const TYPES = new Set<GuestEntityType>(["person", "group", "virtual-character", "anonymous-label", "unresolved"]);
const VIDEO = /^[A-Za-z0-9_-]{11}$/;
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
function requireValue(value: unknown, code: string): asserts value {
  if (!value) throw new Error(code);
}
const unique = <T,>(values: readonly T[]): T[] => [...new Set(values)];

/** Explicit programme membership only; this never assigns speech or certifies a current job. */
export function applyGuestIdentityOverlay(profiles: GuestProfile[], overlay: GuestIdentityOverlay): GuestProfile[] {
  requireValue(overlay.schema_version === 1, "identity_schema_invalid");
  requireValue(new Set(profiles.map(p => p.slug)).size === profiles.length &&
    profiles.every(p => /^[\p{L}\p{N}][\p{L}\p{N}-]*$/u.test(p.slug)), "profile_slug_conflict");
  requireValue(new Set(profiles.map(p => p.guest_name)).size === profiles.length, "profile_name_conflict");
  const bindings = new Map(overlay.source_bindings.map(b => [b.source_guest_name, b]));
  requireValue(bindings.size === overlay.source_bindings.length && bindings.size === profiles.length, "binding_coverage_invalid");
  for (const row of [...overlay.source_bindings, ...overlay.new_public_entities]) {
    requireValue(/^guest:[a-z0-9][a-z0-9-]*$/.test(row.entity_id) && TYPES.has(row.entity_type) &&
      typeof row.display_name === "string" && row.display_name.length > 0 && row.current_job_certified === false &&
      Array.isArray(row.aliases) && row.aliases.every(x => typeof x === "string" && x.length > 0), "identity_metadata_invalid");
  }
  const bySlug = new Map(profiles.map(p => [p.slug, p]));
  const redirectSlugs = new Set<string>();
  for (const row of overlay.redirects) {
    const from = bySlug.get(row.from_slug), to = bySlug.get(row.canonical_slug);
    requireValue(from && to && from !== to && SLUG.test(row.from_slug) && SLUG.test(row.canonical_slug) &&
      row.from_entity_id !== row.canonical_entity_id && !redirectSlugs.has(row.from_slug), "redirect_identity_invalid");
    requireValue(bindings.get(from.guest_name)?.entity_id === row.canonical_entity_id &&
      bindings.get(to.guest_name)?.entity_id === row.canonical_entity_id &&
      bindings.get(from.guest_name)?.entity_type === bindings.get(to.guest_name)?.entity_type, "redirect_binding_mismatch");
    redirectSlugs.add(row.from_slug);
  }
  for (const row of overlay.profile_aliases) {
    const from = bySlug.get(row.from_slug), to = bySlug.get(row.canonical_slug);
    requireValue(from && to && from !== to && !redirectSlugs.has(row.from_slug) &&
      SLUG.test(row.from_slug) && SLUG.test(row.canonical_slug) && /^[a-f0-9]{64}$/.test(row.evidence_sha256) &&
      bindings.get(from.guest_name)?.entity_id === row.entity_id && bindings.get(to.guest_name)?.entity_id === row.entity_id &&
      bindings.get(from.guest_name)?.entity_type === bindings.get(to.guest_name)?.entity_type, "profile_alias_binding_invalid");
    redirectSlugs.add(row.from_slug);
  }
  const presentations = [...overlay.redirects, ...overlay.profile_aliases];
  requireValue(presentations.every(r => !redirectSlugs.has(r.canonical_slug)), "redirect_chain_invalid");
  const result = profiles.filter(p => !redirectSlugs.has(p.slug)).map(profile => {
    const binding = bindings.get(profile.guest_name);
    requireValue(binding, "binding_identity_missing");
    const sources = [profile, ...presentations.filter(r => r.canonical_slug === profile.slug).map(r => bySlug.get(r.from_slug)!)];
    const sourceBindings = sources.map(p => bindings.get(p.guest_name)!);
    const episodes = sources.flatMap(p => p.episodes).filter((episode, index, all) =>
      all.findIndex(x => x.videoId === episode.videoId && x.url === episode.url && x.title === episode.title && x.publishedAt === episode.publishedAt) === index);
    const resources = sources.flatMap(p => p.community_resources || []).filter((resource, index, all) =>
      all.findIndex(x => JSON.stringify(x) === JSON.stringify(resource)) === index);
    return {
      ...profile, guest_name: binding.display_name, entity_id: binding.entity_id, entity_type: binding.entity_type,
      aliases: unique(sources.flatMap((p, i) => [p.guest_name, p.guest_en_name, ...sourceBindings[i].aliases]).filter(Boolean)),
      alias_slugs: sources.map(p => p.slug), source_profiles: sources,
      historical_source_labels: sources.map(p => ({ source_slug: p.slug, title: p.guest_title, company: p.guest_company })),
      current_job_certified: false as const, episodes, episode_count: episodes.length,
      max_views: sources.some(p => p.max_views != null) ? Math.max(...sources.map(p => p.max_views ?? -1)) : null,
      all_video_ids: unique(sources.flatMap(p => p.all_video_ids)), all_urls: unique(sources.flatMap(p => p.all_urls)),
      community_resources: resources,
    };
  });
  const usedIds = new Set(profiles.map(p => bindings.get(p.guest_name)?.entity_id));
  for (const row of overlay.new_public_entities) {
    const slug = row.entity_id.slice("guest:".length);
    requireValue(!usedIds.has(row.entity_id) && !bySlug.has(slug) && SLUG.test(slug), "new_entity_conflict");
    usedIds.add(row.entity_id);
    const additions = overlay.programme_additions.filter(p => p.entity_id === row.entity_id);
    requireValue(additions.length > 0, "new_entity_programme_missing");
    const first = additions[0];
    const episode = { videoId: first.video_id, sourceType: "youtube" as const, url: first.source_url, title: first.title,
      thumbnailUrl: `https://img.youtube.com/vi/${first.video_id}/mqdefault.jpg`, publishedAt: first.published_at, isPrimary: true, index: 0 };
    result.push({
      guest_name: row.display_name, guest_en_name: "", guest_title: "", guest_company: "", primary_video_id: first.video_id,
      primary_source_type: "youtube", max_views: null, thumbnail_url: episode.thumbnailUrl, primary_url: episode.url,
      slug, share_url: `https://www.lizheng.ai/guests/${slug}`, entity_id: row.entity_id, entity_type: row.entity_type,
      aliases: [...row.aliases], alias_slugs: [slug], source_profiles: [], historical_source_labels: [], current_job_certified: false,
      episodes: [], episode_count: 0, all_video_ids: [], all_urls: [], primary_episode: episode, community_resources: [],
    });
  }
  const additionPairs = new Set<string>();
  for (const row of overlay.programme_additions) {
    const key = `${row.entity_id}/${row.video_id}`;
    requireValue(!additionPairs.has(key) && VIDEO.test(row.video_id) && typeof row.title === "string" && row.title.length > 0 &&
      typeof row.published_at === "string" && row.published_at.length > 0 &&
      row.source_url === `https://www.youtube.com/watch?v=${row.video_id}`, "programme_addition_invalid");
    additionPairs.add(key);
    const targets = result.filter(p => p.entity_id === row.entity_id);
    requireValue(targets.length > 0, "programme_entity_missing");
    for (const profile of targets) {
      // Existing title, URL, date and primary choice always win; additions fill absent programmes only.
      if (!profile.episodes.some(p => p.videoId === row.video_id)) {
        profile.episodes.push({ videoId: row.video_id, sourceType: "youtube", url: row.source_url, title: row.title,
          thumbnailUrl: `https://img.youtube.com/vi/${row.video_id}/mqdefault.jpg`, publishedAt: row.published_at,
          isPrimary: profile.source_profiles.length === 0 && profile.episodes.length === 0, index: profile.episodes.length });
      }
      profile.all_video_ids = unique([...profile.all_video_ids, row.video_id]);
      profile.all_urls = unique([...profile.all_urls, row.source_url]);
      profile.episode_count = profile.episodes.length;
    }
  }
  const resolvedSlugs = result.flatMap(p => p.alias_slugs);
  requireValue(new Set(resolvedSlugs).size === resolvedSlugs.length, "alias_slug_conflict");
  for (const profile of result) {
    profile.episodes.sort(compareGuestEpisodesByViews);
    const knownViews = [profile.max_views, ...profile.episodes.map(p => p.viewCount)]
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    profile.max_views = knownViews.length ? Math.max(...knownViews) : null;
  }
  return result;
}

/** Exact old slug only. No nickname/name guessing and no new route from private aliases. */
export function resolveGuestProfile(profiles: GuestProfile[], slug: string): GuestProfile | undefined {
  return profiles.find(p => p.slug === slug || p.alias_slugs?.includes(slug));
}

export function guestSchemaType(guest: Pick<GuestProfile, "entity_type">): "Person" | "Thing" {
  return guest.entity_type === "person" ? "Person" : "Thing";
}
