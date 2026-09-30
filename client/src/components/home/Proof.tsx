import type { Lang } from "@/contexts/LanguageContext";
import { prefersReducedMotion } from "@/lib/scroll";
import { useEffect, useRef, useState } from "react";
import { HOME_COPY, type Stat } from "./content";
import Peers from "./Peers";

function formatStat(value: number, format: Stat["format"]) {
  return format === "k"
    ? `${Math.round(value)}K`
    : Math.round(value).toLocaleString("en-US");
}

/**
 * Server HTML carries the final figure. On the client, a figure that starts
 * below the fold counts up once it enters the viewport.
 */
function CountUp({ value, format }: Pick<Stat, "value" | "format">) {
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    if (!("IntersectionObserver" in window)) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    setShown(0);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / 1400);
          setShown(value * (1 - Math.pow(1 - progress, 3)));
          if (progress < 1) frame = window.requestAnimationFrame(step);
        };
        frame = window.requestAnimationFrame(step);
      },
      { threshold: 0.6 }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      setShown(value);
    };
  }, [value]);

  return (
    <>
      <div ref={ref} className="n" aria-hidden="true">
        {formatStat(shown, format)}
        <sup>+</sup>
      </div>
      <span className="sr-only">{formatStat(value, format)}+</span>
    </>
  );
}

export default function Proof({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].proof;
  return (
    <section className="proof" aria-label={t.label}>
      <div className="wrap">
        <div className="stats">
          {t.stats.map(stat => (
            <div className="stat" key={stat.label}>
              <CountUp value={stat.value} format={stat.format} />
              <div className="l">{stat.label}</div>
            </div>
          ))}
        </div>
        <p className="orgs">
          <span className="lab">{t.orgsLabel}</span>
          {t.orgs.map(([name, script]) => (
            <span key={name} className={script === "zh" ? "o zh" : "o"}>
              {name}
            </span>
          ))}
          <span className="etc">{t.orgsMore}</span>
        </p>
        <Peers lang={lang} />
      </div>
    </section>
  );
}
