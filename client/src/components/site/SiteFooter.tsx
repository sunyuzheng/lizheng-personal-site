import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Mail } from "lucide-react";
import { Link } from "wouter";
import LizhengMark from "./LizhengMark";
import { CONTACT_EMAIL, SHOP_URL, SITE_COPY, SITE_PAGES } from "./site-content";
import { SocialIcon, socialLinks } from "./social";

/**
 * Two balanced rows: who Yuzheng is on the left and where to follow him on
 * the right; then the site's pages on the left and the copyright on the right.
 */
export default function SiteFooter() {
  const { lang } = useLanguage();
  const copy = SITE_COPY[lang];

  return (
    <footer className={`lz-footer${lang === "en" ? " l-en" : ""}`}>
      <div className="inner">
        <div className="top">
          <div className="who">
            <LizhengMark />
            <div>
              <b>{copy.footerName}</b>
              <p>
                {copy.footerBio[0]}
                <br />
                {copy.footerBio[1]}
              </p>
            </div>
          </div>
          <div className="follow">
            <h2>{copy.footerFollow}</h2>
            <ul className="icons">
              {socialLinks(lang).map(link => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-id={link.id}
                    aria-label={link.label[lang]}
                    title={link.label[lang]}
                  >
                    <SocialIcon id={link.id} />
                  </a>
                </li>
              ))}
            </ul>
            <a className="mail" href={`mailto:${CONTACT_EMAIL}`}>
              <Mail aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <div className="base">
          <nav aria-label={copy.footerMore}>
            <ul>
              {SITE_PAGES.map(item => (
                <li key={item.page}>
                  <Link href={withLanguage(item.href, lang)}>{item[lang]}</Link>
                </li>
              ))}
              <li>
                <a href={SHOP_URL} target="_blank" rel="noopener noreferrer">
                  {copy.shop}
                </a>
              </li>
            </ul>
          </nav>
          <span className="rights">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
            {copy.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
