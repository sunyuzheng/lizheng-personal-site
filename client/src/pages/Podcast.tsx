import { EXTERNAL } from "@/components/home/parts";
import { SoloFooter, SoloHeader } from "@/components/site/SoloShell";
import { applyPageSeo } from "@/lib/seo";
import { PODCAST_PAGE_META } from "@shared/page-meta";
import { buildPodcastStructuredData } from "@shared/structured-data";
import { useEffect, useMemo, useRef, useState } from "react";

/*
 * The podcast's own site (podcast.lizheng.ai): the show, the latest episode, every episode with
 * search, and a player. It reads the official RSS in the browser. The page wears the site's
 * language (components/site/subpages.css, "The podcast's own site"): a forest head with the show's
 * cover, then paper; episodes are rows between hairlines, not cards; things to click are words.
 * It has a host of its own, so its header and footer carry this page's few links.
 */

const PUBLIC_FEED_URL = "https://feeds.transistor.fm/kedaibiao";
const SHOW_COVER = "/podcast/avatar.png";

const PLATFORMS = [
  {
    name: "Apple Podcasts",
    href: "https://podcasts.apple.com/us/podcast/%E8%AF%BE%E4%BB%A3%E8%A1%A8%E7%AB%8B%E6%AD%A3/id1859339631",
  },
  {
    name: "Spotify",
    href: "https://open.spotify.com/show/4YoFrN0YArKCIqZq46yHr3",
  },
  {
    name: "小宇宙",
    href: "https://www.xiaoyuzhoufm.com/podcast/6934fbe84ef12f9fe94eed5f",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@kedaibiao",
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

/**
 * The feed's summaries are HTML (<p>…</p>). The page shows and searches them as plain text, so the
 * markup is read as a document and only its words are kept; a paragraph break becomes a space.
 */
function plainText(html: string) {
  if (!html.includes("<") && !html.includes("&")) return html;
  const body = new DOMParser().parseFromString(
    html.replace(/<\/(p|div|li|h[1-6])>|<br\s*\/?>/gi, "$& "),
    "text/html"
  ).body;
  return (body.textContent || "").replace(/\s+/g, " ").trim();
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
        description: plainText(
          textByTag(item, "itunes:summary") || textByTag(item, "description")
        ),
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
  className?: string;
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

/** Which episode, when, how long: one quiet line. */
function EpisodeMeta({ episode }: { episode: PodcastEpisode }) {
  return (
    <p className="ep-meta">
      {episode.episodeNumber && (
        <span className="no">E{episode.episodeNumber}</span>
      )}
      <span>{formatDate(episode.publishedAt)}</span>
      {episode.durationSeconds && (
        <span>{formatDuration(episode.durationSeconds)}</span>
      )}
    </p>
  );
}

/**
 * An episode's title, kept in phrases: a line turns after a comma, a question mark or the bar
 * between a series number and its title, not in the middle of a word.
 */
function TitlePhrases({ text }: { text: string }) {
  const parts = text.match(/[^，：；、？！。｜]+[，：；、？！。｜]*\s*/g) ?? [text];
  if (parts.length < 2) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className="phrase">
          {part}
        </span>
      ))}
    </>
  );
}

function Ext() {
  return (
    <span className="ext" aria-hidden="true">
      ↗
    </span>
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

  const isLatestPlaying =
    !!latestEpisode && activeEpisode?.id === latestEpisode.id && isPlaying;

  return (
    <div
      className={`lz-site lz-home lz-sub pod${activeEpisode ? " has-player" : ""}`}
      lang="zh-CN"
    >
      <SoloHeader
        brandHref="/"
        brandLabel="课代表立正Podcast首页"
        small="Podcast"
      >
        <a className="plain" href="https://www.lizheng.ai">
          返回lizheng.ai
        </a>
        <a className="lz-lang" href={PUBLIC_FEED_URL} {...EXTERNAL}>
          RSS
        </a>
      </SoloHeader>

      <main>
        {/* ── The show ── */}
        <section className="forest-head pod-head grain">
          <div className="wrap">
            <div className="cols2">
              <Artwork
                src={feed?.cover || SHOW_COVER}
                alt="课代表立正Podcast节目封面"
                className="cover"
                eager
              />
              <div>
                <div className="eyebrow">Official Podcast</div>
                <h1>课代表立正</h1>
                <p className="lede">AI到底怎么用，钱到底怎么赚？</p>
                {/* The second sentence stays whole: on a phone its last three characters sat alone on a line. */}
                <p className="aside">
                  我去找硅谷和国内一线的研究者、创业者、投资人长谈，聊他们看见了什么、为什么敢下注、现实又怎样改写了答案。
                  <span className="phrase">
                    也有我的单口，十几分钟讲清一个判断。
                  </span>
                </p>
                <ul className="listen">
                  {PLATFORMS.map(({ name, href }) => (
                    <li key={name}>
                      <a href={href} {...EXTERNAL}>
                        {name}
                        <Ext />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <ul className="facts-line">
              <li>
                {feed ? (
                  <>
                    RSS收录<b className="in">{feed.episodes.length}</b>期
                  </>
                ) : (
                  "正在读取官方RSS"
                )}
              </li>
              <li>持续更新</li>
              <li>中文</li>
              <li>RSS实时同步</li>
            </ul>
          </div>
        </section>

        {/* ── The latest episode ── */}
        <section className="sec">
          <div className="wrap">
            <div className="head">
              <h2>最新一期</h2>
              {feed?.lastBuildAt && (
                <p className="updated">
                  RSS更新于{formatDate(feed.lastBuildAt)}
                </p>
              )}
            </div>

            {feedState.status === "loading" && (
              <div className="latest wait" aria-label="正在读取最新一期">
                <div className="art" />
                <div className="body">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}

            {feedState.status === "error" && (
              <div role="alert" className="feed-error">
                <h3>暂时没有读到官方RSS</h3>
                <p>{feedState.error}</p>
                <div className="cta-row">
                  <button
                    type="button"
                    className="btn btn-green"
                    onClick={() => setRefreshKey(value => value + 1)}
                  >
                    重新同步
                  </button>
                  <a className="lz-link" href={PUBLIC_FEED_URL} {...EXTERNAL}>
                    打开RSS <i aria-hidden="true">→</i>
                  </a>
                </div>
              </div>
            )}

            {latestEpisode && (
              <article className="latest">
                <button
                  type="button"
                  className="art"
                  onClick={() => playEpisode(latestEpisode)}
                  aria-label={`${isLatestPlaying ? "暂停" : "播放"}${latestEpisode.title}`}
                >
                  <Artwork
                    src={latestEpisode.artwork}
                    alt={`${latestEpisode.title}单集封面`}
                    eager
                  />
                </button>
                <div className="body">
                  <EpisodeMeta episode={latestEpisode} />
                  <h3>
                    <TitlePhrases text={latestEpisode.title} />
                  </h3>
                  <p className="desc">
                    {compactDescription(latestEpisode.description)}
                  </p>
                  <div className="cta-row">
                    <button
                      type="button"
                      className="btn btn-green"
                      onClick={() => playEpisode(latestEpisode)}
                    >
                      {isLatestPlaying ? "暂停" : "立即播放"}
                    </button>
                    <a
                      className="lz-link"
                      href={latestEpisode.shareUrl}
                      {...EXTERNAL}
                    >
                      单集详情 <i aria-hidden="true">→</i>
                    </a>
                  </div>
                </div>
              </article>
            )}
          </div>
        </section>

        {/* ── Every episode ── */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <h2>全部单集</h2>
                <p className="after">
                  默认按RSS发布日期从新到旧排列。历史修复不会被当成新发布。
                </p>
              </div>
              <div className="finder">
                <div className="search">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
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
                  <label htmlFor="episode-search" className="sr-only">
                    搜索集数、标题或内容
                  </label>
                  <input
                    id="episode-search"
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="搜索集数、标题或内容…"
                  />
                  {query && (
                    <button
                      type="button"
                      className="clear"
                      onClick={() => setQuery("")}
                    >
                      清空搜索
                    </button>
                  )}
                </div>
              </div>
            </div>

            <p className="count" aria-live="polite">
              {feed &&
                (query
                  ? `找到${filteredEpisodes.length}期相关节目`
                  : `${feed.episodes.length}期节目`)}
            </p>

            {feedState.status === "loading" && (
              <ul className="episodes wait" aria-hidden="true">
                {Array.from({ length: 6 }).map((_, index) => (
                  <li key={index}>
                    <div className="art" />
                    <div className="body">
                      <i />
                      <i />
                      <i />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {feed && visibleEpisodes.length > 0 && (
              <ul className="episodes">
                {visibleEpisodes.map(episode => {
                  const isActive = activeEpisode?.id === episode.id;
                  const playing = isActive && isPlaying;
                  return (
                    <li key={episode.id} className={isActive ? "on" : undefined}>
                      <button
                        type="button"
                        className="art"
                        onClick={() => playEpisode(episode)}
                        aria-label={`${playing ? "暂停" : "播放"}${episode.title}`}
                      >
                        <Artwork
                          src={episode.artwork}
                          alt={`${episode.title}单集封面`}
                        />
                      </button>
                      <div className="body">
                        <EpisodeMeta episode={episode} />
                        <h3>
                          <TitlePhrases text={episode.title} />
                        </h3>
                        <p className="desc">
                          {compactDescription(episode.description)}
                        </p>
                      </div>
                      <div className="acts">
                        <button
                          type="button"
                          className="play"
                          onClick={() => playEpisode(episode)}
                        >
                          {playing ? "暂停" : "播放"}
                        </button>
                        <a href={episode.shareUrl} {...EXTERNAL}>
                          详情
                          <Ext />
                        </a>
                        {episode.transcriptUrl && (
                          <a href={episode.transcriptUrl} {...EXTERNAL}>
                            文字稿
                            <Ext />
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {feed && visibleEpisodes.length === 0 && (
              <div className="no-episodes">
                <h3>没有找到「{query.trim()}」</h3>
                <p>可以试试集数、嘉宾名字或更短的关键词。</p>
                <button
                  type="button"
                  className="lz-expand"
                  onClick={() => setQuery("")}
                >
                  清空搜索
                </button>
              </div>
            )}

            {visibleCount < filteredEpisodes.length && (
              <button
                type="button"
                className="lz-expand more-episodes"
                onClick={() => setVisibleCount(value => value + 12)}
              >
                再看12期
              </button>
            )}
          </div>
        </section>

        {/* ── Where else to listen ── */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <h2>在你常用的平台继续听</h2>
                <p className="say">
                  同一份官方RSS会把音频、集数、发布日期和封面同步到各个Podcast平台。
                </p>
              </div>
              <ul className="points platforms">
                {PLATFORMS.map(({ name, href }) => (
                  <li key={name}>
                    <a href={href} {...EXTERNAL}>
                      <b>{name}</b>
                      <Ext />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <SoloFooter
        name="课代表立正·Official Podcast"
        label="相关页面"
        rights="© 2026课代表立正"
      >
        <li>
          <a href="https://speaker.lizheng.ai">嘉宾邀请</a>
        </li>
        <li>
          <a href="https://www.lizheng.ai/about">关于我</a>
        </li>
        <li>
          <a href="https://staysuperlinear.com" {...EXTERNAL}>
            Stay Superlinear会员
          </a>
        </li>
        <li>
          <a href="https://ai-builders.com" {...EXTERNAL}>
            AI Builders
          </a>
        </li>
      </SoloFooter>

      {/* The player stays at the foot of the window while an episode is chosen. */}
      {activeEpisode && (
        <div className="player" role="region" aria-label="播放器">
          <div className="wrap">
            <Artwork src={activeEpisode.artwork} alt="" className="thumb" />
            <div className="now">
              <p>{activeEpisode.title}</p>
              <audio
                ref={playerRef}
                src={activeEpisode.audioUrl}
                controls
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
            <a className="lz-link" href={activeEpisode.shareUrl} {...EXTERNAL}>
              单集页 <i aria-hidden="true">→</i>
            </a>
            <button
              type="button"
              className="close"
              onClick={() => {
                playerRef.current?.pause();
                setActiveEpisode(null);
              }}
              aria-label="关闭播放器"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
