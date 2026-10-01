import { useEffect, useRef, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import type { Lang } from "@/contexts/LanguageContext";
import {
  askLizheng,
  applyAskEvent,
  AskError,
  publicSourceUrl,
  type AskIntent,
  type AskPayload,
  type AskAnswerState,
  type AskResult,
  type AskSource,
} from "@/lib/ask-lizheng";
import { HOME_COPY, LINKS } from "./content";
import { EXTERNAL } from "./parts";
import SiteSearch from "./SiteSearch";

const COPY = {
  zh: {
    question: "你的问题",
    placeholder: "想弄明白什么？也可以说说你的处境和卡点。",
    context: "补充背景（选填）",
    contextHint: "目标、事实、限制，或已经试过什么。",
    send: "发送问题",
    stop: "停止",
    reset: "开始新问题",
    full: "打开完整页面",
    examples: "选一个问题，再改成自己的",
    loading: "正在查找相关公开材料…",
    seconds: "秒",
    waited: "已等待",
    candidates: "已找到的材料 · 候选，尚未最终采用",
    sources: "回答依据",
    excerpt: "查看原文片段",
    copy: "阅读公开资料副本",
    next: "可以继续问",
    clarify: "还需要了解",
    stopped: "已停止。问题和检索材料已保留，可以修改后重试。",
    failed: "回答未完成。问题和已找到的材料仍在，可以重试。",
    crowded: "现在提问较多，请稍后再试。问题和已找到的材料仍在。",
    disconnected:
      "连接中断了，完整回答未收到。问题和已找到的材料都保留着，可以重新生成。",
    timeout: "这次回答等得太久，已结束等待。问题和材料已保留，可以重新生成。",
    retry: "重新生成回答",
    waiting: "回答还在整理，可以先读下面的资料，也可以随时停止。",
    connecting: "正在连接服务…",
    connectionActive: "连接保持中",
    noRecentResponse: "暂未收到新响应，仍在等待",
    waitingLong:
      "这次整理时间较长，可以先打开原文阅读。停止会保留问题和已找到的材料。",
    partial: "正在生成的回答",
    partialNote: "以下段落已核对来源编号；完整回答仍在生成。",
    approach: "回答思路",
    approachEnglish: "整理方向与资料主要使用中文。",
    privacy: "关于回答和你的输入",
    privacyNote:
      "回答依据立正的公开文章与视频，由AI综合，不代表本人回复。问题和背景会发送给Builder Space处理；本产品不保存对话记录，对话只留在当前页面，刷新后清空。请勿填写私密信息。",
    modes: ["想明白", "聊聊我的问题", "找内容"],
    kinds: {
      source: "材料中的观点",
      synthesis: "AI综合",
      application: "结合你的处境",
    },
    steps: ["查找原文", "匹配材料", "整理回答", "核对来源"],
  },
  en: {
    question: "Your question",
    placeholder:
      "What would you like to understand? You can include your situation and where you’re stuck.",
    context: "Add context (optional)",
    contextHint: "Your goal, facts, constraints, or what you’ve tried.",
    send: "Ask",
    stop: "Stop",
    reset: "New question",
    full: "Open full page",
    examples: "Choose a question, then make it yours",
    loading: "Finding relevant public material…",
    seconds: "s",
    waited: "Waiting",
    candidates: "Material found · candidates, not final citations",
    sources: "Sources used",
    excerpt: "Read the excerpt",
    copy: "Read public source copy",
    next: "Keep asking",
    clarify: "More context would help",
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
    privacy: "About answers and your input",
    privacyNote:
      "AI synthesizes answers from Lizheng’s public articles and videos; these are not personal replies. Questions and context are sent to Builder Space for processing. This product does not store conversations; they remain in this page’s memory and clear on refresh. Keep private information out of your input.",
    modes: ["Understand", "Apply to my situation", "Find sources"],
    kinds: {
      source: "From the material",
      synthesis: "AI synthesis",
      application: "Applied to your situation",
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
  model?: string;
};
const INTENTS: AskIntent[] = ["understand", "apply", "find"];
const STAGE: Record<string, number> = {
  retrieving: 0,
  matching: 1,
  thinking: 2,
  drafting: 2,
  checking: 3,
  repairing: 3,
};

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
  return (
    <article className="lz-ask-source" id={`home-ask-${turnId}-${source.id}`}>
      <div>
        <span>{source.id}</span>
        <time>{source.date?.slice(0, 10)}</time>
      </div>
      {url ? (
        <a href={url} {...EXTERNAL}>
          {source.title} ↗
        </a>
      ) : (
        <b>{source.title}</b>
      )}
      {source.reason && <p>{source.reason}</p>}
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
          return sources.some(s => s.id === id) ? (
            <a className="lz-ask-cite" href={`#home-ask-${turnId}-${id}`}>
              {children}
            </a>
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

function AnswerSections({
  sections,
  sources,
  turnId,
  lang,
}: {
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
        <small>{c.kinds[section.kind]}</small>
      </div>
      <AnswerText text={section.body} sources={sources} turnId={turnId} />
      <div className="lz-ask-citations">
        {section.source_ids?.map(id => (
          <a key={id} href={`#home-ask-${turnId}-${id}`}>
            {id}
          </a>
        ))}
      </div>
    </section>
  ));
}

export default function AskLizheng({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].writing.ask;
  const c = COPY[lang];
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [intent, setIntent] = useState<AskIntent>("understand");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [model, setModel] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const latest = useRef<HTMLElement>(null);
  const active = useRef<AbortController | null>(null);
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
  function prefill(value: string) {
    setQuestion(value);
    input.current?.focus();
  }
  async function submit(event?: FormEvent, retry?: Turn) {
    event?.preventDefault();
    if (active.current || (!retry && !question.trim())) return;
    const payload: AskPayload = retry?.request || {
      question: question.trim(),
      context,
      intent,
      history: turns
        .filter(turn => turn.result)
        .slice(-6)
        .map(turn => ({
          question: turn.question,
          summary: turn.result!.summary,
        })),
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
    // Metadata is fetched only on interaction; reading the homepage starts no AI request.
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
        const crowded =
          error instanceof AskError &&
          (error.status === 429 || error.code === "provider_busy");
        update({
          error:
            timedOut ||
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
      }
    }
  }
  return (
    <>
      <div className="lz-ask-native rv">
        <div className="lz-ask-native-head grain">
          <div>
            <h3>{t.title}</h3>
            <p>{t.body}</p>
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
              {INTENTS.map((value, index) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={intent === value}
                  disabled={busy}
                  onClick={() => setIntent(value)}
                >
                  {c.modes[index]}
                </button>
              ))}
            </div>
            <label className="sr-only" htmlFor="home-ask-question">
              {c.question}
            </label>
            <textarea
              ref={input}
              id="home-ask-question"
              value={question}
              onChange={event => setQuestion(event.target.value)}
              maxLength={2000}
              disabled={busy}
              rows={3}
              placeholder={c.placeholder}
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
              <details>
                <summary>{c.context}</summary>
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
              </details>
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
                  {c.stop} ■
                </button>
              ) : (
                <button
                  key="send"
                  className="btn btn-green"
                  disabled={!question.trim()}
                  type="submit"
                >
                  {c.send} ↑
                </button>
              )}
            </div>
          </form>
          <details className="lz-ask-about">
            <summary>{c.privacy}</summary>
            <p>{c.privacyNote}</p>
          </details>
          {!turns.length && (
            <div className="lz-ask-starters">
              <p>{c.examples}</p>
              {t.examples.map(value => (
                <button key={value} onClick={() => prefill(value)}>
                  {value} ↗
                </button>
              ))}
            </div>
          )}
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
                            ? c.connecting
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
                          {c.stop} ■
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
                        />
                        {turn.result.limitations && (
                          <p className="lz-ask-limitations">
                            {turn.result.limitations}
                          </p>
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
                      <p className="lz-ask-error" role="alert">
                        {turn.error}
                      </p>
                    )}
                    {!busy &&
                      index === turns.length - 1 &&
                      (turn.error || turn.result?.retryable) && (
                        <button
                          className="btn btn-line lz-ask-retry"
                          type="button"
                          onClick={() => void submit(undefined, turn)}
                        >
                          {c.retry} ↗
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
                    <small className="lz-ask-model">
                      {turn.model || (working ? model : "")}
                    </small>
                    {!working && index === turns.length - 1 && turn.result && (
                      <div className="lz-ask-followups">
                        {!!turn.result.clarifying_questions?.length && (
                          <>
                            <p>{c.clarify}</p>
                            {turn.result.clarifying_questions.map(value => (
                              <button
                                key={value}
                                onClick={() => {
                                  setQuestion(turn.question);
                                  setIntent("apply");
                                  setContext(prev => {
                                    const next = `${prev}${prev ? "\n" : ""}${value}\n`;
                                    return next.length <= 2500 ? next : prev;
                                  });
                                  document
                                    .getElementById("home-ask-context")
                                    ?.closest("details")
                                    ?.setAttribute("open", "");
                                  document
                                    .getElementById("home-ask-context")
                                    ?.focus();
                                }}
                              >
                                {value} ↗
                              </button>
                            ))}
                          </>
                        )}
                        {!!turn.result.followups?.length && (
                          <>
                            <p>{c.next}</p>
                            {turn.result.followups.map(value => (
                              <button
                                key={value}
                                onClick={() => {
                                  setIntent("apply");
                                  prefill(value);
                                }}
                              >
                                {value} ↗
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
                  setTurns([]);
                  setQuestion("");
                  setContext("");
                  input.current?.focus();
                }}
              >
                {c.reset} ↗
              </button>
            </div>
          )}
        </div>
      </div>
      <details className="lz-ask-archive rv">
        <summary>{t.searchLabel}</summary>
        <SiteSearch lang={lang} />
      </details>
    </>
  );
}
