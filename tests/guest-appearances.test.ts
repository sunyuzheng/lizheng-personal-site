import { afterEach, describe, expect, it, vi } from "vitest";
import {
  appearanceRows,
  appearanceSnapshot,
  loadAppearanceRelease,
  verifyAppearanceRelease,
} from "../scripts/sync-guest-appearances";
import { digest } from "../scripts/sync-guests";

const row = {
  id: "appearance-synthetic",
  show: "Synthetic show",
  title: "合成节目标题",
  title_en: "Synthetic episode title",
  url: "https://example.org/episode",
  published_at: "2026-09-22",
  appearance_format: "guest",
  data_layer: "structured",
  source_type: "guest-appearance-catalog",
  evidence_role: "metadata-only",
  speaker_status: "not-speech",
  yuzheng_stance_weight: "not-evidence",
};
const catalog = JSON.stringify(row) + "\n";
function manifest(source = catalog) {
  return JSON.stringify({
    schema_version: 3,
    repository: "sunyuzheng/lizheng-open-context",
    intended_visibility: "public",
    files: [
      {
        path: "catalog/guest-appearances.jsonl",
        bytes: Buffer.byteLength(source),
        sha256: digest(source),
      },
    ],
  });
}
function remote(source = catalog, release = manifest()) {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url: string) =>
        new Response(url.endsWith("release-manifest.json") ? release : source)
    )
  );
  return { commit: "a".repeat(40), manifestSha256: digest(release) };
}
afterEach(() => vi.unstubAllGlobals());

describe("guest appearances are a generated Open Context projection", () => {
  it("preserves only the existing display fields, including exact titles and optional English titles", () => {
    expect(appearanceRows(catalog)).toEqual([
      {
        date: "2026.09.22",
        show: row.show,
        title: row.title,
        titleEn: row.title_en,
        href: row.url,
        format: "guest",
      },
    ]);
    expect(() => appearanceRows(catalog + catalog)).toThrow("schema_invalid");
    expect(() =>
      appearanceRows(JSON.stringify({ ...row, data_layer: "raw" }))
    ).toThrow("schema_invalid");
  });
  it("binds the immutable release, catalog and generated snapshot hashes", async () => {
    const result = await loadAppearanceRelease(remote());
    expect(result.pin.source_status).toBe("committed-release");
    expect(result.pin.catalog_matches_manifest).toBe(true);
    expect(result.snapshot).toBe(appearanceSnapshot(appearanceRows(catalog)));
    verifyAppearanceRelease(result.snapshot, result.pin);
    expect(() =>
      verifyAppearanceRelease(result.snapshot + " ", result.pin)
    ).toThrow("snapshot_hash_drift");
    expect(() =>
      verifyAppearanceRelease(result.snapshot, {
        ...result.pin,
        catalog_matches_manifest: false,
      })
    ).toThrow("pin_invalid");
    verifyAppearanceRelease(result.snapshot, {
      ...result.pin,
      source_status: "local-draft",
      catalog_matches_manifest: false,
    });
  });
  it("rejects catalog or manifest drift and requires local scope for draft inputs", async () => {
    await expect(
      loadAppearanceRelease(
        remote(catalog.replace(row.title, "改过的合成标题"))
      )
    ).rejects.toThrow("catalog_manifest_mismatch");
    await expect(
      loadAppearanceRelease({ ...remote(), manifestSha256: "b".repeat(64) })
    ).rejects.toThrow("manifest_hash_drift");
    await expect(
      loadAppearanceRelease({ ...remote(), draft: true })
    ).rejects.toThrow("draft_requires_local_source_root");
  });
});
