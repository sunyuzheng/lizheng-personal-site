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

`.github/workflows/sync-guests.yml` keeps the snapshot on Open Context's latest release without a manual step. It is scheduled every half hour, but GitHub runs such a schedule far less often in practice (four runs in the 24 hours to 2026-11-10), so a release can take hours to arrive on its own. Each run, scheduled or started by hand (`gh workflow run sync-guests.yml`), compares Open Context main's release manifest with `shared/guest-catalog-pin.json`; on a new release it regenerates the snapshot from that exact commit, runs `pnpm check`, the guest tests and the build, and commits only the snapshot and pin to main as the owner, which Vercel deploys. A failed step commits nothing; the next run tries again. 问问立正 follows the same release through its own `update-context` workflow, which Open Context starts on every push, so both consumers converge on one version. When a release should show on the site at once, start the workflow by hand, or bring the snapshot in with the site change that needs it (`pnpm sync:guests --context-dir <a clone at the released commit> --manifest-sha256 <the sha256 of its release-manifest.json> --apply`), as was done on 2026-11-10.

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

A guest page says who the guest is first: the catalog's line (`guestIntro`: company and title) sits under the name as 简介, the same line the directory shows. A new guest can be published before the line exists: Open Context fills it at release when a published description states the guest's identity (`嘉宾：姓名，身份`) and otherwise lists the evidence to write it from, without holding the release. Until then the directory card shows what the guest's newest programme said (`guestLine`), and the page shows the programmes' introductions alone. It is an about line, never the programmes' words or a claim about a current job. Below it come the introductions Open Context quotes from the programmes (`introductions`: a short line, the exact transcript words and their time), newest first, each on two lines (what was said, then the programme and year, linked to the moment it is said) under the label 节目中的介绍; the quoted words are the link's tooltip. An introduction must say who the guest is and must be about the guest: lines where the host or an audience member describes themselves do not qualify (six such lines were removed on 2026-11-10; see `docs/reviews/guest-introductions-2026-11-10.md`). Programmes are listed newest first. A group page lists its members and a member's page links back to the group. A guest page links to 问问立正 with the name filled in and 从哪读起 selected (`guestAskLink`).

`shared/guest-data.ts` adapts the generated catalog to page models; `scripts/prerender-guests.ts` generates crawlable pages and metadata. Old slugs resolve to the canonical profile and retain its canonical URL. The same selectors provide browser content and prerendered content.
