import { describe, expect, it } from "vitest";
import { resolveGuestProfile } from "../shared/guest-identity";
import { getGuestPageMeta, type GuestProfile } from "../shared/guest-data";
import { unionGuestInsights } from "../shared/guest-insights";
import { buildGuestStructuredData, buildGuestsListStructuredData } from "../shared/structured-data";

function profile(name: string, slug: string, videoId: string): GuestProfile {
  const episode = { videoId, sourceType: "youtube" as const, url: `https://www.youtube.com/watch?v=${videoId}`,
    title: `Fixture ${slug}`, thumbnailUrl: "https://example.org/image.jpg", isPrimary: true, index: 0 };
  return { entity_id: `guest:${slug}`, entity_type: "person", aliases: [name], alias_slugs: [slug], primary_source_type: "youtube",
    guest_name: name, guest_en_name: slug, guest_title: "Historical title", guest_company: "Historical company",
    guest_bio: `Original fixture biography ${slug}`, primary_video_id: videoId, max_views: null,
    thumbnail_url: episode.thumbnailUrl, primary_url: episode.url, episode_count: 1, all_video_ids: [videoId],
    all_urls: [episode.url, `https://example.org/resource/${slug}`], slug, share_url: `https://www.lizheng.ai/guests/${slug}`,
    episodes: [episode], primary_episode: episode, community_resources: [{ kind: "event", title: "Fixture resource",
      url: `https://example.org/resource/${slug}`, summary: "Synthetic metadata" }] };
}
describe("canonical identity presentation", () => {
  it("uses exact alias slugs without guessing a route", () => {
    const p = { ...profile("Alpha", "alpha", "abcdefghijk"), alias_slugs: ["alpha", "old-alpha"] };
    expect(resolveGuestProfile([p], "old-alpha")).toBe(p);
    expect(resolveGuestProfile([p], "OLD-ALPHA")).toBeUndefined();
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
