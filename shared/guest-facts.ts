import pin from "./guest-catalog-pin.json";

// How many guests and videos the guest directory lists. The numbers come from the pinned
// Open Context catalog (scripts/sync-guests.ts writes them into the pin, and every build
// checks them against the snapshot), so no page types them by hand.
//
// Pages count guests, not conversations: one recording is often published as a members'
// full version, public parts and short clips, so the videos outnumber the recordings
// (411 videos were about 190 recordings on 2026-11-10; docs/reviews/guest-counts-2026-11-10.md).

/** Entries in the guest directory. */
export const GUEST_COUNT: number = pin.counts.guests;
/** Published videos with a guest, each counted once. */
export const GUEST_VIDEO_COUNT: number = pin.counts.videos;

// "More than": 157 → 150, and 160 → 150 too, since 160 is not more than 160.
const below = (count: number, step: number) => Math.floor((count - 1) / step) * step;

/** "150+" */
export function guestsFigure(count: number = GUEST_COUNT): string {
  return `${below(count, 10)}+`;
}

/** "150多位" */
export function guestsZh(count: number = GUEST_COUNT): string {
  return `${below(count, 10)}多位`;
}
