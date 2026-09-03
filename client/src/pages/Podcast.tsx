import { Button } from "@/components/ui/button";
import { applyPageSeo } from "@/lib/seo";
import { PODCAST_PAGE_META } from "@shared/page-meta";
import { buildPodcastStructuredData } from "@shared/structured-data";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CirclePlay,
  Clock3,
  ExternalLink,
  Headphones,
  LoaderCircle,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Rss,
  Search,
  ScrollText,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const PUBLIC_FEED_URL = "https://feeds.transistor.fm/kedaibiao";
const SHOW_COVER = "/podcast/avatar.png";

const PLATFORMS = [
  {
    name: "Apple Podcasts",
    href: "https://podcasts.apple.com/us/podcast/%E8%AF%BE%E4%BB%A3%E8%A1%A8%E7%AB%8B%E6%AD%A3/id1859339631",
    Icon: Headphones,
  },
  {
    name: "Spotify",
    href: "https://open.spotify.com/show/4YoFrN0YArKCIqZq46yHr3",
    Icon: Radio,
  },
  {
    name: "小宇宙",
    href: "https://www.xiaoyuzhoufm.com/podcast/6934fbe84ef12f9fe94eed5f",
    Icon: CirclePlay,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@kedaibiao",
    Icon: Youtube,
  },
] as const;

interface PodcastEpisode {
  id: string;
  title: string;
  episodeNumber: number | null;
  description: string;
  publishedAt: string;
  durationSeconds: number | null;
  artwork: string;
  audioUrl: string;
  shareUrl: string;
  transcriptUrl: string | null;
}

interface PodcastFeed {
  title: string;
  description: string;
  cover: string;
  episodes: PodcastEpisode[];
  lastBuildAt: string | null;
}

type FeedState =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: PodcastFeed; error: null }
  | { status: "error"; data: null; error: string };

function textByTag(parent: Document | Element, tagName: string) {
  return parent.getElementsByTagName(tagName)[0]?.textContent?.trim() || "";
}

function attrByTag(
  parent: Document | Element,
  tagName: string,
  attribute: string
) {
  return (
    parent.getElementsByTagName(tagName)[0]?.getAttribute(attribute)?.trim() ||
    ""
  );
}

function parseFeed(source: string): PodcastFeed {
  const xml = new DOMParser().parseFromString(source, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("RSS格式无法解析");

  const channel = xml.getElementsByTagName("channel")[0];
  if (!channel) throw new Error("RSS中没有找到节目资料");

  const cover =
    attrByTag(channel, "itunes:image", "href") ||
    textByTag(channel, "url") ||
    SHOW_COVER;

  const episodes = Array.from(xml.getElementsByTagName("item"))
    .map(item => {
      const publishedAt = textByTag(item, "pubDate");
      const duration = Number(textByTag(item, "itunes:duration"));
      const episodeNumber = Number(textByTag(item, "itunes:episode"));

      return {
        id: textByTag(item, "guid") || textByTag(item, "link"),
        title: textByTag(item, "title"),
        episodeNumber:
          Number.isFinite(episodeNumber) && episodeNumber > 0
            ? episodeNumber
            : null,
        description:
          textByTag(item, "itunes:summary") || textByTag(item, "description"),
        publishedAt,
        durationSeconds:
          Number.isFinite(duration) && duration > 0 ? duration : null,
        artwork: attrByTag(item, "itunes:image", "href") || cover || SHOW_COVER,
        audioUrl: attrByTag(item, "enclosure", "url"),
        shareUrl: textByTag(item, "link"),
        transcriptUrl: attrByTag(item, "podcast:transcript", "url") || null,
      } satisfies PodcastEpisode;
    })
    .filter(episode => episode.id && episode.title && episode.audioUrl)
    .sort((left, right) => {
      const dateDifference =
        Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
      if (Number.isFinite(dateDifference) && dateDifference !== 0) {
        return dateDifference;
      }
      return (right.episodeNumber || 0) - (left.episodeNumber || 0);
    });

  if (!episodes.length) throw new Error("RSS中暂时没有可播放的单集");

  return {
    title: textByTag(channel, "title") || "课代表立正",
    description:
      textByTag(channel, "itunes:summary") || textByTag(channel, "description"),
    cover,
    episodes,
    lastBuildAt: textByTag(channel, "lastBuildDate") || null,
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatDuration(value: number | null) {
  if (!value) return "";
  const hours = Math.floor(value / 3600);
  const minutes = Math.max(1, Math.round((value % 3600) / 60));
  return hours ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
}

function compactDescription(value: string) {
  return value
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function Artwork({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  className: string;
  eager?: boolean;
}) {
  return (
    <img
      src={src || SHOW_COVER}
      alt={alt}
      className={className}
      width={560}
      height={560}
      loading={eager ? "eager" : "lazy"}
      onError={event => {
        const fallback = new URL(SHOW_COVER, window.location.origin).href;
        if (event.currentTarget.src !== fallback) {
          event.currentTarget.src = SHOW_COVER;
        }
      }}
    />
  );
}

function EpisodeMeta({ episode }: { episode: PodcastEpisode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
      {episode.episodeNumber && (
        <span className="font-mono text-superlinear-on-dark">
          E{episode.episodeNumber}
        </span>
      )}
      <span className="inline-flex items-center gap-1">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
        {formatDate(episode.publishedAt)}
      </span>
      {episode.durationSeconds && (
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDuration(episode.durationSeconds)}
        </span>
      )}
    </div>
  );
}

export default function Podcast() {
  const [feedState, setFeedState] = useState<FeedState>({
    status: "loading",
    data: null,
    error: null,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [activeEpisode, setActiveEpisode] = useState<PodcastEpisode | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return applyPageSeo({
      ...PODCAST_PAGE_META,
      type: "website",
      locale: "zh_CN",
      imageAlt: "课代表立正Podcast节目封面",
      jsonLd: buildPodcastStructuredData(),
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const feedDataUrl = ["localhost", "127.0.0.1"].includes(
      window.location.hostname
    )
      ? PUBLIC_FEED_URL
      : "/podcast-feed.xml";
    setFeedState({ status: "loading", data: null, error: null });

    fetch(feedDataUrl, {
      signal: controller.signal,
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    })
      .then(response => {
        if (!response.ok) throw new Error(`RSS返回${response.status}`);
        return response.text();
      })
      .then(source => {
        setFeedState({
          status: "ready",
          data: parseFeed(source),
          error: null,
        });
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setFeedState({
          status: "error",
          data: null,
          error:
            error instanceof Error ? error.message : "暂时无法读取节目资料",
        });
      });

    return () => controller.abort();
  }, [refreshKey]);

  useEffect(() => setVisibleCount(12), [query]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !activeEpisode) return;
    player.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
  }, [activeEpisode]);

  const feed = feedState.data;
  const latestEpisode = feed?.episodes[0] || null;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEpisodes = useMemo(() => {
    if (!feed) return [];
    if (!normalizedQuery) return feed.episodes;
    return feed.episodes.filter(episode =>
      [
        episode.title,
        episode.description,
        episode.episodeNumber ? `e${episode.episodeNumber}` : "",
        episode.episodeNumber ? String(episode.episodeNumber) : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [feed, normalizedQuery]);
  const visibleEpisodes = filteredEpisodes.slice(0, visibleCount);

  const playEpisode = (episode: PodcastEpisode) => {
    if (activeEpisode?.id !== episode.id) {
      setActiveEpisode(episode);
      return;
    }
    const player = playerRef.current;
    if (!player) return;
    if (player.paused) void player.play();
    else player.pause();
  };

  return (
    <div
      className={`min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100 ${
        activeEpisode ? "pb-36 md:pb-28" : ""
      }`}
    >
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/88 backdrop-blur-xl">
        <div className="container flex h-[68px] items-center justify-between gap-4">
          <a
            href="https://www.lizheng.ai"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-zinc-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">返回lizheng.ai</span>
            <span className="sm:hidden">主页</span>
          </a>

          <a
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-center"
            aria-label="课代表立正Podcast首页"
          >
            <span className="block text-sm font-semibold text-white">
              课代表立正
            </span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-superlinear-on-dark">
              Podcast
            </span>
          </a>

          <a
            href={PUBLIC_FEED_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-3 text-xs font-medium text-zinc-300 transition hover:border-superlinear-on-dark/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark"
          >
            <Rss className="h-3.5 w-3.5" aria-hidden="true" />
            RSS
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10">
          <div className="absolute inset-0">
            <img
              src={SHOW_COVER}
              alt=""
              aria-hidden="true"
              className="h-full w-full scale-110 object-cover opacity-20 blur-3xl"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,15,26,0.96)_0%,rgba(11,15,26,0.86)_50%,rgba(11,15,26,0.96)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_35%,rgba(35,131,67,0.14),transparent_38%)]" />
          </div>

          <div className="container relative z-10 grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(260px,400px)_1fr] lg:items-center lg:gap-16 lg:py-20">
            <div className="mx-auto w-full max-w-[340px] lg:max-w-[400px]">
              <div className="relative">
                <div className="absolute -inset-5 rounded-[2.2rem] bg-superlinear/15 blur-2xl" />
                <Artwork
                  src={feed?.cover || SHOW_COVER}
                  alt="课代表立正Podcast节目封面"
                  className="relative aspect-square w-full rounded-[1.75rem] border border-white/15 object-cover shadow-2xl shadow-black/50"
                  eager
                />
                <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-2 text-xs font-medium text-white backdrop-blur-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-superlinear-online opacity-75 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-superlinear-online" />
                  </span>
                  RSS实时同步
                </div>
              </div>
            </div>

            <div className="max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-superlinear-on-dark">
                Official Podcast
              </p>
              <h1 className="mt-5 text-5xl font-semibold tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                课代表立正
              </h1>
              <p className="mt-5 text-xl font-medium leading-8 text-superlinear-pale sm:text-2xl">
                真正把事做成的人，到底做对了什么？
              </p>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                《课代表立正》是一档中文深度访谈。200+场对话里，我和AI研究者、科技创业者、一线管理者与各领域实践者反复追问一件事：一件事究竟是怎样被做成的。
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {PLATFORMS.map(({ name, href, Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-zinc-200 transition hover:-translate-y-0.5 hover:border-superlinear-on-dark/40 hover:bg-superlinear/10 hover:text-superlinear-pale focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark motion-reduce:transform-none"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {name}
                  </a>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
                <span>
                  {feed
                    ? `RSS收录${feed.episodes.length}期`
                    : "正在读取官方RSS"}
                </span>
                <span>持续更新</span>
                <span>中文</span>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-12 sm:py-16">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-superlinear-on-dark">
                Latest Episode
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                最新一期
              </h2>
            </div>
            {feed?.lastBuildAt && (
              <p className="hidden text-xs text-zinc-600 sm:block">
                RSS更新于{formatDate(feed.lastBuildAt)}
              </p>
            )}
          </div>

          {feedState.status === "loading" && (
            <div
              className="grid animate-pulse gap-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] md:grid-cols-[minmax(260px,390px)_1fr]"
              aria-label="正在读取最新一期"
            >
              <div className="aspect-square bg-white/10" />
              <div className="space-y-5 p-6 sm:p-9">
                <div className="h-4 w-40 rounded bg-white/10" />
                <div className="h-9 max-w-xl rounded bg-white/10" />
                <div className="h-20 max-w-2xl rounded bg-white/10" />
                <div className="h-11 w-36 rounded-full bg-white/10" />
              </div>
            </div>
          )}

          {feedState.status === "error" && (
            <div
              role="alert"
              className="rounded-3xl border border-superlinear-on-dark/20 bg-superlinear/[0.06] p-8 text-center"
            >
              <p className="text-base font-medium text-superlinear-pale">
                暂时没有读到官方RSS
              </p>
              <p className="mt-2 text-sm text-zinc-400">{feedState.error}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button
                  type="button"
                  onClick={() => setRefreshKey(value => value + 1)}
                  className="min-h-11 bg-superlinear text-white hover:bg-superlinear-deep"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重新同步
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="min-h-11 border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                  <a
                    href={PUBLIC_FEED_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    打开RSS
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          {latestEpisode && (
            <article className="group grid overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] shadow-2xl shadow-black/20 md:grid-cols-[minmax(260px,390px)_1fr]">
              <div className="relative aspect-square overflow-hidden">
                <Artwork
                  src={latestEpisode.artwork}
                  alt={`${latestEpisode.title}单集封面`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none"
                  eager
                />
                <button
                  type="button"
                  onClick={() => playEpisode(latestEpisode)}
                  className="absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/25 focus-visible:bg-black/25 focus-visible:outline-none"
                  aria-label={`播放${latestEpisode.title}`}
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-xl backdrop-blur-md transition group-hover:scale-105 motion-reduce:transform-none">
                    {activeEpisode?.id === latestEpisode.id && isPlaying ? (
                      <Pause
                        className="h-6 w-6 fill-current"
                        aria-hidden="true"
                      />
                    ) : (
                      <Play
                        className="ml-1 h-6 w-6 fill-current"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                </button>
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                <EpisodeMeta episode={latestEpisode} />
                <h3 className="mt-5 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                  {latestEpisode.title}
                </h3>
                <p className="mt-5 line-clamp-4 max-w-2xl text-sm leading-7 text-zinc-400">
                  {compactDescription(latestEpisode.description)}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => playEpisode(latestEpisode)}
                    className="min-h-11 bg-superlinear text-white hover:bg-superlinear-deep"
                  >
                    {activeEpisode?.id === latestEpisode.id && isPlaying ? (
                      <Pause className="mr-2 h-4 w-4 fill-current" />
                    ) : (
                      <Play className="mr-2 h-4 w-4 fill-current" />
                    )}
                    {activeEpisode?.id === latestEpisode.id && isPlaying
                      ? "暂停"
                      : "立即播放"}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="min-h-11 border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                  >
                    <a
                      href={latestEpisode.shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      单集详情
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          )}
        </section>

        <section className="border-t border-white/10 bg-[#080B12]">
          <div className="container py-12 sm:py-16">
            <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-superlinear-on-dark">
                  All Episodes
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                  全部单集
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  默认按RSS发布日期从新到旧排列。历史修复不会被当成新发布。
                </p>
              </div>

              <div className="relative w-full lg:w-[360px]">
                <label htmlFor="episode-search" className="sr-only">
                  搜索集数、标题或内容
                </label>
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden="true"
                />
                <input
                  id="episode-search"
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="搜索集数、标题或内容…"
                  className="min-h-12 w-full rounded-full border border-white/10 bg-white/[0.05] py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-superlinear-on-dark/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-superlinear-on-dark/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="清空搜索"
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-superlinear-on-dark"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <p
              className="mt-6 min-h-5 text-sm text-zinc-500"
              aria-live="polite"
            >
              {feed &&
                (query
                  ? `找到${filteredEpisodes.length}期相关节目`
                  : `${feed.episodes.length}期节目`)}
            </p>

            {feedState.status === "loading" && (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                  >
                    <div className="h-28 w-28 shrink-0 rounded-xl bg-white/10" />
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-3 w-32 rounded bg-white/10" />
                      <div className="h-6 w-4/5 rounded bg-white/10" />
                      <div className="h-10 w-full rounded bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {feed && visibleEpisodes.length > 0 && (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {visibleEpisodes.map(episode => {
                  const isActive = activeEpisode?.id === episode.id;
                  return (
                    <article
                      key={episode.id}
                      className={`group flex gap-4 overflow-hidden rounded-2xl border p-3 transition duration-300 sm:gap-5 sm:p-4 ${
                        isActive
                          ? "border-superlinear-on-dark/40 bg-superlinear/[0.08]"
                          : "border-white/10 bg-white/[0.035] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
                      } motion-reduce:transform-none`}
                    >
                      <button
                        type="button"
                        onClick={() => playEpisode(episode)}
                        className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-superlinear-on-dark sm:h-36 sm:w-36"
                        aria-label={`${isActive && isPlaying ? "暂停" : "播放"}${episode.title}`}
                      >
                        <Artwork
                          src={episode.artwork}
                          alt={`${episode.title}单集封面`}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/15 transition hover:bg-black/35">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white backdrop-blur-sm">
                            {isActive && isPlaying ? (
                              <Pause
                                className="h-4 w-4 fill-current"
                                aria-hidden="true"
                              />
                            ) : (
                              <Play
                                className="ml-0.5 h-4 w-4 fill-current"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                        </span>
                      </button>

                      <div className="min-w-0 flex-1 py-1">
                        <EpisodeMeta episode={episode} />
                        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-white sm:text-lg">
                          {episode.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                          {compactDescription(episode.description)}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => playEpisode(episode)}
                            className="inline-flex min-h-11 items-center gap-1.5 text-superlinear-on-dark transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark"
                          >
                            {isActive && isPlaying ? (
                              <Pause className="h-3.5 w-3.5 fill-current" />
                            ) : (
                              <Play className="h-3.5 w-3.5 fill-current" />
                            )}
                            {isActive && isPlaying ? "暂停" : "播放"}
                          </button>
                          <a
                            href={episode.shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-1.5 text-zinc-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark"
                          >
                            详情
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          {episode.transcriptUrl && (
                            <a
                              href={episode.transcriptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hidden min-h-11 items-center gap-1.5 text-zinc-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark sm:inline-flex"
                            >
                              <ScrollText className="h-3.5 w-3.5" />
                              文字稿
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {feed && visibleEpisodes.length === 0 && (
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
                <Search className="mx-auto h-6 w-6 text-zinc-600" />
                <h3 className="mt-4 text-base font-medium text-zinc-200">
                  没有找到「{query.trim()}」
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  可以试试集数、嘉宾名字或更短的关键词。
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-5 min-h-11 rounded-full border border-white/10 px-5 text-sm text-superlinear-on-dark transition hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark"
                >
                  清空搜索
                </button>
              </div>
            )}

            {visibleCount < filteredEpisodes.length && (
              <div className="mt-8 text-center">
                <Button
                  type="button"
                  onClick={() => setVisibleCount(value => value + 12)}
                  variant="outline"
                  className="min-h-12 rounded-full border-white/15 bg-white/[0.03] px-6 text-white hover:bg-white/[0.08]"
                >
                  再看12期
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#0B0F1A]">
          <div className="container grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-superlinear-on-dark">
                Subscribe
              </p>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold text-white sm:text-3xl">
                在你常用的平台继续听
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-500">
                同一份官方RSS会把音频、集数、发布日期和封面同步到各个Podcast平台。
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
              {PLATFORMS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-zinc-300 transition hover:border-superlinear-on-dark/40 hover:bg-superlinear/10 hover:text-superlinear-pale focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {name}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#080B12]">
        <div className="container flex flex-col gap-5 py-9 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-zinc-300">
              课代表立正·Official Podcast
            </p>
            <p className="mt-1">© 2026课代表立正</p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://speaker.lizheng.ai"
              className="transition hover:text-superlinear-on-dark"
            >
              嘉宾邀请
            </a>
            <a
              href="https://www.lizheng.ai"
              className="transition hover:text-superlinear-on-dark"
            >
              关于我
            </a>
            <a
              href="https://stay.superlinear.academy"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-superlinear-on-dark"
            >
              Stay Superlinear会员
            </a>
            <a
              href="https://ai-builders.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-superlinear-on-dark"
            >
              AI Builders
            </a>
          </div>
        </div>
      </footer>

      {activeEpisode && (
        <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-superlinear-on-dark/25 bg-[#090C14]/96 shadow-[0_-18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="container flex items-center gap-3 py-3 sm:gap-4">
            <Artwork
              src={activeEpisode.artwork}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {activeEpisode.title}
              </p>
              <audio
                ref={playerRef}
                src={activeEpisode.audioUrl}
                controls
                preload="metadata"
                className="mt-2 h-9 w-full max-w-2xl [color-scheme:dark]"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
            <a
              href={activeEpisode.shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/10 px-4 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white sm:inline-flex"
            >
              单集页
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => {
                playerRef.current?.pause();
                setActiveEpisode(null);
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-superlinear-on-dark"
              aria-label="关闭播放器"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {feedState.status === "loading" && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 hidden items-center gap-2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-xs text-zinc-300 shadow-xl backdrop-blur-md sm:flex">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          同步官方RSS
        </div>
      )}
    </div>
  );
}
