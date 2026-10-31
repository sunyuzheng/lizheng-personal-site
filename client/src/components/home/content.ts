import type { Lang } from "@/contexts/LanguageContext";
import {
  FLP_AMAZON_URL,
  GROWTH_BOOK_AMAZON_URL,
  GROWTH_BOOK_ZH_PATH,
} from "@shared/book-links";

// Homepage copy and curation for / (English) and /zh. Facts and wording follow
// the reviewed homepage handoff of 2026-09-30; see
// docs/reviews/homepage-redesign-2026-09-30.md for sources and boundaries.

export const LINKS = {
  community: "https://www.superlinear.academy/",
  aiBuilders: "https://ai-builders.com/",
  stay: "https://stay.superlinear.academy/",
  youtube: "https://www.youtube.com/@kedaibiao",
  florence:
    "https://www.superlinear.academy/c/ai-resources/ai-second-renaissance-florence",
  chatgptEssay: "https://www.superlinear.academy/c/ai-resources/chatgpt",
  chatgptTalk: "https://youtu.be/mQveBlevbZo",
  growthBook: GROWTH_BOOK_AMAZON_URL,
  growthBookZh: GROWTH_BOOK_ZH_PATH,
  // Feels Like Progress on Amazon (paperback; the page also offers the Kindle edition).
  flpAmazon: FLP_AMAZON_URL,
  openContext: "https://github.com/sunyuzheng/lizheng-open-context",
  askLizheng: "https://ask.lizheng.ai/",
  // The community as a city of connections (client/community-app).
  connections: "https://city.lizheng.ai/",
  connectionsEn: "https://city.lizheng.ai/en",
  // What is inside the free community, as the academy chapter lists it: the Knowledge Bank (in
  // Chinese and in English), member projects, open trainings, and collaboration and hiring posts.
  knowledgeBank: "https://www.superlinear.academy/c/ai-resources/",
  knowledgeBankEn: "https://www.superlinear.academy/c/ai-resources-en/",
  projects: "https://www.superlinear.academy/c/share-your-projects/",
  openTrainings: "https://www.superlinear.academy/c/public/",
  collaborate: "https://www.superlinear.academy/c/collaborate/",
  // Feedback and reports on 问问立正: comments under the community post that introduced it.
  askFeedback: "https://www.superlinear.academy/c/tools/ask-lizheng",
  // AI Engineer Shanghai 2026. The event's first screen lists its organizers, Mengying Li and
  // Yuzheng Sun, and its organizing team section calls both 联合主办人 / Co-organizer.
  aieShanghai: "https://www.ai.engineer/shanghai/2026",
  aieShanghaiZh: "https://www.ai.engineer/shanghai/2026?lang=cn",
};

// Section ids keep the pre-redesign anchor names, so /#judgment,
// /en#conversations and older links (/zh#… redirects to /#…) still land in
// the right place.
export const SECTION = {
  hero: "hero",
  works: "works",
  books: "books",
  talks: "conversations",
  calls: "judgment",
  writing: "thinking",
  ask: "ask",
  academy: "superlinear",
  join: "join",
  enterprise: "collaboration",
} as const;

/** Inline rich text: plain strings, emphasis, or links. */
export type Inline =
  | string
  | { strong: string }
  | { link: string; href: string };

export interface Guest {
  name: string;
  role: string;
  image: string;
  /** Guest detail page slug under /guests. */
  slug?: string;
  /** External destination when the guest has no detail page. */
  href?: string;
}

const GUEST_IMAGE = (file: string) => `/home/guests/${file}.webp`;

const GUESTS = {
  tian: {
    slug: "tian-yuandong",
    image: GUEST_IMAGE("g-tian"),
    zh: ["田渊栋", "前Meta FAIR研究总监"],
    en: ["Yuandong Tian", "Former Research Director, Meta FAIR"],
  },
  bi: {
    slug: "shuchao-bi",
    image: GUEST_IMAGE("g-bi"),
    zh: ["毕树超", "YouTube Shorts联合创始人 · 前OpenAI多模态后训练负责人"],
    en: [
      "Shuchao Bi",
      "Co-founder, YouTube Shorts · Former Multimodal Post-Training Lead, OpenAI",
    ],
  },
  xin: {
    slug: "reynold-xin",
    image: GUEST_IMAGE("g-xin"),
    zh: ["Reynold Xin", "Databricks联合创始人、首席架构师"],
    en: ["Reynold Xin", "Co-founder & Chief Architect, Databricks"],
  },
  raji: {
    slug: "vijaye-raji",
    image: GUEST_IMAGE("g-raji"),
    zh: ["Vijaye Raji", "OpenAI应用CTO · Statsig创始人"],
    en: ["Vijaye Raji", "CTO of Applications, OpenAI · Founder, Statsig"],
  },
  liu: {
    slug: "liu-jia",
    image: GUEST_IMAGE("g-liu"),
    zh: ["刘嘉", "清华大学讲席教授"],
    en: ["Liu Jia", "Chair Professor, Tsinghua University"],
  },
  xu: {
    slug: "howie-xu",
    image: GUEST_IMAGE("g-xu"),
    zh: ["硅谷徐老师", "Howie Xu · Gen首席AI与创新官"],
    en: ["Howie Xu", "Chief AI & Innovation Officer, Gen"],
  },
  yang: {
    slug: "yang-ying",
    image: GUEST_IMAGE("g-yang"),
    zh: ["屠龙大实话", "神经科学博士 · 连续创业者"],
    en: ["Yang Ying", "Neuroscience PhD · Serial entrepreneur"],
  },
  wei: {
    slug: "wei-manfredi",
    image: GUEST_IMAGE("g-wei"),
    zh: ["魏慧", "洲际酒店集团AI与架构高级副总裁"],
    en: ["Wei Manfredi", "SVP, AI & Architecture, IHG Hotels & Resorts"],
  },
  vernal: {
    slug: "mike-vernal",
    image: GUEST_IMAGE("g-vernal"),
    zh: ["Mike Vernal", "Conviction合伙人 · 前红杉合伙人、Facebook副总裁"],
    en: [
      "Mike Vernal",
      "Partner, Conviction · Former Sequoia partner & Facebook VP",
    ],
  },
  evans: {
    slug: "ethan-evans",
    image: GUEST_IMAGE("g-evans"),
    zh: ["Ethan Evans", "前Amazon副总裁 · 高管教练"],
    en: ["Ethan Evans", "Former Amazon VP · Executive coach"],
  },
  orosz: {
    // No guest page yet; the English conversation is on YouTube.
    href: "https://www.youtube.com/watch?v=-WvvJBd3hDI",
    image: GUEST_IMAGE("g-orosz"),
    zh: ["Gergely Orosz", "The Pragmatic Engineer创始人"],
    en: ["Gergely Orosz", "Founder, The Pragmatic Engineer"],
  },
  zhou: {
    slug: "zhou-nan",
    image: GUEST_IMAGE("g-zhou"),
    zh: ["周楠", "硅谷科技投资人 · Cerebras早期投资人"],
    en: [
      "Nan Zhou",
      "Silicon Valley tech investor · Early investor in Cerebras",
    ],
  },
  kevin: {
    slug: "kevin-chen",
    image: GUEST_IMAGE("g-kevin"),
    zh: ["Kevin Chen", "MIT电气工程与计算机科学副教授"],
    en: ["Kevin Chen", "Associate Professor, MIT EECS"],
  },
} as const;

type GuestKey = keyof typeof GUESTS;

function guestsFor(lang: Lang, keys: GuestKey[]): Guest[] {
  return keys.map(key => {
    const guest = GUESTS[key];
    const [name, role] = guest[lang];
    return {
      name,
      role,
      image: guest.image,
      ...("slug" in guest ? { slug: guest.slug } : { href: guest.href }),
    };
  });
}

export interface Scene {
  image: string;
  alt: string;
  caption: string;
  /** Where the room can be seen: a page on this site ("/…"), a video or a replay. */
  href: string;
}

/** A guest in the "also with" strip, linked to their page or conversation. */
export interface AlsoGuest {
  name: string;
  slug?: string;
  href?: string;
}

// Only rooms where Yuzheng is the one on stage: teaching, moderating, speaking.
const SCENE_IMAGES = [
  "doordash-ai-training",
  "causal-debate",
  "mike-develin",
  "pinterest-data-science",
].map(name => `/english-network/${name}.webp`);

const SCENE_LINKS = [
  "/collab/enterprise",
  "https://www.youtube.com/watch?v=tneRWgZGWxM",
  "https://youtu.be/3Nxxg2oX1mo",
  "https://www.superlinear.academy/c/public/sections/900177/lessons/3409683",
];

function scenes(copy: Array<[alt: string, caption: string]>): Scene[] {
  return copy.map(([alt, caption], index) => ({
    image: SCENE_IMAGES[index],
    alt,
    caption,
    href: SCENE_LINKS[index],
  }));
}

const also = (name: string, target: string): AlsoGuest =>
  target.startsWith("http") ? { name, href: target } : { name, slug: target };

export interface PublicCall {
  date: string;
  title: string;
  claim: string;
  sources: Array<[label: string, href: string]>;
  /** Wait behind 「再看另外N条判断」 so the chapter opens with the key calls. */
  fold?: boolean;
  /** Featured calls stay open, with their key line and sometimes an image. */
  feature?: {
    badge: string;
    quote: string;
    image?: {
      src: string;
      alt: string;
      width: number;
      height: number;
      href: string;
      video: boolean;
    };
  };
}

export interface Essay {
  date: string;
  title: string;
  line: string;
  href: string;
}

/** One thing the free community holds, as the academy chapter lists them under its head. */
export interface CityPlace {
  title: string;
  body: string;
  href: string;
}

export interface CityCopy {
  label: (count: string) => string;
  fallbackLabel: string;
  caption: (count: string) => [string, string];
  fallbackCaption: [string, string];
  updated: (date: string) => string;
  open: string;
  openNamed: (name: string) => string;
  joined: (year: number, month: number) => string;
  /** Labels shown under the member card's figures. */
  posts: (count: number) => string;
  comments: (count: number) => string;
  /** Between the parts of the member card, for screen readers. */
  separator: string;
  /** Inside the search box while it is empty (shorter in English). */
  random: string;
  randomLabel: string;
  find: {
    label: string;
    placeholder: string;
    empty: (query: string) => string;
  };
  join: string;
}

/**
 * The homepage window onto city.lizheng.ai (CityWindow.tsx). Its member card
 * borrows the dot map's words for when someone joined and their posts and
 * comments (CityCopy).
 */
export interface WindowCopy {
  caption: (count: string) => [string, string];
  label: (count: string, links: string) => string;
  /** The way in: the frame's corner on hover, and beside the join button. */
  enter: string;
  /** The label under the number of people someone is in touch with. */
  linked: (count: number) => string;
  /** On a person's card while pointing: what a click does. */
  hint: string;
  /** The ways on from an open card, and closing it. */
  profile: string;
  explore: string;
  close: string;
  /** For a member who has asked not to be named. */
  someone: string;
  updated: (date: string) => string;
}

const zh = {
  hero: {
    // The header, the seal and the lede already name him; English keeps the
    // line because it is where readers learn what the seal says.
    kicker: "",
    title: ["学点真本事，", "做点真东西。"],
    lede: [
      "我是立正，创办了",
      { strong: "超线性学院" },
      "，两万多人在这里学着用AI做东西。从2020年起，我和顶尖研究者、创业者做了200多场深度对话，再把学到的带回教学和真实的工作里。",
    ] as Inline[],
    primary: "免费加入超线性学院",
    secondary: "看我的对话",
  },
  career: {
    label: "履历",
    title: "履历",
    line: "从研究、大厂到创业，一路离真实的用户和结果越来越近",
    steps: [
      { org: "康奈尔大学", latin: false, role: ["经济学博士"] },
      { org: "Amazon", latin: true, role: ["经济学家"] },
      { org: "Meta", latin: true, role: ["数据科学家"] },
      {
        org: "腾讯IEG",
        latin: false,
        // "|" marks where a narrow column may break (Phrases), so no character is left alone on a line.
        role: ["增长数据科学|与AI总监", "带领30人团队"],
      },
      {
        org: "Statsig",
        latin: true,
        role: ["Principal|数据科学家", "OpenAI收购团队|早期成员"],
      },
      { org: "超线性学院", latin: false, role: ["创始人 · 全职投入"] },
    ],
  },
  proof: {
    label: "受邀机构与同行评价",
    // One row on a laptop: the names a reader knows at a glance, then 等. Binance, Safeway, Monzo,
    // FlowGPT, 华盛顿大学 and 美国统计协会 were also listed until 2026-10-12; 等 stands for them.
    orgsLabel: "受邀分享与培训",
    orgs: [
      ["Amazon"],
      ["Netflix"],
      ["LinkedIn"],
      ["Walmart"],
      ["Pinterest"],
      ["DoorDash"],
      ["腾讯", "zh"],
      ["美团", "zh"],
      ["小红书", "zh"],
      ["哥伦比亚大学", "zh"],
    ] as Array<[string, "zh"?]>,
    orgsMore: "等",
    // Where the talks and trainings can be looked at, in the label column as 读完整评价 is below.
    orgsLink: "看演讲资料",
    // The other direction, under the places that invited him: a conference he co-organizes. One
    // line with no tense, so it reads the same before and after the event; the link opens the
    // event's own site, whose first screen names its organizers.
    cohost: {
      label: "联合主办",
      name: "AI Engineer 上海站",
      // What it is, then when; side by side on a laptop, one under the other on a phone.
      note: ["硅谷的AI工程师大会第一次来中国", "2026年11月5–6日"],
      link: "大会官网",
      href: LINKS.aieShanghaiZh,
    },
  },
  scenesLabel: "现场",
  scenes: scenes([
    [
      "DoorDash数据分析团队线下AI培训现场",
      "DoorDash Analytics团队线下AI培训 · 西雅图",
    ],
    [
      "主持Statsig实验与因果推断辩论",
      "主持Statsig「实验vs因果推断」辩论：Amazon、Meta、Causara",
    ],
    [
      "在Significance Summit的舞台上与Mike Develin对谈",
      "Significance Summit × Acquired现场",
    ],
    [
      "Pinterest数据科学团队分享",
      "Pinterest数据科学团队分享：Augmenting Data Science in the AI Era",
    ],
  ]),
  // The books chapter (the stable id stays "works"). The show is the conversations chapter and
  // the academy is the city, so this chapter is only the books: the new English book first.
  works: {
    eyebrow: "书",
    title: ["想清楚的事，", "写成了书。"],
    intro:
      "一本讲假工作、假学习和AI时代什么会留下来；一本写给想靠能力、而不是靠头衔立足的人；一本写给做产品和增长的人。",
    flp: {
      meta: "著 · 英文 · 2026",
      title: "Feels Like Progress",
      body: "AI会先把假工作吹大，再让它大幅贬值。什么还留得下来？一本讲假工作、假学习的英文书。",
      go: "在Amazon查看",
      alt: "《Feels Like Progress》封面",
    },
    zbs: {
      meta: "著 · 人民邮电出版社 · 2026",
      title: "真本事：从会工作到会赚钱",
      body: "拿掉证书、职位和公司名以后，你还真正会什么？一本讲能力、主动性和收入的书。",
      go: "了解这本书",
      alt: "《真本事：从会工作到会赚钱》封面",
    },
    growth: {
      meta: "合著 · 入选2025年WSJ CIO Journal书单",
      title: "Growth Data Analytics Playbook",
      body: "讲产品市场匹配、增长与实验的实战书。与Mengying Li、Joe Kumar合著。中文版可以免费读。",
      go: "免费读中文版",
      alt: "《Growth Data Analytics Playbook》封面",
    },
  },
  // The show: the eyebrow says what kind of thing it is and the title names it, as Ask does.
  talks: {
    eyebrow: "访谈节目",
    title: ["课代表立正"],
    intro:
      "从2020年开始，我和研究者、创业者、投资人做了200多场长谈。聊他们看见了什么，为什么敢下注，现实又怎样改写了答案。",
    // Six faces, one row (Yuzheng's choice, 2026-10-12); everyone else is a name in the strip below.
    guests: guestsFor("zh", ["tian", "vernal", "evans", "xu", "wei", "yang"]),
    alsoLabel: "还聊过",
    alsoAria: "更多对话嘉宾",
    also: [
      also("毕树超", "shuchao-bi"),
      also("Reynold Xin", "reynold-xin"),
      also("Vijaye Raji", "vijaye-raji"),
      also("刘嘉", "liu-jia"),
      also("Gergely Orosz", "https://www.youtube.com/watch?v=-WvvJBd3hDI"),
      also("周楠", "zhou-nan"),
      also("樊登", "fan-deng"),
      also("Leon", "leon"),
      also("尚书", "https://www.youtube.com/watch?v=vCzj0Fth_8A"),
      also("郭宇", "guo-yu"),
      also("戴雨森", "dai-yusen"),
      also("杜磊", "du-lei"),
      also("Indigo", "indigo"),
      also("Ryo Lu", "ryo-lu"),
      also("查晟", "zha-sheng"),
      also("佘昶", "https://www.superlinear.academy/c/ai-resources/lancedb"),
      also(
        "韦晓亮",
        "https://www.superlinear.academy/c/ai-resources/result-certainty-general-intelligence-wei-xiaoliang"
      ),
      also("夏淳", "https://www.superlinear.academy/c/posts/xiachun"),
      also("刘未末", "https://www.superlinear.academy/c/main/puppygraph"),
      also("Kevin Chen", "kevin-chen"),
      also("董有超", "devin-dong"),
      also("Vivian Wang", "vivian-wang"),
    ],
    // The chapter's picture: Yuzheng on the Significance Summit stage with Acquired's hosts. It sets the
    // scale of the show for those who know them; it is not an episode to watch, so it has no link,
    // play button or title, only the event's name.
    stage: {
      image: "/english-network/acquired.webp",
      alt: "在Significance Summit的舞台上，与Acquired主持人Ben Gilbert、David Rosenthal对谈",
      caption: "Significance Summit × Acquired",
    },
    all: "浏览全部200+场对话",
    subscribe: "在YouTube订阅",
  },
  calls: {
    eyebrow: "公开判断",
    title: ["先把判断写下来，", "再让时间检验。"],
    intro: "说对的，说错的，都留在原处，每一条都附上当时的原始记录。",
    listLabel: "公开判断时间线",
    sources: "原始记录",
    // The calls marked fold wait until asked (on every screen since 2026-10-12); the key ones stay open.
    more: (count: number) => `再看另外${count}条判断`,
    less: "收起",
    items: [
      {
        date: "2021.04",
        fold: true,
        title: "上一代AI的|天花板在哪里",
        claim:
          "主流的机器学习从标注数据里学“对应关系”，能把窄场景自动化得很好，但不会因此获得对世界的通用理解。选AI应用，要看机制和任务结构，而不是benchmark上的表演。",
        sources: [
          [
            "视频：为什么图灵测试不能检测人工智能？",
            "https://youtu.be/M2Yv3D8NDHY",
          ],
          ["视频：什么样的机器学习真正有效？", "https://youtu.be/sNJ09NOqBXk"],
        ],
      },
      {
        date: "2023.02",
        title: "关于ChatGPT|最重要的五个问题",
        claim:
          "从机制推演了推理成本会大幅下降、长期记忆与个性化、连接工具的工作流、直接交付结果，以及围绕ChatGPT重建的系统。在中文互联网广泛传阅。",
        sources: [
          [
            "GPT-4发布前的公开存档",
            "https://www.huxiu.com/article/812076.html",
          ],
          ["读全文", LINKS.chatgptEssay],
        ],
        feature: {
          badge: "写于GPT-4发布前",
          quote:
            "ChatGPT是“自然语言计算机”，是人类调用数据与算力的近乎完美的形态。",
        },
      },
      {
        date: "2025.01",
        title: "2025年，AI最大的机会是Agents",
        claim:
          "Agentic AI是近期最重要的变化。从2025年初开始，先行者大约有10到18个月的窗口期。",
        sources: [
          ["视频：如何抓住18个月的窗口期", "https://youtu.be/FzbkAy0DcQk"],
          [
            "文章：AI Agents的第一性原理定义",
            "https://www.superlinear.academy/c/posts/ai-agents",
          ],
        ],
      },
      {
        date: "2025.03",
        fold: true,
        title: "MCP有结构性缺陷",
        claim:
          "MCP的热度超过了它能可靠交付的东西，协议本身有重大的结构性问题。",
        sources: [["视频", "https://youtu.be/kwwjR6HHJPM"]],
      },
      {
        date: "2026.03",
        fold: true,
        title: "为什么OpenClaw一定会凉，但仍然值得一试",
        claim: "这个产品品类不会持久；但亲手试一试，能帮你理解这一轮能力变化。",
        sources: [["视频", "https://youtu.be/h_yCYBRzbVw"]],
      },
      {
        date: "2026.09",
        title: "通过Jev，|辨清AI新技术的叙事陷阱",
        claim:
          "新技术常先让你接受什么才算“厉害”，再证明自己厉害。五层判断帮你跳出叙事陷阱：理解技术、明确边界、拿回评价标准、找到真正合理的比较对象，再判断这个问题值不值得投入。",
        sources: [
          [
            "读文章",
            "https://www.superlinear.academy/c/ai-resources/ai-builders-learning-path",
          ],
          ["看视频", "https://www.youtube.com/watch?v=kYuolIPDeRQ"],
        ],
        feature: {
          badge: "如何判断炒作",
          quote:
            "判断一项新技术是不是炒作，最要紧的是找到真正的对标：它最好的替代方案是什么。",
          image: {
            src: "/home/works/jev-video.webp",
            alt: "视频封面：如何炒作一个AI概念？以Jev为例",
            width: 960,
            height: 540,
            href: "https://www.youtube.com/watch?v=kYuolIPDeRQ",
            video: true,
          },
        },
      },
    ] as PublicCall[],
  },
  writing: {
    eyebrow: "文章",
    title: ["最近在想的事"],
    intro:
      "在教学、访谈和做产品的过程中，反复遇到的问题。每篇都尽量讲到能被检验的程度。",
    essays: [
      {
        date: "2026.09",
        title: "AI会带来第二次文艺复兴，我们需要自己的佛罗伦萨",
        line: "人从生产的工具，重新成为生产的目的。",
        href: LINKS.florence,
      },
      {
        date: "2026.08",
        title: "如何识别与消灭|fake work",
        line: "Fake work，就是用可见的动作，代替难以衡量的价值。",
        href: "https://www.superlinear.academy/c/ai-resources/fake-work",
      },
      {
        date: "2026.04",
        title: "为什么所有人都在学名词，但真正拉开差距的是动词",
        line: "名词是零件。动词是组装能力。",
        href: "https://www.superlinear.academy/c/ai-resources/verb",
      },
      {
        date: "2026.04",
        title: "良质与AI：为什么「看一眼才知道好不好」|不可替代",
        line: "AI只能处理「已经被定义的好」，而你能感受到「还没被定义的好」。",
        href: "https://www.superlinear.academy/c/ai-resources/quality",
      },
    ] as Essay[],
  },
  ask: {
    eyebrow: "AI问答",
    title: "问问立正",
    // Same two points as ask.lizheng.ai's first screen (2026-10-04): what sets it apart, not a list of material.
    // The homepage keeps the two things to know before asking; that answers are public is said under
    // the box, and 别人在问什么 shows it.
    body: "卡住的时候，先来这里问。AI主要依据我写过、讲过的内容回答，每一段都能点回原文。",
    cta: "去问问立正",
    examplesLabel: "比如，你可以问",
    examples: [
      "用AI做出了一个项目，怎样知道自己真的学会了？",
      "工作越来越忙，怎样判断哪些是fake work？",
    ],
    openContext: {
      title: "想自己做一个？",
      body: "问问立正的材料库Open Context已在GitHub开源，可以拿去做你自己的问答或Agent。",
      cta: "在GitHub查看",
      href: LINKS.openContext,
    },
  },
  city: {
    eyebrow: "超线性学院 · 我们在建一座城",
    // The academy's outward line (brand platform §7, 2026-10-30), word for word.
    title: ["不怕AI天天变，", "就来超线性学院。"],
    // What the academy is, in plain words, for someone who has never heard of it; the city is
    // explained by the essay it comes from.
    intro: [
      "超线性学院是一个免费的AI社区。工程师、产品经理、研究者、创业者和各行各业的人，把自己用AI做的东西拿到这里，互相给真实的反馈。",
      { link: "为什么说是一座城？", href: LINKS.florence },
    ] as Inline[],
    insideLabel: "超线性学院里有什么",
    inside: [
      {
        title: "读深度文章",
        body: "我和鸭哥写AI的原理、工程和产品，从热点讲到背后的机制。",
        href: LINKS.knowledgeBank,
      },
      {
        title: "分享你做的东西",
        body: "700多个成员项目发在这里，评论里有试用、追问和建议。",
        href: LINKS.projects,
      },
      {
        title: "看公开培训",
        body: "给腾讯、小红书、美团等团队讲的AI课，录像公开。",
        href: LINKS.openTrainings,
      },
      {
        title: "找人合作",
        body: "成员在这里发合作和招聘，也有公司专门来招AI人才。",
        href: LINKS.collaborate,
      },
    ] as CityPlace[],
    field: {
      label: (count: string) =>
        `社区地图：${count}个点，每个点是一位成员，越亮，发帖和评论越多`,
      fallbackLabel: "社区示意：两万多个点，每个点是一位成员",
      caption: (count: string) => [
        `这里有${count}个点，每个点是一位真实成员。`,
        "越亮，发帖和评论越多；每个点都能点开，看看是谁。",
      ],
      fallbackCaption: ["20,000+位成员在这里学习、分享和讨论。", ""],
      updated: (date: string) => `成员数据更新于${date}`,
      open: "打开TA的主页",
      openNamed: (name: string) => `打开${name}的主页`,
      joined: (year: number, month: number) => `${year}年${month}月加入`,
      posts: () => "帖子",
      comments: () => "评论",
      separator: "，",
      random: "随机遇见一位",
      randomLabel: "随机遇见一位成员",
      find: {
        label: "按名字找一位成员",
        placeholder: "按名字找成员",
        empty: (query: string) => `没有找到“${query}”。`,
      },
      // The same words as every other join button on the page.
      join: "免费加入超线性学院",
    } as CityCopy,
    window: {
      caption: (count: string) => [
        `这里有${count}盏灯，每一盏是一位真实成员。`,
        "两盏灯之间的线，是他们给对方的留言和点赞。",
      ],
      label: (count: string, links: string) =>
        `社区关系图：${count}位成员，${links}条连接。点一盏灯，看看是谁。`,
      // Opens city.lizheng.ai; 「进入这座城」 read like joining.
      enter: "打开完整地图",
      linked: () => "人有来往",
      hint: "点一下，看TA的主页和来往",
      profile: "打开TA的主页",
      explore: "看TA和谁连着",
      close: "关闭",
      someone: "一位成员",
      updated: (date: string) => `数据更新于${date}`,
    } as WindowCopy,
  },
  join: {
    eyebrow: "加入超线性学院",
    title: ["三种方式，", "走进这座城。"],
    intro:
      "从免费社区开始。想系统地学，选AI Builders；想长期跟上变化，加入Stay Superlinear会员。",
    paths: [
      {
        kind: "免费社区",
        title: "从这里开始",
        // The academy chapter already lists what is inside; this card points back to it.
        body: "就是上面那座城。先进来看看，再决定要不要往深里走。",
        stats: [
          ["20,000+", "成员"],
          ["700+", "项目分享"],
        ],
        cta: "免费加入超线性学院",
        href: LINKS.community,
        main: true,
      },
      {
        kind: "付费课程",
        title: "AI Builders",
        body: "四门课，从AI原理、动手构建、检验结果，到做出能持续运行的系统。和鸭哥一起讲。",
        stats: [
          ["3,000+", "付费学员"],
          ["5.0", "Maven评分"],
        ],
        cta: "了解课程",
        href: LINKS.aiBuilders,
      },
      {
        kind: "年度会员",
        title: "Stay Superlinear",
        body: "嘉宾大师课、深度分析，每个月和鸭哥与我直播答疑，带着你自己的问题来。",
        stats: [["12+", "场大师课/年"]],
        cta: "了解会员",
        href: LINKS.stay,
      },
    ],
    enterprise: {
      title: "企业AI培训与定制",
      body: "团队购课、专属班、课程定制。",
      price: ["完整定制企业AI项目", "$100,000起"],
      cta: "企业合作",
      photo: {
        src: "/english-network/amazon-ai-wbr.webp",
        caption: "与鸭哥一起为Amazon团队分享：Build useful things (with AI)",
      },
    },
  },
  invite: {
    // Echoes the hero (学点真本事，做点真东西), as the English closing echoes MAKE WHAT LASTS.
    title: ["做点真东西，", "从一件小事开始。"],
    body: "选一件你能负责到底、也愿意被别人拒绝的事，做出来，拿给真实的人看。",
    primary: "免费加入超线性学院",
    secondary: "合作与邀约",
    shop: "逛逛周边店",
  },
};

type HomeCopy = typeof zh;

const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

const en: HomeCopy = {
  hero: {
    kicker: "Yuzheng Sun · 立正",
    title: ["MAKE", "WHAT", "LASTS."],
    lede: [
      "I’m Yuzheng Sun. I founded ",
      { strong: "Superlinear Academy" },
      ", where 20,000+ people learn to build with AI. Since 2020 I’ve hosted 200+ long conversations with researchers and founders, and I bring what I learn back into teaching and real work.",
    ],
    primary: "Join the free community",
    secondary: "Watch the conversations",
  },
  career: {
    label: "Career",
    title: "Path",
    line: "From research to big tech to building my own, each move closer to real users and results",
    steps: [
      { org: "Cornell University", latin: true, role: ["PhD, Economics"] },
      { org: "Amazon", latin: true, role: ["Economist"] },
      { org: "Meta", latin: true, role: ["Data Scientist"] },
      {
        org: "Tencent IEG",
        latin: true,
        role: ["Director, Growth Data Science & AI", "Led a 30-person team"],
      },
      {
        org: "Statsig",
        latin: true,
        role: [
          "Principal Data Scientist · early team, later acquired by OpenAI",
        ],
      },
      { org: "Superlinear Academy", latin: true, role: ["Founder, full time"] },
    ],
  },
  proof: {
    label: "Organizations and peers",
    orgsLabel: "Invited to speak and train at",
    // As in Chinese, one row on a laptop; English names run longer, so Meituan and Xiaohongshu
    // wait too.
    orgs: [
      ["Amazon"],
      ["Netflix"],
      ["LinkedIn"],
      ["Walmart"],
      ["Pinterest"],
      ["DoorDash"],
      ["Tencent"],
      ["Columbia University"],
    ],
    orgsMore: "and more",
    orgsLink: "See the slides",
    cohost: {
      label: "Co-organizer of",
      name: "AI Engineer Shanghai",
      note: ["The first AI Engineer conference in China", "Nov 5–6, 2026"],
      link: "Event site",
      href: LINKS.aieShanghai,
    },
  },
  scenesLabel: "On stage",
  scenes: scenes([
    [
      "AI training session for DoorDash Analytics",
      "AI training for the DoorDash Analytics team · Seattle",
    ],
    [
      "Moderating the Statsig debate on experimentation and causal inference",
      "Moderating Statsig’s Experimentation vs. Causal Inference debate: Amazon, Meta, Causara",
    ],
    [
      "On stage with Mike Develin at Significance Summit",
      "On stage at Significance Summit × Acquired",
    ],
    [
      "Talk for Pinterest Data Science",
      "Pinterest Data Science: Augmenting Data Science in the AI Era",
    ],
  ]),
  works: {
    eyebrow: "Books",
    title: ["What I’ve worked out,", "written down."],
    intro:
      "One on fake work, fake learning, and what will last when AI can blow it all up; one for people who build products and growth; and one, in Chinese, for people who want to stand on what they can do rather than on a title.",
    flp: {
      meta: "Author · 2026",
      title: "Feels Like Progress",
      body: "Fake work, fake learning, and what will last when AI can blow it all up. A book of ideas.",
      go: "View on Amazon",
      alt: "Cover of Feels Like Progress",
    },
    zbs: {
      meta: "Author · in Chinese · 2026",
      title: "Real Stuff",
      body: "A Chinese book on capability, agency, and income: what you can still do once the credential, title, and company name are taken away.",
      go: "About the book",
      alt: "Cover of Real Stuff (真本事)",
    },
    growth: {
      meta: "Co-author · 2025 WSJ CIO Journal reading list",
      title: "Growth Data Analytics Playbook",
      body: "A practical guide to product-market fit, growth, and experimentation. With Mengying Li and Joe Kumar.",
      go: "View on Amazon",
      alt: "Growth Data Analytics Playbook cover",
    },
  },
  talks: {
    eyebrow: "My interview show",
    title: ["200+ long conversations"],
    intro:
      "Since 2020, with researchers, founders, and investors: what they saw, why they were willing to bet, and how reality rewrote the answer. Mostly in Chinese, some in English.",
    guests: guestsFor("en", ["tian", "vernal", "evans", "xu", "wei", "yang"]),
    alsoLabel: "Also with",
    alsoAria: "More guests",
    also: [
      also("Shuchao Bi", "shuchao-bi"),
      also("Reynold Xin", "reynold-xin"),
      also("Vijaye Raji", "vijaye-raji"),
      also("Gergely Orosz", "https://www.youtube.com/watch?v=-WvvJBd3hDI"),
      also("Liu Jia", "liu-jia"),
      also("Kevin Chen", "kevin-chen"),
      also("Nan Zhou", "zhou-nan"),
      also("Ryo Lu", "ryo-lu"),
      also(
        "Chang She",
        "https://www.superlinear.academy/c/ai-resources/lancedb"
      ),
      also("Richard Liu", "richard-liu"),
      also("Dai Yusen", "dai-yusen"),
      also("Devin Dong", "devin-dong"),
      also("Vivian Wang", "vivian-wang"),
      also("Indigo", "indigo"),
      also("Fan Deng", "fan-deng"),
      also("Howard Li", "howard-li"),
      also("Eugene Wang", "eugene-wang"),
      also("Leon", "leon"),
    ],
    stage: {
      image: "/english-network/acquired.webp",
      alt: "On the Significance Summit stage with Ben Gilbert and David Rosenthal of Acquired",
      caption: "Significance Summit × Acquired",
    },
    all: "Browse all 200+ conversations",
    subscribe: "Subscribe on YouTube",
  },
  calls: {
    eyebrow: "Public calls",
    title: ["Write the call down.", "Let time check it."],
    intro:
      "Right or wrong, every call stays where I made it, with the original record attached.",
    listLabel: "Timeline of public calls",
    sources: "Original record",
    more: (count: number) => `Show the other ${count} calls`,
    less: "Show fewer",
    items: [
      {
        date: "2021.04",
        fold: true,
        title: "Where the last generation of AI hit its ceiling",
        claim:
          "Systems that learn mappings from labeled data can automate narrow settings well without gaining a general understanding of the world. Useful AI applications should be chosen from the mechanism and the task, not from benchmark spectacle.",
        sources: [
          [
            "Video: Why the Turing Test misses intelligence (Chinese)",
            "https://youtu.be/M2Yv3D8NDHY",
          ],
          [
            "Video: Which machine-learning systems actually work (Chinese)",
            "https://youtu.be/sNJ09NOqBXk",
          ],
        ],
      },
      {
        date: "2023.02",
        title: "The five most important questions about ChatGPT",
        claim:
          "Reasoned forward from the mechanism to much cheaper inference, memory and personalization, tool-connected workflows, direct delivery of results, and systems rebuilt around ChatGPT. Written in Chinese and widely shared there, then rewritten in English on Substack and given as a tech talk at Statsig.",
        sources: [
          [
            "Pre-GPT-4 public snapshot (Chinese)",
            "https://www.huxiu.com/article/812076.html",
          ],
          ["Current version (Chinese)", LINKS.chatgptEssay],
          ["Tech talk at Statsig (English)", LINKS.chatgptTalk],
        ],
        feature: {
          badge: "Written before GPT-4",
          quote:
            "ChatGPT is a natural-language computer, close to the ideal way for people to call on data and compute.",
        },
      },
      {
        date: "2025.01",
        title: "In 2025, the biggest opportunity in AI is agents",
        claim:
          "Agentic AI is the most important near-term shift, with a window of roughly 10 to 18 months for early movers starting in early 2025.",
        sources: [
          ["Video (Chinese)", "https://youtu.be/FzbkAy0DcQk"],
          [
            "English transcript",
            "https://github.com/sunyuzheng/lizheng-open-context/blob/main/corpus/english-translations/20250126-FzbkAy0DcQk-en.md",
          ],
        ],
      },
      {
        date: "2025.03",
        fold: true,
        title: "MCP has structural flaws",
        claim:
          "The hype around MCP exceeds what the protocol can reliably deliver; it has major structural problems.",
        sources: [["Video (Chinese)", "https://youtu.be/kwwjR6HHJPM"]],
      },
      {
        date: "2026.03",
        fold: true,
        title:
          "Why OpenClaw is bound to fail, and why I still recommend trying it",
        claim:
          "The product category will not last, but trying it yourself is a good way to understand this round of capability change.",
        sources: [
          ["Video (Chinese)", "https://youtu.be/h_yCYBRzbVw"],
          [
            "English transcript",
            "https://github.com/sunyuzheng/lizheng-open-context/blob/main/corpus/english-translations/20260311-h_yCYBRzbVw-en.md",
          ],
        ],
      },
      {
        date: "2026.09",
        title: "Jev and the AI Narrative Trap",
        claim:
          "A new technology can win every comparison you are shown and still be the wrong thing to learn. Five levels of judgment get you out: understand the mechanism, test its limits, choose your own criteria, find the best real alternative, and decide whether the problem deserves your attention.",
        sources: [
          [
            "Read the essay",
            "https://yuzheng.substack.com/p/jev-and-the-ai-narrative-trap",
          ],
          [
            "Watch the video (Chinese)",
            "https://www.youtube.com/watch?v=kYuolIPDeRQ",
          ],
        ],
        feature: {
          badge: "How to judge hype",
          quote:
            "To tell whether a new technology is hype, find the real benchmark: its best actual alternative.",
          image: {
            src: "/home/works/jev-cover.webp",
            alt: "Cover: Who chose the question? Jev and the AI narrative trap",
            width: 960,
            height: 640,
            href: "https://yuzheng.substack.com/p/jev-and-the-ai-narrative-trap",
            video: false,
          },
        },
      },
    ],
  },
  writing: {
    eyebrow: "Writing",
    title: ["What I’m thinking about now"],
    intro:
      "Questions that keep coming up in teaching, interviews, and building. English versions of essays first written in Chinese.",
    essays: [
      {
        date: "2026.04",
        title: "The Six Levels of AI Products",
        line: "Knowing how to build things with AI coding does not mean knowing how to build AI systems.",
        href: "https://www.superlinear.academy/c/ai-resources-en/ai-products-levels",
      },
      {
        date: "2026.04",
        title:
          "Why Everyone Is Learning the Nouns, but the Real Gap Comes from the Verbs",
        line: "Nouns are parts. Verbs are the ability to assemble.",
        href: "https://www.superlinear.academy/c/ai-resources-en/why-everyone-is-learning-the-nouns-but-the-real-gap-comes-from-the-verbs",
      },
      {
        date: "2026.04",
        title: "Quality and AI",
        line: "AI can only handle “goodness that has already been defined,” while you can feel “goodness that hasn’t yet been defined.”",
        href: "https://www.superlinear.academy/c/ai-resources-en/quality-and-ai-why-the-most-irreplaceable-human-capacity-is-knowing-it-s-good-at-a-glance",
      },
      {
        date: "2026.03",
        title: "The AI Native Organization",
        line: "The bottleneck is not the tools, but the organization.",
        href: "https://www.superlinear.academy/c/ai-resources-en/the-ai-native-organization-when-execution-costs-drop-the-org-chart-must-be-rewritten",
      },
    ],
  },
  ask: {
    eyebrow: "AI Q&A",
    title: "Ask Lizheng",
    body: "Stuck on something? Ask here first. An AI answers mainly from what I have written and said (mostly in Chinese), and every paragraph links back to its source.",
    cta: "Open Ask Lizheng",
    examplesLabel: "Questions you could bring",
    examples: [
      "I built a project with AI. How do I know I actually learned something?",
      "I’m busier than ever. How can I tell if I’m doing fake work?",
    ],
    openContext: {
      title: "Want to build your own?",
      body: "The material behind Ask Lizheng is open source on GitHub as Open Context, ready for your own Q&A tool or agent.",
      cta: "View on GitHub",
      href: LINKS.openContext,
    },
  },
  city: {
    eyebrow: "Superlinear Academy",
    title: ["We’re building a city."],
    intro: [
      "Superlinear Academy is a free AI community. Engineers, product managers, researchers, founders, and people from every field bring what they build with AI here and give each other real feedback. ",
      { link: "Why a city? (essay in Chinese)", href: LINKS.florence },
    ],
    insideLabel: "What’s inside Superlinear Academy",
    inside: [
      {
        title: "Read in-depth essays",
        body: "Yage and I write on how AI works, how to build with it, and what it changes, past the news to the mechanism.",
        href: LINKS.knowledgeBankEn,
      },
      {
        title: "Share what you build",
        body: "700+ member projects, with tryouts, questions, and suggestions in the comments.",
        href: LINKS.projects,
      },
      {
        title: "Watch open trainings",
        body: "AI sessions for teams at Tencent, Xiaohongshu, Meituan, and others, open to watch (in Chinese).",
        href: LINKS.openTrainings,
      },
      {
        title: "Find collaborators",
        body: "Members post collaborations and roles, and companies come here to hire AI talent.",
        href: LINKS.collaborate,
      },
    ],
    field: {
      label: count =>
        `Community map: ${count} dots, one per member, brighter for more posts and comments`,
      fallbackLabel: "Community sketch: twenty thousand dots, one per member",
      caption: count => [
        `${count} dots, one for each real member.`,
        "The brighter the dot, the more they have posted and commented. Every dot opens a member’s profile.",
      ],
      fallbackCaption: ["20,000+ members learn, share, and discuss here.", ""],
      updated: date => `Member data updated ${date}`,
      open: "Open this member’s profile",
      openNamed: name => `Open ${name}’s profile`,
      joined: (year, month) => `Joined ${MONTHS[month - 1]} ${year}`,
      posts: count => (count === 1 ? "post" : "posts"),
      comments: count => (count === 1 ? "comment" : "comments"),
      separator: ". ",
      random: "At random",
      randomLabel: "Meet a random member",
      find: {
        label: "Find a member by name",
        placeholder: "Find a member by name",
        empty: query => `No member named “${query}”.`,
      },
      join: "Join the free community",
    },
    window: {
      caption: count => [
        `${count} lights, one for each real member.`,
        "The lines between them are the comments and likes they have left each other.",
      ],
      label: (count, links) =>
        `Community map: ${count} members and ${links} connections. Click a light to see who it is.`,
      enter: "Open the full map",
      linked: count => (count === 1 ? "person in touch" : "people in touch"),
      hint: "Click for their profile and connections",
      profile: "Open their profile",
      explore: "See who they’re connected to",
      close: "Close",
      someone: "A member",
      updated: date => `Updated ${date}`,
    },
  },
  join: {
    eyebrow: "Join Superlinear Academy",
    title: ["Three ways into the city."],
    intro:
      "Start with the free community. For structured learning, take AI Builders; to keep up over the long run, join Stay Superlinear.",
    paths: [
      {
        kind: "Free community",
        title: "Start here",
        body: "The city above. Come in and look around, then decide how far you want to go.",
        stats: [
          ["20,000+", "members"],
          ["700+", "project posts"],
        ],
        cta: "Join the free community",
        href: LINKS.community,
        main: true,
      },
      {
        kind: "Courses",
        title: "AI Builders",
        body: "Four courses: AI foundations, hands-on building, checking results, and systems that keep working. Co-taught with Yage.",
        stats: [
          ["3,000+", "paying learners"],
          ["5.0", "on Maven"],
        ],
        cta: "Explore the courses",
        href: LINKS.aiBuilders,
      },
      {
        kind: "Membership",
        title: "Stay Superlinear",
        body: "Guest masterclasses, in-depth analysis, and a monthly live Q&A with Yage and me.",
        stats: [["12+", "masterclasses a year"]],
        cta: "Explore the membership",
        href: LINKS.stay,
      },
    ],
    enterprise: {
      title: "AI training for teams",
      body: "Team seats, private cohorts, course customization.",
      price: ["Fully custom programs", "$100,000+"],
      cta: "Enterprise",
      photo: {
        src: "/english-network/amazon-ai-wbr.webp",
        caption: "With Yage at Amazon: Build useful things (with AI)",
      },
    },
  },
  invite: {
    title: ["What lasts", "starts small."],
    body: "Pick one thing you can own from judgment to consequence, and that someone else is free to reject. Make it, then show it to real people.",
    primary: "Join the free community",
    secondary: "Work with me",
    shop: "Visit the shop",
  },
};

export const HOME_COPY: Record<Lang, HomeCopy> = { zh, en };
export type { HomeCopy };
