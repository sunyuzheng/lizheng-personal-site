interface SeoInput {
  title: string;
  description: string;
  canonical: string;
}

function ensureDescriptionMeta() {
  let element = document.querySelector('meta[name="description"]');
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", "description");
    document.head.appendChild(element);
  }
  return element;
}

function ensureCanonicalLink() {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  return element;
}

export function applyPageSeo({ title, description, canonical }: SeoInput) {
  const previousTitle = document.title;
  const descriptionMeta = ensureDescriptionMeta();
  const canonicalLink = ensureCanonicalLink();
  const previousDescription = descriptionMeta.getAttribute("content");
  const previousCanonical = canonicalLink.getAttribute("href");

  document.title = title;
  descriptionMeta.setAttribute("content", description);
  canonicalLink.setAttribute("href", canonical);

  return () => {
    document.title = previousTitle;

    if (previousDescription === null) {
      descriptionMeta.removeAttribute("content");
    } else {
      descriptionMeta.setAttribute("content", previousDescription);
    }

    if (previousCanonical === null) {
      canonicalLink.removeAttribute("href");
    } else {
      canonicalLink.setAttribute("href", previousCanonical);
    }
  };
}
