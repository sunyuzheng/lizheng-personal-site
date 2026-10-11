import type { GuestProfile } from "./guest-data";

const HAN = /[㐀-鿿]/u;
const normalize = (value: string) => value.normalize("NFKC").toLowerCase();
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The directory filter, as people type: every word of the query must begin a word (Latin) or
 * appear (Chinese) in the guest's names, introduction or programme titles. "Rich" finds Richard,
 * "王臻" finds the pair 王臻 & Nick, "enjoy" does not find Jo. Deciding who a question names is
 * stricter and lives with Ask Lizheng; this only narrows a list.
 */
export function guestMatchesQuery(guest: GuestProfile, query: string): boolean {
  const words = normalize(query).trim().split(/\s+/u).filter(Boolean);
  if (!words.length) return true;
  const fields = [guest.guest_name, guest.guest_en_name, ...(guest.aliases || []), ...(guest.search_names || []),
    guest.guest_company, guest.guest_title, ...guest.episodes.map(e => e.title)]
    .filter(Boolean).map(value => normalize(value as string));
  return words.every(word => {
    const pattern = HAN.test(word) ? null : new RegExp(`(?<![a-z0-9])${escape(word)}`, "u");
    return fields.some(field => (pattern ? pattern.test(field) : field.includes(word)));
  });
}
