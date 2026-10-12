import GuestsLayout from "@/components/guests/GuestsLayout";
import GuestInsightCard from "@/components/guests/GuestInsightCard";
import GuestCommunityResources from "@/components/guests/GuestCommunityResources";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGuestDirectory } from "@/hooks/useGuestDirectory";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { getGuestPageMeta, guestAskLink, guestIntro, guestYears, introductionSource, type GuestEpisode, type GuestPersonLink } from "@shared/guest-data";
import { resolveGuestProfile } from "@shared/guest-identity";
import { getGuestEnglishInsights, type GuestInsight } from "@shared/guest-insights";
import { buildGuestStructuredData } from "@shared/structured-data";
import { useEffect, useState } from "react";
import { Link } from "wouter";

interface GuestDetailProps {
  slug: string;
}

const COPY = {
  zh: {
    back: "← 全部嘉宾",
    episodes: (n: number) => `${n}期对谈`,
    introduced: "节目中的介绍",
    about: "简介：",
    quote: (q: string) => `原话：${q}`,
    members: "成员：",
    memberOf: "所属组合：",
    separator: "、",
    watch: "观看精选的一期 ↗",
    watchCircle: "在超线性学院观看 ↗",
    ask: "在问问立正里查这位嘉宾聊过什么 ↗",
    askGroup: "在问问立正里查他们聊过什么 ↗",
    xiaohongshu: "小红书 ↗",
    playlist: "YouTube合集 ↗",
    community: (n: number) => `社区文章与活动（${n}）`,
    all: "全部对谈",
    allNote: "按时间从新到旧",
    views: (n: string) => `${n}次观看`,
    missingTitle: "这个嘉宾页不存在",
    missingBody: "链接可能已经变了，可以到全部嘉宾里搜一下。",
    missingBack: "看全部嘉宾",
  },
  en: {
    back: "← All guests",
    episodes: (n: number) => `${n} conversation${n === 1 ? "" : "s"}`,
    introduced: "As introduced in the programmes",
    about: "About: ",
    quote: (q: string) => `Their words: ${q}`,
    members: "Members: ",
    memberOf: "Also appears with: ",
    separator: ", ",
    watch: "Watch the featured episode ↗",
    watchCircle: "Watch on Superlinear ↗",
    ask: "Ask Lizheng what they talked about ↗",
    askGroup: "Ask Lizheng what they talked about ↗",
    xiaohongshu: "Xiaohongshu ↗",
    playlist: "YouTube playlist ↗",
    community: (n: number) => `Community posts and events (${n})`,
    all: "All conversations",
    allNote: "Newest first",
    views: (n: string) => `${n} views`,
    missingTitle: "This guest page doesn't exist",
    missingBody: "The link may have changed. Search the guest list instead.",
    missingBack: "See all guests",
  },
} as const;

function formatViews(views: number | undefined | null, lang: "en" | "zh"): string | null {
  if (!views) return null;
  return views.toLocaleString(lang === "en" ? "en-US" : "zh-CN");
}

function formatDate(value: string | undefined, lang: "en" | "zh"): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "zh-CN", {
    year: "numeric", month: lang === "en" ? "short" : "long", day: "numeric", timeZone: "UTC",
  }).format(date);
}

function PersonLinks({ people, lang }: { people: GuestPersonLink[]; lang: "en" | "zh" }) {
  return (
    <>
      {people.map((person, index) => {
        const label = lang === "en" && person.en_name ? person.en_name : person.name;
        return (
          <span key={`${person.name}-${index}`}>
            {index > 0 && COPY[lang].separator}
            {person.slug ? <Link href={withLanguage(`/guests/${person.slug}`, lang)}>{label}</Link> : label}
          </span>
        );
      })}
    </>
  );
}

function episodeMeta(episode: GuestEpisode, lang: "en" | "zh"): string {
  const views = formatViews(episode.viewCount, lang);
  return [formatDate(episode.publishedAt, lang), views && COPY[lang].views(views)].filter(Boolean).join(" · ");
}

export default function GuestDetail({ slug }: GuestDetailProps) {
  const { lang } = useLanguage();
  const copy = COPY[lang];
  const { guests, loading, error } = useGuestDirectory();
  const guest = resolveGuestProfile(guests, slug);
  const [reviewInsights, setReviewInsights] = useState<GuestInsight[]>([]);
  const insights = [
    ...getGuestEnglishInsights(slug),
    ...reviewInsights.filter(article => guest?.alias_slugs?.includes(article.guestSlug) || article.guestSlug === slug),
  ];

  useEffect(() => {
    if (!import.meta.env.DEV || !new URLSearchParams(window.location.search).has("insightReview")) return;
    const controller = new AbortController();
    fetch("/__review/guest-insights.json", { signal: controller.signal })
      .then(response => (response.ok ? response.json() : Promise.reject(new Error("Review unavailable"))))
      .then(data => setReviewInsights(data.articles || []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!guest) return;
    const meta = getGuestPageMeta(guest);
    return applyPageSeo({ ...meta, type: "profile", jsonLd: buildGuestStructuredData(guest, meta.description) });
  }, [guest]);

  if (loading || error || !guest) {
    return (
      <GuestsLayout>
        <section className="lz-guests-stage">
          <div className="wrap">
            <Link href={withLanguage("/guests", lang)} className="lz-guest-back">{copy.back}</Link>
            {!loading && (
              <>
                <h1 className="lz-guests-title" style={{ marginTop: 18 }}>{error ? error : copy.missingTitle}</h1>
                {!error && <p className="lz-guests-lede">{copy.missingBody}</p>}
              </>
            )}
          </div>
        </section>
        <div className="lz-guests-body wrap">
          {!loading && !error && <Link href={withLanguage("/guests", lang)} className="lz-guest-link">{copy.missingBack}</Link>}
        </div>
      </GuestsLayout>
    );
  }

  const name = lang === "en" && guest.guest_en_name ? guest.guest_en_name : guest.guest_name;
  const featured = guest.primary_episode;
  const isCircle = featured.sourceType === "circle";
  const bio = lang === "en" ? guest.guest_bio_en : guest.guest_bio;
  const intro = guestIntro(guest);
  const years = guestYears(guest);

  return (
    <GuestsLayout>
      <section className="lz-guests-stage">
        <div className="wrap">
          <Link href={withLanguage("/guests", lang)} className="lz-guest-back">{copy.back}</Link>
          <div className="lz-guest-head">
            <div>
              <h1>{name}</h1>
              <p className="lz-guest-facts">{copy.episodes(guest.episode_count)}{years ? ` · ${years}` : ""}</p>
              {!!guest.members?.length && <p className="lz-guest-members"><span>{copy.members}</span><PersonLinks people={guest.members} lang={lang} /></p>}
              {!!guest.member_of?.length && <p className="lz-guest-members"><span>{copy.memberOf}</span><PersonLinks people={guest.member_of} lang={lang} /></p>}
              {guest.introductions?.length ? (
                <div className="lz-guest-introductions">
                  <p className="lz-guest-introductions-label">{copy.introduced}</p>
                  <ul>
                    {guest.introductions.slice(0, 4).map(item => (
                      <li key={item.url}>
                        {item.text}
                        <a href={item.url} target="_blank" rel="noopener noreferrer" title={copy.quote(item.quote)}>{introductionSource(item, lang)} ↗</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : intro && <p className="lz-guest-introduction"><span>{copy.about}</span>{intro}</p>}
              {bio && <p className="lz-guest-bio">{bio}</p>}
              <div className="lz-guest-actions">
                <a className="lz-guest-watch" href={featured.url} target="_blank" rel="noopener noreferrer">
                  {isCircle ? copy.watchCircle : copy.watch}
                </a>
                <a className="lz-guest-ask" href={guestAskLink(guest)} target="_blank" rel="noopener noreferrer">{guest.entity_type === "group" ? copy.askGroup : copy.ask}</a>
              </div>
              {!!(guest.xiaohongshu_url || guest.linkedin_url || guest.youtube_playlist_url || guest.community_resources?.length) && (
                <p className="lz-guest-links">
                  {guest.xiaohongshu_url && <a href={guest.xiaohongshu_url} target="_blank" rel="noopener noreferrer">{copy.xiaohongshu}</a>}
                  {guest.linkedin_url && <a href={guest.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}
                  {guest.youtube_playlist_url && <a href={guest.youtube_playlist_url} target="_blank" rel="noopener noreferrer">{copy.playlist}</a>}
                  {!!guest.community_resources?.length && <a href="#community-resources">{copy.community(guest.community_resources.length)}</a>}
                </p>
              )}
            </div>
            <a className="lz-guest-featured" href={featured.url} target="_blank" rel="noopener noreferrer">
              <img src={featured.thumbnailUrl} alt={featured.title} width={640} height={360} />
              <span className="lz-guest-featured-title">{featured.title}</span>
              {episodeMeta(featured, lang) && <span className="lz-guest-featured-meta">{episodeMeta(featured, lang)}</span>}
            </a>
          </div>
        </div>
      </section>

      <div className="lz-guests-body wrap">
        {insights.map(article => (
          <section key={article.id} className="lz-guest-section"><GuestInsightCard article={article} /></section>
        ))}
        <section className="lz-guest-section">
          <h2>{copy.all}</h2>
          {guest.episodes.length > 1 && <p className="lz-guest-section-note">{copy.allNote}</p>}
          <ol className="lz-episodes">
            {guest.episodes.map(episode => (
              <li key={episode.url}>
                <a className="lz-episode" href={episode.url} target="_blank" rel="noopener noreferrer">
                  <img src={episode.thumbnailUrl} alt="" loading="lazy" width={352} height={198} />
                  <span>
                    <span className="lz-episode-meta">{episodeMeta(episode, lang)}</span>
                    <span className="lz-episode-title">{episode.title}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>
        <GuestCommunityResources resources={guest.community_resources || []} lang={lang} />
      </div>
    </GuestsLayout>
  );
}
