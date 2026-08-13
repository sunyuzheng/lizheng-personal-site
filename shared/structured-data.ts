import type { SiteLang } from "./page-meta.ts";
import type { GuestProfile } from "./guest-data.ts";

export const SITE_URL = "https://www.lizheng.ai";
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const SUPERLINEAR_ID = "https://www.superlinear.academy/#organization";
export const PODCAST_URL = "https://podcast.lizheng.ai";

const PERSON_DESCRIPTION = {
  en: "Yuzheng Sun (孙煜征, 课代表立正) has a PhD in Economics from Cornell and is the Seattle-based founder of Superlinear Academy and AI Builders. He previously worked at Amazon, Meta, Tencent IEG, and Statsig.",
  zh: "课代表立正，本名孙煜征，康奈尔大学经济学博士，Superlinear Academy与AI Builders的创始人，现居西雅图。他曾在Amazon、Meta、腾讯IEG和Statsig工作。",
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
    slogan: lang === "en" ? "MAKE WHAT LASTS." : "做出你的代表作。",
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

function organizationNodes(lang: SiteLang) {
  return [
    {
      "@type": "EducationalOrganization",
      "@id": SUPERLINEAR_ID,
      name: "Superlinear Academy",
      url: "https://www.superlinear.academy/",
      slogan: lang === "en" ? "MAKE WHAT LASTS." : "做出你的代表作。",
      founder: { "@id": PERSON_ID },
    },
    {
      "@type": "Course",
      "@id": "https://ai-builders.com/#course",
      name: "AI Builders",
      url: "https://ai-builders.com/",
      description:
        "A long-term AI learning system co-taught by Yuzheng Sun and Yage that translates understanding across models, engineering, products, and organizations into capabilities learners can practice, correct, and transfer to their own problems.",
      creator: { "@id": PERSON_ID },
      provider: { "@id": SUPERLINEAR_ID },
      inLanguage: ["en", "zh-CN"],
    },
    {
      "@type": "Organization",
      "@id": "https://stay.superlinear.academy/#organization",
      name: "Stay Superlinear",
      url: "https://stay.superlinear.academy/",
      description:
        "A paid year-round content and practitioner membership with deep analysis, guest masterclasses, Q&A, courses, Skills, recordings, discussion, and a searchable archive. Yage contributes as a long-term teaching partner and technical authority.",
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
            ? "Yuzheng Sun (课代表立正) — MAKE WHAT LASTS"
            : "课代表立正（孙煜征）｜做出你的代表作",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": PERSON_ID },
        mainEntity: { "@id": PERSON_ID },
        inLanguage: lang === "en" ? "en-US" : "zh-CN",
        dateModified: "2026-08-03",
      },
      personNode(lang),
      ...organizationNodes(lang),
    ],
  };
}

export function buildPodcastStructuredData() {
  const podcastId = `${PODCAST_URL}/#podcast`;
  const cover =
    "https://img.transistorcdn.com/_uKueNmEg-Ah4w9L4nrA6Mw-NP5fl0crXikpxBcfSbM/rs:fill:0:0:1/w:1400/h:1400/q:60/mb:500000/aHR0cHM6Ly9pbWct/dXBsb2FkLXByb2R1/Y3Rpb24udHJhbnNp/c3Rvci5mbS9jYzZl/YWYzMjA5NzJiMDY4/MjIxOGE0ZjYwMzY0/ODQ1ZC5qcGc.jpg";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "PodcastSeries",
        "@id": podcastId,
        name: "课代表立正",
        url: `${PODCAST_URL}/`,
        description:
          "课代表立正的官方Podcast。深度访谈，有用干货，亲身验证的「真本事」。",
        image: cover,
        webFeed: "https://feeds.transistor.fm/kedaibiao",
        author: { "@id": PERSON_ID },
        inLanguage: "zh-CN",
        sameAs: [
          "https://podcasts.apple.com/us/podcast/%E8%AF%BE%E4%BB%A3%E8%A1%A8%E7%AB%8B%E6%AD%A3/id1859339631",
          "https://open.spotify.com/show/4YoFrN0YArKCIqZq46yHr3",
          "https://www.xiaoyuzhoufm.com/podcast/6934fbe84ef12f9fe94eed5f",
          "https://www.youtube.com/@kedaibiao",
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${PODCAST_URL}/#webpage`,
        url: `${PODCAST_URL}/`,
        name: "课代表立正Podcast",
        description:
          "收听关于AI、职业、商业和真实世界选择的深度访谈与亲身实践。",
        mainEntity: { "@id": podcastId },
        about: { "@id": PERSON_ID },
        inLanguage: "zh-CN",
        dateModified: "2026-08-01",
      },
      personNode("zh"),
    ],
  };
}

export function buildPodcastGuestInvitationStructuredData() {
  const canonical = "https://speaker.lizheng.ai/";
  const podcastId = `${PODCAST_URL}/#podcast`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: "来和课代表立正谈一个真正重要的问题",
        description:
          "课代表立正的定向嘉宾邀请：从作品和原始材料开始，用一场长对话把一个真正重要的问题谈清楚。",
        isPartOf: { "@id": podcastId },
        about: { "@id": PERSON_ID },
        author: { "@id": PERSON_ID },
        inLanguage: "zh-CN",
        dateModified: "2026-08-13",
      },
      {
        "@type": "PodcastSeries",
        "@id": podcastId,
        name: "课代表立正",
        url: `${PODCAST_URL}/`,
        webFeed: "https://feeds.transistor.fm/kedaibiao",
        author: { "@id": PERSON_ID },
        inLanguage: "zh-CN",
      },
      personNode("zh"),
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
        dateModified: "2026-08-01",
      },
      personNode(lang),
      ...organizationNodes(lang),
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
