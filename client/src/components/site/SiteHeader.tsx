import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { withLanguage } from "@/lib/language-url";
import { prefersReducedMotion, scrollToSection } from "@/lib/scroll";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useLocation } from "wouter";
import LizhengMark from "./LizhengMark";
import {
  COMMUNITY_URL,
  HOME_SECTIONS,
  SITE_COPY,
  SITE_PAGES,
  type SitePage,
} from "./site-content";

interface SiteHeaderProps {
  /**
   * `overlay` is the homepage variant: transparent over the forest hero, solid
   * once the hero has scrolled away, with in-page section links.
   */
  variant?: "overlay" | "solid";
  /** Marks the matching "More" link as the current page. */
  current?: SitePage;
}

export default function SiteHeader({
  variant = "solid",
  current,
}: SiteHeaderProps) {
  const { lang } = useLanguage();
  const [location] = useLocation();
  const copy = SITE_COPY[lang];
  const overlay = variant === "overlay";
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const closeAll = () => {
    setMenuOpen(false);
    setMoreOpen(false);
  };

  // Close menus when the page or language changes.
  useEffect(closeAll, [location, lang]);

  useEffect(() => {
    if (!menuOpen && !moreOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeAll();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (moreOpen) {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
      if (menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, moreOpen]);

  // Overlay variant: turn solid once the hero has scrolled under the header.
  useEffect(() => {
    if (!overlay) return;
    const update = () => {
      const hero = document.getElementById("hero");
      const threshold = hero ? hero.offsetHeight - 80 : 0;
      setPastHero(window.scrollY > threshold);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [overlay, lang]);

  const homeHref = withLanguage("/", lang);

  const sectionLink = (
    section: (typeof HOME_SECTIONS)[number],
    onNavigate?: () => void
  ) => {
    const label = section[lang];
    if (overlay) {
      return (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            closeAll();
            onNavigate?.();
            window.setTimeout(() => scrollToSection(section.id), 0);
          }}
        >
          {label}
        </a>
      );
    }
    return (
      <Link key={section.id} href={`${homeHref}#${section.id}`}>
        {label}
      </Link>
    );
  };

  const pageLink = (item: (typeof SITE_PAGES)[number]) => (
    <Link
      key={item.page}
      href={withLanguage(item.href, lang)}
      aria-current={current === item.page ? "page" : undefined}
      onClick={closeAll}
    >
      {item[lang]}
    </Link>
  );

  const brandInner = (
    <>
      <LizhengMark />
      <span>
        <b>{copy.name}</b>
        <small>{copy.alias}</small>
      </span>
    </>
  );

  const className = [
    "lz-header",
    overlay ? "is-overlay" : "",
    overlay && (pastHero || menuOpen) ? "solid" : "",
    lang === "en" ? "l-en" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header ref={headerRef} className={className}>
      <div className="bar">
        {overlay ? (
          <a
            className="lz-brand"
            href={homeHref}
            aria-label={copy.brandLabel}
            onClick={event => {
              event.preventDefault();
              closeAll();
              window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion() ? "auto" : "smooth",
              });
            }}
          >
            {brandInner}
          </a>
        ) : (
          <Link
            className="lz-brand"
            href={homeHref}
            aria-label={copy.brandLabel}
          >
            {brandInner}
          </Link>
        )}

        <nav className="lz-nav" aria-label={copy.navLabel}>
          {HOME_SECTIONS.map(section => sectionLink(section))}
          <div className="lz-more">
            <button
              ref={moreButtonRef}
              type="button"
              aria-expanded={moreOpen}
              aria-controls="lz-more-panel"
              onClick={() => setMoreOpen(open => !open)}
            >
              {copy.more}
              <ChevronDown aria-hidden="true" />
            </button>
            {moreOpen && (
              <div id="lz-more-panel" className="lz-more-panel">
                {SITE_PAGES.map(pageLink)}
              </div>
            )}
          </div>
        </nav>

        <div className="lz-actions">
          <LanguageToggle
            variant="pill"
            className="lz-lang"
            label={copy.switchLabel}
          />
          <a
            className="lz-join"
            href={COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.join}
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            className="lz-menu-button"
            aria-expanded={menuOpen}
            aria-controls="lz-menu"
            aria-label={menuOpen ? copy.menuClose : copy.menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="lz-menu" className="lz-menu">
          <div className="inner">
            <nav aria-label={copy.homeGroup}>
              <p className="grp">{copy.homeGroup}</p>
              <ul>
                {HOME_SECTIONS.map(section => (
                  <li key={section.id}>{sectionLink(section)}</li>
                ))}
              </ul>
            </nav>
            <nav aria-label={copy.moreGroup}>
              <p className="grp">{copy.moreGroup}</p>
              <ul>
                {SITE_PAGES.map(item => (
                  <li key={item.page}>{pageLink(item)}</li>
                ))}
              </ul>
            </nav>
            <a
              className="lz-join"
              href={COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeAll}
            >
              {copy.join}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
