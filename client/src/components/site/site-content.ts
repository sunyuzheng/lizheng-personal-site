import type { Lang } from "@/contexts/LanguageContext";

export const COMMUNITY_URL = "https://www.superlinear.academy/";
export const CONTACT_EMAIL = "yz@superlinear.academy";
export const SHOP_URL = "https://shop.lizheng.ai/";

/** Pages reachable from the shared header's "More" menu and the footer. */
export type SitePage = "about" | "book" | "decks" | "collab";

/** Homepage sections in page order, keyed by their stable element ids. */
export const HOME_SECTIONS = [
  { id: "works", zh: "代表作", en: "Work" },
  { id: "superlinear", zh: "超线性学院", en: "Academy" },
  { id: "conversations", zh: "对话", en: "Conversations" },
  { id: "judgment", zh: "判断", en: "Calls" },
  { id: "thinking", zh: "文章", en: "Writing" },
  { id: "ask", zh: "问问立正", en: "Ask Lizheng" },
] as const;

export const SITE_PAGES: Array<{
  page: SitePage;
  href: string;
  zh: string;
  en: string;
}> = [
  { page: "about", href: "/about", zh: "关于我", en: "About" },
  { page: "book", href: "/book", zh: "书", en: "Books" },
  { page: "decks", href: "/decks", zh: "演讲资料", en: "Talks & slides" },
  { page: "collab", href: "/collab", zh: "合作", en: "Collaborate" },
];

export const SITE_COPY = {
  zh: {
    name: "孙煜征",
    alias: "课代表立正",
    brandLabel: "孙煜征 · 课代表立正，回到首页",
    navLabel: "主导航",
    more: "更多",
    join: "免费加入社区",
    menuOpen: "打开菜单",
    menuClose: "关闭菜单",
    homeGroup: "首页",
    moreGroup: "更多",
    switchLabel: "Switch to English",
    footerName: "孙煜征 · 立正",
    footerBio: [
      "超线性学院创始人，《真本事》作者，",
      "「课代表立正」主理人。学点真本事，做点真东西。",
    ],
    footerMore: "更多",
    footerFollow: "关注",
    shop: "周边店",
    email: "邮件",
    rights: "孙煜征 · Yuzheng Sun",
  },
  en: {
    name: "Yuzheng Sun",
    alias: "立正",
    brandLabel: "Yuzheng Sun · 立正, back to the homepage",
    navLabel: "Main",
    more: "More",
    join: "Join free",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    homeGroup: "Homepage",
    moreGroup: "More",
    switchLabel: "切换到中文",
    footerName: "Yuzheng Sun · 立正",
    footerBio: [
      "Founder of Superlinear Academy. Cornell PhD in Economics.",
      "Make what lasts.",
    ],
    footerMore: "More",
    footerFollow: "Follow",
    shop: "Shop",
    email: "Email",
    rights: "Yuzheng Sun · 孙煜征",
  },
} satisfies Record<Lang, Record<string, string | string[]>>;
