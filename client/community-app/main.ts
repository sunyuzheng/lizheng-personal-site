/**
 * city.lizheng.ai: Superlinear Academy as a city at night. Every member
 * is a light on rings set by when they joined; a line lights up between two
 * members wherever one has commented on or liked the other's post or comment.
 *
 * On arrival the city builds itself month by month from August 2024; after
 * that it turns slowly, and lines that were busy recently carry small pulses.
 * Hover a light to see who it is, click to look at one person and walk from
 * them to the people they know best. Data: scripts/build-community-graph.ts.
 *
 * This file holds the page's state (the month shown, the opening, who is
 * pointed at and who is looked at) and wires input to it. The parts:
 *   source.ts, data.ts    the community file and what is derived from it
 *   scene.ts, renderer.ts what is drawn, and drawing it with WebGL2
 *   camera.ts             the view, and drag, pinch, twist and wheel
 *   labels.ts             names, faces and ring labels over the city
 *   panel.ts, sheet.ts    a person's card and panel (a bottom sheet on phones)
 *   search.ts, find.ts    finding someone by name
 *   pulses.ts             lights running along lines
 * The homepage's window onto the city (embed.ts) shares all but the last
 * four.
 */
import { attachGestures, Camera } from "./camera";
import { COPY, formatNumber, type Copy, type Lang } from "./copy";
import { calendar, neighboursOf, type Community, type Neighbour } from "./data";
import { Labels, ringMarks } from "./labels";
import { PersonPanel, type FaceSheet } from "./panel";
import { busyPairs, Pulses } from "./pulses";
import { Renderer } from "./renderer";
import { buildScene, Grid, highlightAround } from "./scene";
import { attachSearch } from "./search";
import { attachSheet } from "./sheet";
import { DATA_URL, loadCommunity } from "./source";
import "./style.css";

// Serif fonts load after first paint (see fonts.css).
void import("./fonts.css");

const INTRO_SECONDS = 13;
const IDLE_SPIN = 0.018; // radians per second, about one turn in six minutes
const IDLE_AFTER = 5000;
// The layout for phones (style.css uses the same width).
const PHONE_WIDTH = 760;

// English at city.lizheng.ai/en (?lang=en also works, for local checks).
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
const panelElement = $("panel");
const tip = $("tip");
const hint = $("hint");
const statusLine = $("status");
const findInput = $<HTMLInputElement>("find-input");
const monthInput = $<HTMLInputElement>("month");
const playButton = $<HTMLButtonElement>("play");
const zoomControls = $("zoom");
const zoomAll =
  zoomControls.querySelector<HTMLButtonElement>('[data-zoom="all"]')!;

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
  monthInput.setAttribute("aria-label", t.timeline);
  document.querySelector(".legend")?.setAttribute("aria-label", t.legend);
  zoomControls.setAttribute("aria-label", t.zoom.label);
  zoomControls
    .querySelector('[data-zoom="in"]')!
    .setAttribute("aria-label", t.zoom.in);
  zoomControls
    .querySelector('[data-zoom="out"]')!
    .setAttribute("aria-label", t.zoom.out);
  zoomAll.textContent = t.zoom.all;
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

function start(c: Community) {
  const scene = buildScene(c);
  const makeRenderer = () =>
    new Renderer(sky, scene, { segments: coarse ? 7 : 12 });
  let renderer: Renderer;
  try {
    renderer = makeRenderer();
  } catch {
    fail(t.fallback);
    return;
  }
  statusLine.classList.add("off");
  sky.setAttribute("aria-label", t.canvasLabel(c.count, c.pairCount));
  const grid = new Grid(c);
  const camera = new Camera();
  const guideContext = guides.getContext("2d")!;
  const isPhone = () => camera.width <= PHONE_WIDTH;

  // ---------- Stats and note ----------
  const statValues: Record<string, string> = {
    members: formatNumber(c.count),
    pairs: formatNumber(c.pairCount),
  };
  for (const element of document.querySelectorAll<HTMLElement>("[data-stat]")) {
    element.textContent = statValues[element.dataset.stat!] ?? "";
  }
  $("stats").classList.add("ready");
  $("note").textContent = t.note(t.date(c.generatedAt));

  // ---------- The page's words, which names and faces keep clear of ----------
  let keepClear: DOMRect[] = [];
  const refreshKeepClear = () => {
    keepClear = [
      document.querySelector<HTMLElement>(".intro"),
      document.querySelector<HTMLElement>(".bar"),
      panelElement,
      $("find"),
    ]
      .filter((element): element is HTMLElement => !!element && !element.hidden)
      .map(element => element.getBoundingClientRect());
  };

  // ---------- State ----------
  let month = c.months; // fractional month index being shown
  let introRunning = false;
  let introStart = 0;
  let playing = false;
  let playStart = 0;
  let playFrom = 0;
  let lastInteraction = performance.now();
  let hovered = -1;
  let selected: number[] = []; // people looked at, in order; the last is current
  let focusLevel = 0;
  let hoverLevel = 0;
  let userMoved = false;
  const current = () => (selected.length ? selected[selected.length - 1] : -1);

  // ---------- Layout and fitting ----------
  let fitZoom = 300;
  let baseOffset = { x: 0, y: 0 };
  let overviewRoom = { top: 40, bottom: 130 };
  const layoutView = () => {
    const rect = city.getBoundingClientRect();
    camera.width = Math.max(1, rect.width);
    camera.height = Math.max(1, rect.height);
    camera.dpr = Math.min(2, window.devicePixelRatio || 1);
    sky.width = Math.round(camera.width * camera.dpr);
    sky.height = Math.round(camera.height * camera.dpr);
    guides.width = sky.width;
    guides.height = sky.height;
    const phone = isPhone();
    // Leave room for the words above and below the city. On phones the
    // search sits just under the intro, and the city between it and the bar.
    // Looking at someone hides those words, so the room is measured only at
    // the overview and kept.
    if (!phone) overviewRoom = { top: 40, bottom: 130 };
    else if (!city.classList.contains("focused")) {
      const intro = document.querySelector(".intro")!.getBoundingClientRect();
      city.style.setProperty(
        "--find-top",
        `${Math.round(intro.bottom + 14)}px`
      );
      overviewRoom = {
        top: $("find").getBoundingClientRect().bottom + 10,
        bottom:
          camera.height -
          document.querySelector(".bar")!.getBoundingClientRect().top +
          10,
      };
    }
    const { top, bottom } = overviewRoom;
    const usableH = camera.height - top - bottom;
    const usableW = phone ? camera.width - 24 : camera.width - 80;
    fitZoom = Math.max(40, Math.min(usableW, usableH) / 2 / 1.04);
    // The city can shrink a little below the overview, never to a dot, and
    // can never be pushed off screen.
    camera.minZoom = fitZoom * (phone ? 0.85 : 0.6);
    camera.maxZoom = fitZoom * 60;
    camera.cityRadius = 1;
    baseOffset = {
      x: phone
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
    refreshKeepClear();
  };

  // ---------- Months ----------
  const dateLabel = $("date");
  const growthLabel = $("growth");
  const updateTimeLabels = () => {
    const index = Math.max(0, Math.min(c.months - 1, Math.floor(month)));
    const { year, month: m } = calendar(c, index);
    dateLabel.textContent = t.month(year, m);
    growthLabel.textContent = t.growth(
      c.membersByMonth[index],
      c.pairsByMonth[index]
    );
    monthInput.value = String(month);
    monthInput.style.setProperty("--progress", `${(month / c.months) * 100}%`);
  };
  monthInput.max = String(c.months);
  monthInput.value = String(c.months);
  const setPlayLabel = () => {
    playButton.textContent =
      playing || introRunning ? t.pause : month >= c.months ? t.replay : t.play;
  };

  // ---------- Who someone knows (sorted once per person) ----------
  let known: { member: number; list: Neighbour[] } = { member: -1, list: [] };
  const neighbours = (member: number) => {
    if (known.member !== member)
      known = { member, list: neighboursOf(c, member) };
    return known.list;
  };

  // ---------- Highlight ----------
  const applyHighlight = () => {
    const focus = current();
    const { nodes, edges } = highlightAround(
      c,
      focus >= 0 ? focus : hovered,
      focus >= 0 ? 2 : 1
    );
    renderer.setHighlight(nodes, edges);
  };

  // ---------- Faces ----------
  // One picture sheet holds every face; it loads the first time a face is
  // needed (zooming in, or looking at someone).
  let atlas: HTMLImageElement | null = null;
  let atlasReady = false;
  const faces: FaceSheet = {
    url: c.avatars
      ? new URL(c.avatars.file, new URL(DATA_URL, location.href)).toString()
      : "",
    load() {
      if (atlas || !c.avatars) return;
      atlas = new Image();
      atlas.decoding = "async";
      atlas.crossOrigin = "anonymous";
      atlas.onload = () => {
        renderer.setAtlas(atlas!, c.avatars!.columns, c.avatars!.rows);
        atlasReady = true;
      };
      atlas.src = faces.url;
    },
  };

  // ---------- Graphics lost and back ----------
  // Phones may take the GPU away from a page in the background; redraw
  // everything once it is given back.
  let contextLost = false;
  sky.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    contextLost = true;
  });
  sky.addEventListener("webglcontextrestored", () => {
    renderer = makeRenderer();
    applyHighlight();
    if (atlas && atlasReady)
      renderer.setAtlas(atlas, c.avatars!.columns, c.avatars!.rows);
    contextLost = false;
  });

  // ---------- Names, faces and rings ----------
  const marks = ringMarks(c, t);
  const labels = new Labels($("names"), c, camera, marks, coarse);

  const drawGuides = (time: number) => {
    const g = guideContext;
    const dpr = camera.dpr;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, guides.width, guides.height);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Faint dotted rings at each half year.
    const [cx, cy] = camera.toScreen(0, 0);
    g.lineWidth = 1;
    g.setLineDash([2, 5]);
    for (const mark of marks) {
      if (mark.month > month) break;
      const r = mark.radius * camera.zoom;
      if (r < 70) continue;
      g.strokeStyle = `rgba(248, 241, 228, ${0.09 * (1 - focusLevel * 0.6)})`;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
    }
    g.setLineDash([]);
    // A mint ring round the person looked at (breathing) and the one pointed at.
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

  // ---------- The person panel ----------
  const panel = new PersonPanel(panelElement, c, t, faces, neighbours, {
    walk: member => focusOn(member, { push: true }),
    close: () => clearFocus(),
    changed: () => {
      sheet.refresh();
      refreshKeepClear();
    },
  });
  // On phones the panel is a bottom sheet resting at a peek.
  const sheet = attachSheet(panelElement, {
    active: isPhone,
    onDismiss: () => clearFocus(),
    onSettle: refreshKeepClear,
    labels: t.sheet,
  });

  // ---------- Looking at someone ----------
  const focusOn = (
    member: number,
    options: { push?: boolean; fly?: boolean } = {}
  ) => {
    if (member < 0 || member >= c.count) return;
    finishIntro();
    if (options.push && current() !== member) selected.push(member);
    else selected = [member];
    hovered = -1;
    tip.hidden = true;
    const wasHidden = panelElement.hidden;
    panel.show(member);
    applyHighlight();
    // Each person gets their own address, so back and forward walk between them.
    const hash = c.linked[member] ? `#${c.linked[member]}` : "";
    if (location.hash !== hash)
      history.pushState(null, "", hash || location.pathname + location.search);
    city.classList.add("focused");
    sheet.open(wasHidden);
    camera.slack = 0.4;
    refreshKeepClear();
    if (options.fly !== false) frameFocus(member, 1200);
  };

  /**
   * Frames a person and the people they know best in the space the panel and
   * the title leave free (on phones, above the sheet at its peek).
   */
  const frameFocus = (member: number, duration: number) => {
    // The person and their nearer connections (the farthest 15% of a busy
    // person's lines may run off screen), measured as the screen is turned.
    const cos = Math.cos(camera.angle);
    const sin = Math.sin(camera.angle);
    const turned = (i: number) => [
      c.x[i] * cos - c.y[i] * sin,
      c.x[i] * sin + c.y[i] * cos,
    ];
    const [px, py] = turned(member);
    const others = neighbours(member)
      .slice(0, 80)
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
    const intro = document.querySelector(".intro")!.getBoundingClientRect();
    const free = isPhone()
      ? {
          left: 0,
          right: camera.width,
          top: intro.bottom + 8,
          bottom: camera.height - sheet.peekHeight() - 8,
        }
      : {
          left: 0,
          right: panelElement.getBoundingClientRect().left - 20,
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
    camera.offsetX = (free.left + free.right) / 2 - camera.width / 2;
    camera.offsetY = (free.top + free.bottom) / 2 - camera.height / 2;
    camera.flyTo(
      { cx: qx * cos + qy * sin, cy: -qx * sin + qy * cos, zoom },
      duration
    );
    userMoved = true;
  };

  const clearFocus = () => {
    selected = [];
    panel.hide();
    city.classList.remove("focused");
    camera.slack = 0;
    refreshKeepClear();
    applyHighlight();
    if (location.hash)
      history.pushState(null, "", location.pathname + location.search);
    camera.offsetX = baseOffset.x;
    camera.offsetY = baseOffset.y;
  };

  // ---------- Pointing at someone ----------
  const showTip = (member: number, sx: number, sy: number) => {
    tip.innerHTML = panel.cardHtml(member);
    tip.hidden = false;
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    let x = sx + 16;
    let y = sy - height - 12;
    if (x + width > camera.width - 12) x = sx - width - 16;
    if (y < 12) y = sy + 16;
    tip.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  /** The light under a screen point, preferring lit, connected people. */
  const memberAt = (sx: number, sy: number) => {
    const [wx, wy] = camera.toWorld(sx, sy);
    const radius = (coarse ? 22 : 14) / camera.zoom;
    let best = -1;
    let bestScore = Infinity;
    for (const { member, d } of grid.near(wx, wy, radius)) {
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

  // ---------- The opening and playback ----------
  const startIntro = () => {
    introRunning = true;
    introStart = performance.now();
    month = -0.3;
    selected = [];
    panel.hide();
    applyHighlight();
    camera.angle = 0;
    setPlayLabel();
  };

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

  // How far out the city reaches by a month, for the opening's camera.
  const visibleRadius = (value: number) => {
    const index = Math.max(0, Math.min(c.months - 1, Math.floor(value)));
    return Math.sqrt(Math.max(c.membersByMonth[index], 30) / c.count);
  };

  // ---------- Pulses ----------
  const pulses = new Pulses(c, {
    max: 36,
    trail: 6,
    spacing: 0.018,
    size: 1.5,
    glow: 1.1,
    duration: 1500,
  });
  // They run on the busy lines, or on the lines of the person looked at.
  const busy = busyPairs(c);
  let pulsesOf = -1;
  let pulsePairs = busy;
  const pulseLights = (now: number) => {
    if (reducedMotion || introRunning || playing || month < c.months) return [];
    const focus = current();
    if (focus !== pulsesOf) {
      pulsesOf = focus;
      pulsePairs = focus < 0 ? busy : neighbours(focus).map(({ pair }) => pair);
      pulses.clear();
    }
    return pulses.lights(now, pulsePairs, focus < 0 ? 260 : 140, focus);
  };

  // ---------- Hint and zoom buttons ----------
  const showHint = () => {
    if (coarse) {
      hint.textContent = t.hintTouch;
      const bar = document.querySelector(".bar")!.getBoundingClientRect();
      hint.style.top = `${Math.max(0, bar.top - 44)}px`;
    }
    hint.classList.add("on");
    setTimeout(() => hint.classList.remove("on"), coarse ? 7000 : 6000);
  };

  const noteInteraction = () => {
    lastInteraction = performance.now();
    camera.setSpin(0);
    hint.classList.remove("on");
  };

  zoomControls.addEventListener("click", event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-zoom]"
    );
    if (!button) return;
    noteInteraction();
    if (introRunning) finishIntro();
    const kind = button.dataset.zoom;
    if (kind === "all") {
      camera.flyTo({ cx: 0, cy: 0, zoom: fitZoom }, 800);
      userMoved = false;
      return;
    }
    // Zoom around the middle of the screen, staying inside the city.
    camera.flyTo(
      camera.zoomTarget(
        camera.width / 2 + camera.offsetX,
        camera.height / 2 + camera.offsetY,
        kind === "in" ? 2 : 0.5
      ),
      420
    );
    userMoved = true;
  });

  // "全城" shows once the view has left the overview.
  let awayShown = false;
  const updateZoomControls = () => {
    const away =
      camera.zoom > fitZoom * 1.15 || Math.hypot(camera.cx, camera.cy) > 0.08;
    if (away !== awayShown) {
      awayShown = away;
      zoomAll.hidden = !away;
    }
  };

  // ---------- Input ----------
  attachGestures(sky, camera, {
    tap(x, y) {
      noteInteraction();
      if (introRunning) finishIntro();
      const named = labels.nameAt(x, y);
      if (named >= 0) {
        focusOn(named, { push: current() >= 0 });
        return;
      }
      // Lights at the overview sit a few pixels apart, too close for a
      // finger: a tap there zooms in around it, until each light can be told
      // apart. A tap outside the city does nothing.
      if (coarse && current() < 0 && camera.zoom < fitZoom * 3) {
        const [wx, wy] = camera.toWorld(x, y);
        if (Math.hypot(wx, wy) > 1.02) return;
        const factor = Math.min(fitZoom * 3.4, camera.zoom * 2.6) / camera.zoom;
        camera.flyTo(camera.zoomTarget(x, y, factor), 650);
        userMoved = true;
        return;
      }
      const member = memberAt(x, y);
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
    settled() {
      camera.springBack();
    },
    doubleTap(x, y) {
      noteInteraction();
      camera.flyTo(camera.zoomTarget(x, y, 2.2), 600);
      userMoved = true;
    },
  });
  sky.addEventListener("pointerdown", () => sky.classList.add("dragging"));
  window.addEventListener("pointerup", () => sky.classList.remove("dragging"));

  window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (document.activeElement === findInput) search.leave();
      else if (current() >= 0) clearFocus();
    } else if (event.key === "/" && document.activeElement !== findInput) {
      event.preventDefault();
      findInput.focus();
    } else if (
      event.key === "Backspace" &&
      document.activeElement === document.body &&
      selected.length > 1
    ) {
      // Back to the person looked at before.
      selected.pop();
      focusOn(selected.pop()!, { push: true });
    }
  });

  // ---------- Timeline ----------
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

  // ---------- Search and chance ----------
  const search = attachSearch(findInput, $("find-list"), c, t, {
    typing: noteInteraction,
    preview(member) {
      hovered = member;
      if (current() < 0) applyHighlight();
    },
    choose: member => focusOn(member),
  });
  $("random").addEventListener("click", () => {
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

  // ---------- Frames ----------
  const resize = new ResizeObserver(() => layoutView());
  resize.observe(city);
  layoutView();
  // The serif title can change height once its font arrives.
  document.fonts?.ready.then(() => layoutView());

  let last = performance.now();
  let skip = false;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    // Left alone for a while, the city turns at half the frame rate.
    const idle =
      now - lastInteraction > 20000 &&
      !camera.flying &&
      !introRunning &&
      !playing;
    skip = idle && !skip;
    if (skip || contextLost) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (introRunning) {
      const p = Math.min(1, (now - introStart) / 1000 / INTRO_SECONDS);
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
        showHint();
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

    // Looking and pointing fade in and out.
    const focus = current();
    focusLevel += ((focus >= 0 ? 1 : 0) - focusLevel) * Math.min(1, dt * 6);
    const wantHover = hovered >= 0 && focus < 0 ? 1 : 0;
    hoverLevel += (wantHover - hoverLevel) * Math.min(1, dt * 8);

    camera.setSpin(
      !reducedMotion &&
        !introRunning &&
        focus < 0 &&
        hovered < 0 &&
        now - lastInteraction > IDLE_AFTER
        ? IDLE_SPIN
        : 0
    );
    camera.update(now, dt);

    const zoomRatio = camera.zoom / fitZoom;
    if (zoomRatio > 2.4 || focus >= 0) faces.load();
    const sprites = labels.place({
      focus,
      neighbours: focus >= 0 ? neighbours(focus) : [],
      hovered,
      month,
      early: introRunning && month <= 3,
      zoomRatio,
      facesReady: atlasReady,
      keepClear,
    });
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
      pulses: pulseLights(now),
      avatars: sprites,
    });
    drawGuides(now);
    updateZoomControls();
  };

  // ---------- Addresses ----------
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

loadCommunity().then(community => {
  if (community) start(community);
  else fail(t.failed);
});
