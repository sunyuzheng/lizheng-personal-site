import {
  AIE_SHANGHAI_DECK_PAGE_META,
  DECKS_PAGE_META,
  type SiteLang,
} from "./page-meta.ts";
import { ENTERPRISE_TRAINING_PAGE_META } from "./collab-meta.ts";
import type { GuestProfile } from "./guest-data.ts";
import { DECK_LIBRARY, localized } from "./deck-index.ts";

export const SITE_URL = "https://www.lizheng.ai";
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const SUPERLINEAR_ID = "https://www.superlinear.academy/#organization";
export const PODCAST_URL = "https://podcast.lizheng.ai";

const PERSON_DESCRIPTION = {
  en: "Yuzheng Sun (孙煜征, 立正, 课代表立正) has a PhD in Economics from Cornell and is the Seattle-based founder of Superlinear Academy. He studies what's worth building and how judgment becomes work people keep choosing.",
  zh: "立正，本名孙煜征，亦以课代表立正为人所知；康奈尔大学经济学博士，Superlinear Academy创始人，现居西雅图。他研究什么值得做，以及怎样把判断和本事做成人们真正会用的东西。",
} satisfies Record<SiteLang, string>;

function personNode(lang: SiteLang) {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Yuzheng Sun",
    alternateName: ["孙煜征", "立正", "课代表立正"],
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/yuzheng-sun-headshot.jpg`,
    description: PERSON_DESCRIPTION[lang],
    slogan: lang === "en" ? "MAKE WHAT LASTS." : "学点真本事，做点真东西。",
    jobTitle: "Founder of Superlinear Academy; educator and author",
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
      "AI-native work",
      "knowledge work and organizational design",
      "human judgment in AI-assisted building",
      "organizational decision-making",
      "product experimentation",
      "brand strategy and taste",
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
      slogan: lang === "en" ? "MAKE WHAT LASTS." : "做点真东西。",
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
      url: "https://staysuperlinear.com/",
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
    name: "立正 · Yuzheng Sun",
    alternateName: ["孙煜征", "课代表立正", "Yuzheng Sun", "lizheng.ai"],
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
            ? "Yuzheng Sun (立正 / 课代表立正) — MAKE WHAT LASTS"
            : "立正（孙煜征，课代表立正）｜学点真本事，做点真东西",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": PERSON_ID },
        mainEntity: { "@id": PERSON_ID },
        inLanguage: lang === "en" ? "en-US" : "zh-CN",
        dateModified: "2026-09-02",
      },
      personNode(lang),
      ...organizationNodes(lang),
    ],
  };
}

export function buildPodcastStructuredData() {
  const podcastId = `${PODCAST_URL}/#podcast`;
  const cover = "https://podcast.lizheng.ai/podcast/avatar.png";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "PodcastSeries",
        "@id": podcastId,
        name: "课代表立正",
        url: `${PODCAST_URL}/`,
        description:
          "《课代表立正》是一档中文深度访谈。200+场对话里，课代表立正与AI研究者、科技创业者、一线管理者和各领域实践者反复追问：真正把事做成的人，到底做对了什么？",
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
          "课代表立正（孙煜征）的官方中文播客：与AI研究者、科技创业者、一线管理者和真实实践者深度对话，讨论AI、职业、商业与真实世界的判断。",
        mainEntity: { "@id": podcastId },
        about: { "@id": PERSON_ID },
        inLanguage: "zh-CN",
        dateModified: "2026-08-20",
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
        name: "和课代表立正把一个重要的问题谈透",
        description:
          "课代表立正的定向嘉宾邀请：提前读你的作品与公开表达，录制时让你的答案决定下一问。",
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
        dateModified: "2026-09-02",
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

export function buildEnterpriseTrainingStructuredData(lang: SiteLang) {
  const meta = ENTERPRISE_TRAINING_PAGE_META[lang];
  const serviceId = `${meta.canonical}#service`;
  const offerCatalogId = `${meta.canonical}#offers`;
  const pageName =
    lang === "en"
      ? "Enterprise AI training and custom programs"
      : "企业AI培训与定制项目";
  const courseReviews = [
    {
      name: "Shuyang",
      jobTitle: "Member of Technical Staff",
      company: "OpenAI",
      body: "There are many courses teaching you specific tricks but this course helps you build the right mindset and empower you to teach yourself more effectively.",
    },
    {
      name: "EZ",
      jobTitle: "Engineer",
      company: "Anthropic",
      body: "There can be different new tools coming, but principles remain!",
    },
    {
      name: "Chairy",
      jobTitle: "UX Manager",
      company: "Google",
      body: "The content and instruction are both outstanding and very engaging.",
    },
  ];

  const offer = (
    name: string,
    price: string,
    description: string,
    url = meta.canonical
  ) => ({
    "@type": "Offer",
    name,
    price,
    priceCurrency: "USD",
    description,
    url,
    availability: "https://schema.org/InStock",
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${meta.canonical}#webpage`,
        url: meta.canonical,
        name: pageName,
        description: meta.description,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": serviceId },
        mainEntity: { "@id": serviceId },
        inLanguage: lang === "en" ? "en-US" : "zh-CN",
        dateModified: meta.lastModified,
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name: pageName,
        description: meta.description,
        provider: { "@id": SUPERLINEAR_ID },
        serviceType: [
          "Enterprise AI training",
          "AI capability development",
          "Custom enterprise learning program",
        ],
        hasOfferCatalog: { "@id": offerCatalogId },
      },
      {
        "@type": "OfferCatalog",
        "@id": offerCatalogId,
        name:
          lang === "en" ? "Enterprise training options" : "企业培训合作方式",
        itemListElement: [
          offer(
            lang === "en"
              ? "Organization advisory session or internal conversation"
              : "团队问题梳理会或内部交流",
            "2000",
            lang === "en"
              ? "A focused organization session, starting at $2,000."
              : "面向机构的一次聚焦咨询或内部交流，$2,000起。"
          ),
          offer(
            lang === "en"
              ? "AI Builders team enrollment"
              : "AI Builders团队购课",
            "1999",
            lang === "en"
              ? "Base price per learner before published team discounts."
              : "团队折扣前的单人基础价格。",
            "https://maven.com/superlinear/aibuilders"
          ),
          offer(
            lang === "en"
              ? "Dedicated AI Builders cohort"
              : "AI Builders企业专属班",
            "44977.50",
            lang === "en"
              ? "A dedicated cohort for at least 30 learners, before optional customization."
              : "30人起的企业专属班，不含可选定制费用。"
          ),
          offer(
            lang === "en"
              ? "Course customization"
              : "基于AI Builders的课程定制",
            "20000",
            lang === "en"
              ? "Customization added to course tuition, starting at $20,000."
              : "在课程学费之外增加的企业定制，$20,000起。"
          ),
          offer(
            lang === "en"
              ? "Fully custom enterprise AI program"
              : "完整定制企业AI项目",
            "100000",
            lang === "en"
              ? "End-to-end diagnosis, design, curriculum, delivery, and reusable team assets, starting at $100,000."
              : "从诊断、设计、课程到交付与团队资产的完整定制项目，$100,000起。"
          ),
        ],
      },
      {
        "@type": "Course",
        "@id": "https://ai-builders.com/#course",
        name: "AI Builders 2027: Build Useful Things with AI",
        url: "https://maven.com/superlinear/aibuilders",
        description:
          lang === "en"
            ? "An instructor-led, project-based course for choosing useful AI problems, building complete systems, and making the results reliable."
            : "一门以项目为核心的讲师带领课程，帮助学员选择值得做的AI问题、搭建完整系统，并把结果做得可靠。",
        provider: { "@id": SUPERLINEAR_ID },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5.0",
          bestRating: "5",
          ratingCount: 84,
          reviewCount: 56,
        },
        review: courseReviews.map(review => ({
          "@type": "Review",
          url: "https://maven.com/superlinear/aibuilders#reviews",
          reviewBody: review.body,
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
          },
          author: {
            "@type": "Person",
            name: review.name,
            jobTitle: review.jobTitle,
            worksFor: {
              "@type": "Organization",
              name: review.company,
            },
          },
        })),
      },
      websiteNode(),
      personNode(lang),
      ...organizationNodes(lang),
      breadcrumbNode(
        meta.canonical,
        pageName,
        lang === "en" ? "Yuzheng Sun" : "课代表立正"
      ),
    ],
  };
}

export function buildDeckLibraryStructuredData(lang: SiteLang) {
  const canonical = DECKS_PAGE_META[lang].canonical;
  const { title: name, description } = DECKS_PAGE_META[lang];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name,
        description,
        about: { "@id": PERSON_ID },
        author: { "@id": PERSON_ID },
        inLanguage: lang === "en" ? "en-US" : "zh-CN",
        dateModified: DECKS_PAGE_META[lang].lastModified,
        mainEntity: { "@id": `${canonical}#decks` },
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#decks`,
        name,
        numberOfItems: DECK_LIBRARY.length,
        itemListElement: DECK_LIBRARY.map((deck, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "CreativeWork",
            name: deck.title,
            ...(deck.href ? { url: deck.href } : {}),
            datePublished: deck.date,
            inLanguage: deck.language === "en" ? "en" : "zh-CN",
            description: localized(deck.takeaway, lang),
            creator: { "@id": PERSON_ID },
          },
        })),
      },
      websiteNode(),
      personNode(lang),
      breadcrumbNode(
        canonical,
        name,
        lang === "en" ? "Yuzheng Sun" : "课代表立正"
      ),
    ],
  };
}

export function buildAieShanghaiDeckStructuredData() {
  const canonical = AIE_SHANGHAI_DECK_PAGE_META.canonical;
  const documentId = `${canonical}#deck`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: AIE_SHANGHAI_DECK_PAGE_META.title,
        description: AIE_SHANGHAI_DECK_PAGE_META.description,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": documentId },
        inLanguage: "zh-CN",
        dateModified: AIE_SHANGHAI_DECK_PAGE_META.lastModified,
      },
      {
        "@type": "PresentationDigitalDocument",
        "@id": documentId,
        name: "把全球AI工程师网络与上海产业生态连接起来",
        description: AIE_SHANGHAI_DECK_PAGE_META.description,
        url: canonical,
        image: AIE_SHANGHAI_DECK_PAGE_META.ogImage,
        datePublished: "2026-08-24",
        inLanguage: "zh-CN",
        author: { "@id": PERSON_ID },
        about: {
          "@type": "Event",
          name: "AI Engineer Shanghai 2026",
          startDate: "2026-11-05",
          endDate: "2026-11-06",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: "上海虹桥祥源希尔顿",
            address: {
              "@type": "PostalAddress",
              addressLocality: "上海",
              addressCountry: "CN",
            },
          },
        },
      },
      websiteNode(),
      personNode("zh"),
      breadcrumbNode(canonical, "AIE Shanghai 2026合作会谈", "课代表立正"),
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
