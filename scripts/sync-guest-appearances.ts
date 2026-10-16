import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { digest } from "./sync-guests";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPOSITORY = "sunyuzheng/lizheng-open-context";
const SOURCE = "catalog/guest-appearances.jsonl";
const SNAPSHOT = "shared/guest-appearances-snapshot.ts";
const PIN = "shared/guest-appearances-pin.json";
const HASH = /^[a-f0-9]{64}$/,
  COMMIT = /^[a-f0-9]{40}$/;

export type AppearanceRow = {
  date: string;
  show: string;
  title: string;
  titleEn?: string;
  href: string;
  format: "guest" | "panel";
};
export type AppearancePin = {
  schema_version: 1;
  repository: typeof REPOSITORY;
  source_path: typeof SOURCE;
  source_status: "local-draft" | "committed-release";
  upstream_commit: string;
  manifest_sha256: string;
  catalog_sha256: string;
  catalog_matches_manifest: boolean;
  snapshot_sha256: string;
  row_count: number;
};
function requireValue(value: unknown, code: string): asserts value {
  if (!value) throw new Error(code);
}

export function appearanceRows(catalog: string): AppearanceRow[] {
  const ids = new Set<string>(),
    urls = new Set<string>();
  const rows = catalog
    .split("\n")
    .filter(line => line.trim())
    .map(line => {
      const row = JSON.parse(line);
      requireValue(
        typeof row.id === "string" &&
          row.id &&
          !ids.has(row.id) &&
          row.data_layer === "structured" &&
          row.source_type === "guest-appearance-catalog" &&
          row.evidence_role === "metadata-only" &&
          row.speaker_status === "not-speech" &&
          row.yuzheng_stance_weight === "not-evidence",
        "appearance_catalog_schema_invalid"
      );
      requireValue(
        [row.show, row.title, row.url, row.published_at].every(
          value => typeof value === "string" && value.trim()
        ) &&
          /^\d{4}-\d{2}-\d{2}$/.test(row.published_at.slice(0, 10)) &&
          (row.title_en === undefined ||
            (typeof row.title_en === "string" && row.title_en.trim())) &&
          ["guest", "panel"].includes(row.appearance_format),
        "appearance_metadata_invalid"
      );
      const url = new URL(row.url);
      requireValue(
        url.protocol === "https:" &&
          !url.username &&
          !url.password &&
          !urls.has(row.url),
        "appearance_url_invalid"
      );
      ids.add(row.id);
      urls.add(row.url);
      return {
        date: row.published_at.slice(0, 10).replaceAll("-", "."),
        show: row.show,
        title: row.title,
        ...(row.title_en ? { titleEn: row.title_en } : {}),
        href: row.url,
        format: row.appearance_format,
      } as AppearanceRow;
    });
  requireValue(rows.length > 0, "appearance_catalog_empty");
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

export function appearanceSnapshot(rows: AppearanceRow[]): string {
  return (
    `// Generated from Open Context ${SOURCE}. Do not edit by hand.\n` +
    `export const guestAppearances = ${JSON.stringify(rows, null, 2)} as const;\n\n` +
    "export type GuestAppearance = (typeof guestAppearances)[number];\n"
  );
}

export function verifyAppearanceRelease(
  snapshot: string,
  pin: AppearancePin
): void {
  requireValue(
    pin.schema_version === 1 &&
      pin.repository === REPOSITORY &&
      pin.source_path === SOURCE &&
      ["local-draft", "committed-release"].includes(pin.source_status) &&
      COMMIT.test(pin.upstream_commit) &&
      [pin.manifest_sha256, pin.catalog_sha256, pin.snapshot_sha256].every(
        value => HASH.test(value)
      ) &&
      typeof pin.catalog_matches_manifest === "boolean" &&
      Number.isSafeInteger(pin.row_count) &&
      pin.row_count > 0 &&
      (pin.source_status === "local-draft" || pin.catalog_matches_manifest),
    "appearance_pin_invalid"
  );
  requireValue(
    digest(snapshot) === pin.snapshot_sha256,
    "appearance_snapshot_hash_drift"
  );
  requireValue(
    snapshot.startsWith(
      `// Generated from Open Context ${SOURCE}. Do not edit by hand.\n`
    ),
    "appearance_snapshot_source_invalid"
  );
}

export async function loadAppearanceRelease(options: {
  sourceRoot?: string;
  draft?: boolean;
  commit?: string;
  manifestSha256?: string;
}) {
  requireValue(
    !options.draft || options.sourceRoot,
    "draft_requires_local_source_root"
  );
  requireValue(
    options.sourceRoot
      ? path.isAbsolute(options.sourceRoot) && !options.commit
      : options.commit && COMMIT.test(options.commit),
    "appearance_source_pin_required"
  );
  const read = async (relative: string): Promise<Buffer> => {
    if (options.sourceRoot) {
      const file = path.join(options.sourceRoot, relative);
      for (let cursor = file; ; cursor = path.dirname(cursor)) {
        requireValue(
          !fs.lstatSync(cursor).isSymbolicLink(),
          "appearance_source_symlink_forbidden"
        );
        if (cursor === path.dirname(cursor)) break;
      }
      requireValue(
        fs.statSync(file).isFile() && fs.statSync(file).size <= 2 * 1024 * 1024,
        "appearance_source_file_invalid"
      );
      return fs.readFileSync(file);
    }
    const response = await fetch(
      `https://raw.githubusercontent.com/${REPOSITORY}/${options.commit}/${relative}`,
      {
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
      }
    );
    requireValue(
      response.status === 200 && response.body,
      "appearance_remote_source_unavailable"
    );
    const chunks: Buffer[] = [];
    let bytes = 0;
    for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
      bytes += chunk.length;
      requireValue(
        bytes <= 2 * 1024 * 1024,
        "appearance_remote_source_too_large"
      );
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  };
  const manifestBytes = await read("release-manifest.json"),
    catalogBytes = await read(SOURCE);
  const manifestHash = digest(manifestBytes),
    catalogHash = digest(catalogBytes);
  if (options.manifestSha256)
    requireValue(
      manifestHash === options.manifestSha256,
      "appearance_manifest_hash_drift"
    );
  else requireValue(options.sourceRoot, "appearance_manifest_pin_required");
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  requireValue(
    manifest.schema_version === 3 &&
      manifest.repository === REPOSITORY &&
      manifest.intended_visibility === "public" &&
      Array.isArray(manifest.files),
    "appearance_manifest_schema_invalid"
  );
  const entries = manifest.files.filter(
    (row: { path?: string }) => row.path === SOURCE
  );
  requireValue(entries.length <= 1, "appearance_manifest_duplicate_source");
  const matches =
    entries.length === 1 &&
    entries[0].sha256 === catalogHash &&
    entries[0].bytes === catalogBytes.length;
  requireValue(
    options.draft || matches,
    "appearance_catalog_manifest_mismatch"
  );
  const commit = options.sourceRoot
    ? execFileSync("git", ["-C", options.sourceRoot, "rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim()
    : options.commit!;
  requireValue(COMMIT.test(commit), "appearance_commit_invalid");
  if (options.sourceRoot && !options.draft) {
    for (const [relative, bytes] of [
      ["release-manifest.json", manifestBytes],
      [SOURCE, catalogBytes],
    ] as const) {
      const committed = execFileSync("git", [
        "-C",
        options.sourceRoot,
        "show",
        `${commit}:${relative}`,
      ]);
      requireValue(
        digest(committed) === digest(bytes),
        "appearance_local_release_not_committed"
      );
    }
  }
  requireValue(
    digest(await read("release-manifest.json")) === manifestHash &&
      digest(await read(SOURCE)) === catalogHash,
    "appearance_inputs_changed_during_read"
  );
  const rows = appearanceRows(catalogBytes.toString("utf8")),
    snapshot = appearanceSnapshot(rows);
  const pin: AppearancePin = {
    schema_version: 1,
    repository: REPOSITORY,
    source_path: SOURCE,
    source_status: options.draft ? "local-draft" : "committed-release",
    upstream_commit: commit,
    manifest_sha256: manifestHash,
    catalog_sha256: catalogHash,
    catalog_matches_manifest: matches,
    snapshot_sha256: digest(snapshot),
    row_count: rows.length,
  };
  verifyAppearanceRelease(snapshot, pin);
  return { snapshot, pin, rows };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let sourceRoot: string | undefined,
    commit: string | undefined,
    manifestSha256: string | undefined;
  let draft = false,
    apply = false,
    check = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--source-root") sourceRoot = args[++i];
    else if (args[i] === "--commit") commit = args[++i];
    else if (args[i] === "--manifest-sha256") manifestSha256 = args[++i];
    else if (args[i] === "--draft") draft = true;
    else if (args[i] === "--apply") apply = true;
    else if (args[i] === "--check") check = true;
    else if (args[i] === "--help") {
      console.log(
        "sync-guest-appearances [--source-root ABSOLUTE [--draft] | --commit SHA --manifest-sha256 SHA256] [--apply|--check]\nDefault: dry-run from the committed pin. --check alone verifies local snapshot integrity. --draft explicitly permits an uncommitted local candidate."
      );
      return;
    } else throw new Error("appearance_unknown_option");
  }
  requireValue(
    !(apply && check) && (!draft || sourceRoot),
    "appearance_options_invalid"
  );
  const snapshotPath = path.join(ROOT, SNAPSHOT),
    pinPath = path.join(ROOT, PIN);
  if (check && !sourceRoot && !commit) {
    const pin = JSON.parse(fs.readFileSync(pinPath, "utf8"));
    verifyAppearanceRelease(fs.readFileSync(snapshotPath, "utf8"), pin);
    console.log(
      `Guest appearance snapshot matches its ${pin.source_status} pin (${pin.row_count} rows).`
    );
    return;
  }
  if (!sourceRoot && !commit) {
    const pin = JSON.parse(fs.readFileSync(pinPath, "utf8")) as AppearancePin;
    verifyAppearanceRelease(fs.readFileSync(snapshotPath, "utf8"), pin);
    requireValue(
      pin.source_status === "committed-release",
      "appearance_draft_pin_requires_source_root"
    );
    commit = pin.upstream_commit;
    manifestSha256 = pin.manifest_sha256;
  }
  const result = await loadAppearanceRelease({
    sourceRoot,
    draft,
    commit,
    manifestSha256,
  });
  if (check)
    requireValue(
      fs.readFileSync(snapshotPath, "utf8") === result.snapshot &&
        fs.readFileSync(pinPath, "utf8") ===
          JSON.stringify(result.pin, null, 2) + "\n",
      "appearance_source_projection_drift"
    );
  if (apply) {
    fs.writeFileSync(snapshotPath, result.snapshot);
    fs.writeFileSync(pinPath, JSON.stringify(result.pin, null, 2) + "\n");
  }
  console.log(
    JSON.stringify({
      applied: apply,
      checked: check,
      output: SNAPSHOT,
      pin: result.pin,
    })
  );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch(error => {
    console.error(
      error instanceof Error ? error.message : "appearance_sync_failed"
    );
    process.exitCode = 1;
  });
}
