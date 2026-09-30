import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import { HOME_COPY, LINKS, SECTION, type Guest } from "./content";
import { EXTERNAL, Lines } from "./parts";

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

export default function Talks({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].talks;
  const names = (duplicate: boolean) => (
    <>
      <span className="lab" aria-hidden={duplicate || undefined}>
        {t.alsoLabel}
      </span>
      {t.also.map(name => (
        <span key={name} aria-hidden={duplicate || undefined}>
          {name}
        </span>
      ))}
    </>
  );

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

        <div className="names" role="group" aria-label={t.alsoAria}>
          <div className="track">
            {names(false)}
            {names(true)}
          </div>
        </div>

        {t.popular.length > 0 && (
          <div className="popular">
            <h3>{t.popularTitle}</h3>
            <ul className="vids">
              {t.popular.map(video => (
                <li key={video.id} className="rv">
                  <a
                    className="vid"
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    {...EXTERNAL}
                  >
                    <div className="th">
                      <img
                        src={`/home/videos/${video.id}.webp`}
                        alt=""
                        width={480}
                        height={270}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <b>{video.title}</b>
                    <span>{video.year}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

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
