import type { GuestProfile } from "./guest-data";

export type GuestEntityType = "person" | "group" | "virtual-character" | "anonymous-label" | "unresolved";

/** Resolve a published slug to its canonical profile. */
export function resolveGuestProfile(profiles: GuestProfile[], slug: string): GuestProfile | undefined {
  return profiles.find(p => p.slug === slug || p.alias_slugs.includes(slug));
}

export function guestSchemaType(guest: Pick<GuestProfile, "entity_type">): "Person" | "Thing" {
  return guest.entity_type === "person" ? "Person" : "Thing";
}
