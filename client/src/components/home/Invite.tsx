import { SHOP_URL } from "@/components/site/site-content";
import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import { HOME_COPY, LINKS } from "./content";
import { EXTERNAL, Lines } from "./parts";

export default function Invite({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].invite;
  return (
    <section className="sec invite">
      <div className="wrap rv">
        <h2>
          <Lines lines={t.title} />
        </h2>
        <p>{t.body}</p>
        <div className="cta-row">
          <a className="btn btn-green" href={LINKS.community} {...EXTERNAL}>
            {t.primary}
          </a>
          <Link className="btn btn-line" href={withLanguage("/collab", lang)}>
            {t.secondary}
          </Link>
        </div>
        <a className="shop-link" href={SHOP_URL} {...EXTERNAL}>
          {t.shop} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
