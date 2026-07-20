interface SeoInput {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  type?: string;
  locale?: string;
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

export function applyPageSeo({
  title,
  description,
  canonical,
  ogImage,
  type = "website",
  locale = "en_US",
}: SeoInput) {
  const previousTitle = document.title;
  document.title = title;

  const metas = [
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
    manageMeta('meta[name="twitter:image"]', { name: "twitter:image" }, ogImage)
  );

  const canonicalLink = manageCanonical(canonical);

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
  };
}
