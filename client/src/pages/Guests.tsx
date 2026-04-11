import GuestsLayout from "@/components/guests/GuestsLayout";
import { useGuestDirectory } from "@/hooks/useGuestDirectory";
import { applyPageSeo } from "@/lib/seo";
import { getGuestsPageMeta } from "@shared/guest-data";
import { ArrowRight, ExternalLink, Play, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

function formatViews(views: number): string | null {
  if (!views) return null;
  if (views >= 10000) return `${(views / 10000).toFixed(1)}万`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return String(views);
}

export default function Guests() {
  const { guests, loading, error } = useGuestDirectory();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const meta = guests.length
      ? getGuestsPageMeta(guests)
      : {
          title: "全部嘉宾 · 课代表立正",
          description: "课代表立正访谈嘉宾总览。",
          canonical: "https://www.lizheng.ai/guests",
        };

    return applyPageSeo(meta);
  }, [guests]);

  const q = query.trim().toLowerCase();
  const filtered = guests.filter(
    guest =>
      q === "" ||
      guest.guest_name.toLowerCase().includes(q) ||
      guest.guest_en_name.toLowerCase().includes(q) ||
      guest.guest_company.toLowerCase().includes(q) ||
      guest.guest_title.toLowerCase().includes(q)
  );

  const multiEp = guests.filter(guest => guest.episode_count > 1).length;

  return (
    <GuestsLayout>
      <div className="container py-12 md:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            超级节点 · 全部嘉宾
          </h1>
          {!loading && !error && (
            <p className="mt-3 text-zinc-400">
              {guests.length} 位嘉宾 · {multiEp} 位多期深访 ·
              每位嘉宾都有独立分享页
            </p>
          )}
        </div>

        <div className="relative mx-auto mb-10 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="搜索嘉宾姓名、公司、职位…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-300/50 focus:bg-white/8"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {query && !loading && !error && (
          <p className="mb-6 text-center text-sm text-zinc-500">
            找到 <span className="text-amber-300">{filtered.length}</span>{" "}
            位嘉宾
          </p>
        )}

        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="aspect-video animate-pulse bg-white/10" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-12 text-center">
            <p className="text-sm text-red-100">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(guest => (
              <article
                key={guest.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:bg-white/10"
              >
                <Link
                  href={`/guests/${guest.slug}`}
                  className="flex flex-1 flex-col"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={guest.primary_episode.thumbnailUrl}
                      alt={`${guest.guest_name}访谈封面`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                      width={320}
                      height={180}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition duration-300 group-hover:opacity-100">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/90 text-[#211300]">
                        <Play className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                    {formatViews(guest.max_views) && (
                      <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                        {formatViews(guest.max_views)}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div>
                      <h2 className="line-clamp-1 text-base font-semibold text-white">
                        {guest.guest_name}
                      </h2>
                      {guest.guest_company && (
                        <p className="mt-1 line-clamp-1 text-sm font-medium text-amber-300">
                          {guest.guest_company}
                        </p>
                      )}
                      {guest.guest_title && (
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-400">
                          {guest.guest_title}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                      <span>{guest.episode_count} 期访谈</span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5">
                        独立页
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-5 text-zinc-300">
                      {guest.primary_episode.title}
                    </p>
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3">
                  <Link
                    href={`/guests/${guest.slug}`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-300/20"
                  >
                    查看子页
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <a
                    href={guest.primary_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-white/10"
                  >
                    YouTube
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && query && (
          <div className="py-24 text-center text-zinc-500">
            没有找到「{query}」相关的嘉宾
          </div>
        )}
      </div>
    </GuestsLayout>
  );
}
