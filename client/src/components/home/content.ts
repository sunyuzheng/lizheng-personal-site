import type { Lang } from "@/contexts/LanguageContext";
import { GROWTH_BOOK_AMAZON_URL } from "@shared/book-links";

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
  openContext: "https://github.com/sunyuzheng/lizheng-open-context",
  askLizheng: "https://ask.lizheng.ai/",
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

export interface Video {
  id: string;
  title: string;
  year: string;
}

export interface SearchCopy {
  title: string;
  intro: string;
  placeholder: string;
  inputLabel: string;
  count: (essays: number, talks: number) => string;
  empty: (query: string) => string;
  loading: string;
  failed: string;
  chips: string[];
  initialQuery: string;
  essayKind: string;
  labels: Record<string, string>;
  resultsLabel: string;
}

export interface CityCopy {
  label: (count: string) => string;
  fallbackLabel: string;
  caption: (count: string) => [string, string];
  fallbackCaption: [string, string];
  updated: (date: string) => string;
  demo: string;
  open: string;
  openNamed: (name: string) => string;
  joined: (year: number, month: number) => string;
  /** Labels shown under the member card's figures. */
  posts: (count: number) => string;
  comments: (count: number) => string;
  /** Between the parts of the member card, for screen readers. */
  separator: string;
  random: string;
  find: {
    label: string;
    placeholder: string;
    empty: (query: string) => string;
  };
  join: string;
}

export interface Stat {
  value: number;
  format: "k" | "comma";
  label: string;
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
    follow: "关注我",
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
        role: ["增长数据科学与AI总监", "带领30人团队"],
      },
      {
        org: "Statsig",
        latin: true,
        role: ["Principal数据科学家", "OpenAI收购团队早期成员"],
      },
      { org: "超线性学院", latin: false, role: ["创始人 · 全职投入"] },
    ],
  },
  proof: {
    label: "数字与合作",
    stats: [
      { value: 400, format: "k", label: "全网关注" },
      { value: 200, format: "comma", label: "场公开深度对话" },
      { value: 20000, format: "comma", label: "超线性学院社区成员" },
      { value: 3000, format: "comma", label: "付费学员" },
    ] as Stat[],
    orgsLabel: "受邀为这些团队和机构分享与培训",
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
      ["Binance"],
      ["Safeway"],
      ["Monzo"],
      ["FlowGPT"],
      ["哥伦比亚大学", "zh"],
      ["华盛顿大学", "zh"],
      ["美国统计协会", "zh"],
    ] as Array<[string, "zh"?]>,
    orgsMore: "等",
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
  works: {
    eyebrow: "代表作",
    title: ["我愿意长期站在", "它们后面。"],
    intro:
      "一档做了六年的节目，两本书，还有下面这座正在建的城。每一件都是一个判断，离开了我的脑子，交给了真实的读者、学员和市场。",
    show: {
      meta: "节目 · 2020年至今",
      title: "课代表立正 · 200+场对话",
      body: "问真正把事做成的人：到底做对了什么？",
      go: "看对话",
      photo: {
        src: "/english-network/acquired.webp",
        alt: "在Significance Summit的舞台上与Acquired的Ben Gilbert、David Rosenthal对谈",
        caption:
          "与Acquired的Ben Gilbert、David Rosenthal对谈 · Significance Summit",
        href: "https://www.youtube.com/watch?v=sP9jqW41uoU",
        label: "看这场对谈",
      },
    },
    zbs: {
      meta: "书 · 著 · 人民邮电出版社",
      title: "真本事：从会工作到会赚钱",
      body: "拿掉证书、职位和公司名以后，你还真正会什么？一本讲能力、主动性和收入的书。",
      go: "了解这本书",
      alt: "《真本事：从会工作到会赚钱》封面",
    },
    growth: {
      meta: "书 · 合著 · 入选2025年WSJ CIO Journal书单",
      title: "Growth Data Analytics Playbook",
      body: "讲产品市场匹配、增长与实验的实战书。与Mengying Li、Joe Kumar合著。",
      go: "在Amazon查看",
      alt: "《Growth Data Analytics Playbook》封面",
    },
  },
  talks: {
    eyebrow: "课代表立正",
    title: ["真正把事做成的人，", "到底做对了什么？"],
    intro:
      "从2020年开始，我和研究者、创业者、投资人做了200多场长谈。聊他们看见了什么，为什么敢下注，现实又怎样改写了答案。",
    guests: guestsFor("zh", [
      "tian",
      "bi",
      "xin",
      "raji",
      "liu",
      "xu",
      "yang",
      "wei",
      "vernal",
      "evans",
      "orosz",
      "zhou",
    ]),
    alsoLabel: "还聊过",
    alsoAria: "更多对话嘉宾",
    also: [
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
    popularTitle: "从这几期开始",
    popular: [
      {
        id: "GIv0I-34aaI",
        title: "十年估值三千亿，创始人首次揭秘｜Databricks联合创始人Reynold",
        year: "2024",
      },
      {
        id: "-Et3GJRSI_0",
        title: "清华教授：应试教育在AI面前全军覆没，我们应该如何重新学习？",
        year: "2026",
      },
      {
        id: "vd_oYgwQSBM",
        title: "一红16年，干啥啥赚钱？｜屠龙博士创业的秘密！",
        year: "2026",
      },
      {
        id: "CTcMvIZFQcw",
        title: "Influence Without Authority｜人生元能力",
        year: "2021",
      },
      {
        id: "8omGQSetKMA",
        title: "华人在硅谷怎么做（不）到VP？",
        year: "2021",
      },
      {
        id: "oGDlQ1n1ZcE",
        title: "Vibe Coding红利即将结束，未来什么样的AI人才最稀缺？",
        year: "2025",
      },
    ] as Video[],
    all: "浏览全部200+场对话",
    subscribe: "在YouTube订阅",
  },
  calls: {
    eyebrow: "公开判断",
    title: ["先把判断写下来，", "再让时间检验。"],
    intro: "说对的，说错的，都留在原处，每一条都附上当时的原始记录。",
    listLabel: "公开判断时间线",
    sources: "原始记录",
    items: [
      {
        date: "2021.04",
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
        title: "MCP有结构性缺陷",
        claim:
          "MCP的热度超过了它能可靠交付的东西，协议本身有重大的结构性问题。",
        sources: [["视频", "https://youtu.be/kwwjR6HHJPM"]],
      },
      {
        date: "2026.03",
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
    go: "读文章",
    essays: [
      {
        date: "2026.08",
        title: "如何识别与消灭|fake work",
        line: "Fake work，就是用可见的动作，代替难以衡量的价值。",
        href: "https://www.superlinear.academy/c/ai-resources/fake-work",
      },
      {
        date: "2026.09",
        title: "AI会带来第二次文艺复兴，我们需要自己的佛罗伦萨",
        line: "人从生产的工具，重新成为生产的目的。",
        href: LINKS.florence,
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
    openContext: {
      title: "立正 · Open Context",
      body: "我在社区和视频里公开发表的内容，整理成一个人和AI都能读的开放仓库：文章全文、视频字幕与英文译稿，都带来源和日期。可以检索、引用，也可以拿来做你自己的Skill或Agent。",
      cta: "在GitHub查看",
      href: LINKS.openContext,
    },
    search: {
      title: "搜索我写过、讲过的内容",
      intro: "在文章和视频里搜索。",
      placeholder: "试试：Agent、面试、财富、fake work",
      inputLabel: "搜索文章和视频",
      count: (essays, talks) => `在${essays}篇文章和${talks}期视频里搜索。`,
      empty: query => `没有找到“${query}”。换个词试试。`,
      loading: "正在载入索引……",
      failed: "索引暂时没有载入。可以稍后再试，或直接去YouTube和社区搜索。",
      chips: ["fake work", "Agent", "面试", "财富", "升职", "刘嘉", "Context"],
      initialQuery: "Agent",
      essayKind: "文章",
      labels: {},
      resultsLabel: "搜索结果",
    } as SearchCopy,
  },
  ask: {
    eyebrow: "AI问答",
    title: "问问立正",
    body: "想理解一个观点，或把它用到自己的处境里？让AI从我的公开文章和视频中找出相关内容，整理回答并给出出处。",
    cta: "去问问立正",
    note: "这是AI回答，非本人实时回复；重要判断请回到原文核对。",
    examplesLabel: "比如，你可以问",
    examples: [
      "用AI做出了一个项目，怎样知道自己真的学会了？",
      "工作越来越忙，怎样判断哪些是fake work？",
    ],
    searchLabel: "记得关键词？直接搜文章和视频",
  },
  city: {
    eyebrow: "超线性学院 · Superlinear Academy",
    title: ["我们在建一座城。"],
    intro: [
      "AI像一场大洪水，人要学会游泳、造船；它也会带来第二次文艺复兴，需要一座",
      { link: "佛罗伦萨", href: LINKS.florence },
      "。超线性学院想把这两件事一起做成。",
    ] as Inline[],
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
      demo: "当前为演示数据，链接均指向立正的主页",
      open: "打开TA的主页",
      openNamed: (name: string) => `打开${name}的主页`,
      joined: (year: number, month: number) => `${year}年${month}月加入`,
      posts: () => "帖子",
      comments: () => "评论",
      separator: "，",
      random: "随机遇见一位成员",
      find: {
        label: "按名字找一位成员",
        placeholder: "按名字找成员",
        empty: (query: string) => `没有找到“${query}”。`,
      },
      join: "免费加入，一起建这座城",
    } as CityCopy,
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
        body: "读深度文章，看公开培训，分享你正在做的项目，问技术问题，看别人怎么解决。",
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
    title: ["你的代表作，", "不会一开始就是代表作。"],
    body: "先做一件自己能负责到底、也愿意接受别人拒绝的小事。",
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
    follow: "Follow",
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
    label: "Numbers and organizations",
    stats: [
      {
        value: 400,
        format: "k",
        label: "followers on YouTube, Bilibili & Xiaohongshu",
      },
      { value: 200, format: "comma", label: "public long-form conversations" },
      { value: 20000, format: "comma", label: "free-community members" },
      { value: 3000, format: "comma", label: "paying learners" },
    ],
    orgsLabel: "Invited to speak and train at",
    orgs: [
      ["Amazon"],
      ["Netflix"],
      ["LinkedIn"],
      ["Walmart"],
      ["Pinterest"],
      ["DoorDash"],
      ["Tencent"],
      ["Meituan"],
      ["Xiaohongshu"],
      ["Binance"],
      ["Safeway"],
      ["Monzo"],
      ["FlowGPT"],
      ["Columbia University"],
      ["University of Washington"],
      ["American Statistical Association"],
    ],
    orgsMore: "and more",
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
    eyebrow: "Selected work",
    title: ["Work I’ll keep", "standing behind."],
    intro:
      "A show six years in the making, two books, and the city below, still being built. Each one is a judgment that left my head and met real readers, learners, and markets.",
    show: {
      meta: "Show · 2020 to now",
      title: "200+ conversations",
      body: "Asking people who built consequential things what they actually got right.",
      go: "See the conversations",
      photo: {
        src: "/english-network/acquired.webp",
        alt: "On stage with Ben Gilbert and David Rosenthal of Acquired at Significance Summit",
        caption:
          "With Ben Gilbert and David Rosenthal of Acquired · Significance Summit",
        href: "https://www.youtube.com/watch?v=sP9jqW41uoU",
        label: "Watch this conversation",
      },
    },
    zbs: {
      meta: "Book · author · in Chinese",
      title: "真本事",
      body: "A Chinese book on capability, agency, and income: what you can still do once the credential, title, and company name are taken away.",
      go: "About the book",
      alt: "Cover of 真本事",
    },
    growth: {
      meta: "Book · co-author · 2025 WSJ CIO Journal reading list",
      title: "Growth Data Analytics Playbook",
      body: "A practical guide to product-market fit, growth, and experimentation. With Mengying Li and Joe Kumar.",
      go: "View on Amazon",
      alt: "Growth Data Analytics Playbook cover",
    },
  },
  talks: {
    eyebrow: "Conversations",
    title: ["What did the people who built it actually get right?"],
    intro:
      "Since 2020 I’ve hosted 200+ long conversations with researchers, founders, and investors: what they saw, why they were willing to bet, and how reality rewrote the answer.",
    guests: guestsFor("en", [
      "tian",
      "bi",
      "xin",
      "raji",
      "orosz",
      "vernal",
      "evans",
      "wei",
      "liu",
      "kevin",
      "yang",
      "zhou",
    ]),
    alsoLabel: "Also with",
    alsoAria: "More guests",
    also: [
      also("Howie Xu", "howie-xu"),
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
    popularTitle: "",
    popular: [],
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
    items: [
      {
        date: "2021.04",
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
        title: "MCP has structural flaws",
        claim:
          "The hype around MCP exceeds what the protocol can reliably deliver; it has major structural problems.",
        sources: [["Video (Chinese)", "https://youtu.be/kwwjR6HHJPM"]],
      },
      {
        date: "2026.03",
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
    go: "Read",
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
    openContext: {
      title: "Open Context",
      body: "Everything I publish in the community and on video, gathered into one open repository that people and AI can both read: full posts, transcripts with English translations, each with its source and date. Search it, cite it, or build your own Skill or Agent on it.",
      cta: "View on GitHub",
      href: LINKS.openContext,
    },
    search: {
      title: "Search my essays and talks",
      intro: "Search essays and talks.",
      placeholder: "Try: agent, context, AI native, startup",
      inputLabel: "Search essays and talks",
      count: (essays, talks) =>
        `Across ${essays} essays and ${talks} talk transcripts. Talks were given in Chinese; transcripts are AI translations.`,
      empty: query => `Nothing found for “${query}”. Try another word.`,
      loading: "Loading the index…",
      failed: "The index didn’t load. Please try again later.",
      chips: ["agent", "context", "AI native", "startup", "career", "quality"],
      initialQuery: "agent",
      essayKind: "Essay",
      labels: { Talk: "Talk" },
      resultsLabel: "Search results",
    },
  },
  ask: {
    eyebrow: "AI Q&A",
    title: "Ask Lizheng",
    body: "Trying to understand an idea, or apply it to your own situation? Ask an AI assistant that finds relevant material in my public essays and videos, then answers with sources.",
    cta: "Open Ask Lizheng",
    note: "AI answers, not a live reply from me. The source material and answers are primarily in Chinese. Check the original sources for important decisions.",
    examplesLabel: "Questions you could bring",
    examples: [
      "I built a project with AI. How do I know I actually learned something?",
      "I’m busier than ever. How can I tell if I’m doing fake work?",
    ],
    searchLabel: "Know the keyword? Search essays and talks",
  },
  city: {
    eyebrow: "Superlinear Academy",
    title: ["We’re building a city."],
    intro: [
      "AI is a flood, and people need to learn to swim and build boats. It is also a second Renaissance, and a Renaissance needs its ",
      { link: "Florence", href: LINKS.florence },
      ". Superlinear Academy is trying to do both.",
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
      demo: "Demo data: every link opens Yuzheng’s own profile",
      open: "Open this member’s profile",
      openNamed: name => `Open ${name}’s profile`,
      joined: (year, month) => `Joined ${MONTHS[month - 1]} ${year}`,
      posts: count => (count === 1 ? "post" : "posts"),
      comments: count => (count === 1 ? "comment" : "comments"),
      separator: ". ",
      random: "Meet a random member",
      find: {
        label: "Find a member by name",
        placeholder: "Find a member by name",
        empty: query => `No member named “${query}”.`,
      },
      join: "Join free and help build it",
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
        body: "Read in-depth essays, watch public training sessions, share what you’re building, and ask technical questions.",
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
    title: ["Your defining work", "will not arrive finished."],
    body: "Start with one small thing you can own from judgment to consequence, and that someone else is free to reject.",
    primary: "Join the free community",
    secondary: "Work with me",
    shop: "Visit the shop",
  },
};

export const HOME_COPY: Record<Lang, HomeCopy> = { zh, en };
export type { HomeCopy };
