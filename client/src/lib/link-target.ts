/**
 * Where a link goes, in few enough words to count in analytics: an anchor on this page (#join),
 * a page of this site without its language prefix (/guests, /collab), or another site with the
 * first part of its path (superlinear.academy/ for joining, superlinear.academy/c for a post).
 */
export function linkTarget(href: string, here: string): string {
  const url = new URL(href, here);
  const page = new URL(here);
  if (url.origin === page.origin) {
    if (url.pathname === page.pathname && url.hash) return url.hash;
    const parts = url.pathname.split("/").filter(Boolean);
    return `/${(parts[0] === "en" ? parts[1] : parts[0]) ?? ""}`;
  }
  return `${url.hostname.replace(/^www\./, "")}/${url.pathname.split("/").filter(Boolean)[0] ?? ""}`;
}
