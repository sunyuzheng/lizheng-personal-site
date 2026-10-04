import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import type { Lang } from "@/contexts/LanguageContext";
import {
  askLizheng,
  applyAskEvent,
  AskError,
  publicSourceUrl,
  isMemberCourse,
  isMemberVideo,
  memberJoinUrl,
  type AskIntent,
  type AskPayload,
  type AskAnswerState,
  type AskResult,
  type AskSource,
} from "@/lib/ask-lizheng";
import { HOME_COPY, LINKS } from "./content";
import { EXTERNAL, Phrases } from "./parts";
import { askLoginHere, beginAskLogin, finishAskLogin, logoutAsk, readAskAccount, takeAskDraft, type AskAccount } from "@/lib/ask-account";
import { askedAgo, askedLastDay, discoveryDetail, discoveryLists, discoveryPage, discoveryView, voteDiscovery, DISCOVERY_LIST_SIZE, type DiscoveryCard, type DiscoveryDetail, type DiscoveryLists, type DiscoveryView } from "@/lib/ask-discovery";
import { track } from "@vercel/analytics";
import { markUsage, startUsage, watchUsage } from "@/lib/ask-usage";
import { copyWhenReady, createShareLink, IN_WECHAT, shareDisplay, type ShareResult } from "@/lib/ask-share-link";
// What we tell people about public Q&A, shared with ask.lizheng.ai and the privacy policy (synced from ask-lizheng).
import { answerService, PUBLIC_QA, publicQaCopy } from "@shared/ask-public-qa.js";

// Where a link to the membership page sits, so its visits can be told apart there.
const stayLink = (medium: string) => `${LINKS.stay}?utm_source=ask-lizheng&utm_medium=${medium}`;

const COPY = {
  zh: {
    question: "你的问题",
    placeholder: "有什么你一直想弄明白的问题？",
    hints: {
      ask: "问一个概念、一个判断，或一直没想通的地方。",
      personal: "回答会结合你的目标、现状和卡点，也会指出还缺什么信息。",
      find: "说一个话题，AI挑出最值得先读的文章和视频，说明各讲什么、从哪篇开始。",
    },
    placeholderPersonal: "说说你在做的事，以及卡在哪里。",
    placeholderFind: "比如：想了解AI时代怎么学习，先读哪几篇？",
    context: "结合我的处境",
    contextHint: "你的目标、现状和卡点，或已经试过什么。只写愿意分享的部分。",
    noticeV3: "问答会保存下来，用来改进回答；请勿填写私密信息。",
    noticeV3Parts: [
      ["为什么保存", "看哪些问题答得不好、缺哪些材料，把回答做得更好；我也想知道大家关心什么。"],
      ["保存什么", "提问、完整回答和所用出处，以及匿名的使用统计。记录只有我能看到。"],
      ["你的隐私", "提问记录不关联邮箱、账号或IP；输入文字仍可能识别个人，发送给AI前不会自动去掉。登录只用来核验Founding身份，不会和提问记在一起。「结合我的处境」里填的内容不单独保存，但回答可能会提到它，所以请别填写私密信息。"],
      ["另外", "回答由AI根据我公开的文章和视频整理，不是我本人回复。提问和必要背景会发给Builder Space的模型服务处理。刷新页面会清空当前对话。"],
    ] as [string, string][],
    send: "提问",
    stop: "停止",
    reset: "开始新问题",
    full: "打开完整页面",
    examples: "选一个问题，再改成自己的",
    discoveryTitle: "别人在问什么",
    discoveryNote: "真实的提问，去掉个人信息后由AI挑选整理。",
    discoveryCount: (n: number) => `${n}次类似提问`,
    discoveryLikes: (n: number) => `${n}人觉得有帮助`,
    discoveryLoading: "正在打开…",
    discoveryUnavailable: "这条回答暂时打不开，请稍后再试。",
    discoverySimilar: "问个类似的",
    discoveryMore: "看更多问题",
    discoveryViews: ["最近问", "最常问"],
    discoveryShare: "分享",
    discoveryHelpful: "有帮助",
    discoveryHelped: "觉得有帮助",
    discoveryAttribution: "AI整理，不是立正本人回复。",
    loading: "正在查找相关公开材料…",
    seconds: "秒",
    waited: "已等待",
    candidates: "已找到的材料 · 候选，尚未最终采用",
    sources: "回答依据",
    excerpt: "查看原文片段",
    copy: "阅读公开资料副本",
    saveImage: "保存图片",
    savePdf: "下载PDF",
    exporting: "正在生成…",
    exportFailed: "这次没能生成文件，可以稍后再试。",
    // 分享这条回答: the answer's own public page; sharing may give back one of today's questions.
    shareLabel: "分享这条回答",
    shareBonusLabel: "分享这条回答，今天多问一次",
    shareQuota: "分享上面的回答，今天多问一次",
    shareCreate: "复制分享链接",
    shareCreating: "正在生成链接…",
    shareCopied: "链接已复制。",
    shareSelect: "没能自动复制，长按或选中链接就能复制。",
    shareBonus: "今天多了一次提问机会。",
    shareSend: "发给朋友…",
    shareCopy: "复制链接",
    shareCopiedAgain: "已复制",
    shareFailed: "这次没能生成链接，可以稍后再试。",
    shareWechat: "打开链接后，点右上角「···」就能发给朋友。",
    next: "可以接着问",
    nextHint: "点一下放进输入框，改好再发",
    clarify: "再补充一点，回答会更贴合你",
    stopped: "已停止。问题和检索材料已保留，可以修改后重试。",
    failed: "回答未完成。问题和已找到的材料仍在，可以重试。",
    crowded: "现在提问较多，请稍后再试。问题和已找到的材料仍在。",
    disconnected:
      "连接中断了，完整回答未收到。问题和已找到的材料都保留着，可以重新生成。",
    timeout: "这次回答等得太久，已结束等待。问题和材料已保留，可以重新生成。",
    retry: "重新生成回答",
    waiting: "回答还在整理，可以先读下面的资料，也可以随时停止。",
    connecting: "正在连接服务…",
    waking: "问答服务闲置时会休眠，正在唤醒，通常十几秒…",
    accountWaking: "正在唤醒问答服务…",
    connectionActive: "连接保持中",
    noRecentResponse: "暂未收到新响应，仍在等待",
    waitingLong:
      "这次整理时间较长，可以先打开原文阅读。停止会保留问题和已找到的材料。",
    partial: "正在生成的回答",
    partialNote: "以下段落已核对来源编号；完整回答仍在生成。",
    approach: "回答思路",
    approachEnglish: "整理方向与资料主要使用中文。",
    privacy: "说明",
    queryNotice: "提问会保存30天，用于改进回答。请勿填写私密信息。",
    quotaLeft: (n: number) => `今天还能问${n}次`,
    quotaNone: "今天的3次已用完，北京时间0点恢复",
    quotaUnavailable: "暂时读不到今天的次数。",
    quotaRetry: "重试",
    quotaExhausted: "今天的3次已经用完。北京时间每天0点恢复；Founding Member验证后不限次。",
    networkQuotaExhausted: "今天来自这个网络的免费提问已经很多了，北京时间每天0点恢复；Founding Member验证后不限次。",
    founding: "Founding Member · 不限次",
    signedIn: "已登录，未核验到Founding资格",
    foundingOffer: "Founding Member不限次：",
    verifyShort: "验证身份",
    howToJoin: "如何成为",
    foundingTitle: "什么是Founding Member",
    foundingWho: "Stay Superlinear前3,000位新年费会员是Founding Member，一年$149/¥999。AI Builder、AI Architect的老学员也是。",
    foundingGet: "会员每年有12+场嘉宾大师课，每个月和鸭哥与我直播答疑，问问立正也不限次。",
    foundingCta: "了解会员",
    foundingVerify: "已经是？验证身份",
    becomeFounding: "如何成为Founding Member",
    verifyButton: "验证Founding身份",
    loginPending: "请在弹出的窗口里完成验证",
    loginHere: "没看到窗口？在本页验证",
    loginWaiting: "正在等待验证…",
    loginIncomplete: "这次没有完成验证",
    verified: "验证成功 · Founding Member · 不限次",
    verifiedRetry: "验证成功，可以重新提问了。",
    signOut: "退出",
    privacyNote:
      "回答依据立正的公开文章与视频，由AI综合，不代表本人回复。问题和必要背景会发送给Builder Space处理。我们保存提问文本、时间、模型、回答状态与耗时，用于改进回答，30天后自动删除；不保存补充背景、对话历史或完整回答，不把提问记录关联到邮箱或账号。当前对话只留在页面，刷新后清空。账号只用于Founding身份与额度核验；登录跳转可能在当前标签页短暂保留未发送草稿，返回即清除。请勿填写私密信息。",
    modes: ["想明白", "从哪读起"],
    // AI synthesis is the default and goes unlabeled; the answer says once that AI wrote it.
    kinds: {
      source: "材料里的观点",
      application: "AI推演",
      personal: "结合你的处境",
    },
    steps: ["查找原文", "匹配材料", "整理回答", "核对来源"],
  },
  en: {
    question: "Your question",
    placeholder: "What would you like to understand?",
    hints: {
      ask: "Ask about an idea, a judgment, or something you haven’t worked out.",
      personal: "The answer takes your goal, situation and sticking points into account, and says what else it needs.",
      find: "Name a topic. AI picks the essays and talks worth reading first, says what each covers and where to start.",
    },
    placeholderPersonal: "Tell me what you’re working on and where you’re stuck.",
    placeholderFind: "For example: what should I read first about learning in the AI era?",
    context: "Apply to my situation",
    contextHint: "Your goal, current situation, where you’re stuck, or what you’ve tried. Share only what you’re comfortable with.",
    noticeV3: "Questions and answers are saved to improve answers; please keep private information out.",
    noticeV3Parts: [
      ["Why we save questions", "To see which questions get weak answers and what material is missing, so answers get better. I also want to know what people care about."],
      ["What we keep", "Questions, full answers and their sources, plus anonymous usage stats. Only I can see these records."],
      ["Your privacy", "Question records are not linked to email, accounts or IP. Your words may still identify you and are not automatically redacted before AI processing. Signing in only checks Founding Member status and is never stored with your questions. What you write under “Apply to my situation” is not stored separately, but an answer may mention it, so please keep private information out."],
      ["Also", "Answers are AI syntheses of my public articles and videos, not personal replies. Questions and necessary context go to Builder Space’s model service. Refreshing clears this conversation."],
    ] as [string, string][],
    send: "Ask",
    stop: "Stop",
    reset: "New question",
    full: "Open full page",
    examples: "Choose a question, then make it yours",
    discoveryTitle: "What others are asking",
    discoveryNote: "Real questions with personal details removed, picked and organized by AI.",
    discoveryCount: (n: number) => `${n} similar questions`,
    discoveryLikes: (n: number) => `${n} found this helpful`,
    discoveryLoading: "Opening…",
    discoveryUnavailable: "This answer can’t be opened right now. Please try again later.",
    discoverySimilar: "Ask something similar",
    discoveryMore: "See more questions",
    discoveryViews: ["Newest", "Most asked"],
    discoveryShare: "Share",
    discoveryHelpful: "Helpful",
    discoveryHelped: "Found it helpful",
    discoveryAttribution: "Organized by AI, not a reply from Lizheng.",
    loading: "Finding relevant public material…",
    seconds: "s",
    waited: "Waiting",
    candidates: "Material found · candidates, not final citations",
    sources: "Sources used",
    excerpt: "Read the excerpt",
    copy: "Read public source copy",
    saveImage: "Save image",
    savePdf: "Download PDF",
    exporting: "Preparing…",
    exportFailed: "The file could not be created. Try again shortly.",
    shareLabel: "Share this answer",
    shareBonusLabel: "Share this answer, ask one more today",
    shareQuota: "Share an answer above to ask one more today",
    shareCreate: "Copy share link",
    shareCreating: "Creating the link…",
    shareCopied: "Link copied.",
    shareSelect: "Couldn’t copy it automatically; press and hold or select the link to copy it.",
    shareBonus: "You can ask one more today.",
    shareSend: "Send…",
    shareCopy: "Copy link",
    shareCopiedAgain: "Copied",
    shareFailed: "The link could not be created. Try again shortly.",
    shareWechat: "Open the link, then tap ··· at the top right to send it.",
    next: "Keep asking",
    nextHint: "Click to put it in the box, edit, then send",
    clarify: "A little more context would help",
    stopped:
      "Stopped. Your question and material are still here; edit and try again.",
    failed:
      "The answer didn’t finish. Your question and material are still here; try again.",
    crowded:
      "There are many requests right now. Try again shortly; your question and material are still here.",
    disconnected:
      "The connection was interrupted before the answer finished. Your question and sources are still here; generate again when ready.",
    timeout:
      "This answer took too long. Your question and sources are still here; you can generate again.",
    retry: "Generate again",
    waiting:
      "The answer is still being prepared. You can read the sources below or stop at any time.",
    connecting: "Connecting to the service…",
    waking: "The answer service sleeps when idle and is waking up. This usually takes 10 to 20 seconds…",
    accountWaking: "Waking the answer service…",
    connectionActive: "Connection active",
    noRecentResponse: "No recent response; still waiting",
    waitingLong:
      "This is taking longer. You can open the sources while waiting; stopping keeps your question and material.",
    partial: "Answer in progress",
    partialNote:
      "Citation IDs checked for these sections; the full answer is still being prepared.",
    approach: "How this answer is being prepared",
    approachEnglish:
      "The reading outline and sources are primarily in Chinese.",
    privacy: "Details",
    queryNotice: "Questions are saved for 30 days to improve answers. Please avoid private information.",
    quotaLeft: (n: number) => `${n} answers left today`,
    quotaNone: "Today’s 3 answers are used; they reset at midnight Beijing time",
    quotaUnavailable: "Today’s count is unavailable right now.",
    quotaRetry: "Retry",
    quotaExhausted: "Your 3 daily answers are used. They reset at midnight Beijing time; Founding Members can verify for unlimited answers.",
    networkQuotaExhausted: "Free answers from this network are used up for today. They reset at midnight Beijing time; Founding Members can verify for unlimited answers.",
    founding: "Founding Member · unlimited",
    signedIn: "Signed in; no Founding Member status found",
    foundingOffer: "Unlimited for Founding Members:",
    verifyShort: "Verify",
    howToJoin: "How to join",
    foundingTitle: "What’s a Founding Member?",
    foundingWho: "The first 3,000 new annual members of Stay Superlinear are Founding Members, at $149 or ¥999 a year. AI Builder and AI Architect alumni are too.",
    foundingGet: "Members get 12+ guest masterclasses a year, a monthly live Q&A with Yage and me, and unlimited answers here.",
    foundingCta: "About the membership",
    foundingVerify: "Already one? Verify",
    becomeFounding: "How to become a Founding Member",
    verifyButton: "Verify Founding membership",
    loginPending: "Finish verifying in the pop-up window",
    loginHere: "No window? Verify on this page",
    loginWaiting: "Waiting for verification…",
    loginIncomplete: "Verification wasn’t completed",
    verified: "Verified · Founding Member · unlimited",
    verifiedRetry: "Verified. You can ask again.",
    signOut: "Sign out",
    privacyNote:
      "AI synthesizes answers from Lizheng’s public articles and videos; these are not personal replies. Questions and necessary context are sent to Builder Space. We save question text, time, model, answer status and duration to improve answers, then automatically delete them after 30 days. We do not save added context, conversation history or full answers, or link question records to email addresses or accounts. Conversations stay in this page’s memory and clear on refresh. Accounts verify Founding status and quota; a sign-in redirect may briefly keep an unsent draft in this tab, then delete it on return. Keep private information out of your input.",
    modes: ["Understand", "What to read first"],
    kinds: {
      source: "From the material",
      application: "AI’s application",
      personal: "Applied to your situation",
    },
    steps: [
      "Find sources",
      "Match material",
      "Draft answer",
      "Check citations",
    ],
  },
};
type Turn = AskAnswerState & {
  id: number;
  question: string;
  request: AskPayload;
  lastActivity: number;
  error?: string;
  quotaExhausted?: boolean;
  model?: string;
};
// 想明白 explains (understand) or, with the situation switched on, applies the
// material to the reader (apply). 从哪读起 picks what to read first (find).
const MODES = ["ask", "find"] as const;
type Mode = (typeof MODES)[number];
const STAGE: Record<string, number> = {
  retrieving: 0,
  matching: 1,
  thinking: 2,
  drafting: 2,
  checking: 3,
  repairing: 3,
};

function sourceKind(url: string) {
  const host = new URL(url).hostname;
  if (/(^|\.)lizheng\.ai$/.test(host)) return "article";
  if (/youtube\.com$|youtu\.be$|bilibili\.com$/.test(host)) return "video";
  if (/superlinear\.academy$|circle\.so$/.test(host)) return "community";
  return "other";
}
function Source({
  source,
  lang,
  turnId,
}: {
  source: AskSource;
  lang: Lang;
  turnId: number;
}) {
  const c = COPY[lang];
  const url = publicSourceUrl(source.url);
  const copy = publicSourceUrl(source.public_copy_url);
  const member = isMemberVideo(source);
  const course = isMemberCourse(source);
  return (
    <article className={`lz-ask-source${member ? " lz-ask-source-member" : ""}`} id={`home-ask-${turnId}-${source.id}`}>
      <div>
        <span className="num">{source.id.slice(1)}</span>
        {member && <strong className="lz-ask-member-badge">{lang === "zh" ? "会员视频" : "Members video"}</strong>}
        {course && <strong className="lz-ask-member-badge">{lang === "zh" ? "会员课程" : "Members course"}</strong>}
        <time>{source.date?.slice(0, 10)}</time>
      </div>
      {url ? (
        <a href={url} {...EXTERNAL} onClick={() => { markUsage("source"); track("Ask Source Click", { surface: "home", kind: sourceKind(url) }); }}>
          {source.title} ↗
        </a>
      ) : (
        <b>{source.title}</b>
      )}
      {source.reason && <p>{source.reason}</p>}
      {member && <p className="lz-ask-member-note">{lang === "zh" ? "字幕资料已开放，完整视频需YouTube频道会员。" : "Transcript text is open; the full video requires YouTube channel membership."}</p>}
      {course && <p className="lz-ask-member-note">{lang === "zh" ? "文字稿已开放，课程视频需超线性学院会员。" : "The lesson text is open; the course videos are for Superlinear members."}</p>}
      {source.transcript_quality === "uncorrected-asr" && <small>{lang === "zh" ? "自动转录未校正，请以原视频核实措辞。" : "Uncorrected ASR; verify wording in the original video."}</small>}
      {source.transcript_quality === "source-unverified" && <small>{lang === "zh" ? "字幕来源未确认，请以原视频核实。" : "Caption provenance is unverified; check the original video."}</small>}
      {member && url && <a className="lz-ask-member-watch" href={url} {...EXTERNAL}>{lang === "zh" ? "观看会员完整视频" : "Watch the full members video"} ↗</a>}
      {memberJoinUrl(source) && (
        <p className="lz-ask-member-join">
          <a href={memberJoinUrl(source)} {...EXTERNAL}>{lang === "zh" ? "加入 YouTube 频道会员" : "Join the YouTube channel membership"} ↗</a>
          <span>{lang === "zh" ? "与 Founding Member 的提问次数无关" : "Separate from Founding Member question limits"}</span>
        </p>
      )}
      {source.excerpt && (
        <p className="lz-ask-excerpt-preview">
          {source.excerpt.slice(0, 160)}
          {source.excerpt.length > 160 ? "…" : ""}
        </p>
      )}
      <details>
        <summary>{c.excerpt}</summary>
        <p>{source.excerpt}</p>
        <small>
          {source.author} {source.attribution_note}
        </small>
        {copy && (
          <a href={copy} {...EXTERNAL}>
            {c.copy} ↗
          </a>
        )}
      </details>
    </article>
  );
}

type ShareState = {
  open?: boolean; phase?: "confirm" | "working" | "ready"; url?: string; copied?: boolean;
  bonus?: ShareResult["bonus"]; error?: string;
};

// Sharing one answer: its own page (what that page shows, then its link and how to send it), a long
// image or a PDF. `link` is false for an answer that cannot have a page; the image and PDF remain.
// A question others asked already has its page: only its link and how to send it (no onExport).
function SharePanel({ state, lang, link, exporting = "", onCreate, onCopy, onSend, onExport }: {
  state: ShareState; lang: Lang; link: boolean; exporting?: string;
  onCreate?: () => void; onCopy: () => void; onSend: () => void; onExport?: (kind: "png" | "pdf") => void;
}) {
  const c = COPY[lang];
  const ready = link && state.phase === "ready";
  return (
    <div className="lz-ask-share">
      {ready ? (
        <>
          <a className="url" href={state.url} {...EXTERNAL}>{shareDisplay(state.url || "")} ↗</a>
          <p className="status" role="status">{state.copied ? c.shareCopied : c.shareSelect}{state.bonus === "granted" && <b>{c.shareBonus}</b>}</p>
        </>
      ) : link && <p>{PUBLIC_QA[lang].share}</p>}
      {state.error && <p className="error" role="alert">{state.error}</p>}
      <div className="actions">
        {ready ? (
          <>
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
              <button type="button" className="btn btn-line" onClick={onSend}>{c.shareSend}</button>
            )}
            <button type="button" className="btn btn-line" onClick={onCopy}>{state.copied ? c.shareCopiedAgain : c.shareCopy}</button>
          </>
        ) : link && (
          <button type="button" className="btn btn-line" disabled={state.phase === "working"} onClick={onCreate}>
            {state.phase === "working" ? c.shareCreating : c.shareCreate}
          </button>
        )}
        {onExport && (["png", "pdf"] as const).map(kind => (
          <button key={kind} type="button" className="btn btn-line" disabled={!!exporting} onClick={() => onExport(kind)}>
            {exporting === kind ? c.exporting : kind === "png" ? c.saveImage : c.savePdf}
          </button>
        ))}
      </div>
      {ready && IN_WECHAT && <p className="hint">{c.shareWechat}</p>}
    </div>
  );
}

// A boundary note may name a source as S6; show it as a citation, like in the text.
const citeIds = (text: string) => text.replace(/\[?\b(S\d+)\b\]?/g, "[$1]");

function AnswerText({
  text,
  sources,
  turnId,
}: {
  text: string;
  sources: AskSource[];
  turnId: number;
}) {
  return (
    <ReactMarkdown
      skipHtml
      components={{
        img: () => null,
        a: ({ href, children }) => {
          const id = href?.startsWith("#cite-") ? href.slice(6) : "";
          // A footnote mark: the number only, joined to the word it marks.
          return sources.some(s => s.id === id) ? (
            <>{"\u2060"}<a className="lz-ask-cite" href={`#home-ask-${turnId}-${id}`} aria-label={`S${id.slice(1)}`}>
              {id.slice(1)}
            </a></>
          ) : (
            <span>{children}</span>
          );
        },
      }}
    >
      {text.replace(/\[(S\d{1,2})\](?!\()/g, "[$1](#cite-$1)")}
    </ReactMarkdown>
  );
}

// Only sections that differ from AI synthesis say so. Sources show as numbers in the
// text; a section that cites none in its text lists them below.
function AnswerSections({
  sections,
  sources,
  turnId,
  lang,
  personal = false,
}: {
  personal?: boolean;
  sections: AskResult["sections"];
  sources: AskSource[];
  turnId: number;
  lang: Lang;
}) {
  const c = COPY[lang];
  return sections.map((section, i) => (
    <section key={i}>
      <div className="lz-ask-answer-title">
        <h4>{section.heading}</h4>
        {section.kind !== "synthesis" && (
          <small>{section.kind === "application" && personal ? c.kinds.personal : c.kinds[section.kind]}</small>
        )}
      </div>
      <AnswerText text={section.body} sources={sources} turnId={turnId} />
      {!/\[S\d+\]/.test(section.body) && (
        <div className="lz-ask-citations">
          {section.source_ids?.map(id => (
            <a key={id} href={`#home-ask-${turnId}-${id}`} aria-label={id}>
              {id.slice(1)}
            </a>
          ))}
        </div>
      )}
    </section>
  ));
}

export default function AskLizheng({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].ask;
  const c = COPY[lang];
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [mode, setMode] = useState<Mode>("ask");
  const [personal, setPersonal] = useState(false);
  const intent: AskIntent = mode === "find" ? "find" : personal ? "apply" : "understand";
  const situation = mode === "ask" && personal ? context : "";
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [model, setModel] = useState("");
  const [opsLogging, setOpsLogging] = useState(false);
  // v4: answers may be published with personal details removed; the situation is kept for analysis only.
  const [publicArchive, setPublicArchive] = useState(false);
  // Whether the situation is kept for analysis (before 2026-10-04) or used for the answer only.
  const [contextKept, setContextKept] = useState(true);
  const [loggingReady, setLoggingReady] = useState(false);
  const [loggingFailed, setLoggingFailed] = useState(false);
  // Builder, which sends these settings, sleeps when idle and takes up to half a minute to wake.
  const [loggingWaking, setLoggingWaking] = useState(false);
  const conversation = useRef<string | null>(null);
  const [account, setAccount] = useState<AskAccount | null>(null);
  const [exporting, setExporting] = useState("");
  // Each answer's share, by turn: whether its panel is open, and how far it got.
  const [shares, setShares] = useState<Record<number, ShareState>>({});
  const [exportError, setExportError] = useState(0);
  const outOfQuota = !!account?.enabled && !account.unavailable && !account.founding && account.remaining === 0;
  const loginCleanup = useRef<((closePopup?: boolean) => void) | undefined>(undefined);
  // Where a Founding verification stands, so it never looks like nothing happened.
  const [loginStep, setLoginStep] = useState<"" | "pending" | "verified" | "member" | "incomplete">("");
  // What a Founding Member is and how to become one, opened from the count line.
  const [foundingOpen, setFoundingOpen] = useState(false);
  // Real questions others asked, published from Ops: 最近问 and 最常问, the same lists for everyone;
  // shown on the Chinese page in place of the examples, four at a time.
  const [questionLists, setQuestionLists] = useState<DiscoveryLists | null>(null);
  const [discoveryTab, setDiscoveryTab] = useState<DiscoveryView>("recent");
  const discoveryShown = useMemo(() => (questionLists ? discoveryView(questionLists, discoveryTab) : []), [questionLists, discoveryTab]);
  const discoveryCards = discoveryShown.slice(0, 4);
  // Chinese page: loading until the list arrives, then ready; none when it cannot be read or takes
  // past eight seconds, and only then the examples show in its place.
  const [discoveryState, setDiscoveryState] = useState<"loading" | "ready" | "none">(lang === "zh" ? "loading" : "none");
  // Questions asked in the last day among those this visit read, shown beside the note.
  const [askedRecently, setAskedRecently] = useState(0);
  const discoveryList = useRef<HTMLDivElement>(null);
  const hasDiscovery = discoveryCards.length > 0;
  // Anonymous usage of this page view for the owner's dashboard (lib/ask-usage): reading time,
  // scroll depth, whether this section and its list were seen, and what was used.
  useEffect(() => {
    const stop = startUsage("home");
    watchUsage(document.getElementById("ask-lizheng"), "h_seen");
    return stop;
  }, []);
  useEffect(() => {
    if (!hasDiscovery) return;
    markUsage("d_shown");
    watchUsage(discoveryList.current, "d_seen");
  }, [hasDiscovery]);
  // More than four in the list: link to the whole list on ask.lizheng.ai.
  const discoveryMore = discoveryShown.length > discoveryCards.length;
  // Each card's share: the link to its public page, and whether it was copied.
  const [cardShares, setCardShares] = useState<Record<string, ShareState>>({});
  const [openCard, setOpenCard] = useState("");
  const [cardDetails, setCardDetails] = useState<Record<string, DiscoveryDetail | "loading" | "failed">>({});
  const [cardVotes, setCardVotes] = useState<Record<string, { likes: number; voted: boolean }>>({});
  // The count comes from Builder, which sleeps when idle: say so while it wakes.
  const [accountWaking, setAccountWaking] = useState(false);
  const refreshAccount = () => { void readAskAccount().then(setAccount); };
  const showLoginResult = (next: AskAccount | null) => {
    setAccount(next);
    const step = !next?.enabled || next.unavailable ? "" : next.founding ? "verified" : next.authenticated ? "member" : "incomplete";
    setLoginStep(step);
    if (step) track("Ask Verify Result", { surface: "home", result: step });
  };
  useEffect(() => {
    const signedIn = finishAskLogin();
    // A draft means this tab is back from signing in on this page.
    const draft = takeAskDraft();
    if (draft) {
      setQuestion(draft.question);
      setContext(draft.context);
      setMode(draft.intent === "find" ? "find" : "ask");
      setPersonal(draft.intent === "apply" || !!draft.context);
    }
    let stopped = false;
    const slow = setTimeout(() => setAccountWaking(true), 1_500);
    // A read that times out while Builder wakes gets one more try a second later.
    const load = (again: boolean) => void readAskAccount().then(next => {
      if (stopped) return;
      if (next?.unavailable && again) { setTimeout(() => load(false), 1_000); return; }
      clearTimeout(slow);
      setAccountWaking(false);
      (signedIn || draft ? showLoginResult : setAccount)(next);
    });
    load(true);
    const controller = new AbortController();
    void loadLogging(controller.signal);
    return () => { stopped = true; clearTimeout(slow); controller.abort(); loginCleanup.current?.(); };
  }, []);

  // Asks for up to a minute, 20 seconds a try, saying the service is waking after three seconds;
  // settings that came back but do not match fail at once.
  async function loadLogging(signal?: AbortSignal) {
    setLoggingFailed(false);
    setLoggingWaking(false);
    const started = Date.now();
    const slow = setTimeout(() => { if (!signal?.aborted) setLoggingWaking(true); }, 3000);
    try {
      for (;;) {
        let value: Record<string, any> | undefined;
        try {
          const response = await fetch("/api/ask-lizheng/meta", { cache: "no-store", credentials: "omit", signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20_000)]) : AbortSignal.timeout(20_000) });
          if (!response.ok) throw new Error();
          value = await response.json();
        } catch (error) {
          if (signal?.aborted || Date.now() - started >= 60_000) throw error;
          await new Promise(resolve => setTimeout(resolve, 2_000));
          continue;
        }
        if (value?.query_logging?.enabled !== true) throw new Error();
        const ops = value?.ops_logging;
        const archive = ops?.enabled === true && ops.retention === "until_deleted" && ops.answer_archive === true;
        // The page shows v4's notice only once the service says it keeps to v4.
        const v4 = archive && ops.notice === "v4" && typeof ops.context_archive === "boolean" && ops.public_display === "deidentified";
        if (!signal?.aborted) {
          setPublicArchive(v4); setContextKept(ops?.context_archive === true);
          if (typeof value?.model === "string") setModel(value.model);
          setOpsLogging(archive && (ops.notice === "v3" || v4)); setLoggingReady(true);
        }
        return;
      }
    } catch { if (!signal?.aborted) setLoggingFailed(true); }
    finally { clearTimeout(slow); if (!signal?.aborted) setLoggingWaking(false); }
  }
  useEffect(() => {
    if (lang !== "zh") { setDiscoveryState("none"); return; }
    setDiscoveryState(state => (state === "ready" ? state : "loading"));
    const controller = new AbortController();
    const late = setTimeout(() => setDiscoveryState(state => (state === "loading" ? "none" : state)), 8000);
    void discoveryLists(controller.signal).then(lists => {
      clearTimeout(late);
      if (controller.signal.aborted) return;
      if (!lists || (!lists.recent.length && !lists.frequent.length)) { setDiscoveryState("none"); return; }
      // Until someone has asked, the common questions written fresh are all there is.
      if (!discoveryView(lists, "recent").length) setDiscoveryTab("frequent");
      setAskedRecently(askedLastDay(lists.recent));
      setQuestionLists(lists);
      setDiscoveryState("ready");
    });
    return () => { clearTimeout(late); controller.abort(); };
  }, [lang]);
  const toggleCard = (card: DiscoveryCard) => {
    if (openCard === card.public_id) { setOpenCard(""); return; }
    setOpenCard(card.public_id);
    markUsage("d_open");
    track("Ask Discovery Open", { surface: "home", view: discoveryTab });
    const known = cardDetails[card.public_id];
    if (known && known !== "failed") return;
    setCardDetails(prev => ({ ...prev, [card.public_id]: "loading" }));
    void discoveryDetail(card.public_id).then(detail =>
      setCardDetails(prev => ({ ...prev, [card.public_id]: detail || "failed" })));
  };
  const askSimilar = (card: DiscoveryCard) => {
    markUsage("d_similar");
    track("Ask Discovery Similar", { surface: "home", view: discoveryTab });
    prefill(card.question, "card");
    input.current?.scrollIntoView({ block: "center" });
  };
  const showTab = (view: DiscoveryView) => {
    if (view === discoveryTab) return;
    setDiscoveryTab(view);
    setOpenCard("");
    track("Ask Discovery Sort", { surface: "home", sort: view });
  };
  // A question others asked already has its public page: sharing copies its link at once, and a
  // phone can also send it on.
  const setCardShare = (id: string, next: ShareState) => setCardShares(prev => ({ ...prev, [id]: { ...prev[id], ...next } }));
  const shareCard = async (card: DiscoveryCard) => {
    if (cardShares[card.public_id]?.open) { setCardShare(card.public_id, { open: false }); return; }
    const url = discoveryPage(card.public_id);
    setCardShare(card.public_id, { open: true, phase: "ready", url });
    markUsage("d_share");
    track("Ask Discovery Share", { surface: "home", view: discoveryTab });
    setCardShare(card.public_id, { copied: await copyWhenReady(url) });
  };
  const copyCard = async (card: DiscoveryCard) => setCardShare(card.public_id, { copied: await copyWhenReady(discoveryPage(card.public_id)) });
  const sendCard = async (card: DiscoveryCard) => {
    try { await navigator.share({ title: card.question, url: discoveryPage(card.public_id) }); } catch { /* Closed, or not allowed here. */ }
  };
  const likeCard = async (card: DiscoveryCard) => {
    const vote = !cardVotes[card.public_id]?.voted;
    const result = await voteDiscovery(card.public_id, card.revision, vote);
    if (!result) return;
    setCardVotes(prev => ({ ...prev, [card.public_id]: result }));
    track("Ask Discovery Vote", { surface: "home", vote });
  };
  const logout = () => { setLoginStep(""); void logoutAsk().then(refreshAccount); };
  const login = () => {
    loginCleanup.current?.();
    track("Ask Verify Start", { surface: "home" });
    setLoginStep("pending");
    loginCleanup.current = beginAskLogin({ question, context: situation, intent }, () => { void readAskAccount().then(showLoginResult); });
  };
  const loginHere = () => {
    loginCleanup.current?.(true);
    askLoginHere({ question, context: situation, intent });
  };
  const input = useRef<HTMLTextAreaElement>(null);
  const latest = useRef<HTMLElement>(null);
  const active = useRef<AbortController | null>(null);
  // How the question box was last filled, counted with each question: typed, example, card or followup.
  const questionFrom = useRef("typed");
  const counter = useRef(0);
  useEffect(() => {
    if (busy)
      latest.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
  }, [busy]);
  useEffect(
    () => () => {
      active.current?.abort();
    },
    []
  );
  useEffect(() => {
    if (!busy) return;
    const start = Date.now();
    setElapsed(0);
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000
    );
    return () => clearInterval(timer);
  }, [busy]);
  // A long image shares well in chat apps; the PDF keeps the source links clickable.
  async function exportTurn(kind: "png" | "pdf", turn: Turn) {
    if (!turn.result) return;
    markUsage("export");
    setExporting(`${turn.id}-${kind}`);
    try {
      const { exportAnswer } = await import("@/lib/ask-share");
      const { blob, name, type } = await exportAnswer(kind, { question: turn.question, result: turn.result, date: new Date(), personal: !!turn.request.context }, lang);
      const file = new File([blob], name, { type });
      if (kind === "png" && window.matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: lang === "zh" ? "问问立正" : "Ask Lizheng" });
          return;
        } catch (error) {
          if ((error as Error)?.name === "AbortError") return;
        }
      }
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement("a"), { href: url, download: name });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setExportError(turn.id);
    } finally {
      setExporting("");
    }
  }
  // 分享这条回答. Sharing may give back one of today's questions, once a day, after one was used.
  const bonusOffer = !IN_WECHAT && !!account?.enabled && !account.unavailable && !account.founding &&
    account.share_bonus === true && (account.remaining ?? 3) < 3;
  const setShare = (id: number, patch: ShareState) => setShares(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  const toggleShare = (turn: Turn) => {
    const current = shares[turn.id];
    const open = !current?.open;
    setShare(turn.id, { open, ...(!current ? { phase: "confirm", error: "" } : {}) });
    if (open) track("Ask Share", { surface: "home", action: "open" });
  };
  const openShare = (turn: Turn) => {
    setShare(turn.id, { open: true, ...(shares[turn.id]?.phase === "ready" ? {} : { phase: "confirm", error: "" }) });
    requestAnimationFrame(() => document.getElementById(`home-share-${turn.id}`)?.scrollIntoView({ block: "center" }));
  };
  async function createShare(turn: Turn) {
    if (!turn.result?.share) return;
    setShare(turn.id, { phase: "working", error: "" });
    const link = createShareLink(turn.result.share, { bonus: bonusOffer });
    const copied = copyWhenReady(link.then(value => value.url));
    try {
      const value = await link;
      if (value.bonus === "granted" || value.bonus === "claimed")
        setAccount(prev => (prev ? { ...prev, share_bonus: false, ...(Number.isFinite(value.remaining) ? { remaining: value.remaining } : {}) } : prev));
      setShare(turn.id, { phase: "ready", url: value.url, bonus: value.bonus, copied: await copied });
      track("Ask Share", { surface: "home", action: value.bonus === "granted" ? "bonus" : "link" });
    } catch {
      setShare(turn.id, { phase: "confirm", error: c.shareFailed });
    }
  }
  async function copyShare(turn: Turn) {
    setShare(turn.id, { copied: await copyWhenReady(shares[turn.id]?.url || "") });
  }
  async function sendShare(turn: Turn) {
    track("Ask Share", { surface: "home", action: "send" });
    try { await navigator.share({ title: turn.question, url: shares[turn.id]?.url }); } catch { /* Closed, or not allowed here. */ }
  }
  // v4, public Q&A, in this page's voice; the situation is not kept since 2026-10-04 (/api/meta says context_archive: false).
  const qa = publicQaCopy(lang, { owner: "我", self: "我", answerer: answerService(model), contextKept });
  // The answer above that the count line offers to share once the day's questions are used.
  const shareable = bonusOffer ? turns.filter(turn => turn.result?.share).at(-1) : undefined;
  function prefill(value: string, from = "followup") {
    questionFrom.current = from;
    setQuestion(value);
    input.current?.focus();
  }
  async function submit(event?: FormEvent, retry?: Turn) {
    event?.preventDefault();
    if (active.current || !loggingReady || (!retry && !question.trim())) return;
    if (loginStep !== "pending") setLoginStep("");
    if (!retry) { markUsage("ask"); track("Ask Question", { surface: "home", from: questionFrom.current }); questionFrom.current = "typed"; }
    const payload: AskPayload = retry?.request || {
      question: question.trim(),
      context: situation,
      intent,
      history: turns
        .filter(turn => turn.result)
        .slice(-6)
        .map(turn => ({
          question: turn.question,
          summary: turn.result!.summary,
        })),
      ...(opsLogging ? {
        query_log_notice: publicArchive ? ("v4" as const) : ("v3" as const),
        conversation_id: conversation.current || (conversation.current = crypto.randomUUID()),
      } : { query_log_notice: "v1" as const }),
    };
    const text = payload.question;
    const id = retry?.id || ++counter.current;
    const controller = new AbortController();
    let timedOut = false;
    const deadline = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 110_000);
    active.current = controller;
    setBusy(true);
    setQuestion(prev => (!retry || prev.trim() === text ? "" : prev));
    setTurns(prev => [
      ...prev.filter(turn => turn.id !== id),
      {
        id,
        question: text,
        request: payload,
        sources: retry?.sources || [],
        lastActivity: 0,
        progress: { stage: "retrieving", message: c.loading },
      },
    ]);
    const update = (value: Partial<Turn>) =>
      setTurns(prev =>
        prev.map(turn => (turn.id === id ? { ...turn, ...value } : turn))
      );
    // Public model metadata does not start an AI request.
    void fetch("/api/ask-lizheng/meta", {
      signal: controller.signal,
      cache: "no-store",
      credentials: "omit",
    })
      .then(r => (r.ok ? r.json() : null))
      .then(value => {
        if (value?.model && !controller.signal.aborted) {
          setModel(value.model);
          update({ model: value.model });
        }
      })
      .catch(() => {});
    try {
      await askLizheng(
        payload,
        controller.signal,
        event => {
          if (controller.signal.aborted) return;
          if (event.type === "result" && event.value.status === "answered") markUsage("answer");
          setTurns(prev =>
            prev.map(turn =>
              turn.id === id ? { ...turn, ...applyAskEvent(turn, event) } : turn
            )
          );
        },
        () => {
          if (!controller.signal.aborted) update({ lastActivity: Date.now() });
        }
      );
    } catch (error) {
      if (active.current === controller) {
        const quotaExhausted = error instanceof AskError && error.code === "quota_exhausted";
        const crowded =
          error instanceof AskError &&
          !quotaExhausted &&
          (error.status === 429 || error.code === "provider_busy");
        update({
          quotaExhausted,
          error:
            quotaExhausted
              ? (error as AskError).scope === "network" ? c.networkQuotaExhausted : c.quotaExhausted
              : error instanceof AskError && error.code === "ops_storage_unavailable"
                ? (lang === "zh" ? "未能确认问题保存，这次没有开始生成，也不扣次数。请重试。" : "Question storage was not confirmed. No answer was generated and your quota was not used. Please retry.")
              : error instanceof AskError && error.code === "answer_archive_failed"
                ? (lang === "zh" ? "本次回答未能确认保存，未扣次数。请重试。" : "We could not confirm this answer was saved. Your quota was not used. Please retry.")
              : timedOut ||
            (error instanceof AskError && error.code === "relay_timeout")
              ? c.timeout
              : controller.signal.aborted
                ? c.stopped
                : crowded
                  ? c.crowded
                  : error instanceof AskError &&
                      error.code !== "connection_lost"
                    ? c.failed
                    : c.disconnected,
        });
        setQuestion(prev => (prev.trim() ? prev : text));
      }
    } finally {
      clearTimeout(deadline);
      if (active.current === controller) {
        controller.abort();
        active.current = null;
        setBusy(false);
        refreshAccount();
      }
    }
  }
  return (
    <>
      <div className="lz-ask-native rv" id="ask-lizheng">
        <div className="lz-ask-native-head grain">
          <div>
            <h2>{t.title}</h2>
            <p>
              <Phrases text={t.body} />
            </p>
            <small>{t.note}</small>
          </div>
          <a href={LINKS.askLizheng} {...EXTERNAL}>
            {c.full} ↗
          </a>
        </div>
        <div className="lz-ask-native-body">
          <form onSubmit={submit} className="lz-ask-form">
            <div
              className="lz-ask-modes"
              role="group"
              aria-label={
                lang === "zh" ? "这次想怎样使用" : "How you want to use this"
              }
            >
              {MODES.map((value, index) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={mode === value}
                  disabled={busy}
                  onClick={() => setMode(value)}
                >
                  {c.modes[index]}
                </button>
              ))}
            </div>
            <p className="lz-ask-mode-hint">
              {mode === "find" ? c.hints.find : personal ? c.hints.personal : c.hints.ask}
            </p>
            <label className="sr-only" htmlFor="home-ask-question">
              {c.question}
            </label>
            <textarea
              ref={input}
              id="home-ask-question"
              value={question}
              onChange={event => { setQuestion(event.target.value); if (!event.target.value.trim()) questionFrom.current = "typed"; }}
              maxLength={2000}
              disabled={busy}
              rows={3}
              placeholder={
                mode === "find"
                  ? c.placeholderFind
                  : personal
                    ? c.placeholderPersonal
                    : c.placeholder
              }
              onKeyDown={event => {
                if (
                  (event.metaKey || event.ctrlKey) &&
                  event.key === "Enter" &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void submit();
                }
              }}
            />
            <div className="lz-ask-form-bottom">
              <div className="lz-ask-situation">
                {mode === "ask" && (
                  <button
                    type="button"
                    className="lz-ask-switch"
                    aria-pressed={personal}
                    disabled={busy}
                    onClick={() => setPersonal(on => !on)}
                  >
                    <span className="switch" aria-hidden="true" />
                    {c.context}
                  </button>
                )}
                {mode === "ask" && personal && (
                  <>
                    <label className="sr-only" htmlFor="home-ask-context">
                      {c.context}
                    </label>
                    <textarea
                      id="home-ask-context"
                      maxLength={2500}
                      disabled={busy}
                      rows={3}
                      value={context}
                      onChange={event => setContext(event.target.value)}
                      placeholder={c.contextHint}
                    />
                    {publicArchive && <p className="lz-ask-context-note">{qa.situation}</p>}
                  </>
                )}
              </div>
              {busy ? (
                <button
                  key="stop"
                  className="btn btn-line"
                  type="button"
                  onClick={event => {
                    event.preventDefault();
                    active.current?.abort();
                  }}
                >
                  {c.stop}
                </button>
              ) : (
                <button
                  key="send"
                  className="btn btn-green"
                  disabled={!question.trim() || outOfQuota || !loggingReady}
                  type="submit"
                >
                  {c.send}
                </button>
              )}
            </div>
          </form>
          {!loggingReady && <p role="status">{loggingFailed
            ? <>{lang === "zh" ? "未能确认提问保存设置。" : "Could not confirm question storage."} <button type="button" onClick={() => void loadLogging()}>{lang === "zh" ? "重试" : "Retry"}</button></>
            : loggingWaking
              ? (lang === "zh" ? "问答服务正在唤醒，通常十几秒，可以先写问题。" : "Waking the answer service, usually 10 to 20 seconds. You can start typing.")
              : (lang === "zh" ? "正在确认提问保存设置…" : "Checking question storage…")}</p>}
          <div className="lz-ask-meta">
            {/* The notice waits for the service's saving settings, so an older one never shows first. */}
            {loggingReady && <details className="lz-ask-about">
              <summary>
                {publicArchive ? qa.notice : opsLogging ? c.noticeV3 : c.queryNotice}
                <span>{c.privacy}</span>
              </summary>
              {publicArchive || opsLogging ? (
                <div className="notice-parts">
                  {publicArchive
                    ? <><p><b>{qa.title}</b></p>{qa.about.map(text => <p key={text}>{text}</p>)}</>
                    : c.noticeV3Parts.map(([title, text]) => <p key={title}><b>{title}</b>{text}</p>)}
                </div>
              ) : <p>{c.privacyNote}</p>}
            </details>}
            {!account && accountWaking && (
              <p className="lz-ask-account" aria-live="polite">
                <span className="pending">{c.accountWaking}</span>
              </p>
            )}
            {account?.enabled && (
              <p className="lz-ask-account" aria-live="polite">
                {account.unavailable ? (
                  <>
                    <span>{c.quotaUnavailable}</span>
                    <button type="button" onClick={refreshAccount}>{c.quotaRetry}</button>
                  </>
                ) : account.founding ? (
                  <>
                    {loginStep === "verified" ? <b className="verified">{c.verified}</b> : <b>{c.founding}</b>}
                    <button type="button" disabled={busy} onClick={logout}>{c.signOut}</button>
                  </>
                ) : (
                  <>
                    {outOfQuota ? <b className="empty">{c.quotaNone}</b> : <b>{c.quotaLeft(account.remaining ?? 3)}</b>}
                    {account.authenticated ? (
                      <>
                        <span className={loginStep === "member" ? "notice" : undefined}>{c.signedIn}</span>
                        <button type="button" className="toggle" aria-expanded={foundingOpen} aria-controls="lz-founding"
                          onClick={() => { if (!foundingOpen) track("Ask Founding Info", { surface: "home" }); setFoundingOpen(open => !open); }}>{c.howToJoin}</button>
                        <button type="button" disabled={busy} onClick={logout}>{c.signOut}</button>
                      </>
                    ) : loginStep === "pending" ? (
                      <>
                        <span className="pending">{c.loginPending}</span>
                        <button type="button" onClick={loginHere}>{c.loginHere}</button>
                      </>
                    ) : (
                      account.login_ready && (
                        <>
                          {loginStep === "incomplete" && <span>{c.loginIncomplete}</span>}
                          <span className="offer">
                            {c.foundingOffer}
                            <button type="button" disabled={busy} onClick={login}>{c.verifyShort}</button>
                            <span className="sep" aria-hidden="true">·</span>
                            <button type="button" className="toggle" aria-expanded={foundingOpen} aria-controls="lz-founding"
                              onClick={() => { if (!foundingOpen) track("Ask Founding Info", { surface: "home" }); setFoundingOpen(open => !open); }}>{c.howToJoin}</button>
                          </span>
                        </>
                      )
                    )}
                  </>
                )}
              </p>
            )}
            {outOfQuota && shareable && (
              <p className="lz-ask-share-nudge">
                <button type="button" onClick={() => openShare(shareable)}>{c.shareQuota}</button>
              </p>
            )}
            {foundingOpen && account?.enabled && !account.unavailable && !account.founding && (
              <div className="lz-founding" id="lz-founding">
                <p className="title">{c.foundingTitle}</p>
                <p>{c.foundingWho}</p>
                <p>{c.foundingGet}</p>
                <p className="actions">
                  <a className="join" href={stayLink("founding_panel")} {...EXTERNAL}
                    onClick={() => track("Ask Membership Click", { surface: "home", location: "founding_panel" })}>{c.foundingCta} ↗</a>
                  {!account.authenticated && account.login_ready && loginStep !== "pending" && (
                    <button type="button" disabled={busy} onClick={login}>{c.foundingVerify}</button>
                  )}
                </p>
              </div>
            )}
          </div>
          {!turns.length && (lang === "zh" && discoveryState !== "none" ? (
            <div className="lz-ask-discovery" ref={discoveryList}>
              <div className="lz-ask-discovery-head">
                <h3>{c.discoveryTitle}</h3>
                <p>{c.discoveryNote}</p>
                {askedRecently >= 3 && <p className="lz-ask-discovery-live">最近24小时 {askedRecently >= DISCOVERY_LIST_SIZE ? `${DISCOVERY_LIST_SIZE}+` : askedRecently} 个新问题</p>}
                {/* The same two lists for everyone; 看更多问题 opens the one shown on ask.lizheng.ai. */}
                <div className="lz-ask-discovery-views" role="group" aria-label={lang === "zh" ? "怎样看这些问题" : "How to see these questions"}>
                  {(["recent", "frequent"] as const).map((view, i) => (
                    <button key={view} type="button" aria-pressed={discoveryTab === view} onClick={() => showTab(view)}>{c.discoveryViews[i]}</button>
                  ))}
                </div>
              </div>
              <div className="lz-ask-discovery-list" aria-busy={!discoveryCards.length}>
              {/* While the questions load, the rows they will fill; never the examples first. */}
              {!discoveryCards.length && [0, 1, 2, 3].map(i => <div key={i} className="lz-ask-qcard-placeholder" aria-hidden="true"><i /><b /></div>)}
              {discoveryCards.map((card, index) => {
                const open = openCard === card.public_id;
                const detail = cardDetails[card.public_id];
                const vote = cardVotes[card.public_id];
                const likes = vote?.likes ?? card.likes;
                // Picked for being asked often: the count of similar askings leads. Otherwise the
                // time does, and the count, when it says more than this one question, sits below.
                const similar = card.similar_count ?? card.topic_question_count;
                const often = card.role === "common" && similar >= 2;
                const meta = [!often && similar >= 2 && c.discoveryCount(similar),
                  likes > 0 && c.discoveryLikes(likes)].filter(Boolean).join(" · ");
                const anchor = -(index + 1);
                return (
                  <article key={card.public_id} className={open ? "lz-ask-qcard open" : "lz-ask-qcard"}>
                    <button type="button" className="lz-ask-qcard-head" aria-expanded={open} onClick={() => toggleCard(card)}>
                      {often ? (
                        <small className="often">{c.discoveryCount(similar)}</small>
                      ) : card.asked_at ? (
                        <time className={Date.now() - Date.parse(card.asked_at) < 3600000 ? "fresh" : undefined} dateTime={card.asked_at}
                          title={new Date(card.asked_at).toLocaleString("zh-CN", { dateStyle: "long", timeStyle: "short" })}>
                          {askedAgo(card.asked_at)}
                        </time>
                      ) : (
                        <small>常被问到</small>
                      )}
                      <b>{card.question}</b>
                      {!open && card.summary && <span className="summary">{card.summary}</span>}
                      {meta && <span className="meta">{meta}</span>}
                    </button>
                    {open && (
                      <div className="lz-ask-qcard-body">
                        {detail === "loading" || !detail ? <p className="note">{c.discoveryLoading}</p>
                          : detail === "failed" ? <p className="note">{c.discoveryUnavailable}</p> : (
                          <>
                            <div className="lz-ask-answer">
                              <div className="lz-ask-answer-summary">
                                <AnswerText text={detail.answer.summary} sources={detail.answer.sources} turnId={anchor} />
                              </div>
                              <AnswerSections sections={detail.answer.sections} sources={detail.answer.sources} turnId={anchor} lang={lang} />
                              {detail.answer.limitations && <div className="lz-ask-limitations"><AnswerText text={citeIds(detail.answer.limitations)} sources={detail.answer.sources} turnId={anchor} /></div>}
                            </div>
                            {!!detail.answer.sources.length && (
                              <div className="lz-ask-material">
                                <p>{c.sources}</p>
                                <div className="lz-ask-source-grid">
                                  {detail.answer.sources.map(source => (
                                    <Source key={`${source.id}-${source.url}`} source={source} lang={lang} turnId={anchor} />
                                  ))}
                                </div>
                              </div>
                            )}
                            <small className="attribution">{c.discoveryAttribution}</small>
                          </>
                        )}
                        <div className="actions">
                          <button type="button" className="btn btn-line" onClick={() => askSimilar(card)}>{c.discoverySimilar}</button>
                          {account?.authenticated && (
                            <button type="button" className={vote?.voted ? "like on" : "like"} aria-pressed={!!vote?.voted}
                              onClick={() => void likeCard(card)}>{vote?.voted ? c.discoveryHelped : c.discoveryHelpful}</button>
                          )}
                          <button type="button" className="btn btn-line" aria-expanded={!!cardShares[card.public_id]?.open}
                            onClick={() => void shareCard(card)}>{c.discoveryShare}</button>
                        </div>
                        {cardShares[card.public_id]?.open && (
                          <SharePanel state={cardShares[card.public_id]} lang={lang} link
                            onCopy={() => void copyCard(card)} onSend={() => void sendCard(card)} />
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
              {discoveryMore && (
                <a className="lz-ask-discovery-more" href={`https://ask.lizheng.ai/#${discoveryTab}`} {...EXTERNAL}
                  onClick={() => { markUsage("d_more"); track("Ask Discovery More", { surface: "home", view: discoveryTab }); }}>{c.discoveryMore} ↗</a>
              )}
              </div>
            </div>
          ) : (
            <div className="lz-ask-starters">
              <p>{c.examples}</p>
              {t.examples.map(value => (
                <button key={value} onClick={() => prefill(value, "example")}>
                  {value}
                </button>
              ))}
            </div>
          ))}
          {!!turns.length && (
            <div className="lz-ask-turns">
              {turns.map((turn, index) => {
                const working = busy && index === turns.length - 1;
                const step = STAGE[turn.progress?.stage || "retrieving"] ?? 0;
                const recentActivityAge = turn.lastActivity
                  ? Math.max(0, (Date.now() - turn.lastActivity) / 1000)
                  : null;
                const partialSourceIds = new Set(
                  working ? turn.partial?.sources.map(source => source.id) : []
                );
                const partialSources = turn.sources.filter(source =>
                  partialSourceIds.has(source.id)
                );
                const candidateSources = turn.sources.filter(
                  source => !partialSourceIds.has(source.id)
                );
                return (
                  <article
                    className="lz-ask-turn"
                    key={turn.id}
                    ref={index === turns.length - 1 ? latest : undefined}
                  >
                    <p className="lz-ask-question">{turn.question}</p>
                    {working && (
                      <div className="lz-ask-progress">
                        <p>
                          <span role="status">
                            {lang === "zh"
                              ? turn.progress?.message
                              : c.steps[step]}
                          </span>{" "}
                          <span>
                            {c.waited} {elapsed}
                            {c.seconds}
                          </span>
                        </p>
                        <ol>
                          {c.steps.map((label, i) => (
                            <li
                              key={label}
                              aria-current={i === step ? "step" : undefined}
                              className={i <= step ? "reached" : ""}
                            >
                              {label}
                            </li>
                          ))}
                        </ol>
                        <small aria-live="off">
                          {recentActivityAge === null
                            ? elapsed >= 5 ? c.waking : c.connecting
                            : recentActivityAge <= 12
                              ? c.connectionActive
                              : c.noRecentResponse}
                        </small>
                        {elapsed >= 20 && (
                          <small>
                            {elapsed > 30 ? c.waitingLong : c.waiting}
                          </small>
                        )}
                        <button
                          className="btn btn-line"
                          type="button"
                          aria-label={
                            lang === "zh" ? "停止当前回答" : "Stop this answer"
                          }
                          onClick={event => {
                            event.preventDefault();
                            active.current?.abort();
                          }}
                        >
                          {c.stop}
                        </button>
                      </div>
                    )}
                    {turn.result && (
                      <div className="lz-ask-answer">
                        <div className="lz-ask-answer-summary">
                          <AnswerText
                            text={turn.result.summary}
                            sources={turn.sources}
                            turnId={turn.id}
                          />
                        </div>
                        <AnswerSections
                          sections={turn.result.sections || []}
                          sources={turn.sources}
                          turnId={turn.id}
                          lang={lang}
                          personal={!!turn.request.context}
                        />
                        {turn.result.limitations && (
                          <div className="lz-ask-limitations">
                            <AnswerText text={citeIds(turn.result.limitations)} sources={turn.sources} turnId={turn.id} />
                          </div>
                        )}
                      </div>
                    )}
                    {working && !!turn.partial?.sections.length && (
                      <div className="lz-ask-answer">
                        <h4>{c.partial}</h4>
                        <small>{c.partialNote}</small>
                        <AnswerSections
                          sections={turn.partial.sections}
                          sources={turn.partial.sources}
                          turnId={turn.id}
                          lang={lang}
                          personal={!!turn.request.context}
                        />
                      </div>
                    )}
                    {working && turn.approach && (
                      <div className="lz-ask-approach">
                        <h4>{c.approach}</h4>
                        {lang === "en" && <small>{c.approachEnglish}</small>}
                        <p>{turn.approach.summary}</p>
                        {!!turn.approach.questions.length && (
                          <ul>
                            {turn.approach.questions.map(value => (
                              <li key={value}>{value}</li>
                            ))}
                          </ul>
                        )}
                        <p className="lz-ask-approach-sources">
                          {turn.approach.sources.map(source => (
                            <span key={source.id}>
                              {source.id} · {source.title}
                            </span>
                          ))}
                        </p>
                        <small>{turn.approach.note}</small>
                      </div>
                    )}
                    {turn.error && (
                      <p className={turn.quotaExhausted ? "lz-ask-error quota" : "lz-ask-error"} role="alert">
                        {turn.error}
                        {turn.quotaExhausted && (account?.founding ? (
                          loginStep === "verified" && <b className="verified">{c.verifiedRetry}</b>
                        ) : (
                          <span className="actions">
                            {account?.login_ready && !account.authenticated && (
                              <button type="button" className="btn btn-line" disabled={loginStep === "pending"} onClick={login}>
                                {loginStep === "pending" ? c.loginWaiting : c.verifyButton}
                              </button>
                            )}
                            <a className="become" href={stayLink("quota_card")} {...EXTERNAL}
                              onClick={() => track("Ask Membership Click", { surface: "home", location: "quota_card" })}>{c.becomeFounding} ↗</a>
                          </span>
                        ))}
                      </p>
                    )}
                    {!busy &&
                      index === turns.length - 1 &&
                      ((turn.error && (!turn.quotaExhausted || account?.founding || (account?.remaining ?? 0) > 0)) || turn.result?.retryable) && (
                        <button
                          className="btn btn-line lz-ask-retry"
                          type="button"
                          onClick={() => void submit(undefined, turn)}
                        >
                          {c.retry}
                        </button>
                      )}
                    {!!turn.sources.length && (
                      <div className="lz-ask-material">
                        <p>{turn.result ? c.sources : c.candidates}</p>
                        <div className="lz-ask-source-grid">
                          {partialSources.map(source => (
                            <Source
                              key={`${source.id}-${source.url}`}
                              source={source}
                              lang={lang}
                              turnId={turn.id}
                            />
                          ))}
                          {candidateSources
                            .slice(0, turn.result ? candidateSources.length : 2)
                            .map(source => (
                              <Source
                                key={`${source.id}-${source.url}`}
                                source={source}
                                lang={lang}
                                turnId={turn.id}
                              />
                            ))}
                        </div>
                        {!turn.result && candidateSources.length > 2 && (
                          <details className="lz-ask-more-sources">
                            <summary>
                              {lang === "zh"
                                ? `查看全部${candidateSources.length}份候选材料`
                                : `All ${candidateSources.length} candidate sources`}
                            </summary>
                            <div className="lz-ask-source-grid">
                              {candidateSources.slice(2).map(source => (
                                <Source
                                  key={`${source.id}-${source.url}`}
                                  source={source}
                                  lang={lang}
                                  turnId={turn.id}
                                />
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                    {turn.result?.status === "answered" && !working && (
                      <div className="lz-ask-actions" id={`home-share-${turn.id}`}>
                        <button type="button" className="share" aria-expanded={!!shares[turn.id]?.open} onClick={() => toggleShare(turn)}>
                          {bonusOffer && turn.result.share ? c.shareBonusLabel : c.shareLabel}
                        </button>
                        {exportError === turn.id && <small role="alert">{c.exportFailed}</small>}
                      </div>
                    )}
                    {turn.result?.status === "answered" && !working && shares[turn.id]?.open && (
                      <SharePanel state={shares[turn.id]} lang={lang} link={!!turn.result.share}
                        exporting={exporting === `${turn.id}-png` ? "png" : exporting === `${turn.id}-pdf` ? "pdf" : exporting ? "other" : ""}
                        onCreate={() => void createShare(turn)} onCopy={() => void copyShare(turn)} onSend={() => void sendShare(turn)}
                        onExport={kind => void exportTurn(kind, turn)} />
                    )}
                    {turn.result?.status !== "sources-only" && (
                      <small className="lz-ask-model">
                        {turn.model || (working ? model : "")}
                      </small>
                    )}
                    {!working && index === turns.length - 1 && turn.result && (
                      <div className="lz-ask-followups">
                        {!!turn.result.clarifying_questions?.length && (
                          <>
                            <p>{c.clarify}</p>
                            {turn.result.clarifying_questions.map(value => (
                              <button
                                key={value}
                                className="lz-ask-clarify"
                                onClick={() => {
                                  setQuestion(turn.question);
                                  setMode("ask");
                                  setPersonal(true);
                                  setContext(prev => {
                                    const next = `${prev}${prev ? "\n" : ""}${value}\n`;
                                    return next.length <= 2500 ? next : prev;
                                  });
                                  requestAnimationFrame(() =>
                                    document
                                      .getElementById("home-ask-context")
                                      ?.focus()
                                  );
                                }}
                              >
                                {value}
                              </button>
                            ))}
                          </>
                        )}
                        {!!turn.result.followups?.length && (
                          <>
                            <p>
                              {c.next}
                              <span>{c.nextHint}</span>
                            </p>
                            {turn.result.followups.map(value => (
                              <button
                                key={value}
                                onClick={() => prefill(value)}
                              >
                                {value}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
              <button
                disabled={busy}
                className="lz-ask-reset"
                onClick={() => {
                  conversation.current = null;
                  setTurns([]);
                  setQuestion("");
                  setContext("");
                  setPersonal(false);
                  input.current?.focus();
                }}
              >
                {c.reset}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
