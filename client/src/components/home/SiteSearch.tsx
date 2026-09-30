import type { Lang } from "@/contexts/LanguageContext";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { HOME_COPY } from "./content";
import { EXTERNAL } from "./parts";

/**
 * Lazy site search over /search/{lang}.json. Each entry is
 * { k: kind, t: title, d: "YYYY.MM", u: url, v?: views }. `v` only nudges the
 * ranking and is never rendered.
 */
interface Entry {
  k: string;
  t: string;
  d: string;
  u: string;
  v?: number;
}

const indexCache: Partial<Record<Lang, Promise<Entry[]>>> = {};

/**
 * The default query's results, rendered on the server and handed to the
 * browser in a JSON island, so the panel does not grow when the index loads
 * (which would push #join and #collaboration away from deep links).
 */
interface InitialSearch {
  query: string;
  results: Entry[];
  essays: number;
  total: number;
}

const ISLAND_ID = "lz-search-initial";

function readInitialSearch(lang: Lang): InitialSearch | null {
  if (typeof window === "undefined") {
    // The prerender script provides both indexes (scripts/prerender-guests.ts).
    const index = (
      globalThis as { __LZ_SEARCH_INDEX__?: Partial<Record<Lang, Entry[]>> }
    ).__LZ_SEARCH_INDEX__?.[lang];
    if (!index) return null;
    const copy = HOME_COPY[lang].writing.search;
    return {
      query: copy.initialQuery,
      results: rank(index, searchTerms(copy.initialQuery)).map(
        ({ k, t, d, u }) => ({ k, t, d, u })
      ),
      essays: index.filter(entry => entry.k === copy.essayKind).length,
      total: index.length,
    };
  }
  try {
    const island = document.getElementById(ISLAND_ID)?.textContent;
    return island ? (JSON.parse(island) as InitialSearch) : null;
  } catch {
    return null;
  }
}

function loadIndex(lang: Lang): Promise<Entry[]> {
  const cached = indexCache[lang];
  if (cached) return cached;
  const request = fetch(`/search/${lang}.json`).then(response => {
    if (!response.ok) throw new Error(`Search index ${response.status}`);
    return response.json() as Promise<Entry[]>;
  });
  indexCache[lang] = request;
  request.catch(() => {
    delete indexCache[lang];
  });
  return request;
}

const MAX_RESULTS = 8;

function searchTerms(query: string) {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function rank(entries: Entry[], terms: string[]): Entry[] {
  if (!terms.length) return [];
  const scored: Array<[number, Entry]> = [];
  for (const entry of entries) {
    const title = entry.t.toLowerCase();
    let score = 0;
    let matched = true;
    for (const term of terms) {
      const index = title.indexOf(term);
      if (index < 0) {
        matched = false;
        break;
      }
      score += 10 - Math.min(index, 9) / 3;
    }
    if (!matched) continue;
    score += entry.v ? Math.log10(entry.v) : 4.2;
    scored.push([score, entry]);
  }
  return scored
    .sort((a, b) => b[0] - a[0])
    .slice(0, MAX_RESULTS)
    .map(([, entry]) => entry);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(title: string, terms: string[]): ReactNode {
  if (!terms.length) return title;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return title
    .split(pattern)
    .map((part, index) =>
      index % 2 === 1 ? (
        <mark key={index}>{part}</mark>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      )
    );
}

type Status = "idle" | "loading" | "ready" | "error";

export default function SiteSearch({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].writing.search;
  const [initial, setInitial] = useState(() => readInitialSearch(lang));
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [query, setQuery] = useState(() => initial?.query ?? "");
  const rootRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<Status>("idle");
  const touchedRef = useRef(false);
  const langRef = useRef(lang);

  // A language switch reuses this component: start over with the other index.
  useEffect(() => {
    if (langRef.current === lang) return;
    langRef.current = lang;
    statusRef.current = "idle";
    touchedRef.current = false;
    setInitial(null);
    setEntries(null);
    setStatus("idle");
    setQuery("");
  }, [lang]);

  const ensureLoaded = useCallback(() => {
    if (statusRef.current === "loading" || statusRef.current === "ready") {
      return;
    }
    const requestedLang = lang;
    const initialQuery = HOME_COPY[requestedLang].writing.search.initialQuery;
    statusRef.current = "loading";
    setStatus("loading");
    loadIndex(requestedLang)
      .then(data => {
        if (langRef.current !== requestedLang) return;
        statusRef.current = "ready";
        setEntries(data);
        setStatus("ready");
        if (!touchedRef.current) setQuery(initialQuery);
      })
      .catch(() => {
        if (langRef.current !== requestedLang) return;
        statusRef.current = "error";
        setStatus("error");
      });
  }, [lang]);

  // Fetch the index shortly before the search panel scrolls into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!("IntersectionObserver" in window)) {
      ensureLoaded();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        ensureLoaded();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [ensureLoaded]);

  const terms = useMemo(() => searchTerms(query), [query]);
  const results = useMemo(() => {
    if (entries) return rank(entries, terms);
    return initial && query === initial.query ? initial.results : [];
  }, [entries, terms, initial, query]);

  const counts =
    status === "ready" && entries
      ? {
          essays: entries.filter(entry => entry.k === t.essayKind).length,
          total: entries.length,
        }
      : initial;
  const summary =
    status === "error"
      ? t.failed
      : counts
        ? t.count(counts.essays, counts.total - counts.essays)
        : status === "loading"
          ? t.loading
          : t.intro;

  const choose = (value: string) => {
    touchedRef.current = true;
    setQuery(value);
    ensureLoaded();
  };

  return (
    <div ref={rootRef} className="lz-search rv grain">
      {initial && (
        <script
          type="application/json"
          id={ISLAND_ID}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(initial).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <h3>{t.title}</h3>
      <p className="sub" aria-live="polite">
        {summary}
      </p>
      <label className="sbox">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
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
          placeholder={t.placeholder}
          aria-label={t.inputLabel}
          autoComplete="off"
          spellCheck={false}
          onFocus={ensureLoaded}
          onChange={event => {
            touchedRef.current = true;
            setQuery(event.target.value);
          }}
        />
      </label>
      <div className="chips">
        {t.chips.map(chip => (
          <button
            key={chip}
            type="button"
            aria-pressed={query === chip}
            onClick={() => choose(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
      <ul className="results" aria-label={t.resultsLabel}>
        {status === "ready" && terms.length > 0 && results.length === 0 && (
          <li className="empty">{t.empty(query.trim())}</li>
        )}
        {results.map((entry, index) => (
          <li key={`${index}-${entry.u}`}>
            <a href={entry.u} {...EXTERNAL}>
              <span className="k">{t.labels[entry.k] ?? entry.k}</span>
              <span className="t">{highlight(entry.t, terms)}</span>
              <span className="d">{entry.d}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
