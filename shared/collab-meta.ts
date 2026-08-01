import type { PageMeta } from "./page-meta.ts";

export type CollabLang = "en" | "zh";

export const COLLAB_PAGE_META: Record<CollabLang, PageMeta> = {
  en: {
    title: "Collaborate with Yuzheng Sun · 课代表立正",
    description:
      "Talks, enterprise AI programs, advisory, and long-term work with Yuzheng Sun. Podcast and creator invitations have a separate path.",
    canonical: "https://www.lizheng.ai/collab",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
    lastModified: "2026-07-20",
  },
  zh: {
    title: "合作 · 课代表立正",
    description:
      "与课代表立正合作：演讲、企业AI项目、顾问与长期合作。播客、视频与创作者邀请使用独立入口。",
    canonical: "https://www.lizheng.ai/zh/collab",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
    lastModified: "2026-07-20",
  },
};

export const CREATOR_COLLAB_PAGE_META: Record<CollabLang, PageMeta> = {
  en: {
    title: "Podcast & video invitations · Yuzheng Sun",
    description:
      "Invite Yuzheng Sun to discuss what is worth building in an AI-abundant world, what makes work last, and how organizations make decisions. Includes proven long-form cases and co-production support.",
    canonical: "https://www.lizheng.ai/collab/creators",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
    lastModified: "2026-08-01",
  },
  zh: {
    title: "节目邀请 · 课代表立正｜播客与视频对谈",
    description:
      "邀请课代表立正参与播客、视频访谈与深度对谈：从AI为什么让代表作更重要，到公司判断、职业成长与真实案例；另有选题、剪辑、联合发布与跨平台分发支持。",
    canonical: "https://www.lizheng.ai/zh/collab/creators",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
    lastModified: "2026-08-01",
  },
};
