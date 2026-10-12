# Guest data flow

[Open Context](https://github.com/sunyuzheng/lizheng-open-context) owns the public guest catalog. The website generates one deployment snapshot from a fixed release; page layout, styling, and routes live here.

Published programme introductions, articles and media provide the primary evidence. Open Context maintains their traceable records, including source links and programme dates. Profile facts are calibrated there, then regenerated here. The website is a consumer of these records.

| Source | Contents | Website use |
|---|---|---|
| `catalog/guests.json` | Stable entities, names and aliases, programmes, participation, profile presentation and legacy slugs | Directory, profile pages, featured programme and episode lists |
| `catalog/guest-articles.json` | Published companion article metadata and source links | Reading links and Article structured data |
| `catalog/guest-names.json` | Generated name table: names before a parenthetical, nicknames, group members, qualifiers | Directory search (`search_names`) |
| `release-manifest.json` | Exact public file hashes and licenses | Sync integrity |

`shared/guest-catalog-snapshot.ts` is generated. The pin records the Open Context commit, manifest hash and generated snapshot hash; normal builds verify all three against the checked-in snapshot. Updating upstream does not introduce a runtime dependency on GitHub availability.

## Automatic refresh

`.github/workflows/sync-guests.yml` keeps the snapshot on Open Context's latest release without a manual step. Every half hour (or on demand) it compares Open Context main's release manifest with `shared/guest-catalog-pin.json`; on a new release it regenerates the snapshot from that exact commit, runs `pnpm check`, the guest tests and the build, and commits only the snapshot and pin to main as the owner, which Vercel deploys. A failed step commits nothing; the next run tries again. 问问立正 follows the same release through its own `update-context` workflow, so both consumers converge on one version.

## Manual refresh

Update the catalog in Open Context, validate the release, then synchronize its exact version here:

```sh
pnpm sync:guests       # reproduce the currently pinned release
pnpm sync:guests --apply
pnpm check
pnpm build
```

To prepare a new release, provide a committed Open Context checkout and its exact manifest hash:

```sh
pnpm sync:guests --context-dir /absolute/open-context --manifest-sha256 SHA256
pnpm sync:guests --context-dir /absolute/open-context --manifest-sha256 SHA256 --apply
pnpm test:guests
```

The generator validates references, source IDs and file hashes, binds the manifest to the source Git commit, and prepares the snapshot and pin together. A caught installation error restores the previous files. The website build rejects mismatched snapshots or pins; CI also runs the guest contract tests. Git commits and immutable deployments provide the release boundary. Production reads the checked-in snapshot without fetching upstream.

Pages show the introductions Open Context quotes from the programmes (`introductions`: a short line, the exact transcript words and their time), newest first, each linked to the programme at the moment it is said and labelled 节目中的介绍; the quoted words are the link's tooltip. A guest without a quoted introduction shows the catalog's line (`guestIntro`) as 简介, never as the programmes' words or a current title. Programmes are listed newest first. A group page lists its members and a member's page links back to the group. A guest page links to 问问立正 with the name filled in and 从哪读起 selected (`guestAskLink`).

`shared/guest-data.ts` adapts the generated catalog to page models; `scripts/prerender-guests.ts` generates crawlable pages and metadata. Old slugs resolve to the canonical profile and retain its canonical URL. The same selectors provide browser content and prerendered content.
