import type { LanguageAlternate } from "@shared/page-meta";

interface SeoInput {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  imageAlt?: string;
  type?: string;
  locale?: string;
  robots?: string;
  alternates?: readonly LanguageAlternate[];
  jsonLd?: unknown | null;
}

interface ManagedMeta {
  element: HTMLMetaElement;
  created: boolean;
  previousContent: string | null;
}

function manageMeta(
  selector: string,
  attributes: Record<string, string>,
  content: string
): ManagedMeta {
  let element = document.querySelector<HTMLMetaElement>(selector);
  const created = !element;
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([name, value]) =>
      element?.setAttribute(name, value)
    );
    document.head.appendChild(element);
  }

  const previousContent = element.getAttribute("content");
  element.setAttribute("content", content);
  return { element, created, previousContent };
}

function manageCanonical(canonical: string) {
  let element = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );
  const created = !element;
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  const previousHref = element.getAttribute("href");
  element.setAttribute("href", canonical);
  return { element, created, previousHref };
}

function replaceLanguageAlternates(alternates: readonly LanguageAlternate[]) {
  const selector = 'link[rel="alternate"][hreflang]';
  const previous = Array.from(
    document.querySelectorAll<HTMLLinkElement>(selector)
  ).map(element => element.cloneNode(true) as HTMLLinkElement);

  document.querySelectorAll(selector).forEach(element => element.remove());
  const current = alternates.map(alternate => {
    const element = document.createElement("link");
    element.rel = "alternate";
    element.hreflang = alternate.hrefLang;
    element.href = alternate.href;
    document.head.appendChild(element);
    return element;
  });

  return () => {
    current.forEach(element => element.remove());
    previous.forEach(element => document.head.appendChild(element));
  };
}

function replaceStructuredData(jsonLd: unknown | null) {
  const selector = 'script[type="application/ld+json"]';
  const previous = Array.from(
    document.querySelectorAll<HTMLScriptElement>(selector)
  ).map(element => element.cloneNode(true) as HTMLScriptElement);

  document.querySelectorAll(selector).forEach(element => element.remove());
  let current: HTMLScriptElement | null = null;
  if (jsonLd !== null) {
    current = document.createElement("script");
    current.type = "application/ld+json";
    current.dataset.pageStructuredData = "true";
    current.textContent = JSON.stringify(jsonLd).replaceAll("<", "\\u003c");
    document.head.appendChild(current);
  }

  return () => {
    current?.remove();
    previous.forEach(element => document.head.appendChild(element));
  };
}

export function applyPageSeo({
  title,
  description,
  canonical,
  ogImage,
  imageAlt = title,
  type = "website",
  locale = "en_US",
  robots = "index, follow",
  alternates = [],
  jsonLd = null,
}: SeoInput) {
  const previousTitle = document.title;
  document.title = title;

  const metas = [
    manageMeta('meta[name="robots"]', { name: "robots" }, robots),
    manageMeta(
      'meta[name="description"]',
      { name: "description" },
      description
    ),
    manageMeta('meta[property="og:type"]', { property: "og:type" }, type),
    manageMeta('meta[property="og:url"]', { property: "og:url" }, canonical),
    manageMeta('meta[property="og:title"]', { property: "og:title" }, title),
    manageMeta(
      'meta[property="og:description"]',
      { property: "og:description" },
      description
    ),
    manageMeta('meta[property="og:locale"]', { property: "og:locale" }, locale),
    manageMeta(
      'meta[property="og:site_name"]',
      { property: "og:site_name" },
      "课代表立正"
    ),
    manageMeta(
      'meta[name="twitter:card"]',
      { name: "twitter:card" },
      "summary_large_image"
    ),
    manageMeta('meta[name="twitter:url"]', { name: "twitter:url" }, canonical),
    manageMeta('meta[name="twitter:title"]', { name: "twitter:title" }, title),
    manageMeta(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      description
    ),
  ];

  metas.push(
    manageMeta('meta[property="og:image"]', { property: "og:image" }, ogImage),
    manageMeta(
      'meta[property="og:image:alt"]',
      { property: "og:image:alt" },
      imageAlt
    ),
    manageMeta(
      'meta[name="twitter:image"]',
      { name: "twitter:image" },
      ogImage
    ),
    manageMeta(
      'meta[name="twitter:image:alt"]',
      { name: "twitter:image:alt" },
      imageAlt
    )
  );

  const canonicalLink = manageCanonical(canonical);
  const restoreAlternates = replaceLanguageAlternates(alternates);
  const restoreStructuredData = replaceStructuredData(jsonLd);

  return () => {
    document.title = previousTitle;
    metas.forEach(({ element, created, previousContent }) => {
      if (created) {
        element.remove();
      } else if (previousContent === null) {
        element.removeAttribute("content");
      } else {
        element.setAttribute("content", previousContent);
      }
    });

    if (canonicalLink.created) {
      canonicalLink.element.remove();
    } else if (canonicalLink.previousHref === null) {
      canonicalLink.element.removeAttribute("href");
    } else {
      canonicalLink.element.setAttribute("href", canonicalLink.previousHref);
    }
    restoreAlternates();
    restoreStructuredData();
  };
}
