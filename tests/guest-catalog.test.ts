import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { catalogGuestDirectory, validateGuestCatalog, type GuestCatalog, type GuestArticleCatalog } from "../shared/guest-catalog";
import { getGuestsPageMeta } from "../shared/guest-data";
import { loadGuestSnapshot, digest, verifyGuestRelease, writeGuestRelease, type GuestReleasePin } from "../scripts/sync-guests";

function fixture(): { catalog: GuestCatalog; articles: GuestArticleCatalog } {
  return { catalog: { schema_version: 1, entities: [{ entity_id: "guest:alpha", entity_type: "person", display_name: "Synthetic Alpha", aliases: ["Alpha"], slug: "alpha", alias_slugs: ["alpha", "old-alpha"], primary_source_id: "youtube-abcdefghijk", thumbnail_url: "https://example.org/image.jpg", guest_title: "Historical title", guest_company: "Historical company", guest_bio: "Synthetic biography", community_resources: [{ kind: "event", title: "Synthetic resource", url: "https://example.org/resource", summary: "Synthetic metadata" }] }],
    sources: [{ source_id: "youtube-abcdefghijk", video_id: "abcdefghijk", source_type: "youtube", url: "https://www.youtube.com/watch?v=abcdefghijk", title: "Synthetic programme", thumbnail_url: "https://example.org/image.jpg", published_at: "2025-01-01", view_count: 100 }],
    appearances: [{ entity_id: "guest:alpha", source_id: "youtube-abcdefghijk", index: 0, is_primary: true }], redirects: [] },
    articles: { schema_version: 1, articles: [{ id: "article-a", entity_id: "guest:alpha", original_guest_slug: "old-alpha", title: "Synthetic article", summary: "Synthetic metadata", url: "https://example.org/article", source_ids: ["youtube-abcdefghijk"] }] } };
}
const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true }); vi.unstubAllGlobals(); });
function localInput(): { root: string; hash: string } {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "guest-catalog-test-")); dirs.push(root); fs.mkdirSync(path.join(root, "catalog"));
  const { catalog, articles } = fixture();
  const names = { schema_version: 1, generated_from: ["catalog/guests.json"], key_rule: "NFKC, casefold, then drop marks", key_drop: "&()-./_",
    key_examples: [["Leo (Charisma)", "leocharisma"]], speakers: [{ speaker_id: "yuzheng", role: "host", names: [{ name: "立正", key: "立正" }] }],
    names: [{ name: "Alpha", key: "alpha", entity_ids: ["guest:alpha"], kinds: ["alias"] }], qualifiers: {} };
  const files = [["catalog/guests.json", catalog], ["catalog/guest-articles.json", articles], ["catalog/guest-names.json", names]].map(([file, value]) => {
    const blob = JSON.stringify(value); fs.writeFileSync(path.join(root, file as string), blob);
    return { path: file, bytes: Buffer.byteLength(blob), sha256: digest(blob) };
  });
  const blob = JSON.stringify({ schema_version: 3, repository: "sunyuzheng/lizheng-open-context", intended_visibility: "public", files }); fs.writeFileSync(path.join(root, "release-manifest.json"), blob);
  return { root, hash: digest(blob) };
}
describe("single canonical guest catalog", () => {
  it("rejects a snapshot from a different release and manual data edits before build", async () => {
    const { root, hash } = localInput(); const { snapshot } = await loadGuestSnapshot({ contextDir: root, manifestSha256: hash });
    const pin: GuestReleasePin = { schema_version: 2, repository: "sunyuzheng/lizheng-open-context", commit: "a".repeat(40), manifest_sha256: hash, snapshot_sha256: digest(snapshot) };
    verifyGuestRelease(snapshot, pin);
    expect(() => verifyGuestRelease(snapshot, { ...pin, manifest_sha256: "b".repeat(64) })).toThrow("guest_snapshot_manifest_drift");
    expect(() => verifyGuestRelease(snapshot.replace("Synthetic Alpha", "Different Alpha"), pin)).toThrow("guest_snapshot_hash_drift");
    const changed = snapshot.replace(hash, "b".repeat(64));
    expect(() => verifyGuestRelease(changed, { ...pin, snapshot_sha256: digest(changed) })).toThrow("guest_snapshot_manifest_drift");
  });
  it("restores the previous release if installing its pin fails", async () => {
    const { root, hash } = localInput(); const { snapshot } = await loadGuestSnapshot({ contextDir: root, manifestSha256: hash });
    const pin: GuestReleasePin = { schema_version: 2, repository: "sunyuzheng/lizheng-open-context", commit: "a".repeat(40), manifest_sha256: hash, snapshot_sha256: digest(snapshot) };
    const folder = path.join(root, "consumer"); fs.mkdirSync(folder);
    fs.writeFileSync(path.join(folder, "guest-catalog-snapshot.ts"), "old snapshot"); fs.writeFileSync(path.join(folder, "guest-catalog-pin.json"), "old pin");
    const rename = fs.renameSync; const spy = vi.spyOn(fs, "renameSync").mockImplementation((from, to) => {
      if (String(to).endsWith("guest-catalog-pin.json")) throw new Error("synthetic write failure");
      rename(from, to);
    });
    try { expect(() => writeGuestRelease(folder, snapshot, pin)).toThrow("synthetic write failure"); } finally { spy.mockRestore(); }
    expect(fs.readFileSync(path.join(folder, "guest-catalog-snapshot.ts"), "utf8")).toBe("old snapshot");
    expect(fs.readFileSync(path.join(folder, "guest-catalog-pin.json"), "utf8")).toBe("old pin");
    expect(fs.readdirSync(folder).sort()).toEqual(["guest-catalog-pin.json", "guest-catalog-snapshot.ts"]);
    writeGuestRelease(folder, snapshot, pin);
    verifyGuestRelease(fs.readFileSync(path.join(folder, "guest-catalog-snapshot.ts"), "utf8"), JSON.parse(fs.readFileSync(path.join(folder, "guest-catalog-pin.json"), "utf8")));
  });
  it("links a group and the members who have their own page, both ways", () => {
    const { catalog, articles } = fixture();
    const group = { ...catalog.entities[0], entity_id: "guest:duo", entity_type: "group" as const, display_name: "Alpha & Beta", aliases: ["Alpha & Beta"], slug: "duo", alias_slugs: ["duo"],
      members: [{ name: "Alpha", entity_id: "guest:alpha" }, { name: "贝塔", en_name: "Beta" }] };
    const withGroup: GuestCatalog = { ...catalog, entities: [...catalog.entities, group], appearances: [...catalog.appearances, { entity_id: "guest:duo", source_id: "youtube-abcdefghijk", index: 0, is_primary: true }] };
    const [alpha, duo] = catalogGuestDirectory(withGroup, articles);
    expect(duo.members).toEqual([{ name: "Alpha", slug: "alpha" }, { name: "贝塔", en_name: "Beta" }]);
    expect(alpha.member_of).toEqual([{ name: "Alpha & Beta", slug: "duo" }]);
    expect(alpha).not.toHaveProperty("members");
    expect(() => validateGuestCatalog({ ...withGroup, entities: [{ ...catalog.entities[0], members: [] }, group] }, articles)).toThrow("entity_members_only_for_groups");
    expect(() => validateGuestCatalog({ ...withGroup, entities: [catalog.entities[0], { ...group, members: [{ name: "Ghost", entity_id: "guest:ghost" }] }] }, articles)).toThrow("entity_member_reference_invalid");
    expect(() => validateGuestCatalog({ ...withGroup, entities: [catalog.entities[0], { ...group, members: [{ name: "Alpha", role: "host" }] }] }, articles)).toThrow("metadata_fields_invalid");
    // A linked member must list every programme of the group.
    const extra = { ...catalog.sources[0], source_id: "youtube-bbbbbbbbbbb", video_id: "bbbbbbbbbbb", url: "https://www.youtube.com/watch?v=bbbbbbbbbbb" };
    expect(() => validateGuestCatalog({ ...withGroup, sources: [...withGroup.sources, extra], appearances: [...withGroup.appearances, { entity_id: "guest:duo", source_id: extra.source_id, index: 1, is_primary: false }] }, articles)).toThrow("entity_member_appearance_missing");
  });
  it("preserves profile fields and derives links without certifying jobs or speech", () => {
    const { catalog, articles } = fixture(); const before = JSON.stringify(catalog);
    const p = catalogGuestDirectory(catalog, articles)[0];
    expect(p.guest_bio).toBe("Synthetic biography"); expect(p.community_resources).toEqual(catalog.entities[0].community_resources);
    expect(p.alias_slugs).toEqual(["alpha", "old-alpha"]); expect(p).not.toHaveProperty("current_job_certified");
    expect(p.primary_episode).toBe(p.episodes[0]); expect(p.max_views).toBe(100); expect(p).not.toHaveProperty("source_profiles"); expect(JSON.stringify(catalog)).toBe(before);
  });
  it("lists a guest's programmes newest first and keeps the exact featured choice", () => {
    const { catalog, articles } = fixture();
    (catalog.sources as any[]).push({ ...catalog.sources[0], source_id: "youtube-lmnopqrstuv", video_id: "lmnopqrstuv", url: "https://www.youtube.com/watch?v=lmnopqrstuv", view_count: 50, published_at: "2026-01-01" });
    (catalog.appearances as any[]).push({ ...catalog.appearances[0], source_id: "youtube-lmnopqrstuv", index: 1, is_primary: false });
    const p = catalogGuestDirectory(catalog, articles)[0]; expect(p.episodes.map(e => e.viewCount)).toEqual([50, 100]); expect(p.primary_video_id).toBe("abcdefghijk"); expect(p.max_views).toBe(100);
    expect([p.first_year, p.last_year]).toEqual([2025, 2026]);
  });
  it("adds the name table's further names for search and rejects a table with a different key rule", () => {
    const { catalog, articles } = fixture();
    const names = { schema_version: 1 as const, generated_from: [], key_rule: "", key_drop: "&()-./_", key_examples: [["Leo (Charisma)", "leocharisma"]],
      speakers: [], names: [{ name: "Alpha Nickname", key: "alphanickname", entity_ids: ["guest:alpha"], kinds: ["qualifier"] }], qualifiers: {} };
    expect(catalogGuestDirectory(catalog, articles, names)[0].search_names).toEqual(["Alpha Nickname"]);
    expect(() => catalogGuestDirectory(catalog, articles, { ...names, key_drop: "" })).toThrow("name_table_key_rule_mismatch");
    expect(() => catalogGuestDirectory(catalog, articles, { ...names, names: [{ ...names.names[0], entity_ids: ["guest:missing"] }] })).toThrow("name_table_entry_invalid");
  });

  it("allows multiple people to reference one programme without duplicate source copies", () => {
    const f = fixture(); (f.catalog.entities as any[]).push({ ...f.catalog.entities[0], entity_id: "guest:beta", display_name: "Beta", slug: "beta", alias_slugs: ["beta"] });
    (f.catalog.appearances as any[]).push({ ...f.catalog.appearances[0], entity_id: "guest:beta" }); const profiles = catalogGuestDirectory(f.catalog, f.articles); expect(profiles).toHaveLength(2);
    expect(getGuestsPageMeta(profiles).title).toContain("2位嘉宾，1期对谈");
  });
  it.each(["entities", "sources", "appearances"] as const)("rejects duplicated %s", key => { const f = fixture(); (f.catalog[key] as any[]).push(f.catalog[key][0]); expect(() => validateGuestCatalog(f.catalog, f.articles)).toThrow(); });
  it("rejects incomplete references, wrong URL-ID, unknown resource and private payload fields", () => {
    let f = fixture(); f.catalog.appearances = []; expect(() => validateGuestCatalog(f.catalog, f.articles)).toThrow();
    f = fixture(); f.catalog.sources[0].url = "https://www.youtube.com/watch?v=lmnopqrstuv"; expect(() => validateGuestCatalog(f.catalog, f.articles)).toThrow();
    f = fixture(); (f.catalog.entities[0].community_resources![0] as any).kind = "unknown"; expect(() => validateGuestCatalog(f.catalog, f.articles)).toThrow();
    f = fixture(); (f.catalog.entities[0] as any).units = []; expect(() => validateGuestCatalog(f.catalog, f.articles)).toThrow();
  });
  it("rejects unknown article entity, slug or programme", () => { for (const key of ["entity_id", "original_guest_slug", "source_ids"] as const) { const f = fixture(); (f.articles.articles[0] as any)[key] = key === "source_ids" ? ["youtube-lmnopqrstuv"] : "missing"; expect(() => validateGuestCatalog(f.catalog, f.articles)).toThrow(); } });
  it("allows only literal published social HTTP and safe root image paths", () => { const f = fixture(); f.catalog.entities[0].xiaohongshu_url = "http://example.org/public"; f.catalog.entities[0].thumbnail_url = "/guest-media/a.png"; validateGuestCatalog(f.catalog, f.articles); f.catalog.entities[0].thumbnail_url = "/guest-media/../secret"; expect(() => validateGuestCatalog(f.catalog, f.articles)).toThrow(); });
  it("loads exactly the pinned local files without writing or making network requests", async () => {
    const { root, hash } = localInput(); const before = fs.readdirSync(root); const result = await loadGuestSnapshot({ contextDir: root, manifestSha256: hash });
    expect(result.counts).toEqual({ entities: 1, sources: 1, appearances: 1, articles: 1 }); expect(result.snapshot).not.toContain(root); expect(fs.readdirSync(root)).toEqual(before);
  });
  it("reads the fixed public Open Context repository and commit", async () => {
    const { root, hash } = localInput(); const commit = "a".repeat(40);
    const requests: string[] = [];
    vi.stubGlobal("fetch", async (input: string) => {
      const prefix = `https://raw.githubusercontent.com/sunyuzheng/lizheng-open-context/${commit}/`;
      expect(input.startsWith(prefix)).toBe(true); requests.push(input);
      return new Response(fs.readFileSync(path.join(root, input.slice(prefix.length))));
    });
    const result = await loadGuestSnapshot({ commit, manifestSha256: hash });
    expect(result.counts.entities).toBe(1); expect(requests).toHaveLength(8);
  });
  it("rejects manifest/hash drift and missing complete catalog", async () => {
    const { root, hash } = localInput(); await expect(loadGuestSnapshot({ contextDir: root, manifestSha256: "a".repeat(64) })).rejects.toThrow("manifest_hash_drift");
    fs.appendFileSync(path.join(root, "catalog/guests.json"), " "); await expect(loadGuestSnapshot({ contextDir: root, manifestSha256: hash })).rejects.toThrow("catalog_hash_drift");
    const input = localInput(); const file = path.join(input.root, "release-manifest.json"); const d = JSON.parse(fs.readFileSync(file, "utf8")); d.files.pop(); fs.writeFileSync(file, JSON.stringify(d));
    await expect(loadGuestSnapshot({ contextDir: input.root, manifestSha256: digest(fs.readFileSync(file)) })).rejects.toThrow("catalog_missing_from_manifest");
  });
  it("rejects symlink input and moving remote main before external calls", async () => {
    const { root, hash } = localInput(); const link = path.join(root, "alias"); fs.symlinkSync(path.join(root, "catalog"), link); fs.renameSync(path.join(root, "catalog"), path.join(root, "original")); fs.symlinkSync(path.join(root, "original"), path.join(root, "catalog"));
    await expect(loadGuestSnapshot({ contextDir: root, manifestSha256: hash })).rejects.toThrow("symlink");
    await expect(loadGuestSnapshot({ commit: "main", manifestSha256: hash })).rejects.toThrow("immutable_commit");
  });
});
