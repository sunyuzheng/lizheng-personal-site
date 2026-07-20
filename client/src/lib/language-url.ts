import type { Lang } from "@/contexts/LanguageContext";

export function withLanguage(href: string, lang: Lang): string {
  if (lang !== "zh" || !href.startsWith("/") || href.startsWith("//")) {
    return href;
  }
  const url = new URL(href, "https://www.lizheng.ai");
  url.searchParams.set("lang", "zh");
  return `${url.pathname}${url.search}${url.hash}`;
}
