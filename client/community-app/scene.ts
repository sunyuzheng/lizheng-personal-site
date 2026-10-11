/**
 * What both community pages draw from the decoded data: every member's light
 * (size from connections, brightness from activity), every line's tie and
 * brightness, which lights and lines brighten around one person, and a grid
 * for finding the light under the pointer. Used by the full page (main.ts)
 * and the homepage window (embed.ts).
 */
import { otherOf, type Community } from "./data";
import type { Scene } from "./renderer";

/** A small deterministic hash for per-member variety. */
function hash(i: number) {
  const n = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return n - Math.floor(n);
}

export function buildScene(c: Community): Scene {
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

/**
 * The lights and lines to brighten around one person (-1 for none): the
 * person at 2, the people they are linked with at 1, and their lines at
 * `line` (2 while they are looked at, 1 while pointed at).
 */
export function highlightAround(c: Community, member: number, line: 1 | 2) {
  const nodes = new Map<number, number>();
  const edges = new Map<number, number>();
  if (member < 0) return { nodes, edges };
  nodes.set(member, 2);
  for (let k = c.offsets[member]; k < c.offsets[member + 1]; k++) {
    const pair = c.adjacency[k];
    edges.set(pair, line);
    const other = otherOf(c, pair, member);
    if (!nodes.has(other)) nodes.set(other, 1);
  }
  return { nodes, edges };
}

/** A grid over world space for finding the light under the pointer. */
export class Grid {
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
