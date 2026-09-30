import type { Lang } from "@/contexts/LanguageContext";
import { prefersReducedMotion } from "@/lib/scroll";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { CityCopy } from "./content";
import { Phrases } from "./parts";

/**
 * The community as a city: one dot per member. Members arrive sorted by
 * activity (posts and comments), so the most active ones form a bright centre
 * and quieter members spread towards the edge. Every dot opens that member's
 * public profile, and members can be found by name. When the map first comes
 * into view the lights come on from the centre outwards; after that a slow
 * wave and a wandering light keep the city alive without asking for attention.
 *
 * Data contract, produced by scripts/build-community-city.ts:
 * - `heat[i]` is a digit 0–9 for member i (members sorted most active first);
 * - `linked[i]` is member i's public profile id ("" when unknown);
 * - `names[i]` is member i's display name ("" when unknown).
 */
export interface CityData {
  version: 1;
  generatedAt: string;
  count: number;
  heat: string;
  linked: string[];
  names?: string[];
  demo?: boolean;
}

// Published once a month by .github/workflows/community-city.yml (see
// docs/community-city.md). The dev server reads the local snapshot instead.
const CITY_DATA_URL =
  "https://kwicxc1px65aokwa.public.blob.vercel-storage.com/community/city.json";
// Vite sets import.meta.env; the prerender runs under tsx, where it is absent.
const DEV = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);
const DATA_URL = DEV ? "/community/city.json" : CITY_DATA_URL;

const PROFILE_BASE = "https://www.superlinear.academy/u/";
const FALLBACK_COUNT = 20000;
// Cells beyond the member count stay empty, which softens the city's edge.
const SPARE_CELLS = 1.16;
const SNAP_CELLS = 3;
const MAX_MATCHES = 8;
// Quiet members stay faint; anyone who has posted or commented is clearly lit.
const ALPHA = [0.1, 0.15, 0.21, 0.5, 0.62, 0.72, 0.82, 0.9, 0.96, 1];
const IVORY = (0xe4 << 16) | (0xf1 << 8) | 0xf8;
const MINT = (0xa4 << 16) | (0xd4 << 8) | 0x8f;

// The prerender has no layout; measuring only makes sense in the browser.
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function isCityData(value: unknown): value is CityData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<CityData>;
  return (
    data.version === 1 &&
    typeof data.count === "number" &&
    data.count > 0 &&
    typeof data.heat === "string" &&
    data.heat.length === data.count &&
    /^[0-9]*$/.test(data.heat) &&
    Array.isArray(data.linked) &&
    data.linked.length <= data.count &&
    data.linked.every(id => id === "" || /^[a-z0-9]{4,24}$/i.test(id)) &&
    (data.names === undefined ||
      (Array.isArray(data.names) &&
        data.names.length <= data.count &&
        data.names.every(
          name => typeof name === "string" && name.length <= 80
        )))
  );
}

// Case, width and spacing do not matter when looking someone up.
const normalize = (value: string) =>
  value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");

// Small deterministic jitter so the centre is not a set of perfect rings.
function jitter(col: number, row: number) {
  const n = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

const longest = (values: string[]) =>
  values.reduce((a, b) => (b.length > a.length ? b : a), "");

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

function openProfile(id: string) {
  window.open(PROFILE_BASE + id, "_blank", "noopener,noreferrer");
}

interface Tip {
  member: number;
  x: number;
  y: number;
  sticky: boolean;
}

export default function CityField({
  lang,
  copy,
  action,
}: {
  lang: Lang;
  copy: CityCopy;
  /** The section's call to action, shown beside the caption. */
  action: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLAnchorElement>(null);
  const locateRef = useRef<(member: number) => Tip | null>(() => null);
  // When the map first came into view; the lights come on from then.
  const revealRef = useRef<number | null>(null);
  const [data, setData] = useState<CityData | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  // Load the member data shortly before the section scrolls into view.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let cancelled = false;
    const load = () => {
      fetch(DATA_URL)
        .then(response => (response.ok ? response.json() : null))
        .then(json => {
          if (!cancelled && isCityData(json)) setData(json);
        })
        .catch(() => {});
    };
    if (!("IntersectionObserver" in window)) {
      load();
      return () => {
        cancelled = true;
      };
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        load();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(wrap);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  // Draw the city and wire up hover, click and tap.
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const context = canvas?.getContext("2d");
    const overlayContext = overlay?.getContext("2d");
    if (!canvas || !overlay || !context || !overlayContext) return;

    const count = data?.count ?? FALLBACK_COUNT;
    const heat = data?.heat;
    const linked = data?.linked ?? [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 1;
    let rows = 1;
    let sx = 1;
    let sy = 1;
    let memberCell = new Int32Array(0);
    let cellMember = new Int32Array(0);
    let hovered = -1;
    // Safari reports clicks without pointerType, so remember the last pointer.
    let lastPointerType = "mouse";
    const reduced = prefersReducedMotion();

    // Per-member drawing data, rebuilt on every layout.
    let posX = new Float32Array(0);
    let posY = new Float32Array(0);
    let baseAlpha = new Float32Array(0);
    let phase = new Float32Array(0);
    let dotSize = new Uint8Array(0);
    let dotColor = new Uint32Array(0);
    let image: ImageData | null = null;
    let pixels = new Uint32Array(0);

    // A soft light moves through the city: it wanders on its own, follows the
    // mouse, and settles on a member found by search or by chance. Dots under
    // it brighten a little; none move, so hit tests stay exact.
    let lightX = -1;
    let lightY = -1;
    let pointerX = -1;
    let pointerY = -1;
    let pointerInside = false;

    // A few members who post and comment flare up for a moment at a time.
    const SPARKS = 7;
    const SPARK_LIFE = 1800;
    const sparkMember = new Int32Array(SPARKS).fill(-1);
    const sparkStart = new Float64Array(SPARKS);
    let activeCount = count;

    // Each dot sits slightly off its grid cell, like lights in a real city.
    const cellCenter = (cell: number) => {
      const col = cell % cols;
      const row = (cell / cols) | 0;
      return {
        x: (col + 0.5 + (jitter(row + 17, col + 31) - 0.5) * 0.7) * sx,
        y: (row + 0.5 + (jitter(col + 5, row + 11) - 0.5) * 0.7) * sy,
      };
    };

    const revealProgress = (time: number) => {
      if (revealRef.current === null) return 0;
      const p = Math.min(1, (time - revealRef.current) / 2600);
      return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    };

    const draw = (time: number) => {
      if (!image) return;
      pixels.fill(0);
      const still = reduced;
      const reveal = still ? 1 : revealProgress(time);
      const sigma = Math.min(110, width / dpr / 9) * dpr;
      const spread = 2 * sigma * sigma;
      const reach = spread * 4;
      const drift = time * 0.0012;
      for (let member = 0; member < count; member++) {
        const x = posX[member];
        const y = posY[member];
        let alpha = baseAlpha[member];
        if (!still) {
          // A slow wave of brightness travels across the whole city.
          const wave = Math.sin(phase[member] + drift);
          alpha = alpha * (0.86 + 0.14 * wave) + 0.035 * (wave + 1);
          const dx = x - lightX;
          const dy = y - lightY;
          const d2 = dx * dx + dy * dy;
          if (d2 < reach) alpha += 0.42 * Math.exp(-d2 / spread);
          // The lights come on from the centre (the most active) outwards.
          if (reveal < 1) {
            const on = (reveal * 1.35 - member / count) / 0.35;
            if (on <= 0) continue;
            if (on < 1) alpha *= on;
          }
        }
        if (alpha > 1) alpha = 1;
        const size = dotSize[member];
        const left = Math.round(x - size / 2);
        const top = Math.round(y - size / 2);
        if (left < 0 || top < 0 || left + size > width || top + size > height)
          continue;
        const color = (((alpha * 255) | 0) << 24) | dotColor[member];
        for (let row = 0; row < size; row++) {
          const offset = (top + row) * width + left;
          for (let col = 0; col < size; col++) pixels[offset + col] = color;
        }
      }
      if (!still && reveal >= 1) drawSparks(time);
      context.putImageData(image, 0, 0);
    };

    const drawSparks = (time: number) => {
      const unit = dpr > 1.5 ? 2 : 1;
      for (let i = 0; i < SPARKS; i++) {
        const age = time - sparkStart[i];
        if (sparkMember[i] < 0 || age > SPARK_LIFE) {
          sparkMember[i] = Math.floor(Math.random() * activeCount);
          sparkStart[i] = time + Math.random() * 1400;
          continue;
        }
        if (age < 0) continue;
        const glow = Math.pow(Math.sin((Math.PI * age) / SPARK_LIFE), 2);
        const x = Math.round(posX[sparkMember[i]]);
        const y = Math.round(posY[sparkMember[i]]);
        // A small soft cross: a bright centre and dimmer arms.
        const put = (px: number, py: number, alpha: number) => {
          if (px < 0 || py < 0 || px >= width || py >= height) return;
          pixels[py * width + px] = (((alpha * 255) | 0) << 24) | MINT;
        };
        for (let dy = -unit; dy <= unit; dy++)
          for (let dx = -unit; dx <= unit; dx++) put(x + dx, y + dy, glow);
        for (let k = unit + 1; k <= unit * 3; k++) {
          const arm = glow * 0.45 * (1 - (k - unit) / (unit * 2 + 1));
          put(x + k, y, arm);
          put(x - k, y, arm);
          put(x, y + k, arm);
          put(x, y - k, arm);
        }
      }
    };

    const moveLight = (time: number) => {
      let targetX = width * (0.5 + 0.38 * Math.sin(time * 0.00031));
      let targetY = height * (0.48 + 0.3 * Math.sin(time * 0.00047 + 1));
      if (pointerInside) {
        targetX = pointerX;
        targetY = pointerY;
      } else if (hovered >= 0 && hovered < count) {
        targetX = posX[hovered];
        targetY = posY[hovered];
      }
      lightX += (targetX - lightX) * 0.12;
      lightY += (targetY - lightY) * 0.12;
    };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.round(rect.width * dpr);
      height = Math.round(rect.height * dpr);
      canvas.width = overlay.width = width;
      canvas.height = overlay.height = height;

      const step = Math.sqrt((width * height) / (count * SPARE_CELLS));
      cols = Math.max(1, Math.ceil(width / step));
      rows = Math.max(1, Math.ceil(height / step));
      sx = width / cols;
      sy = height / rows;
      const cells = cols * rows;

      // Order cells from the centre outwards on an ellipse matching the canvas.
      const distance = new Float32Array(cells);
      const cellOrder = new Int32Array(cells);
      for (let cell = 0; cell < cells; cell++) {
        const col = cell % cols;
        const row = (cell / cols) | 0;
        const dx = ((col + 0.5) * sx - width / 2) / width;
        const dy = ((row + 0.5) * sy - height * 0.48) / height;
        distance[cell] =
          Math.sqrt(dx * dx + dy * dy) + jitter(col, row) * 0.035;
        cellOrder[cell] = cell;
      }
      cellOrder.sort((a, b) => distance[a] - distance[b]);

      memberCell = new Int32Array(count);
      cellMember = new Int32Array(cells).fill(-1);
      for (let member = 0; member < count && member < cells; member++) {
        memberCell[member] = cellOrder[member];
        cellMember[cellOrder[member]] = member;
      }

      posX = new Float32Array(count);
      posY = new Float32Array(count);
      baseAlpha = new Float32Array(count);
      phase = new Float32Array(count);
      dotSize = new Uint8Array(count);
      dotColor = new Uint32Array(count);
      const base = dpr > 1.5 ? 3 : 2;
      activeCount = count;
      for (let member = 0; member < count; member++) {
        const level = heat ? heat.charCodeAt(member) - 48 : 2;
        if (heat && level < 3 && activeCount === count) activeCount = member;
        const { x, y } = cellCenter(memberCell[member]);
        posX[member] = x;
        posY[member] = y;
        baseAlpha[member] = ALPHA[level];
        phase[member] = (x * 0.01 + y * 0.016) / dpr;
        dotSize[member] = level >= 6 ? base + 1 : base;
        dotColor[member] = level >= 7 ? MINT : IVORY;
      }
      if (activeCount < 1) activeCount = count;
      image = context.createImageData(width, height);
      pixels = new Uint32Array(image.data.buffer);
      if (lightX < 0) {
        lightX = width * 0.62;
        lightY = height * 0.45;
      }
      draw(performance.now());
      drawHover(hovered);
    };

    const drawHover = (member: number) => {
      overlayContext.clearRect(0, 0, width, height);
      if (member < 0 || member >= count) return;
      const { x, y } = cellCenter(memberCell[member]);
      overlayContext.beginPath();
      overlayContext.arc(x, y, 7 * dpr, 0, Math.PI * 2);
      overlayContext.strokeStyle = "rgba(143, 212, 164, 0.95)";
      overlayContext.lineWidth = 2 * dpr;
      overlayContext.stroke();
      overlayContext.fillStyle = "#f8f1e4";
      overlayContext.fillRect(x - 2 * dpr, y - 2 * dpr, 4 * dpr, 4 * dpr);
    };

    // Nearest linked member within a few cells, so small dots are easy to hit.
    const linkedMemberAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const px = (clientX - rect.left) * dpr;
      const py = (clientY - rect.top) * dpr;
      const col = Math.floor(px / sx);
      const row = Math.floor(py / sy);
      let best = -1;
      let bestDistance = Infinity;
      for (let dy = -SNAP_CELLS; dy <= SNAP_CELLS; dy++) {
        for (let dx = -SNAP_CELLS; dx <= SNAP_CELLS; dx++) {
          const c = col + dx;
          const r = row + dy;
          if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
          const member = cellMember[r * cols + c];
          if (member < 0 || member >= linked.length || !linked[member])
            continue;
          const center = cellCenter(r * cols + c);
          const d = (center.x - px) ** 2 + (center.y - py) ** 2;
          if (d < bestDistance) {
            bestDistance = d;
            best = member;
          }
        }
      }
      return best;
    };

    const tipFor = (member: number, sticky: boolean): Tip => {
      const { x, y } = cellCenter(memberCell[member]);
      return { member, x: x / dpr, y: y / dpr, sticky };
    };

    const setHovered = (member: number) => {
      if (member === hovered) return;
      hovered = member;
      drawHover(member);
    };

    locateRef.current = member => {
      if (member < 0 || member >= count) return null;
      setHovered(member);
      return tipFor(member, true);
    };

    const onPointerDown = (event: PointerEvent) => {
      lastPointerType = event.pointerType || "mouse";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const member = linkedMemberAt(event.clientX, event.clientY);
      setHovered(member);
      canvas.style.cursor = member >= 0 ? "pointer" : "default";
      setTip(current =>
        member < 0
          ? current?.sticky
            ? current
            : null
          : current?.member === member
            ? current
            : tipFor(member, false)
      );
    };

    const onPointerLeave = () => {
      setHovered(-1);
      setTip(current => (current?.sticky ? current : null));
    };

    const onClick = (event: MouseEvent) => {
      const member = linkedMemberAt(event.clientX, event.clientY);
      if (member < 0) {
        setHovered(-1);
        setTip(null);
        return;
      }
      if (lastPointerType === "touch" || lastPointerType === "pen") {
        // On touch screens, show the name first instead of leaving the page.
        setHovered(member);
        setTip(tipFor(member, true));
        return;
      }
      openProfile(linked[member]);
    };

    let frame = 0;
    let visible = false;
    let lastFrame = 0;
    const loop = (time: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      // About 30 frames a second is plenty for light this slow.
      if (time - lastFrame >= 32) {
        lastFrame = time;
        moveLight(time);
        draw(time);
      }
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!frame && visible && !reduced) frame = requestAnimationFrame(loop);
    };
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (entry && entry.intersectionRatio >= 0.35) {
          revealRef.current ??= performance.now();
        }
        if (visible) start();
      },
      { threshold: [0, 0.35] }
    );
    visibility.observe(canvas);
    const onPageVisibility = () => start();
    document.addEventListener("visibilitychange", onPageVisibility);

    const onLightMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) * dpr;
      pointerY = (event.clientY - rect.top) * dpr;
      pointerInside = true;
    };
    const onLightLeave = () => {
      pointerInside = false;
    };
    canvas.addEventListener("pointermove", onLightMove);
    canvas.addEventListener("pointerleave", onLightLeave);

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(canvas);
    layout();
    if (linked.length) {
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
      canvas.addEventListener("click", onClick);
    }
    return () => {
      resizeObserver.disconnect();
      visibility.disconnect();
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onPageVisibility);
      canvas.removeEventListener("pointermove", onLightMove);
      canvas.removeEventListener("pointerleave", onLightLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("click", onClick);
      canvas.style.cursor = "";
      locateRef.current = () => null;
    };
  }, [data]);

  const linked = data?.linked;
  const names = data?.names;
  const linkedCount = linked?.filter(Boolean).length ?? 0;
  const countText = data ? data.count.toLocaleString("en-US") : "";
  const caption = data ? copy.caption(countText) : copy.fallbackCaption;

  // Look members up by name: names that start with the query come first, and
  // within each group the more active member (lower index) wins.
  const searchIndex = useMemo(() => names?.map(normalize) ?? [], [names]);
  const matches = useMemo(() => {
    const term = normalize(query);
    if (!term || !linked) return [];
    const starts: number[] = [];
    const contains: number[] = [];
    for (let member = 0; member < searchIndex.length; member++) {
      if (!linked[member]) continue;
      const at = searchIndex[member].indexOf(term);
      if (at === 0) starts.push(member);
      else if (at > 0 && contains.length < MAX_MATCHES) contains.push(member);
      if (starts.length >= MAX_MATCHES) break;
    }
    return [...starts, ...contains].slice(0, MAX_MATCHES);
  }, [query, searchIndex, linked]);
  const showList = listOpen && query.trim() !== "";

  useEffect(() => setActive(0), [query]);

  // The highlighted search result lights up its dot on the map.
  useEffect(() => {
    if (!showList || matches[active] === undefined) return;
    const located = locateRef.current(matches[active]);
    if (located) setTip(located);
  }, [showList, matches, active]);

  // Keep the name inside the map, and below the dot near the top edge.
  useBrowserLayoutEffect(() => {
    const element = tipRef.current;
    const wrap = wrapRef.current;
    if (!element || !wrap || !tip) return;
    const half = element.offsetWidth / 2 + 8;
    element.style.left = `${Math.min(Math.max(tip.x, half), wrap.clientWidth - half)}px`;
  }, [tip]);

  const meetRandom = () => {
    if (!linked || !linkedCount) return;
    const candidates = linked
      .map((id, index) => (id ? index : -1))
      .filter(index => index >= 0);
    const member = candidates[Math.floor(Math.random() * candidates.length)];
    const located = locateRef.current(member);
    if (located) setTip(located);
    openProfile(linked[member]);
  };

  const onFindKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!matches.length) return;
      event.preventDefault();
      setListOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(index => (index + step + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      const member = matches[active];
      if (member === undefined || !linked) return;
      event.preventDefault();
      openProfile(linked[member]);
    } else if (event.key === "Escape") {
      if (showList) setListOpen(false);
      else setQuery("");
    }
  };

  const tipId = tip ? linked?.[tip.member] : undefined;
  const tipName = tip ? names?.[tip.member] : undefined;

  // While the data loads, the caption keeps the height of its longest version
  // (drawn invisibly by CSS), so the sections below never move.
  const sample = "88,888";
  const reserve = DATA_URL
    ? {
        "data-lines": [
          longest([copy.caption(sample)[0], copy.fallbackCaption[0]]),
          copy.caption(sample)[1],
        ].join("\n"),
        "data-note": copy.updated(
          lang === "en" ? "September 28, 2026" : "2026年12月28日"
        ),
      }
    : {};

  return (
    <div className="city-map rv">
      {/* Always rendered, so the map does not move when the data arrives. */}
      <div
        className={names?.length ? "city-tools" : "city-tools idle"}
        aria-hidden={names?.length ? undefined : true}
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
            disabled={!names?.length}
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
                  onClick={() => linked && openProfile(linked[member])}
                >
                  <span>{names?.[member]}</span>
                  <span aria-hidden="true">↗</span>
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
          aria-label={data ? copy.label(countText) : copy.fallbackLabel}
        />
        <canvas ref={overlayRef} className="dots-overlay" aria-hidden="true" />
        {tip && tipId && (
          <a
            ref={tipRef}
            className={[
              "city-tip",
              tip.sticky ? "sticky" : "",
              tip.y < 52 ? "below" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            href={PROFILE_BASE + tipId}
            target="_blank"
            rel="noopener noreferrer"
            style={{ left: tip.x, top: tip.y }}
            tabIndex={tip.sticky ? 0 : -1}
            aria-label={tipName ? copy.openNamed(tipName) : copy.open}
          >
            <span className="who">{tipName || copy.open}</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
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
              <small>
                {data.demo
                  ? copy.demo
                  : copy.updated(formatDate(data.generatedAt, lang))}
              </small>
            )}
          </p>
        </div>
        {action}
      </div>
    </div>
  );
}
