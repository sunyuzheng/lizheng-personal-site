import type { Lang } from "@/contexts/LanguageContext";
import { HOME_COPY, SECTION } from "./content";
import { EXTERNAL, Lines, Phrases } from "./parts";

/**
 * Dated public calls, oldest first, each with its original record. The calls
 * that matter most stay open: the key line in large type, and the newest one
 * with its video or cover.
 */
export default function Calls({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].calls;

  return (
    <section className="sec calls" id={SECTION.calls}>
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

        <ol className="calls-list" aria-label={t.listLabel}>
          {t.items.map(item => {
            const image = item.feature?.image;
            const imageLabel = image
              ? item.sources.find(([, href]) => href === image.href)?.[0]
              : undefined;
            return (
              <li
                key={item.date}
                className={item.feature ? "call featured rv" : "call rv"}
              >
                <div className="when">
                  <b>{item.date}</b>
                  {item.feature && (
                    <span className="badge">{item.feature.badge}</span>
                  )}
                </div>
                <div className="what">
                  <h3>
                    <Phrases text={item.title} />
                  </h3>
                  {item.feature && (
                    <blockquote>{item.feature.quote}</blockquote>
                  )}
                  <p className="claim">{item.claim}</p>
                </div>
                <div className="side">
                  {image && (
                    <a
                      className={image.video ? "media video" : "media"}
                      href={image.href}
                      aria-label={imageLabel}
                      {...EXTERNAL}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  )}
                  <div className="k">{t.sources}</div>
                  <ul>
                    {item.sources.map(([label, href]) => (
                      <li key={href}>
                        <a href={href} {...EXTERNAL}>
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
