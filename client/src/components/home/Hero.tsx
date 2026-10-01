import LizhengMark from "@/components/site/LizhengMark";
import { SocialIcon, socialLinks } from "@/components/site/social";
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
            <RichText value={t.lede} />
          </p>
          <div className="cta-row rise d4">
            <a className="btn btn-ivory" href={LINKS.community} {...EXTERNAL}>
              {t.primary} <span aria-hidden="true">→</span>
            </a>
            <SectionLink className="btn btn-line" to={SECTION.talks}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7 4l13 8-13 8z" fill="currentColor" />
              </svg>
              {t.secondary}
            </SectionLink>
          </div>
          <div className="social rise d4">
            <span className="lab">{t.follow}</span>
            {socialLinks(lang).map(link => (
              <a
                key={link.id}
                href={link.href}
                aria-label={link.label[lang]}
                data-label={link.label[lang]}
                data-id={link.id}
                {...EXTERNAL}
              >
                <SocialIcon id={link.id} />
              </a>
            ))}
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div ref={markRef} className="mark mark-in">
            <LizhengMark />
          </div>
          <img
            ref={portraitRef}
            className="portrait rise"
            src="/home/portrait.webp"
            alt=""
            width={815}
            height={900}
            decoding="async"
            {...HIGH_PRIORITY}
          />
        </div>
      </div>
    </section>
  );
}
