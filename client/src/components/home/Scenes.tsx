import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import { HOME_COPY, type Scene } from "./content";
import Marquee from "./Marquee";
import { EXTERNAL } from "./parts";

function SceneCard({
  scene,
  lang,
  loopCopy,
}: {
  scene: Scene;
  lang: Lang;
  loopCopy: boolean;
}) {
  const body = (
    <figure>
      <img
        src={scene.image}
        alt={loopCopy ? "" : scene.alt}
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <figcaption>{scene.caption}</figcaption>
    </figure>
  );
  const focus = loopCopy ? { tabIndex: -1 } : {};
  return scene.href.startsWith("/") ? (
    <Link
      className="scene"
      href={withLanguage(scene.href, lang)}
      draggable={false}
      {...focus}
    >
      {body}
    </Link>
  ) : (
    <a
      className="scene"
      href={scene.href}
      draggable={false}
      {...EXTERNAL}
      {...focus}
    >
      {body}
    </a>
  );
}

/**
 * Real photographs of Yuzheng on stage. The strip drifts slowly; it can be
 * dragged or swiped, and each photo opens where that room can be seen.
 */
export default function Scenes({ lang }: { lang: Lang }) {
  const copy = HOME_COPY[lang];
  return (
    <section className="scenes" aria-label={copy.scenesLabel}>
      <Marquee className="mask reel" speed={24}>
        {loopCopy =>
          copy.scenes.map(scene => (
            <SceneCard
              key={scene.image}
              scene={scene}
              lang={lang}
              loopCopy={loopCopy}
            />
          ))
        }
      </Marquee>
    </section>
  );
}
