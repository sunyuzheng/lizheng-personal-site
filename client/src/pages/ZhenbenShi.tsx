import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Users,
  BookOpen,
  ArrowLeft,
  Menu,
  X,
  Send,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ───────────────────────────────────────────────
interface Module {
  num: string;
  title: string;
  count: string;
  lessons: string[];
}

interface Endorser {
  quote: string;
  name: string;
  title: string;
}

// ─── Data ────────────────────────────────────────────────
const MODULES: Module[] = [
  {
    num: "一",
    title: "认知觉醒",
    count: "6 课",
    lessons: [
      '你从"好学生 → 好工作 → 赚大钱"的梦中醒来了吗？',
      '信息爆炸时代，如何筛选"高价值"信息？',
      "警惕客体思维：努力没回报，是这个世界的错吗？",
      "警惕固定思维：你的人生本该如此吗？",
      "警惕打分思维：事业/择偶/情感，人生可以被量化吗？",
      '改变错误思维，筑牢认知地基，走向"财务自由"',
    ],
  },
  {
    num: "二",
    title: "思维变革",
    count: "4 课",
    lessons: [
      '"财富自由"是可行的，前提是正确认识它',
      '破解财富自由迷思：三个常见的"破财陷阱"',
      "获得财富自由的底层逻辑",
      '打工人如何利用"个人价值"，最大化自己赢面的具体路径',
    ],
  },
  {
    num: "三",
    title: "行动升级 · 工作篇",
    count: "7 课",
    lessons: [
      "强者成事终极秘诀：道天地将法",
      "只有10%的工作是有意义的，工作如何抓主线？",
      "如何在工作中改变3种错误思维惯性？",
      "了解市场：公司/老板/市场，分别要什么样的人？",
      '打造产品：如何积累"手艺"，打造黄金简历？',
      "利用杠杆1：工作内外如何将个人能力变成人力资本？",
      "利用杠杆2：如何积累通向财富自由的第一桶金？",
    ],
  },
  {
    num: "四",
    title: "行动升级 · 副业篇",
    count: "4 课",
    lessons: [
      "来自康奈尔金融博士的科普：为何韭菜总是你？",
      '搞钱第一步：放下"暴富"心态，打造赚钱技能',
      '三步走，有效提升"赚钱行动力"',
      "课程总结：找到你的长坡厚雪",
    ],
  },
];

const ENDORSEMENTS: Endorser[] = [
  {
    quote:
      "煜征是我见到最身体力行学习 AI、应用 AI、普及 AI 的超级个体之一。他不仅对AI有深度理解，更能把这种理解转化成判断、行动和持续的结果；他不仅自己坚持终身学习的理念，还一直通过自媒体，社群等方式去帮助千千万万的普通人。作为「群友」，经常看到他在社群里耐心回答一些素味平生朋友的小白问题，分享自己的最佳实践经验，非常让我感动。无论你是刚开始自己职业生涯的年轻人，还是希望在职业上有新突破的经验人士，这本书都能给你带来一些启发。AI 可能是人类历史上最重要的技术革命，它带给了普通人超乎寻常的能力，也会对世界带来非常重大的变革。普通人如何抓住机会，同时又避免焦虑？煜征的这本书给出了他对这个问题的思考。所以，这本书非常值得一读。",
    name: "戴雨森",
    title: "真格基金",
  },
  {
    quote:
      "在AI时代，知识与技术正在重塑个人价值的生成方式。决定一个人长期回报的，往往不是机会本身，而是能否形成可以持续放大的能力结构。孙博士结合自己在顶级科技公司的实践经验，在本书中讨论的不只是如何赚钱，更是一个人在快速迭代的时代中如何构建长期竞争力。",
    name: "刘嘉",
    title: "清华大学心理与认知科学系主任",
  },
  {
    quote:
      "我在硅谷做了二十多年高管和投资人，见过很多聪明人，煜征是少数让我印象深刻的学习能力极强、又很愿意分享学习结果的那一类。他不只履历漂亮，而更重要的是，他既能想明白，又能做到。我们做过十多次深度对话，每次他都能抓到问题的重点，进行深度思考，挖掘到我身上真正有价值的经验；并在工作、创业、投资中，把这些经验融会贯通。所以，他既能做出紧跟时代的选择，又能长期耕耘，做出有护城河的结果，而这本书是他真金白银换、长期思考带来的认知，值得每个人认真读。",
    name: "硅谷徐老师",
    title: "斯坦福讲师",
  },
];

const FAQ = [
  {
    q: "这本书适合哪些人？",
    a: "适合想跳出职场内卷、打造副业现金流、或准备职业转型的知识型工作者。无论你处于职场初中期还是管理层，都能在书中找到可落地的策略。书的核心不是给你励志故事，而是给你一套可操作的分析框架。",
  },
  {
    q: "如何预约购书通知？",
    a: "书即将上架。前往 superlinear.academy/c/posts/book 在帖子下留言，上架后第一时间收到通知。",
  },
  {
    q: "副业会不会影响主业表现？",
    a: '书中强调"工作是资本，副业是实验室"。通过抓住 10% 高价值任务，你反而能在主业中更快成长，并将经验投射到副业变现。二者是相互促进的关系，而不是零和博弈。',
  },
  {
    q: "是否提供线下活动或一对一辅导？",
    a: "Superlinear 社群定期举办线下共创与远程冲刺营。如有合作或讲座需求，欢迎发邮件至 hello@superlinear.academy。",
  },
];

// ─── Accordion item ───────────────────────────────────────
function ModuleItem({ mod, defaultOpen = false }: { mod: Module; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-amber-400 font-bold text-lg w-4">{mod.num}</span>
          <span className="text-white font-semibold">{mod.title}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-zinc-500 text-sm">{mod.count}</span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </div>
      </button>
      {open && (
        <ul className="pb-4 px-6 space-y-1">
          {mod.lessons.map((lesson, i) => (
            <li key={i} className="flex gap-3 py-2 border-b border-white/[0.06] last:border-0">
              <span className="text-xs font-mono text-amber-400 pt-0.5 flex-shrink-0 w-6">
                {String(
                  mod.num === "一"
                    ? i + 1
                    : mod.num === "二"
                    ? i + 7
                    : mod.num === "三"
                    ? i + 11
                    : i + 18
                ).padStart(2, "0")}
              </span>
              <span className="text-zinc-300 text-sm leading-relaxed">{lesson}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── FAQ item ─────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-semibold pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <p className="px-6 pb-5 text-zinc-400 text-sm leading-relaxed">{a}</p>
      )}
    </div>
  );
}

// ─── Markdown renderer ───────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="text-amber-300 bg-white/10 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let listBuffer: React.ReactNode[] = [];

  const flushList = () => {
    if (listBuffer.length) {
      nodes.push(<ul key={`ul-${nodes.length}`} className="space-y-1 my-1">{listBuffer}</ul>);
      listBuffer = [];
    }
  };

  lines.forEach((line, i) => {
    if (line.startsWith("## ")) {
      flushList();
      nodes.push(<p key={i} className="text-white font-bold text-sm mt-3 mb-1">{renderInline(line.slice(3))}</p>);
    } else if (line.startsWith("### ")) {
      flushList();
      nodes.push(<p key={i} className="text-white font-semibold text-sm mt-2 mb-0.5">{renderInline(line.slice(4))}</p>);
    } else if (line.trim() === "---") {
      flushList();
      nodes.push(<hr key={i} className="border-white/10 my-2" />);
    } else if (/^[-*] /.test(line)) {
      listBuffer.push(
        <li key={i} className="flex gap-2 text-sm text-zinc-300 leading-relaxed">
          <span className="text-amber-400 flex-shrink-0 mt-0.5">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </li>
      );
    } else if (/^\d+\. /.test(line)) {
      const m = line.match(/^(\d+)\. (.*)/);
      if (m) listBuffer.push(
        <li key={i} className="flex gap-2 text-sm text-zinc-300 leading-relaxed">
          <span className="text-amber-400 font-mono text-xs flex-shrink-0 mt-0.5 w-4">{m[1]}.</span>
          <span>{renderInline(m[2])}</span>
        </li>
      );
    } else if (line.startsWith("> ")) {
      flushList();
      nodes.push(
        <blockquote key={i} className="border-l-2 border-amber-400/40 pl-3 text-zinc-400 text-sm italic my-1">
          {renderInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.trim() === "") {
      flushList();
      nodes.push(<div key={i} className="h-1.5" />);
    } else {
      flushList();
      nodes.push(<p key={i} className="text-sm text-zinc-300 leading-relaxed">{renderInline(line)}</p>);
    }
  });
  flushList();

  return <div className="space-y-0.5">{nodes}</div>;
}

// ─── AI Advisor Chat ──────────────────────────────────────
type ChatMessage = { role: "user" | "assistant"; content: string };

const ADVISOR_STARTERS = [
  "我做了三年但一直没晋升，问题出在哪？",
  "想做副业但不知道从哪里开始",
  "如何判断是否该跳槽换行业？",
  "怎么跟老板谈薪资才不吃亏？",
];

const SKILL_INSTALL_URL =
  "https://raw.githubusercontent.com/sunyuzheng/zhenbenshi-advisor/main/zhenbenshi-advisor.skill";

const EXAMPLE_QUESTION =
  '我在一家200人的互联网公司做产品经理，工作三年，去年和今年绩效都是B+，但两次晋升都被卡住了，上级说我\u201c影响力不足\u201d。我自认为项目交付没问题，但不太擅长向上汇报。我希望在年底前晋升，目前不考虑跳槽。';

function AdvisorSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const copyInstallLink = () => {
    navigator.clipboard.writeText(SKILL_INSTALL_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const prefillFromStarter = (starter: string) => {
    const hint = "（在这里补充你的背景，建议越具体回答越准：所在行业/职级、工作年限、具体情况、已经试过什么、最希望达到什么）";
    setInput(`${starter}\n\n${hint}`);
    setTimeout(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus();
      // Place cursor right after the question so user types context naturally
      textareaRef.current.setSelectionRange(starter.length + 2, starter.length + 2);
    }, 0);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { content: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "抱歉，出现了一点问题，请稍后再试。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <section id="advisor" className="py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <span className="w-6 h-px bg-amber-400 inline-block" />
            AI 顾问
            <span className="w-6 h-px bg-amber-400 inline-block" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
            和真本事 AI 顾问对话
          </h2>
          <p className="text-zinc-400 mt-3 text-sm text-center max-w-lg mx-auto">
            基于书中七大框架，帮你诊断思维陷阱、做对职业选择、给出可执行建议。
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="mb-5 space-y-3">
            {/* Starter prompts — prefill only, do not send */}
            <div className="grid sm:grid-cols-2 gap-2">
              {ADVISOR_STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => prefillFromStarter(s)}
                  className="text-left p-3.5 border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-amber-400/40 transition-all text-sm text-zinc-300 group"
                >
                  <span className="text-amber-400 mr-2 group-hover:text-amber-300">▸</span>
                  {s}
                </button>
              ))}
            </div>

            {/* Example question toggle */}
            <button
              onClick={() => setShowExample((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <span className={`transition-transform ${showExample ? "rotate-90" : ""}`}>▸</span>
              看看什么样的问题能得到最好的回答
            </button>

            {showExample && (
              <div className="border border-amber-400/15 bg-amber-500/[0.04] p-4 space-y-2">
                <p className="text-[10px] text-amber-400/70 uppercase tracking-widest">优秀提问示范</p>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  "{EXAMPLE_QUESTION}"
                </p>
                <p className="text-zinc-600 text-xs">
                  包含：职级背景 · 具体卡点 · 已知信息 · 明确目标 · 限制条件
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-white/10 bg-white/[0.03] mb-4 max-h-[52vh] overflow-y-auto p-4 space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-400 text-[10px] font-bold">真</span>
                  </div>
                )}
                <div
                  className={`max-w-[82%] ${
                    m.role === "user"
                      ? "bg-amber-500/15 border border-amber-400/20 text-amber-100 text-sm leading-relaxed px-3 py-2"
                      : ""
                  }`}
                >
                  {m.role === "user"
                    ? m.content
                    : <MarkdownMessage content={m.content} />}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 text-[10px] font-bold">真</span>
                </div>
                <div className="text-zinc-500 text-sm">正在思考...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说说你的情况：行业/职级/工作年限，遇到了什么问题，已经尝试过什么，希望达到什么目标——背景越具体，建议越准。"
            rows={3}
            className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-sm px-3 py-2.5 resize-none focus:outline-none focus:border-amber-400/50 transition-colors"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-black px-4 self-end disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-zinc-600 text-xs mt-1.5">按 Enter 发送 · Shift+Enter 换行</p>

        {/* Multi-tool install callout */}
        <div className="mt-3 border border-white/10 bg-white/[0.03] p-3">
          <div className="flex gap-3 items-stretch">
            {/* 2×2 badge grid */}
            <div className="grid grid-cols-2 gap-1.5 flex-1">
              {[
                ["Claude Desktop", "Cowork 模式一键安装"],
                ["Claude.ai", "粘贴到 Project Instructions"],
                ["ChatGPT", "创建 Custom GPT"],
                ["其他 AI 工具", "复制系统提示词"],
              ].map(([tool, desc]) => (
                <div key={tool} className="border border-white/[0.08] px-2.5 py-2">
                  <p className="text-xs text-zinc-300 font-medium leading-none">{tool}</p>
                  <p className="text-[10px] text-zinc-600 leading-tight mt-1">{desc}</p>
                </div>
              ))}
            </div>
            {/* Two stacked buttons */}
            <div className="flex flex-col gap-1.5 flex-shrink-0 justify-center">
              <button
                onClick={copyInstallLink}
                className="text-xs border border-amber-400/40 text-amber-400 hover:bg-amber-400/10 px-3 py-2 transition-colors whitespace-nowrap"
              >
                {copied ? "已复制 ✓" : "复制安装链接"}
              </button>
              <a
                href="https://github.com/sunyuzheng/zhenbenshi-advisor"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2 transition-colors text-center whitespace-nowrap"
              >
                查看完整教程 →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────
export default function ZhenbenShi() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white relative">
      {/* Gradient blur backgrounds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -left-32 w-[32rem] h-[32rem] bg-amber-500/[0.07] rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-sky-500/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[26rem] h-[26rem] bg-orange-500/[0.06] rounded-full blur-3xl" />
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#0B0F1A]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Back + brand */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-1 text-zinc-500 hover:text-amber-400 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">孙煜征</span>
              </Link>
              <span className="text-white/20">|</span>
              <span className="text-white font-semibold text-sm">《真本事：从会工作到会赚钱》</span>
            </div>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-6">
              {[
                ["核心框架", "framework"],
                ["AI 顾问", "advisor"],
                ["课程大纲", "outline"],
                ["封面推荐", "endorsements"],
                ["关于作者", "author"],
                ["加入社群", "community"],
              ].map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-zinc-400 hover:text-amber-400 transition-colors text-sm"
                >
                  {label}
                </button>
              ))}
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                asChild
              >
                <a href="https://www.superlinear.academy/c/posts/book" target="_blank" rel="noopener noreferrer">
                  预约购书
                </a>
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-zinc-400 hover:text-amber-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 space-y-3 border-t border-white/[0.08]">
              {[
                ["核心框架", "framework"],
                ["AI 顾问", "advisor"],
                ["课程大纲", "outline"],
                ["封面推荐", "endorsements"],
                ["关于作者", "author"],
                ["加入社群", "community"],
              ].map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="block text-zinc-400 hover:text-amber-400 transition-colors text-sm"
                >
                  {label}
                </button>
              ))}
              <a
                href="https://www.superlinear.academy/c/posts/book"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-amber-400 hover:text-amber-300 text-sm font-semibold"
              >
                预约购书 →
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Copy */}
          <div className="space-y-6 order-2 md:order-1">
            {/* B站 badge */}
            <div className="inline-flex items-center gap-2 bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded-sm">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.907-.373.336 0 .63.124.867.373L8.12 3.333h7.893l1.387-1.387c.253-.249.549-.373.867-.373.32 0 .613.124.867.373.249.249.373.551.373.907 0 .355-.124.657-.373.906z" />
              </svg>
              B站职场类长期第一
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight">
                《真本事：<br />
                从会工作<span className="text-amber-400">到会赚钱</span>》
              </h1>
              <p className="text-zinc-400 mt-3 text-lg">把自己变成稀缺资产，让个体价值持续变现</p>
              <div className="inline-block border border-white/10 text-zinc-500 text-xs px-2 py-1 mt-2">
                人民邮电出版社 · 孙煜征 著
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold" asChild>
                <a href="https://www.superlinear.academy/c/posts/book" target="_blank" rel="noopener noreferrer">
                  预约到货通知
                </a>
              </Button>
              <Button variant="outline" className="border-white/10 hover:bg-white/10 text-white" asChild>
                <a href="https://www.superlinear.academy/c/work-wealth/" target="_blank" rel="noopener noreferrer">
                  <BookOpen className="w-4 h-4 mr-2" />
                  购买课程
                </a>
              </Button>
            </div>
            <p className="text-zinc-500 text-xs">
              书即将上架 ·{" "}
              <a
                href="https://www.superlinear.academy/c/posts/book"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                在帖子下留言
              </a>{" "}
              即可预约，第一时间通知
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/[0.08]">
              {[
                ["3,143", "B站购课人数"],
                ["300+", "Superlinear 学员"],
                ["739,563", "次播放 · 职场 #1"],
                ["¥79.6万", "B站课程成交额"],
              ].map(([num, label]) => (
                <div key={label} className="space-y-0.5">
                  <div className="text-xl md:text-2xl font-bold text-amber-400">{num}</div>
                  <div className="text-xs text-zinc-500 leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Book 3D */}
          <div className="flex justify-center order-1 md:order-2">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-75" />
              {/* 3D book */}
              <div
                className="relative flex items-stretch"
                style={{
                  transform: "perspective(900px) rotateY(-18deg)",
                  filter: "drop-shadow(14px 28px 48px rgba(10,5,5,0.5))",
                  transition: "transform 0.45s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "perspective(900px) rotateY(-6deg) scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "perspective(900px) rotateY(-18deg)")
                }
              >
                {/* Spine */}
                <div
                  className="overflow-hidden flex-shrink-0"
                  style={{ width: "22px", filter: "brightness(0.7) saturate(0.85)" }}
                >
                  <img
                    src="/book/cover-spine.png"
                    alt=""
                    className="w-full h-full object-cover object-top"
                    aria-hidden="true"
                  />
                </div>
                {/* Front cover */}
                <div style={{ width: "clamp(180px, 22vw, 240px)" }}>
                  <img
                    src="/book/cover-front.png"
                    alt="《真本事：从会工作到会赚钱》"
                    className="block w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="bg-white/[0.03] py-16 md:py-20 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <span className="w-6 h-px bg-amber-400 inline-block" />
              认知觉醒
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              你明明努力，<br />却仍在原地踏步？
            </h2>
            <p className="text-zinc-400 mt-4 max-w-lg">问题往往不在于你不努力，而在于努力的方向。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: '陷在"仓鼠轮"',
                body: "工作越忙越看不到前景，绩效还行，却缺乏可控收入。你一直在跑，但跑道本身并不通向你想去的地方。",
              },
              {
                title: "被打分体系绑架",
                body: "害怕犯错，永远只做90%执行，没有10%突破。客体、固定、打分三种错误思维，让你把失去主动权合理化。",
              },
              {
                title: "副业无法起势",
                body: "想做副业却找不到方向，赚钱技能无处积累。因为你还没搞清楚：你到底能提供什么市场真正需要的价值？",
              },
            ].map((card) => (
              <Card
                key={card.title}
                className="bg-white/[0.03] border-l-2 border-l-amber-400 border-t-0 border-r-0 border-b-0 rounded-none"
              >
                <CardContent className="pt-6">
                  <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{card.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Formula ── */}
      <section id="framework" className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <span className="w-6 h-px bg-amber-400 inline-block" />
              核心框架
              <span className="w-6 h-px bg-amber-400 inline-block" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">个人价值公式</h2>
          </div>

          {/* Formula */}
          <div className="border border-white/10 bg-white/[0.03] p-8 md:p-10 text-center mb-8">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">个人价值公式</p>
            <p className="text-2xl md:text-3xl font-bold text-white leading-loose">
              个人价值
              <span className="text-amber-400 mx-2">＝</span>
              了解市场
              <span className="text-amber-400 mx-2">×</span>
              打造产品
              <span className="text-amber-400 mx-2">×</span>
              利用杠杆
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                num: "01",
                tag: "了解市场",
                title: "找准高价值问题",
                body: "读懂行业、组织、用户的真实需求。知道市场要什么，你才能知道把力气用在哪里。",
              },
              {
                num: "02",
                tag: "打造产品",
                title: "能力变成可交付成果",
                body: "从简历到副业产品再到个人品牌，把你的能力封装成别人买得到、用得上的东西。",
              },
              {
                num: "03",
                tag: "利用杠杆",
                title: "成果放大十倍、百倍",
                body: "借助平台、内容、AI 与资本，把成果放大到更多人和更高收益。一份努力产生复利。",
              },
            ].map((c) => (
              <Card key={c.num} className="bg-white/[0.03] border-white/10">
                <CardContent className="pt-6 space-y-2">
                  <p className="text-xs font-mono text-amber-400 tracking-wider">
                    {c.num} · {c.tag}
                  </p>
                  <h3 className="text-white font-bold">{c.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{c.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flywheel ── */}
      <section className="bg-white/[0.03] py-16 md:py-20 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <span className="w-6 h-px bg-amber-400 inline-block" />
              成长方法论
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">成长飞轮</h2>
            <p className="text-zinc-400 mt-3 max-w-lg">
              认知不只是看书悟道，更要通过真实的体感和实战，形成持续滚动的成长复利。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border border-white/10">
            {[
              {
                n: "01",
                label: "打开认知",
                title: "拆掉思维的墙",
                body: "理解财富自由与价值创造的底层逻辑，识别并破除客体思维、固定思维、打分思维三大陷阱。",
              },
              {
                n: "02",
                label: "请教体感",
                title: "向结果显著的人学习",
                body: '获得"只可意会"的判断力与心法。通过与真实案例和访谈嘉宾的对话，建立具身感知。',
              },
              {
                n: "03",
                label: "躬身入局",
                title: "在真实项目中刻意练习",
                body: "用高杠杆任务与副业试水完成价值闭环。理论只有落地才算真正掌握，飞轮才能转起来。",
              },
            ].map((step, i) => (
              <div
                key={step.n}
                className={`relative p-7 ${i < 2 ? "border-b md:border-b-0 md:border-r border-white/10" : ""}`}
              >
                <span className="absolute top-4 right-5 text-5xl font-serif text-white/[0.05] select-none leading-none">
                  {step.n}
                </span>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  {step.label}
                </p>
                <h3 className="text-white font-bold mb-2">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Advisor ── */}
      <AdvisorSection />

      {/* ── Course Outline ── */}
      <section id="outline" className="bg-white/[0.03] py-16 md:py-20 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <span className="w-6 h-px bg-amber-400 inline-block" />
              课程大纲
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">21课，4大模块</h2>
            <p className="text-zinc-400 mt-3 max-w-lg">
              从认知觉醒到行动落地，完整路径清晰可循。课程与书相互映照，书是课程的深度延伸。
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.03]">
            {MODULES.map((mod, i) => (
              <ModuleItem key={mod.num} mod={mod} defaultOpen={i === 0} />
            ))}
          </div>

          <div className="mt-6">
            <Button variant="outline" className="border-white/10 hover:bg-white/10 text-white" asChild>
              <a
                href="https://www.bilibili.com/cheese/play/ss300796438"
                target="_blank"
                rel="noopener noreferrer"
              >
                在 B 站观看课程 →
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Endorsements ── */}
      <section id="endorsements" className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <span className="w-6 h-px bg-amber-400 inline-block" />
              封面推荐
              <span className="w-6 h-px bg-amber-400 inline-block" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">他们为这本书背书</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {ENDORSEMENTS.map((e) => (
              <Card
                key={e.name}
                className="bg-white/[0.03] border-t-2 border-t-amber-400 border-x-0 border-b-0 rounded-none"
              >
                <CardContent className="pt-6 space-y-4 relative">
                  <span className="absolute top-3 right-4 text-5xl font-serif text-white/10 leading-none select-none">
                    "
                  </span>
                  <blockquote className="text-zinc-300 text-sm leading-relaxed italic relative z-10">
                    {e.quote}
                  </blockquote>
                  <div>
                    <p className="text-white font-bold text-sm">{e.name}</p>
                    <p className="text-zinc-500 text-xs">{e.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Author ── */}
      <section id="author" className="bg-white/[0.03] py-16 md:py-20 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-[240px_1fr] gap-10 items-start">
            {/* Photo */}
            <div className="relative mx-auto md:mx-0" style={{ maxWidth: 240 }}>
              <div className="absolute inset-0 bg-amber-500/10 blur-2xl" />
              <img
                src="/book/author.jpg"
                alt="孙煜征博士"
                className="relative w-full aspect-[3/4] object-cover object-top"
              />
              <div className="bg-amber-500 text-black text-xs font-semibold text-center py-2 tracking-wide">
                孙煜征 博士
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-3 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
                  <span className="w-6 h-px bg-amber-400 inline-block" />
                  关于作者
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white">孙煜征</h2>
                <p className="text-zinc-400 text-sm mt-1">
                  康奈尔大学经济学博士 · Superlinear Academy 创始人 · AI 布道者
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "在美17年，康奈尔经济学博士；前 Amazon 经济学家、Meta 数据科学家、腾讯 IEG 副总监",
                  "Statsig 早期成员，公司唯一 evangelist；Statsig 后被 OpenAI 收购",
                  "Superlinear Academy 社群创始人，12,000+ 成员，付费学员中 50% 以上为硅谷大厂员工",
                  "自研 Maven AI 理念课程全网口碑第一，受邀为多家 500 强企业做员工培训与 AI 策略顾问",
                  "自媒体总计对话 200+ 位中美科技高管与顶级 AI 研究员，数篇转载量百万的前瞻文章，全网 30 万高质量粉丝（YouTube 10万 · 小红书 7万 · LinkedIn 3万）",
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                    <span className="text-amber-400 flex-shrink-0 mt-0.5">▸</span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="bg-white/[0.04] border border-white/10 p-4">
                <p className="text-sm text-zinc-400">
                  📖 所著{" "}
                  <span className="text-white font-semibold">《Grow Data Analytics Playbook》</span>{" "}
                  获《华尔街日报》推荐为 2025 年 CIO 必读书籍
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Cornell PhD", "Amazon", "Meta", "Tencent IEG", "Statsig → OpenAI"].map((b) => (
                  <Badge key={b} variant="outline" className="border-white/20 text-zinc-400 text-xs">
                    {b}
                  </Badge>
                ))}
              </div>

              <a
                href="https://www.lizheng.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                个人主页 lizheng.ai →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community ── */}
      <section id="community" className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <span className="w-6 h-px bg-amber-400 inline-block" />
              Superlinear 社群
              <span className="w-6 h-px bg-amber-400 inline-block" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              与 12,000+ 同行者<br />一起实践真本事
            </h2>
            <p className="text-zinc-400 mt-4 max-w-lg mx-auto text-sm">
              加入社群，获得个人价值公式地图、10% 高价值工作排程表、AI 杠杆清单，并与真实在实践这套方法论的人交流。其中 50% 以上为硅谷大厂员工。
            </p>
          </div>
          <div className="border border-white/10 overflow-hidden">
            <iframe
              style={{ border: 0, width: "100%", height: "75vh" }}
              src="https://www.superlinear.academy/feed?iframe=true"
              title="Superlinear 社群"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white/[0.03] py-16 md:py-20 relative">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <span className="w-6 h-px bg-amber-400 inline-block" />
              常见问题
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">你可能想问的</h2>
          </div>
          <div className="border border-white/10 bg-white/[0.03]">
            {FAQ.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section id="purchase" className="bg-black/30 py-20 text-center relative">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">开启你的真本事之旅</h2>
          <p className="text-zinc-400 mb-8">
            购书链接即将开放。现在预约，上架第一时间通知；或加入社群，今天就开始实践。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold" asChild>
              <a
                href="https://www.superlinear.academy/c/posts/book"
                target="_blank"
                rel="noopener noreferrer"
              >
                预约购书通知
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/10 text-white" asChild>
              <a href="https://www.superlinear.academy" target="_blank" rel="noopener noreferrer">
                <Users className="w-5 h-5 mr-2" />
                加入 Superlinear 社群
              </a>
            </Button>
          </div>
          <p className="text-white/20 text-xs mt-4">
            在{" "}
            <a
              href="https://www.superlinear.academy/c/posts/book"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/40 underline"
            >
              此帖子
            </a>{" "}
            下留言即可预约 · 购书链接即将开放
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-black/30 border-t border-white/[0.06] py-6 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/30">
            <p>© 2025 Superlinear Academy · 《真本事》版权所有 · 孙煜征博士</p>
            <nav className="flex gap-4">
              <a href="mailto:hello@superlinear.academy" className="hover:text-white/60 transition-colors">
                联系我们
              </a>
              <a
                href="https://www.lizheng.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/60 transition-colors"
              >
                lizheng.ai
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
