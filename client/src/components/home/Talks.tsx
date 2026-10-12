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
import { Arrow, EXTERNAL, Lines, Phrases } from "./parts";

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
        <div className="head rv">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h2>
              <Lines lines={t.title} />
            </h2>
          </div>
          <p>{t.intro}</p>
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

        <a
          className="card c-show talk-feature rv"
          href={t.feature.href}
          {...EXTERNAL}
        >
          <div className="photo">
            <img
              src={t.feature.image}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
            />
            <span className="play" aria-hidden="true" />
          </div>
          <div className="body">
            <div className="meta">{t.feature.meta}</div>
            <h3>
              <Phrases text={t.feature.title} />
            </h3>
            <p>{t.feature.body}</p>
            <span className="go">
              {t.feature.go} <Arrow />
            </span>
          </div>
        </a>

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
