import Ask from "@/components/home/Ask";
import Calls from "@/components/home/Calls";
import CareerPath from "@/components/home/CareerPath";
import City from "@/components/home/City";
import Hero from "@/components/home/Hero";
import Invite from "@/components/home/Invite";
import Join from "@/components/home/Join";
import Proof from "@/components/home/Proof";
import Scenes from "@/components/home/Scenes";
import Talks from "@/components/home/Talks";
import Works from "@/components/home/Works";
import Writing from "@/components/home/Writing";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { SECTION } from "@/components/home/content";
import { useLanguage, type Lang } from "@/contexts/LanguageContext";
import { watchUsage, type UsageMark } from "@/lib/ask-usage";
import { linkTarget } from "@/lib/link-target";
import { prefersReducedMotion } from "@/lib/scroll";
import { track } from "@vercel/analytics";
import { applyPageSeo } from "@/lib/seo";
import { HOME_PAGE_META, languageAlternates } from "@shared/page-meta";
import { buildHomeStructuredData } from "@shared/structured-data";
import { useEffect, useRef, type RefObject } from "react";

/**
 * Blocks that start below the first screen rise into place as they arrive.
 * Only transform changes, so content is always visible. A language switch
 * (/ ↔ /zh) reuses this page, so the pass runs again for the new content.
 */
function useReveal(rootRef: RefObject<HTMLElement | null>, lang: Lang) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove("pre");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    const blocks = Array.from(root.querySelectorAll<HTMLElement>(".rv"));
    for (const block of blocks) {
      const rect = block.getBoundingClientRect();
      if (rect.height && rect.top > window.innerHeight) {
        block.classList.add("pre");
        observer.observe(block);
      }
    }
    return () => {
      observer.disconnect();
      for (const block of blocks) block.classList.remove("pre");
    };
  }, [rootRef, lang]);
}

// The chapters whose arrival on screen the owner's usage stats count (lib/ask-usage), in page
// order; the Ask section counts itself (h_seen).
const CHAPTERS: [string, UsageMark][] = [
  [SECTION.works, "c_works"], [SECTION.academy, "c_city"], [SECTION.talks, "c_talks"],
  [SECTION.calls, "c_calls"], [SECTION.writing, "c_writing"], [SECTION.join, "c_join"],
];

/**
 * Counts the homepage for its owner: which chapters come into view (Ops 「使用情况」), and which
 * links are followed, by section and destination (Vercel Analytics event "Home Link"). The Ask
 * section counts its own actions.
 */
function useHomeCounts(rootRef: RefObject<HTMLElement | null>, lang: Lang) {
  useEffect(() => {
    for (const [id, mark] of CHAPTERS) watchUsage(document.getElementById(id), mark);
  }, [lang]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.closest("#ask-lizheng")) return;
      const section = link.closest("section[id], header, footer");
      try {
        track("Home Link", { section: section?.id || section?.tagName.toLowerCase() || "page", to: linkTarget(link.href, location.href) });
      } catch {}
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [rootRef]);
}

export default function Home() {
  const { lang } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const meta = HOME_PAGE_META[lang];
    return applyPageSeo({
      ...meta,
      type: "profile",
      locale: lang === "zh" ? "zh_CN" : "en_US",
      alternates: languageAlternates(
        HOME_PAGE_META.en.canonical,
        HOME_PAGE_META.zh.canonical
      ),
      jsonLd: buildHomeStructuredData(lang, meta.canonical),
    });
  }, [lang]);

  useReveal(rootRef, lang);
  useHomeCounts(rootRef, lang);

  return (
    <div
      ref={rootRef}
      className={lang === "en" ? "lz-home l-en" : "lz-home"}
      lang={lang === "en" ? "en" : "zh-CN"}
    >
      <SiteHeader variant="overlay" />
      <main>
        <Hero lang={lang} />
        <CareerPath lang={lang} />
        <Proof lang={lang} />
        <Scenes lang={lang} />
        <Works lang={lang} />
        <City lang={lang} />
        <Talks lang={lang} />
        <Calls lang={lang} />
        <Writing lang={lang} />
        <Ask lang={lang} />
        <Join lang={lang} />
        <Invite lang={lang} />
      </main>
      <SiteFooter />
    </div>
  );
}
