import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import {
  DECK_CATEGORIES,
  DECK_LIBRARY,
  ENTERPRISE_DECKS,
  PUBLIC_TALK_DECKS,
  categoryDefinition,
  deckForLanguage,
  localized,
  type DeckCategory,
  type DeckCollection,
  type DeckEntry,
} from "@shared/deck-index";
import { DECKS_LANGUAGE_ALTERNATES, DECKS_PAGE_META } from "@shared/page-meta";
import { buildDeckLibraryStructuredData } from "@shared/structured-data";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";

type CategoryFilter = "all" | DeckCategory;
type ScopeFilter = "all" | DeckCollection;

const copy = {
  en: {
    eyebrow: "Talks & slides",
    h1: "Different work calls for different ways to use AI.",
    intro:
      "Explore the materials behind team trainings, strategic briefings, and public workshops. Each entry shows the audience, the problem, and the original deck or recording.",
    photoCaption: "DoorDash team offsite · Seattle",
    enterpriseMetric: "enterprise programs & briefings",
    publicMetric: "public talks & workshops",
    languageMetric: "working languages",
    indexEyebrow: "The library",
    indexTitle: "Find the material you need.",
    indexIntro:
      "The collection includes enterprise programs, briefings, and selected public workshops. Original deck language is preserved.",
    searchPlaceholder: "Search an organization, topic, or audience",
    all: "All",
    results: (count: number) => `${count} ${count === 1 ? "item" : "items"}`,
    noResults: "No deck matches that search.",
    clear: "Clear filters",
    openDeck: "Open deck",
    protectedDeck: "Password protected",
    readOnline: "Read online",
    playSlides: "Play slides",
    watchReplay: "Watch replay",
    source: "Source",
    publicCutPending: "Public cut in progress",
    zhDeck: "Chinese",
    enDeck: "English",
    enterprise: "Enterprise",
    publicTalk: "Public session",
    closeEyebrow: "Bring a real team problem",
    closeTitle: "What does your team need to do differently?",
    closeBody:
      "Tell me who is in the room, what they are responsible for, and what should become possible afterward. That is enough to start designing the right session.",
    email: "Discuss an enterprise program",
    homepage: "Back to lizheng.ai",
  },
  zh: {
    eyebrow: "演讲资料",
    h1: "不同的工作，需要不同的AI解法。",
    intro:
      "这里是企业培训、战略汇报和公开工作坊的材料。每一套都写清了面向谁、解决什么问题，可以直接打开课件或观看实录。",
    photoCaption: "DoorDash团队线下AI培训 · 西雅图",
    enterpriseMetric: "套企业定制材料",
    publicMetric: "场公开演讲与工作坊",
    languageMetric: "种工作语言",
    indexEyebrow: "全部材料",
    indexTitle: "找到你需要的那份材料。",
    indexIntro: "按主题和受众筛选；课件保留原始语言。",
    searchPlaceholder: "搜索客户、主题或受众",
    all: "全部",
    results: (count: number) => `${count}套材料`,
    noResults: "没有找到符合条件的材料。",
    clear: "清除筛选",
    openDeck: "打开课件",
    protectedDeck: "密码访问",
    readOnline: "看网页版",
    playSlides: "播放幻灯片",
    watchReplay: "看完整实录",
    source: "查看源码",
    publicCutPending: "公开版整理中",
    zhDeck: "中文",
    enDeck: "English",
    enterprise: "企业定制",
    publicTalk: "公开分享",
    closeEyebrow: "带着一个真实问题来",
    closeTitle: "你的团队，想把哪项工作做得更好？",
    closeBody:
      "告诉我台下是谁、他们正在负责什么，以及听完之后，希望他们具体能做成什么。知道这三件事，就可以开始设计。",
    email: "聊聊企业AI项目",
    homepage: "回到lizheng.ai",
  },
};

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Where a web version's slide pictures are: /decks/a/zh keeps them in deck-slides/a-zh. */
const slideFolder = (page: string) =>
  page.replace(/^\/decks\//, "").replaceAll("/", "-");

/** One way to a deck, in the row's last column. */
function Way({
  href,
  external = true,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <li>
      <a href={href} {...(external ? EXTERNAL : {})}>
        {children}
      </a>
    </li>
  );
}

/**
 * A deck as a row of the catalogue: who it was made for and when; what it says and for whom; and
 * its first slide, where it has a web version, and the ways to it (the web version on this site
 * first, then the slides, another language, the recording, the source).
 */
function DeckRow({ deck: originalDeck }: { deck: DeckEntry }) {
  const { lang } = useLanguage();
  const deck = deckForLanguage(originalDeck, lang);
  const t = copy[lang];
  const primaryLabel = deck.passwordProtected
    ? t.protectedDeck
    : deck.linkKind === "replay"
      ? t.watchReplay
      : t.openDeck;
  const secondaryLabel =
    deck.secondaryLinkKind === "replay" ? t.watchReplay : t.openDeck;
  const language = (code: string) => (code === "zh" ? t.zhDeck : t.enDeck);
  const title = deck.page ? (
    // The web version is a static page outside the React app, so a plain link.
    <a href={deck.page}>{deck.title}</a>
  ) : deck.href ? (
    <a href={deck.href} {...EXTERNAL}>
      {deck.title}
    </a>
  ) : (
    deck.title
  );

  return (
    <li className="deck">
      <div className="who">
        <b>{deck.organization}</b>
        <span>{deck.date.slice(0, 7).replace("-", ".")}</span>
        <span>
          {deck.collection === "enterprise" ? t.enterprise : t.publicTalk}
        </span>
      </div>
      <div className="what">
        <h3 lang={deck.language === "zh" ? "zh-CN" : "en"}>{title}</h3>
        <p className="take">{localized(deck.takeaway, lang)}</p>
        <p className="for">
          {localized(deck.audience, lang)}
          {deck.occasion ? ` · ${localized(deck.occasion, lang)}` : ""}
        </p>
      </div>
      <div className="side">
        {/* The deck's own first slide, where it has a web version on this site (the picture comes
            from the public slides: scripts/decks/capture_decks.mjs). */}
        {deck.page ? (
          <a className="thumb" href={deck.page} tabIndex={-1} aria-hidden="true">
            <img
              src={`/deck-slides/${slideFolder(deck.page)}/01.webp`}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
            />
          </a>
        ) : null}
      <ul className="ways">
        {deck.page ? (
          <>
            <Way href={deck.page} external={false}>
              {t.readOnline}
            </Way>
            {deck.href ? <Way href={deck.href}>{t.playSlides}</Way> : null}
          </>
        ) : deck.href ? (
          <Way href={deck.href}>{primaryLabel}</Way>
        ) : (
          <li className="pending">{t.publicCutPending}</li>
        )}
        {deck.alternateEdition?.page ? (
          <Way href={deck.alternateEdition.page} external={false}>
            {language(deck.alternateEdition.language)}
          </Way>
        ) : deck.alternateEdition ? (
          <Way href={deck.alternateEdition.href}>
            {language(deck.alternateEdition.language)}
          </Way>
        ) : null}
        {deck.secondaryHref ? (
          <Way href={deck.secondaryHref}>{secondaryLabel}</Way>
        ) : null}
        {deck.sourceHref ? (
          <Way href={deck.sourceHref}>{t.source}</Way>
        ) : null}
        <li className="lang">{language(deck.language)}</li>
      </ul>
      </div>
    </li>
  );
}

export default function Decks() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    return applyPageSeo({
      ...DECKS_PAGE_META[lang],
      locale: lang === "en" ? "en_US" : "zh_CN",
      alternates: DECKS_LANGUAGE_ALTERNATES,
      jsonLd: buildDeckLibraryStructuredData(lang),
    });
  }, [lang]);

  const filteredDecks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return DECK_LIBRARY.filter(deck => {
      if (scopeFilter !== "all" && deck.collection !== scopeFilter)
        return false;
      if (categoryFilter !== "all" && deck.category !== categoryFilter)
        return false;
      if (!normalized) return true;
      const category = categoryDefinition(deck.category);
      const haystack = [
        deck.organization,
        deck.title,
        deck.alternateEdition?.title,
        deck.date,
        localized(deck.audience, lang),
        localized(deck.takeaway, lang),
        localized(category.label, lang),
        ...deck.keywords,
      ]
        .join(" ")
        .toLocaleLowerCase();
      return haystack.includes(normalized);
    }).sort((left, right) => right.date.localeCompare(left.date));
  }, [categoryFilter, lang, query, scopeFilter]);

  const visibleCategories = DECK_CATEGORIES.filter(category =>
    filteredDecks.some(deck => deck.category === category.id)
  );

  const clearFilters = () => {
    setCategoryFilter("all");
    setScopeFilter("all");
    setQuery("");
  };

  const selectScope = (scope: ScopeFilter) => {
    setScopeFilter(scope);
    setCategoryFilter("all");
  };

  const tab = (
    key: string,
    selected: boolean,
    label: string,
    count: number | null,
    onSelect: () => void,
    disabled = false
  ) => (
    <button
      key={key}
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      {label}
      {count === null ? null : <small>{count}</small>}
    </button>
  );

  return (
    <div
      className={lang === "en" ? "lz-site lz-home lz-sub l-en" : "lz-site lz-home lz-sub"}
      lang={lang === "en" ? "en" : "zh-CN"}
    >
      <SiteHeader current="decks" />

      <main>
        {/* The head: what this page holds, and the room it comes from. */}
        <section className="page-head pic">
          <div className="wrap">
            <div>
              <div className="eyebrow">{t.eyebrow}</div>
              <h1>
                {lang === "zh" ? (
                  <>
                    <span className="phrase">不同的工作，</span>
                    <span className="phrase">需要不同的</span>
                    <span className="phrase">AI解法。</span>
                  </>
                ) : (
                  t.h1
                )}
              </h1>
              <p className="lede">{t.intro}</p>
              <p className="tally">
                <span>
                  <b>{ENTERPRISE_DECKS.length}</b>
                  {t.enterpriseMetric}
                </span>
                <span>
                  <b>{PUBLIC_TALK_DECKS.length}</b>
                  {t.publicMetric}
                </span>
                <span>
                  <b>2</b>
                  {t.languageMetric}
                </span>
              </p>
            </div>
            <figure>
              <img
                src="/english-network/doordash-ai-training.webp"
                srcSet="/english-network/doordash-ai-training-640.webp 640w, /english-network/doordash-ai-training-768.webp 768w, /english-network/doordash-ai-training.webp 1280w"
                sizes="(min-width: 861px) 44vw, 100vw"
                alt={t.photoCaption}
                width={1280}
                height={720}
                loading="eager"
                decoding="async"
              />
              <figcaption>{t.photoCaption}</figcaption>
            </figure>
          </div>
        </section>

        <section id="library" className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">{t.indexEyebrow}</div>
                <h2>{t.indexTitle}</h2>
              </div>
              <p>{t.indexIntro}</p>
            </div>

            {/* Search, then two rows of text tabs: whose it was, and what it is about. */}
            <div className="finder">
              <div className="search">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M20 20l-4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={t.searchPlaceholder}
                  aria-label={t.searchPlaceholder}
                />
                {query ? (
                  <button
                    type="button"
                    className="clear"
                    onClick={() => setQuery("")}
                  >
                    {t.clear}
                  </button>
                ) : null}
              </div>
              <div className="tabs" role="group">
                {tab("all", scopeFilter === "all", t.all, DECK_LIBRARY.length, () =>
                  selectScope("all")
                )}
                {tab(
                  "enterprise",
                  scopeFilter === "enterprise",
                  t.enterprise,
                  ENTERPRISE_DECKS.length,
                  () => selectScope("enterprise")
                )}
                {tab(
                  "public",
                  scopeFilter === "public",
                  t.publicTalk,
                  PUBLIC_TALK_DECKS.length,
                  () => selectScope("public")
                )}
              </div>
              <div className="tabs" role="group">
                {tab("all", categoryFilter === "all", t.all, null, () =>
                  setCategoryFilter("all")
                )}
                {DECK_CATEGORIES.map(category => {
                  const count = DECK_LIBRARY.filter(
                    deck =>
                      deck.category === category.id &&
                      (scopeFilter === "all" || deck.collection === scopeFilter)
                  ).length;
                  return tab(
                    category.id,
                    categoryFilter === category.id,
                    localized(category.label, lang),
                    count,
                    () => setCategoryFilter(category.id),
                    count === 0
                  );
                })}
                <span className="count" aria-live="polite">
                  {t.results(filteredDecks.length)}
                </span>
              </div>
            </div>

            {visibleCategories.length ? (
              visibleCategories.map(category => {
                const decks = filteredDecks.filter(
                  deck => deck.category === category.id
                );
                return (
                  <section key={category.id} id={category.id} className="deck-group">
                    <div className="group-head">
                      <h3>{localized(category.label, lang)}</h3>
                      <p>{localized(category.description, lang)}</p>
                    </div>
                    <ul className="decks">
                      {decks.map(deck => (
                        <DeckRow key={deck.id} deck={deck} />
                      ))}
                    </ul>
                  </section>
                );
              })
            ) : (
              <div className="no-decks">
                <p>{t.noResults}</p>
                <button type="button" className="lz-expand" onClick={clearFilters}>
                  {t.clear}
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">{t.closeEyebrow}</div>
                <h2>{t.closeTitle}</h2>
              </div>
              <div>
                <p className="say first">{t.closeBody}</p>
                <div className="cta-row">
                  <a
                    className="btn btn-green"
                    href="mailto:yz@superlinear.academy?subject=Enterprise%20AI%20program"
                  >
                    {t.email}
                  </a>
                  <Link className="lz-link" href={withLanguage("/", lang)}>
                    {t.homepage} <i aria-hidden="true">→</i>
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
