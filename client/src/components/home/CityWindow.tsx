import type { Lang } from "@/contexts/LanguageContext";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import type { Community } from "../../../community-app/data";
import type { CityWindow as WindowHandle } from "../../../community-app/embed";
import { findMembers, normalizeName } from "../../../community-app/find";
import CityField from "./CityField";
import { LINKS, type CityCopy, type WindowCopy } from "./content";
import { Phrases } from "./parts";

/**
 * The community section's window onto city.lizheng.ai: the city of
 * connections itself, seen at an angle and turning slowly, so the homepage
 * shows what is behind the door instead of describing it. Pointing at a light
 * lights up that person's lines and shows their card: when they joined, their
 * posts and comments, and how many people they are in touch with. A click or
 * tap keeps the card open, with their profile and the way into the full page,
 * focused on them. The search box also meets someone at random (while it is
 * empty, at its right end, or Enter); both open cards the same way. A
 * sideways drag turns the city (embed.ts). Where
 * the browser cannot draw it (no WebGL2) or the data does not load, the
 * section falls back to the dot map (CityField).
 *
 * The drawing code and data load only when the section nears the screen.
 */

interface Card {
  member: number;
  /** Where the member's light is on the canvas, in CSS pixels. */
  x: number;
  y: number;
  /** Kept open by a click, a tap, search or "meet someone"; otherwise it follows the pointer. */
  open: boolean;
}

interface Links {
  page: (lang: Lang, uid?: string) => string;
  profile: (uid: string) => string;
}

// The card keeps this far from its light and from the frame's edges.
const GAP = 14;
const EDGE = 8;

// The prerender has no layout; measuring only makes sense in the browser.
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

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
  /** The dot map's words: its fallback, search, and the card's figures. */
  copy: CityCopy;
  view: WindowCopy;
  /** The section's calls to action, shown beside the caption. */
  action: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<WindowHandle | null>(null);
  const [mode, setMode] = useState<"window" | "fallback">("window");
  const [data, setData] = useState<Community | null>(null);
  const [links, setLinks] = useState<Links | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const openRef = useRef(false);
  openRef.current = Boolean(card?.open);

  // Shows a member's card at their light: open, or following the pointer.
  // Only refs and state setters inside, so the window's callbacks can keep it.
  const showCard = useCallback((member: number, open: boolean) => {
    const handle = handleRef.current;
    if (!handle) return;
    handle.highlight(member, open);
    const at = member >= 0 ? handle.locate(member) : null;
    setCard(at ? { member, x: at[0], y: at[1], open } : null);
  }, []);
  const closeCard = useCallback(() => {
    handleRef.current?.highlight(-1);
    setCard(null);
  }, []);

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
      setLinks({ page: source.pageUrl, profile: source.profileUrl });
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
          // The window stops reporting the pointer while a card is open.
          onHover(member, x, y) {
            setCard(member >= 0 ? { member, x, y, open: false } : null);
          },
          onPick(member) {
            if (member >= 0) showCard(member, true);
            else closeCard();
          },
          // Turning the city moves the lights out from under an open card.
          onTurn: closeCard,
          onResize() {
            setCard(current => {
              const at = current && handleRef.current?.locate(current.member);
              return current && at ? { ...current, x: at[0], y: at[1] } : null;
            });
          },
        });
      })
      .catch(() => setMode("fallback"));
    return () => {
      disposed = true;
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, [data, showCard, closeCard]);

  // Keep the card inside the frame: above its light, else below, else
  // against the edge farther from it.
  useBrowserLayoutEffect(() => {
    const element = cardRef.current;
    const wrap = wrapRef.current;
    if (!card || !element || !wrap) return;
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const room = wrap.clientHeight;
    const left = Math.max(
      EDGE,
      Math.min(card.x - width / 2, wrap.clientWidth - width - EDGE)
    );
    let top = card.y - GAP - height;
    if (top < EDGE) {
      top = card.y + GAP;
      if (top + height > room - EDGE)
        top = card.y > room / 2 ? EDGE : room - EDGE - height;
    }
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }, [card]);

  // Escape closes an open card.
  useEffect(() => {
    if (!card?.open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) closeCard();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [card?.open, closeCard]);

  // Search by name, among members whose card can link to them.
  const searchIndex = useMemo(
    () => data?.names.map(normalizeName) ?? [],
    [data]
  );
  const matches = useMemo(
    () =>
      data
        ? findMembers(data, searchIndex, query, {
            accept: member => !!data.linked[member],
          })
        : [],
    [query, searchIndex, data]
  );
  const showList = listOpen && query.trim() !== "";

  useEffect(() => setActive(0), [query]);

  // The highlighted search result shows its card; leaving the list without
  // choosing puts the preview away.
  useEffect(() => {
    if (!handleRef.current) return;
    const member = showList ? matches[active] : undefined;
    if (member !== undefined) showCard(member, false);
    else if (!openRef.current) closeCard();
  }, [showList, matches, active, showCard, closeCard]);

  // Picking someone empties the box, so it offers meeting someone at random
  // again, as on city.lizheng.ai.
  const choose = (member: number) => {
    setListOpen(false);
    setQuery("");
    showCard(member, true);
  };

  const onFindKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!matches.length) return;
      event.preventDefault();
      setListOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(index => (index + step + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (!query.trim()) meetRandom();
      else if (showList && matches[active] !== undefined)
        choose(matches[active]);
    } else if (event.key === "Escape") {
      if (showList) setListOpen(false);
      else if (query) setQuery("");
      else return;
      event.preventDefault();
    }
  };

  const meetRandom = () => {
    if (!data) return;
    for (let attempt = 0; attempt < 50; attempt++) {
      const member =
        data.ranked[Math.floor(Math.random() * data.ranked.length)];
      if (data.names[member] && data.linked[member]) {
        showCard(member, true);
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
          {!query && (
            <button
              type="button"
              className="city-random"
              onClick={meetRandom}
              aria-label={copy.randomLabel}
            >
              {copy.random}
            </button>
          )}
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
                  onClick={() => choose(member)}
                >
                  <span>{data?.names[member]}</span>
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
      </div>
      <div ref={wrapRef} className="field">
        <canvas
          ref={canvasRef}
          className="dots"
          role="img"
          aria-label={data ? view.label(count, pairs) : copy.fallbackLabel}
        />
        {card && data && links && (
          <>
            <span
              className="city-ring"
              aria-hidden="true"
              style={{ left: card.x, top: card.y }}
            />
            <MemberCard
              element={cardRef}
              lang={lang}
              data={data}
              links={links}
              card={card}
              copy={copy}
              view={view}
              onClose={closeCard}
            />
          </>
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

/**
 * A person's card: their name, when they joined, and their posts, comments
 * and connections (counts of zero left out). Open, it also leads to their
 * profile and into the city, focused on them.
 */
function MemberCard({
  element,
  lang,
  data,
  links,
  card,
  copy,
  view,
  onClose,
}: {
  element: Ref<HTMLDivElement>;
  lang: Lang;
  data: Community;
  links: Links;
  card: Card;
  copy: CityCopy;
  view: WindowCopy;
  onClose: () => void;
}) {
  const { member, open } = card;
  const name = data.names[member] || view.someone;
  const uid = data.linked[member];
  const month =
    data.startYear * 12 +
    data.startMonth -
    1 +
    Math.max(0, data.joined[member]);
  const figures = (
    [
      [data.posts[member], copy.posts],
      [data.comments[member], copy.comments],
      [data.degree[member], view.linked],
    ] as const
  ).filter(([value]) => value > 0);

  return (
    <div
      ref={element}
      className={open ? "city-tip city-card open" : "city-tip city-card"}
      role={open ? "dialog" : undefined}
      aria-label={open ? name : undefined}
      aria-hidden={open ? undefined : true}
    >
      <span className="who">{name}</span>
      <span className="since">
        {copy.joined(Math.floor(month / 12), (month % 12) + 1)}
      </span>
      {figures.length > 0 && (
        <span className="metrics">
          {figures.map(([value, label]) => (
            <span key={label(value)} className="metric">
              <b>{value.toLocaleString("en-US")}</b>
              <small>{label(value)}</small>
            </span>
          ))}
        </span>
      )}
      {open && uid ? (
        <span className="ways">
          <a
            href={links.profile(uid)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {view.profile} <span aria-hidden="true">↗</span>
          </a>
          <a href={links.page(lang, uid)}>
            {view.explore} <span aria-hidden="true">→</span>
          </a>
        </span>
      ) : (
        !open && <span className="enter-hint">{view.hint}</span>
      )}
      {open && (
        <button
          type="button"
          className="close"
          aria-label={view.close}
          onClick={onClose}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M2 2l8 8M10 2l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
