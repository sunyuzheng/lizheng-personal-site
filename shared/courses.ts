import type { PageMeta, SiteLang } from "./page-meta";
import {
  buildPersonWebPageStructuredData,
  PERSON_ID,
  SUPERLINEAR_ID,
} from "./structured-data";

// Course facts are owned by course-marketing-system; this page introduces the
// learning path. Current prices and enrollment stay on the course's own site.
export const COURSE_SITE = "https://ai-builders.com/";
export const COURSE_ID = `${COURSE_SITE}#course`;
export const YAGE_ID = `${COURSE_SITE}#wangyan`;
export const MAVEN_COURSE = "https://maven.com/superlinear/aibuilders";

export const COURSES_PAGE_META: Record<SiteLang, PageMeta> = {
  zh: {
    title: "课代表立正的AI课程｜AI Builders学习指南",
    description:
      "课代表立正（孙煜征）与鸭哥（王言）共同主讲的AI Builders 2027：从AI Coding入门、AI Builders实战到AI Architect项目课，另含Agentic AI选修。了解四门课的学习顺序、适合人群、自学与英文直播方式，前往课程官网查看大纲与报名。",
    canonical: "https://www.lizheng.ai/courses",
    ogImage: "https://www.lizheng.ai/og/home-zh.jpg",
    lastModified: "2026-11-13",
  },
  en: {
    title: "AI Courses with Yuzheng Sun & Yage · AI Builders",
    description:
      "AI Builders 2027, co-taught by Yuzheng Sun (立正) and Yage (Yan Wang): AI Coding, AI Builders, AI Architect, and the Agentic AI elective. Find the learning path, prerequisites, self-paced courses, and English live cohorts.",
    canonical: "https://www.lizheng.ai/en/courses",
    ogImage: "https://www.lizheng.ai/og/home-en.jpg",
    lastModified: "2026-11-13",
  },
};

export const COURSE_COPY = {
  zh: {
    title: ["课代表立正的", "AI课程"],
    intro:
      "AI Builders 2027是我（孙煜征，课代表立正）和鸭哥（王言）共同主讲的完整学习计划。从第一次用AI编程，到把它用进真实工作，再到做一个课后还会一直用的AI应用。",
    primary: "查看完整大纲与报名",
    secondary: "先看四门课",
    pathTitle: "从第一次动手，到做出自己的应用。",
    pathIntro:
      "主线是AI Coding → AI Builders → AI Architect。Agentic AI是一门轻量选修，可以穿插学习。",
    courses: [
      {
        id: "ai-coding",
        name: "AI Coding",
        role: "第一晚，跨过动手的门槛",
        body: "没有编程基础也可以开始。运行AI生成的程序、读懂报错、继续修改，把自己的一个小问题做成能用的工具。",
        language: "中文",
      },
      {
        id: "ai-builders",
        name: "AI Builders",
        role: "提示词抄得走，判断抄不走",
        body: "从一条语音备忘录练起，学习给AI说清楚要求、检查结果、选择值得做的问题，做成家人同事打开链接就能用的工具。",
        language: "中文与英文",
      },
      {
        id: "ai-architect",
        name: "AI Architect",
        role: "做一个课后还会一直用的AI应用",
        body: "围绕自己的真实问题做核心项目，把前面学的方法接成完整系统，练习可靠交付，并继续使用、维护和改进。",
        language: "中文与英文",
      },
      {
        id: "agentic-ai",
        name: "Agentic AI",
        role: "选修：看懂Agent怎样工作",
        body: "理解Agent如何调用工具、观察结果、继续修正，以及Tools、Harness与Loop各自做什么。难度低于AI Builders。",
        language: "中文",
      },
    ],
    fitTitle: "你已经有专业积累，想把AI真正用起来。",
    fit: "工程师、产品经理、分析师，或来自其他行业的知识工作者，都可以从自己的问题开始。不要求先成为程序员，需要愿意动手、检查结果，并把做出的东西交给真实的人用。",
    teachersTitle: "和我、鸭哥一起学。",
    teachers: [
      {
        name: "立正 · 孙煜征",
        role: "产品直觉",
        body: "什么值得做、谁需要、什么才算好。课上把产品、工作与商业判断放进具体的选择里。",
        href: "/about",
        link: "了解立正",
      },
      {
        name: "鸭哥 · 王言",
        role: "技术直觉",
        body: "该给AI什么、它会在哪里坏、出了问题查什么。课上把研究、工程与亲手排错的过程摊开。",
        href: "https://github.com/grapeot",
        link: "看鸭哥的开源工作",
      },
    ],
    faqTitle: "报名之前，你可能想知道。",
    faqs: [
      {
        q: "AI Builders是一个课程，还是四门课的名字？",
        a: "两者都有。AI Builders 2027是完整学习计划的品牌，包含上面的四门课；AI Builders也是其中第二门主线课的名字。课程官网有每门课的完整目录。",
      },
      {
        q: "是自学，还是直播？",
        a: "完整学习计划按自己的节奏自学：四门中文课程，AI Builders与AI Architect另有英文版。如果希望有固定班期、英文直播和现场互动，可以选择Maven英文直播班。",
      },
      {
        q: "买课程，还是加入Stay Superlinear会员？",
        a: "想系统学习并长期拥有四门课，选AI Builders 2027：一次购买，四门课终身权限与后续更新，当前另含12个月Stay会员。会员到期不影响课程权限。Stay也可以独立加入，适合持续参与大师课、答疑和讨论；会员期内含AI Coding、Agentic AI和《真本事》课程，AI Builders与AI Architect由完整学习计划提供。",
      },
    ],
    enrollTitle: "看看课程怎样带你做。",
    enrollIntro:
      "完整大纲、教学示例、学员评价和当前价格，都在AI Builders课程官网。",
    maven: "Maven英文直播班",
    free: "先读免费AI文章",
    guide: "比较课程、会员与免费社区",
  },
  en: {
    title: ["Learn AI with", "Yuzheng Sun & Yage"],
    intro:
      "AI Builders 2027 is the complete learning plan I co-teach with Yage (Yan Wang). Start by building a small tool with AI, bring it into real work, and build an application you will keep using after the course.",
    primary: "Explore the syllabus & enroll",
    secondary: "See the four courses",
    pathTitle: "From your first tool to your own application.",
    pathIntro:
      "The core path is AI Coding → AI Builders → AI Architect. Agentic AI is a lighter elective you can take along the way.",
    courses: [
      {
        id: "ai-coding",
        name: "AI Coding",
        role: "Build your first tool in an evening",
        body: "Start without prior coding experience. Run AI-generated programs, read errors, and keep improving a small tool for a problem of your own.",
        language: "Chinese",
      },
      {
        id: "ai-builders",
        name: "AI Builders",
        role: "Build the judgment behind the tools",
        body: "Work from a voice memo toward a tool others can use. Learn to give AI clear requirements, check results, and choose problems worth solving.",
        language: "Chinese & English",
      },
      {
        id: "ai-architect",
        name: "AI Architect",
        role: "Build an application you will keep using",
        body: "Choose a real problem for your capstone. Bring the methods together in a complete system, make it reliable, and keep using and improving it.",
        language: "Chinese & English",
      },
      {
        id: "agentic-ai",
        name: "Agentic AI",
        role: "Elective: understand how agents work",
        body: "Understand tool use, observing results, and correction, and the roles of tools, a harness, and a loop. A lighter course than AI Builders.",
        language: "Chinese",
      },
    ],
    fitTitle: "Bring your professional experience. Put AI to work.",
    fit: "Engineers, product managers, analysts, and knowledge workers from other fields can start from their own problems. You do not need to be a programmer first. You do need to build, check the results, and put your work in front of real users.",
    teachersTitle: "Learn with Yuzheng and Yage.",
    teachers: [
      {
        name: "Yuzheng Sun · 立正",
        role: "Product judgment",
        body: "What is worth making, who needs it, and what good looks like. Product, work, and business judgment made concrete through decisions.",
        href: "/about",
        link: "About Yuzheng",
      },
      {
        name: "Yage · Yan Wang",
        role: "Technical judgment",
        body: "What to give AI, where it will fail, and what to check. Research, engineering, and debugging shown through hands-on work.",
        href: "https://github.com/grapeot",
        link: "Yage's open-source work",
      },
    ],
    faqTitle: "Before you enroll.",
    faqs: [
      {
        q: "Is AI Builders one course or the whole plan?",
        a: "Both. AI Builders 2027 is the brand of the complete four-course learning plan. AI Builders is also the second course on the core path. The course site lists the full syllabus for each.",
      },
      {
        q: "Self-paced courses or live teaching?",
        a: "The complete plan is self-paced. All four courses are in Chinese; AI Builders and AI Architect also have English versions. For a scheduled English live cohort and real-time interaction, choose the separate Maven cohort.",
      },
      {
        q: "How does the plan relate to Stay Superlinear?",
        a: "AI Builders 2027 provides lifetime access and future updates to all four courses, plus 12 months of Stay membership. Course access continues after membership ends. Stay can also be joined independently for ongoing masterclasses, Q&A, and discussion. During membership, its courses include AI Coding, Agentic AI, and 真本事; AI Builders and AI Architect belong to the complete learning plan.",
      },
    ],
    enrollTitle: "See how the courses guide your work.",
    enrollIntro:
      "Find the full syllabus, teaching examples, learner reviews, and current prices on the official AI Builders course site.",
    maven: "English live cohorts on Maven",
    free: "Read free AI essays first",
    guide: "Compare courses, membership & the free community",
  },
} satisfies Record<
  SiteLang,
  {
    title: string[];
    intro: string;
    primary: string;
    secondary: string;
    pathTitle: string;
    pathIntro: string;
    courses: Array<{
      id: string;
      name: string;
      role: string;
      body: string;
      language: string;
    }>;
    fitTitle: string;
    fit: string;
    teachersTitle: string;
    teachers: Array<{
      name: string;
      role: string;
      body: string;
      href: string;
      link: string;
    }>;
    faqTitle: string;
    faqs: Array<{ q: string; a: string }>;
    enrollTitle: string;
    enrollIntro: string;
    maven: string;
    free: string;
    guide: string;
  }
>;

export function buildCoursesStructuredData(lang: SiteLang) {
  const meta = COURSES_PAGE_META[lang];
  const base = buildPersonWebPageStructuredData({
    ...meta,
    name: meta.title,
    lang,
  });
  const text = COURSE_COPY[lang];
  return {
    ...base,
    "@graph": [
      ...base["@graph"].map(node =>
        node["@type"] === "WebPage"
          ? { ...node, mainEntity: { "@id": COURSE_ID } }
          : node
      ),
      {
        "@type": "EducationalOrganization",
        "@id": SUPERLINEAR_ID,
        name: "Superlinear Academy",
        url: "https://www.superlinear.academy/",
      },
      {
        "@type": "Person",
        "@id": YAGE_ID,
        name: "王言",
        alternateName: ["鸭哥", "Yage", "Yan Wang"],
        url: "https://github.com/grapeot",
      },
      {
        "@type": "Course",
        "@id": COURSE_ID,
        name: "AI Builders 2027完整学习计划",
        alternateName: ["课代表立正的AI课程", "立正与鸭哥的AI课程"],
        description: text.intro,
        url: COURSE_SITE,
        provider: { "@id": SUPERLINEAR_ID },
        author: [{ "@id": PERSON_ID }, { "@id": YAGE_ID }],
        inLanguage: ["zh-CN", "en"],
        isAccessibleForFree: false,
        hasPart: text.courses.map(course => ({
          "@type": "Course",
          "@id": `${COURSE_SITE}#${course.id}`,
          name: course.name,
          description: course.body,
          provider: { "@id": SUPERLINEAR_ID },
          inLanguage: ["ai-builders", "ai-architect"].includes(course.id)
            ? ["zh-CN", "en"]
            : "zh-CN",
        })),
      },
    ],
  };
}
