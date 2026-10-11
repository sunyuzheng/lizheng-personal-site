/**
 * Small lights that run along lines: along lines that were busy in the last
 * two months while the city rests, and along a person's lines towards them
 * while they are looked at. Shared by the full page and the homepage window,
 * which uses fewer and smaller ones.
 */
import type { Community } from "./data";
import { CURVE, type Pulse } from "./renderer";

/** The point a fraction `s` along a pair's line, bent as the shader bends it. */
export function linePoint(c: Community, pair: number, s: number) {
  const x0 = c.x[c.pairA[pair]];
  const y0 = c.y[c.pairA[pair]];
  const x2 = c.x[c.pairB[pair]];
  const y2 = c.y[c.pairB[pair]];
  // The control point sits off the middle of the chord.
  const x1 = (x0 + x2) / 2 - (y2 - y0) * CURVE;
  const y1 = (y0 + y2) / 2 + (x2 - x0) * CURVE;
  const u = 1 - s;
  return [
    u * u * x0 + 2 * u * s * x1 + s * s * x2,
    u * u * y0 + 2 * u * s * y1 + s * s * y2,
  ] as const;
}

/** Lines with at least a comment that were busy in the last two months. */
export function busyPairs(c: Community) {
  const pairs: number[] = [];
  for (let k = 0; k < c.pairCount; k++)
    if (c.pairLast[k] >= c.months - 2 && c.tie[k] >= 2) pairs.push(k);
  return pairs;
}

interface Look {
  /** At most this many running at once. */
  max: number;
  /** Lights in each pulse's trail, how far apart along the line, and how big the head is. */
  trail: number;
  spacing: number;
  size: number;
  glow: number;
  /** Shortest trip along a line, in milliseconds (up to 1.2 s longer). */
  duration: number;
}

export class Pulses {
  private running: {
    pair: number;
    start: number;
    duration: number;
    forward: boolean;
  }[] = [];
  private last = 0;

  constructor(
    private c: Community,
    private look: Look
  ) {}

  clear() {
    this.running.length = 0;
  }

  /**
   * This frame's lights. Every `interval` milliseconds a new pulse starts on
   * one of `pairs`, running towards `toward` when that person is one end.
   */
  lights(now: number, pairs: number[], interval: number, toward = -1) {
    const { c, look } = this;
    if (
      pairs.length &&
      now - this.last > interval &&
      this.running.length < look.max
    ) {
      this.last = now;
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      this.running.push({
        pair,
        start: now,
        duration: look.duration + Math.random() * 1200,
        forward: toward >= 0 ? c.pairB[pair] === toward : Math.random() < 0.5,
      });
    }
    const out: Pulse[] = [];
    for (let i = this.running.length - 1; i >= 0; i--) {
      const pulse = this.running[i];
      const progress = (now - pulse.start) / pulse.duration;
      if (progress >= 1) {
        this.running.splice(i, 1);
        continue;
      }
      const fade = Math.sin(Math.PI * Math.min(1, progress * 1.15));
      const mint = c.tie[pulse.pair] === 3 ? 1 : 0.35;
      for (let k = 0; k < look.trail; k++) {
        const s = progress - k * look.spacing;
        if (s < 0) break;
        const [x, y] = linePoint(c, pulse.pair, pulse.forward ? s : 1 - s);
        out.push({
          x,
          y,
          size: look.size - k * 0.18,
          glow: (look.glow - k * 0.17) * fade,
          mint,
        });
      }
    }
    return out;
  }
}
