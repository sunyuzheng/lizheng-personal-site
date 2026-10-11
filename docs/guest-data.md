# Guest data flow

[Open Context](https://github.com/sunyuzheng/lizheng-open-context) owns the public guest catalog. The website generates one deployment snapshot from a fixed release; page layout, styling, and routes live here.

| Source | Contents | Website use |
|---|---|---|
| `catalog/guests.json` | Stable entities, names and aliases, programmes, participation, profile presentation and legacy slugs | Directory, profile pages, featured programme and episode lists |
| `catalog/guest-articles.json` | Published companion article metadata and source links | Reading links and Article structured data |
| `release-manifest.json` | Exact public file hashes and licenses | Sync integrity |

`shared/guest-catalog-snapshot.ts` is generated. The pin records the Open Context commit, manifest hash and generated snapshot hash; normal builds verify all three against the checked-in snapshot. Updating upstream does not introduce a runtime dependency on GitHub availability.

## Refresh

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

`shared/guest-data.ts` adapts the generated catalog to page models; `scripts/prerender-guests.ts` generates crawlable pages and metadata. Old slugs resolve to the canonical profile and retain its canonical URL. The same selectors provide browser content and prerendered content.
