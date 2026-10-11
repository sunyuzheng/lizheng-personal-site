/**
 * The homepage's window onto city.lizheng.ai: the same city, seen at an
 * angle like a city from a plane, turning slowly. The first time it comes
 * into view its lights come on from the middle outwards (the earliest
 * members first) and its lines draw themselves. Pointing at a light lights up
 * that person's lines; the page around it decides what a click does (open
 * their card). A sideways drag turns the city, and a flick keeps it turning
 * for a moment. It draws only while on screen.
 */
import { Camera } from "./camera";
import type { Community } from "./data";
import { busyPairs, Pulses } from "./pulses";
import { Renderer } from "./renderer";
import { buildScene, Grid, highlightAround } from "./scene";

export interface CityWindowOptions {
  canvas: HTMLCanvasElement;
  data: Community;
  reducedMotion: boolean;
  /** A touch screen: fewer segments per line, and no hover. */
  coarse: boolean;
  /** The light under the pointer (-1 for none), in canvas pixels. */
  onHover(member: number, x: number, y: number): void;
  /** A click or tap that did not drag: the light under it, or -1. */
  onPick(member: number): void;
  /** A drag started turning the city. */
  onTurn?(): void;
  /** The canvas changed size, so the lights moved. */
  onResize?(): void;
}

export interface CityWindow {
  /**
   * Lights up one member's lines (-1 for none), as pointing does. Held, they
   * stay lit whatever the pointer does and the city stops turning, while
   * that person's card is open.
   */
  highlight(member: number, hold?: boolean): void;
  /** Where a member's light is on the canvas (CSS pixels), if visible. */
  locate(member: number): [number, number] | null;
  destroy(): void;
}

const INTRO_SECONDS = 6;
const SPIN = 0.045; // radians per second
const TURN_PER_PIXEL = 0.006; // radians, for a drag

export function mountCityWindow(options: CityWindowOptions): CityWindow {
  const { canvas, data: c, reducedMotion, coarse } = options;
  // A little dimmer than the full page: seen at an angle, the same light
  // gathers into less space.
  const scene = buildScene(c);
  const makeRenderer = () =>
    new Renderer(canvas, scene, {
      segments: coarse ? 6 : 9,
      transparent: true,
      exposure: 0.8,
    });
  let renderer = makeRenderer();
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
    // Look at the disc from an angle just steep enough to fill the frame,
    // and never straight down, where it would look like a ball.
    camera.squash = Math.min(
      0.72,
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
  let held = false;
  let hoverLevel = 0;
  const setHovered = (member: number) => {
    if (member === hovered) return;
    hovered = member;
    const { nodes, edges } = highlightAround(c, member, 1);
    renderer.setHighlight(nodes, edges);
  };

  // Phones may take the GPU away from a page in the background; draw again
  // once it is given back.
  let contextLost = false;
  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
  };
  const onContextRestored = () => {
    renderer = makeRenderer();
    const { nodes, edges } = highlightAround(c, hovered, 1);
    renderer.setHighlight(nodes, edges);
    contextLost = false;
    run();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

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
  const busy = busyPairs(c);
  const pulses = new Pulses(c, {
    max: 8,
    trail: 5,
    spacing: 0.02,
    size: 1.3,
    glow: 1,
    duration: 1800,
  });
  const pulseLights = (now: number) =>
    reducedMotion || month < c.months ? [] : pulses.lights(now, busy, 700);

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
  // A press that moves sideways turns the city; one that does not is a pick.
  // On touch screens vertical swipes scroll the page (the canvas allows only
  // those), so the browser cancels the press.
  let down: {
    id: number;
    x: number;
    y: number;
    lastX: number;
    lastTime: number;
    speed: number;
    turning: boolean;
  } | null = null;
  const onMove = (event: PointerEvent) => {
    const [x, y] = local(event);
    if (down && event.pointerId === down.id) {
      const dx = x - down.x;
      if (
        !down.turning &&
        Math.abs(dx) > 8 &&
        Math.abs(dx) > Math.abs(y - down.y)
      ) {
        down.turning = true;
        canvas.setPointerCapture(event.pointerId);
        canvas.style.cursor = "grabbing";
        options.onTurn?.();
      }
      if (down.turning) {
        const step = x - down.lastX;
        // The near side of the city follows the pointer.
        camera.angle -= step * TURN_PER_PIXEL;
        const dt = Math.max(1, event.timeStamp - down.lastTime);
        down.speed = 0.8 * (step / dt) + 0.2 * down.speed;
        down.lastX = x;
        down.lastTime = event.timeStamp;
        run();
        return;
      }
    }
    if (event.pointerType !== "mouse") return;
    const member = memberAt(x, y);
    canvas.style.cursor = member >= 0 ? "pointer" : "grab";
    if (held) return;
    setHovered(member);
    if (member >= 0) {
      const [mx, my] = camera.toScreen(c.x[member], c.y[member]);
      options.onHover(member, mx, my);
    } else options.onHover(-1, x, y);
  };
  const onLeave = () => {
    if (held) return;
    setHovered(-1);
    options.onHover(-1, 0, 0);
  };
  const onDown = (event: PointerEvent) => {
    const [x, y] = local(event);
    down = {
      id: event.pointerId,
      x,
      y,
      lastX: x,
      lastTime: event.timeStamp,
      speed: 0,
      turning: false,
    };
    // A finger on a turning city stops it.
    camera.fling(0);
  };
  const onUp = (event: PointerEvent) => {
    if (!down || event.pointerId !== down.id) return;
    const [x, y] = local(event);
    const press = down;
    down = null;
    if (press.turning) {
      canvas.style.cursor = "grab";
      // A flick keeps it turning for a moment.
      if (event.timeStamp - press.lastTime < 80)
        camera.fling(
          Math.max(-4, Math.min(4, -press.speed * 1000 * TURN_PER_PIXEL))
        );
      return;
    }
    if (Math.hypot(x - press.x, y - press.y) <= 6)
      options.onPick(memberAt(x, y));
  };
  const onCancel = () => {
    down = null;
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);

  // ---------- Frames, only while on screen ----------
  let visible = false;
  let frame = 0;
  let last = performance.now();
  let skip = false;
  const loop = (now: number) => {
    frame = 0;
    if (!visible || document.hidden || contextLost) return;
    frame = requestAnimationFrame(loop);
    // Settled and untouched, the window runs at half the frame rate.
    const settled =
      month >= c.months && hovered < 0 && !down?.turning && !camera.flinging;
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
    camera.setSpin(!reducedMotion && hovered < 0 && !down?.turning ? SPIN : 0);
    camera.update(now, dt);
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
    options.onResize?.();
  });
  resize.observe(canvas);
  layout();

  return {
    highlight(member: number, hold = false) {
      setHovered(member);
      held = hold && member >= 0;
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
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      if (frame) cancelAnimationFrame(frame);
    },
  };
}
