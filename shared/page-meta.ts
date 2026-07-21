export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
}

export type SiteLang = "en" | "zh";

export const BOOKS_PAGE_META: Record<SiteLang, PageMeta> = {
  en: {
    title: "Books · Yuzheng Sun",
    description:
      "Books by Yuzheng Sun: Growth Data Analytics Playbook and 真本事：从会工作到会赚钱.",
    canonical: "https://www.lizheng.ai/book",
    ogImage: "https://www.lizheng.ai/book/growth-data-launch.webp",
  },
  zh: {
    title: "两本书 · 课代表立正",
    description:
      "孙煜征的两本书：英文 Growth Data Analytics Playbook 与中文《真本事：从会工作到会赚钱》。",
    canonical: "https://www.lizheng.ai/book",
    ogImage: "https://www.lizheng.ai/book/growth-data-launch.webp",
  },
};

export const ZHENBENSHI_PAGE_META: PageMeta = {
  title: "《真本事：从会工作到会赚钱》· 孙煜征",
  description:
    "孙煜征所著《真本事：从会工作到会赚钱》，由人民邮电出版社出版。关于工作、能力、副业与长期价值的一套实践框架。",
  canonical: "https://www.lizheng.ai/zbs",
  ogImage: "https://www.lizheng.ai/book/cover-front.png",
};
