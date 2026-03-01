import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
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
} from "lucide-react";

const stats = [
  { value: "300K+", label: "全网订阅者" },
  { value: "3000+", label: "付费学员" },
  { value: "4.9/5", label: "课程评分" },
  { value: "数百期", label: "嘉宾访谈" },
];

const highlights = [
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
];

const career = [
  { company: "Statsig (Acquired by OpenAI)", role: "Evangelist - 布道师", note: "2025年以 $11 亿估值被 OpenAI 收购，验证非共识眼光" },
  { company: "腾讯 (Tencent)", role: "数据科学总监 (Director of Data Science)", note: "双五星绩效 · 管理 30 人数据与AI团队" },
  { company: "Meta (Facebook)", role: "数据科学家 (Data Scientist)", note: "" },
  { company: "Amazon", role: "经济学家 (Economist)", note: "" },
];

const guests = [
  {
    id: "7ej2r7XysKc",
    name: "毕书超 Shuchao Bi",
    title: "Head of Post-Training · Multimodal",
    company: "OpenAI",
    videoUrl: "https://www.youtube.com/watch?v=7ej2r7XysKc",
  },
  {
    id: "RRSMjC_BF8Y",
    name: "Ethan Evans",
    title: "前副总裁 (Former VP)",
    company: "Amazon",
    videoUrl: "https://www.youtube.com/watch?v=RRSMjC_BF8Y",
  },
  {
    id: "GIv0I-34aaI",
    name: "Reynold Xin",
    title: "联合创始人 (Co-founder)",
    company: "Databricks",
    videoUrl: "https://www.youtube.com/watch?v=GIv0I-34aaI",
  },
  {
    id: "dymM40bVIhQ",
    name: "田渊栋 Yuandong Tian",
    title: "Research Scientist",
    company: "Meta AI (FAIR)",
    videoUrl: "https://www.youtube.com/watch?v=dymM40bVIhQ",
  },
  {
    id: "awaZBWTss-4",
    name: "Howie Xu (硅谷徐老师)",
    title: "首席 AI 官 (Chief AI Officer)",
    company: "Gen Digital",
    videoUrl: "https://www.youtube.com/watch?v=awaZBWTss-4",
  },
  {
    id: "iw2QYZeVlOQ",
    name: "Vijaye Raji (VJ)",
    title: "创始人 & CEO",
    company: "Statsig · OpenAI 收购",
    videoUrl: "https://www.youtube.com/watch?v=iw2QYZeVlOQ",
  },
  {
    id: "CTcMvIZFQcw",
    name: "Leon",
    title: "匿名硅谷高管",
    company: "Silicon Valley",
    videoUrl: "https://www.youtube.com/watch?v=CTcMvIZFQcw",
  },
  {
    id: "BnL5qaBzmR0",
    name: "Ryo Lu",
    title: "Head of Design",
    company: "Cursor",
    videoUrl: "https://www.youtube.com/watch?v=BnL5qaBzmR0",
  },
  {
    id: "3t2I_BMG9gU",
    name: "戴雨森",
    title: "合伙人 (Partner)",
    company: "真格基金 (Zhenfund)",
    videoUrl: "https://www.youtube.com/watch?v=3t2I_BMG9gU",
  },
  {
    id: "UndcL0uEmYs",
    name: "俞舟 Zhou Yu",
    title: "AI 教授 (Professor)",
    company: "Columbia University",
    videoUrl: "https://www.youtube.com/watch?v=UndcL0uEmYs",
  },
];

const testimonials = [
  {
    quote:
      "尽管我日常工作就在使用AI工具，但我发现自己依然能学到新的、更深层次的东西，并且能够更有效地利用AI来构建解决方案。",
    name: "Clairy Cheung",
    role: "UX Manager, Google",
  },
  {
    quote: "这门课真的能教会你正确的思维方式，并且给你更有效自学的能力。",
    name: "Shuyang",
    role: "Senior Applied Science Manager, Uber",
  },
  {
    quote: "思考如何用AI解决问题，已经成为了我的一个习惯。我在日常生活中亲身感受到了AI的好处。",
    name: "Tingting Wang",
    role: "Applied Scientist, Microsoft",
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

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
              <div className="text-lg font-semibold tracking-wide text-amber-300">课代表立正</div>
              <div className="text-xs text-zinc-400">Yuzheng Sun</div>
            </button>

            <div className="hidden items-center gap-6 lg:flex">
              <button onClick={() => scrollToSection("about")} className="text-sm text-zinc-300 transition hover:text-amber-300">About</button>
              <button onClick={() => scrollToSection("course")} className="text-sm text-zinc-300 transition hover:text-amber-300">AI Builders</button>
              <button onClick={() => scrollToSection("background")} className="text-sm text-zinc-300 transition hover:text-amber-300">Background</button>
              <button onClick={() => scrollToSection("guests")} className="text-sm text-zinc-300 transition hover:text-amber-300">Guests</button>
              <button onClick={() => scrollToSection("testimonials")} className="text-sm text-zinc-300 transition hover:text-amber-300">Testimonials</button>
              <Button asChild className="bg-amber-500 text-[#211300] hover:bg-amber-400">
                <a href="https://www.superlinear.academy/feed" target="_blank" rel="noopener noreferrer">
                  <Users className="mr-2 h-4 w-4" />
                  Join Community
                </a>
              </Button>
            </div>

            <button
              className="rounded-md p-1 text-zinc-300 transition hover:text-amber-300 lg:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4 lg:hidden">
              <button onClick={() => scrollToSection("about")} className="block text-zinc-300 transition hover:text-amber-300">About</button>
              <button onClick={() => scrollToSection("course")} className="block text-zinc-300 transition hover:text-amber-300">AI Builders</button>
              <button onClick={() => scrollToSection("background")} className="block text-zinc-300 transition hover:text-amber-300">Background</button>
              <button onClick={() => scrollToSection("guests")} className="block text-zinc-300 transition hover:text-amber-300">Guests</button>
              <button onClick={() => scrollToSection("testimonials")} className="block text-zinc-300 transition hover:text-amber-300">Testimonials</button>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10">
        <section id="hero" className="container py-14 md:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <Badge className="border border-amber-300/40 bg-amber-300/10 text-amber-200 hover:bg-amber-300/20">
                通关职场的博士，带你超线性增长
              </Badge>

              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
                在 AI 浪潮里，
                <span className="block bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300 bg-clip-text text-transparent">
                  主宰自己的人生增量
                </span>
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
                Superlinear Academy 创始人。前 Statsig 布道师（OpenAI 收购）、腾讯数据科学副总监、Meta 数据科学家、亚马逊经济学家；康奈尔经济学博士。
              </p>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-white/10 px-4 py-1.5 text-zinc-100">
                  <Users className="mr-2 h-4 w-4" />30万+ 全网订阅
                </Badge>
                <Badge variant="secondary" className="bg-white/10 px-4 py-1.5 text-zinc-100">
                  <Star className="mr-2 h-4 w-4" />Maven Top AI Instructor
                </Badge>
                <Badge variant="secondary" className="bg-white/10 px-4 py-1.5 text-zinc-100">
                  <TrendingUp className="mr-2 h-4 w-4" />3000+ 学员
                </Badge>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="bg-amber-500 text-[#211300] hover:bg-amber-400" onClick={() => scrollToSection("course")}>
                  查看课程
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => scrollToSection("about")}>
                  了解更多
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
                <a href="mailto:yz@superlinear.academy" className="text-zinc-400 transition hover:text-amber-300">
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>

            <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer" className="group relative block">
              <div className="absolute inset-0 rounded-3xl border border-amber-300/30 bg-gradient-to-br from-amber-300/10 via-white/5 to-sky-300/10 blur-sm" />
              <img
                src="/profile.jpg"
                alt="Yuzheng Sun"
                className="relative w-full rounded-3xl border border-white/10 object-cover shadow-2xl transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </a>
          </div>
        </section>

        <section id="about" className="container py-6 md:py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <Card key={item.label} className="border-white/10 bg-white/5 backdrop-blur">
                <CardContent className="py-6 text-center">
                  <div className="text-3xl font-bold text-amber-300">{item.value}</div>
                  <p className="mt-2 text-sm text-zinc-300">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="course" className="container py-14 md:py-20">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-5xl">AI-Builders.com</h2>
              <p className="mt-3 text-zinc-300">通过实战，学会 AI 原生的思维方式和工程方法论，真正驾驭 AI</p>
            </div>
            <Button asChild variant="outline" className="border-amber-300/40 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20">
              <a href="https://ai-builders.com" target="_blank" rel="noopener noreferrer">
                查看完整课程
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {highlights.map((item) => (
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

        <section id="background" className="border-y border-white/10 bg-black/20 py-14 md:py-20">
          <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="space-y-6 py-8">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-amber-300" />
                  <h3 className="text-xl font-semibold text-white">Education</h3>
                </div>
                <div className="text-zinc-300">
                  <p className="font-semibold text-white">康奈尔大学 (Cornell University)</p>
                  <p>经济学博士 (PhD in Economics)</p>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <MessageSquare className="h-6 w-6 text-amber-300" />
                  <h3 className="text-xl font-semibold text-white">Content & Community</h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">
                  从 2020 年创立频道「课代表立正」，进行 AI 科普和嘉宾访谈，推动 AI 认知进步，全网 30 万订阅。
                </p>
                <p className="text-sm leading-relaxed text-zinc-300">
                  2023 年发表《关于ChatGPT最重要的五个问题》，成为中文互联网极具影响力的 AI 科普文章之一，多项判断已被验证。
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
                  {career.map((item) => (
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

        <section id="testimonials" className="container py-14 md:py-20">
          <h2 className="mb-10 text-center text-3xl font-bold text-white md:text-5xl">学员评价</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.name} className="border-white/10 bg-white/5">
                <CardContent className="py-6">
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-300 text-amber-300" />
                    ))}
                  </div>
                  <p className="min-h-[6rem] text-sm leading-relaxed text-zinc-200">“{item.quote}”</p>
                  <p className="mt-4 font-medium text-white">{item.name}</p>
                  <p className="text-xs text-zinc-400">{item.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-zinc-400">
            所有评价来自{" "}
            <a href="https://maven.com/superlinear/aibuilders#reviews" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition hover:text-amber-300">
              Maven 平台
            </a>
            ，公开、实名、可追溯
          </p>
        </section>

        <section id="guests" className="border-y border-white/10 bg-black/20 py-14 md:py-20">
          <div className="container">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-bold text-white md:text-5xl">超级节点 · 对话顶层</h2>
                <p className="mt-3 max-w-2xl text-zinc-300">
                  凭借对等的专业身位，构建中文世界少有的与硅谷核心圈层深度对话的场域
                </p>
              </div>
              <Button asChild variant="outline" className="shrink-0 border-amber-300/40 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20">
                <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-4 w-4" />
                  全部访谈
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {guests.map((guest) => (
                <a
                  key={guest.id}
                  href={guest.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:bg-white/10"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${guest.id}/maxresdefault.jpg`}
                      alt={guest.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${guest.id}/hqdefault.jpg`;
                      }}
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

        <section className="container py-8 pb-16 md:pb-24">
          <div className="overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-r from-[#332100] via-[#5A3A00] to-[#8E5C00] p-8 md:p-10">
            <div className="mb-6 text-center md:mb-8">
              <h2 className="text-3xl font-bold text-white md:text-4xl">加入 Superlinear Academy 社区</h2>
              <p className="mt-2 text-amber-100">与 AI 时代的 Builder 和终身学习者一起成长</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
              <iframe
                style={{ border: 0, boxShadow: "none", width: "100%", height: "72vh", minHeight: "560px" }}
                src="https://www.superlinear.academy/c/ai-resources?iframe=true"
                title="Superlinear Academy Community"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/30 py-12">
        <div className="container grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-white">课代表立正</h3>
            <p className="mt-3 text-sm text-zinc-400">帮助更多人在 AI 时代成为高效的 Builder。</p>
          </div>
          <div>
            <h3 className="font-semibold text-white">链接</h3>
            <div className="mt-3 space-y-2 text-sm text-zinc-400">
              <a href="https://ai-builders.com" target="_blank" rel="noopener noreferrer" className="block transition hover:text-amber-300">AI Builders 课程</a>
              <a href="https://www.superlinear.academy" target="_blank" rel="noopener noreferrer" className="block transition hover:text-amber-300">Superlinear Academy</a>
              <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer" className="block transition hover:text-amber-300">YouTube 频道</a>
              <a href="https://space.bilibili.com/491306902" target="_blank" rel="noopener noreferrer" className="block transition hover:text-amber-300">B站频道</a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white">联系方式</h3>
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
