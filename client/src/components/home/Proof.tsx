import type { Lang } from "@/contexts/LanguageContext";
import { prefersReducedMotion } from "@/lib/scroll";
import { useEffect, useRef, useState } from "react";
import { HOME_COPY, type Stat } from "./content";
import { Arrow, EXTERNAL } from "./parts";
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
        {/* Rows with a label column: who invited him, the conference he co-organizes, then what
            peers say. */}
        <div className="proof-row orgs">
          <div className="lab">{t.orgsLabel}</div>
          <p>
            {t.orgs.map(([name, script]) => (
              <span key={name} className={script === "zh" ? "o zh" : "o"}>
                {name}
              </span>
            ))}
            <span className="etc">{t.orgsMore}</span>
          </p>
        </div>
        {/* One line, so the way to the event's site fills the space at its end. */}
        <div className="proof-row cohost">
          <div className="lab">{t.cohost.label}</div>
          <p>
            <span className="o">{t.cohost.name}</span>
            <span className="note">
              {t.cohost.note.map(part => (
                <span key={part}>{part}</span>
              ))}
            </span>
          </p>
          <a className="lz-link" href={t.cohost.href} {...EXTERNAL}>
            {t.cohost.link} <Arrow />
          </a>
        </div>
        <Peers lang={lang} />
      </div>
    </section>
  );
}
