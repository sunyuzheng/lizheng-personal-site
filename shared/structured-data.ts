import type { SiteLang } from "./page-meta.ts";
import type { GuestProfile } from "./guest-data.ts";

export const SITE_URL = "https://www.lizheng.ai";
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const SUPERLINEAR_ID = "https://www.superlinear.academy/#organization";

const PERSON_DESCRIPTION = {
  en: "Yuzheng Sun (孙煜征, 课代表立正) has a PhD in Economics from Cornell and is the Seattle-based founder of Superlinear Academy and AI Builders. He previously worked at Amazon, Meta, Tencent IEG, and Statsig.",
  zh: "课代表立正，本名孙煜征，康奈尔大学经济学博士，Superlinear Academy 与 AI Builders 创始人，现居西雅图。他曾在 Amazon、Meta、腾讯 IEG 和 Statsig 工作。",
} satisfies Record<SiteLang, string>;

function personNode(lang: SiteLang) {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Yuzheng Sun",
    alternateName: ["孙煜征", "课代表立正"],
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/yuzheng-sun-headshot.jpg`,
    description: PERSON_DESCRIPTION[lang],
    jobTitle:
      "Founder of Superlinear Academy and AI Builders; educator and author",
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "PhD in Economics",
      recognizedBy: {
        "@type": "CollegeOrUniversity",
        name: "Cornell University",
        url: "https://www.cornell.edu/",
      },
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Cornell University",
      url: "https://www.cornell.edu/",
    },
    homeLocation: {
      "@type": "City",
      name: "Seattle",
    },
    worksFor: { "@id": SUPERLINEAR_ID },
    knowsAbout: [
      "AI education",
      "organizational decision-making",
      "product experimentation",
      "data science",
      "growth analytics",
    ],
    sameAs: [
      "https://github.com/sunyuzheng",
      "https://www.linkedin.com/in/yuzhengsun/",
      "https://www.youtube.com/@kedaibiao",
      "https://space.bilibili.com/491306902",
      "https://yuzheng.substack.com/",
    ],
  };
}

function organizationNodes() {
  return [
    {
      "@type": "EducationalOrganization",
      "@id": SUPERLINEAR_ID,
      name: "Superlinear Academy",
      url: "https://www.superlinear.academy/",
      founder: { "@id": PERSON_ID },
    },
    {
      "@type": "Course",
      "@id": "https://ai-builders.com/#course",
      name: "AI Builders",
      url: "https://ai-builders.com/",
      description:
        "A structured program for moving from using AI tools to building reliable workflows, products, and systems.",
      creator: { "@id": PERSON_ID },
      provider: { "@id": SUPERLINEAR_ID },
      inLanguage: ["en", "zh-CN"],
    },
    {
      "@type": "Organization",
      "@id": "https://staysuperlinear.com/#organization",
      name: "Stay Superlinear",
      url: "https://staysuperlinear.com/",
      description:
        "A paid ongoing membership for AI practitioners and professionals, co-led by Yuzheng Sun and Yage.",
    },
  ];
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: "课代表立正",
    alternateName: ["孙煜征", "Yuzheng Sun", "lizheng.ai"],
    inLanguage: ["en-US", "zh-CN"],
    publisher: { "@id": PERSON_ID },
  };
}

function breadcrumbNode(pageUrl: string, pageName: string, homeName: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeName,
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: pageName,
        item: pageUrl,
      },
    ],
  };
}

export function buildHomeStructuredData(lang: SiteLang, canonical: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteNode(),
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name:
          lang === "en"
            ? "Yuzheng Sun · 孙煜征 · 课代表立正"
            : "课代表立正（孙煜征）｜Yuzheng Sun",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": PERSON_ID },
        mainEntity: { "@id": PERSON_ID },
        inLanguage: lang === "en" ? "en-US" : "zh-CN",
        dateModified: "2026-07-21",
      },
      personNode(lang),
      ...organizationNodes(),
    ],
  };
}

export function buildAboutStructuredData(lang: SiteLang, canonical: string) {
  const name =
    lang === "en" ? "Profile of Yuzheng Sun" : "课代表立正（孙煜征）人物简介";

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteNode(),
      {
        "@type": "ProfilePage",
        "@id": `${canonical}#profile`,
        url: canonical,
        name,
        description: PERSON_DESCRIPTION[lang],
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
        inLanguage: lang === "en" ? "en-US" : "zh-CN",
        dateModified: "2026-07-21",
      },
      personNode(lang),
      ...organizationNodes(),
      breadcrumbNode(
        canonical,
        name,
        lang === "en" ? "Yuzheng Sun" : "课代表立正"
      ),
    ],
  };
}

function growthBookNode() {
  return {
    "@type": "Book",
    "@id": `${SITE_URL}/book#growth-data-analytics-playbook`,
    name: "Growth Data Analytics Playbook",
    url: `${SITE_URL}/book#growth-data-analytics-playbook`,
    image: `${SITE_URL}/book/growth-data-analytics-playbook.jpg`,
    isbn: "9781544549828",
    datePublished: "2025-11-11",
    bookFormat: "https://schema.org/Paperback",
    inLanguage: "en",
    author: [
      { "@type": "Person", name: "Mengying Li" },
      { "@type": "Person", name: "Joe Kumar" },
      { "@id": PERSON_ID },
    ],
    publisher: { "@type": "Organization", name: "Statsig" },
    sameAs:
      "https://www.amazon.com/Growth-Data-Analytics-Playbook-Product-Market/dp/1544549822",
  };
}

function zhenbenshiBookNode() {
  return {
    "@type": "Book",
    "@id": `${SITE_URL}/zbs#book`,
    name: "真本事：从会工作到会赚钱",
    url: `${SITE_URL}/zbs`,
    image: `${SITE_URL}/book/cover-front.png`,
    isbn: "9787115690500",
    datePublished: "2026-04-01",
    bookFormat: "https://schema.org/Paperback",
    inLanguage: "zh-CN",
    author: { "@id": PERSON_ID },
    publisher: {
      "@type": "Organization",
      name: "人民邮电出版社",
    },
    sameAs:
      "https://weread.qq.com/book-detail?type=1&senderVid=4500358&v=33c32d30813abb4d6g0122ff",
  };
}

export function buildBooksStructuredData(lang: SiteLang, canonical: string) {
  const name = lang === "en" ? "Books by Yuzheng Sun" : "孙煜征的两本书";
  const growthBook = growthBookNode();
  const zhenbenshiBook = zhenbenshiBookNode();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": PERSON_ID },
        inLanguage: lang === "en" ? "en-US" : "zh-CN",
        dateModified: "2026-07-21",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: 2,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              item: { "@id": growthBook["@id"] },
            },
            {
              "@type": "ListItem",
              position: 2,
              item: { "@id": zhenbenshiBook["@id"] },
            },
          ],
        },
      },
      websiteNode(),
      personNode(lang),
      growthBook,
      zhenbenshiBook,
      breadcrumbNode(
        canonical,
        name,
        lang === "en" ? "Yuzheng Sun" : "课代表立正"
      ),
    ],
  };
}

export function buildZhenbenshiStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      zhenbenshiBookNode(),
      personNode("zh"),
      websiteNode(),
      breadcrumbNode(
        `${SITE_URL}/zbs`,
        "真本事：从会工作到会赚钱",
        "课代表立正"
      ),
    ],
  };
}

export function buildPersonWebPageStructuredData(options: {
  canonical: string;
  name: string;
  description: string;
  lang: SiteLang;
  lastModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${options.canonical}#webpage`,
        url: options.canonical,
        name: options.name,
        description: options.description,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": PERSON_ID },
        author: { "@id": PERSON_ID },
        inLanguage: options.lang === "en" ? "en-US" : "zh-CN",
        ...(options.lastModified ? { dateModified: options.lastModified } : {}),
      },
      websiteNode(),
      personNode(options.lang),
      breadcrumbNode(
        options.canonical,
        options.name,
        options.lang === "en" ? "Yuzheng Sun" : "课代表立正"
      ),
    ],
  };
}

export function buildGuestsListStructuredData(
  guests: GuestProfile[],
  description: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "课代表立正 · 超级节点嘉宾库",
    description,
    url: `${SITE_URL}/guests`,
    numberOfItems: guests.length,
    itemListElement: guests.map((guest, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: guest.guest_name,
        ...(guest.guest_en_name ? { alternateName: guest.guest_en_name } : {}),
        ...(guest.guest_title ? { jobTitle: guest.guest_title } : {}),
        ...(guest.guest_company
          ? {
              worksFor: {
                "@type": "Organization",
                name: guest.guest_company,
              },
            }
          : {}),
        url: guest.share_url,
      },
    })),
  };
}

export function buildGuestStructuredData(
  guest: GuestProfile,
  description: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${guest.guest_name} · 课代表立正`,
    description,
    url: guest.share_url,
    mainEntity: {
      "@type": "Person",
      name: guest.guest_name,
      ...(guest.guest_en_name ? { alternateName: guest.guest_en_name } : {}),
      ...(guest.guest_title ? { jobTitle: guest.guest_title } : {}),
      ...(guest.guest_company
        ? {
            worksFor: {
              "@type": "Organization",
              name: guest.guest_company,
            },
          }
        : {}),
    },
    hasPart: guest.episodes.map(episode => ({
      "@type": "CreativeWork",
      name: episode.title,
      url: episode.url,
      image: episode.thumbnailUrl,
      ...(episode.publishedAt ? { datePublished: episode.publishedAt } : {}),
    })),
  };
}
