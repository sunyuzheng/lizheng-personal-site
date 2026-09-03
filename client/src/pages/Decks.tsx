import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  DECK_CATEGORIES,
  DECK_LIBRARY,
  ENTERPRISE_DECKS,
  PUBLIC_TALK_DECKS,
  categoryDefinition,
  localized,
  type DeckCategory,
  type DeckCollection,
  type DeckEntry,
} from "@shared/deck-index";
import { DECKS_LANGUAGE_ALTERNATES, DECKS_PAGE_META } from "@shared/page-meta";
import { buildDeckLibraryStructuredData } from "@shared/structured-data";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ExternalLink,
  FileClock,
  Github,
  Layers3,
  Mail,
  PlayCircle,
  Search,
  X,
} from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";

type CategoryFilter = "all" | DeckCategory;
type ScopeFilter = "all" | DeckCollection;

const copy = {
  en: {
    section: "Deck index",
    collaboration: "Enterprise work",
    eyebrow: "YUZHENG SUN · ENTERPRISE AI DECKS · 2026",
    h1: "I don't take one generic AI talk from company to company.",
    intro:
      "I design enterprise AI training, strategic briefings, and hands-on workshops around the team in the room. Engineering leaders, data analysts, portfolio managers, cross-functional teams, and founders face different constraints, so every deck here was built around a specific organization, workflow, and decision.",
    photoCaption: "DoorDash team offsite · Seattle",
    enterpriseMetric: "enterprise programs & briefings",
    publicMetric: "public talks & workshops",
    languageMetric: "working languages",
    thesisEyebrow: "ONE THROUGH-LINE · MANY REAL ROOMS",
    thesisTitle:
      "AI makes building easier. The hard part is knowing what is worth building—and making it last.",
    thesisBody:
      "That belief becomes a different program in every organization. The work starts by finding the real constraint, then turning AI into a workflow the team can inspect, own, and improve.",
    indexEyebrow: "THE LIBRARY",
    indexTitle: "Find a deck by problem, team, or room.",
    indexIntro:
      "The collection includes enterprise programs, briefings, and selected public workshops. Original deck language is preserved.",
    searchPlaceholder: "Search an organization, topic, or audience",
    all: "All",
    results: (count: number) => `${count} ${count === 1 ? "item" : "items"}`,
    noResults: "No deck matches that search.",
    clear: "Clear filters",
    openDeck: "Open deck",
    watchReplay: "Watch replay",
    source: "Source",
    publicCutPending: "Public cut in progress",
    zhDeck: "Chinese",
    enDeck: "English",
    enterprise: "Enterprise",
    publicTalk: "Public session",
    closeEyebrow: "BRING A REAL TEAM PROBLEM",
    closeTitle: "A useful AI program starts with the work—not the tool list.",
    closeBody:
      "Tell me who is in the room, what they are responsible for, and what should become possible afterward. That is enough to start designing the right session.",
    email: "Discuss an enterprise program",
    homepage: "Back to lizheng.ai",
  },
  zh: {
    section: "Deck索引",
    collaboration: "企业合作",
    eyebrow: "课代表立正 · 企业AI DECKS · 2026",
    h1: "我不拿一套通用课，到处讲。",
    intro:
      "我做企业AI培训、战略汇报和工作坊，通常先问：这支团队到底卡在哪里？研发负责人、数据分析师、投资经理、非研发团队和创业者面对的问题不同，所以这里每一套课件，都围绕具体团队、业务场景和要解决的问题重新设计。",
    photoCaption: "DoorDash团队线下AI培训 · 西雅图",
    enterpriseMetric: "套企业定制材料",
    publicMetric: "场公开演讲与工作坊",
    languageMetric: "种工作语言",
    thesisEyebrow: "一条主线 · 很多种现场",
    thesisTitle:
      "AI让构建更容易。真正难的是，知道什么值得做，并把它做成能留下来的东西。",
    thesisBody:
      "到了不同组织里，这句话会变成完全不同的课。先找到团队真正卡住的地方，再把AI做进一条能检查、能接手、能持续改进的工作流。",
    indexEyebrow: "全部材料",
    indexTitle: "按问题、团队或场合，找到那套deck。",
    indexIntro:
      "这里收录企业培训、定制方案，也收录一部分公开演讲和工作坊。deck保留原始语言。",
    searchPlaceholder: "搜索客户、主题或受众",
    all: "全部",
    results: (count: number) => `${count}套材料`,
    noResults: "没有找到符合条件的deck。",
    clear: "清除筛选",
    openDeck: "打开deck",
    watchReplay: "看完整实录",
    source: "查看源码",
    publicCutPending: "公开版整理中",
    zhDeck: "中文",
    enDeck: "English",
    enterprise: "企业定制",
    publicTalk: "公开分享",
    closeEyebrow: "带着一个真实问题来",
    closeTitle: "一场有用的AI培训，应该从工作开始，不是从工具清单开始。",
    closeBody:
      "告诉我台下是谁、他们正在负责什么，以及听完之后，希望他们具体能做成什么。知道这三件事，就可以开始设计。",
    email: "聊聊企业AI项目",
    homepage: "回到lizheng.ai",
  },
};

function DeckCover({
  deck,
  compact = false,
}: {
  deck: DeckEntry;
  compact?: boolean;
}) {
  const { lang } = useLanguage();
  const category = categoryDefinition(deck.category);
  const style = {
    "--deck-accent": deck.accent,
    borderColor: `${deck.accent}55`,
    background: `linear-gradient(145deg, ${deck.accent}24 0%, rgba(10,14,24,0.98) 62%)`,
  } as CSSProperties;

  return (
    <div
      className={cn(
        "group/cover relative aspect-[16/10] overflow-hidden rounded-xl border",
        compact && "rounded-lg"
      )}
      style={style}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.09) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom left, black, transparent 74%)",
        }}
      />
      <div
        className="absolute -right-[12%] -top-[20%] h-[72%] w-[52%] rounded-full border opacity-35 transition duration-500 group-hover/cover:scale-110"
        style={{
          borderColor: deck.accent,
          boxShadow: `0 0 80px ${deck.accent}22`,
        }}
      />
      <div
        className="absolute bottom-0 right-0 h-[36%] w-[52%] -skew-x-12 opacity-15"
        style={{ backgroundColor: deck.accent }}
      />

      <div
        className={cn(
          "relative flex h-full flex-col",
          compact ? "p-4" : "p-5 sm:p-6"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: deck.accent }}
            >
              {deck.organization}
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
              {deck.date.slice(0, 7)} · {deck.language === "zh" ? "ZH" : "EN"}
            </p>
          </div>
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor: deck.accent,
              boxShadow: `0 0 20px ${deck.accent}`,
            }}
          />
        </div>

        <div className="mt-auto max-w-[88%]">
          <h3
            className={cn(
              "font-semibold leading-[1.15] text-white [text-wrap:balance]",
              compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl"
            )}
          >
            {compact && deck.shortTitle ? deck.shortTitle : deck.title}
          </h3>
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
            {localized(category.label, lang)}
          </p>
        </div>
      </div>
    </div>
  );
}

function DeckCard({ deck }: { deck: DeckEntry }) {
  const { lang } = useLanguage();
  const t = copy[lang];
  const category = categoryDefinition(deck.category);
  const primaryLabel = deck.linkKind === "replay" ? t.watchReplay : t.openDeck;
  const PrimaryIcon = deck.linkKind === "replay" ? PlayCircle : ExternalLink;
  const secondaryLabel =
    deck.secondaryLinkKind === "replay" ? t.watchReplay : t.openDeck;
  const SecondaryIcon =
    deck.secondaryLinkKind === "replay" ? PlayCircle : ExternalLink;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.055]">
      {deck.href ? (
        <a
          href={deck.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <DeckCover deck={deck} />
        </a>
      ) : (
        <DeckCover deck={deck} />
      )}

      <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.13em]">
          <span style={{ color: deck.accent }}>
            {localized(category.label, lang)}
          </span>
          <span className="text-white/20">/</span>
          <span className="text-white/45">
            {deck.collection === "enterprise" ? t.enterprise : t.publicTalk}
          </span>
          <span className="text-white/20">/</span>
          <span className="text-white/45">
            {deck.language === "zh" ? t.zhDeck : t.enDeck}
          </span>
        </div>

        <p className="mt-4 text-[15px] leading-7 text-zinc-300">
          {localized(deck.takeaway, lang)}
        </p>
        <p className="mt-4 text-xs leading-5 text-zinc-500">
          {localized(deck.audience, lang)}
          {deck.occasion ? ` · ${localized(deck.occasion, lang)}` : ""}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
          {deck.href ? (
            <a
              href={deck.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white transition hover:text-white"
            >
              {primaryLabel}
              <PrimaryIcon className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-superlinear-on-dark">
              {t.publicCutPending}
              <FileClock className="h-3.5 w-3.5" />
            </span>
          )}
          {deck.secondaryHref ? (
            <a
              href={deck.secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-white"
            >
              {secondaryLabel}
              <SecondaryIcon className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {deck.sourceHref ? (
            <a
              href={deck.sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-zinc-300"
            >
              <Github className="h-3.5 w-3.5" />
              {t.source}
            </a>
          ) : null}
        </div>
      </div>
    </article>
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

  return (
    <div className="min-h-screen overflow-x-clip bg-[#090D16] text-zinc-100 selection:bg-superlinear selection:text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090D16]/82 backdrop-blur-xl">
        <div className="container flex items-center justify-between gap-3 py-4">
          <a
            href={
              lang === "en"
                ? "https://www.lizheng.ai/"
                : "https://www.lizheng.ai/zh"
            }
            className="flex min-w-0 items-center gap-3 text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
              </div>
              <div className="hidden text-[11px] text-zinc-500 min-[360px]:block">
                {t.section}
              </div>
            </div>
          </a>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div
              className="inline-flex shrink-0 items-center overflow-hidden rounded-full border border-white/15 bg-white/5"
              role="group"
              aria-label="Language"
            >
              <a
                href="/en/decks"
                aria-current={lang === "en" ? "page" : undefined}
                className={cn(
                  "px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition",
                  lang === "en"
                    ? "bg-superlinear text-white"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                EN
              </a>
              <a
                href="/decks"
                aria-current={lang === "zh" ? "page" : undefined}
                className={cn(
                  "px-2 py-1 text-[11px] font-semibold transition",
                  lang === "zh"
                    ? "bg-superlinear text-white"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                中文
              </a>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-superlinear text-white hover:bg-superlinear-deep"
            >
              <a
                href={
                  lang === "en"
                    ? "https://www.lizheng.ai/collab"
                    : "https://www.lizheng.ai/zh/collab"
                }
              >
                <Building2 className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">{t.collaboration}</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative border-b border-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(35,131,67,0.13),transparent_32%),radial-gradient(circle_at_90%_12%,rgba(103,232,249,0.08),transparent_30%)]" />
          <div className="container relative grid gap-12 py-16 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-16 lg:py-24">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-superlinear-on-dark">
                {t.eyebrow}
              </p>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.04] text-white [text-wrap:balance] sm:text-5xl lg:text-7xl">
                {t.h1}
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                {t.intro}
              </p>

              <div className="mt-10 grid max-w-2xl grid-cols-3 border-y border-white/10">
                <div className="py-5 pr-3">
                  <p className="text-3xl font-semibold text-white sm:text-4xl">
                    {ENTERPRISE_DECKS.length}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-zinc-500 sm:text-xs">
                    {t.enterpriseMetric}
                  </p>
                </div>
                <div className="border-x border-white/10 px-3 py-5 sm:px-6">
                  <p className="text-3xl font-semibold text-white sm:text-4xl">
                    {PUBLIC_TALK_DECKS.length}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-zinc-500 sm:text-xs">
                    {t.publicMetric}
                  </p>
                </div>
                <div className="py-5 pl-3 sm:pl-6">
                  <p className="text-3xl font-semibold text-white sm:text-4xl">
                    2
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-zinc-500 sm:text-xs">
                    {t.languageMetric}
                  </p>
                </div>
              </div>
            </div>

            <figure className="relative lg:translate-y-3">
              <div className="absolute -inset-5 border border-white/[0.04]" />
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-[0_32px_90px_rgba(0,0,0,.42)]">
                <img
                  src="/english-network/doordash-ai-training.webp"
                  srcSet="/english-network/doordash-ai-training-640.webp 640w, /english-network/doordash-ai-training-768.webp 768w, /english-network/doordash-ai-training.webp 1280w"
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  alt={t.photoCaption}
                  className="aspect-[4/3] w-full object-cover grayscale-[0.18] lg:aspect-[5/4]"
                  width={1280}
                  height={720}
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent" />
                <figcaption className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-4 p-5 sm:p-6">
                  <span className="text-xs font-medium text-white/80">
                    {t.photoCaption}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-superlinear-on-dark">
                    REAL ROOM · REAL WORK
                  </span>
                </figcaption>
              </div>
              <div className="absolute -bottom-7 -left-4 hidden w-[46%] -rotate-3 shadow-2xl sm:block lg:-left-8">
                <DeckCover
                  deck={
                    DECK_LIBRARY.find(
                      deck => deck.id === "binance-data-analytics-ai"
                    )!
                  }
                  compact
                />
              </div>
              <div className="absolute -bottom-10 -right-4 hidden w-[44%] rotate-3 shadow-2xl sm:block lg:-right-7">
                <DeckCover
                  deck={
                    DECK_LIBRARY.find(
                      deck => deck.id === "linkedin-engineering-ai"
                    )!
                  }
                  compact
                />
              </div>
            </figure>
          </div>
        </section>

        <section className="border-b border-white/10 bg-white/[0.018]">
          <div className="container grid gap-8 py-14 md:grid-cols-[0.7fr_1.3fr] md:items-start md:py-20">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-superlinear-on-dark">
              {t.thesisEyebrow}
            </p>
            <div>
              <h2 className="max-w-3xl text-3xl font-semibold leading-[1.12] text-white [text-wrap:balance] md:text-5xl">
                {t.thesisTitle}
              </h2>
              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
                {t.thesisBody}
              </p>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-superlinear-on-dark">
                {t.indexEyebrow}
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-white md:text-5xl">
                {t.indexTitle}
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-zinc-400 lg:justify-self-end md:text-base">
              {t.indexIntro}
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#090D16] pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-superlinear-on-dark/60"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t.clear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-b border-white/10 pb-4">
              <button
                type="button"
                onClick={() => selectScope("all")}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-medium transition",
                  scopeFilter === "all"
                    ? "border-superlinear-on-dark bg-superlinear text-white"
                    : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
                )}
              >
                {t.all} · {DECK_LIBRARY.length}
              </button>
              <button
                type="button"
                onClick={() => selectScope("enterprise")}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-medium transition",
                  scopeFilter === "enterprise"
                    ? "border-superlinear-on-dark bg-superlinear text-white"
                    : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
                )}
              >
                {t.enterprise} · {ENTERPRISE_DECKS.length}
              </button>
              <button
                type="button"
                onClick={() => selectScope("public")}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-medium transition",
                  scopeFilter === "public"
                    ? "border-superlinear-on-dark bg-superlinear text-white"
                    : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
                )}
              >
                {t.publicTalk} · {PUBLIC_TALK_DECKS.length}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-medium transition",
                  categoryFilter === "all"
                    ? "border-white/35 bg-white/10 text-white"
                    : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
                )}
              >
                {t.all}
              </button>
              {DECK_CATEGORIES.map(category => {
                const count = DECK_LIBRARY.filter(
                  deck =>
                    deck.category === category.id &&
                    (scopeFilter === "all" || deck.collection === scopeFilter)
                ).length;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryFilter(category.id)}
                    disabled={count === 0}
                    className={cn(
                      "rounded-full border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-35",
                      categoryFilter === category.id
                        ? "border-white/35 bg-white/10 text-white"
                        : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
                    )}
                  >
                    {localized(category.label, lang)} · {count}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
              <Layers3 className="h-3.5 w-3.5" />
              {t.results(filteredDecks.length)}
            </div>
          </div>

          {visibleCategories.length ? (
            <div className="mt-16 space-y-20">
              {visibleCategories.map(category => {
                const decks = filteredDecks.filter(
                  deck => deck.category === category.id
                );
                return (
                  <section key={category.id} id={category.id}>
                    <div className="grid gap-4 border-t border-white/10 pt-6 md:grid-cols-[0.72fr_1.28fr] md:items-start">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-zinc-600">
                          {String(
                            DECK_CATEGORIES.findIndex(
                              item => item.id === category.id
                            ) + 1
                          ).padStart(2, "0")}
                        </span>
                        <h3 className="text-xl font-semibold text-white md:text-2xl">
                          {localized(category.label, lang)}
                        </h3>
                      </div>
                      <p className="max-w-2xl text-sm leading-7 text-zinc-500">
                        {localized(category.description, lang)}
                      </p>
                    </div>
                    <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {decks.map(deck => (
                        <DeckCard key={deck.id} deck={deck} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="mt-16 rounded-2xl border border-dashed border-white/15 py-16 text-center">
              <p className="text-zinc-400">{t.noResults}</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-superlinear-on-dark hover:text-white"
              >
                {t.clear}
              </button>
            </div>
          )}
        </section>

        <section className="border-t border-white/10 bg-[linear-gradient(135deg,rgba(35,131,67,.10),rgba(9,13,22,0)_48%)]">
          <div className="container py-16 md:py-24">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-superlinear-on-dark">
              {t.closeEyebrow}
            </p>
            <h2 className="mt-5 max-w-4xl text-3xl font-semibold leading-[1.12] text-white [text-wrap:balance] md:text-5xl">
              {t.closeTitle}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
              {t.closeBody}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-superlinear text-white hover:bg-superlinear-deep"
              >
                <a href="mailto:yz@superlinear.academy?subject=Enterprise%20AI%20program">
                  <Mail className="mr-2 h-4 w-4" />
                  {t.email}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-white"
              >
                <a
                  href={
                    lang === "en"
                      ? "https://www.lizheng.ai/"
                      : "https://www.lizheng.ai/zh"
                  }
                >
                  {t.homepage}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
