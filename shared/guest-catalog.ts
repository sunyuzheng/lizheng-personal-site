import type { GuestEpisode, GuestProfile, GuestCommunityResource } from "./guest-data";
import type { GuestEntityType } from "./guest-identity";
import { compareGuestEpisodesByDate } from "./guest-episode-order";

export interface GuestEntity {
  entity_id: string; entity_type: GuestEntityType; display_name: string;
  aliases: readonly string[]; slug: string; alias_slugs: readonly string[];
  primary_source_id: string; thumbnail_url: string;
  guest_en_name?: string; guest_title?: string; guest_company?: string;
  guest_bio?: string; guest_bio_en?: string; interview_date?: string;
  xiaohongshu_url?: string; linkedin_url?: string; youtube_playlist_url?: string;
  community_resources?: readonly GuestCommunityResource[];
  /** A group's members; a member with their own page links to it by entity_id. */
  members?: readonly GuestMember[];
}
export interface GuestMember { name: string; en_name?: string; entity_id?: string }
export interface GuestSource {
  source_id: string; video_id: string | null; source_type: "youtube" | "circle";
  url: string; title: string; thumbnail_url: string;
  published_at?: string; view_count?: number; metadata_verified_at?: string;
}
export interface GuestAppearance { entity_id: string; source_id: string; index: number; is_primary: boolean }
export interface GuestCatalog {
  schema_version: 1; entities: readonly GuestEntity[]; sources: readonly GuestSource[];
  appearances: readonly GuestAppearance[];
  redirects: readonly { from_entity_id: string; canonical_entity_id: string }[];
}
export interface GuestArticle {
  id: string; entity_id: string; original_guest_slug: string; title: string; summary: string;
  url: string; source_ids: readonly string[]; source_urls?: readonly string[];
  takeaways?: readonly string[]; read_time_minutes?: number;
}
export interface GuestArticleCatalog { schema_version: 1; articles: readonly GuestArticle[] }
/** Open Context's generated name table (catalog/guest-names.json): every name that finds a person. */
export interface GuestNameTable {
  schema_version: 1; generated_from: readonly string[]; key_rule: string; key_drop: string;
  key_examples: readonly (readonly string[])[];
  speakers: readonly { speaker_id: string; role: string; names: readonly { name: string; key: string }[] }[];
  names: readonly { name: string; key: string; entity_ids: readonly string[]; kinds: readonly string[] }[];
  qualifiers: Readonly<Record<string, readonly { name: string; key: string }[]>>;
}
/** A name's key, by the table's rule: NFKC, lower case, then without whitespace and the listed marks. */
export function nameKey(text: string, drop: string): string {
  return [...text.normalize("NFKC").toLowerCase()].filter(char => !/\s/u.test(char) && !drop.includes(char)).join("");
}
export function validateGuestNameTable(value: unknown, catalog: GuestCatalog): asserts value is GuestNameTable {
  record(value); keys(value, ["schema_version", "generated_from", "key_rule", "key_drop", "key_examples", "speakers", "names", "qualifiers"]);
  requireValue(value.schema_version === 1 && typeof value.key_drop === "string" && Array.isArray(value.names) && Array.isArray(value.key_examples), "name_table_invalid");
  for (const example of value.key_examples) requireValue(Array.isArray(example) && nameKey(example[0], value.key_drop) === example[1], "name_table_key_rule_mismatch");
  const entities = new Set(catalog.entities.map(e => e.entity_id));
  const seen = new Set<string>();
  for (const row of value.names) {
    record(row);
    requireValue(typeof row.name === "string" && typeof row.key === "string" && row.key === nameKey(row.name, value.key_drop) && !seen.has(row.key)
      && Array.isArray(row.entity_ids) && row.entity_ids.length > 0 && row.entity_ids.every((id: unknown) => typeof id === "string" && entities.has(id)), "name_table_entry_invalid");
    seen.add(row.key);
  }
  record(value.qualifiers);
  for (const id of Object.keys(value.qualifiers)) requireValue(entities.has(id), "name_table_qualifier_invalid");
}
const TYPES = new Set(["person", "group", "virtual-character", "anonymous-label", "unresolved"]);
const ENTITY = /^guest:[a-z0-9][a-z0-9-]*$/;
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const VIDEO = /^[A-Za-z0-9_-]{11}$/;
function requireValue(value: unknown, code: string): asserts value { if (!value) throw new Error(code); }
function record(value: unknown): asserts value is Record<string, any> {
  requireValue(value !== null && typeof value === "object" && !Array.isArray(value), "metadata_object_required");
}
function keys(value: Record<string, any>, required: string[], optional: string[] = []): void {
  requireValue(required.every(k => Object.prototype.hasOwnProperty.call(value, k)) && Object.keys(value).every(k => [...required, ...optional].includes(k)), "metadata_fields_invalid");
}
function stringList(value: unknown): asserts value is string[] {
  requireValue(Array.isArray(value) && value.every(v => typeof v === "string" && v.length > 0) && new Set(value).size === value.length, "metadata_strings_invalid");
}
function safeUrl(value: unknown, image = false, social = false): void {
  requireValue(typeof value === "string" && value.length > 0 && !/[\s\\]/.test(value), "metadata_url_invalid");
  if (image && value.startsWith("/")) {
    requireValue(!value.startsWith("//") && !value.split("/").includes("..") && !/[?#]/.test(value), "metadata_image_path_invalid"); return;
  }
  const url = new URL(value);
  requireValue((url.protocol === "https:" || (social && url.protocol === "http:")) && !url.username && !url.password && !url.hash && (!url.port || url.port === "443"), "metadata_url_invalid");
}
function youtubeId(value: unknown): string {
  safeUrl(value); const u = new URL(value as string);
  const id = u.hostname === "youtu.be" ? u.pathname.slice(1) :
    ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(u.hostname) && u.pathname === "/watch" && u.searchParams.getAll("v").length === 1 ? u.searchParams.get("v") : null;
  requireValue(id && VIDEO.test(id), "source_url_id_invalid"); return id;
}
function count(value: unknown): void { requireValue(typeof value === "number" && Number.isFinite(value) && value >= 0, "metadata_count_invalid"); }

export function validateGuestCatalog(value: unknown, articleValue: unknown): asserts value is GuestCatalog {
  record(value); keys(value, ["schema_version", "entities", "sources", "appearances", "redirects"]);
  requireValue(value.schema_version === 1 && [value.entities, value.sources, value.appearances, value.redirects].every(Array.isArray), "catalog_schema_invalid");
  const entities = new Map<string, GuestEntity>(), sources = new Map<string, GuestSource>(), slugs = new Map<string, string>();
  for (const e of value.entities) {
    record(e); keys(e, ["entity_id", "entity_type", "display_name", "aliases", "slug", "alias_slugs", "primary_source_id", "thumbnail_url"],
      ["guest_en_name", "guest_title", "guest_company", "guest_bio", "guest_bio_en", "interview_date", "xiaohongshu_url", "linkedin_url", "youtube_playlist_url", "community_resources", "members"]);
    requireValue(typeof e.entity_id === "string" && ENTITY.test(e.entity_id) && !entities.has(e.entity_id) && TYPES.has(e.entity_type) && typeof e.display_name === "string" && e.display_name.length > 0 && typeof e.primary_source_id === "string", "entity_identity_invalid");
    stringList(e.aliases); stringList(e.alias_slugs);
    requireValue(typeof e.slug === "string" && SLUG.test(e.slug) && e.alias_slugs.includes(e.slug), "entity_slug_invalid");
    for (const slug of e.alias_slugs) { requireValue(SLUG.test(slug) && !slugs.has(slug), "entity_slug_duplicate"); slugs.set(slug, e.entity_id); }
    for (const key of ["guest_en_name", "guest_title", "guest_company", "guest_bio", "guest_bio_en", "interview_date"]) if (key in e) requireValue(typeof e[key] === "string", "entity_string_invalid");
    for (const key of ["xiaohongshu_url", "linkedin_url", "youtube_playlist_url"]) if (key in e) safeUrl(e[key], false, true);
    safeUrl(e.thumbnail_url, true);
    requireValue(e.community_resources === undefined || Array.isArray(e.community_resources), "entity_resources_invalid");
    for (const r of e.community_resources || []) { record(r); keys(r, ["kind", "title", "url", "summary"], ["author"]);
      requireValue(["guest_post", "student_resource", "event"].includes(r.kind) && Object.values(r).every(v => typeof v === "string"), "resource_invalid"); safeUrl(r.url); }
    entities.set(e.entity_id, e as unknown as GuestEntity);
  }
  for (const e of entities.values()) {
    if (e.entity_type !== "group") { requireValue(e.members === undefined, "entity_members_only_for_groups"); continue; }
    // Open Context requires members on every group; a snapshot from before it declared them has none.
    requireValue(e.members === undefined || Array.isArray(e.members), "entity_group_members_invalid");
    const names = new Set<string>();
    for (const m of (e.members || []) as unknown[]) {
      record(m); keys(m, ["name"], ["en_name", "entity_id"]);
      requireValue(Object.values(m).every(v => typeof v === "string" && v.length > 0 && v.trim() === v) && !names.has(m.name), "entity_member_invalid");
      names.add(m.name);
      if (m.entity_id !== undefined) requireValue(entities.get(m.entity_id)?.entity_type === "person", "entity_member_reference_invalid");
    }
  }
  for (const s of value.sources) {
    record(s); keys(s, ["source_id", "video_id", "source_type", "url", "title", "thumbnail_url"], ["published_at", "view_count", "metadata_verified_at"]);
    requireValue(typeof s.source_id === "string" && !sources.has(s.source_id) && typeof s.title === "string" && s.title.length > 0, "source_identity_invalid");
    safeUrl(s.url); safeUrl(s.thumbnail_url, true);
    requireValue(s.source_type === "youtube" ? typeof s.video_id === "string" && VIDEO.test(s.video_id) && s.source_id === `youtube-${s.video_id}` && youtubeId(s.url) === s.video_id : s.source_type === "circle" && s.video_id === null && s.source_id === s.url, "source_url_id_mismatch");
    for (const key of ["published_at", "metadata_verified_at"]) if (key in s) requireValue(typeof s[key] === "string" && s[key].length > 0, "source_date_invalid");
    if ("view_count" in s) count(s.view_count); sources.set(s.source_id, s as unknown as GuestSource);
  }
  const pairs = new Set<string>(), covered = new Set<string>(), primaries = new Set<string>();
  for (const r of value.appearances) {
    record(r); keys(r, ["entity_id", "source_id", "index", "is_primary"]);
    const pair = `${r.entity_id}\n${r.source_id}`, entity = entities.get(r.entity_id);
    requireValue(entity && sources.has(r.source_id) && !pairs.has(pair) && Number.isSafeInteger(r.index) && r.index >= 0 && typeof r.is_primary === "boolean" && r.is_primary === (entity.primary_source_id === r.source_id), "appearance_reference_invalid");
    if (r.is_primary) { requireValue(!primaries.has(r.entity_id), "appearance_primary_duplicate"); primaries.add(r.entity_id); }
    pairs.add(pair); covered.add(r.source_id);
  }
  requireValue(primaries.size === entities.size && covered.size === sources.size, "catalog_coverage_incomplete");
  for (const e of entities.values()) for (const m of e.members || []) {
    if (m.entity_id === undefined) continue;
    for (const pair of pairs) if (pair.startsWith(`${e.entity_id}\n`)) requireValue(pairs.has(`${m.entity_id}\n${pair.slice(e.entity_id.length + 1)}`), "entity_member_appearance_missing");
  }
  const redirects = new Set<string>();
  for (const r of value.redirects) { record(r); keys(r, ["from_entity_id", "canonical_entity_id"]);
    requireValue(typeof r.from_entity_id === "string" && ENTITY.test(r.from_entity_id) && !entities.has(r.from_entity_id) && entities.has(r.canonical_entity_id) && !redirects.has(r.from_entity_id), "catalog_redirect_invalid"); redirects.add(r.from_entity_id); }
  record(articleValue); keys(articleValue, ["schema_version", "articles"]);
  requireValue(articleValue.schema_version === 1 && Array.isArray(articleValue.articles), "article_schema_invalid");
  const ids = new Set<string>(), urls = new Set<string>();
  for (const a of articleValue.articles) {
    record(a); keys(a, ["id", "entity_id", "original_guest_slug", "title", "summary", "url", "source_ids"], ["source_urls", "takeaways", "read_time_minutes"]);
    requireValue(typeof a.id === "string" && a.id.length > 0 && !ids.has(a.id) && !urls.has(a.url) && entities.has(a.entity_id) && slugs.get(a.original_guest_slug) === a.entity_id && typeof a.title === "string" && typeof a.summary === "string", "article_identity_invalid");
    safeUrl(a.url); stringList(a.source_ids); requireValue(a.source_ids.every(s => pairs.has(`${a.entity_id}\n${s}`)), "article_source_invalid");
    for (const key of ["source_urls", "takeaways"]) if (key in a) stringList(a[key]);
    for (const u of a.source_urls || []) { safeUrl(u); requireValue(a.source_ids.some((sid: string) => sources.get(sid)?.url === u), "article_source_url_mismatch"); } if ("read_time_minutes" in a) count(a.read_time_minutes);
    ids.add(a.id); urls.add(a.url);
  }
}

/** Programme relationships aid discovery; they never assign any transcript turn. */
export function catalogGuestDirectory(catalog: GuestCatalog, articles: GuestArticleCatalog, names?: GuestNameTable): GuestProfile[] {
  validateGuestCatalog(catalog, articles);
  if (names) validateGuestNameTable(names, catalog);
  // The extra names a reader may search by: the name before a parenthetical, nicknames, group members.
  const searchNames = new Map<string, string[]>();
  for (const row of names?.names || []) for (const id of row.entity_ids) searchNames.set(id, [...(searchNames.get(id) || []), row.name]);
  const sources = new Map(catalog.sources.map(s => [s.source_id, s]));
  const byId = new Map(catalog.entities.map(e => [e.entity_id, e]));
  // Groups each person belongs to, so a member's page can point back to the group.
  const memberOf = new Map<string, GuestEntity[]>();
  for (const group of catalog.entities) for (const m of group.members || []) {
    if (m.entity_id) memberOf.set(m.entity_id, [...(memberOf.get(m.entity_id) || []), group]);
  }
  return catalog.entities.map(entity => {
    const rows = catalog.appearances.filter(r => r.entity_id === entity.entity_id);
    const episodes: GuestEpisode[] = rows.map(r => { const s = sources.get(r.source_id)!; return {
      videoId: s.video_id, sourceType: s.source_type, url: s.url, title: s.title, thumbnailUrl: s.thumbnail_url,
      ...(s.published_at === undefined ? {} : { publishedAt: s.published_at }),
      ...(s.view_count === undefined ? {} : { viewCount: s.view_count }), isPrimary: r.is_primary, index: r.index,
    }; }).sort(compareGuestEpisodesByDate);
    const primary = episodes.find(e => e.isPrimary)!;
    const years = episodes.flatMap(e => e.publishedAt ? [new Date(e.publishedAt).getUTCFullYear()] : []).filter(Number.isFinite);
    const views = [...episodes.flatMap(e => e.viewCount === undefined ? [] : [e.viewCount])];
    const { display_name, primary_source_id: _primary, members: declared, ...profile } = entity;
    const members = (declared || []).map(m => {
      const person = m.entity_id ? byId.get(m.entity_id) : undefined;
      return { name: m.name, ...(m.en_name ? { en_name: m.en_name } : {}), ...(person ? { slug: person.slug } : {}) };
    });
    const groups = (memberOf.get(entity.entity_id) || []).map(g => ({ name: g.display_name, ...(g.guest_en_name ? { en_name: g.guest_en_name } : {}), slug: g.slug }));
    return { ...profile, guest_name: display_name, guest_en_name: entity.guest_en_name || "", guest_title: entity.guest_title || "", guest_company: entity.guest_company || "",
      primary_video_id: primary.videoId, primary_source_type: primary.sourceType,
      ...(primary.sourceType === "circle" ? { primary_source_title: primary.title, primary_source_published_at: primary.publishedAt } : {}),
      max_views: views.length ? Math.max(...views) : null, primary_url: primary.url, episode_count: episodes.length,
      all_video_ids: episodes.flatMap(e => e.videoId ? [e.videoId] : []), all_urls: episodes.map(e => e.url),
      share_url: `https://www.lizheng.ai/guests/${entity.slug}`, episodes, primary_episode: primary,
      search_names: [...new Set(searchNames.get(entity.entity_id) || [])],
      ...(entity.entity_type === "group" ? { members } : {}),
      ...(groups.length ? { member_of: groups } : {}),
      ...(years.length ? { first_year: Math.min(...years), last_year: Math.max(...years) } : {}),
    };
  });
}
