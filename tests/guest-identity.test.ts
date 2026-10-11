import { describe, expect, it } from "vitest";
import { applyGuestIdentityOverlay, resolveGuestProfile, type GuestIdentityOverlay } from "../shared/guest-identity";
import { buildGuestDirectory, getGuestPageMeta, type GuestProfile } from "../shared/guest-data";
import { unionGuestInsights } from "../shared/guest-insights";
import { buildGuestStructuredData, buildGuestsListStructuredData } from "../shared/structured-data";

function profile(name: string, slug: string, videoId: string): GuestProfile {
  const episode = { videoId, sourceType: "youtube" as const, url: `https://www.youtube.com/watch?v=${videoId}`,
    title: `Fixture ${slug}`, thumbnailUrl: "https://example.org/image.jpg", isPrimary: true, index: 0 };
  return { guest_name: name, guest_en_name: slug, guest_title: "Historical title", guest_company: "Historical company",
    guest_bio: `Original fixture biography ${slug}`, primary_video_id: videoId, max_views: null,
    thumbnail_url: episode.thumbnailUrl, primary_url: episode.url, episode_count: 1, all_video_ids: [videoId],
    all_urls: [episode.url, `https://example.org/resource/${slug}`], slug, share_url: `https://www.lizheng.ai/guests/${slug}`,
    episodes: [episode], primary_episode: episode, community_resources: [{ kind: "event", title: "Fixture resource",
      url: `https://example.org/resource/${slug}`, summary: "Synthetic metadata" }] };
}
function fixture(): { profiles: GuestProfile[]; overlay: GuestIdentityOverlay } {
  return { profiles: [profile("Alpha", "alpha", "abcdefghijk"), profile("Beta", "beta", "lmnopqrstuv")], overlay: {
    schema_version: 1, source_bindings: ["Alpha", "Beta"].map(source_guest_name => ({ source_guest_name,
      entity_id: "guest:alpha", entity_type: "person", display_name: "Alpha", aliases: [], current_job_certified: false })),
    redirects: [{ from_entity_id: "guest:beta", canonical_entity_id: "guest:alpha", from_slug: "beta", canonical_slug: "alpha" }],
    profile_aliases: [], new_public_entities: [], programme_additions: [],
  } };
}
describe("root-declared identity overlay", () => {
  it("sorts merged programmes by the existing ordering and keeps canonical primary choice", () => {
    const { profiles, overlay } = fixture();
    profiles[0].max_views = 100; profiles[1].max_views = 900;
    profiles[0].episodes[0].viewCount = 100; profiles[1].episodes[0].viewCount = 1000;
    const primary = profiles[0].primary_episode;
    const [result] = applyGuestIdentityOverlay(profiles, overlay);
    expect(result.episodes.map(p => p.viewCount)).toEqual([1000, 100]);
    expect(result.primary_episode).toEqual(primary);
    expect(result.max_views).toBe(1000);
  });
  it("labels old title and company in search metadata as programme records", () => {
    const { profiles, overlay } = fixture();
    const [result] = applyGuestIdentityOverlay(profiles, overlay);
    expect(getGuestPageMeta(result).description).toMatch(/^节目资料中的介绍：/);
  });
  it("preserves every old programme, literal URL, resource and biography source after an explicit merge", () => {
    const { profiles, overlay } = fixture(); const before = JSON.stringify(profiles);
    const [result] = applyGuestIdentityOverlay(profiles, overlay);
    expect(result.episodes.map(p => p.videoId)).toEqual(["abcdefghijk", "lmnopqrstuv"]);
    expect(result.all_urls).toEqual(profiles.flatMap(p => p.all_urls));
    expect(result.community_resources).toEqual(profiles.flatMap(p => p.community_resources || []));
    expect(result.source_profiles).toEqual(profiles);
    expect(result.guest_bio).toBe(profiles[0].guest_bio);
    expect(result.primary_episode).toEqual(profiles[0].primary_episode);
    expect(resolveGuestProfile([result], "beta")).toBe(result);
    expect(resolveGuestProfile([result], "BETA")).toBeUndefined();
    expect(JSON.stringify(profiles)).toBe(before);
  });
  it("does not collapse rows solely because names or stable entity IDs match", () => {
    const { profiles, overlay } = fixture(); overlay.redirects = [];
    expect(applyGuestIdentityOverlay(profiles, overlay)).toHaveLength(2);
  });
  it("allows an explicit same-ID presentation alias without an entity self-loop", () => {
    const { profiles, overlay } = fixture(); overlay.redirects = [];
    overlay.profile_aliases = [{ entity_id: "guest:alpha", from_slug: "beta", canonical_slug: "alpha", evidence_sha256: "a".repeat(64) }];
    expect(applyGuestIdentityOverlay(profiles, overlay)[0].alias_slugs).toEqual(["alpha", "beta"]);
  });
  it("rejects missing bindings, self redirects, undeclared types and alias chains", () => {
    const { profiles, overlay } = fixture();
    expect(() => applyGuestIdentityOverlay(profiles, { ...overlay, source_bindings: overlay.source_bindings.slice(1) })).toThrow();
    expect(() => applyGuestIdentityOverlay(profiles, { ...overlay, redirects: [{ ...overlay.redirects[0], from_slug: "alpha" }] })).toThrow();
    expect(() => applyGuestIdentityOverlay(profiles, { ...overlay, source_bindings: overlay.source_bindings.map(b => ({ ...b, entity_type: "organization" as never })) })).toThrow();
    expect(() => applyGuestIdentityOverlay(profiles, { ...overlay, profile_aliases: [{ entity_id: "guest:alpha", from_slug: "alpha", canonical_slug: "beta", evidence_sha256: "a".repeat(64) }] })).toThrow();
    expect(() => applyGuestIdentityOverlay([{ ...profiles[0], slug: "../escape" }, profiles[1]], overlay)).toThrow();
    expect(() => applyGuestIdentityOverlay([profiles[0], { ...profiles[1], guest_name: "Alpha" }], overlay)).toThrow();
    expect(() => applyGuestIdentityOverlay(profiles, { ...overlay, source_bindings: overlay.source_bindings.map(b => ({ ...b, current_job_certified: true as never })) })).toThrow();
  });
  it("fills only an absent reviewed programme and never overwrites an old title or primary choice", () => {
    const { profiles, overlay } = fixture(); overlay.programme_additions = [
      { entity_id: "guest:alpha", video_id: "abcdefghijk", title: "Replacement not used", published_at: "2026-01-01", source_url: profiles[0].primary_url },
      { entity_id: "guest:alpha", video_id: "ABCDEFGHIJK", title: "New fixture metadata", published_at: "2026-01-01", source_url: "https://www.youtube.com/watch?v=ABCDEFGHIJK" },
    ];
    const [result] = applyGuestIdentityOverlay(profiles, overlay);
    expect(result.episodes.find(p => p.videoId === "abcdefghijk")?.title).toBe("Fixture alpha"); expect(result.episodes).toHaveLength(3);
    expect(result.primary_episode).toEqual(profiles[0].primary_episode);
  });
  it("adds only named public metadata with blank job and biography fields", () => {
    const { profiles, overlay } = fixture(); overlay.new_public_entities = [{ entity_id: "guest:gamma", entity_type: "group",
      display_name: "Gamma fixture", aliases: ["Literal alias"], current_job_certified: false }];
    overlay.programme_additions = [{ entity_id: "guest:gamma", video_id: "ABCDEFGHIJK", title: "Public fixture", published_at: "2026-01-01", source_url: "https://www.youtube.com/watch?v=ABCDEFGHIJK" }];
    const result = applyGuestIdentityOverlay(profiles, overlay).find(p => p.entity_id === "guest:gamma")!;
    expect(result.guest_bio).toBeUndefined(); expect(result.guest_company).toBe(""); expect(result.guest_title).toBe("");
    expect(result.all_video_ids).toEqual(["ABCDEFGHIJK"]);
    expect(() => applyGuestIdentityOverlay(profiles, { ...overlay, programme_additions: [] })).toThrow();
    expect(() => applyGuestIdentityOverlay(profiles, { ...overlay, programme_additions: [...overlay.programme_additions, ...overlay.programme_additions] })).toThrow();
  });
  it("preserves raw resource URLs instead of discarding URLs that are not programmes", () => {
    const p = profile("Alpha", "alpha", "abcdefghijk");
    const [result] = buildGuestDirectory([{ ...p, all_urls: [p.primary_url, "https://example.org/resource"] }], []);
    expect(result.all_urls).toContain("https://example.org/resource");
  });
  it("unions old-slug articles and deduplicates only identical article URLs", () => {
    const article = (id: string, guestSlug: string, url: string) => ({ id, guestSlug, url, status: "published" as const,
      title: "Synthetic article", summary: "Synthetic metadata", sourceVideoIds: ["abcdefghijk"] });
    const result = unionGuestInsights([article("a", "alpha", "https://example.org/a"), article("b", "beta", "https://example.org/b"),
      article("c", "beta", "https://example.org/a"), article("d", "other", "https://example.org/d")], new Set(["alpha", "beta"]));
    expect(result.map(p => p.url)).toEqual(["https://example.org/a", "https://example.org/b"]);
  });
  it.each(["person", "group", "virtual-character", "anonymous-label", "unresolved"] as const)("uses the exact declared %s type and never emits current guest jobs", entity_type => {
    const p = { ...profile("Alpha", "alpha", "abcdefghijk"), entity_type, entity_id: "guest:alpha" };
    const detail = buildGuestStructuredData(p, "Synthetic description");
    const list = buildGuestsListStructuredData([p], "Synthetic description");
    expect(detail.mainEntity["@type"]).toBe(entity_type === "person" ? "Person" : "Thing");
    expect(list.itemListElement[0].item["@type"]).toBe(entity_type === "person" ? "Person" : "Thing");
    for (const value of [detail, list]) {
      expect(JSON.stringify(value)).not.toContain('"jobTitle"'); expect(JSON.stringify(value)).not.toContain('"worksFor"');
    }
    expect(p.guest_title).toBe("Historical title"); expect(p.guest_company).toBe("Historical company");
  });
});
