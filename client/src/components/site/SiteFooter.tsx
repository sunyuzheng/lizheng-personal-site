import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Mail } from "lucide-react";
import { Link } from "wouter";
import LizhengMark from "./LizhengMark";
import { CONTACT_EMAIL, SHOP_URL, SITE_COPY, SITE_PAGES } from "./site-content";
import { SocialIcon, socialLinks } from "./social";

export default function SiteFooter() {
  const { lang } = useLanguage();
  const copy = SITE_COPY[lang];

  return (
    <footer className={`lz-footer${lang === "en" ? " l-en" : ""}`}>
      <div className="inner">
        <div className="grid">
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
          <nav aria-label={copy.footerMore}>
            <h2>{copy.footerMore}</h2>
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
          <nav aria-label={copy.footerFollow}>
            <h2>{copy.footerFollow}</h2>
            <ul>
              {socialLinks(lang).map(link => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-id={link.id}
                  >
                    <SocialIcon id={link.id} />
                    {link.label[lang]}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`}>
                  <Mail aria-hidden="true" />
                  {copy.email}
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="base">
          <span>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
            {copy.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
