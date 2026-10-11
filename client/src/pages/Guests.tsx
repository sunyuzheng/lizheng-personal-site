import GuestsLayout from "@/components/guests/GuestsLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGuestDirectory } from "@/hooks/useGuestDirectory";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { getGuestsPageMeta, guestIntro, guestYears, type GuestProfile } from "@shared/guest-data";
import { guestMatchesQuery } from "@shared/guest-search";
import { buildGuestsListStructuredData } from "@shared/structured-data";
import { useEffect, useState } from "react";
import { Link } from "wouter";

const COPY = {
  zh: {
    title: "嘉宾与对谈",
    lede: (people: number, programmes: number) => `${people}位嘉宾，${programmes}期对谈。按名字、公司或话题找。`,
    search: "搜名字、公司或话题",
    clear: "清空",
    found: (n: number) => `找到${n}位`,
    none: (q: string) => `没有找到「${q}」。换个名字或话题试试。`,
    episodes: (n: number) => `${n}期对谈`,
    cover: (name: string) => `${name}的访谈封面`,
  },
  en: {
    title: "Guests & conversations",
    lede: (people: number, programmes: number) => `${people} guests, ${programmes} conversations. Search by name, company or topic.`,
    search: "Search a name, company or topic",
    clear: "Clear",
    found: (n: number) => `${n} found`,
    none: (q: string) => `Nothing found for “${q}”. Try another name or topic.`,
    episodes: (n: number) => `${n} conversation${n === 1 ? "" : "s"}`,
    cover: (name: string) => `Interview cover — ${name}`,
  },
} as const;

function GuestItem({ guest, lang }: { guest: GuestProfile; lang: "en" | "zh" }) {
  const copy = COPY[lang];
  const name = lang === "en" && guest.guest_en_name ? guest.guest_en_name : guest.guest_name;
  const years = guestYears(guest);
  const intro = guestIntro(guest);
  return (
    <Link href={withLanguage(`/guests/${guest.slug}`, lang)} className="lz-guest">
      <span className="lz-guest-thumb">
        <img src={guest.primary_episode.thumbnailUrl} alt={copy.cover(name)} loading="lazy" width={320} height={180} />
      </span>
      <span className="lz-guest-name">{name}</span>
      {intro && <span className="lz-guest-intro">{intro}</span>}
      <span className="lz-guest-meta">{copy.episodes(guest.episode_count)}{years ? ` · ${years}` : ""}</span>
    </Link>
  );
}

export default function Guests() {
  const { lang } = useLanguage();
  const copy = COPY[lang];
  const { guests, loading, error } = useGuestDirectory();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const meta = guests.length
      ? getGuestsPageMeta(guests)
      : {
          title: lang === "en" ? "Guests & conversations · Yuzheng Sun" : "嘉宾与对谈 · 课代表立正",
          description: lang === "en" ? "Guests and conversations on the Yuzheng Sun / 课代表立正 channel." : "课代表立正的嘉宾与对谈。",
          canonical: "https://www.lizheng.ai/guests",
          ogImage: "https://www.lizheng.ai/yuzheng-sun-headshot.jpg",
        };
    return applyPageSeo({ ...meta, jsonLd: guests.length ? buildGuestsListStructuredData(guests, meta.description) : null });
  }, [guests, lang]);

  const filtered = guests.filter(guest => guestMatchesQuery(guest, query));
  const programmes = new Set(guests.flatMap(guest => guest.episodes.map(episode => episode.url))).size;

  return (
    <GuestsLayout>
      <section className="lz-guests-stage">
        <div className="wrap">
          <h1 className="lz-guests-title">{copy.title}</h1>
          {!loading && !error && <p className="lz-guests-lede">{copy.lede(guests.length, programmes)}</p>}
          <div className="lz-guests-search">
            <input
              type="text"
              enterKeyHint="search"
              aria-label={copy.search}
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={copy.search}
            />
            {query && <button type="button" onClick={() => setQuery("")}>{copy.clear}</button>}
          </div>
        </div>
      </section>

      <div className="lz-guests-body wrap">
        {query.trim() && !loading && !error && filtered.length > 0 && <p className="lz-guests-found">{copy.found(filtered.length)}</p>}
        {loading && (
          <ul className="lz-guests-grid" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => <li key={index}><div className="lz-guests-skeleton" /></li>)}
          </ul>
        )}
        {!loading && error && <p className="lz-guests-empty">{error}</p>}
        {!loading && !error && filtered.length > 0 && (
          <ul className="lz-guests-grid">
            {filtered.map(guest => <li key={guest.slug}><GuestItem guest={guest} lang={lang} /></li>)}
          </ul>
        )}
        {!loading && !error && filtered.length === 0 && query.trim() && <p className="lz-guests-empty">{copy.none(query.trim())}</p>}
      </div>
    </GuestsLayout>
  );
}
