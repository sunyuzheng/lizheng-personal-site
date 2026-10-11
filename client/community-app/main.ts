/**
 * community.lizheng.ai: Superlinear Academy as a city at night. Every member
 * is a light on rings set by when they joined; a line lights up between two
 * members wherever one has commented on or liked the other's post or comment.
 *
 * On arrival the city builds itself month by month from August 2024; after
 * that it turns slowly, and lines that were busy recently carry small pulses.
 * Hover a light to see its lines, click to focus on one person and walk from
 * them to the people they know best. Data: scripts/build-community-graph.ts.
 */
import { attachGestures, Camera } from "./camera";
import { COPY, formatNumber, type Copy, type Lang } from "./copy";
import {
  calendar,
  decode,
  isGraphFile,
  otherOf,
  ringRadius,
  type Community,
} from "./data";
import {
  CURVE,
  Renderer,
  type AvatarSprite,
  type Pulse,
  type Scene,
} from "./renderer";
import "./style.css";

// Serif fonts load after first paint (see fonts.css).
void import("./fonts.css");

// Published by the monthly workflow (docs/community-graph.md); the dev server
// reads the local file written by `pnpm community:graph`.
const GRAPH_URL =
  "https://kwicxc1px65aokwa.public.blob.vercel-storage.com/community/graph.json";
const DATA_URL = import.meta.env.DEV ? "/community/graph.json" : GRAPH_URL;
const PROFILE_BASE = "https://www.superlinear.academy/u/";
const INTRO_SECONDS = 13;
const IDLE_SPIN = 0.018; // radians per second, about one turn in six minutes
const IDLE_AFTER = 5000;

// English at community.lizheng.ai/en (?lang=en also works, for local checks).
const lang: Lang =
  /^\/en(\/|$)/.test(location.pathname) ||
  new URLSearchParams(location.search).get("lang") === "en"
    ? "en"
    : "zh";
const t: Copy = COPY[lang];

const $ = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const city = $("city");
const sky = $<HTMLCanvasElement>("sky");
const guides = $<HTMLCanvasElement>("guides");
const namesLayer = $("names");
const panel = $("panel");
const tip = $("tip");
const hint = $("hint");
const statusLine = $("status");
const findInput = $<HTMLInputElement>("find-input");
const findList = $<HTMLUListElement>("find-list");
const randomButton = $<HTMLButtonElement>("random");
const monthInput = $<HTMLInputElement>("month");
const playButton = $<HTMLButtonElement>("play");
const dateLabel = $("date");
const growthLabel = $("growth");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;

function applyCopy() {
  document.documentElement.lang = t.htmlLang;
  document.title = t.title;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", t.description);
  for (const element of document.querySelectorAll<HTMLElement>("[data-copy]")) {
    const path = element.dataset.copy!.split(".");
    let value: unknown = t;
    for (const key of path) value = (value as Record<string, unknown>)?.[key];
    if (typeof value === "string") element.textContent = value;
  }
  findInput.placeholder = t.find.placeholder;
  if (lang === "en") {
    $<HTMLAnchorElement>("home").href = "https://www.lizheng.ai/en";
  }
}

applyCopy();

function fail(message: string) {
  statusLine.textContent = message;
  statusLine.classList.remove("off");
  statusLine.style.animation = "none";
}

async function load() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(String(response.status));
    const json = await response.json();
    if (!isGraphFile(json)) throw new Error("bad data");
    return decode(json);
  } catch {
    fail(t.failed);
    return null;
  }
}

/** A small deterministic hash for per-member variety. */
function hash(i: number) {
  const n = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function buildScene(c: Community): Scene {
  const n = c.count;
  const size = new Float32Array(n);
  const glow = new Float32Array(n);
  const tint = new Float32Array(n);
  const joined = new Float32Array(n);
  const first = new Float32Array(n);
  const pos = new Float32Array(n * 2);
  let maxStrength = 1;
  for (let i = 0; i < n; i++)
    if (c.strength[i] > maxStrength) maxStrength = c.strength[i];
  for (let i = 0; i < n; i++) {
    pos[i * 2] = c.x[i];
    pos[i * 2 + 1] = c.y[i];
    joined[i] = c.joined[i];
    first[i] = Number.isFinite(c.firstLink[i]) ? c.firstLink[i] : 1e6;
    // At the overview, lights sit about four pixels apart, so most stay
    // small; only people with many connections grow into bright stars.
    if (c.degree[i]) {
      size[i] = 0.7 + 0.3 * Math.log2(1 + c.degree[i]);
      glow[i] =
        0.32 +
        0.6 *
          Math.min(1, Math.log(1 + c.strength[i]) / Math.log(1 + maxStrength));
    } else {
      size[i] = 0.6;
      glow[i] = 0.14 + 0.05 * Math.min(2, c.heat[i]) + 0.04 * hash(i);
    }
    tint[i] = c.heat[i] >= 7 ? 1 : 0;
  }
  const m = c.pairCount;
  const edgeWeight = new Float32Array(m);
  const edgeFirst = new Float32Array(m);
  for (let k = 0; k < m; k++) {
    const w = c.likes[k] + 3 * c.pairComments[k];
    const brightness =
      0.55 + 0.45 * Math.min(1, Math.log(1 + w) / Math.log(61));
    // Staff lines are marked negative: the shader shows them only around a
    // person being looked at.
    edgeWeight[k] =
      c.staff.has(c.pairA[k]) || c.staff.has(c.pairB[k])
        ? -brightness
        : brightness;
    edgeFirst[k] = c.pairFirst[k];
  }
  return {
    count: n,
    pos,
    size,
    glow,
    tint,
    joined,
    first,
    edges: m,
    edgeA: c.pairA,
    edgeB: c.pairB,
    edgeTie: c.tie,
    edgeWeight,
    edgeFirst,
  };
}

/** A grid over world space for finding the light under the pointer. */
class Grid {
  private cells = new Map<number, number[]>();
  constructor(
    private c: Community,
    private size = 0.025
  ) {
    for (let i = 0; i < c.count; i++) {
      const key = this.key(
        Math.floor(c.x[i] / size),
        Math.floor(c.y[i] / size)
      );
      let cell = this.cells.get(key);
      if (!cell) this.cells.set(key, (cell = []));
      cell.push(i);
    }
  }
  private key(gx: number, gy: number) {
    return (gx + 1000) * 4000 + (gy + 1000);
  }
  /** Members within radius (world units) of (x, y), nearest first. */
  near(x: number, y: number, radius: number) {
    const found: { member: number; d: number }[] = [];
    const reach = Math.ceil(radius / this.size);
    const gx = Math.floor(x / this.size);
    const gy = Math.floor(y / this.size);
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const cell = this.cells.get(this.key(gx + dx, gy + dy));
        if (!cell) continue;
        for (const member of cell) {
          const d = Math.hypot(this.c.x[member] - x, this.c.y[member] - y);
          if (d <= radius) found.push({ member, d });
        }
      }
    }
    return found.sort((p, q) => p.d - q.d);
  }
}

const normalize = (value: string) =>
  value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");

function displayName(c: Community, member: number) {
  return c.names[member] || t.noName;
}

function start(c: Community) {
  let renderer: Renderer;
  const scene = buildScene(c);
  try {
    renderer = new Renderer(sky, scene, { segments: coarse ? 7 : 12 });
  } catch {
    fail(t.fallback);
    return;
  }
  statusLine.classList.add("off");
  sky.setAttribute("aria-label", t.canvasLabel(c.count, c.pairCount));
  const grid = new Grid(c);
  const camera = new Camera();
  const guideContext = guides.getContext("2d")!;

  // ---------- Stats and note ----------
  let peerPairs = 0;
  for (let k = 0; k < c.pairCount; k++) {
    if (!c.staff.has(c.pairA[k]) && !c.staff.has(c.pairB[k])) peerPairs++;
  }
  const statValues: Record<string, string> = {
    members: formatNumber(c.count),
    pairs: formatNumber(c.pairCount),
    peers: `${Math.round((peerPairs / Math.max(1, c.pairCount)) * 100)}%`,
  };
  for (const element of document.querySelectorAll<HTMLElement>("[data-stat]")) {
    element.textContent = statValues[element.dataset.stat!] ?? "";
  }
  $("stats").classList.add("ready");
  $("note").textContent = t.note(t.date(c.generatedAt));

  // ---------- The page's words, which lights' names and faces keep clear of ----------
  let uiRects: DOMRect[] = [];
  const refreshUiRects = () => {
    uiRects = [
      document.querySelector(".intro"),
      document.querySelector(".bar"),
      panel,
      $("find"),
    ]
      .filter(
        (element): element is HTMLElement =>
          !!element && !(element as HTMLElement).hidden
      )
      .map(element => element.getBoundingClientRect());
  };
  const underUi = (x: number, y: number, pad: number) =>
    uiRects.some(
      r =>
        x > r.left - pad &&
        x < r.right + pad &&
        y > r.top - pad &&
        y < r.bottom + pad
    );

  // ---------- Layout and fitting ----------
  let fitZoom = 300;
  let userMoved = false;
  const layoutView = () => {
    const rect = city.getBoundingClientRect();
    camera.width = Math.max(1, rect.width);
    camera.height = Math.max(1, rect.height);
    camera.dpr = Math.min(2, window.devicePixelRatio || 1);
    sky.width = Math.round(camera.width * camera.dpr);
    sky.height = Math.round(camera.height * camera.dpr);
    guides.width = sky.width;
    guides.height = sky.height;
    const mobile = camera.width < 760;
    // Leave room for the words above and below the city.
    const top = mobile ? 190 : 40;
    const bottom = mobile ? 250 : 130;
    const usableH = camera.height - top - bottom;
    const usableW = mobile ? camera.width - 24 : camera.width - 80;
    fitZoom = Math.max(40, Math.min(usableW, usableH) / 2 / 1.04);
    camera.minZoom = fitZoom * 0.45;
    camera.maxZoom = fitZoom * 60;
    baseOffset = {
      x: mobile
        ? 0
        : Math.min(
            camera.width * 0.07,
            Math.max(0, camera.width / 2 - camera.height / 2) * 0.5
          ),
      y: (top - bottom) / 2,
    };
    if (!selected.length) {
      camera.offsetX = baseOffset.x;
      camera.offsetY = baseOffset.y;
    }
    if (!userMoved && !introRunning) {
      camera.zoom = fitZoom;
      camera.cx = 0;
      camera.cy = 0;
    }
    refreshUiRects();
  };
  let baseOffset = { x: 0, y: 0 };

  // ---------- State ----------
  let month = c.months; // fractional month index being shown
  let introRunning = false;
  let introStart = 0;
  let playing = false;
  let playStart = 0;
  let playFrom = 0;
  let lastInteraction = performance.now();
  let hovered = -1;
  let selected: number[] = []; // history of focused members, last is current
  let focusLevel = 0;
  let hoverLevel = 0;
  const pulses: {
    pair: number;
    start: number;
    duration: number;
    forward: boolean;
  }[] = [];
  let lastPulse = 0;

  const current = () => (selected.length ? selected[selected.length - 1] : -1);

  // ---------- Months ----------
  const monthAt = (value: number) =>
    Math.max(0, Math.min(c.months - 1, Math.floor(value)));
  const updateTimeLabels = () => {
    const index = monthAt(month);
    const { year, month: m } = calendar(c, index);
    dateLabel.textContent = t.month(year, m);
    growthLabel.textContent = t.growth(
      c.membersByMonth[index],
      c.pairsByMonth[index]
    );
    monthInput.value = String(month);
    const progress = (month / c.months) * 100;
    monthInput.style.setProperty("--progress", `${progress}%`);
  };
  monthInput.max = String(c.months);
  monthInput.value = String(c.months);

  const setPlayLabel = () => {
    playButton.textContent =
      playing || introRunning ? t.pause : month >= c.months ? t.replay : t.play;
  };

  // ---------- Highlight ----------
  const applyHighlight = () => {
    const nodes = new Map<number, number>();
    const edges = new Map<number, number>();
    const focus = current();
    const source = focus >= 0 ? focus : hovered;
    if (source >= 0) {
      nodes.set(source, 2);
      for (let k = c.offsets[source]; k < c.offsets[source + 1]; k++) {
        const pair = c.adjacency[k];
        edges.set(pair, focus >= 0 ? 2 : 1);
        const other = otherOf(c, pair, source);
        if (!nodes.has(other)) nodes.set(other, 1);
      }
    }
    renderer.setHighlight(nodes, edges);
  };

  // ---------- Names on the map ----------
  const POOL = coarse ? 18 : 44;
  const pool: HTMLDivElement[] = [];
  const poolText: string[] = [];
  for (let i = 0; i < POOL; i++) {
    const element = document.createElement("div");
    element.className = "name";
    namesLayer.appendChild(element);
    pool.push(element);
    poolText.push("");
  }
  const RING_POOL = 6;
  const ringPool: HTMLDivElement[] = [];
  for (let i = 0; i < RING_POOL; i++) {
    const element = document.createElement("div");
    element.className = "name ring";
    namesLayer.appendChild(element);
    ringPool.push(element);
  }
  // Rings at the start of each half year.
  const ringMarks: { month: number; label: string; radius: number }[] = [];
  for (let index = 1; index < c.months; index++) {
    const { year, month: m } = calendar(c, index);
    if (m === 1 || m === 7)
      ringMarks.push({
        month: index,
        label: t.ringLabel(year, m),
        radius: ringRadius(c, index),
      });
  }

  const textWidth = (text: string, size: number) => {
    let width = 0;
    for (const ch of text)
      width += ch.charCodeAt(0) > 0x2e80 ? size : size * 0.58;
    return width;
  };

  /**
   * Faces and names for this frame, placed together person by person, most
   * important first: the focused person, then the people they know best (or,
   * with no focus, the most connected people on screen). A person gets a face
   * and a name only where both fit clear of the page's words and of everyone
   * placed before them; otherwise they stay a light (hover shows who it is).
   */
  const placePeople = (): AvatarSprite[] => {
    const focus = current();
    const w = camera.width;
    const h = camera.height;
    const cellSize = 8;
    const cols = Math.ceil(w / cellSize) + 1;
    const occupied = new Uint8Array(cols * (Math.ceil(h / cellSize) + 1));
    const area = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      take: boolean
    ) => {
      const c0 = Math.max(0, Math.floor(x0 / cellSize));
      const c1 = Math.min(cols - 1, Math.floor(x1 / cellSize));
      const r0 = Math.max(0, Math.floor(y0 / cellSize));
      const r1 = Math.floor(y1 / cellSize);
      for (let r = r0; r <= r1; r++) {
        for (let col = c0; col <= c1; col++) {
          const index = r * cols + col;
          if (index >= occupied.length) continue;
          if (!take && occupied[index]) return false;
          if (take) occupied[index] = 1;
        }
      }
      return true;
    };
    for (const rect of uiRects)
      area(rect.left - 6, rect.top - 6, rect.right + 6, rect.bottom + 6, true);

    const zoomRatio = camera.zoom / fitZoom;
    if (zoomRatio > 2.4 || focus >= 0) loadAtlas();
    const facesOn = atlasReady && (focus >= 0 || zoomRatio >= 3.2);
    const faceFade = focus >= 0 ? 1 : Math.min(1, (zoomRatio - 3.2) / 1.5);
    const nameBudget =
      focus >= 0
        ? POOL
        : Math.round(Math.min(POOL, 7 * Math.pow(zoomRatio, 1.1)));

    const candidates: { member: number; level: "focus" | "big" | "plain" }[] =
      [];
    if (focus >= 0) {
      candidates.push({ member: focus, level: "focus" });
      for (const { member } of neighboursOf(focus).slice(0, 120))
        candidates.push({ member, level: "plain" });
    } else if (!introRunning || month > 3) {
      if (hovered >= 0) candidates.push({ member: hovered, level: "big" });
      const limit = Math.min(
        c.ranked.length,
        facesOn ? 3000 : nameBudget * 12 + 40
      );
      for (let k = 0; k < limit; k++)
        candidates.push({
          member: c.ranked[k],
          level: k < 6 ? "big" : "plain",
        });
    }

    const sprites: AvatarSprite[] = [];
    const seen = new Set<number>();
    let names = 0;
    for (const { member, level } of candidates) {
      if (seen.has(member)) continue;
      seen.add(member);
      if (names >= POOL && sprites.length >= 160) break;
      if (month < c.firstLink[member] && level !== "focus") continue;
      const [sx, sy] = camera.toScreen(c.x[member], c.y[member]);
      if (sx < -30 || sy < -20 || sx > w + 30 || sy > h + 20) continue;
      const isFocus = level === "focus";
      const hasFace =
        facesOn && c.avatarCell[member] >= 0 && sprites.length < 160;
      const r = !hasFace
        ? 0
        : isFocus
          ? 22
          : Math.min(16, 6 + Math.log2(1 + c.degree[member]) * 1.3) *
            Math.min(1.3, Math.max(0.8, Math.sqrt(zoomRatio / 5)));
      const name = names < nameBudget || isFocus ? c.names[member] : "";
      const size = isFocus ? 17 : level === "big" ? 13.5 : 12;
      const gap = r ? r + 5 : 7;
      const width = name ? textWidth(name, size) + 6 : 0;
      // The person's footprint: the face (or light) and the name beside it.
      const left = sx - Math.max(r, 4) - 2;
      const top = Math.min(sy - Math.max(r, 4), sy - size * 0.65) - 2;
      const right = name ? sx + gap + width : sx + Math.max(r, 4) + 2;
      const bottom = Math.max(sy + Math.max(r, 4), sy + size * 0.65) + 2;
      // Names never run off the screen.
      const onScreen =
        left >= 4 && top >= 4 && right <= w - 4 && bottom <= h - 4;
      const fits = onScreen && area(left, top, right, bottom, false);
      if (!fits && !isFocus) {
        // No room for the name: a face alone may still fit.
        if (!r || !area(sx - r - 2, sy - r - 2, sx + r + 2, sy + r + 2, false))
          continue;
        area(sx - r - 2, sy - r - 2, sx + r + 2, sy + r + 2, true);
        sprites.push({
          x: sx * camera.dpr,
          y: sy * camera.dpr,
          radius: r * camera.dpr,
          cell: c.avatarCell[member],
          alpha: faceFade,
          ring: 0,
        });
        continue;
      }
      area(left, top, right, bottom, true);
      if (r) {
        sprites.push({
          x: sx * camera.dpr,
          y: sy * camera.dpr,
          radius: r * camera.dpr,
          cell: c.avatarCell[member],
          alpha: faceFade,
          ring: isFocus ? 1 : 0,
        });
      }
      if (name && names < POOL) {
        const element = pool[names];
        if (poolText[names] !== name) {
          element.textContent = name;
          poolText[names] = name;
        }
        element.className = `name on ${level === "plain" ? "" : level}`;
        // The element's own padding adds 9px before the text.
        element.style.transform = `translate3d(${(sx + gap - 9).toFixed(1)}px, ${(sy - size * 0.55).toFixed(1)}px, 0)`;
        names++;
      }
    }
    for (let i = names; i < POOL; i++) pool[i].className = "name";

    // Ring labels sit on each ring towards the upper right, upright.
    let ringsUsed = 0;
    const center = camera.toScreen(0, 0);
    const labelAngle = -Math.PI * 0.3;
    for (const mark of ringMarks) {
      if (ringsUsed >= RING_POOL || mark.month > month) break;
      const r = mark.radius * camera.zoom;
      if (r < 90) continue;
      const lx = center[0] + Math.cos(labelAngle) * r + 6;
      const ly = center[1] + Math.sin(labelAngle) * r - 6;
      if (lx < 0 || ly < 0 || lx > w - 60 || ly > h) continue;
      const lw = textWidth(mark.label, 11.5) + 8;
      if (!area(lx, ly - 2, lx + lw, ly + 14, false)) continue;
      area(lx, ly - 2, lx + lw, ly + 14, true);
      const element = ringPool[ringsUsed++];
      element.textContent = mark.label;
      element.className = "name ring on";
      element.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`;
    }
    for (let i = ringsUsed; i < RING_POOL; i++)
      ringPool[i].className = "name ring";
    return sprites;
  };

  // ---------- Guides (rings) and the focus ring ----------
  const drawGuides = (time: number) => {
    const g = guideContext;
    const dpr = camera.dpr;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, guides.width, guides.height);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const [cx, cy] = camera.toScreen(0, 0);
    g.lineWidth = 1;
    g.setLineDash([2, 5]);
    for (const mark of ringMarks) {
      if (mark.month > month) break;
      const r = mark.radius * camera.zoom;
      if (r < 70) continue;
      g.strokeStyle = `rgba(248, 241, 228, ${0.09 * (1 - focusLevel * 0.6)})`;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
    }
    g.setLineDash([]);
    const ringFor = (member: number, alpha: number, radius: number) => {
      const [x, y] = camera.toScreen(c.x[member], c.y[member]);
      g.strokeStyle = `rgba(143, 212, 164, ${alpha})`;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, radius, 0, Math.PI * 2);
      g.stroke();
    };
    const focus = current();
    if (focus >= 0)
      ringFor(focus, 0.9 * focusLevel, 9 + Math.sin(time / 500) * 1.2);
    if (hovered >= 0 && hovered !== focus) ringFor(hovered, 0.75, 7);
  };

  // ---------- Neighbours ----------
  const neighboursOf = (member: number) => {
    const list: { member: number; pair: number; weight: number }[] = [];
    for (let k = c.offsets[member]; k < c.offsets[member + 1]; k++) {
      const pair = c.adjacency[k];
      const other = otherOf(c, pair, member);
      list.push({
        member: other,
        pair,
        weight: c.tie[pair] * 1000 + c.likes[pair] + 3 * c.pairComments[pair],
      });
    }
    return list.sort((p, q) => q.weight - p.weight);
  };

  // ---------- Panel ----------
  const escapeHtml = (value: string) =>
    value.replace(
      /[&<>"']/g,
      ch =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch]!
    );
  const initial = (name: string) => (name ? [...name][0].toUpperCase() : "·");
  // Faces come from the picture sheet (loaded the first time someone is
  // looked at); people without a picture get their initial.
  const faceHtml = (member: number, size: number) => {
    const cell = c.avatarCell[member];
    if (cell < 0 || !c.avatars) {
      return `<span class="face" aria-hidden="true">${escapeHtml(initial(c.names[member]))}</span>`;
    }
    loadAtlas();
    const { columns, rows } = c.avatars;
    const style = `background-image:url('${atlasUrl}');background-size:${columns * size}px ${rows * size}px;background-position:-${(cell % columns) * size}px -${Math.floor(cell / columns) * size}px`;
    return `<span class="face photo" aria-hidden="true" style="${style}"></span>`;
  };

  let showAll = false;
  const renderPanel = (member: number) => {
    const name = displayName(c, member);
    const { year, month: m } = calendar(c, Math.max(0, c.joined[member]));
    const neighbours = neighboursOf(member);
    const counts = [0, 0, 0, 0];
    for (const { pair } of neighbours) counts[c.tie[pair]]++;
    const total = neighbours.length;
    const activity = t.activity(c.posts[member], c.comments[member]);
    const shown = showAll ? neighbours : neighbours.slice(0, 40);
    const rows = shown
      .map(({ member: other, pair }) => {
        const since = calendar(c, c.pairFirst[pair]);
        const detail = [
          t.pairDetail(c.pairComments[pair], c.likes[pair]),
          t.since(since.year, since.month),
        ]
          .filter(Boolean)
          .join(" · ");
        return `<li><button type="button" data-member="${other}">${faceHtml(other, 26)}<span><span class="who">${escapeHtml(displayName(c, other))}</span><span class="detail">${escapeHtml(detail)}</span></span><span class="kind k${c.tie[pair]}">${t.ties[c.tie[pair] - 1]}</span></button></li>`;
      })
      .join("");
    const mix = total
      ? `<div class="mix" aria-hidden="true">${[3, 2, 1]
          .map(k =>
            counts[k]
              ? `<i class="m${k}" style="width:${((counts[k] / total) * 100).toFixed(2)}%"></i>`
              : ""
          )
          .join("")}</div><div class="mix-key">${[3, 2, 1]
          .map(k =>
            counts[k]
              ? `<span>${t.ties[k - 1]}<b>${formatNumber(counts[k])}</b></span>`
              : ""
          )
          .join("")}</div>`
      : "";
    const link = c.linked[member]
      ? `<a href="${PROFILE_BASE}${c.linked[member]}" target="_blank" rel="noopener">${t.profile} ↗</a>`
      : "<span></span>";
    panel.innerHTML = `
      <div class="panel-head">
        <button type="button" class="text-button panel-close" data-close>${t.close}</button>
        <div class="person">
          ${faceHtml(member, 52)}
          <div>
            <h2>${escapeHtml(name)}${c.staff.has(member) ? `<span class="badge">${t.staff}</span>` : ""}</h2>
            <p>${escapeHtml(t.joined(year, m))}${activity ? ` · ${escapeHtml(activity)}` : ""}</p>
          </div>
        </div>
        <div class="summary"><strong>${total ? escapeHtml(t.connected(total)) : t.alone}</strong></div>
        ${mix}
      </div>
      <div class="panel-body">
        ${total ? `<h3>${t.closest}</h3><ul class="people">${rows}</ul>` : ""}
        ${!showAll && total > shown.length ? `<button type="button" class="text-button more" data-more>${t.more(total - shown.length)}</button>` : ""}
      </div>
      <div class="panel-foot">${link}<button type="button" class="text-button" data-share>${t.share}</button></div>`;
    panel.hidden = false;
    refreshUiRects();
  };

  panel.addEventListener("click", event => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLElement>("[data-member]");
    if (button) {
      focusOn(Number(button.dataset.member), { push: true });
      return;
    }
    if (target.closest("[data-close]")) {
      clearFocus();
      return;
    }
    if (target.closest("[data-more]")) {
      showAll = true;
      renderPanel(current());
      return;
    }
    const share = target.closest<HTMLButtonElement>("[data-share]");
    if (share) {
      const url = `${location.origin}${location.pathname}#${c.linked[current()]}`;
      navigator.clipboard?.writeText(url).then(
        () => {
          share.textContent = t.copied;
          setTimeout(() => (share.textContent = t.share), 1600);
        },
        () => {}
      );
    }
  });

  // ---------- Focus ----------
  const focusOn = (
    member: number,
    options: { push?: boolean; fly?: boolean } = {}
  ) => {
    if (member < 0 || member >= c.count) return;
    finishIntro();
    if (options.push && selected[selected.length - 1] !== member)
      selected.push(member);
    else selected = [member];
    showAll = false;
    hovered = -1;
    tip.hidden = true;
    renderPanel(member);
    applyHighlight();
    // Each person gets their own address, so back and forward walk between them.
    const address = c.linked[member]
      ? `#${c.linked[member]}`
      : location.pathname + location.search;
    if (location.hash !== (c.linked[member] ? `#${c.linked[member]}` : ""))
      history.pushState(null, "", address);
    city.classList.add("focused");
    refreshUiRects();
    if (options.fly === false) return;
    // Frame the person and the people they know best in the space the panel
    // and the title leave free.
    const mobile = camera.width < 760;
    // The person and their nearer connections (the farthest 15% of a busy
    // person's lines may run off screen), measured as the screen is turned.
    const ranked = neighboursOf(member).slice(0, 80);
    const cos = Math.cos(camera.angle);
    const sin = Math.sin(camera.angle);
    const turned = (i: number) => [
      c.x[i] * cos - c.y[i] * sin,
      c.x[i] * sin + c.y[i] * cos,
    ];
    const [px, py] = turned(member);
    const others = ranked
      .map(({ member: other }) => turned(other))
      .sort(
        (p, q) =>
          Math.hypot(p[0] - px, p[1] - py) - Math.hypot(q[0] - px, q[1] - py)
      );
    const kept = others.slice(
      0,
      Math.max(1, Math.ceil(others.length * (others.length > 6 ? 0.85 : 1)))
    );
    let minX = px;
    let maxX = px;
    let minY = py;
    let maxY = py;
    for (const [x, y] of kept) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    const panelRect = panel.getBoundingClientRect();
    const introRect = document.querySelector(".intro")!.getBoundingClientRect();
    const free = mobile
      ? {
          left: 0,
          right: camera.width,
          top: introRect.bottom + 8,
          bottom: panelRect.top - 8,
        }
      : {
          left: 0,
          right: panelRect.left - 20,
          top: 0,
          bottom: camera.height - 120,
        };
    const freeW = free.right - free.left - 80;
    const freeH = free.bottom - free.top - 60;
    const spanX = Math.max(0.04, maxX - minX);
    const spanY = Math.max(0.04, maxY - minY);
    const zoom = Math.min(
      fitZoom * 14,
      Math.max(fitZoom * 0.6, Math.min(freeW / spanX, freeH / spanY))
    );
    // Centre the box in the free space (turned back into the city's frame).
    const qx = (minX + maxX) / 2;
    const qy = (minY + maxY) / 2;
    const target = { cx: qx * cos + qy * sin, cy: -qx * sin + qy * cos };
    camera.offsetX = (free.left + free.right) / 2 - camera.width / 2;
    camera.offsetY = (free.top + free.bottom) / 2 - camera.height / 2;
    camera.flyTo({ ...target, zoom }, 1200);
    userMoved = true;
  };

  const clearFocus = () => {
    selected = [];
    panel.hidden = true;
    city.classList.remove("focused");
    refreshUiRects();
    applyHighlight();
    if (location.hash)
      history.pushState(null, "", location.pathname + location.search);
    camera.offsetX = baseOffset.x;
    camera.offsetY = baseOffset.y;
  };

  // ---------- Hover card ----------
  const showTip = (member: number, sx: number, sy: number) => {
    tip.innerHTML = `<b>${escapeHtml(displayName(c, member))}</b><span>${escapeHtml(summaryOf(member))}</span>`;
    tip.hidden = false;
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    let x = sx + 16;
    let y = sy - height - 12;
    if (x + width > camera.width - 12) x = sx - width - 16;
    if (y < 12) y = sy + 16;
    tip.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const memberAt = (sx: number, sy: number) => {
    const [wx, wy] = camera.toWorld(sx, sy);
    const radius = (coarse ? 22 : 14) / camera.zoom;
    const near = grid.near(wx, wy, radius);
    // Prefer lit, connected people over faint ones nearby.
    let best = -1;
    let bestScore = Infinity;
    for (const { member, d } of near) {
      if (c.joined[member] > month) continue;
      const lit = c.degree[member] && month >= c.firstLink[member];
      const score =
        d * camera.zoom - (lit ? 6 + Math.log2(1 + c.degree[member]) : 0);
      if (score < bestScore) {
        bestScore = score;
        best = member;
      }
    }
    return best;
  };

  // ---------- Intro and playback ----------
  const finishIntro = () => {
    if (!introRunning && !playing) return;
    const wasIntro = introRunning;
    introRunning = false;
    playing = false;
    month = c.months;
    updateTimeLabels();
    setPlayLabel();
    // Pull back to the whole city unless the user has taken the camera.
    if (wasIntro && !userMoved)
      camera.flyTo({ cx: 0, cy: 0, zoom: fitZoom }, 900);
  };

  const startIntro = () => {
    introRunning = true;
    introStart = performance.now();
    month = -0.3;
    selected = [];
    panel.hidden = true;
    applyHighlight();
    camera.angle = 0;
    setPlayLabel();
  };

  const visibleRadius = (value: number) => {
    const index = Math.max(0, Math.min(c.months - 1, Math.floor(value)));
    const members = c.membersByMonth[index];
    return Math.sqrt(Math.max(members, 30) / c.count);
  };

  // ---------- Pulses ----------
  const recentPairs: number[] = [];
  for (let k = 0; k < c.pairCount; k++)
    if (c.pairLast[k] >= c.months - 2 && c.tie[k] >= 2) recentPairs.push(k);

  const curvePoint = (pair: number, s: number) => {
    const a = c.pairA[pair];
    const b = c.pairB[pair];
    const x0 = c.x[a];
    const y0 = c.y[a];
    const x2 = c.x[b];
    const y2 = c.y[b];
    const dx = x2 - x0;
    const dy = y2 - y0;
    // Same bend as the shader: the control point sits off the chord's middle.
    const x1 = (x0 + x2) / 2 - dy * CURVE;
    const y1 = (y0 + y2) / 2 + dx * CURVE;
    const u = 1 - s;
    return [
      u * u * x0 + 2 * u * s * x1 + s * s * x2,
      u * u * y0 + 2 * u * s * y1 + s * s * y2,
    ];
  };

  const updatePulses = (now: number) => {
    const out: Pulse[] = [];
    if (reducedMotion || introRunning || playing || month < c.months)
      return out;
    const focus = current();
    const pool = focus >= 0 ? neighbourPairs : recentPairs;
    const interval = focus >= 0 ? 140 : 260;
    if (pool.length && now - lastPulse > interval && pulses.length < 36) {
      lastPulse = now;
      const pair = pool[Math.floor(Math.random() * pool.length)];
      const forward =
        focus >= 0 ? c.pairB[pair] === focus : Math.random() < 0.5;
      pulses.push({
        pair,
        start: now,
        duration: 1500 + Math.random() * 1200,
        forward,
      });
    }
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pulse = pulses[i];
      const progress = (now - pulse.start) / pulse.duration;
      if (progress >= 1) {
        pulses.splice(i, 1);
        continue;
      }
      const mint = c.tie[pulse.pair] === 3 ? 1 : 0.35;
      for (let k = 0; k < 6; k++) {
        const s = progress - k * 0.018;
        if (s < 0) break;
        const [x, y] = curvePoint(pulse.pair, pulse.forward ? s : 1 - s);
        const fade = Math.sin(Math.PI * Math.min(1, progress * 1.15));
        out.push({
          x,
          y,
          size: 1.5 - k * 0.18,
          glow: (1.1 - k * 0.17) * fade,
          mint,
        });
      }
    }
    return out;
  };
  // The focused person's lines, which carry the pulses while they are looked at.
  let neighbourPairs: number[] = [];
  let neighbourPairsOf = -1;

  // ---------- Avatars ----------
  let atlasReady = false;
  let atlasRequested = false;
  const atlasUrl = c.avatars
    ? new URL(c.avatars.file, new URL(DATA_URL, location.href)).toString()
    : "";
  function loadAtlas() {
    if (atlasRequested || !c.avatars) return;
    atlasRequested = true;
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";
    image.onload = () => {
      renderer.setAtlas(image, c.avatars!.columns, c.avatars!.rows);
      atlasReady = true;
    };
    image.src = atlasUrl;
  }

  // ---------- Input ----------
  const noteInteraction = () => {
    lastInteraction = performance.now();
    camera.setSpin(0);
    hint.classList.remove("on");
  };

  attachGestures(sky, camera, {
    tap(x, y) {
      noteInteraction();
      const member = memberAt(x, y);
      if (introRunning) finishIntro();
      if (member >= 0) focusOn(member, { push: current() >= 0 });
      else if (current() >= 0) clearFocus();
    },
    hover(x, y) {
      const member = memberAt(x, y);
      if (member !== hovered) {
        hovered = member;
        if (current() < 0) applyHighlight();
      }
      sky.classList.toggle("pointing", member >= 0);
      if (member >= 0) showTip(member, x, y);
      else tip.hidden = true;
    },
    leave() {
      if (hovered >= 0) {
        hovered = -1;
        if (current() < 0) applyHighlight();
      }
      tip.hidden = true;
    },
    moved() {
      noteInteraction();
      userMoved = true;
      if (introRunning) finishIntro();
      tip.hidden = true;
    },
    doubleTap(x, y) {
      noteInteraction();
      camera.flyTo(
        (() => {
          const [wx, wy] = camera.toWorld(x, y);
          return { cx: wx, cy: wy, zoom: camera.zoom * 2.2 };
        })(),
        600
      );
      userMoved = true;
    },
  });
  sky.addEventListener("pointerdown", () => sky.classList.add("dragging"));
  window.addEventListener("pointerup", () => sky.classList.remove("dragging"));

  window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (document.activeElement === findInput) {
        findInput.blur();
        closeList();
      } else if (current() >= 0) clearFocus();
    } else if (event.key === "/" && document.activeElement !== findInput) {
      event.preventDefault();
      findInput.focus();
    } else if (
      event.key === "Backspace" &&
      document.activeElement === document.body &&
      selected.length > 1
    ) {
      selected.pop();
      focusOn(selected.pop()!, { push: true });
    }
  });

  // ---------- Timeline controls ----------
  monthInput.addEventListener("input", () => {
    noteInteraction();
    introRunning = false;
    playing = false;
    month = Number(monthInput.value);
    updateTimeLabels();
    setPlayLabel();
  });
  playButton.addEventListener("click", () => {
    noteInteraction();
    if (introRunning || playing) {
      introRunning = false;
      playing = false;
    } else if (month >= c.months - 0.01) {
      clearFocus();
      userMoved = false;
      startIntro();
    } else {
      playing = true;
      playStart = performance.now();
      playFrom = month;
    }
    setPlayLabel();
  });

  // ---------- Search ----------
  const summaryOf = (member: number) => {
    if (c.degree[member]) return t.connected(c.degree[member]);
    const { year, month: m } = calendar(c, Math.max(0, c.joined[member]));
    return t.joined(year, m);
  };
  const searchIndex = c.names.map(name => normalize(name));
  let matches: number[] = [];
  let active = 0;
  const closeList = () => {
    findList.hidden = true;
    findInput.setAttribute("aria-expanded", "false");
  };
  const renderList = (query: string) => {
    if (!query) {
      matches = [];
      closeList();
      return;
    }
    const q = normalize(query);
    const prefix: number[] = [];
    const inside: number[] = [];
    for (let i = 0; i < c.count; i++) {
      const name = searchIndex[i];
      if (!name) continue;
      if (name.startsWith(q)) prefix.push(i);
      else if (name.includes(q)) inside.push(i);
    }
    const byStrength = (p: number, q2: number) =>
      c.strength[q2] - c.strength[p];
    matches = [...prefix.sort(byStrength), ...inside.sort(byStrength)].slice(
      0,
      8
    );
    active = 0;
    findList.innerHTML = matches.length
      ? matches
          .map(
            (member, i) =>
              `<li role="option" id="find-${i}" data-member="${member}" aria-selected="${i === active}">${escapeHtml(c.names[member])}<small>${escapeHtml(summaryOf(member))}</small></li>`
          )
          .join("")
      : `<li class="empty">${escapeHtml(t.find.empty(query))}</li>`;
    findList.hidden = false;
    findInput.setAttribute("aria-expanded", "true");
    previewMatch();
  };
  const previewMatch = () => {
    for (const [i, element] of [...findList.children].entries())
      element.setAttribute("aria-selected", String(i === active));
    if (matches[active] !== undefined) {
      findInput.setAttribute("aria-activedescendant", `find-${active}`);
      hovered = matches[active];
      if (current() < 0) applyHighlight();
    }
  };
  const choose = (member: number) => {
    closeList();
    findInput.value = "";
    findInput.blur();
    focusOn(member);
  };
  findInput.addEventListener("input", () => {
    noteInteraction();
    renderList(findInput.value.trim());
  });
  findInput.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" && matches.length) {
      event.preventDefault();
      active = (active + 1) % matches.length;
      previewMatch();
    } else if (event.key === "ArrowUp" && matches.length) {
      event.preventDefault();
      active = (active - 1 + matches.length) % matches.length;
      previewMatch();
    } else if (event.key === "Enter" && matches[active] !== undefined) {
      event.preventDefault();
      choose(matches[active]);
    }
  });
  findList.addEventListener("pointerdown", event => {
    const item = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-member]"
    );
    if (!item) return;
    event.preventDefault();
    choose(Number(item.dataset.member));
  });
  findInput.addEventListener("blur", () => setTimeout(closeList, 150));

  randomButton.addEventListener("click", () => {
    noteInteraction();
    // Someone with a name and at least one connection.
    for (let attempt = 0; attempt < 50; attempt++) {
      const member = c.ranked[Math.floor(Math.random() * c.ranked.length)];
      if (c.names[member]) {
        focusOn(member);
        return;
      }
    }
  });

  // ---------- Frame loop ----------
  const resize = new ResizeObserver(() => layoutView());
  resize.observe(city);
  layoutView();

  let last = performance.now();
  let skip = false;
  const frame = (now: number) => {
    // Left alone for a while, the city turns at half the frame rate.
    const idle =
      now - lastInteraction > 20000 &&
      !camera.flying &&
      !introRunning &&
      !playing;
    skip = idle && !skip;
    if (skip) {
      requestAnimationFrame(frame);
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (introRunning) {
      const elapsed = (now - introStart) / 1000;
      const p = Math.min(1, elapsed / INTRO_SECONDS);
      // Ease out at the end so the final months settle.
      const eased =
        p < 0.85
          ? (p / 0.85) * 0.92
          : 0.92 + (1 - Math.pow(1 - (p - 0.85) / 0.15, 2)) * 0.08;
      month = -0.3 + eased * (c.months + 0.3);
      if (!userMoved) {
        camera.cx = 0;
        camera.cy = 0;
        const target = fitZoom / Math.max(0.16, visibleRadius(month) * 1.02);
        camera.zoom += (target - camera.zoom) * Math.min(1, dt * 3);
        camera.angle += dt * 0.05;
      }
      if (p >= 1) {
        introRunning = false;
        month = c.months;
        setPlayLabel();
        if (!coarse) hint.classList.add("on");
        setTimeout(() => hint.classList.remove("on"), 6000);
      }
      updateTimeLabels();
    } else if (playing) {
      month = Math.min(
        c.months,
        playFrom + ((now - playStart) / 1000) * (c.months / INTRO_SECONDS)
      );
      if (month >= c.months) {
        playing = false;
        setPlayLabel();
      }
      updateTimeLabels();
    }

    // Focus and hover fade in and out.
    const wantFocus = current() >= 0 ? 1 : 0;
    focusLevel += (wantFocus - focusLevel) * Math.min(1, dt * 6);
    const wantHover = hovered >= 0 && current() < 0 ? 1 : 0;
    hoverLevel += (wantHover - hoverLevel) * Math.min(1, dt * 8);

    if (
      !reducedMotion &&
      !introRunning &&
      current() < 0 &&
      now - lastInteraction > IDLE_AFTER &&
      hovered < 0
    ) {
      camera.setSpin(IDLE_SPIN);
    } else {
      camera.setSpin(0);
    }
    camera.update(now, dt);

    const focus = current();
    if (
      focus >= 0 &&
      (neighbourPairs.length === 0 || neighbourPairsOf !== focus)
    ) {
      neighbourPairs = [];
      for (let k = c.offsets[focus]; k < c.offsets[focus + 1]; k++)
        neighbourPairs.push(c.adjacency[k]);
      neighbourPairsOf = focus;
      pulses.length = 0;
    } else if (focus < 0 && neighbourPairsOf !== -1) {
      neighbourPairs = [];
      neighbourPairsOf = -1;
      pulses.length = 0;
    }

    const faces = placePeople();
    renderer.draw({
      view: camera.view(),
      month,
      time: reducedMotion ? 0 : now / 1000,
      focus: focusLevel,
      // A person with a few dozen lines lights them brightly; thousands of
      // lines are bright enough together.
      focusBoost:
        focus >= 0
          ? Math.min(
              3.2,
              Math.max(1.05, 3.2 / Math.sqrt(Math.max(1, c.degree[focus] / 60)))
            )
          : 1,
      hover: hoverLevel,
      pulses: updatePulses(now),
      avatars: faces,
    });
    drawGuides(now);
    requestAnimationFrame(frame);
  };

  // ---------- Start ----------
  const linkedIndex = new Map(c.linked.map((uid, i) => [uid, i]));
  // Back and forward (or an edited address) move between people.
  window.addEventListener("hashchange", () => {
    const uid = decodeURIComponent(location.hash.replace(/^#/, ""));
    const member = linkedIndex.get(uid);
    if (member !== undefined && member !== current()) focusOn(member);
    else if (!uid && current() >= 0) clearFocus();
  });
  const fromHash = decodeURIComponent(location.hash.replace(/^#/, ""));
  updateTimeLabels();
  if (fromHash && linkedIndex.has(fromHash)) {
    month = c.months;
    setPlayLabel();
    layoutView();
    requestAnimationFrame(() => focusOn(linkedIndex.get(fromHash)!));
  } else if (reducedMotion) {
    month = c.months;
    setPlayLabel();
  } else {
    startIntro();
    camera.zoom = fitZoom / 0.16;
  }
  requestAnimationFrame(frame);
}

load().then(community => {
  if (community) start(community);
});
