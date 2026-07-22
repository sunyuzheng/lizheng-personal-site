import type { Lang } from "@/contexts/LanguageContext";

const EN_TO_ZH_PATH: Record<string, string> = {
  "/": "/zh",
  "/about": "/zh/about",
  "/book": "/zh/book",
  "/collab": "/zh/collab",
  "/collab/creators": "/zh/collab/creators",
};

const ZH_TO_EN_PATH = Object.fromEntries(
  Object.entries(EN_TO_ZH_PATH).map(([enPath, zhPath]) => [zhPath, enPath])
) as Record<string, string>;

function isChineseCanonicalOnlyPath(pathname: string): boolean {
  return (
    pathname === "/zbs" ||
    pathname === "/guests" ||
    pathname.startsWith("/guests/")
  );
}

export function withLanguage(href: string, lang: Lang): string {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return href;
  }
  const url = new URL(href, "https://www.lizheng.ai");

  if (lang === "zh" && EN_TO_ZH_PATH[url.pathname]) {
    url.pathname = EN_TO_ZH_PATH[url.pathname];
    url.searchParams.delete("lang");
  } else if (lang === "en" && ZH_TO_EN_PATH[url.pathname]) {
    url.pathname = ZH_TO_EN_PATH[url.pathname];
    url.searchParams.delete("lang");
  } else if (
    lang === "zh" &&
    (url.pathname === "/zh" || url.pathname.startsWith("/zh/"))
  ) {
    url.searchParams.delete("lang");
  } else if (lang === "zh" && isChineseCanonicalOnlyPath(url.pathname)) {
    url.searchParams.delete("lang");
  } else if (lang === "zh") {
    url.searchParams.set("lang", "zh");
  } else {
    url.searchParams.delete("lang");
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function hasCanonicalLanguagePath(pathname: string): boolean {
  return Boolean(EN_TO_ZH_PATH[pathname] || ZH_TO_EN_PATH[pathname]);
}
