import type { PageMeta, SiteLang } from "./page-meta";
import {
  buildPersonWebPageStructuredData,
  PERSON_ID,
  SUPERLINEAR_ID,
} from "./structured-data";

// This is a dated guide to the offers, not their commercial source of truth.
// Owners and verification sources are recorded in docs/product-guide.md.
export const GUIDE_REVIEWED_AT = "2026-10-15";

export const PRODUCT_GUIDE_META: Record<SiteLang, PageMeta> = {
  zh: {
    title: "超线性学院产品与资料指南｜AI Builders、Stay与免费社区",
    description:
      "了解立正与超线性学院的关系，比较免费社区、AI Builders自学课程、Stay Superlinear会员和企业AI培训的适用场景、价格与权限，并找到公开资料和原始来源。",
    canonical: "https://www.lizheng.ai/for-agents",
    ogImage: "https://www.lizheng.ai/og/home-zh.jpg",
    lastModified: GUIDE_REVIEWED_AT,
  },
  en: {
    title: "Superlinear Academy: Products & Resources · Yuzheng Sun",
    description:
      "How Yuzheng Sun and Superlinear Academy fit together. Compare the free community, AI Builders self-paced courses, Stay Superlinear membership, and enterprise AI programs, with official sources and public resources.",
    canonical: "https://www.lizheng.ai/en/for-agents",
    ogImage: "https://www.lizheng.ai/og/home-en.jpg",
    lastModified: GUIDE_REVIEWED_AT,
  },
};

export interface GuideLink {
  label: string;
  href: string;
}

export interface GuideProduct {
  id: string;
  name: string;
  category: string;
  need: string;
  description: string;
  audience: string;
  format: string;
  access: string;
  price: string;
  priceNote?: string;
  distinction: string;
  links: GuideLink[];
}

export const GUIDE_PRODUCTS: Record<SiteLang, GuideProduct[]> = {
  zh: [
    {
      id: "community",
      name: "超线性学院免费社区",
      category: "开放社区",
      need: "先读内容、看看作品，找到一起做事的人。",
      description:
        "公开的AI深度文章、部分培训录像、成员项目、讨论与合作机会。可以先读，也可以把自己做的东西拿来交流。",
      audience: "想先了解AI实践、寻找同行，或分享项目与问题的人。",
      format: "线上社区；公开文章与培训录像、成员发帖和讨论。",
      access: "免费注册即可加入。项目分享与普通成员交流向免费社区开放。",
      price: "免费",
      distinction:
        "Stay是另行购买的会员服务；加入免费社区不需要先买课或买会员。",
      links: [
        {
          label: "免费加入社区",
          href: "https://www.superlinear.academy/community",
        },
        {
          label: "先读公开文章",
          href: "https://www.superlinear.academy/c/ai-resources",
        },
        {
          label: "看成员项目",
          href: "https://www.superlinear.academy/c/share-your-projects",
        },
      ],
    },
    {
      id: "ai-builders",
      name: "AI Builders 2027",
      category: "完整学习计划",
      need: "系统学懂AI，把它用进真实工作，做出可靠的应用。",
      description:
        "立正与鸭哥共同教学。主线是AI Coding → AI Builders → AI Architect，Agentic AI作为选修穿插学习，从第一次动手走向可靠交付与自己的核心项目。",
      audience:
        "已有专业积累的技术与非技术学习者；不要求先成为程序员，需要愿意动手做项目。",
      format:
        "按自己的节奏自学。四门中文课程；AI Builders与AI Architect另含英文版。需要英文直播和固定班期，可另看Maven。",
      access:
        "一次购买，四门课终身权限与后续更新；当前另含12个月Stay Superlinear会员。会员到期不影响课程权限。",
      price: "$1,048 / ¥7,145 · 一次购买",
      priceNote:
        "北京时间2027年1月1日起，美元价格调整为$1,299。当前自学计划提供购买后14天内无理由退款。",
      distinction:
        "需要完整学习主线和终身课程权限时，选这个计划；课程所含的12个月会员无需再重复购买。",
      links: [
        { label: "课程、内容与购买方案", href: "https://ai-builders.com/" },
        {
          label: "英文直播班与当前班期",
          href: "https://maven.com/superlinear/aibuilders",
        },
      ],
    },
    {
      id: "stay",
      name: "Stay Superlinear",
      category: "持续会员服务",
      need: "已经在实践，希望持续学新东西、讨论问题、用好工具。",
      description:
        "立正与鸭哥联合创办的会员产品：每个会员年度12+场嘉宾闭门大师课、每月深度答疑、深度内容、课程与可检索回放；年费另含精选Skills和AI Builder Space等工具。",
      audience:
        "已把AI用进工作，或希望在专业积累上持续实践、交流与跟进变化的人。上过AI Builders并非加入前提。",
      format:
        "以中文内容与交流为主；线上活动、讨论、回放与课程，也可以按自己的节奏阅读和使用。",
      access:
        "会员有效期内使用当期内容与权益。含AI Coding、Agentic AI和《真本事》课程；不含AI Builders与AI Architect旗舰课。",
      price: "Founding年费 $149 / ¥999",
      priceNote:
        "前3,000位新年费会员适用；连续年费续订保留Founding价格。此后新年费为$299 / ¥1,999。季度与14天付费体验方案见官网，外部工具权益按方案区分。",
      distinction:
        "希望持续获得内容、活动与同行交流时，可直接加入Stay；完整四门课的终身权限由AI Builders计划提供。",
      links: [
        {
          label: "会员内容与当前方案",
          href: "https://stay.superlinear.academy/",
        },
        {
          label: "比较年费、季度与体验方案",
          href: "https://stay.superlinear.academy/join/",
        },
      ],
    },
    {
      id: "enterprise",
      name: "企业AI培训与定制项目",
      category: "组织与团队",
      need: "让AI进入团队真实的岗位、流程和交付。",
      description:
        "从团队问题梳理、成熟课程采购和企业专属班开始，也可以围绕企业自己的案例、材料与工作方式定制课程，或设计完整企业项目。",
      audience: "为研发或非研发团队负责的培训、业务与技术负责人。",
      format:
        "按团队需要确定语言、班期和交付方式；定制项目从真实工作与验收标准开始。",
      access:
        "课程采购、企业专属班与定制项目分别报价，范围和使用权限按正式方案确认。",
      price: "团队交流$2,000起；完整定制项目$100,000起",
      priceNote:
        "美元未税参考价。标准课程团队采购、专属班和课程定制的阶梯方案见企业页。",
      distinction:
        "先判断标准课程是否够用；当企业案例、流程或验收要求改变了要学和要做的内容，再增加定制。",
      links: [
        { label: "比较企业合作方式", href: "/collab/enterprise" },
        { label: "看公开培训与课件", href: "/decks" },
      ],
    },
  ],
  en: [
    {
      id: "community",
      name: "Superlinear Academy free community",
      category: "OPEN COMMUNITY",
      need: "Read, explore real projects, and meet people building with AI.",
      description:
        "Public AI essays, selected training recordings, member projects, discussion, and collaboration opportunities. Start by reading or bring something you are making.",
      audience:
        "People exploring AI practice, looking for peers, or sharing projects and questions.",
      format:
        "An online community with public articles and recordings, member posts, and discussion.",
      access:
        "Free registration. Project sharing and ordinary member discussion are open to the free community.",
      price: "Free",
      distinction:
        "Stay is a separate paid membership. A course or membership purchase is not required to join the free community.",
      links: [
        {
          label: "Join the free community",
          href: "https://www.superlinear.academy/community",
        },
        {
          label: "Read public essays",
          href: "https://www.superlinear.academy/c/ai-resources",
        },
        {
          label: "Explore member projects",
          href: "https://www.superlinear.academy/c/share-your-projects",
        },
      ],
    },
    {
      id: "ai-builders",
      name: "AI Builders 2027",
      category: "STRUCTURED LEARNING",
      need: "Understand AI systematically and build reliable work with it.",
      description:
        "Co-taught by Yuzheng Sun and Yage. Follow AI Coding → AI Builders → AI Architect, with Agentic AI as an elective, progressing from a first build to reliable delivery and a substantial project of your own.",
      audience:
        "Technical and non-technical professionals with domain experience. Prior programming expertise is not required; hands-on project work is part of the learning.",
      format:
        "Self-paced. Four courses in Chinese; AI Builders and AI Architect also have English versions. Maven offers a separate scheduled English live-cohort option.",
      access:
        "One purchase includes lifetime access and future updates to all four courses, plus 12 months of Stay Superlinear. Course access continues after membership ends.",
      price: "$1,048 / ¥7,145 · one-time purchase",
      priceNote:
        "The USD price becomes $1,299 on January 1, 2027, Beijing time. The current self-paced plan has a 14-day, no-reason refund policy.",
      distinction:
        "Choose this for the complete learning path and lifetime course access. Its included 12-month membership does not need to be purchased again.",
      links: [
        {
          label: "Curriculum and purchase options",
          href: "https://ai-builders.com/",
        },
        {
          label: "English live cohorts on Maven",
          href: "https://maven.com/superlinear/aibuilders",
        },
      ],
    },
    {
      id: "stay",
      name: "Stay Superlinear",
      category: "ONGOING MEMBERSHIP",
      need: "Keep learning, discussing real questions, and using better tools.",
      description:
        "Co-founded by Yuzheng Sun and Yage: 12+ guest-led, closed-door masterclasses per membership year, monthly in-depth Q&A, analysis, courses, and a searchable recording archive. Annual plans also include curated Skills and tools such as AI Builder Space.",
      audience:
        "Practitioners applying AI to their work and people building on existing professional experience. Previous AI Builders enrollment is not required.",
      format:
        "Primarily Chinese content and discussion, with online activities, recordings, and courses. Reading and using resources at your own pace is also a complete way to participate.",
      access:
        "Benefits are available during membership. Current member courses include AI Coding, Agentic AI, and 真本事; the flagship AI Builders and AI Architect courses are separate.",
      price: "Founding annual plan: $149 / ¥999",
      priceNote:
        "Available to the first 3,000 new annual members; continuous annual renewals retain the Founding price. Later new annual plans are $299 / ¥1,999. See the official site for quarterly and 14-day paid trial options; external-tool benefits vary by plan.",
      distinction:
        "Choose Stay for ongoing content, activities, and practitioner discussion. The AI Builders plan provides lifetime access to the complete four-course path.",
      links: [
        {
          label: "Membership and current offer",
          href: "https://stay.superlinear.academy/",
        },
        {
          label: "Annual, quarterly, and trial plans",
          href: "https://stay.superlinear.academy/join/",
        },
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise AI training & custom programs",
      category: "ORGANIZATIONS & TEAMS",
      need: "Bring AI into real team workflows and delivery.",
      description:
        "Start with an organization session, standard course enrollment, or a private cohort. Add company-specific cases and material, or design a fully custom program around the work itself.",
      audience:
        "Business, technical, and learning leaders responsible for engineering or non-engineering teams.",
      format:
        "Language, schedule, and delivery are scoped with the team. Custom work starts with actual roles, workflows, and evaluation criteria.",
      access:
        "Team seats, private cohorts, and custom programs have separate scopes and quotes. Usage rights are confirmed in the formal proposal.",
      price: "Sessions from $2,000; fully custom programs from $100,000",
      priceNote:
        "Planning prices in USD before tax. See the enterprise page for team enrollment, private cohorts, and course customization.",
      distinction:
        "Use the standard course when it fits. Add customization when company cases, workflows, or evaluation needs change what people must learn and do.",
      links: [
        { label: "Compare enterprise formats", href: "/collab/enterprise" },
        { label: "Browse public training decks", href: "/decks" },
      ],
    },
  ],
};

export function buildProductGuideStructuredData(lang: SiteLang) {
  const meta = PRODUCT_GUIDE_META[lang];
  const base = buildPersonWebPageStructuredData({
    ...meta,
    name: meta.title,
    lang,
  });
  const listId = `${meta.canonical}#products`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...base["@graph"][0],
        "@type": "CollectionPage",
        about: [{ "@id": PERSON_ID }, { "@id": SUPERLINEAR_ID }],
        mainEntity: { "@id": listId },
      },
      ...base["@graph"].slice(1),
      {
        "@type": "EducationalOrganization",
        "@id": SUPERLINEAR_ID,
        name: "Superlinear Academy",
        alternateName: "超线性学院",
        url: "https://www.superlinear.academy/community",
        founder: { "@id": PERSON_ID },
      },
      {
        "@type": "ItemList",
        "@id": listId,
        name:
          lang === "zh"
            ? "社区、课程、会员与企业项目"
            : "Community, courses, membership, and enterprise programs",
        itemListOrder: "https://schema.org/ItemListUnordered",
        numberOfItems: GUIDE_PRODUCTS[lang].length,
        itemListElement: GUIDE_PRODUCTS[lang].map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.name,
          description: product.description,
          url: `${meta.canonical}#${product.id}`,
        })),
      },
    ],
  };
}
