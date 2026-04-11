# Guests Maintenance

This is the operational guide for the `lizheng.ai/guests` feature.

Read this before editing guest pages, guest data, or guest-page SEO.

## Key Pages

### `/guests`

Purpose:

- directory page for all guests
- ordered by guest-level popularity (`max_views`)
- links into each guest subpage

Primary files:

- `client/src/pages/Guests.tsx`
- `shared/guest-data.ts`

### `/guests/:slug`

Purpose:

- shareable guest subpage
- one pinned featured video
- full guest episode list sorted by episode view count
- guest-page SEO / Open Graph / JSON-LD

Primary files:

- `client/src/pages/GuestDetail.tsx`
- `shared/guest-data.ts`
- `scripts/prerender-guests.ts`

## Behavioral Rules

These are intentional product rules, not accidents:

- `primary_video_id` controls the featured video on the guest page
- the featured video does not have to be the highest-view episode
- the episode grid is sorted by `view_count` descending
- episode dates are rendered in UTC so they do not shift by browser timezone
- guest-page social links come from `xiaohongshu_url` and `linkedin_url`

If you change one of these behaviors, update this document and `docs/guest-data.md`.

## Source Of Truth

The website repo is not the editing authority for guest content.

### Editable upstream sources

These live in `kedaibiao-content-tools`:

- `guests.json`
  - guest roster
  - guest identity fields
  - guest-to-video mapping
  - `primary_video_id`
- `guest_video_metadata.json`
  - guest-page episode title
  - guest-page episode publish date
  - guest-page episode view count

### Deployment snapshots in this repo

These are generated, not hand-edited:

- `shared/guest-roster-snapshot.ts`
- `shared/guest-video-metadata.ts`

Do not manually edit these snapshots unless you are debugging the generator itself.

## Safe Update Path

Normal update flow:

1. update content in `kedaibiao-content-tools`
2. run upstream validation there
3. sync snapshots in this repo
4. run typecheck and build here
5. push this repo so Vercel rebuilds guest static pages

Recommended commands:

In `kedaibiao-content-tools`:

```bash
./tools/youtube/refresh_guest_page_data.sh
```

In `lizheng-personal-site`:

```bash
pnpm refresh:guests
```

## Common Mistakes

Do not do these:

- do not edit `shared/guest-video-metadata.ts` by hand
- do not edit `shared/guest-roster-snapshot.ts` by hand
- do not treat `all_videos_full.json` as the website guest-page source of truth
- do not assume the featured video should auto-follow the highest-view episode
- do not render guest-page dates in local browser timezone

## Acceptance Checklist

After any guest-page change, verify:

1. `/guests` loads and links correctly
2. `/guests/<slug>` opens for the changed guest
3. featured video matches `primary_video_id`
4. episode grid order matches descending `view_count`
5. social links still render correctly when present
6. build-time guest static pages regenerate successfully

## Files To Read First

If a future AI needs context fast, start here:

- `docs/guests-maintenance.md`
- `docs/guest-data.md`
- `shared/guest-data.ts`
- `client/src/pages/GuestDetail.tsx`
