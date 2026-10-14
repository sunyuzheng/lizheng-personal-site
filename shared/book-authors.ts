import { GROWTH_BOOK_ZH_PATH } from "./book-links";

// Identity links shared by the original book, Chinese edition, and chapter schemas.
// Current roles are used on the Chinese edition alongside its visible author bios.
// Sources and verification notes: docs/reviews/book-authors-2026-10-13.md.
export const GROWTH_BOOK_AUTHORS = [
  {
    id: `https://www.lizheng.ai${GROWTH_BOOK_ZH_PATH}#mengying-li`,
    name: "Mengying Li",
    linkedin: "https://www.linkedin.com/in/mengyingli/",
    jobTitle: "Fractional Head of Growth",
    organization: "Hilbert",
  },
  {
    id: `https://www.lizheng.ai${GROWTH_BOOK_ZH_PATH}#joe-kumar`,
    name: "Joe Kumar",
    linkedin: "https://www.linkedin.com/in/joekumar/",
    jobTitle: "Member of Technical Staff",
    organization: "Anthropic",
  },
  {
    id: "https://www.lizheng.ai/#person",
    name: "Yuzheng Sun",
    linkedin: "https://www.linkedin.com/in/yuzhengsun/",
    jobTitle: "Founder and CEO",
    organization: "Superlinear Academy",
  },
] as const;

export function growthBookAuthorIdentities() {
  return GROWTH_BOOK_AUTHORS.map(author => ({
    "@type": "Person",
    "@id": author.id,
    name: author.name,
    ...(author.name === "Yuzheng Sun"
      ? { alternateName: ["孙煜征", "立正", "课代表立正"] }
      : {}),
    sameAs: [author.linkedin],
  }));
}

export function growthBookAuthorProfiles() {
  return growthBookAuthorIdentities().map((identity, i) => ({
    ...identity,
    jobTitle: GROWTH_BOOK_AUTHORS[i].jobTitle,
    worksFor: {
      "@type": "Organization",
      name: GROWTH_BOOK_AUTHORS[i].organization,
    },
  }));
}
