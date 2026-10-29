import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import { HOME_COPY } from "./content";
import { Arrow, EXTERNAL } from "./parts";
import Peers from "./Peers";

/**
 * Who has him in, under the career band: the places that invited him to speak and train, the
 * conference he co-organizes, then what peers say. Each row ends in a way to look for oneself (the
 * slides, the event's site, the full quotations). The figures (followers, conversations, members,
 * learners) are not repeated here: each stands where its question comes up, in the hero, the city,
 * the show and the join cards (2026-10-29).
 */
export default function Proof({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].proof;
  return (
    <section className="proof" aria-label={t.label}>
      <div className="wrap">
        <div className="proof-row orgs">
          <div className="lab">
            <span>{t.orgsLabel}</span>
            <Link className="lz-link" href={withLanguage("/decks", lang)}>
              {t.orgsLink} <Arrow />
            </Link>
          </div>
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
