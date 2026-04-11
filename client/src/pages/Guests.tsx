import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Play, Search, X, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import guestsRaw from "@/data/guests.json";

interface Guest {
  guest_name: string;
  guest_en_name: string;
  guest_title: string;
  guest_company: string;
  primary_video_id: string;
  all_video_ids: string[];
  max_views: number;
  thumbnail_url: string;
  primary_url: string;
  episode_count: number;
  all_urls: string[];
}

const guests = guestsRaw as Guest[];

function formatViews(views: number): string | null {
  if (!views) return null;
  if (views >= 10000) return `${(views / 10000).toFixed(1)}万`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return String(views);
}

export default function Guests() {
  const [query, setQuery] = useState("");
  const [modalGuest, setModalGuest] = useState<Guest | null>(null);

  useEffect(() => {
    const prevTitle = document.title;
    const prevDesc =
      document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    document.title = "全部嘉宾 · 课代表立正 — 100+ 科技领袖访谈";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "课代表立正访谈过的 100+ 位嘉宾，涵盖 OpenAI、Meta、Google、Databricks、ZhenFund 等顶级科技公司的领袖、创始人与投资人。"
    );
    return () => {
      document.title = prevTitle;
      document.querySelector('meta[name="description"]')?.setAttribute("content", prevDesc);
    };
  }, []);

  const q = query.toLowerCase();
  const filtered = guests.filter(
    (g) =>
      q === "" ||
      g.guest_name.toLowerCase().includes(q) ||
      g.guest_en_name.toLowerCase().includes(q) ||
      g.guest_company.toLowerCase().includes(q) ||
      g.guest_title.toLowerCase().includes(q)
  );

  const multiEp = guests.filter((g) => g.episode_count > 1).length;

  return (
    <div className="relative min-h-screen bg-[#0B0F1A] text-zinc-100">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute -right-40 top-40 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 transition hover:text-amber-300">
            <ArrowLeft className="h-4 w-4" />
            <div>
              <div className="text-sm font-semibold text-amber-300">课代表立正</div>
              <div className="text-xs text-zinc-500">Yuzheng Sun</div>
            </div>
          </Link>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-amber-300/40 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
          >
            <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer">
              <Youtube className="mr-1.5 h-3.5 w-3.5" />
              订阅频道
            </a>
          </Button>
        </div>
      </nav>

      <main className="relative z-10 container py-12 md:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">超级节点 · 全部嘉宾</h1>
          <p className="mt-3 text-zinc-400">
            {guests.length} 位嘉宾 · {multiEp} 位多期深访 · 覆盖 OpenAI / Meta / Google / Databricks / ZhenFund
          </p>
        </div>

        {/* Search */}
        <div className="relative mx-auto mb-10 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

        {/* Result count when searching */}
        {query && (
          <p className="mb-6 text-center text-sm text-zinc-500">
            找到 <span className="text-amber-300">{filtered.length}</span> 位嘉宾
          </p>
        )}

        {/* Guest grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((guest) => (
              <article key={guest.primary_video_id} className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:bg-white/10">
                <a
                  href={guest.primary_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${guest.guest_name}${guest.guest_company ? `，${guest.guest_company}` : ""}${guest.guest_title ? `，${guest.guest_title}` : ""} — 观看访谈`}
                  className="flex flex-1 flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${guest.primary_video_id}/mqdefault.jpg`}
                      alt={`${guest.guest_name}访谈 — ${guest.guest_title || guest.guest_company || "课代表立正"}`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                      width={320}
                      height={180}
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition duration-300 group-hover:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/90 text-[#211300]">
                        <Play className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                    {/* View count badge */}
                    {formatViews(guest.max_views) && (
                      <div className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                        {formatViews(guest.max_views)}
                      </div>
                    )}
                  </div>

                  {/* Info — flex-1 pushes button to bottom of card */}
                  <div className="flex-1 p-3 pb-3">
                    <h2 className="line-clamp-1 text-sm font-semibold leading-tight text-white">
                      {guest.guest_name}
                    </h2>
                    {guest.guest_company && (
                      <p className="mt-1 line-clamp-1 text-xs font-medium leading-tight text-amber-300">
                        {guest.guest_company}
                      </p>
                    )}
                    {guest.guest_title && (
                      <p className="mt-0.5 line-clamp-1 text-xs leading-tight text-zinc-400">
                        {guest.guest_title}
                      </p>
                    )}
                  </div>
                </a>

                {/* Multi-episode button — always at card bottom */}
                {guest.episode_count > 1 && (
                  <button
                    onClick={() => setModalGuest(guest)}
                    className="mx-3 mb-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-1 rounded-lg border border-amber-300/30 bg-amber-300/10 py-1.5 text-[11px] font-semibold text-amber-300 transition hover:bg-amber-300/20"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    查看全部 {guest.episode_count} 期
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-zinc-500">
            没有找到「{query}」相关的嘉宾
          </div>
        )}

        {/* Episodes modal */}
        {modalGuest && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setModalGuest(null)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{modalGuest.guest_name}</h2>
                  {modalGuest.guest_company && (
                    <p className="text-sm text-amber-300">{modalGuest.guest_company}</p>
                  )}
                  {modalGuest.guest_title && (
                    <p className="text-xs text-zinc-400">{modalGuest.guest_title}</p>
                  )}
                </div>
                <button
                  onClick={() => setModalGuest(null)}
                  className="ml-4 rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-4 text-xs text-zinc-500">全部 {modalGuest.episode_count} 期访谈 · 点击观看</p>

              {/* Episode grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {modalGuest.all_video_ids.map((vid, i) => (
                  <a
                    key={vid}
                    href={`https://www.youtube.com/watch?v=${vid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-amber-300/40 hover:bg-white/10"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                        alt={`第 ${i + 1} 期`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/90 text-[#211300]">
                          <Play className="h-3.5 w-3.5 fill-current" />
                        </div>
                      </div>
                      {vid === modalGuest.primary_video_id && (
                        <div className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-[#211300]">
                          精选
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] text-zinc-400">第 {i + 1} 期</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/30 py-10 mt-16 text-center">
        <p className="text-sm text-zinc-500">
          <Link href="/" className="text-amber-400 hover:text-amber-300 transition">
            课代表立正
          </Link>{" "}
          · 访谈内容版权所有
        </p>
      </footer>
    </div>
  );
}
