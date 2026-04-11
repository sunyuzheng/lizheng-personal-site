import GuestsLayout from "@/components/guests/GuestsLayout";
import { Button } from "@/components/ui/button";
import { useGuestDirectory } from "@/hooks/useGuestDirectory";
import { applyPageSeo } from "@/lib/seo";
import { getGuestPageMeta } from "@shared/guest-data";
import { ArrowLeft, ExternalLink, Play, Share2 } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

interface GuestDetailProps {
  slug: string;
}

function formatViews(views?: number): string | null {
  if (!views) return null;
  return views.toLocaleString("en-US");
}

function formatPublishedAt(value?: string): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

export default function GuestDetail({ slug }: GuestDetailProps) {
  const { guests, loading, error } = useGuestDirectory();
  const guest = guests.find(item => item.slug === slug);

  useEffect(() => {
    if (!guest) return;
    return applyPageSeo(getGuestPageMeta(guest));
  }, [guest]);

  if (loading) {
    return (
      <GuestsLayout>
        <div className="container py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-12 w-2/3 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
              <div className="h-24 w-full animate-pulse rounded-2xl bg-white/10" />
            </div>
            <div className="aspect-video animate-pulse rounded-3xl bg-white/10" />
          </div>
        </div>
      </GuestsLayout>
    );
  }

  if (error) {
    return (
      <GuestsLayout>
        <div className="container py-16">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-12 text-center">
            <p className="text-sm text-red-100">{error}</p>
          </div>
        </div>
      </GuestsLayout>
    );
  }

  if (!guest) {
    return (
      <GuestsLayout>
        <div className="container py-16">
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
              Guest Not Found
            </p>
            <h1 className="mt-4 text-3xl font-bold text-white">
              这个嘉宾页不存在
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              链接可能写错了，或者对应 slug 还没有生成。
            </p>
            <Button
              asChild
              className="mt-8 bg-amber-300 text-[#211300] hover:bg-amber-200"
            >
              <Link href="/guests">返回全部嘉宾</Link>
            </Button>
          </div>
        </div>
      </GuestsLayout>
    );
  }

  const sharePath = guest.share_url.replace("https://www.lizheng.ai", "");

  return (
    <GuestsLayout>
      <div className="container py-12 md:py-16">
        <Link
          href="/guests"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" />
          返回全部嘉宾
        </Link>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              <span className="rounded-full border border-white/10 px-2.5 py-1">
                {guest.episode_count} 期访谈
              </span>
              {formatViews(guest.max_views) && (
                <span className="rounded-full border border-white/10 px-2.5 py-1">
                  最高播放 {formatViews(guest.max_views)}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl font-bold text-white md:text-5xl">
              {guest.guest_name}
            </h1>
            {guest.guest_company && (
              <p className="mt-4 text-lg font-semibold text-amber-300">
                {guest.guest_company}
              </p>
            )}
            {guest.guest_title && (
              <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-300">
                {guest.guest_title}
              </p>
            )}

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Share2 className="h-4 w-4 text-amber-300" />
                当前页面可直接分享
              </div>
              <p className="mt-2 break-all text-sm text-zinc-400">
                {sharePath}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-amber-300 text-[#211300] hover:bg-amber-200"
              >
                <a
                  href={guest.primary_episode.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  观看精选访谈
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
              >
                <a
                  href={guest.primary_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  打开 YouTube
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <a
            href={guest.primary_episode.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5"
          >
            <img
              src={guest.primary_episode.thumbnailUrl}
              alt={guest.primary_episode.title}
              className="aspect-video h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="mb-3 inline-flex items-center rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#211300]">
                精选视频
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-white">
                {guest.primary_episode.title}
              </h2>
              <p className="mt-3 text-sm text-zinc-200">
                点开后直接跳转到 YouTube 播放页
              </p>
            </div>
          </a>
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
                Episodes
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">全部访谈</h2>
            </div>
            <p className="text-sm text-zinc-500">
              {guest.episode_count} 期内容，标题已展开
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {guest.episodes.map(episode => (
              <a
                key={episode.videoId}
                href={episode.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-amber-300/40 hover:bg-white/10"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={episode.thumbnailUrl}
                    alt={episode.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/90 text-[#211300]">
                      <Play className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                  {episode.isPrimary && (
                    <div className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#211300]">
                      精选
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                    <span>Episode {episode.index + 1}</span>
                    {formatPublishedAt(episode.publishedAt) && (
                      <span>{formatPublishedAt(episode.publishedAt)}</span>
                    )}
                  </div>
                  <h3 className="line-clamp-3 text-base font-semibold leading-6 text-white">
                    {episode.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>{episode.videoId}</span>
                    {formatViews(episode.viewCount) && (
                      <span>{formatViews(episode.viewCount)} 次观看</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </GuestsLayout>
  );
}
