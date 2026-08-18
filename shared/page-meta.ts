export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  lastModified?: string;
  robots?: string;
}

export type SiteLang = "en" | "zh";

export interface LanguageAlternate {
  hrefLang: "en" | "zh-CN" | "x-default";
  href: string;
}

export function languageAlternates(
  en: string,
  zh: string
): LanguageAlternate[] {
  return [
    { hrefLang: "en", href: en },
    { hrefLang: "zh-CN", href: zh },
    { hrefLang: "x-default", href: en },
  ];
}

export const HOME_PAGE_META: Record<SiteLang, PageMeta> = {
  en: {
    title: "Yuzheng Sun (课代表立正) — MAKE WHAT LASTS",
    description:
      "Yuzheng Sun (孙煜征, 课代表立正) is a Cornell Economics PhD and founder of Superlinear Academy. MAKE WHAT LASTS: turn hard-won judgment into work people keep using.",
    canonical: "https://www.lizheng.ai/",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
    lastModified: "2026-08-03",
  },
  zh: {
    title: "课代表立正（孙煜征）｜做出你的代表作",
    description:
      "课代表立正（孙煜征），康奈尔大学经济学博士、Superlinear Academy创始人。做出你的代表作：把判断和本事，做成别人真正会用、也能继续代表自己的作品。",
    canonical: "https://www.lizheng.ai/zh",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
    lastModified: "2026-08-03",
  },
};

export const ABOUT_PAGE_META: Record<SiteLang, PageMeta> = {
  en: {
    title: "Profile · Yuzheng Sun · 孙煜征",
    description:
      "A factual profile of Yuzheng Sun (孙煜征, 课代表立正): Cornell Economics PhD, career, books, current work, public conversations, and Seattle base.",
    canonical: "https://www.lizheng.ai/about",
    ogImage: "https://www.lizheng.ai/yuzheng-sun-headshot.jpg",
    lastModified: "2026-08-01",
  },
  zh: {
    title: "课代表立正（孙煜征）· 人物简介",
    description:
      "课代表立正是孙煜征公开做内容时使用的名字。他有康奈尔大学经济学博士学位，现居西雅图，创办了Superlinear Academy和AI Builders。",
    canonical: "https://www.lizheng.ai/zh/about",
    ogImage: "https://www.lizheng.ai/yuzheng-sun-headshot.jpg",
    lastModified: "2026-08-01",
  },
};

export const BOOKS_PAGE_META: Record<SiteLang, PageMeta> = {
  en: {
    title: "Books · Yuzheng Sun",
    description:
      "Books by Yuzheng Sun: Growth Data Analytics Playbook and 真本事：从会工作到会赚钱.",
    canonical: "https://www.lizheng.ai/book",
    ogImage: "https://www.lizheng.ai/book/growth-data-launch.webp",
    lastModified: "2026-07-21",
  },
  zh: {
    title: "两本书 · 课代表立正",
    description:
      "孙煜征的两本书：英文《Growth Data Analytics Playbook》与中文《真本事：从会工作到会赚钱》。",
    canonical: "https://www.lizheng.ai/zh/book",
    ogImage: "https://www.lizheng.ai/book/growth-data-launch.webp",
    lastModified: "2026-07-21",
  },
};

export const ZHENBENSHI_PAGE_META: PageMeta = {
  title: "《真本事：从会工作到会赚钱》· 孙煜征",
  description:
    "孙煜征所著《真本事：从会工作到会赚钱》，由人民邮电出版社出版。关于工作、能力、副业与长期价值的一套实践框架。",
  canonical: "https://www.lizheng.ai/zbs",
  ogImage: "https://www.lizheng.ai/book/cover-front.png",
  lastModified: "2026-07-25",
};

export const PODCAST_PAGE_META: PageMeta = {
  title: "课代表立正Podcast｜深度访谈、有用干货与真本事",
  description:
    "课代表立正的官方Podcast。收听关于AI、职业、商业和真实世界选择的深度访谈与亲身实践。",
  canonical: "https://podcast.lizheng.ai/",
  ogImage: "https://podcast.lizheng.ai/podcast/og.png",
  lastModified: "2026-08-01",
};

export const GUEST_INVITATION_PAGE_META: PageMeta = {
  title: "和课代表立正把一个重要的问题谈透",
  description:
    "课代表立正的定向嘉宾邀请：提前读你的作品与公开表达，录制时让你的答案决定下一问。",
  canonical: "https://speaker.lizheng.ai/",
  ogImage: "https://podcast.lizheng.ai/podcast/og.png",
  lastModified: "2026-08-13",
};

export const DECKS_PAGE_META: Record<SiteLang, PageMeta> = {
  en: {
    title: "Enterprise AI Training & Strategic Briefings · Yuzheng Sun",
    description:
      "Enterprise AI training, strategic briefings, and workshop decks by Yuzheng Sun, designed for teams across data, engineering, investment, and knowledge work.",
    canonical: "https://www.lizheng.ai/en/decks",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
    lastModified: "2026-08-15",
  },
  zh: {
    title: "企业AI培训与课件｜课代表立正（孙煜征）",
    description:
      "课代表立正（孙煜征）的企业AI培训与课件索引：为数据、研发、投资与知识工作团队定制的战略汇报、工作坊和公开分享。",
    canonical: "https://www.lizheng.ai/decks",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
    lastModified: "2026-08-15",
  },
};

export const DECKS_LANGUAGE_ALTERNATES: LanguageAlternate[] = [
  { hrefLang: "en", href: DECKS_PAGE_META.en.canonical },
  { hrefLang: "zh-CN", href: DECKS_PAGE_META.zh.canonical },
  { hrefLang: "x-default", href: DECKS_PAGE_META.zh.canonical },
];
