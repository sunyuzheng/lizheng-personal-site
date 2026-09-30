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
import { useLanguage, type Lang } from "@/contexts/LanguageContext";
import { prefersReducedMotion } from "@/lib/scroll";
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
        <Join lang={lang} />
        <Invite lang={lang} />
      </main>
      <SiteFooter />
    </div>
  );
}
