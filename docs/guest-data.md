# Guest data flow

[Open Context](https://github.com/sunyuzheng/lizheng-open-context) owns the public guest catalog. The website generates one deployment snapshot from a fixed release; page layout, styling, and routes live here.

| Source | Contents | Website use |
|---|---|---|
| `catalog/guests.json` | Stable entities, names and aliases, programmes, participation, profile presentation and legacy slugs | Directory, profile pages, featured programme and episode lists |
| `catalog/guest-articles.json` | Published companion article metadata and source links | Reading links and Article structured data |
| `release-manifest.json` | Exact public file hashes and licenses | Sync integrity |

`shared/guest-catalog-snapshot.ts` is generated. The source configuration pins the Open Context commit and manifest hash; normal builds use the checked-in snapshot. Updating upstream does not introduce a runtime dependency on GitHub availability.

## Refresh

Update the catalog in Open Context, validate the release, then synchronize its exact version here:

```sh
pnpm sync:guests       # review changes
pnpm sync:guests --apply
pnpm check
pnpm build
```

For a local review, provide the explicit Open Context checkout and manifest hash to the sync command. The generator checks references, source IDs, metadata and file hashes before writing the snapshot. Production uses the reviewed commit pin.

`shared/guest-data.ts` adapts the generated catalog to page models; `scripts/prerender-guests.ts` generates crawlable pages and metadata. Old slugs resolve to the canonical profile and retain its canonical URL. The same selectors provide browser content and prerendered content.
