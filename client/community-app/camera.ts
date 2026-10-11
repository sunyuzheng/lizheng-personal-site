/**
 * The view over the city: where it is centred, how close, and how far it has
 * been turned. Handles drag, wheel, pinch and two-finger twist, and flies
 * smoothly from one place to another.
 */
import type { View } from "./renderer";

interface Pose {
  cx: number;
  cy: number;
  zoom: number;
  angle: number;
}

interface Flight {
  from: Pose;
  to: Pose;
  start: number;
  duration: number;
  /** How far to pull back mid-flight, in log zoom. */
  lift: number;
}

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export class Camera implements Pose {
  cx = 0;
  cy = 0;
  zoom = 300;
  angle = 0;
  width = 1;
  height = 1;
  dpr = 1;
  minZoom = 50;
  maxZoom = 20000;
  /** Screen offset of the point the camera centres on (e.g. beside a panel). */
  offsetX = 0;
  offsetY = 0;
  private flight: Flight | null = null;
  private spin = 0;

  toScreen(x: number, y: number): [number, number] {
    const dx = (x - this.cx) * this.zoom;
    const dy = (y - this.cy) * this.zoom;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return [
      this.width / 2 + this.offsetX + dx * cos - dy * sin,
      this.height / 2 + this.offsetY + dx * sin + dy * cos,
    ];
  }

  toWorld(sx: number, sy: number): [number, number] {
    const dx = (sx - this.width / 2 - this.offsetX) / this.zoom;
    const dy = (sy - this.height / 2 - this.offsetY) / this.zoom;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return [this.cx + dx * cos + dy * sin, this.cy - dx * sin + dy * cos];
  }

  view(): View {
    const s = this.zoom * this.dpr;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    const a = s * cos;
    const b = s * sin;
    const c = -s * sin;
    const d = s * cos;
    const ox = (this.width / 2 + this.offsetX) * this.dpr;
    const oy = (this.height / 2 + this.offsetY) * this.dpr;
    return {
      matrix: [
        a,
        b,
        c,
        d,
        ox - (a * this.cx + c * this.cy),
        oy - (b * this.cx + d * this.cy),
      ],
      scale: s,
      dpr: this.dpr,
      width: Math.round(this.width * this.dpr),
      height: Math.round(this.height * this.dpr),
    };
  }

  private clampZoom(zoom: number) {
    return Math.min(this.maxZoom, Math.max(this.minZoom, zoom));
  }

  /** Zooms by a factor while keeping the world point under (sx, sy) in place. */
  zoomAt(sx: number, sy: number, factor: number) {
    this.flight = null;
    const [wx, wy] = this.toWorld(sx, sy);
    this.zoom = this.clampZoom(this.zoom * factor);
    const [nx, ny] = this.toWorld(sx, sy);
    this.cx += wx - nx;
    this.cy += wy - ny;
  }

  /** Turns the city around the world point under (sx, sy). */
  rotateAt(sx: number, sy: number, radians: number) {
    this.flight = null;
    const [wx, wy] = this.toWorld(sx, sy);
    this.angle += radians;
    const [nx, ny] = this.toWorld(sx, sy);
    this.cx += wx - nx;
    this.cy += wy - ny;
  }

  panBy(dx: number, dy: number) {
    this.flight = null;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    this.cx -= (dx * cos + dy * sin) / this.zoom;
    this.cy -= (-dx * sin + dy * cos) / this.zoom;
  }

  /** A slow turn while nobody is touching the map (radians per second). */
  setSpin(radiansPerSecond: number) {
    this.spin = radiansPerSecond;
  }

  flyTo(to: Partial<Pose>, duration = 1100) {
    const target: Pose = {
      cx: to.cx ?? this.cx,
      cy: to.cy ?? this.cy,
      zoom: this.clampZoom(to.zoom ?? this.zoom),
      angle: to.angle ?? this.angle,
    };
    // Take the short way round.
    while (target.angle - this.angle > Math.PI) target.angle -= Math.PI * 2;
    while (target.angle - this.angle < -Math.PI) target.angle += Math.PI * 2;
    const distance = Math.hypot(target.cx - this.cx, target.cy - this.cy);
    const span =
      Math.min(this.width, this.height) / Math.min(this.zoom, target.zoom);
    const lift =
      distance > span * 0.6 ? Math.log(1 + distance / span) * 0.6 : 0;
    this.flight = {
      from: { cx: this.cx, cy: this.cy, zoom: this.zoom, angle: this.angle },
      to: target,
      start: performance.now(),
      duration,
      lift,
    };
  }

  get flying() {
    return this.flight !== null;
  }

  stop() {
    this.flight = null;
  }

  /** Advances any flight or spin; returns true while the view is changing. */
  update(now: number, dt: number) {
    if (this.flight) {
      const { from, to, start, duration, lift } = this.flight;
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      this.cx = from.cx + (to.cx - from.cx) * e;
      this.cy = from.cy + (to.cy - from.cy) * e;
      const logZoom =
        Math.log(from.zoom) + (Math.log(to.zoom) - Math.log(from.zoom)) * e;
      this.zoom = Math.exp(logZoom - lift * Math.sin(Math.PI * e));
      this.angle = from.angle + (to.angle - from.angle) * e;
      if (t >= 1) this.flight = null;
      return true;
    }
    if (this.spin) {
      this.angle += this.spin * dt;
      return true;
    }
    return false;
  }
}

export interface GestureHandlers {
  /** A tap or click that did not move: screen position and pointer type. */
  tap(x: number, y: number, pointerType: string): void;
  hover(x: number, y: number): void;
  leave(): void;
  /** The user moved the map (any drag, wheel, pinch or twist). */
  moved(): void;
  doubleTap(x: number, y: number): void;
}

/** Wires pointer and wheel input on the element to the camera. */
export function attachGestures(
  element: HTMLElement,
  camera: Camera,
  handlers: GestureHandlers
) {
  const pointers = new Map<
    number,
    { x: number; y: number; startX: number; startY: number }
  >();
  let dragged = false;
  let rotating = false;
  let lastTap = 0;
  let velocity = { x: 0, y: 0, t: 0 };
  let inertia = 0;
  let pinch: {
    distance: number;
    angle: number;
    cx: number;
    cy: number;
  } | null = null;

  const local = (event: PointerEvent | WheelEvent | MouseEvent) => {
    const rect = element.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top] as const;
  };

  const pinchState = () => {
    const [a, b] = [...pointers.values()];
    return {
      distance: Math.hypot(b.x - a.x, b.y - a.y),
      angle: Math.atan2(b.y - a.y, b.x - a.x),
      cx: (a.x + b.x) / 2,
      cy: (a.y + b.y) / 2,
    };
  };

  const stopInertia = () => {
    if (inertia) cancelAnimationFrame(inertia);
    inertia = 0;
  };

  element.addEventListener("pointerdown", event => {
    if (
      event.pointerType === "mouse" &&
      event.button !== 0 &&
      event.button !== 2
    )
      return;
    stopInertia();
    element.setPointerCapture(event.pointerId);
    const [x, y] = local(event);
    pointers.set(event.pointerId, { x, y, startX: x, startY: y });
    dragged = false;
    rotating =
      event.pointerType === "mouse" &&
      (event.button === 2 || event.shiftKey || event.altKey);
    velocity = { x: 0, y: 0, t: performance.now() };
    if (pointers.size === 2) pinch = pinchState();
  });

  element.addEventListener("pointermove", event => {
    const [x, y] = local(event);
    const pointer = pointers.get(event.pointerId);
    if (!pointer) {
      if (event.pointerType === "mouse") handlers.hover(x, y);
      return;
    }
    const dx = x - pointer.x;
    const dy = y - pointer.y;
    pointer.x = x;
    pointer.y = y;
    if (!dragged && Math.hypot(x - pointer.startX, y - pointer.startY) > 5)
      dragged = true;
    if (!dragged) return;
    if (pointers.size >= 2 && pinch) {
      const next = pinchState();
      if (pinch.distance > 0)
        camera.zoomAt(next.cx, next.cy, next.distance / pinch.distance);
      camera.rotateAt(next.cx, next.cy, next.angle - pinch.angle);
      camera.panBy(next.cx - pinch.cx, next.cy - pinch.cy);
      pinch = next;
    } else if (rotating) {
      // Drag sideways to turn the city around its middle.
      camera.rotateAt(
        camera.width / 2 + camera.offsetX,
        camera.height / 2 + camera.offsetY,
        dx * 0.006
      );
    } else {
      camera.panBy(dx, dy);
      const now = performance.now();
      const dt = Math.max(1, now - velocity.t);
      velocity = {
        x: 0.8 * (dx / dt) + 0.2 * velocity.x,
        y: 0.8 * (dy / dt) + 0.2 * velocity.y,
        t: now,
      };
    }
    handlers.moved();
  });

  const end = (event: PointerEvent) => {
    const pointer = pointers.get(event.pointerId);
    if (!pointer) return;
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 1) {
      // Continue as a one-finger drag from where the remaining finger is.
      const [rest] = pointers.values();
      rest.startX = rest.x;
      rest.startY = rest.y;
    }
    if (event.type === "pointercancel") return;
    const [x, y] = local(event);
    if (!dragged && pointers.size === 0) {
      const now = performance.now();
      if (now - lastTap < 320) {
        lastTap = 0;
        handlers.doubleTap(x, y);
      } else {
        lastTap = now;
        handlers.tap(x, y, event.pointerType);
      }
      return;
    }
    // A flick keeps the map gliding for a moment.
    if (
      pointers.size === 0 &&
      !rotating &&
      performance.now() - velocity.t < 80
    ) {
      let vx = velocity.x * 16;
      let vy = velocity.y * 16;
      const glide = () => {
        vx *= 0.92;
        vy *= 0.92;
        if (Math.hypot(vx, vy) < 0.3) {
          inertia = 0;
          return;
        }
        camera.panBy(vx, vy);
        handlers.moved();
        inertia = requestAnimationFrame(glide);
      };
      inertia = requestAnimationFrame(glide);
    }
  };
  element.addEventListener("pointerup", end);
  element.addEventListener("pointercancel", end);
  element.addEventListener("pointerleave", event => {
    if (event.pointerType === "mouse" && !pointers.size) handlers.leave();
  });
  element.addEventListener("contextmenu", event => event.preventDefault());

  element.addEventListener(
    "wheel",
    event => {
      event.preventDefault();
      stopInertia();
      const [x, y] = local(event);
      // Trackpad pinches arrive as wheel events with ctrlKey set.
      const scale =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
      const delta = event.deltaY * scale;
      const strength = event.ctrlKey ? 0.012 : 0.0018;
      camera.zoomAt(x, y, Math.exp(-delta * strength));
      handlers.moved();
    },
    { passive: false }
  );

  return { stopInertia };
}
