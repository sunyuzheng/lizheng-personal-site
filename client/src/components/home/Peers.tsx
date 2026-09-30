import { endorsements } from "@/components/PeerEndorsements";
import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import { Arrow } from "./parts";

const COPY = {
  zh: { label: "来自同行的评价", more: "读完整评价" },
  en: { label: "What peers say", more: "Read the full endorsements" },
} as const;

/**
 * Third-party authority: people with standing vouching for specific work.
 * Being a guest shows access; an endorsement shows judgment, so each quote
 * names what it is about. Wording comes from PeerEndorsements (the approved
 * source); About keeps the full quotations.
 */
export default function Peers({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  return (
    <div className="peers">
      <div className="peers-head">
        <span className="lab">{copy.label}</span>
        <Link href={`${withLanguage("/about", lang)}#endorsements`}>
          {copy.more} <Arrow />
        </Link>
      </div>
      <ul className="peer-list">
        {endorsements.map(item => {
          const text = item[lang];
          return (
            <li key={item.id}>
              <figure>
                <p className="subj">{text.subject}</p>
                <blockquote>“{text.excerpt}”</blockquote>
                <figcaption>
                  <img
                    src={item.avatar}
                    alt=""
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>
                    <b>{text.name}</b>
                    <small>{text.role}</small>
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
