import type { PageMeta } from "./guest-data.ts";

export type CollabLang = "en" | "zh";

export const COLLAB_PAGE_META: Record<CollabLang, PageMeta> = {
  en: {
    title: "Collaborate with Yuzheng Sun · 课代表立正",
    description:
      "Talks, enterprise AI programs, advisory, and long-term work with Yuzheng Sun. Podcast and creator invitations have a separate path.",
    canonical: "https://www.lizheng.ai/collab",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
  },
  zh: {
    title: "合作 · 课代表立正",
    description:
      "与课代表立正合作：演讲、企业 AI 项目、顾问与长期合作。播客、视频与创作者邀请使用独立入口。",
    canonical: "https://www.lizheng.ai/collab",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
  },
};

export const CREATOR_COLLAB_PAGE_META: Record<CollabLang, PageMeta> = {
  en: {
    title: "Podcasts & creator invitations · Yuzheng Sun",
    description:
      "Invite Yuzheng Sun to a podcast, video, or long-form conversation. Explore possible questions, recording details, editorial boundaries, and host-ready materials.",
    canonical: "https://www.lizheng.ai/collab/creators",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
  },
  zh: {
    title: "播客与创作者邀请 · 课代表立正",
    description:
      "邀请课代表立正参与播客、视频或深度对谈：可聊问题、录制方式、编辑边界与主持人素材。",
    canonical: "https://www.lizheng.ai/collab/creators",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
  },
};
