import { describe, expect, it } from "vitest";
import { resolveGuestProfile } from "../shared/guest-identity";
import { guestMatchesQuery } from "../shared/guest-search";
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
    episodes: [episode], primary_episode: episode, search_names: [], community_resources: [{ kind: "event", title: "Fixture resource",
      url: `https://example.org/resource/${slug}`, summary: "Synthetic metadata" }] };
}
describe("canonical identity presentation", () => {
  it("filters as people type: word prefixes, members and nicknames, never inside a word", () => {
    expect(guestMatchesQuery(profile("Jo", "jo", "abcdefghijk"), "Jo")).toBe(true);
    expect(guestMatchesQuery(profile("Richard Liu", "richard", "abcdefghijk"), "Rich")).toBe(true);
    expect(guestMatchesQuery(profile("Jo", "jo", "abcdefghijk"), "enjoy")).toBe(false);
    expect(guestMatchesQuery({ ...profile("Synthetic team", "team", "abcdefghijk"), entity_type: "group", aliases: ["Jo"] }, "Jo")).toBe(true);
    const pair = { ...profile("王臻 & Nick", "pair", "abcdefghijk"), entity_type: "group" as const, search_names: ["王臻", "Nick"] };
    expect(guestMatchesQuery(pair, "王臻")).toBe(true);
    expect(guestMatchesQuery(pair, "nick")).toBe(true);
    expect(guestMatchesQuery(profile("硅谷徐老师（Howie Xu）", "howie", "abcdefghijk"), "硅谷 howie")).toBe(true);
  });
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

describe("introductions stay the programmes' own", () => {
  it("labels the introduction in search results and links to Ask Lizheng's 从哪读起", async () => {
    const { getGuestPageMeta, guestAskLink } = await import("../shared/guest-data");
    const p = { ...profile("卢蔚（Cooper）", "lu-wei", "abcdefghijk"), first_year: 2020, last_year: 2025, episode_count: 7 };
    const meta = getGuestPageMeta(p);
    expect(meta.description).toContain("（2020–2025）");
    // Without a quoted introduction the catalog's line is only an "about", never the programmes' words.
    expect(meta.description).toContain("简介：Historical company · Historical title");
    expect(meta.description).not.toContain("节目中的介绍");
    expect(meta.description.startsWith("卢蔚（Cooper）在「课代表立正」")).toBe(true);
    expect(guestAskLink(p)).toBe("https://ask.lizheng.ai/?q=%E5%8D%A2%E8%94%9A%EF%BC%88Cooper%EF%BC%89&mode=find");
    const quoted = getGuestPageMeta({ ...p, introductions: [
      { text: "清华本科，Meta机器学习工程师", quote: "我是清华的本科", title: "Web3是一场白日梦吗？", url: "https://www.youtube.com/watch?v=abcdefghijk&t=30s", year: 2023 }] });
    expect(quoted.description).toContain("2023年节目中的介绍：清华本科，Meta机器学习工程师");
  });
  it("resolves quoted introductions to their programme and time, newest first", async () => {
    const { catalogGuestDirectory } = await import("../shared/guest-catalog");
    const source = (id: string, date: string) => ({ source_id: `youtube-${id}`, video_id: id, source_type: "youtube" as const, url: `https://www.youtube.com/watch?v=${id}`,
      title: `Programme ${id}`, thumbnail_url: "https://example.org/t.jpg", published_at: date });
    const catalog = { schema_version: 1 as const, sources: [source("aaaaaaaaaaa", "2021-01-01"), source("bbbbbbbbbbb", "2024-01-01")],
      entities: [{ entity_id: "guest:alpha", entity_type: "person" as const, display_name: "Alpha", aliases: ["Alpha"], slug: "alpha", alias_slugs: ["alpha"],
        primary_source_id: "youtube-aaaaaaaaaaa", thumbnail_url: "https://example.org/t.jpg",
        introductions: [{ source_id: "youtube-aaaaaaaaaaa", text: "Early role", quote: "early words", locator: ["youtube-aaaaaaaaaaa#cue-2"], start_seconds: 12 },
                        { source_id: "youtube-bbbbbbbbbbb", text: "Later role", quote: "later words", locator: ["youtube-bbbbbbbbbbb#cue-5"], start_seconds: 40 }] }],
      appearances: [{ entity_id: "guest:alpha", source_id: "youtube-aaaaaaaaaaa", index: 0, is_primary: true },
                    { entity_id: "guest:alpha", source_id: "youtube-bbbbbbbbbbb", index: 1, is_primary: false }], redirects: [] };
    const [alpha] = catalogGuestDirectory(catalog, { schema_version: 1, articles: [] });
    expect(alpha.introductions?.map(i => [i.text, i.url, i.year])).toEqual([
      ["Later role", "https://www.youtube.com/watch?v=bbbbbbbbbbb&t=40s", 2024], ["Early role", "https://www.youtube.com/watch?v=aaaaaaaaaaa&t=12s", 2021]]);
    const bad = { ...catalog, entities: [{ ...catalog.entities[0], introductions: [{ ...catalog.entities[0].introductions[0], source_id: "youtube-ccccccccccc" }] }] };
    expect(() => catalogGuestDirectory(bad, { schema_version: 1, articles: [] })).toThrow("entity_introduction_invalid");
  });
});
