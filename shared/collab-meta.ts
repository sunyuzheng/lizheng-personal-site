import type { PageMeta } from "./page-meta.ts";

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
    canonical: "https://www.lizheng.ai/zh/collab",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
  },
};

export const CREATOR_COLLAB_PAGE_META: Record<CollabLang, PageMeta> = {
  en: {
    title: "Podcast & video invitations · Yuzheng Sun",
    description:
      "Invite Yuzheng Sun to a podcast, video, or long-form conversation. See how strong conversations travel across audio and video, then grow through co-production and cross-platform distribution.",
    canonical: "https://www.lizheng.ai/collab/creators",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
  },
  zh: {
    title: "节目邀请 · 课代表立正｜播客与视频对谈",
    description:
      "邀请课代表立正参与播客、视频访谈与深度对谈。查看高质量对话如何跨音频与视频平台传播，以及联合制作、剪辑与分发资源。",
    canonical: "https://www.lizheng.ai/zh/collab/creators",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
  },
};
