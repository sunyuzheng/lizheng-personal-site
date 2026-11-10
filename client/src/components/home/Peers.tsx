import { endorsements } from "@/components/PeerEndorsements";
import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";

const COPY = {
  zh: { label: "来自同行的评价", talk: (name: string) => `${name}的对话页` },
  en: { label: "What peers say", talk: (name: string) => `${name}'s conversations` },
} as const;

// Each of the four has also sat down with him for a long conversation; their name opens that page,
// so a reader can see who is speaking and how they know his work.
const GUEST_PAGE: Record<string, string> = {
  "liu-jia": "liu-jia",
  "wei-manfredi": "wei-manfredi",
  "vijaye-raji": "vijaye-raji",
  "dai-yusen": "dai-yusen",
};

/**
 * A quotation set as lines: in Chinese a line breaks only after punctuation or
 * a dash, never inside a word (as Phrases does). A phrase too long for a narrow
 * column may also break after the words listed in `soft` (typesetting hints
 * kept beside the quotation, whose own text stays untouched). The opening mark
 * hangs outside the first line, so every line starts on the same edge; the
 * closing mark stays with the last phrase, so it never falls on a line of its
 * own.
 */
export function Quotation({
  text,
  soft = [],
}: {
  text: string;
  soft?: readonly string[];
}) {
  const hinted = soft.reduce(
    (value, words) => value.replace(words, `${words}|`),
    text
  );
  const parts = hinted
    .split("——")
    .map((part, index, all) => (index < all.length - 1 ? `${part}——` : part))
    .flatMap(part => part.match(/[^，：；、？！。]+[，：；、？！。]*/g) ?? [part])
    .flatMap(part => part.split("|"))
    .filter(Boolean);
  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className="phrase">
          {index === 0 && <span className="mark">“</span>}
          {part}
          {index === parts.length - 1 && "”"}
        </span>
      ))}
    </>
  );
}

/**
 * Third-party authority: people with standing vouching for specific work.
 * The homepage sets each one's words in full, large enough to be read as a
 * statement and not skimmed as a caption (until 2026-11-09 it showed the
 * shortest cut of each, ending in an ellipsis), signed with what the words
 * were said about (his teaching, the community, a book), as About does. The
 * label sits in the row's label column, as the organizations' label does.
 */
export default function Peers({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  return (
    <div className="proof-row peers">
      <div className="lab">
        <span>{copy.label}</span>
      </div>
      <ul className="peer-list">
        {endorsements.map(item => {
          const text = item[lang];
          return (
            <li key={item.id}>
              <figure>
                <blockquote>
                  <Quotation
                    text={text.quote}
                    soft={"soft" in text ? text.soft : undefined}
                  />
                </blockquote>
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
                    <span className="who">
                      <Link
                        href={withLanguage(`/guests/${GUEST_PAGE[item.id]}`, lang)}
                        aria-label={copy.talk(text.name)}
                      >
                        <b>{text.name}</b>
                      </Link>
                      <i>{text.subject}</i>
                    </span>
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
