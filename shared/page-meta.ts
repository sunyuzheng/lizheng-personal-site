export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  lastModified?: string;
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
    title: "Yuzheng Sun · 孙煜征 · 课代表立正",
    description:
      "Yuzheng Sun (孙煜征, 课代表立正) has a PhD in Economics from Cornell and is the Seattle-based founder of Superlinear Academy and AI Builders.",
    canonical: "https://www.lizheng.ai/",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
    lastModified: "2026-07-21",
  },
  zh: {
    title: "课代表立正（孙煜征）｜Yuzheng Sun",
    description:
      "课代表立正，本名孙煜征。康奈尔大学经济学博士，现居西雅图；Superlinear Academy 与 AI Builders 创始人，著有《真本事》。这里有他的经历、书、访谈与合作方式。",
    canonical: "https://www.lizheng.ai/zh",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
    lastModified: "2026-07-21",
  },
};

export const ABOUT_PAGE_META: Record<SiteLang, PageMeta> = {
  en: {
    title: "Profile · Yuzheng Sun · 孙煜征",
    description:
      "A factual profile of Yuzheng Sun (孙煜征, 课代表立正): Cornell Economics PhD, career, books, current work, public conversations, and Seattle base.",
    canonical: "https://www.lizheng.ai/about",
    ogImage: "https://www.lizheng.ai/yuzheng-sun-headshot.jpg",
    lastModified: "2026-07-21",
  },
  zh: {
    title: "课代表立正（孙煜征）· 人物简介",
    description:
      "课代表立正是孙煜征公开做内容时使用的名字。他有康奈尔大学经济学博士学位，现居西雅图，创办了 Superlinear Academy 和 AI Builders。",
    canonical: "https://www.lizheng.ai/zh/about",
    ogImage: "https://www.lizheng.ai/yuzheng-sun-headshot.jpg",
    lastModified: "2026-07-21",
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
      "孙煜征的两本书：英文 Growth Data Analytics Playbook 与中文《真本事：从会工作到会赚钱》。",
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
  lastModified: "2026-07-21",
};
