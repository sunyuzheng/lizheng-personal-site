import type { ReactNode } from "react";
import LizhengMark from "./LizhengMark";

/*
 * The shell of the two pages that live on hosts of their own (podcast.lizheng.ai and
 * speaker.lizheng.ai). They wear the site's header and footer, but with that page's own few links:
 * the site's navigation is made of paths such as /#ask, which mean nothing on those hosts.
 */

export function SoloHeader({
  brandHref,
  brandLabel,
  small,
  children,
}: {
  brandHref: string;
  brandLabel: string;
  /** The line under the name: which of his pages this is. */
  small: string;
  /** The page's own links, on the right. */
  children: ReactNode;
}) {
  return (
    <header className="lz-header solo">
      <div className="bar">
        <a className="lz-brand" href={brandHref} aria-label={brandLabel}>
          <LizhengMark />
          <span>
            <b>课代表立正</b>
            <small>{small}</small>
          </span>
        </a>
        <div className="lz-actions">{children}</div>
      </div>
    </header>
  );
}

export function SoloFooter({
  name,
  label,
  children,
  rights,
}: {
  /** Whose page this is, in the footer's own words. */
  name: string;
  /** Accessible name of the links. */
  label: string;
  /** The links, as <li> items. */
  children: ReactNode;
  rights?: ReactNode;
}) {
  return (
    <footer className="lz-footer solo">
      <div className="inner">
        <div className="base">
          <p className="name">{name}</p>
          <nav aria-label={label}>
            <ul>{children}</ul>
          </nav>
          {rights ? <span className="rights">{rights}</span> : null}
        </div>
      </div>
    </footer>
  );
}
