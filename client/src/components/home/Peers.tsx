import { endorsements } from "@/components/PeerEndorsements";
import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import { Arrow, Phrases } from "./parts";

const COPY = {
  zh: { label: "来自同行的评价", more: "读完整评价" },
  en: { label: "What peers say", more: "Read in full" },
} as const;

/**
 * Third-party authority: people with standing vouching for specific work.
 * The homepage gives each the shortest faithful cut of their words (punch),
 * which already says what it is about; About keeps the full quotations. The
 * label and the way to the full text sit in the row's label column, as the
 * organizations' label does above.
 */
export default function Peers({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  return (
    <div className="proof-row peers">
      <div className="lab">
        <span>{copy.label}</span>
        <Link className="lz-link" href={`${withLanguage("/about", lang)}#endorsements`}>
          {copy.more} <Arrow />
        </Link>
      </div>
      <ul className="peer-list">
        {endorsements.map(item => {
          const text = item[lang];
          return (
            <li key={item.id}>
              <figure>
                <blockquote>
                  <Phrases text={`“${text.punch}”`} />
                </blockquote>
                <figcaption>
                  <img
                    src={item.avatar}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>
                    <b>{text.name}</b>
                    <small>{text.shortRole}</small>
                  </span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
