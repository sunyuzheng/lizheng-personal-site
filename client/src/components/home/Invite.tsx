import LizhengMark from "@/components/site/LizhengMark";
import { SHOP_URL } from "@/components/site/site-content";
import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import { HOME_COPY, LINKS } from "./content";
import { Arrow, EXTERNAL, Lines, Phrases } from "./parts";

/**
 * The page's last words, set like the first (left, large), and signed: the 立正 seal that stands
 * behind the portrait on the first screen closes the page as the mark at the end of a scroll does.
 */
export default function Invite({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].invite;
  return (
    <section className="sec invite">
      <div className="wrap">
        <div className="invite-copy">
          <h2>
            <Lines lines={t.title} />
          </h2>
          <p>
            <Phrases text={t.body} />
          </p>
          <div className="cta-row">
            <a className="btn btn-green" href={LINKS.community} {...EXTERNAL}>
              {t.primary}
            </a>
            <Link className="btn btn-line" href={withLanguage("/collab", lang)}>
              {t.secondary}
            </Link>
            <a className="lz-link shop-link" href={SHOP_URL} {...EXTERNAL}>
              {t.shop} <Arrow />
            </a>
          </div>
        </div>
        <LizhengMark className="seal" />
      </div>
    </section>
  );
}
