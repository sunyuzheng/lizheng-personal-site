import type { Lang } from "@/contexts/LanguageContext";

export function withLanguage(href: string, lang: Lang): string {
  if (lang !== "zh" || !href.startsWith("/") || href.startsWith("//")) {
    return href;
  }
  const url = new URL(href, "https://www.lizheng.ai");

  if (url.pathname === "/collab" || url.pathname === "/collab/creators") {
    url.searchParams.delete("lang");
    return `/zh${url.pathname}${url.search}${url.hash}`;
  }

  url.searchParams.set("lang", "zh");
  return `${url.pathname}${url.search}${url.hash}`;
}
