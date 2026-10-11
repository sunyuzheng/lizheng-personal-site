import type { GuestProfile } from "./guest-data";

/** Match a name or topic without treating a longer Latin name as that person. */
export function guestMatchesQuery(guest: GuestProfile, query: string): boolean {
  const q = query.normalize("NFKC").trim().toLowerCase();
  if (!q) return true;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(/[a-z]/.test(q) ? `(?<![a-z0-9])${escaped}(?![a-z0-9])` : escaped);
  return [guest.guest_name, guest.guest_en_name, ...(guest.aliases || []), guest.guest_company,
    guest.guest_title, ...guest.episodes.map(e => e.title)]
    .some(value => pattern.test(value.normalize("NFKC").toLowerCase()));
}
