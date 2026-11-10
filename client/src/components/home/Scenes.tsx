import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { HOME_COPY, type Scene } from "./content";
import { EXTERNAL } from "./parts";

function SceneLink({
  scene,
  lang,
  className,
  children,
}: {
  scene: Scene;
  lang: Lang;
  className: string;
  children: ReactNode;
}) {
  return scene.href.startsWith("/") ? (
    <Link className={className} href={withLanguage(scene.href, lang)}>
      {children}
    </Link>
  ) : (
    <a className={className} href={scene.href} {...EXTERNAL}>
      {children}
    </a>
  );
}

/**
 * Real photographs of Yuzheng on stage, standing still: the fullest room large,
 * the other three beside it, each with its caption. Every one opens where that
 * room can be seen. (Until 2026-11-09 they drifted past in a strip, four small
 * pictures of one size; a still page reads more calmly, and one large picture
 * says more than four small ones.)
 */
export default function Scenes({ lang }: { lang: Lang }) {
  const copy = HOME_COPY[lang];
  const [lead, ...rest] = copy.scenes;
  return (
    <section className="scenes" aria-label={copy.scenesLabel}>
      <div className="wrap scenes-grid">
        <SceneLink scene={lead} lang={lang} className="scene lead">
          <figure>
            <img
              src={lead.image}
              alt={lead.alt}
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
            />
            <figcaption>{lead.caption}</figcaption>
          </figure>
        </SceneLink>
        <ul className="scene-list">
          {rest.map(scene => (
            <li key={scene.image}>
              <SceneLink scene={scene} lang={lang} className="scene">
                <img
                  src={scene.image}
                  alt={scene.alt}
                  width={1280}
                  height={720}
                  loading="lazy"
                  decoding="async"
                />
                <span>{scene.caption}</span>
              </SceneLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
