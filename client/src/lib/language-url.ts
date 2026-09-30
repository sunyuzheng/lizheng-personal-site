import type { Lang } from "@/contexts/LanguageContext";

// Chinese is the site's default language: every page lives at its plain path
// (/, /about, /collab …) and its English version, where there is one, lives
// under /en. Old /zh/… addresses redirect to the plain paths (vercel.json).
const ZH_TO_EN_PATH: Record<string, string> = {
  "/": "/en",
  "/about": "/en/about",
  "/book": "/en/book",
  "/collab": "/en/collab",
  "/collab/creators": "/en/collab/creators",
  "/collab/enterprise": "/en/collab/enterprise",
  "/experiment/vercel": "/en/experiment/vercel",
  "/experiment/emil": "/en/experiment/emil",
  "/decks": "/en/decks",
};

const EN_TO_ZH_PATH = Object.fromEntries(
  Object.entries(ZH_TO_EN_PATH).map(([zhPath, enPath]) => [enPath, zhPath])
) as Record<string, string>;

/** The language a path is written in: /en and /en/… are English. */
export function langForPath(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "zh";
}

/**
 * The guest directory and guest pages have one address for both languages:
 * they keep the language the visitor was reading in and switch in place.
 */
export function followsReaderLanguage(pathname: string): boolean {
  return pathname === "/guests" || pathname.startsWith("/guests/");
}

/** The same page in the requested language, when both versions exist. */
export function withLanguage(href: string, lang: Lang): string {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return href;
  }
  const url = new URL(href, "https://www.lizheng.ai");
  url.searchParams.delete("lang");
  const mapped =
    lang === "en" ? ZH_TO_EN_PATH[url.pathname] : EN_TO_ZH_PATH[url.pathname];
  if (mapped) url.pathname = mapped;
  return `${url.pathname}${url.search}${url.hash}`;
}
