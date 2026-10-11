/**
 * The community file (scripts/build-community-graph.ts) and what the page
 * derives from it: where everyone sits on the rings, who is linked to whom,
 * and how the city grew month by month.
 */

export interface GraphFile {
  version: 1;
  generatedAt: string;
  start: string;
  months: number;
  count: number;
  linked: string[];
  names: string[];
  joined: number[];
  angle: number[];
  heat: string;
  activity: number[];
  staff: number[];
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
    cells: number[];
  };
}

export interface Community {
  generatedAt: string;
  startYear: number;
  startMonth: number;
  months: number;
  count: number;
  linked: string[];
  names: string[];
  joined: Int16Array;
  heat: Uint8Array;
  posts: Uint32Array;
  comments: Uint32Array;
  staff: Set<number>;
  x: Float32Array;
  y: Float32Array;
  pairCount: number;
  pairA: Uint32Array;
  pairB: Uint32Array;
  tie: Uint8Array;
  likes: Uint32Array;
  pairComments: Uint32Array;
  pairFirst: Uint8Array;
  pairLast: Uint8Array;
  /** Pair indices for each member: adjacency[offsets[i] … offsets[i + 1]]. */
  offsets: Uint32Array;
  adjacency: Uint32Array;
  degree: Uint32Array;
  strength: Float32Array;
  /** Month of a member's first connection (Infinity for none). */
  firstLink: Float32Array;
  /** Connected members, most connected first. */
  ranked: Uint32Array;
  /** Running totals at the end of each month. */
  membersByMonth: Uint32Array;
  pairsByMonth: Uint32Array;
  avatarCell: Int32Array;
  avatars?: GraphFile["avatars"];
}

const isInts = (value: unknown, length: number) =>
  Array.isArray(value) &&
  value.length === length &&
  value.every(v => Number.isInteger(v) && v >= 0);

export function isGraphFile(value: unknown): value is GraphFile {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<GraphFile>;
  const count = data.count ?? 0;
  const pairs = data.pairs;
  const pairCount = pairs?.b?.length ?? -1;
  return (
    data.version === 1 &&
    typeof data.generatedAt === "string" &&
    typeof data.start === "string" &&
    /^\d{4}-\d{2}$/.test(data.start) &&
    Number.isInteger(data.months) &&
    count > 0 &&
    Array.isArray(data.linked) &&
    data.linked.length === count &&
    data.linked.every(id => id === "" || /^[a-z0-9]{4,24}$/i.test(id)) &&
    Array.isArray(data.names) &&
    data.names.length === count &&
    data.names.every(name => typeof name === "string" && name.length <= 80) &&
    isInts(data.joined, count) &&
    isInts(data.angle, count) &&
    typeof data.heat === "string" &&
    data.heat.length === count &&
    /^[0-9]*$/.test(data.heat) &&
    Array.isArray(data.activity) &&
    Array.isArray(data.staff) &&
    !!pairs &&
    pairCount >= 0 &&
    isInts(pairs.a, pairCount) &&
    isInts(pairs.b, pairCount) &&
    typeof pairs.tie === "string" &&
    pairs.tie.length === pairCount &&
    /^[1-3]*$/.test(pairs.tie) &&
    isInts(pairs.likes, pairCount) &&
    isInts(pairs.comments, pairCount) &&
    isInts(pairs.first, pairCount) &&
    isInts(pairs.last, pairCount)
  );
}

export function decode(file: GraphFile): Community {
  const n = file.count;
  const [startYear, startMonth] = file.start.split("-").map(Number);
  const joined = Int16Array.from(file.joined);
  const heat = new Uint8Array(n);
  for (let i = 0; i < n; i++) heat[i] = file.heat.charCodeAt(i) - 48;
  const posts = new Uint32Array(n);
  const comments = new Uint32Array(n);
  for (let k = 0, i = -1; k + 2 < file.activity.length; k += 3) {
    i += file.activity[k];
    if (i >= 0 && i < n) {
      posts[i] = file.activity[k + 1];
      comments[i] = file.activity[k + 2];
    }
  }

  // Everyone sits at a distance set by when they joined: the earliest in the
  // middle, equal area per person, so the lights spread evenly.
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt((i + 0.5) / n);
    const a = (file.angle[i] / 10000) * Math.PI * 2;
    x[i] = r * Math.cos(a);
    y[i] = r * Math.sin(a);
  }

  const m = file.pairs.b.length;
  const pairA = new Uint32Array(m);
  const pairB = Uint32Array.from(file.pairs.b);
  let a = 0;
  for (let k = 0; k < m; k++) {
    a += file.pairs.a[k];
    pairA[k] = a;
  }
  const tie = new Uint8Array(m);
  for (let k = 0; k < m; k++) tie[k] = file.pairs.tie.charCodeAt(k) - 48;
  const likes = Uint32Array.from(file.pairs.likes);
  const pairComments = Uint32Array.from(file.pairs.comments);
  const pairFirst = Uint8Array.from(file.pairs.first);
  const pairLast = Uint8Array.from(file.pairs.last);

  const degree = new Uint32Array(n);
  const strength = new Float32Array(n);
  const firstLink = new Float32Array(n).fill(Infinity);
  for (let k = 0; k < m; k++) {
    const p = pairA[k];
    const q = pairB[k];
    if (p >= n || q >= n) continue;
    degree[p]++;
    degree[q]++;
    const w = likes[k] + 3 * pairComments[k];
    strength[p] += w;
    strength[q] += w;
    if (pairFirst[k] < firstLink[p]) firstLink[p] = pairFirst[k];
    if (pairFirst[k] < firstLink[q]) firstLink[q] = pairFirst[k];
  }
  const offsets = new Uint32Array(n + 1);
  for (let i = 0; i < n; i++) offsets[i + 1] = offsets[i] + degree[i];
  const fill = offsets.slice(0, n);
  const adjacency = new Uint32Array(offsets[n]);
  for (let k = 0; k < m; k++) {
    const p = pairA[k];
    const q = pairB[k];
    if (p >= n || q >= n) continue;
    adjacency[fill[p]++] = k;
    adjacency[fill[q]++] = k;
  }

  const connected: number[] = [];
  for (let i = 0; i < n; i++) if (degree[i]) connected.push(i);
  connected.sort((p, q) => strength[q] - strength[p]);

  const months = file.months;
  const membersByMonth = new Uint32Array(months);
  const pairsByMonth = new Uint32Array(months);
  for (let i = 0; i < n; i++)
    membersByMonth[Math.min(months - 1, Math.max(0, joined[i]))]++;
  for (let k = 0; k < m; k++)
    pairsByMonth[Math.min(months - 1, pairFirst[k])]++;
  for (let t = 1; t < months; t++) {
    membersByMonth[t] += membersByMonth[t - 1];
    pairsByMonth[t] += pairsByMonth[t - 1];
  }

  const avatarCell = new Int32Array(n).fill(-1);
  if (file.avatars) {
    for (let k = 0, i = -1; k + 1 < file.avatars.cells.length; k += 2) {
      i += file.avatars.cells[k];
      if (i >= 0 && i < n) avatarCell[i] = file.avatars.cells[k + 1];
    }
  }

  return {
    generatedAt: file.generatedAt,
    startYear,
    startMonth,
    months,
    count: n,
    linked: file.linked,
    names: file.names,
    joined,
    heat,
    posts,
    comments,
    staff: new Set(file.staff),
    x,
    y,
    pairCount: m,
    pairA,
    pairB,
    tie,
    likes,
    pairComments,
    pairFirst,
    pairLast,
    offsets,
    adjacency,
    degree,
    strength,
    firstLink,
    ranked: Uint32Array.from(connected),
    membersByMonth,
    pairsByMonth,
    avatarCell,
    avatars: file.avatars,
  };
}

/** Calendar year and month for a month index. */
export function calendar(community: Community, month: number) {
  const total = community.startYear * 12 + community.startMonth - 1 + month;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

/** The other member of a pair. */
export const otherOf = (community: Community, pair: number, member: number) =>
  community.pairA[pair] === member
    ? community.pairB[pair]
    : community.pairA[pair];

export interface Neighbour {
  member: number;
  pair: number;
}

/**
 * The people someone is linked with, closest first: by kind of tie (常来常往
 * first), then by how many comments and likes passed between them.
 */
export function neighboursOf(community: Community, member: number) {
  const list: (Neighbour & { weight: number })[] = [];
  for (
    let k = community.offsets[member];
    k < community.offsets[member + 1];
    k++
  ) {
    const pair = community.adjacency[k];
    list.push({
      member: otherOf(community, pair, member),
      pair,
      weight:
        community.tie[pair] * 1000 +
        community.likes[pair] +
        3 * community.pairComments[pair],
    });
  }
  return list.sort((p, q) => q.weight - p.weight) as Neighbour[];
}

/** Radius on the rings where the members who joined in a month begin. */
export function ringRadius(community: Community, month: number) {
  const before =
    month <= 0
      ? 0
      : community.membersByMonth[Math.min(community.months - 1, month - 1)];
  return Math.sqrt(before / community.count);
}
