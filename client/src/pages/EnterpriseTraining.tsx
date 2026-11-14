import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { Quotation } from "@/components/home/Peers";
import { Phrases } from "@/components/home/parts";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { Fragment, useEffect } from "react";
import { Link } from "wouter";
import { ENTERPRISE_TRAINING_PAGE_META } from "../../../shared/collab-meta";
import { languageAlternates } from "../../../shared/page-meta";
import { buildEnterpriseTrainingStructuredData } from "../../../shared/structured-data";

const copy = {
  en: {
    section: "Enterprise AI training",
    eyebrow: "Enterprise AI training & custom programs",
    title: "The work should be different after the training.",
    titleLines: null,
    intro:
      "When a team needs shared capability, AI Builders is the direct route. When the work itself needs to change, we start with the roles, workflows, materials, and evaluation—then design the program, cases, and tools the team actually needs.",
    proof: "14 cohorts · 3,000+ paid learners · 5.0/5 on Maven",
    primaryCta: "Compare the formats",
    secondaryCta: "Open the team brief (PDF)",
    anchorLabel: "Fully custom enterprise program",
    anchorPrice: "$100,000+",
    anchorDetail:
      "Start with the work. Leave the team with a program, cases, tools, and evaluation standards it can keep using.",
    anchorNote: "Research · Design · Live delivery · Review",
    anchorCta: "Discuss a custom program",
    shiftsEyebrow: "What training has to fix",
    shiftsTitle: "Five things team leaders tell us",
    shiftsIntro:
      "Each is followed by what changes once the team has trained together, and the evidence we can show.",
    shiftsHead: ["What they say", "After training", "Evidence"],
    shifts: [
      {
        problem:
          "“Everyone learned AI on their own, and everyone talks about it differently.”",
        change:
          "The whole team hands work to AI the same way: say what result you want, give it the background, agree on what counts as done, then check against that. A colleague can pick up your work without a walkthrough, and your strongest users stop re-teaching everyone else.",
        proof:
          "Experiment: five written rules took two AI models to 28 of 28 right on the first try.",
        page: 5,
      },
      {
        problem: "“Some people trust AI too much. Others tried it once and gave up.”",
        change:
          "People learn how AI works, so they know which jobs it can take today and which it can’t. They can also tell an answer that looks right from one that is right.",
        proof:
          "“I used to think that many scenarios were beyond AI’s capabilities.” A Microsoft applied scientist, in a public review.",
        page: 7,
      },
      {
        problem: "“AI doesn’t work on our data.”",
        change:
          "When AI gets something wrong, people first check what they handed it. Did it have the background? Did it know what done means? They fix the cause before they switch tools or models.",
        proof:
          "At DoorDash’s analytics offsite, the same AI went from a wrong answer to the right one. One document changed.",
        page: 5,
      },
      {
        problem: "“People are anxious, or quietly not using it.”",
        change:
          "Some fear they won’t be needed. Some don’t know what being good at AI would look like. In the course everyone finishes something small in the first week, and finishing settles a lot of that. They also learn that today’s tools are rough because it is early.",
        proof:
          "Rita Sun, a data analyst, thought the job was gone. Within a year Rita was the company’s AI Champion, twice.",
        page: 2,
      },
      {
        problem: "“Everyone is faster. The team isn’t.”",
        change:
          "Many workflows, reviews, and metrics were set when doing the work was expensive. The team goes through them again and drops what no longer earns its cost. One person owns a result from start to finish, and specialists turn what they know into tools colleagues can use.",
        proof:
          "People approving each step caught 13.6% of dangerous commands; an automated check caught 89%.",
        page: 5,
      },
    ],
    shiftsPage: (n: number) => `Team brief, page ${n}`,
    caseLabel: "One learner, inside a data team",
    caseBody:
      "Rita Sun is a Staff Data Analyst at a B2B SaaS company, with a PhD in economics and no engineering background. Watching the GPT-5 launch in 2025, Rita “felt I was about to lose my job,” and started our course that September. Early in 2026 Rita began writing context files for the team’s AI assistant, the way the course teaches, and in April taught the method to the whole data organization. In May the company asked Rita to lead a small group turning those files into shared skills, and product managers began pulling their own data. Within three months Rita was named AI Champion of the month twice at the data team’s all-hands.",
    caseQuote:
      "“A colleague asked if I was digging the analysts’ grave. I am only replacing the dullest part of the job.”",
    caseSrc: "From Rita’s post in our community, July 2026. Translated from Chinese.",
    testsEyebrow: "Tested before taught",
    testsTitle: "We test a method before we teach it.",
    testsIntro:
      "Three results a team lead can use right away. The raw runs of our own experiment are public.",
    demo: {
      title: "Same AI, same prompt. One document changed.",
      setup:
        "A live demo at DoorDash’s analytics offsite, on mock data. The question for AI: how much did a campaign lift order value?",
      act1: "Act 1 · the wiki page is out of date",
      answer1: "0% lift",
      note1: "Wrong, and stated with confidence. The old page sent AI to a retired table.",
      act3: "Act 3 · one new data-model document",
      answer3: "60% lift",
      note3:
        "Correct. AI wrote the document from the live database; a person added the one thing it couldn’t find.",
      take: "Across the three acts the AI, the prompt, and the business context stayed the same. Only the document changed.",
      src: "Yan Wang at DoorDash’s analytics offsite, August 2025 · recording, free sign-up",
      href: "https://www.superlinear.academy/c/public",
    },
    runs: {
      title: "Describe the destination, not the steps.",
      setup:
        "AI transcribes a 55-minute meeting recorded in two files that overlap by 40 seconds. Same top model, six runs each way.",
      a: "Following its own 16-step plan",
      aResult: "0 of 6 met every requirement",
      b: "Given five acceptance criteria",
      bResult: "6 of 6",
      take: "All six plans assumed the two files didn’t overlap, so the overlapping passage came out twice. Given only the criteria, the model found the overlap itself.",
      src: "AI Builders course text, lesson 3.7 · raw runs",
      href: "https://www.ai-builders.com/resources/aibuilder2027/m03/en/experiments/3_7_formulation/",
    },
    approve: {
      title: "Approving each step catches little.",
      setup:
        "Anthropic had 1,053 professional testers review an AI coding session with dangerous commands slipped in. Share caught:",
      a: "People approving each command",
      b: "An automated check",
      take: "In everyday use, people approve 97% of the permission prompts they see.",
      src: "Anthropic, 2026",
      href: "https://claude.com/blog/auto-mode-default-in-claude-code",
    },
    reviewsEyebrow: "Public Maven reviews",
    reviewsTitle: "What learners actually took from the course",
    reviewsIntro:
      "These are public Maven reviews. Titles and employers identify the reviewers, not employer endorsements.",
    reviews: [
      {
        quote:
          "There are many courses teaching you specific tricks but this course helps you build the right mindset and empower you to teach yourself more effectively.",
        name: "Shuyang",
        role: "Member of Technical Staff",
        company: "OpenAI",
        note: "Former Sr. AI Manager · Uber",
      },
      {
        quote:
          "There can be different new tools coming, but principles remain!",
        name: "EZ",
        role: "Engineer",
        company: "Anthropic",
      },
      {
        quote:
          "The content and instruction are both outstanding and very engaging.",
        name: "Chairy",
        role: "UX Manager",
        company: "Google",
      },
    ],
    reviewsCta: "Read public reviews on Maven",
    individualNote:
      "I do not sell paid consulting to individuals. Join Superlinear Academy for free and ask in the community; I answer individual questions there for free.",
    communityCta: "Ask in the free community",
    formatsEyebrow: "Five ways to work together",
    formatsTitle: "Start with the simplest useful step.",
    formatsIntro:
      "Start with what must change: shared capability, course content, or the work itself.",
    formats: [
      {
        number: "01",
        label: "Organization session",
        title: "Work through one real question",
        price: "From $2,000",
        detail:
          "Clarify the result, test the key assumptions, and decide whether the next step is an internal session, team enrollment, or a custom program.",
        cta: "Discuss a working session",
        href: "advisory",
        featured: false,
      },
      {
        number: "02",
        label: "Team enrollment",
        title: "Bring AI Builders to your team",
        price: "$1,999 per learner",
        detail:
          "Join a scheduled cohort. Teams of 2–9 receive 20% off; teams of 10 or more receive 25% off.",
        cta: "View AI Builders",
        href: "https://maven.com/superlinear/aibuilders",
        featured: false,
      },
      {
        number: "03",
        label: "Private cohort",
        title: "Give one organization its own cohort",
        price: "30 learners · $44,977.50+",
        detail:
          "Use the standard AI Builders curriculum on dates agreed with your team.",
        cta: "Discuss a private cohort",
        href: "training",
        featured: false,
      },
      {
        number: "04",
        label: "Course customization",
        title: "Adapt what the course teaches",
        price: "$20,000+ · plus tuition",
        detail:
          "Add company-specific cases, exercises, or material when they change what the team needs to learn. Tuition is separate.",
        cta: "Discuss course customization",
        href: "training",
        featured: false,
      },
      {
        number: "05",
        label: "Fully custom enterprise program",
        title: "Start with the business problem",
        price: "From $100,000",
        detail:
          "Study the roles, workflows, materials, and evaluation; then design the program and delivery for one organization.",
        cta: "Discuss a custom program",
        href: "training",
        featured: true,
      },
    ],
    pricingNote:
      "Planning prices in USD, before applicable taxes. Seat prices reflect current US AI Builders 2027 team pricing; final scope, faculty, schedule, payment, cancellation terms, and taxes are set in the quote and order form.",
    pdfEyebrow: "Team procurement brief · PDF",
    pdfTitle: "Forward this brief to the people deciding.",
    pdfBody:
      "Eight pages. The first half covers what changes after a team trains together. The second half is evidence and price: the demo and experiments, our predictions graded by reality, slides from company sessions, and every format.",
    pdfMeta: "PDF · 8 pages · English · November 2026",
    pdfCta: "Open the team brief",
    workEyebrow: "Fully custom programs",
    workTitle: "Full customization starts with the work.",
    workIntro:
      "Start with the work itself. Then design the program and delivery around it.",
    confidentialityLabel: "Sensitive context stays with the work",
    confidentialityDetail:
      "Real company materials are used only for the agreed delivery. Client names, materials, and project details are not published without explicit permission.",
    workSteps: [
      {
        title: "See the real work",
        detail:
          "Work with the people doing it. Examine the workflow, materials, handoffs, and recurring points of failure.",
      },
      {
        title: "Decide how people and AI divide the work",
        detail:
          "Define what AI does, what judgment stays with people, who owns the result, and how it will be evaluated.",
      },
      {
        title: "Leave the method with the team",
        detail:
          "Turn the decisions into a program, cases, tools, templates, and materials the team can keep using.",
      },
    ],
    evidenceEyebrow: "Course depth · Enterprise reality",
    evidenceTitle:
      "The course is refined in public cohorts and tested in real organizations.",
    evidenceBody:
      "AI Builders has been taught across 14 cohorts and 3,000+ paid learners. Inside a team, the test becomes concrete: will people adopt it, can the result be evaluated, and does the method remain after the session ends?",
    evidenceCaption: "DoorDash Analytics team offsite · Seattle",
    publicWorkLabel: "Selected public team trainings and internal sessions",
    publicWork: [
      { name: "DoorDash" },
      { name: "Pinterest" },
      { name: "LinkedIn" },
      { name: "Amazon" },
      { name: "Tencent" },
      { name: "Meituan" },
      { name: "Xiaohongshu" },
    ],
    publicWorkNote:
      "These are the sessions we are free to name. Many of our other trainings were private, for one company, under NDA, and those clients are not listed. Recordings are free in Superlinear Academy once you sign up.",
    recordingsCta: "Watch the recordings",
    faculty:
      "AI Builders is co-taught by Yuzheng Sun and Yan Wang. Faculty and delivery roles for each enterprise engagement are named in the proposal and order form.",
    decksCta: "Browse selected enterprise decks",
    closeEyebrow: "Start with one concrete change",
    closeTitle: "Tell us what should be different after the training.",
    closeBody:
      "Include the team, the problem today, the result you want to change, and the rough timing. We will recommend the most useful starting point.",
    closeCta: "Email Yuzheng",
    collabCta: "See all collaboration options",
  },
  zh: {
    section: "企业AI培训",
    eyebrow: "企业AI培训与定制",
    title: "培训结束以后，工作应该真的变了。",
    titleLines: ["培训结束以后，", "工作应该真的变了。"],
    intro:
      "团队要补共性能力，就直接用AI Builders。要改变一套真实工作，我们会先看岗位、流程、材料和结果怎么验收，再决定该做什么课程、案例与工具。",
    proof: "14期教学 · 3,000+付费学员 · Maven 5.0/5",
    primaryCta: "查看合作方式",
    secondaryCta: "打开团队方案PDF",
    anchorLabel: "完整定制企业项目",
    anchorPrice: "$100,000起",
    anchorDetail:
      "从真实工作开始，把判断做成团队能继续使用的课程、案例、工具与验收方式。",
    anchorNote: "研究 · 设计 · 现场交付 · 复盘",
    anchorCta: "讨论完整定制",
    shiftsEyebrow: "培训要解决的事",
    shiftsTitle: "请我们去讲课的人，|最常讲这五件事",
    shiftsIntro:
      "每件事后面，写了团队一起学完以后会怎样，和我们拿得出的证据。",
    shiftsHead: ["他们说的", "学完以后", "证据"],
    shifts: [
      {
        problem: "大家各学各的，说起AI各说各话。",
        change:
          "全组用同一套办法交代AI干活：先说清要什么结果，把背景给它，定好怎样算做完，再照着检查。同事接手你的活，不用你从头讲一遍；会用的那几个人，也不用老给别人补课。",
        proof: "实验：给AI加一页五条的规矩，28条任务里一次做对的，从10条涨到28条。",
        page: 5,
      },
      {
        problem: "有人太信AI，有人试了一次就不用了。",
        change:
          "大家弄懂AI是怎么工作的，就知道哪些活现在能交给它，哪些还不行。它交上来的东西，看着对和真的对，也分得出来。",
        proof:
          "一位微软的应用科学家在公开评价里写：以前觉得很多事AI做不了，现在遇到问题会先想怎么用AI。",
        page: 7,
      },
      {
        problem: "「AI在我们的数据上就是不好用」",
        change:
          "AI做错的时候，大家先查是不是自己没交代清楚：背景给了没有，怎样算做完说了没有。查到原因再改，不急着换工具、换模型。",
        proof:
          "DoorDash线下会上的现场演示：同一个AI、同一句话，文档过期时答错；补了一份文档，就答对了。",
        page: 5,
      },
      {
        problem: "有人焦虑，有人悄悄不用。",
        change:
          "有人怕自己以后没用了，有人不知道学到什么样才算会。课上每个人第一周就亲手做完一件小东西，做完了，心就定了一半。大家也会明白，工具现在不顺手，是因为时代还早。",
        proof:
          "学员Rita Sun看GPT-5发布会时「觉得自己要失业了」；一年不到，两次被公司提名为当月的AI Champion。",
        page: 2,
      },
      {
        problem: "每个人都快了，团队没快。",
        change:
          "很多流程、审批和考核，是在「动手做很贵」的年代定的。团队把它们拿出来重新过一遍，该省的省掉。一件事交给一个人从头管到尾。专家把自己的经验做成同事能直接用的工具，不用再一个个回答零碎的问题。",
        proof: "Anthropic的研究：让人逐条点批准，只拦住13.6%的危险操作；自动检查拦住89%。",
        page: 5,
      },
    ],
    shiftsPage: (n: number) => `团队方案PDF第${n}页`,
    caseLabel: "一位学员在自己团队里做的事",
    caseBody:
      "Rita Sun是一家B2B SaaS公司的数据分析师，经济学博士，不是技术出身。2025年看GPT-5发布会那天，Rita「觉得自己要失业了」，9月开始学我们的课。2026年初，Rita学着课里的办法，把背景和规矩写成文档交给AI，写SQL快了很多；4月起，把这个办法教给了整个数据团队。5月以后，公司让Rita带几位同事把这些文档做成全组共用的Skill，不少产品经理开始自己取数。三个月里，Rita两次在数据团队大会上被提名为当月的AI Champion。",
    caseQuote:
      "「有同事问我，我现在做的这些不就是给DA们掘坟吗……但是我只是在取代DA工作中最无聊的部分。」",
    caseSrc: "Rita Sun，2026年7月发在超线性学院社区",
    testsEyebrow: "先测过，再教",
    testsTitle: "讲的方法，我们先自己测过。",
    testsIntro:
      "下面三个结果，带团队的人马上用得上。我们自己做的实验，数据是公开的。",
    demo: {
      title: "同一个AI，同一句话，只换了一份文档",
      setup:
        "DoorDash数据分析团队线下会上的现场演示，用的是模拟数据。问AI：这个活动给订单带来多少增长？",
      act1: "第一幕 · 文档是过期的",
      answer1: "增长0%",
      note1: "答错了，口气还很肯定。旧文档把AI带到了一张停用的表上。",
      act3: "第三幕 · 补了一份数据说明",
      answer3: "增长60%",
      note3: "答对了。说明是AI照着数据库自己写的，人只补了一条它查不到的。",
      take: "三幕里，AI、问法、业务背景都没变，变的只有那份文档。",
      src: "鸭哥在DoorDash线下会上的演示，2025年8月 · 录像免费注册后可看",
      href: "https://www.superlinear.academy/c/public",
    },
    runs: {
      title: "交代终点，别交代步骤",
      setup:
        "让AI整理一场55分钟的会议录音。录音分两段，中间有40秒重叠。同一个模型，两种交代方式各跑6次。",
      a: "让它照自己写的16步清单做",
      aResult: "0次全部达标",
      b: "只告诉它5条验收标准",
      bResult: "6次全部达标",
      take: "六份清单都默认两段录音不重叠，照着做，重叠的那段话出现了两遍。只给标准的那六次，它自己发现了重叠。",
      src: "AI Builders教材3.7 · 实验数据",
      href: "https://www.ai-builders.com/resources/aibuilder2027/m03/zh/experiments/3_7_formulation/",
    },
    approve: {
      title: "让人逐条点批准，拦不住多少",
      setup:
        "Anthropic找了1,053名专业测试者，往AI写代码的过程里混进危险命令，看能拦下多少。",
      a: "人逐条点批准",
      b: "自动检查",
      take: "平时使用中，弹出来的确认，97%被人点了同意。",
      src: "Anthropic，2026年",
      href: "https://claude.com/blog/auto-mode-default-in-claude-code",
    },
    reviewsEyebrow: "Maven公开评价",
    reviewsTitle: "他们在课里真正带走了什么。",
    reviewsIntro:
      "以下均为Maven公开评价，中文为译文；任职信息用于说明评价者背景，不代表雇主背书。",
    reviews: [
      {
        // The same translation as the About page's (components/CourseReviews.tsx).
        quote:
          "很多课程教具体技巧；这门课帮你建立正确的思维方式，也让你更有效地继续自学。",
        name: "Shuyang",
        role: "Member of Technical Staff",
        company: "OpenAI",
        note: "前Uber高级AI经理",
      },
      {
        quote: "新工具会不断出现，但原理不变！",
        name: "EZ",
        role: "Engineer",
        company: "Anthropic",
      },
      {
        quote: "内容和讲授都很出色，也很吸引人。",
        name: "Chairy",
        role: "UX Manager",
        company: "Google",
      },
    ],
    reviewsCta: "在Maven读英文原文",
    individualNote:
      "我不接面向个人的付费咨询。个人问题欢迎到超线性学院的免费社区公开提问。",
    communityCta: "去免费社区提问",
    formatsEyebrow: "五种合作方式",
    formatsTitle: "从够用的那一步开始。",
    formatsIntro:
      "先看眼下要改变什么：补齐共性能力、调整课程内容，还是重新设计一项真实工作。",
    formats: [
      {
        number: "01",
        label: "团队问题梳理会或内部交流",
        title: "先把一个真实问题讲清楚",
        price: "$2,000起",
        detail:
          "围绕一个组织问题，澄清目标、验证关键假设，再判断下一步是内部交流、团队购课还是定制。",
        cta: "讨论一次团队交流",
        href: "advisory",
        featured: false,
      },
      {
        number: "02",
        label: "团队购课",
        title: "让团队一起学AI Builders",
        price: "$1,999/人",
        detail: "加入公开班；2–9人八折，10人起七五折。",
        cta: "查看AI Builders",
        href: "https://maven.com/superlinear/aibuilders",
        featured: false,
      },
      {
        number: "03",
        label: "企业专属班",
        title: "为一家企业单独开班",
        price: "30人起 · $44,977.50起",
        detail: "沿用AI Builders标准课程，由双方共同确定日期。",
        cta: "咨询企业专属班",
        href: "training",
        featured: false,
      },
      {
        number: "04",
        label: "课程定制",
        title: "把企业自己的内容放进课程",
        price: "另加$20,000起",
        detail:
          "当企业案例、材料或工作方式改变了要学和要练的内容，再增加课程定制；学费另计。",
        cta: "咨询课程定制",
        href: "training",
        featured: false,
      },
      {
        number: "05",
        label: "完整定制企业项目",
        title: "从业务问题开始",
        price: "$100,000起",
        detail:
          "研究岗位、流程、材料与验收方式，再为一家组织设计完整项目和交付。",
        cta: "讨论完整定制",
        href: "training",
        featured: true,
      },
    ],
    pricingNote:
      "以上为美元未税参考价。席位价格基于当前AI Builders 2027美国区团队方案；最终范围、讲师、时间、付款、取消条款与税费，以正式报价和双方签署的订单确认书（order form）为准。",
    pdfEyebrow: "团队采购说明 · PDF",
    pdfTitle: "把这份材料，直接转给做决定的人。",
    pdfBody:
      "一共8页。前半讲团队一起学完以后会有什么不一样；后半是证据和价格：演示和实验的结果、我们公开写下的预测对了多少、公司课的课件、五种合作方式。",
    pdfMeta: "PDF · 8页 · 英文 · 2026年11月",
    pdfCta: "打开团队方案PDF",
    workEyebrow: "完整定制企业项目",
    workTitle: "完整定制，从真实工作开始。",
    workIntro: "先看真实工作，再决定课程和交付应该长什么样。",
    confidentialityLabel: "敏感上下文只用于交付",
    confidentialityDetail:
      "企业真实材料只用于约定交付；未经明确许可，不公开客户名称、材料或项目细节。",
    workSteps: [
      {
        title: "看真实工作",
        detail: "和真正做事的人一起看流程、材料、交接和最常见的卡点。",
      },
      {
        title: "决定人和AI怎么分工",
        detail: "AI做什么、人保留什么判断、谁对结果负责，最后怎样验收。",
      },
      {
        title: "把做法留在团队里",
        detail: "把结论做成课程、案例、工具、模板和团队能继续使用的材料。",
      },
    ],
    evidenceEyebrow: "课程深度 · 企业现实",
    evidenceTitle: "课程在公开班里反复打磨，也在企业现场接受现实检验。",
    evidenceBody:
      "AI Builders已经经历14期教学和3,000+名付费学员。进入企业现场，检验会变得更具体：团队是否真的采用，结果能否验收，做法能不能留下来。",
    evidenceCaption: "DoorDash Analytics团队线下培训 · 西雅图",
    publicWorkLabel: "部分可公开的企业培训与内部分享",
    publicWork: [
      { name: "腾讯" },
      { name: "美团" },
      { name: "小红书" },
      { name: "Pinterest" },
      { name: "DoorDash" },
      { name: "LinkedIn" },
      { name: "Amazon" },
    ],
    publicWorkNote:
      "以上是可以公开的。另外还有不少企业专属培训签了保密协议，这里不具名。录像都在超线性学院的免费公开课里，注册后可以看。",
    recordingsCta: "去看公开课录像",
    faculty:
      "AI Builders由立正与鸭哥共同授课。企业项目由谁参与、分别负责什么，会写进提案与订单确认书。",
    decksCta: "查看精选企业课件",
    closeEyebrow: "从一个具体变化开始",
    closeTitle: "告诉我们：培训结束以后，什么应该真的变了。",
    closeBody:
      "写清团队、眼下的问题、希望改变的结果和大概时间。我们会直接建议最合适的合作方式。",
    closeCta: "发邮件给立正",
    collabCta: "查看全部合作方式",
  },
};

function buildMailto(
  lang: "en" | "zh",
  kind: "training" | "advisory" = "training"
) {
  const subject =
    lang === "en"
      ? kind === "advisory"
        ? "Organization session with Yuzheng Sun"
        : "Enterprise AI training with Yuzheng Sun"
      : kind === "advisory"
        ? "团队问题梳理会或内部交流"
        : "企业AI培训合作";
  const body =
    lang === "en"
      ? "Organization and my role:\n\nTeam size and roles:\n\nWhat should be different after the training:\n\nWhat we have already tried:\n\nTiming, decision owner, and budget range:\n"
      : "公司与我的职责：\n\n团队人数与岗位：\n\n希望培训后发生什么变化：\n\n已经尝试过什么：\n\n时间、决策人和预算范围：\n";
  return `mailto:yz@superlinear.academy?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function EnterpriseTraining() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const meta = ENTERPRISE_TRAINING_PAGE_META[lang];
  const mailto = buildMailto(lang);
  const advisoryMailto = buildMailto(lang, "advisory");

  useEffect(
    () =>
      applyPageSeo({
        ...meta,
        locale: lang === "zh" ? "zh_CN" : "en_US",
        alternates: languageAlternates(
          ENTERPRISE_TRAINING_PAGE_META.en.canonical,
          ENTERPRISE_TRAINING_PAGE_META.zh.canonical
        ),
        jsonLd: buildEnterpriseTrainingStructuredData(lang),
        imageAlt:
          lang === "en"
            ? "Yuzheng Sun leading enterprise AI training at DoorDash in Seattle"
            : "孙煜征在西雅图为DoorDash团队进行企业AI培训",
      }),
    [lang, meta]
  );

  const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;
  const PDF = "/enterprise/AI-Builders-2027-for-Teams.pdf";

  return (
    <div
      className={lang === "en" ? "lz-site lz-home lz-sub l-en" : "lz-site lz-home lz-sub"}
      lang={lang === "en" ? "en" : "zh-CN"}
    >
      <SiteHeader current="collab" />

      <main>
        {/* The offer, on the forest: what should change, and beside it what a fully custom
            programme starts at, set as type between hairlines (no box, no badge). */}
        <section className="forest-head grain">
          <div className="wrap">
            <nav className="crumb" aria-label={lang === "en" ? "Breadcrumb" : "位置"}>
              <Link href={withLanguage("/collab", lang)}>
                {lang === "en" ? "Collaborate" : "合作"}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{t.section}</span>
            </nav>
            <div className="cols2">
              <div>
                <div className="eyebrow">{t.eyebrow}</div>
                <h1>
                  {t.titleLines
                    ? t.titleLines.map(line => (
                        <span key={line} className="line">
                          {line}
                        </span>
                      ))
                    : t.title}
                </h1>
                <p className="lede">{t.intro}</p>
                <p className="aside">{t.proof}</p>
                <div className="cta-row">
                  <a className="btn btn-ivory" href="#formats">
                    {t.primaryCta}
                  </a>
                  <a className="btn btn-line" href={PDF} {...EXTERNAL}>
                    {t.secondaryCta}
                  </a>
                </div>
              </div>
              <aside className="offer">
                <div className="t">{t.anchorLabel}</div>
                <p className="price">{t.anchorPrice}</p>
                <p>{t.anchorDetail}</p>
                <p className="steps">{t.anchorNote}</p>
                <a className="lz-link" href={mailto}>
                  {t.anchorCta} <i aria-hidden="true">→</i>
                </a>
              </aside>
            </div>
          </div>
        </section>

        {/* What training has to fix, as the people deciding see it: each problem, what changes,
            and the evidence, between hairlines. The evidence itself is in the team brief. */}
        <section className="sec">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">{t.shiftsEyebrow}</div>
                <h2>
                  <Phrases text={t.shiftsTitle} />
                </h2>
              </div>
              <p>{t.shiftsIntro}</p>
            </div>
            <div className="shifts-head" aria-hidden="true">
              <span />
              {t.shiftsHead.map(label => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <ol className="shifts">
              {t.shifts.map((shift, index) => (
                <li key={shift.problem}>
                  <span className="n" aria-hidden="true">
                    {index + 1}
                  </span>
                  <p className="q">
                    <Phrases text={shift.problem} />
                  </p>
                  <p className="a" data-label={t.shiftsHead[1]}>
                    {shift.change}
                  </p>
                  <p className="e" data-label={t.shiftsHead[2]}>
                    {shift.proof}
                    <a className="pg" href={`${PDF}#page=${shift.page}`} {...EXTERNAL}>
                      {t.shiftsPage(shift.page)}
                    </a>
                  </p>
                </li>
              ))}
            </ol>
            {/* One learner's account of what happened on the learner's own team, with a line from the post. */}
            <div className="case-row">
              <div className="lab">{t.caseLabel}</div>
              <div>
                <p>{t.caseBody}</p>
                <blockquote>{t.caseQuote}</blockquote>
                <p className="fine">{t.caseSrc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tested before taught: three results drawn in ink, each with where it comes from. */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">{t.testsEyebrow}</div>
                <h2>
                  <Phrases text={t.testsTitle} />
                </h2>
              </div>
              <p>{t.testsIntro}</p>
            </div>
            <div className="cols tests">
              <article>
                <h3>
                  <Phrases text={t.demo.title} />
                </h3>
                <p className="setup">{t.demo.setup}</p>
                <div className="demo-acts">
                  <div className="act bad">
                    <span className="lab">{t.demo.act1}</span>
                    <b>{t.demo.answer1}</b>
                    <span>{t.demo.note1}</span>
                  </div>
                  <div className="act good">
                    <span className="lab">{t.demo.act3}</span>
                    <b>{t.demo.answer3}</b>
                    <span>{t.demo.note3}</span>
                  </div>
                </div>
                <p className="take">{t.demo.take}</p>
                <p className="src">
                  <a href={t.demo.href} {...EXTERNAL}>
                    {t.demo.src}
                  </a>
                </p>
              </article>
              <article>
                <h3>
                  <Phrases text={t.runs.title} />
                </h3>
                <p className="setup">{t.runs.setup}</p>
                <div className="tally">
                  <span className="lab">{t.runs.a}</span>
                  <span className="dots off" aria-hidden="true">
                    <i /><i /><i /><i /><i /><i />
                  </span>
                  <span className="n">{t.runs.aResult}</span>
                </div>
                <div className="tally">
                  <span className="lab">{t.runs.b}</span>
                  <span className="dots" aria-hidden="true">
                    <i /><i /><i /><i /><i /><i />
                  </span>
                  <span className="n on">{t.runs.bResult}</span>
                </div>
                <p className="take">{t.runs.take}</p>
                <p className="src">
                  <a href={t.runs.href} {...EXTERNAL}>
                    {t.runs.src}
                  </a>
                </p>
              </article>
              <article>
                <h3>
                  <Phrases text={t.approve.title} />
                </h3>
                <p className="setup">{t.approve.setup}</p>
                <div className="tally">
                  <span className="lab">{t.approve.a}</span>
                  <span className="bar dim" style={{ width: "13.6%" }} aria-hidden="true" />
                  <span className="n on">13.6%</span>
                </div>
                <div className="tally">
                  <span className="lab">{t.approve.b}</span>
                  <span className="bar" style={{ width: "89%" }} aria-hidden="true" />
                  <span className="n on">89%</span>
                </div>
                <p className="take">{t.approve.take}</p>
                <p className="src">
                  <a href={t.approve.href} {...EXTERNAL}>
                    {t.approve.src}
                  </a>
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Public reviews: the rating beside the title, three reviewers side by side. */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="head top">
              <div>
                <div className="eyebrow">{t.reviewsEyebrow}</div>
                <p className="rating">
                  5.0<small> / 5</small>
                </p>
              </div>
              <div>
                <h2>{t.reviewsTitle}</h2>
                <p className="after">{t.reviewsIntro}</p>
                <a
                  className="lz-link"
                  href="https://maven.com/superlinear/aibuilders#reviews"
                  {...EXTERNAL}
                >
                  {t.reviewsCta} <i aria-hidden="true">→</i>
                </a>
              </div>
            </div>
            <div className="cols reviews">
              {t.reviews.map(review => (
                <figure key={review.name}>
                  {/* English as the reviewers wrote it; the Chinese page sets its translation in
                      phrases, as the About page does, so no line ends inside a word. */}
                  {lang === "zh" ? (
                    <blockquote>
                      <Quotation text={review.quote} />
                    </blockquote>
                  ) : (
                    <blockquote lang="en">“{review.quote}”</blockquote>
                  )}
                  <figcaption>
                    <b>{review.company}</b>
                    <span>
                      {review.name} · {review.role}
                    </span>
                    {"note" in review && review.note ? (
                      <span>{review.note}</span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* The five formats, lightest first: a ladder of rows. The fully custom programme, the
            one the head names, is ruled in ink. */}
        <section id="formats" className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">{t.formatsEyebrow}</div>
                <h2>{t.formatsTitle}</h2>
              </div>
              <p>{t.formatsIntro}</p>
            </div>
            <ol className="ladder">
              {t.formats.map(format => {
                const href =
                  format.href === "training"
                    ? mailto
                    : format.href === "advisory"
                      ? advisoryMailto
                      : format.href;
                const isExternal = href.startsWith("http");
                return (
                  <li
                    key={format.number}
                    className={format.featured ? "anchor" : undefined}
                  >
                    <span className="n" aria-hidden="true">
                      {Number(format.number)}
                    </span>
                    <div className="what">
                      <div className="t">{format.label}</div>
                      <h3>{format.title}</h3>
                    </div>
                    <p className="price">{format.price}</p>
                    <p className="detail">{format.detail}</p>
                    <a
                      className="lz-link"
                      href={href}
                      {...(isExternal ? EXTERNAL : {})}
                    >
                      {format.cta} <i aria-hidden="true">→</i>
                    </a>
                  </li>
                );
              })}
            </ol>
            <p className="fine">{t.pricingNote}</p>
            <div className="aside-row">
              <p>{t.individualNote}</p>
              <a
                className="lz-link"
                href="https://www.superlinear.academy/"
                {...EXTERNAL}
              >
                {t.communityCta} <i aria-hidden="true">→</i>
              </a>
            </div>

            <div className="doc-row">
              <a href={PDF} {...EXTERNAL} tabIndex={-1} aria-hidden="true">
                <img
                  src="/enterprise/ai-builders-2027-for-teams-preview.webp"
                  alt=""
                  width={1224}
                  height={1584}
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <div>
                <div className="eyebrow">{t.pdfEyebrow}</div>
                <h2>
                  <Phrases text={t.pdfTitle} />
                </h2>
                <p>{t.pdfBody}</p>
                <p className="fine">{t.pdfMeta}</p>
                <div className="cta-row">
                  <a className="btn btn-green" href={PDF} {...EXTERNAL}>
                    {t.pdfCta}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fully custom work, in three moves, and what happens to sensitive material. */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">{t.workEyebrow}</div>
                <h2>
                  {lang === "zh" ? (
                    <>
                      <span className="phrase">完整定制，</span>
                      <span className="phrase">从真实工作开始。</span>
                    </>
                  ) : (
                    t.workTitle
                  )}
                </h2>
              </div>
              <p>{t.workIntro}</p>
            </div>
            <div className="cols">
              {t.workSteps.map(step => (
                <article key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </article>
              ))}
            </div>
            <div className="note-row wide">
              <div className="lab">{t.confidentialityLabel}</div>
              <p>{t.confidentialityDetail}</p>
            </div>
          </div>
        </section>

        {/* Where the course has been tested: the room, then what can be named. */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="evidence">
              <figure>
                <img
                  src="/english-network/doordash-ai-training.webp"
                  alt={
                    lang === "en"
                      ? "Yuzheng Sun leading an AI training session for DoorDash in Seattle"
                      : "孙煜征在西雅图为DoorDash团队进行AI培训"
                  }
                  width={1280}
                  height={720}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{t.evidenceCaption}</figcaption>
              </figure>
              <div>
                <div className="eyebrow">{t.evidenceEyebrow}</div>
                <h2>
                  <Phrases text={t.evidenceTitle} />
                </h2>
                <p className="say">{t.evidenceBody}</p>
                <div className="named">
                  <div className="t">{t.publicWorkLabel}</div>
                  <p className="orgs-line">
                    {t.publicWork.map((org, index) => (
                      <Fragment key={org.name}>
                        {index > 0 ? " · " : null}
                        {org.name}
                      </Fragment>
                    ))}
                  </p>
                  <p className="fine">{t.publicWorkNote}</p>
                </div>
                <p className="say small">{t.faculty}</p>
                <div className="links-row">
                  <Link className="lz-link" href={withLanguage("/decks", lang)}>
                    {t.decksCta} <i aria-hidden="true">→</i>
                  </Link>
                  <a className="lz-link" href="https://www.superlinear.academy/c/public" {...EXTERNAL}>
                    {t.recordingsCta} <i aria-hidden="true">→</i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">{t.closeEyebrow}</div>
                <h2>
                  <Phrases text={t.closeTitle} />
                </h2>
              </div>
              <div>
                <p className="say first">{t.closeBody}</p>
                <div className="cta-row">
                  <a className="btn btn-green" href={mailto}>
                    {t.closeCta}
                  </a>
                  <Link className="lz-link" href={withLanguage("/collab", lang)}>
                    {t.collabCta} <i aria-hidden="true">→</i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
