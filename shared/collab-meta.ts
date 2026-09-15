import type { PageMeta } from "./page-meta.ts";

export type CollabLang = "en" | "zh";

export const COLLAB_PAGE_META: Record<CollabLang, PageMeta> = {
  en: {
    title: "Collaborate with Yuzheng Sun · 课代表立正",
    description:
      "Work with Yuzheng Sun on talks, organization sessions, AI Builders team enrollment, enterprise AI programs, advisory, and long-term projects.",
    canonical: "https://www.lizheng.ai/collab",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
    lastModified: "2026-09-04",
  },
  zh: {
    title: "合作 · 课代表立正",
    description:
      "与课代表立正合作：演讲、团队问题梳理会与内部交流、AI Builders团队采购、企业AI培训与定制、顾问与长期合作。",
    canonical: "https://www.lizheng.ai/zh/collab",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
    lastModified: "2026-09-04",
  },
};

export const CREATOR_COLLAB_PAGE_META: Record<CollabLang, PageMeta> = {
  en: {
    title: "Podcast & video invitations · Yuzheng Sun",
    description:
      "Invite Yuzheng Sun for a podcast, video interview, or long-form conversation. Explore defining work in the AI era, fake work, AI-native talent, and organizational judgment—with proven cross-platform cases and a complete host kit.",
    canonical: "https://www.lizheng.ai/collab/creators",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
    lastModified: "2026-09-04",
  },
  zh: {
    title: "一起做一期节目｜课代表立正·播客与视频合作",
    description:
      "和课代表立正一起做一期播客或视频节目，聊AI、工作、职业选择与创业，交换经历和看法。可以做客、串台或共同策划，团队也能参与剪辑、切片与联合发布。",
    canonical: "https://www.lizheng.ai/zh/collab/creators",
    ogImage: "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
    lastModified: "2026-09-15",
  },
};

export const ENTERPRISE_TRAINING_PAGE_META: Record<CollabLang, PageMeta> = {
  en: {
    title: "Enterprise AI training & custom programs · Yuzheng Sun",
    description:
      "Enterprise AI training that changes how work gets done: AI Builders team seats and private cohorts, course customization from $20,000 plus tuition, and fully custom programs from $100,000.",
    canonical: "https://www.lizheng.ai/collab/enterprise",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
    lastModified: "2026-09-02",
  },
  zh: {
    title: "企业AI培训与定制项目｜课代表立正",
    description:
      "让AI真正进入团队工作：AI Builders团队采购与专属班、学费之外$20,000起的课程定制，以及从真实岗位与流程开始的$100,000起完整企业项目。",
    canonical: "https://www.lizheng.ai/zh/collab/enterprise",
    ogImage: "https://www.lizheng.ai/english-network/doordash-ai-training.webp",
    lastModified: "2026-09-02",
  },
};
