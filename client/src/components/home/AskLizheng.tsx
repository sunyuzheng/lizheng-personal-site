import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { track } from "@vercel/analytics";
import type { Lang } from "@/contexts/LanguageContext";
import {
  askedAgo,
  discoveryLink,
  discoveryLists,
  discoveryView,
  likeState,
  readLikes,
  rememberLike,
  voteDiscovery,
  type DiscoveryCard,
  type DiscoveryLists,
  type DiscoveryView,
  type LikeMemory,
} from "@/lib/ask-discovery";
import { markUsage, startUsage, watchUsage } from "@/lib/ask-usage";
// What we tell people about public Q&A, shared with ask.lizheng.ai and the privacy policy (synced from ask-lizheng).
import { answerService, publicQaCopy } from "@shared/ask-public-qa.js";
import { HOME_COPY, LINKS } from "./content";
import { Arrow, EXTERNAL, Phrases } from "./parts";

/*
 * 问问立正 on the homepage is a way in (2026-10-15; the owner chose it so that one asking page is kept,
 * not two): the question box and 别人在问什么. Asking, answers, sharing, the daily count and sign-in
 * all live on ask.lizheng.ai. The box opens that page with the question in the fragment (askPageUrl),
 * and the page sends it at once because it was opened from here (ask-lizheng src/home-question.js);
 * each question in the list opens its own page there.
 */

const COPY = {
  zh: {
    question: "你的问题",
    placeholder: "有什么你一直想弄明白的问题？",
    placeholderFind: "比如：想了解AI时代怎么学习，先读哪几篇？",
    hints: {
      ask: "问一个概念、一个判断，或一直没想通的地方。",
      find: "说一个话题，AI挑出最值得先读的文章和视频，说明各讲什么、从哪篇开始。",
    },
    where: "",
    send: "提问",
    full: "打开完整页面",
    examples: "选一个问题，再改成自己的",
    discoveryTitle: "别人在问什么",
    discoveryNote: "真实的提问和回答，原样展示。",
    discoveryTotal: (n: number) => `已有${n}个公开问答`,
    discoveryCount: (n: number) => `${n}次类似提问`,
    discoveryOften: "常被问到",
    discoveryMore: "看更多问题",
    discoveryExpand: (n: number) => `再看${n}个问题`,
    discoveryViews: ["最常问", "最近问"],
    discoveryHelpful: "有帮助",
    discoveryHelpfulCount: (n: number) => `有帮助，${n}人`,
    discoveryUnlike: "取消",
    privacy: "说明",
    modes: ["想明白", "从哪读起"],
    modesLabel: "这次想怎样使用",
    viewsLabel: "怎样看这些问题",
  },
  en: {
    question: "Your question",
    placeholder: "What would you like to understand?",
    placeholderFind: "For example: what should I read first about learning in the AI era?",
    hints: {
      ask: "Ask about an idea, a judgment, or something you haven’t worked out.",
      find: "Name a topic. AI picks the essays and talks worth reading first, says what each covers and where to start.",
    },
    // The asking page is in Chinese; a question in English is answered all the same.
    where: "Your question opens on ask.lizheng.ai, which is in Chinese. You can ask in English.",
    send: "Ask",
    full: "Open full page",
    examples: "Choose a question, then make it yours",
    discoveryTitle: "What others are asking",
    discoveryNote: "Real questions and answers, shown as asked.",
    discoveryTotal: (n: number) => `${n} public Q&As`,
    discoveryCount: (n: number) => `${n} similar questions`,
    discoveryOften: "Often asked",
    discoveryMore: "See more questions",
    discoveryExpand: (n: number) => `Show ${n} more`,
    discoveryViews: ["Most asked", "Newest"],
    discoveryHelpful: "Helpful",
    discoveryHelpfulCount: (n: number) => `Helpful, ${n}`,
    discoveryUnlike: "Undo",
    privacy: "Details",
    modes: ["Understand", "What to read first"],
    modesLabel: "How you want to use this",
    viewsLabel: "How to see these questions",
  },
};
// 想明白 explains (understand); 从哪读起 picks what to read first (find). With the situation, on
// ask.lizheng.ai.
const MODES = ["ask", "find"] as const;
type Mode = (typeof MODES)[number];
// 别人在问什么 on the homepage: three questions until opened, then up to eight before the link.
const DISCOVERY_FOLDED = 3;
const DISCOVERY_OPEN = 8;

/** ask.lizheng.ai with the question in the fragment, which no server sees (ask-lizheng src/home-question.js). */
export function askPageUrl(question: string, mode: Mode) {
  return `${LINKS.askLizheng}#q=${encodeURIComponent(question.trim())}${mode === "find" ? "&mode=find" : ""}`;
}

export default function AskLizheng({ lang, children }: { lang: Lang; children?: ReactNode }) {
  const t = HOME_COPY[lang].ask;
  const c = COPY[lang];
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<Mode>("ask");
  const input = useRef<HTMLTextAreaElement>(null);
  // How the question box was last filled, sent with the hand-over: typed or example.
  const questionFrom = useRef("typed");
  // Which services write and check the answers, named in 说明 (/api/meta). Read once someone starts a
  // question or opens 说明, which also wakes the answer service before the question arrives there.
  const [services, setServices] = useState({ model: "", backup: "" });
  const warmed = useRef(false);
  const warm = () => {
    if (warmed.current) return;
    warmed.current = true;
    void fetch("/api/ask-lizheng/meta", { cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(30_000) })
      .then(response => (response.ok ? response.json() : null))
      .then(value => {
        if (value) setServices({ model: typeof value.model === "string" ? value.model : "", backup: typeof value.backup_model === "string" ? value.backup_model : "" });
      })
      .catch(() => {});
  };
  // The page's own voice; the situation is not kept (since 2026-10-04), and is only offered on ask.lizheng.ai.
  const qa = publicQaCopy(lang, { owner: "我", self: "我", answerer: answerService(services.model), backup: answerService(services.backup), contextKept: false });

  // Real questions others asked, published from Ops: 最常问 and 最近问, the same lists for everyone;
  // shown on the Chinese page in place of the examples. 最常问 comes first and the list stays folded
  // to three (2026-10-12, the user: fold it, and show the most common questions); 再看N个 opens up
  // to eight here, and only then 看更多问题 leads to the whole list on ask.lizheng.ai.
  const [questionLists, setQuestionLists] = useState<DiscoveryLists | null>(null);
  const [discoveryTab, setDiscoveryTab] = useState<DiscoveryView>("frequent");
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const discoveryShown = useMemo(() => (questionLists ? discoveryView(questionLists, discoveryTab) : []), [questionLists, discoveryTab]);
  const discoveryCards = discoveryShown.slice(0, discoveryOpen ? DISCOVERY_OPEN : DISCOVERY_FOLDED);
  const discoveryHidden = discoveryOpen ? 0 : Math.min(discoveryShown.length, DISCOVERY_OPEN) - discoveryCards.length;
  // Opened and still more in the list: link to the whole list on ask.lizheng.ai.
  const discoveryMore = discoveryHidden === 0 && discoveryShown.length > discoveryCards.length;
  // Chinese page: loading until the list arrives, then ready; none when it cannot be read or takes
  // past eight seconds, and only then the examples show in its place.
  const [discoveryState, setDiscoveryState] = useState<"loading" | "ready" | "none">(lang === "zh" ? "loading" : "none");
  const [publicTotal, setPublicTotal] = useState<number | null>(null);
  const discoveryList = useRef<HTMLDivElement>(null);
  const hasDiscovery = discoveryCards.length > 0;
  // Likes: what this browser liked (kept on this device), and the votes on their way, shown at once.
  const [likes, setLikes] = useState<LikeMemory>(readLikes);
  const [voting, setVoting] = useState<Record<string, { voted: boolean; likes: number }>>({});
  const votingNow = useRef(new Set<string>());

  // Anonymous usage of this page view for the owner's dashboard (lib/ask-usage): reading time, scroll
  // depth, whether this section and its list were seen, and which questions were opened. A question
  // is counted where it is asked, on ask.lizheng.ai, so it is never counted twice.
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
  useEffect(() => {
    if (lang !== "zh") { setDiscoveryState("none"); return; }
    setDiscoveryState(state => (state === "ready" ? state : "loading"));
    const controller = new AbortController();
    const late = setTimeout(() => setDiscoveryState(state => (state === "loading" ? "none" : state)), 8000);
    void discoveryLists(controller.signal).then(lists => {
      clearTimeout(late);
      if (controller.signal.aborted) return;
      if (!lists || (!lists.recent.length && !lists.frequent.length)) { setDiscoveryState("none"); return; }
      // 最常问 draws on both lists, so it has questions whenever either does: no fallback to 最近问.
      setPublicTotal(lists.total);
      setQuestionLists(lists);
      setDiscoveryState("ready");
    });
    return () => { clearTimeout(late); controller.abort(); };
  }, [lang]);

  // The question goes to ask.lizheng.ai in a new tab, as every other way out of this page does, and
  // leaves the box, so coming back and pressing 提问 again does not ask it twice; where a browser
  // opens no new tab (some in-app browsers), in this one.
  function submit(event?: FormEvent) {
    event?.preventDefault();
    const text = question.trim();
    if (!text) return;
    track("Ask Handoff", { surface: "home", from: questionFrom.current });
    const url = askPageUrl(text, mode);
    const page = window.open(url, "_blank");
    if (page) {
      page.opener = null;
      setQuestion("");
    } else window.location.assign(url);
    questionFrom.current = "typed";
  }
  function prefill(value: string) {
    questionFrom.current = "example";
    setQuestion(value);
    input.current?.focus();
  }
  const showTab = (view: DiscoveryView) => {
    if (view === discoveryTab) return;
    setDiscoveryTab(view);
    setDiscoveryOpen(false);
    track("Ask Discovery Sort", { surface: "home", sort: view });
  };
  const likeOf = (card: DiscoveryCard) => voting[card.public_id] || likeState(likes, card.public_id, card.likes);
  // Anyone may like, counted by browser. A like shows at once; if it does not go through, it goes back.
  const likeCard = async (card: DiscoveryCard) => {
    const id = card.public_id;
    if (votingNow.current.has(id)) return;
    votingNow.current.add(id);
    const shown = likeOf(card), vote = !shown.voted;
    setVoting(prev => ({ ...prev, [id]: { voted: vote, likes: Math.max(0, shown.likes + (vote ? 1 : -1)) } }));
    const result = await voteDiscovery(id, card.revision, vote);
    votingNow.current.delete(id);
    if (result) { setLikes(prev => rememberLike(prev, id, result)); track("Ask Discovery Vote", { surface: "home", vote }); }
    setVoting(prev => { const next = { ...prev }; delete next[id]; return next; });
  };
  // One question others asked: the question, which opens its own page on ask.lizheng.ai, and its like.
  // Picked for being asked often, the count of similar askings leads; otherwise the time does, and the
  // count, when it says more than this one question, sits below.
  const renderCard = (card: DiscoveryCard) => {
    const like = likeOf(card);
    const similar = card.similar_count ?? card.topic_question_count;
    const often = card.role === "common" && similar >= 2;
    return (
      <article key={card.public_id} className="lz-ask-qcard">
        <div className="lz-ask-qcard-row">
          <a className="lz-ask-qcard-head" href={discoveryLink(card.public_id, card.share_url)} {...EXTERNAL}
            onClick={() => { markUsage("d_open"); track("Ask Discovery Open", { surface: "home", view: discoveryTab }); }}>
            {often ? (
              <small className="often">{c.discoveryCount(similar)}</small>
            ) : card.asked_at ? (
              <time className={Date.now() - Date.parse(card.asked_at) < 3600000 ? "fresh" : undefined} dateTime={card.asked_at}
                title={new Date(card.asked_at).toLocaleString("zh-CN", { dateStyle: "long", timeStyle: "short" })}>
                {askedAgo(card.asked_at)}
              </time>
            ) : (
              <small>{c.discoveryOften}</small>
            )}
            <b>{card.question}</b>
            {!often && similar >= 2 && <span className="meta">{c.discoveryCount(similar)}</span>}
          </a>
          {/* A like, as Product Hunt and Reddit show one: an arrow over the count. */}
          <button type="button" className={like.voted ? "lz-ask-upvote on" : "lz-ask-upvote"} aria-pressed={like.voted}
            aria-label={like.likes > 0 ? c.discoveryHelpfulCount(like.likes) : c.discoveryHelpful}
            title={like.voted ? c.discoveryUnlike : c.discoveryHelpful} onClick={() => void likeCard(card)}>
            <span className="arrow" aria-hidden="true" />
            {like.likes > 0 && <span className="count">{like.likes}</span>}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="lz-ask-native rv" id="ask-lizheng">
      <div className="lz-ask-native-head grain">
        <div>
          <div className="eyebrow">{t.eyebrow}</div>
          <h2>{t.title}</h2>
        </div>
        <div>
          <p>
            <Phrases text={t.body} />
          </p>
          <a className="lz-link" href={LINKS.askLizheng} {...EXTERNAL}>
            {c.full} <Arrow />
          </a>
        </div>
      </div>
      {/* The box and 别人在问什么 sit side by side on wide screens. */}
      <div className="lz-ask-native-body">
        <div className="lz-ask-compose">
          <form onSubmit={submit} className="lz-ask-form">
            <div className="lz-ask-modes" role="group" aria-label={c.modesLabel}>
              {MODES.map((value, index) => (
                <button type="button" key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>
                  {c.modes[index]}
                </button>
              ))}
            </div>
            <p className="lz-ask-mode-hint">{mode === "find" ? c.hints.find : c.hints.ask}</p>
            <label className="sr-only" htmlFor="home-ask-question">
              {c.question}
            </label>
            <textarea
              ref={input}
              id="home-ask-question"
              value={question}
              onChange={event => { setQuestion(event.target.value); if (!event.target.value.trim()) questionFrom.current = "typed"; }}
              onFocus={warm}
              maxLength={2000}
              rows={3}
              placeholder={mode === "find" ? c.placeholderFind : c.placeholder}
              onKeyDown={event => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  submit();
                }
              }}
            />
            <div className="lz-ask-form-bottom">
              {c.where && <p className="lz-ask-where">{c.where}</p>}
              <button className="btn btn-green" disabled={!question.trim()} type="submit">
                {c.send}
              </button>
            </div>
          </form>
          <div className="lz-ask-meta">
            {/* The same words as by the box on ask.lizheng.ai, where the question is sent. */}
            <details className="lz-ask-about" onToggle={event => { if ((event.currentTarget as HTMLDetailsElement).open) warm(); }}>
              <summary>
                {qa.notice}
                <span>{c.privacy}</span>
              </summary>
              <div className="notice-parts">
                <p><b>{qa.title}</b></p>
                {qa.about.map(text => <p key={text}>{text}</p>)}
              </div>
            </details>
          </div>
        </div>
        {lang === "zh" && discoveryState !== "none" ? (
          <div className="lz-ask-discovery" ref={discoveryList}>
            <div className="lz-ask-discovery-head">
              <h3>{c.discoveryTitle}</h3>
              <p>{c.discoveryNote}</p>
              {publicTotal && <p className="lz-ask-discovery-live">{c.discoveryTotal(publicTotal)}</p>}
              {/* The same two lists for everyone; 看更多问题 opens the one shown on ask.lizheng.ai. */}
              <div className="lz-ask-discovery-views" role="group" aria-label={c.viewsLabel}>
                {(["frequent", "recent"] as const).map((view, i) => (
                  <button key={view} type="button" aria-pressed={discoveryTab === view} onClick={() => showTab(view)}>{c.discoveryViews[i]}</button>
                ))}
              </div>
            </div>
            <div className="lz-ask-discovery-list" aria-busy={!discoveryCards.length}>
              {/* While the questions load, the rows they will fill; never the examples first. */}
              {!discoveryCards.length && [0, 1, 2].map(i => <div key={i} className="lz-ask-qcard-placeholder" aria-hidden="true"><i /><b /></div>)}
              {discoveryCards.map(renderCard)}
              {discoveryHidden > 0 && (
                <button type="button" className="lz-ask-discovery-more lz-ask-discovery-expand"
                  onClick={() => {
                    setDiscoveryOpen(true);
                    // The button goes away; focus moves to the first question it opened.
                    requestAnimationFrame(() => discoveryList.current
                      ?.querySelectorAll<HTMLElement>(".lz-ask-discovery-list > .lz-ask-qcard > .lz-ask-qcard-row > .lz-ask-qcard-head")[DISCOVERY_FOLDED]
                      ?.focus());
                    track("Ask Discovery Expand", { surface: "home", view: discoveryTab });
                  }}>
                  {c.discoveryExpand(discoveryHidden)}
                </button>
              )}
              {discoveryMore && (
                <a className="lz-ask-discovery-more" href={`${LINKS.askLizheng}#${discoveryTab}`} {...EXTERNAL}
                  onClick={() => { markUsage("d_more"); track("Ask Discovery More", { surface: "home", view: discoveryTab }); }}>{c.discoveryMore} <Arrow /></a>
              )}
            </div>
          </div>
        ) : (
          <div className="lz-ask-starters">
            <p>{c.examples}</p>
            {t.examples.map(value => (
              <button key={value} type="button" onClick={() => prefill(value)}>
                {value}
              </button>
            ))}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
