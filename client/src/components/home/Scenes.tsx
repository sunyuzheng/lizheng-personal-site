import type { Lang } from "@/contexts/LanguageContext";
import { HOME_COPY } from "./content";

/**
 * A slow, seamless strip of real photographs. The second copy exists only for
 * the loop, so it is hidden from assistive technology and has empty alt text.
 */
export default function Scenes({ lang }: { lang: Lang }) {
  const copy = HOME_COPY[lang];
  const renderScenes = (duplicate: boolean) =>
    copy.scenes.map(scene => (
      <figure
        key={`${duplicate ? "loop-" : ""}${scene.image}`}
        aria-hidden={duplicate || undefined}
      >
        <img
          src={scene.image}
          alt={duplicate ? "" : scene.alt}
          width={1280}
          height={720}
          loading="lazy"
          decoding="async"
        />
        <figcaption>{scene.caption}</figcaption>
      </figure>
    ));

  return (
    <section className="scenes" aria-label={copy.scenesLabel}>
      <div className="mask">
        <div className="reel">
          {renderScenes(false)}
          {renderScenes(true)}
        </div>
      </div>
    </section>
  );
}
