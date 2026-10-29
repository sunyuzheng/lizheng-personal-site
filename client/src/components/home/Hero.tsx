import LizhengMark from "@/components/site/LizhengMark";
import type { Lang } from "@/contexts/LanguageContext";
import { prefersReducedMotion } from "@/lib/scroll";
import { useEffect, useRef } from "react";
import { HOME_COPY, LINKS, SECTION } from "./content";
import { EXTERNAL, Lines, RichText, SectionLink } from "./parts";

// React 18 does not know the camelCase prop; the attribute is lowercase in HTML.
const HIGH_PRIORITY = { fetchpriority: "high" } as Record<string, string>;

export default function Hero({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].hero;
  const heroRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLImageElement>(null);

  // Gentle parallax: the seal drifts faster than the portrait.
  useEffect(() => {
    const hero = heroRef.current;
    const mark = markRef.current;
    const portrait = portraitRef.current;
    if (!hero || !mark || !portrait || prefersReducedMotion()) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (y > hero.offsetHeight) return;
      mark.style.translate = `0 ${y * 0.16}px`;
      portrait.style.translate = `0 ${y * 0.05}px`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
      mark.style.translate = "";
      portrait.style.translate = "";
    };
  }, []);

  return (
    <section ref={heroRef} className="hero grain" id={SECTION.hero}>
      <div className="wrap">
        <div className="hero-copy">
          {t.kicker && <p className="kicker rise d1">{t.kicker}</p>}
          <h1 className="rise d2">
            <Lines lines={t.title} />
          </h1>
          <p className="lede rise d3">
            <RichText value={t.lede} phrases />
          </p>
          {/* The page's one join button on its first screen: the header holds its own back until
              this one has scrolled away (SiteHeader). The ways to follow are in the footer. */}
          <div className="cta-row rise d4">
            <a
              className="btn btn-ivory"
              href={LINKS.community}
              data-hero-join=""
              {...EXTERNAL}
            >
              {t.primary}
            </a>
            <SectionLink className="btn btn-line" to={SECTION.talks}>
              {t.secondary}
            </SectionLink>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div ref={markRef} className="mark mark-in">
            <LizhengMark />
          </div>
          <img
            ref={portraitRef}
            className="portrait rise"
            src="/home/portrait-hero.webp"
            alt=""
            width={1222}
            height={1350}
            decoding="async"
            {...HIGH_PRIORITY}
          />
        </div>
      </div>
    </section>
  );
}
