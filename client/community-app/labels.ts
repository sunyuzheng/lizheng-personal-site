/**
 * Names, faces and ring labels over the city on city.lizheng.ai, placed
 * afresh every frame. People are placed one by one, most important first:
 * the person being looked at, then the people they know best (or, with
 * nobody looked at, the most connected people on screen). A person gets a
 * face and a name only where both fit clear of the page's words and of
 * everyone placed before them; otherwise they stay a light, and pointing at
 * it shows who it is.
 */
import type { Camera } from "./camera";
import type { Copy } from "./copy";
import { calendar, ringRadius, type Community, type Neighbour } from "./data";
import type { AvatarSprite } from "./renderer";

export interface RingMark {
  month: number;
  label: string;
  /** World radius where the members who joined that month begin. */
  radius: number;
}

/** The rings at the start of each half year. */
export function ringMarks(c: Community, t: Copy) {
  const marks: RingMark[] = [];
  for (let index = 1; index < c.months; index++) {
    const { year, month } = calendar(c, index);
    if (month === 1 || month === 7)
      marks.push({
        month: index,
        label: t.ringLabel(year, month),
        radius: ringRadius(c, index),
      });
  }
  return marks;
}

export interface LabelFrame {
  /** The person looked at (-1 for none), with the people they know best. */
  focus: number;
  neighbours: Neighbour[];
  /** The person pointed at, or -1. */
  hovered: number;
  /** The month being shown; people not yet connected then stay unnamed. */
  month: number;
  /** The opening is in its first months: nobody is named yet. */
  early: boolean;
  /** How far the view is zoomed in from the overview. */
  zoomRatio: number;
  /** Whether the picture sheet has loaded. */
  facesReady: boolean;
  /** The page's words, which names and faces keep clear of. */
  keepClear: DOMRect[];
}

// Rough text widths: CJK characters are square, Latin about 0.58 em.
const textWidth = (text: string, size: number) => {
  let width = 0;
  for (const ch of text)
    width += ch.charCodeAt(0) > 0x2e80 ? size : size * 0.58;
  return width;
};

const CELL = 8; // occupancy grid, in CSS pixels
const RING_POOL = 6;
const MAX_FACES = 160;

export class Labels {
  private pool: HTMLDivElement[] = [];
  private poolText: string[] = [];
  private ringPool: HTMLDivElement[] = [];
  /** Where each shown name (with its face or light) sits this frame. */
  private spots: {
    member: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
  }[] = [];

  constructor(
    layer: HTMLElement,
    private c: Community,
    private camera: Camera,
    private marks: RingMark[],
    private coarse: boolean
  ) {
    const size = coarse ? 18 : 44;
    for (let i = 0; i < size; i++) {
      const element = document.createElement("div");
      element.className = "name";
      layer.appendChild(element);
      this.pool.push(element);
      this.poolText.push("");
    }
    for (let i = 0; i < RING_POOL; i++) {
      const element = document.createElement("div");
      element.className = "name ring";
      layer.appendChild(element);
      this.ringPool.push(element);
    }
  }

  /** The person whose name (or face beside it) is at a screen point, or -1. */
  nameAt(x: number, y: number) {
    const pad = this.coarse ? 8 : 2;
    for (const spot of this.spots) {
      if (
        x >= spot.left - pad &&
        x <= spot.right + pad &&
        y >= spot.top - pad &&
        y <= spot.bottom + pad
      )
        return spot.member;
    }
    return -1;
  }

  /** Places this frame's names and ring labels; returns the faces to draw. */
  place(frame: LabelFrame): AvatarSprite[] {
    const { c, camera, pool } = this;
    const { focus, month, zoomRatio } = frame;
    const w = camera.width;
    const h = camera.height;
    const cols = Math.ceil(w / CELL) + 1;
    const occupied = new Uint8Array(cols * (Math.ceil(h / CELL) + 1));
    // Checks (take = false) or claims (take = true) a screen rectangle.
    const area = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      take: boolean
    ) => {
      const c0 = Math.max(0, Math.floor(x0 / CELL));
      const c1 = Math.min(cols - 1, Math.floor(x1 / CELL));
      const r0 = Math.max(0, Math.floor(y0 / CELL));
      const r1 = Math.floor(y1 / CELL);
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
    for (const rect of frame.keepClear)
      area(rect.left - 6, rect.top - 6, rect.right + 6, rect.bottom + 6, true);

    const facesOn = frame.facesReady && (focus >= 0 || zoomRatio >= 3.2);
    const faceFade = focus >= 0 ? 1 : Math.min(1, (zoomRatio - 3.2) / 1.5);
    const nameBudget =
      focus >= 0
        ? pool.length
        : Math.round(Math.min(pool.length, 7 * Math.pow(zoomRatio, 1.1)));

    const candidates: { member: number; level: "focus" | "big" | "plain" }[] =
      [];
    if (focus >= 0) {
      candidates.push({ member: focus, level: "focus" });
      for (const { member } of frame.neighbours.slice(0, 120))
        candidates.push({ member, level: "plain" });
    } else if (!frame.early) {
      if (frame.hovered >= 0)
        candidates.push({ member: frame.hovered, level: "big" });
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
    const face = (
      sx: number,
      sy: number,
      r: number,
      member: number,
      ring: number
    ) =>
      sprites.push({
        x: sx * camera.dpr,
        y: sy * camera.dpr,
        radius: r * camera.dpr,
        cell: c.avatarCell[member],
        alpha: faceFade,
        ring,
      });
    this.spots.length = 0;
    const seen = new Set<number>();
    let names = 0;
    for (const { member, level } of candidates) {
      if (seen.has(member)) continue;
      seen.add(member);
      if (names >= pool.length && sprites.length >= MAX_FACES) break;
      if (month < c.firstLink[member] && level !== "focus") continue;
      const [sx, sy] = camera.toScreen(c.x[member], c.y[member]);
      if (sx < -30 || sy < -20 || sx > w + 30 || sy > h + 20) continue;
      const isFocus = level === "focus";
      const hasFace =
        facesOn && c.avatarCell[member] >= 0 && sprites.length < MAX_FACES;
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
        face(sx, sy, r, member, 0);
        continue;
      }
      area(left, top, right, bottom, true);
      if (r) face(sx, sy, r, member, isFocus ? 1 : 0);
      if (name && names < pool.length) {
        const element = pool[names];
        if (this.poolText[names] !== name) {
          element.textContent = name;
          this.poolText[names] = name;
        }
        element.className = `name on ${level === "plain" ? "" : level}`;
        // The element's own padding adds 9px before the text.
        element.style.transform = `translate3d(${(sx + gap - 9).toFixed(1)}px, ${(sy - size * 0.55).toFixed(1)}px, 0)`;
        this.spots.push({ member, left, top, right, bottom });
        names++;
      }
    }
    for (let i = names; i < pool.length; i++) pool[i].className = "name";

    // Ring labels sit on each ring towards the upper right, upright.
    let used = 0;
    const [cx, cy] = camera.toScreen(0, 0);
    const angle = -Math.PI * 0.3;
    for (const mark of this.marks) {
      if (used >= RING_POOL || mark.month > month) break;
      const r = mark.radius * camera.zoom;
      if (r < 90) continue;
      const lx = cx + Math.cos(angle) * r + 6;
      const ly = cy + Math.sin(angle) * r - 6;
      if (lx < 0 || ly < 0 || lx > w - 60 || ly > h) continue;
      const lw = textWidth(mark.label, 11.5) + 8;
      if (!area(lx, ly - 2, lx + lw, ly + 14, false)) continue;
      area(lx, ly - 2, lx + lw, ly + 14, true);
      const element = this.ringPool[used++];
      element.textContent = mark.label;
      element.className = "name ring on";
      element.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`;
    }
    for (let i = used; i < RING_POOL; i++)
      this.ringPool[i].className = "name ring";
    return sprites;
  }
}
