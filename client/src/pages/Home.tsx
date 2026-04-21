import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage, pick } from "@/contexts/LanguageContext";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Youtube,
  Linkedin,
  Mail,
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Award,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Menu,
  X,
  ArrowRight,
  Play,
  Building2,
  Rss,
  Zap,
  Wrench,
  Rocket,
  Landmark,
  Brain,
  Compass,
  BarChart2,
  MapPin,
  Smartphone,
  Apple,
} from "lucide-react";

const stats = {
  en: [
    { value: "300K+", label: "High-signal followers" },
    { value: "3,000+", label: "Paying students · half from Silicon Valley" },
    { value: "4.9/5", label: "Course rating" },
    { value: "200+", label: "Conversations with tech leaders" },
  ],
  zh: [
    { value: "300K+", label: "全网高质量粉丝" },
    { value: "3000+", label: "付费学员 · 半数硅谷大厂" },
    { value: "4.9/5", label: "课程评分" },
    { value: "200+", label: "科技领袖对话" },
  ],
};

const highlights = {
  en: [
    {
      icon: <Award className="h-5 w-5 text-amber-300" />,
      title: "Maven Top AI Instructor",
      desc: "A rigorous AI methodology course for top professionals at top companies. Endorsed by Prof. Jia Liu of Tsinghua University.",
    },
    {
      icon: <BookOpen className="h-5 w-5 text-amber-300" />,
      title: "300+ pages of original material",
      desc: "12 hours of carefully produced video — first principles and real-world practice, end to end.",
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-amber-300" />,
      title: "8 hands-on projects",
      desc: "Go from thinking to shipping — build a compounding growth curve as a builder.",
    },
    {
      icon: <Users className="h-5 w-5 text-amber-300" />,
      title: "Lifetime community support",
      desc: "One-time purchase. Ongoing Q&A, new cohorts, and content updates.",
    },
  ],
  zh: [
    {
      icon: <Award className="h-5 w-5 text-amber-300" />,
      title: "Maven Top AI Instructor",
      desc: "专为顶尖公司的顶尖个体打造的 AI 方法论课程。清华大学刘嘉教授倾情推荐。",
    },
    {
      icon: <BookOpen className="h-5 w-5 text-amber-300" />,
      title: "300+ 页原创课件",
      desc: "12小时精心录制视频，系统打通原理与实战",
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-amber-300" />,
      title: "8个实战项目",
      desc: "从思维到产品交付，建立 Builder 增长曲线",
    },
    {
      icon: <Users className="h-5 w-5 text-amber-300" />,
      title: "终身社区支持",
      desc: "一次购买，长期答疑与内容更新",
    },
  ],
};

const career = {
  en: [
    {
      company: "Statsig (acquired by OpenAI)",
      role: "Principal Data Scientist + Sole Evangelist",
      note: "Early team member. Statsig was acquired by OpenAI in 2025 at a $1.1B valuation — a non-consensus bet that paid off.",
    },
    {
      company: "Tencent IEG",
      role: "Deputy Director, Data & AI",
      note: "Two consecutive five-star performance ratings. Led a 30-person data and AI org.",
    },
    { company: "Meta (Facebook)", role: "Data Scientist", note: "" },
    { company: "Amazon", role: "Economist", note: "" },
  ],
  zh: [
    { company: "Statsig (被 OpenAI 收购)", role: "首席数据科学家 + 唯一布道师 (Principal DS + Sole Evangelist)", note: "早期成员，2025 年被 OpenAI 以 $11 亿估值收购，验证非共识眼光" },
    { company: "腾讯 IEG (Tencent IEG)", role: "副总监 · 数据与 AI (Deputy Director, Data & AI)", note: "双五星绩效 · 管理 30 人数据与 AI 团队" },
    { company: "Meta (Facebook)", role: "数据科学家 (Data Scientist)", note: "" },
    { company: "Amazon", role: "经济学家 (Economist)", note: "" },
  ],
};

const endorsements = {
  en: [
    {
      quote:
        "Yuzheng is a true AI-native pioneer — his distinctive thinking framework helps people achieve superlinear growth in the AI era.",
      name: "Dai Yusen",
      title: "Partner, ZhenFund",
      subtitle: "真格基金合伙人",
      avatar: "/avatars/dai-yusen.jpg",
      initials: "DY",
    },
    {
      quote:
        "Yuzheng has built what I consider the best AI education community bar none — thoughtfully curated, rigorously practical, and genuinely life-changing.",
      name: "Wei Manfredi",
      title: "Global CAIO & CTO · McDonald's · Google Cloud · lululemon",
      subtitle: "Top 100 Global AI Leaders · Top AI Leaders in Retail 2026",
      avatar: "/avatars/wei-manfredi.jpg",
      initials: "WM",
    },
    {
      quote:
        "Yuzheng distills years of product growth wisdom into actionable insight — helping data scientists surface decisive signals, PMs turn numbers into strategy, and founders find a repeatable path to compounding PMF.",
      name: "Vijaye Raji",
      title: "Founder & CEO, Statsig",
      subtitle: "CTO of Applications, OpenAI",
      avatar: "/avatars/vijaye-raji.jpg",
      initials: "VR",
    },
  ],
  zh: [
    {
      quote:
        "立正是真正的 AI Native Pioneer——他用独特的思维框架，带领更多人在AI时代实现超线性成长。",
      name: "戴雨森",
      title: "真格基金合伙人",
      subtitle: "ZhenFund Partner",
      avatar: "/avatars/dai-yusen.jpg",
      initials: "雨森",
    },
    {
      quote:
        "Yuzheng has built what I consider the best AI education community bar none — thoughtfully curated, rigorously practical, and genuinely life-changing.",
      name: "Wei Manfredi",
      title: "Global CAIO & CTO · McDonald's · Google Cloud · lululemon",
      subtitle: "Top 100 Global AI Leaders · Top AI Leaders in Retail 2026",
      avatar: "/avatars/wei-manfredi.jpg",
      initials: "WM",
    },
    {
      quote:
        "Yuzheng distills years of product growth wisdom into actionable insight — helping data scientists surface decisive signals, PMs turn numbers into strategy, and founders find a repeatable path to compounding PMF.",
      name: "Vijaye Raji",
      title: "Founder & CEO, Statsig",
      subtitle: "CTO of Applications, OpenAI",
      avatar: "/avatars/vijaye-raji.jpg",
      initials: "VR",
    },
  ],
};

const guests = {
  en: [
    { id: "7ej2r7XysKc", name: "Shuchao Bi", title: "Head of Post-Training · Multimodal", company: "OpenAI", videoUrl: "https://www.youtube.com/watch?v=7ej2r7XysKc" },
    { id: "RRSMjC_BF8Y", name: "Ethan Evans", title: "Former VP", company: "Amazon", videoUrl: "https://www.youtube.com/watch?v=RRSMjC_BF8Y" },
    { id: "GIv0I-34aaI", name: "Reynold Xin", title: "Co-founder", company: "Databricks", videoUrl: "https://www.youtube.com/watch?v=GIv0I-34aaI" },
    { id: "dymM40bVIhQ", name: "Yuandong Tian", title: "Research Scientist", company: "Meta AI (FAIR)", videoUrl: "https://www.youtube.com/watch?v=dymM40bVIhQ" },
    { id: "awaZBWTss-4", name: "Howie Xu", title: "Chief AI Officer", company: "Gen Digital", videoUrl: "https://www.youtube.com/watch?v=awaZBWTss-4" },
    { id: "iw2QYZeVlOQ", name: "Vijaye Raji (VJ)", title: "Founder & CEO", company: "Statsig · acquired by OpenAI", videoUrl: "https://www.youtube.com/watch?v=iw2QYZeVlOQ" },
    { id: "CTcMvIZFQcw", name: "Leon", title: "Anonymous Silicon Valley exec", company: "Silicon Valley", videoUrl: "https://www.youtube.com/watch?v=CTcMvIZFQcw" },
    { id: "BnL5qaBzmR0", name: "Ryo Lu", title: "Head of Design", company: "Cursor", videoUrl: "https://www.youtube.com/watch?v=BnL5qaBzmR0" },
    { id: "3t2I_BMG9gU", name: "Dai Yusen", title: "Partner", company: "ZhenFund", videoUrl: "https://www.youtube.com/watch?v=3t2I_BMG9gU" },
    { id: "UndcL0uEmYs", name: "Prof. Zhou Yu", title: "Professor of AI", company: "Columbia University", videoUrl: "https://www.youtube.com/watch?v=UndcL0uEmYs" },
  ],
  zh: [
    { id: "7ej2r7XysKc", name: "毕书超 Shuchao Bi", title: "Head of Post-Training · Multimodal", company: "OpenAI", videoUrl: "https://www.youtube.com/watch?v=7ej2r7XysKc" },
    { id: "RRSMjC_BF8Y", name: "Ethan Evans", title: "前副总裁 (Former VP)", company: "Amazon", videoUrl: "https://www.youtube.com/watch?v=RRSMjC_BF8Y" },
    { id: "GIv0I-34aaI", name: "Reynold Xin", title: "联合创始人 (Co-founder)", company: "Databricks", videoUrl: "https://www.youtube.com/watch?v=GIv0I-34aaI" },
    { id: "dymM40bVIhQ", name: "田渊栋 Yuandong Tian", title: "Research Scientist", company: "Meta AI (FAIR)", videoUrl: "https://www.youtube.com/watch?v=dymM40bVIhQ" },
    { id: "awaZBWTss-4", name: "Howie Xu (硅谷徐老师)", title: "首席 AI 官 (Chief AI Officer)", company: "Gen Digital", videoUrl: "https://www.youtube.com/watch?v=awaZBWTss-4" },
    { id: "iw2QYZeVlOQ", name: "Vijaye Raji (VJ)", title: "创始人 & CEO", company: "Statsig · OpenAI 收购", videoUrl: "https://www.youtube.com/watch?v=iw2QYZeVlOQ" },
    { id: "CTcMvIZFQcw", name: "Leon", title: "匿名硅谷高管", company: "Silicon Valley", videoUrl: "https://www.youtube.com/watch?v=CTcMvIZFQcw" },
    { id: "BnL5qaBzmR0", name: "Ryo Lu", title: "Head of Design", company: "Cursor", videoUrl: "https://www.youtube.com/watch?v=BnL5qaBzmR0" },
    { id: "3t2I_BMG9gU", name: "戴雨森", title: "合伙人 (Partner)", company: "真格基金 (Zhenfund)", videoUrl: "https://www.youtube.com/watch?v=3t2I_BMG9gU" },
    { id: "UndcL0uEmYs", name: "俞舟 Zhou Yu", title: "AI 教授 (Professor)", company: "Columbia University", videoUrl: "https://www.youtube.com/watch?v=UndcL0uEmYs" },
  ],
};

const playlists = {
  en: [
    { name: "AI-era opportunities", count: 101, desc: "AI trends, AGI, and career impact", id: "PLO_DkCSmTKMNecQCgUHqTYtmwPWGUvDG_", icon: <Zap className="h-5 w-5" />, color: "text-amber-300" },
    { name: "AI tools in practice", count: 16, desc: "Cursor, vibe coding, workflows", id: "PLO_DkCSmTKMPdBSW6bJH_KduR9-kzVTNF", icon: <Wrench className="h-5 w-5" />, color: "text-sky-300" },
    { name: "Job search & interviews", count: 28, desc: "Resumes, DS/PM/Eng interview playbooks", id: "PLO_DkCSmTKMN5IGvvtiNU9Q1MskoN_RHb", icon: <Briefcase className="h-5 w-5" />, color: "text-green-300" },
    { name: "Workplace skills", count: 90, desc: "Promotions, presenting up, soft skills", id: "PLO_DkCSmTKMPS6P2dKYHRethlKqmIQw0h", icon: <TrendingUp className="h-5 w-5" />, color: "text-lime-300" },
    { name: "Big Tech, up close", count: 57, desc: "FAANG internals, VP tracks, layoffs", id: "PLO_DkCSmTKMMws_nKzRMsIx5nvP5Hl68R", icon: <Building2 className="h-5 w-5" />, color: "text-rose-300" },
    { name: "Founders & startups", count: 115, desc: "Founder interviews, fundraising, product growth", id: "PLO_DkCSmTKMOPSv4YWDKC7-gr88CyHf_3", icon: <Rocket className="h-5 w-5" />, color: "text-orange-300" },
    { name: "Wealth & investing", count: 41, desc: "Financial freedom, strategy, personal finance", id: "PLO_DkCSmTKMPrqKZDSrq9scXhcyrcib8E", icon: <Landmark className="h-5 w-5" />, color: "text-yellow-300" },
    { name: "Thinking & decisions", count: 130, desc: "Mental models, judgment, upgrading how you think", id: "PLO_DkCSmTKMOCP4X8YxHQf5ZZdh0JpgIn", icon: <Brain className="h-5 w-5" />, color: "text-purple-300" },
    { name: "Life design", count: 120, desc: "Big choices, meaning, and living coherently", id: "PLO_DkCSmTKMMCWo7yeAyHVKzvy4fTXlju", icon: <Compass className="h-5 w-5" />, color: "text-pink-300" },
    { name: "Data science", count: 43, desc: "DS/ML, A/B testing, analytics", id: "PLO_DkCSmTKMPBTVU2zy8JH-I6e6L8lx-l", icon: <BarChart2 className="h-5 w-5" />, color: "text-cyan-300" },
    { name: "Life in the US", count: 43, desc: "Culture notes, dating, staying vs. going home", id: "PLO_DkCSmTKMNDn0jfOu8pB0mPxqCsr4lU", icon: <MapPin className="h-5 w-5" />, color: "text-teal-300" },
  ],
  zh: [
    { name: "AI时代机会", count: 101, desc: "AI趋势、AGI与职业冲击", id: "PLO_DkCSmTKMNecQCgUHqTYtmwPWGUvDG_", icon: <Zap className="h-5 w-5" />, color: "text-amber-300" },
    { name: "AI工具实战", count: 16, desc: "Cursor、Vibe Coding、工作流", id: "PLO_DkCSmTKMPdBSW6bJH_KduR9-kzVTNF", icon: <Wrench className="h-5 w-5" />, color: "text-sky-300" },
    { name: "求职与面试", count: 28, desc: "简历、DS/PM/Eng面试全攻略", id: "PLO_DkCSmTKMN5IGvvtiNU9Q1MskoN_RHb", icon: <Briefcase className="h-5 w-5" />, color: "text-green-300" },
    { name: "职场技能", count: 90, desc: "升职加薪、汇报、情绪价值", id: "PLO_DkCSmTKMPS6P2dKYHRethlKqmIQw0h", icon: <TrendingUp className="h-5 w-5" />, color: "text-lime-300" },
    { name: "大厂观察", count: 57, desc: "FAANG内幕、VP路径、裁员", id: "PLO_DkCSmTKMMws_nKzRMsIx5nvP5Hl68R", icon: <Building2 className="h-5 w-5" />, color: "text-rose-300" },
    { name: "创业实战", count: 115, desc: "创始人访谈、融资、产品增长", id: "PLO_DkCSmTKMOPSv4YWDKC7-gr88CyHf_3", icon: <Rocket className="h-5 w-5" />, color: "text-orange-300" },
    { name: "财富与投资", count: 41, desc: "财富自由、投资策略、理财", id: "PLO_DkCSmTKMPrqKZDSrq9scXhcyrcib8E", icon: <Landmark className="h-5 w-5" />, color: "text-yellow-300" },
    { name: "思维与决策", count: 130, desc: "思维模型、判断力、认知升级", id: "PLO_DkCSmTKMOCP4X8YxHQf5ZZdh0JpgIn", icon: <Brain className="h-5 w-5" />, color: "text-purple-300" },
    { name: "人生设计", count: 120, desc: "重大选择、意义感、自洽", id: "PLO_DkCSmTKMMCWo7yeAyHVKzvy4fTXlju", icon: <Compass className="h-5 w-5" />, color: "text-pink-300" },
    { name: "数据科学", count: 43, desc: "DS/ML技术、AB实验、数据分析", id: "PLO_DkCSmTKMPBTVU2zy8JH-I6e6L8lx-l", icon: <BarChart2 className="h-5 w-5" />, color: "text-cyan-300" },
    { name: "美国生活", count: 43, desc: "文化观察、约会、回国vs留美", id: "PLO_DkCSmTKMNDn0jfOu8pB0mPxqCsr4lU", icon: <MapPin className="h-5 w-5" />, color: "text-teal-300" },
  ],
};

const testimonials = {
  en: [
    {
      quote:
        "Regardless of your background — technical or not — and wherever you are in your AI journey, this course is incredibly valuable. It teaches you how to think about building with AI. I've noticed a real shift in how I approach my work and everyday problems — like putting on a new pair of glasses. It gave me a solid foundation and, more importantly, the confidence and motivation to keep exploring on my own.",
      name: "Julia",
      role: "Strategy Ops Manager",
      company: "TikTok",
      avatar: "/avatars/julia.png",
      initials: "J",
    },
    {
      quote:
        "The content and teaching are both excellent and engaging. It covers the fundamentals along with the cutting edge — agents and the latest products — with a great balance of theory and practice. Even though I use AI tools every day, I still came away with a deeper understanding and a much more effective way to build with AI. The instructor is also remarkably thoughtful and responsive.",
      name: "Chairy",
      role: "UX Manager",
      company: "Google",
      avatar: "/avatars/chairy.png",
      initials: "C",
    },
    {
      quote:
        "There are plenty of courses that teach specific techniques. This one builds the mental model that makes you a more effective self-learner.",
      name: "Shuyang",
      role: "Senior Applied Science Manager",
      company: "Uber",
      avatar: "/avatars/shuyang.jpg",
      initials: "S",
    },
  ],
  zh: [
    {
      quote:
        "无论你的背景如何（技术或非技术），无论你在 AI 学习旅程的哪个阶段，这门课都极具价值——它教的是如何思考用 AI 来构建系统的框架。我注意到自己在工作和日常生活中的思维方式发生了转变，就像用一副全新的视角看世界。这门课给了我一个坚实的起点，让我有信心也有动力继续自主探索。",
      name: "Julia",
      role: "Strategy Ops Manager",
      company: "TikTok",
      avatar: "/avatars/julia.png",
      initials: "J",
    },
    {
      quote:
        "课程内容和教学都非常出色、很吸引人。涵盖了基础知识和最新前沿话题（如 Agent 和行业最新产品），理论与实践的平衡做得很好。尽管每天都在使用 AI 工具，我仍然学到了更深层次的东西，能更有效地利用 AI 来构建解决方案。讲师对问题的回应也非常及时，很受启发。",
      name: "Chairy",
      role: "UX Manager",
      company: "Google",
      avatar: "/avatars/chairy.png",
      initials: "C",
    },
    {
      quote:
        "市面上有很多课程教你具体的技巧，但这门课帮你建立正确的思维方式，让你能更高效地自我学习。",
      name: "Shuyang",
      role: "Senior Applied Science Manager",
      company: "Uber",
      avatar: "/avatars/shuyang.jpg",
      initials: "S",
    },
  ],
};

export default function Home() {
  const { lang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [communityVisible, setCommunityVisible] = useState(false);
  const communityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = communityRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCommunityVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  const nav = pick(lang, {
    en: {
      about: "About",
      background: "Background",
      endorsements: "Endorsements",
      enterprise: "Enterprise",
      course: "Course",
      testimonials: "Testimonials",
      guests: "Guests",
      content: "Topics",
      book: "Book",
      newBook: "New Book",
      joinCommunity: "Join Community",
      joinArrow: "Join community →",
    },
    zh: {
      about: "关于我",
      background: "职业背景",
      endorsements: "推荐语",
      enterprise: "企业培训",
      course: "AI课程",
      testimonials: "学员评价",
      guests: "嘉宾",
      content: "内容分类",
      book: "新书",
      newBook: "新书《真本事》",
      joinCommunity: "加入社群",
      joinArrow: "加入社群 →",
    },
  });

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -right-40 top-40 h-[28rem] w-[28rem] rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => scrollToSection("hero")} className="text-left">
              <div className="text-lg font-semibold tracking-wide text-amber-300">
                {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
              </div>
              <div className="text-xs text-zinc-400">
                {lang === "en" ? "课代表立正" : "Yuzheng Sun"}
              </div>
            </button>

            <div className="hidden items-center gap-6 lg:flex">
              <button onClick={() => scrollToSection("about")} className="text-sm text-zinc-300 transition hover:text-amber-300">{nav.about}</button>
              <button onClick={() => scrollToSection("background")} className="text-sm text-zinc-300 transition hover:text-amber-300">{nav.background}</button>
              <button onClick={() => scrollToSection("endorsements")} className="text-sm text-zinc-300 transition hover:text-amber-300">{nav.endorsements}</button>
              <button onClick={() => scrollToSection("enterprise")} className="text-sm text-zinc-300 transition hover:text-amber-300">{nav.enterprise}</button>
              <button onClick={() => scrollToSection("course")} className="text-sm text-zinc-300 transition hover:text-amber-300">{nav.course}</button>
              <button onClick={() => scrollToSection("testimonials")} className="text-sm text-zinc-300 transition hover:text-amber-300">{nav.testimonials}</button>
              <Link href="/guests" className="text-sm text-zinc-300 transition hover:text-amber-300">{nav.guests}</Link>
              <button onClick={() => scrollToSection("playlists")} className="text-sm text-zinc-300 transition hover:text-amber-300">{nav.content}</button>
              <Link href="/zbs" className="text-sm text-zinc-300 transition hover:text-amber-300">{nav.book}</Link>
              <LanguageToggle size="sm" />
              <Button asChild className="bg-amber-500 text-[#211300] hover:bg-amber-400">
                <a href="https://www.superlinear.academy" target="_blank" rel="noopener noreferrer">
                  <Users className="mr-2 h-4 w-4" />
                  {nav.joinCommunity}
                </a>
              </Button>
            </div>

            <div className="flex items-center gap-3 lg:hidden">
              <LanguageToggle size="sm" />
              <button
                className="rounded-md p-1 text-zinc-300 transition hover:text-amber-300"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4 lg:hidden">
              <button onClick={() => scrollToSection("about")} className="block text-zinc-300 transition hover:text-amber-300">{nav.about}</button>
              <button onClick={() => scrollToSection("background")} className="block text-zinc-300 transition hover:text-amber-300">{nav.background}</button>
              <button onClick={() => scrollToSection("endorsements")} className="block text-zinc-300 transition hover:text-amber-300">{nav.endorsements}</button>
              <button onClick={() => scrollToSection("enterprise")} className="block text-zinc-300 transition hover:text-amber-300">{nav.enterprise}</button>
              <button onClick={() => scrollToSection("course")} className="block text-zinc-300 transition hover:text-amber-300">{nav.course}</button>
              <button onClick={() => scrollToSection("testimonials")} className="block text-zinc-300 transition hover:text-amber-300">{nav.testimonials}</button>
              <Link href="/guests" className="block text-zinc-300 transition hover:text-amber-300">{nav.guests}</Link>
              <button onClick={() => scrollToSection("playlists")} className="block text-zinc-300 transition hover:text-amber-300">{nav.content}</button>
              <Link href="/zbs" className="block text-zinc-300 transition hover:text-amber-300">{nav.newBook}</Link>
              <a href="https://www.superlinear.academy" target="_blank" rel="noopener noreferrer" className="block text-amber-300 transition hover:text-amber-200">{nav.joinArrow}</a>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10">
        <section id="hero" className="container py-14 md:py-20 lg:py-24">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-7">
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl">
                {lang === "en" ? (
                  <>
                    From usable AI
                    <span className="block bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300 bg-clip-text text-transparent">
                      to AI that delivers at work.
                    </span>
                  </>
                ) : (
                  <>
                    把 AI 从「能用」
                    <span className="block bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300 bg-clip-text text-transparent">
                      推到真实工作里的「靠谱与高效」。
                    </span>
                  </>
                )}
              </h1>

              <div className="max-w-2xl space-y-1 font-mono text-[13px] leading-relaxed text-amber-300/85">
                {lang === "en" ? (
                  <>
                    <p>Cornell PhD · ex-Amazon / Meta / Tencent IEG Deputy Director</p>
                    <p>Principal Data Scientist + sole evangelist at Statsig (acquired by OpenAI)</p>
                  </>
                ) : (
                  <>
                    <p>康奈尔经济学博士 · 前 Amazon / Meta / 腾讯 IEG 副总监</p>
                    <p>Statsig 首席数据科学家 + 唯一布道师（被 OpenAI 收购）</p>
                  </>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="https://ai-builders.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-amber-300/40 hover:bg-white/10"
                >
                  <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-amber-300">
                    <GraduationCap className="h-4 w-4" />
                    {lang === "en" ? "For professionals" : "对个体"}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {lang === "en" ? "AI-Builders course" : "AI-Builders 课程"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    {lang === "en"
                      ? "A rigorous program to bring every student up to the AI fluency of a strong Anthropic engineer. 3,000+ paying students, over half from top Silicon Valley companies."
                      : "让每位学员达到 Anthropic 优秀员工级别的 AI 使用水平。3000+ 付费学员，半数以上来自硅谷一线大厂。"}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 font-mono text-xs font-medium text-amber-300 transition group-hover:text-amber-200">
                    ai-builders.com <ArrowRight className="h-3 w-3" />
                  </div>
                </a>
                <a
                  href="https://corp-training.ai-builders.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-amber-300/40 hover:bg-white/10"
                >
                  <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-amber-300">
                    <Building2 className="h-4 w-4" />
                    {lang === "en" ? "For organizations" : "对组织"}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {lang === "en" ? "Context Architecture" : "Context Architecture 方法论"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    {lang === "en" ? (
                      <>
                        A methodology for real AI transformation and productivity gains. Engaged by{" "}
                        <span className="text-white">Tencent, DoorDash, Pinterest, 1Password, Amazon</span>{" "}
                        and more.
                      </>
                    ) : (
                      <>
                        推动企业 AI 转型与生产力落地。已服务{" "}
                        <span className="text-white">腾讯、DoorDash、Pinterest、1Password、亚马逊</span>{" "}
                        等。
                      </>
                    )}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 font-mono text-xs font-medium text-amber-300 transition group-hover:text-amber-200">
                    {lang === "en" ? "Enterprise inquiry" : "企业合作"} <ArrowRight className="h-3 w-3" />
                  </div>
                </a>
              </div>

              <div className="flex flex-wrap gap-2">
                <a href="https://www.amazon.com/Growth-Data-Analytics-Playbook-Product-Market/dp/1544549822" target="_blank" rel="noopener noreferrer">
                  <Badge variant="secondary" className="cursor-pointer bg-white/5 px-3 py-1.5 font-mono text-[11px] font-normal text-zinc-200 transition hover:bg-white/10">
                    <BookOpen className="mr-2 h-3.5 w-3.5" />
                    {lang === "en"
                      ? "WSJ 2025 CIO Must-Read · Grow Data Analytics Playbook"
                      : "WSJ 2025 CIO 必读 ·《Grow Data Analytics Playbook》"}
                  </Badge>
                </a>
                <Link href="/guests">
                  <Badge variant="secondary" className="cursor-pointer bg-white/5 px-3 py-1.5 font-mono text-[11px] font-normal text-zinc-200 transition hover:bg-white/10">
                    <MessageSquare className="mr-2 h-3.5 w-3.5" />
                    {lang === "en"
                      ? "100+ in-depth conversations with top tech execs & AI researchers"
                      : "100+ 中美科技高管与 AI 研究员深度对话"}
                  </Badge>
                </Link>
                <Badge variant="secondary" className="bg-white/5 px-3 py-1.5 font-mono text-[11px] font-normal text-zinc-200">
                  <Users className="mr-2 h-3.5 w-3.5" />
                  {lang === "en"
                    ? "300K+ followers · YouTube · Xiaohongshu · LinkedIn"
                    : "30万+ 高质量粉丝 · YouTube · 小红书 · 领英"}
                </Badge>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" variant="outline" className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10" onClick={() => scrollToSection("course")}>
                  {lang === "en" ? "Course" : "查看课程"}
                </Button>
                <Button size="lg" variant="outline" className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10" onClick={() => scrollToSection("enterprise")}>
                  {lang === "en" ? "Enterprise" : "企业合作"}
                </Button>
                <Button size="lg" variant="outline" className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10" asChild>
                  <a href="https://www.superlinear.academy" target="_blank" rel="noopener noreferrer">
                    {lang === "en" ? "Community" : "加入社区"}
                  </a>
                </Button>
              </div>

              <div className="flex gap-4 pt-1">
                <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer" className="text-zinc-400 transition hover:text-amber-300">
                  <Youtube className="h-6 w-6" />
                </a>
                <a href="https://space.bilibili.com/491306902" target="_blank" rel="noopener noreferrer" className="text-zinc-400 transition hover:text-amber-300" aria-label="Bilibili">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/yuzhengsun/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 transition hover:text-amber-300">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="https://yuzheng.substack.com/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 transition hover:text-amber-300" aria-label="Substack">
                  <Rss className="h-6 w-6" />
                </a>
                <a href="mailto:yz@superlinear.academy" className="text-zinc-400 transition hover:text-amber-300">
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>

            <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer" className="group relative block">
              <div className="absolute inset-0 rounded-3xl border border-amber-300/30 bg-gradient-to-br from-amber-300/10 via-white/5 to-sky-300/10 blur-sm" />
              <img
                src="/profile.jpg"
                alt="Yuzheng Sun — AI educator, founder of Superlinear Academy"
                className="relative w-full rounded-3xl border border-white/10 object-cover shadow-2xl transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02]"
                width={1446}
                height={1445}
                fetchPriority="high"
              />
            </a>
          </div>

          {/* App download — part of hero */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-amber-300/[0.04] p-5 md:mt-12 md:p-6">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0B0F1A] text-amber-300 shadow-xl shadow-amber-500/10">
                <Smartphone className="h-7 w-7" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="mb-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-amber-300/15 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-amber-300">
                    {lang === "en" ? "Now on mobile" : "移动端上线"}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500">iOS · Android</span>
                </div>
                <h3 className="text-lg font-semibold text-white md:text-xl">
                  {lang === "en" ? "Superlinear Academy — in your pocket." : "把 Superlinear Academy 装进口袋"}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {lang === "en"
                    ? "Daily discussions with 3,000+ builders, course bites, and curated AI resources — on the go."
                    : "3000+ Builder 每日讨论、课程速览、AI 资源整理，随时带在身边。"}
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
                <Button variant="outline" className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10" asChild>
                  <a
                    href="https://apps.apple.com/us/app/superlinear-academy/id6760123187"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Apple className="mr-2 h-4 w-4" />
                    App Store
                  </a>
                </Button>
                <Button variant="outline" className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10" asChild>
                  <a
                    href="https://play.google.com/store/apps/details?id=academy.superlinear.www"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="mr-2 h-4 w-4 fill-current" />
                    Google Play
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="container py-6 md:py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats[lang].map((item) => (
              <Card key={item.label} className="border-white/10 bg-white/5 backdrop-blur">
                <CardContent className="py-6 text-center">
                  <div className="text-3xl font-bold text-amber-300">{item.value}</div>
                  <p className="mt-2 text-sm text-zinc-300">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="background" className="border-y border-white/10 bg-black/20 py-14 md:py-20">
          <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="space-y-6 py-8">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-amber-300" />
                  <h3 className="text-xl font-semibold text-white">Education</h3>
                </div>
                <div className="text-zinc-300">
                  <p className="font-semibold text-white">
                    {lang === "en" ? "Cornell University" : "康奈尔大学 (Cornell University)"}
                  </p>
                  <p>{lang === "en" ? "PhD in Economics" : "经济学博士 (PhD in Economics)"}</p>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <MessageSquare className="h-6 w-6 text-amber-300" />
                  <h3 className="text-xl font-semibold text-white">Content & Community</h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {lang === "en"
                    ? "Since 2020 I've run 课代表立正 — publishing AI explainers and guest interviews on YouTube, Bilibili, and Xiaohongshu. 200+ on-record conversations with top Chinese and American tech executives and AI researchers. Several essays crossed a million views. 300K+ high-signal followers across platforms."
                    : "从 2020 年创立「课代表立正」，在 YouTube、B站、小红书上进行 AI 科普与嘉宾访谈，累计对话 200+ 位中美科技高管与顶级 AI 研究员，数篇文章转载量超百万，全网 30 万高质量粉丝。"}
                </p>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {lang === "en"
                    ? 'In 2023, my essay "The Five Most Important Questions About ChatGPT" became one of the most influential AI explainers in Chinese-language internet. Many of its calls have since been borne out.'
                    : "2023 年发表《关于ChatGPT最重要的五个问题》，成为中文互联网极具影响力的 AI 科普文章之一，多项判断已被验证。"}
                </p>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {lang === "en"
                    ? "My book Grow Data Analytics Playbook was featured by The Wall Street Journal on its 2025 CIO must-read list."
                    : "所著《Grow Data Analytics Playbook》获《华尔街日报》推荐，入选 2025 年 CIO 必读书单。"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardContent className="py-8">
                <div className="mb-6 flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-amber-300" />
                  <h3 className="text-xl font-semibold text-white">Career Highlights</h3>
                </div>
                <div className="space-y-5">
                  {career[lang].map((item) => (
                    <div key={item.company} className="flex gap-4">
                      <div className="relative mt-2 h-3 w-3 shrink-0 rounded-full bg-amber-300">
                        <span className="absolute left-1/2 top-3 h-10 w-px -translate-x-1/2 bg-white/15" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.company}</p>
                        <p className="text-sm text-zinc-300">{item.role}</p>
                        {item.note && (
                          <p className="mt-0.5 text-xs text-amber-400">{item.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="endorsements" className="container py-14 md:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              {lang === "en" ? "What industry leaders say" : "业界领袖怎么说"}
            </h2>
            <p className="mt-3 text-zinc-400">
              {lang === "en"
                ? "From investors and tech leaders who know the work"
                : "来自投资人与科技领袖的评价"}
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {endorsements[lang].map((item) => (
              <Card key={item.name} className="relative flex h-full flex-col overflow-hidden border-white/10 bg-white/5 transition-colors hover:border-amber-300/40">
                <div className="pointer-events-none absolute left-5 top-3 select-none font-serif text-7xl leading-none text-amber-300/10">"</div>
                <CardContent className="flex h-full flex-col pt-10 pb-6">
                  <p className="relative z-10 mb-6 flex-grow text-base leading-relaxed text-zinc-200">
                    "{item.quote}"
                  </p>
                  <div className="mt-auto flex items-start gap-3 border-t border-white/10 pt-4">
                    <Avatar className="mt-0.5 h-10 w-10 shrink-0 border border-white/20">
                      <AvatarImage src={item.avatar} alt={item.name} />
                      <AvatarFallback className="bg-amber-400/20 text-xs font-bold text-amber-300">{item.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="mt-0.5 text-sm text-amber-300">{item.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{item.subtitle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="enterprise" className="border-y border-white/10 bg-black/20 py-14 md:py-20">
          <div className="container">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white md:text-5xl">
                {lang === "en"
                  ? "Enterprise Training & AI Strategy Advisory"
                  : "企业培训 & AI 策略顾问"}
              </h2>
              <p className="mt-3 max-w-2xl text-zinc-300">
                {lang === "en"
                  ? "Word of mouth from Silicon Valley employees in my cohorts has led multiple top tech companies to bring me in for custom AI training and strategy advisory."
                  : "因个人课程在硅谷大厂员工中的口碑效应，已受多家头部科技大厂主动邀请，提供定制化 AI 能力培训与策略顾问服务。"}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-white/10 bg-white/5">
                <CardContent className="space-y-4 py-8">
                  <Building2 className="h-8 w-8 text-amber-300" />
                  <h3 className="text-xl font-semibold text-white">
                    {lang === "en" ? "More than a one-off training" : "不只是一次培训"}
                  </h3>
                  <p className="leading-relaxed text-zinc-300">
                    {lang === "en"
                      ? "After the training, your team joins the Superlinear Academy community — 3,000+ practitioners trading notes and updating each other's mental models. Training becomes ongoing capability, not a one-time event."
                      : "培训结束后，员工可加入 Superlinear Academy 社群，与 3000+ 位 AI 实践者持续交流、持续更新认知——不是培训一次就完，而是长期赋能。"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5">
                <CardContent className="space-y-4 py-8">
                  <Award className="h-8 w-8 text-amber-300" />
                  <h3 className="text-xl font-semibold text-white">
                    {lang === "en"
                      ? "AI taught by someone who actually gets it"
                      : "真正懂 AI 的人讲 AI"}
                  </h3>
                  <p className="leading-relaxed text-zinc-300">
                    {lang === "en"
                      ? "Real operator experience from Amazon, Meta, and Tencent IEG. A non-consensus early call on Statsig, now validated by its OpenAI acquisition. Firsthand insight from 200+ conversations with leading AI researchers and tech executives. That combination is hard to replicate."
                      : "大厂实战（Amazon / Meta / 腾讯 IEG）+ 亲历 Statsig 被 OpenAI 收购的非共识判断 + 对话 200+ 位顶级 AI 研究员与科技高管的一手洞察，构建无法复制的认知深度。"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6 md:p-8">
              <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-white">
                    {lang === "en" ? "Interested in working together?" : "有合作意向？"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {lang === "en"
                      ? "If you'd like to bring your team a deep, lasting AI training experience, let's talk."
                      : "如果你希望为团队带来一次有深度、有后续的 AI 培训，欢迎联系。"}
                  </p>
                </div>
                <Button asChild className="shrink-0 bg-amber-500 text-[#211300] hover:bg-amber-400">
                  <a href="https://corp-training.ai-builders.com" target="_blank" rel="noopener noreferrer">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    {lang === "en" ? "Learn more about enterprise training" : "了解企业培训"}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="course" className="container py-14 md:py-20">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-5xl">AI-Builders.com</h2>
              <p className="mt-3 text-zinc-300">
                {lang === "en"
                  ? "Learn AI-native thinking and engineering through hands-on projects — and actually ship with AI."
                  : "通过实战，学会 AI 原生的思维方式和工程方法论，真正驾驭 AI"}
              </p>
            </div>
            <Button asChild variant="outline" className="border-amber-300/40 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20">
              <a href="https://ai-builders.com" target="_blank" rel="noopener noreferrer">
                {lang === "en" ? "View full curriculum" : "查看完整课程"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {highlights[lang].map((item) => (
              <Card key={item.title} className="border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur">
                <CardContent className="flex gap-4 py-6">
                  <div className="mt-0.5">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-300">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="testimonials" className="container py-14 md:py-20">
          <h2 className="mb-10 text-center text-3xl font-bold text-white md:text-5xl">
            {lang === "en" ? "Student voices" : "学员评价"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {testimonials[lang].map((item) => (
              <Card key={item.name} className="border-white/10 bg-white/5">
                <CardContent className="flex flex-col py-6">
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-300 text-amber-300" />
                    ))}
                  </div>
                  <p className="flex-grow text-sm leading-relaxed text-zinc-200">"{item.quote}"</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                    <Avatar className="h-10 w-10 shrink-0 border border-white/20">
                      <AvatarImage src={item.avatar} alt={item.name} />
                      <AvatarFallback className="bg-amber-400/20 text-xs font-bold text-amber-300">{item.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-xs text-zinc-400">{item.role} · <span className="text-amber-400/80">{item.company}</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-zinc-400">
            {lang === "en" ? (
              <>
                All reviews are from{" "}
                <a href="https://maven.com/superlinear/aibuilders#reviews" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition hover:text-amber-300">
                  Maven
                </a>
                {" "}— public, verified, and traceable.
              </>
            ) : (
              <>
                所有评价来自{" "}
                <a href="https://maven.com/superlinear/aibuilders#reviews" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition hover:text-amber-300">
                  Maven 平台
                </a>
                ，公开、实名、可追溯
              </>
            )}
          </p>
        </section>

        <section id="guests" className="border-y border-white/10 bg-black/20 py-14 md:py-20">
          <div className="container">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-bold text-white md:text-5xl">
                  {lang === "en"
                    ? "Super nodes · conversations at the top"
                    : "超级节点 · 对话顶层"}
                </h2>
                <p className="mt-3 max-w-2xl text-zinc-300">
                  {lang === "en"
                    ? "One of the few Chinese-language forums built on peer-level access to the core of Silicon Valley."
                    : "凭借对等的专业身位，构建中文世界少有的与硅谷核心圈层深度对话的场域"}
                </p>
              </div>
              <Button asChild variant="outline" className="shrink-0 border-amber-300/40 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20">
                <Link href="/guests">
                  {lang === "en" ? "See all 128 guests" : "查看全部 128 位嘉宾"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {guests[lang].map((guest) => (
                <a
                  key={guest.id}
                  href={guest.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:bg-white/10"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${guest.id}/mqdefault.jpg`}
                      alt={`${guest.name} — ${guest.title}, ${guest.company}`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition duration-300 group-hover:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/90 text-[#211300]">
                        <Play className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold leading-tight text-white">{guest.name}</p>
                    <p className="mt-1 text-xs font-medium leading-tight text-amber-300">{guest.company}</p>
                    <p className="mt-0.5 text-xs leading-tight text-zinc-400">{guest.title}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="playlists" className="container py-14 md:py-20">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-5xl">
                {lang === "en" ? "Explore by topic" : "按话题探索"}
              </h2>
              <p className="mt-3 text-zinc-300">
                {lang === "en"
                  ? "700+ videos, organized by theme — jump straight to what you care about."
                  : "700+ 期内容，按主题分类，直达你关心的方向"}
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0 border-amber-300/40 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20">
              <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer">
                <Youtube className="mr-2 h-4 w-4" />
                {lang === "en" ? "All videos" : "全部视频"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {playlists[lang].map((pl) => (
              <a
                key={pl.id}
                href={`https://www.youtube.com/playlist?list=${pl.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-amber-300/40 hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className={pl.color}>{pl.icon}</div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                    {lang === "en" ? `${pl.count} eps` : `${pl.count} 期`}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{pl.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{pl.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-300/50 transition group-hover:text-amber-300">
                  {lang === "en" ? "Watch on YouTube" : "在 YouTube 观看"} <ArrowRight className="h-3 w-3" />
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="container py-8 pb-16 md:pb-24">
          <div className="overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-r from-[#332100] via-[#5A3A00] to-[#8E5C00] p-8 md:p-10">
            <div className="mb-6 text-center md:mb-8">
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                {lang === "en"
                  ? "Join the Superlinear Academy community"
                  : "加入 Superlinear Academy 社区"}
              </h2>
              <p className="mt-2 text-amber-100">
                {lang === "en"
                  ? "Grow alongside AI-era builders and lifelong learners."
                  : "与 AI 时代的 Builder 和终身学习者一起成长"}
              </p>
            </div>
            <div ref={communityRef} className="overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl" style={{ minHeight: "560px" }}>
              {communityVisible ? (
                <iframe
                  style={{ border: 0, boxShadow: "none", width: "100%", height: "72vh", minHeight: "560px" }}
                  src="https://www.superlinear.academy/c/ai-resources?iframe=true"
                  title="Superlinear Academy Community"
                />
              ) : (
                <div className="flex items-center justify-center" style={{ height: "72vh", minHeight: "560px" }}>
                  <p className="text-sm text-zinc-400">
                    {lang === "en" ? "Community loading…" : "社区加载中…"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/30 py-12">
        <div className="container grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-white">
              {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
            </h3>
            <p className="mt-3 text-sm text-zinc-400">
              {lang === "en"
                ? "Helping more people become effective builders in the AI era."
                : "帮助更多人在 AI 时代成为高效的 Builder。"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white">{lang === "en" ? "Links" : "链接"}</h3>
            <div className="mt-3 space-y-2 text-sm text-zinc-400">
              <a href="https://ai-builders.com" target="_blank" rel="noopener noreferrer" className="block transition hover:text-amber-300">
                {lang === "en" ? "AI Builders course" : "AI Builders 课程"}
              </a>
              <a href="https://www.superlinear.academy" target="_blank" rel="noopener noreferrer" className="block transition hover:text-amber-300">Superlinear Academy</a>
              <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer" className="block transition hover:text-amber-300">
                {lang === "en" ? "YouTube channel" : "YouTube 频道"}
              </a>
              <a href="https://space.bilibili.com/491306902" target="_blank" rel="noopener noreferrer" className="block transition hover:text-amber-300">
                {lang === "en" ? "Bilibili channel" : "B站频道"}
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white">{lang === "en" ? "Contact" : "联系方式"}</h3>
            <p className="mt-3 text-sm text-zinc-400">yz@superlinear.academy</p>
            <div className="mt-4 flex gap-4">
              <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer" className="text-zinc-400 transition hover:text-amber-300"><Youtube className="h-5 w-5" /></a>
              <a href="https://www.linkedin.com/in/yuzhengsun/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 transition hover:text-amber-300"><Linkedin className="h-5 w-5" /></a>
              <a href="mailto:yz@superlinear.academy" className="text-zinc-400 transition hover:text-amber-300"><Mail className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        <div className="container mt-8 border-t border-white/10 pt-6 text-center text-xs text-zinc-500">© 2025 Yuzheng Sun. All rights reserved.</div>
      </footer>
    </div>
  );
}
