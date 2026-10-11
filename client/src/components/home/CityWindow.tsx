import type { Lang } from "@/contexts/LanguageContext";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { Community } from "../../../community-app/data";
import type { CityWindow as WindowHandle } from "../../../community-app/embed";
import CityField from "./CityField";
import { LINKS, type CityCopy, type WindowCopy } from "./content";
import { Phrases } from "./parts";

/**
 * The community section's window onto city.lizheng.ai: the city of
 * connections itself, seen at an angle and turning slowly, so the homepage
 * shows what is behind the door instead of describing it. Pointing at a light
 * lights up that person's lines; a click takes you into the full page,
 * focused on them. Search and "meet someone" lead in the same way. Where the
 * browser cannot draw it (no WebGL2) or the data does not load, the section
 * falls back to the dot map (CityField).
 *
 * The drawing code and data load only when the section nears the screen.
 */

interface Tip {
  member: number;
  x: number;
  y: number;
  /** Pinned by a tap; tapping the card then goes in. */
  sticky: boolean;
}

const MAX_MATCHES = 8;
const normalize = (value: string) =>
  value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");

function formatDate(value: string, lang: Lang) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function supportsWebGL2() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export default function CityWindow({
  lang,
  copy,
  view,
  action,
}: {
  lang: Lang;
  /** The dot map's words, for the fallback. */
  copy: CityCopy;
  view: WindowCopy;
  /** The section's calls to action, shown beside the caption. */
  action: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<WindowHandle | null>(null);
  const [mode, setMode] = useState<"window" | "fallback">("window");
  const [data, setData] = useState<Community | null>(null);
  const [pageUrl, setPageUrl] = useState<
    ((lang: Lang, uid?: string) => string) | null
  >(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const tipRef = useRef(tip);
  tipRef.current = tip;

  const go = (member?: number) => {
    if (!data || !pageUrl) return;
    const uid = member !== undefined && member >= 0 ? data.linked[member] : "";
    window.location.href = pageUrl(lang, uid || undefined);
  };
  const goRef = useRef(go);
  goRef.current = go;

  // Load the drawing code and the data shortly before the section is seen.
  useEffect(() => {
    if (!supportsWebGL2()) {
      setMode("fallback");
      return;
    }
    const wrap = wrapRef.current;
    if (!wrap) return;
    let cancelled = false;
    const load = async () => {
      const source = await import("../../../community-app/source");
      const community = await source.loadCommunity();
      if (cancelled) return;
      if (!community) {
        setMode("fallback");
        return;
      }
      setPageUrl(() => source.pageUrl);
      setData(community);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        load().catch(() => !cancelled && setMode("fallback"));
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(wrap);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  // Draw the city once the data is here.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!data || !canvas) return;
    let disposed = false;
    import("../../../community-app/embed")
      .then(({ mountCityWindow }) => {
        if (disposed) return;
        handleRef.current = mountCityWindow({
          canvas,
          data,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches,
          coarse: window.matchMedia("(pointer: coarse)").matches,
          onHover(member, x, y) {
            if (member < 0) {
              setTip(current => (current?.sticky ? current : null));
            } else {
              setTip(current =>
                current?.sticky && current.member === member
                  ? current
                  : { member, x, y, sticky: false }
              );
            }
          },
          onPick(member, pointerType) {
            if (pointerType === "mouse") {
              goRef.current(member);
              return;
            }
            // On touch screens the first tap shows who it is; the card goes in.
            if (member < 0) {
              setTip(null);
              return;
            }
            const located = handleRef.current?.locate(member);
            if (located)
              setTip({ member, x: located[0], y: located[1], sticky: true });
          },
        });
      })
      .catch(() => setMode("fallback"));
    return () => {
      disposed = true;
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, [data]);

  // Search by name: names that start with the query first, then the most
  // connected.
  const searchIndex = useMemo(() => data?.names.map(normalize) ?? [], [data]);
  const matches = useMemo(() => {
    const term = normalize(query);
    if (!term || !data) return [];
    const starts: number[] = [];
    const contains: number[] = [];
    for (let member = 0; member < searchIndex.length; member++) {
      if (!data.linked[member]) continue;
      const at = searchIndex[member].indexOf(term);
      if (at === 0) starts.push(member);
      else if (at > 0) contains.push(member);
    }
    const byStrength = (a: number, b: number) =>
      data.strength[b] - data.strength[a];
    return [...starts.sort(byStrength), ...contains.sort(byStrength)].slice(
      0,
      MAX_MATCHES
    );
  }, [query, searchIndex, data]);
  const showList = listOpen && query.trim() !== "";

  useEffect(() => setActive(0), [query]);

  // The highlighted search result lights up its lines and shows its card.
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;
    if (!showList || matches[active] === undefined) {
      if (!tipRef.current?.sticky) handle.highlight(-1);
      return;
    }
    const member = matches[active];
    handle.highlight(member);
    const located = handle.locate(member);
    setTip(
      located ? { member, x: located[0], y: located[1], sticky: false } : null
    );
  }, [showList, matches, active]);

  const onFindKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!matches.length) return;
      event.preventDefault();
      setListOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(index => (index + step + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      const member = matches[active];
      if (member === undefined) return;
      event.preventDefault();
      go(member);
    } else if (event.key === "Escape") {
      if (showList) setListOpen(false);
      else setQuery("");
    }
  };

  const meetRandom = () => {
    if (!data) return;
    for (let attempt = 0; attempt < 50; attempt++) {
      const member =
        data.ranked[Math.floor(Math.random() * data.ranked.length)];
      if (data.names[member] && data.linked[member]) {
        go(member);
        return;
      }
    }
  };

  if (mode === "fallback") {
    return <CityField lang={lang} copy={copy} action={action} />;
  }

  const count = data ? data.count.toLocaleString("en-US") : "";
  const pairs = data ? data.pairCount.toLocaleString("en-US") : "";
  const caption = data ? view.caption(count) : copy.fallbackCaption;
  const tipName = tip && data ? data.names[tip.member] : "";
  const tipSummary =
    tip && data
      ? view.connected(data.degree[tip.member].toLocaleString("en-US"))
      : "";
  // While the data loads, the caption keeps the height of its longest
  // version (drawn invisibly by CSS), so the sections below never move.
  const reserve = {
    "data-lines": view.caption("88,888").join("\n"),
    "data-note": view.updated(
      lang === "en" ? "September 28, 2026" : "2026年12月28日"
    ),
  };

  return (
    <div className="city-map city-window rv">
      <div
        className={data ? "city-tools" : "city-tools idle"}
        aria-hidden={data ? undefined : true}
      >
        <div className="city-find">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
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
            placeholder={copy.find.placeholder}
            aria-label={copy.find.label}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listId}
            aria-activedescendant={
              showList && matches.length ? `${listId}-${active}` : undefined
            }
            autoComplete="off"
            spellCheck={false}
            disabled={!data}
            onChange={event => {
              setQuery(event.target.value);
              setListOpen(true);
            }}
            onFocus={() => setListOpen(true)}
            onBlur={() => setListOpen(false)}
            onKeyDown={onFindKey}
          />
          {showList && (
            <ul id={listId} role="listbox" className="city-find-list">
              {matches.map((member, index) => (
                <li
                  key={member}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => go(member)}
                >
                  <span>{data?.names[member]}</span>
                  <span aria-hidden="true">→</span>
                </li>
              ))}
              {!matches.length && (
                <li className="empty" role="option" aria-selected={false}>
                  {copy.find.empty(query.trim())}
                </li>
              )}
            </ul>
          )}
        </div>
        <button
          type="button"
          className="city-random"
          onClick={meetRandom}
          aria-label={copy.random}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 7h3.5c2.6 0 3.9 1.6 5 3.6l1 1.8c1.1 2 2.4 3.6 5 3.6H20M4 17h3.5c1.4 0 2.4-.5 3.2-1.3M16.8 8.3c.7-.8 1.7-1.3 2.9-1.3H20M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="label">{copy.random}</span>
        </button>
      </div>
      <div ref={wrapRef} className="field">
        <canvas
          ref={canvasRef}
          className="dots"
          role="img"
          aria-label={data ? view.label(count, pairs) : copy.fallbackLabel}
        />
        {tip && data && (
          <span
            className="city-ring"
            aria-hidden="true"
            style={{ left: tip.x, top: tip.y }}
          />
        )}
        {tip && data && (
          <a
            className={[
              "city-tip",
              "full",
              tip.sticky ? "sticky" : "",
              tip.y < 96 ? "below" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            href={pageUrl?.(lang, data.linked[tip.member] || undefined)}
            style={{
              left: Math.min(
                Math.max(tip.x, 120),
                (wrapRef.current?.clientWidth ?? 0) - 120
              ),
              top: tip.y,
            }}
            tabIndex={tip.sticky ? 0 : -1}
          >
            <span className="line">
              <span className="who">{tipName}</span>
            </span>
            <span className="since">{tipSummary}</span>
            <span className="enter-hint">
              {tip.sticky ? view.tapHint : view.hint}{" "}
              <span aria-hidden="true">→</span>
            </span>
          </a>
        )}
        <a
          className="city-enter"
          href={lang === "en" ? LINKS.connectionsEn : LINKS.connections}
        >
          {view.enter} <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="city-caption">
        <div className="city-legend" {...reserve}>
          <p>
            <Phrases text={caption[0]} />
            {caption[1] && (
              <>
                <br />
                <Phrases text={caption[1]} />
              </>
            )}
            {data && (
              <small>{view.updated(formatDate(data.generatedAt, lang))}</small>
            )}
          </p>
        </div>
        {action}
      </div>
    </div>
  );
}
