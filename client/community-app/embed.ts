/**
 * The homepage's window onto city.lizheng.ai: the same city, seen at an
 * angle so its disc fills a wide frame, turning slowly. The first time it
 * comes into view its lights come on from the middle outwards (the earliest
 * members first) and its lines draw themselves. Pointing at a light lights up
 * that person's lines; the page around it decides what a click does (enter
 * the full page). It draws only while on screen.
 */
import { Camera } from "./camera";
import type { Community } from "./data";
import { CURVE, Renderer, type Pulse } from "./renderer";
import { buildScene, Grid } from "./scene";

export interface CityWindowOptions {
  canvas: HTMLCanvasElement;
  data: Community;
  reducedMotion: boolean;
  /** A touch screen: fewer segments per line, and no hover. */
  coarse: boolean;
  /** The light under the pointer (-1 for none), in canvas pixels. */
  onHover(member: number, x: number, y: number): void;
  /** A click or tap that did not drag: the light under it, or -1. */
  onPick(member: number, pointerType: string): void;
}

export interface CityWindow {
  /** Lights up one member's lines (or none, with -1), as hovering does. */
  highlight(member: number): void;
  /** Where a member's light is on the canvas (CSS pixels), if visible. */
  locate(member: number): [number, number] | null;
  destroy(): void;
}

const INTRO_SECONDS = 6;
const SPIN = 0.045; // radians per second

export function mountCityWindow(options: CityWindowOptions): CityWindow {
  const { canvas, data: c, reducedMotion, coarse } = options;
  // A little dimmer than the full page: seen at an angle, the same light
  // gathers into less space.
  const renderer = new Renderer(canvas, buildScene(c), {
    segments: coarse ? 6 : 9,
    transparent: true,
    exposure: 0.8,
  });
  const grid = new Grid(c);
  const camera = new Camera();
  let fitZoom = 300;

  const layout = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    camera.width = rect.width;
    camera.height = rect.height;
    camera.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * camera.dpr);
    canvas.height = Math.round(rect.height * camera.dpr);
    // Look at the disc from an angle just steep enough to fill the frame.
    camera.squash = Math.min(
      1,
      Math.max(0.38, (rect.height / rect.width) * 1.12)
    );
    fitZoom = Math.min(
      rect.width / 2 / 1.03,
      rect.height / 2 / 1.03 / camera.squash
    );
    camera.zoom = fitZoom;
    camera.minZoom = camera.maxZoom = fitZoom;
  };

  // ---------- Highlight ----------
  let hovered = -1;
  let hoverLevel = 0;
  const setHovered = (member: number) => {
    if (member === hovered) return;
    hovered = member;
    const nodes = new Map<number, number>();
    const edges = new Map<number, number>();
    if (member >= 0) {
      nodes.set(member, 2);
      for (let k = c.offsets[member]; k < c.offsets[member + 1]; k++) {
        const pair = c.adjacency[k];
        edges.set(pair, 1);
        const other = c.pairA[pair] === member ? c.pairB[pair] : c.pairA[pair];
        if (!nodes.has(other)) nodes.set(other, 1);
      }
    }
    renderer.setHighlight(nodes, edges);
  };

  // ---------- Time ----------
  let month = -1; // nothing lit until the window is first seen
  let introStart = -1;
  const startIntro = () => {
    if (introStart >= 0) return;
    if (reducedMotion) {
      month = c.months;
      introStart = 0;
      return;
    }
    introStart = performance.now();
  };

  // ---------- Pulses on lines busy in the last two months ----------
  const recent: number[] = [];
  for (let k = 0; k < c.pairCount; k++) {
    if (c.pairLast[k] >= c.months - 2 && c.tie[k] >= 2) recent.push(k);
  }
  const pulses: { pair: number; start: number; duration: number }[] = [];
  let lastPulse = 0;
  const point = (pair: number, s: number) => {
    const x0 = c.x[c.pairA[pair]];
    const y0 = c.y[c.pairA[pair]];
    const x2 = c.x[c.pairB[pair]];
    const y2 = c.y[c.pairB[pair]];
    const x1 = (x0 + x2) / 2 - (y2 - y0) * CURVE;
    const y1 = (y0 + y2) / 2 + (x2 - x0) * CURVE;
    const u = 1 - s;
    return [
      u * u * x0 + 2 * u * s * x1 + s * s * x2,
      u * u * y0 + 2 * u * s * y1 + s * s * y2,
    ];
  };
  const pulseLights = (now: number): Pulse[] => {
    const out: Pulse[] = [];
    if (reducedMotion || month < c.months || !recent.length) return out;
    if (now - lastPulse > 700 && pulses.length < 8) {
      lastPulse = now;
      pulses.push({
        pair: recent[Math.floor(Math.random() * recent.length)],
        start: now,
        duration: 1800 + Math.random() * 1200,
      });
    }
    for (let i = pulses.length - 1; i >= 0; i--) {
      const progress = (now - pulses[i].start) / pulses[i].duration;
      if (progress >= 1) {
        pulses.splice(i, 1);
        continue;
      }
      const fade = Math.sin(Math.PI * progress);
      for (let k = 0; k < 5; k++) {
        const s = progress - k * 0.02;
        if (s < 0) break;
        const [x, y] = point(pulses[i].pair, s);
        out.push({
          x,
          y,
          size: 1.3 - k * 0.18,
          glow: (1 - k * 0.18) * fade,
          mint: c.tie[pulses[i].pair] === 3 ? 1 : 0.35,
        });
      }
    }
    return out;
  };

  // ---------- Pointer ----------
  const memberAt = (sx: number, sy: number) => {
    const [wx, wy] = camera.toWorld(sx, sy);
    // The squash makes world distances longer vertically; search generously.
    const radius = (coarse ? 20 : 12) / camera.zoom / camera.squash;
    let best = -1;
    let bestScore = Infinity;
    for (const { member } of grid.near(wx, wy, radius)) {
      if (c.joined[member] > month || !c.degree[member]) continue;
      if (month < c.firstLink[member]) continue;
      const [mx, my] = camera.toScreen(c.x[member], c.y[member]);
      const d = Math.hypot(mx - sx, my - sy);
      if (d > (coarse ? 20 : 12)) continue;
      const score = d - Math.log2(1 + c.degree[member]);
      if (score < bestScore) {
        bestScore = score;
        best = member;
      }
    }
    return best;
  };
  const local = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top] as const;
  };
  let down: { x: number; y: number; type: string } | null = null;
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const [x, y] = local(event);
    const member = memberAt(x, y);
    setHovered(member);
    canvas.style.cursor = "pointer";
    if (member >= 0) {
      const [mx, my] = camera.toScreen(c.x[member], c.y[member]);
      options.onHover(member, mx, my);
    } else options.onHover(-1, x, y);
  };
  const onLeave = () => {
    setHovered(-1);
    options.onHover(-1, 0, 0);
  };
  const onDown = (event: PointerEvent) => {
    const [x, y] = local(event);
    down = { x, y, type: event.pointerType || "mouse" };
  };
  const onUp = (event: PointerEvent) => {
    if (!down) return;
    const [x, y] = local(event);
    const moved = Math.hypot(x - down.x, y - down.y) > 6;
    const type = down.type;
    down = null;
    if (moved) return;
    const member = memberAt(x, y);
    if (type !== "mouse" && member >= 0) {
      setHovered(member);
      const [mx, my] = camera.toScreen(c.x[member], c.y[member]);
      options.onHover(member, mx, my);
    }
    options.onPick(member, type);
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);

  // ---------- Frames, only while on screen ----------
  let visible = false;
  let frame = 0;
  let last = performance.now();
  let skip = false;
  const loop = (now: number) => {
    frame = 0;
    if (!visible || document.hidden) return;
    frame = requestAnimationFrame(loop);
    // Settled and untouched, the window runs at half the frame rate.
    const settled = month >= c.months && hovered < 0;
    skip = settled && !skip;
    if (skip) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (introStart > 0 && month < c.months) {
      const p = Math.min(1, (now - introStart) / 1000 / INTRO_SECONDS);
      const eased = 1 - Math.pow(1 - p, 2);
      month = -0.3 + eased * (c.months + 0.3);
      if (p >= 1) month = c.months;
    }
    if (!reducedMotion && hovered < 0) camera.angle += SPIN * dt;
    const want = hovered >= 0 ? 1 : 0;
    hoverLevel += (want - hoverLevel) * Math.min(1, dt * 8);
    renderer.draw({
      view: camera.view(),
      month,
      time: reducedMotion ? 0 : now / 1000,
      focus: 0,
      focusBoost: 1,
      hover: hoverLevel,
      // A person with a handful of lines lights them brightly.
      hoverBoost:
        hovered >= 0
          ? Math.min(
              6,
              Math.max(2.4, 6 / Math.sqrt(Math.max(1, c.degree[hovered] / 20)))
            )
          : 2.4,
      pulses: pulseLights(now),
      avatars: [],
    });
  };
  const run = () => {
    if (!frame && visible && !document.hidden) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  };
  const seen = new IntersectionObserver(
    ([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (entry && entry.intersectionRatio >= 0.35) startIntro();
      run();
    },
    { threshold: [0, 0.35] }
  );
  seen.observe(canvas);
  document.addEventListener("visibilitychange", run);
  const resize = new ResizeObserver(() => {
    layout();
    run();
  });
  resize.observe(canvas);
  layout();

  return {
    highlight(member: number) {
      setHovered(member);
    },
    locate(member: number) {
      if (member < 0 || member >= c.count) return null;
      const [x, y] = camera.toScreen(c.x[member], c.y[member]);
      return x >= 0 && y >= 0 && x <= camera.width && y <= camera.height
        ? [x, y]
        : null;
    },
    destroy() {
      seen.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", run);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      if (frame) cancelAnimationFrame(frame);
    },
  };
}
