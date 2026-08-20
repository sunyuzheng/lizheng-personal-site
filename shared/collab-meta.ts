import type { PageMeta } from "./page-meta.ts";

export type CollabLang = "en" | "zh";

export const COLLAB_PAGE_META: Record<CollabLang, PageMeta> = {
  en: {
    title: "Collaborate with Yuzheng Sun · 课代表立正",
    description:
      "Work with Yuzheng Sun on talks, enterprise AI programs, advisory, and long-term projects that turn new AI capability into better work and organizational choices.",
    canonical: "https://www.lizheng.ai/collab",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
    lastModified: "2026-08-20",
  },
  zh: {
    title: "合作 · 课代表立正",
    description:
      "与课代表立正合作：把AI的新能力变成值得做的判断、重新设计的工作方式与经得起现实检验的组织选择。包括演讲、企业AI项目、顾问与长期合作。",
    canonical: "https://www.lizheng.ai/zh/collab",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
    lastModified: "2026-08-20",
  },
};

export const CREATOR_COLLAB_PAGE_META: Record<CollabLang, PageMeta> = {
  en: {
    title: "Podcast & video invitations · Yuzheng Sun",
    description:
      "Invite Yuzheng Sun for a podcast, video interview, or long-form conversation about AI, lasting work, organizational judgment, and the business of education and community. Includes proven collaboration cases and a host kit.",
    canonical: "https://www.lizheng.ai/collab/creators",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
    lastModified: "2026-08-20",
  },
  zh: {
    title: "节目邀请 · 课代表立正｜播客与视频对谈",
    description:
      "邀请课代表立正参与播客、视频访谈与长对话：围绕AI、个人作品、组织判断与教育商业，带着可追问的观点、公开证据和真实案例；附合作样本与嘉宾资料。",
    canonical: "https://www.lizheng.ai/zh/collab/creators",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
    lastModified: "2026-08-20",
  },
};
