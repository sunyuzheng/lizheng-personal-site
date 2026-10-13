import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import {
  HOME_COPY,
  LINKS,
  SECTION,
  type AlsoGuest,
  type Guest,
} from "./content";
import Marquee from "./Marquee";
import { EXTERNAL, Lines, Phrases } from "./parts";

function GuestCard({ guest, lang }: { guest: Guest; lang: Lang }) {
  const body = (
    <>
      <img
        src={guest.image}
        alt=""
        width={300}
        height={300}
        loading="lazy"
        decoding="async"
      />
      <b>{guest.name}</b>
      <span>{guest.role}</span>
    </>
  );
  return guest.slug ? (
    <Link className="guest" href={withLanguage(`/guests/${guest.slug}`, lang)}>
      {body}
    </Link>
  ) : (
    <a className="guest" href={guest.href} {...EXTERNAL}>
      {body}
    </a>
  );
}

// Each name opens the guest page, or the conversation when there is no page.
function AlsoName({
  guest,
  lang,
  loopCopy,
}: {
  guest: AlsoGuest;
  lang: Lang;
  loopCopy: boolean;
}) {
  const focus = loopCopy ? { tabIndex: -1 } : {};
  return guest.slug ? (
    <Link
      href={withLanguage(`/guests/${guest.slug}`, lang)}
      draggable={false}
      {...focus}
    >
      {guest.name}
    </Link>
  ) : (
    <a href={guest.href} draggable={false} {...EXTERNAL} {...focus}>
      {guest.name}
    </a>
  );
}

export default function Talks({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].talks;
  return (
    <section className="sec talks" id={SECTION.talks}>
      <div className="wrap">
        {/* The head's picture is the show's setting, not an episode: Acquired's hosts on stage with
            him, for those who know them. No link, no play button; the event's name below. */}
        <div className="head talks-head rv">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h2>
              <Lines lines={t.title} />
            </h2>
            <p>
              <Phrases text={t.intro} />
            </p>
          </div>
          <figure className="talks-stage">
            <img
              src={t.stage.image}
              alt={t.stage.alt}
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
            />
            <figcaption>{t.stage.caption}</figcaption>
          </figure>
        </div>

        <ul className="guests">
          {t.guests.map(guest => (
            <li key={guest.name} className="rv">
              <GuestCard guest={guest} lang={lang} />
            </li>
          ))}
        </ul>

        <Marquee className="names" label={t.alsoAria} speed={34}>
          {loopCopy => (
            <>
              <span className="lab">{t.alsoLabel}</span>
              {t.also.map(guest => (
                <AlsoName
                  key={guest.name}
                  guest={guest}
                  lang={lang}
                  loopCopy={loopCopy}
                />
              ))}
            </>
          )}
        </Marquee>

        <div className="more">
          <Link className="btn btn-green" href={withLanguage("/guests", lang)}>
            {t.all}
          </Link>
          <a className="btn btn-line" href={LINKS.youtube} {...EXTERNAL}>
            {t.subscribe}
          </a>
        </div>
      </div>
    </section>
  );
}
