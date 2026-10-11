/**
 * The file city.lizheng.ai reads: every member in the order they joined
 * (so a member's index is also their place on the rings), and every pair of
 * members who have interacted.
 */
import type { Built } from "./graph";
import { monthIndex, START_MONTH, START_YEAR } from "./graph";

export interface GraphFile {
  version: 1;
  generatedAt: string;
  /** First month (YYYY-MM); month indices count from it. */
  start: string;
  months: number;
  count: number;
  /** Per member, in join order. */
  linked: string[];
  names: string[];
  /** Month index the member joined. */
  joined: number[];
  /** Direction on the rings, 0–9999 of a full turn. */
  angle: number[];
  /** 0–9 per member, as on the homepage map. */
  heat: string;
  /** Members with posts or comments: [index gap, posts, comments, …]. */
  activity: number[];
  staff: number[];
  /** Pairs sorted by a then b (a < b); a is stored as the gap from the previous a. */
  pairs: {
    a: number[];
    b: number[];
    tie: string;
    likes: number[];
    comments: number[];
    first: number[];
    last: number[];
  };
  avatars?: {
    file: string;
    columns: number;
    rows: number;
    cell: number;
    /** [index gap, atlas cell, …] for members with a picture. */
    cells: number[];
  };
}

function heatFor(posts: number, comments: number, seen: number, now: number) {
  const score = posts * 3 + comments;
  if (score > 0) {
    const steps = [3, 10, 30, 100, 300, 1000];
    return 3 + steps.filter(step => score >= step).length;
  }
  const day = 24 * 60 * 60 * 1000;
  return now - seen < 30 * day ? 2 : now - seen < 180 * day ? 1 : 0;
}

export function toGraphFile(
  built: Built,
  rings: { rank: Int32Array; angle: Float64Array },
  now: Date
): { file: GraphFile; joinOrder: number[] } {
  const n = built.order.length;
  // joinOrder[k] = index in built.order of the k-th member to join.
  const joinOrder = new Array<number>(n);
  for (let i = 0; i < n; i++) joinOrder[rings.rank[i]] = i;
  const position = rings.rank;
  const startDate = `${START_YEAR}-${String(START_MONTH).padStart(2, "0")}`;

  const linked: string[] = [];
  const names: string[] = [];
  const joined: number[] = [];
  const angle: number[] = [];
  let heat = "";
  const activity: number[] = [];
  let lastActive = -1;
  for (let k = 0; k < n; k++) {
    const member = built.order[joinOrder[k]];
    linked.push(member.uid);
    names.push(member.name);
    joined.push(
      member.created
        ? Math.max(0, monthIndex(new Date(member.created).toISOString()))
        : 0
    );
    angle.push(
      Math.round((rings.angle[joinOrder[k]] / (Math.PI * 2)) * 10000) % 10000
    );
    heat += String(
      heatFor(member.posts, member.comments, member.seen, now.getTime())
    );
    if (member.posts || member.comments) {
      activity.push(k - lastActive, member.posts, member.comments);
      lastActive = k;
    }
  }

  const pairs = built.pairs
    .map(pair => {
      const a = position[pair.a];
      const b = position[pair.b];
      return { ...pair, a: Math.min(a, b), b: Math.max(a, b) };
    })
    .sort((x, y) => x.a - y.a || x.b - y.b);
  const out: GraphFile["pairs"] = {
    a: [],
    b: [],
    tie: "",
    likes: [],
    comments: [],
    first: [],
    last: [],
  };
  let previous = 0;
  for (const pair of pairs) {
    out.a.push(pair.a - previous);
    previous = pair.a;
    out.b.push(pair.b);
    out.tie += String(pair.tie);
    out.likes.push(pair.likes);
    out.comments.push(pair.comments);
    out.first.push(pair.first);
    out.last.push(pair.last);
  }

  return {
    joinOrder,
    file: {
      version: 1,
      generatedAt: now.toISOString().slice(0, 10),
      start: startDate,
      months: built.months,
      count: n,
      linked,
      names,
      joined,
      angle,
      heat,
      activity,
      staff: [...built.staff].map(i => position[i]).sort((x, y) => x - y),
      pairs: out,
    },
  };
}
