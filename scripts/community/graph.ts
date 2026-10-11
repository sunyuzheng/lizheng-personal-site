/**
 * Turns members and interactions into the connection map: who is linked to
 * whom, how strongly, since when, and where everyone sits on the map.
 */
import type { Interaction, MemberRecord } from "./circle";

/** Month indices count from August 2024, the community's first month. */
export const START_YEAR = 2024;
export const START_MONTH = 8;

export function monthIndex(iso: string) {
  const date = new Date(iso);
  return (
    (date.getUTCFullYear() - START_YEAR) * 12 +
    date.getUTCMonth() +
    1 -
    START_MONTH
  );
}

/**
 * How two members know each other, from the lightest to the strongest:
 * 1 点赞之交 — only likes, in either direction;
 * 2 聊过几句 — at least one comment or reply;
 * 3 常来常往 — both have reached out to the other, with several comments or
 *   over several months.
 */
export type Tie = 1 | 2 | 3;

export interface Pair {
  a: number;
  b: number;
  likes: number;
  comments: number;
  /** Interactions in each direction (a → b, b → a), likes and comments. */
  ab: number;
  ba: number;
  commentsAb: number;
  commentsBa: number;
  first: number;
  last: number;
  months: number;
  tie: Tie;
}

export interface Built {
  /** Members with a connection first (most connected first), then the rest. */
  order: MemberRecord[];
  active: number;
  pairs: Pair[];
  staff: Set<number>;
  first: number[];
  months: number;
  dropped: Record<string, number>;
}

const weightOf = (pair: { likes: number; comments: number }) =>
  pair.likes + 3 * pair.comments;

function tieOf(pair: Omit<Pair, "tie">): Tie {
  if (!pair.comments) return 1;
  const mutual = pair.ab > 0 && pair.ba > 0;
  const mutualTalk = pair.commentsAb > 0 && pair.commentsBa > 0;
  if (mutualTalk && (pair.comments >= 4 || pair.months >= 3)) return 3;
  if (mutual && weightOf(pair) >= 15 && pair.months >= 2) return 3;
  return 2;
}

const popcount = (mask: bigint) => {
  let count = 0;
  while (mask) {
    count += Number(mask & 1n);
    mask >>= 1n;
  }
  return count;
};

export function buildGraph(
  members: MemberRecord[],
  interactions: Interaction[],
  now: Date
): Built {
  const byId = new Map(members.map(member => [member.id, member]));
  const commentAuthor = new Map<number, number>();
  const staffIds = new Set<number>();
  for (const item of interactions) {
    if (item.comment && item.commentAuthor)
      commentAuthor.set(item.comment, item.commentAuthor);
    if (item.actorStaff) staffIds.add(item.actor);
    if (item.postAuthorStaff && item.postAuthor) staffIds.add(item.postAuthor);
    if (item.commentAuthorStaff && item.commentAuthor)
      staffIds.add(item.commentAuthor);
  }

  const dropped: Record<string, number> = {};
  const drop = (reason: string) =>
    (dropped[reason] = (dropped[reason] ?? 0) + 1);
  interface Acc {
    a: number;
    b: number;
    likes: number;
    comments: number;
    ab: number;
    ba: number;
    commentsAb: number;
    commentsBa: number;
    first: number;
    last: number;
    mask: bigint;
  }
  const pairs = new Map<string, Acc>();
  const months = monthIndex(now.toISOString()) + 1;

  for (const item of interactions) {
    let target: number | undefined;
    if (item.kind === "like") target = item.postAuthor;
    else if (item.kind === "comment-like") target = item.commentAuthor;
    else if (item.parentComment)
      target = commentAuthor.get(item.parentComment) ?? item.postAuthor;
    else target = item.postAuthor;
    if (!target) {
      drop("no target");
      continue;
    }
    if (target === item.actor) {
      drop("own post or comment");
      continue;
    }
    if (!byId.has(item.actor) || !byId.has(target)) {
      drop("not a current member");
      continue;
    }
    const month = monthIndex(item.at);
    if (month < 0 || month >= months) {
      drop("outside the time range");
      continue;
    }
    const a = Math.min(item.actor, target);
    const b = Math.max(item.actor, target);
    const key = `${a}:${b}`;
    let acc = pairs.get(key);
    if (!acc) {
      acc = {
        a,
        b,
        likes: 0,
        comments: 0,
        ab: 0,
        ba: 0,
        commentsAb: 0,
        commentsBa: 0,
        first: month,
        last: month,
        mask: 0n,
      };
      pairs.set(key, acc);
    }
    const forward = item.actor === a;
    const isComment = item.kind === "comment";
    if (isComment) acc.comments++;
    else acc.likes++;
    if (forward) {
      acc.ab++;
      if (isComment) acc.commentsAb++;
    } else {
      acc.ba++;
      if (isComment) acc.commentsBa++;
    }
    if (month < acc.first) acc.first = month;
    if (month > acc.last) acc.last = month;
    acc.mask |= 1n << BigInt(month);
  }

  // Everyone with at least one connection, most connected first.
  const strength = new Map<number, number>();
  for (const acc of pairs.values()) {
    const weight = weightOf(acc);
    strength.set(acc.a, (strength.get(acc.a) ?? 0) + weight);
    strength.set(acc.b, (strength.get(acc.b) ?? 0) + weight);
  }
  const connected = members
    .filter(member => strength.has(member.id))
    .sort(
      (x, y) =>
        strength.get(y.id)! - strength.get(x.id)! || x.created - y.created
    );
  const quiet = members
    .filter(member => !strength.has(member.id))
    .sort(
      (x, y) =>
        y.posts * 3 + y.comments - (x.posts * 3 + x.comments) ||
        y.seen - x.seen ||
        x.created - y.created
    );
  const order = [...connected, ...quiet];
  const index = new Map(order.map((member, i) => [member.id, i]));

  const first = new Array<number>(connected.length).fill(months - 1);
  const list: Pair[] = [];
  for (const acc of pairs.values()) {
    let a = index.get(acc.a)!;
    let b = index.get(acc.b)!;
    let { ab, ba, commentsAb, commentsBa } = acc;
    if (a > b) {
      [a, b] = [b, a];
      [ab, ba] = [ba, ab];
      [commentsAb, commentsBa] = [commentsBa, commentsAb];
    }
    const pair = {
      a,
      b,
      likes: acc.likes,
      comments: acc.comments,
      ab,
      ba,
      commentsAb,
      commentsBa,
      first: acc.first,
      last: acc.last,
      months: popcount(acc.mask),
    };
    list.push({ ...pair, tie: tieOf(pair) });
    first[a] = Math.min(first[a], acc.first);
    first[b] = Math.min(first[b], acc.first);
  }
  list.sort((x, y) => x.a - y.a || x.b - y.b);

  const staff = new Set<number>();
  for (const id of staffIds) {
    const i = index.get(id);
    if (i !== undefined && i < connected.length) staff.add(i);
  }
  return {
    order,
    active: connected.length,
    pairs: list,
    staff,
    first,
    months,
    dropped,
  };
}

export interface RingOptions {
  iterations: number;
  /** Members per band whose angles are spread evenly. */
  band: number;
  /** How much a member holds on to their own direction against their friends'. */
  inertia: number;
  tieWeights: [number, number, number];
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const TAU = Math.PI * 2;

/**
 * The city as rings: everyone sits at a distance from the middle set by when
 * they joined (the earliest at the centre, area proportional to headcount, so
 * the lights are evenly spread), and at an angle pulled towards the people
 * they talk to. Within every band of members who joined around the same time
 * the angles stay evenly spread, so no part of the city crowds or empties.
 *
 * Returns `rank` (join order) and `angle` (radians) for every member in
 * built.order.
 */
export function ringLayout(built: Built, options: RingOptions) {
  const n = built.order.length;
  const byJoin = [...Array(n).keys()].sort(
    (i, j) =>
      built.order[i].created - built.order[j].created ||
      built.order[i].id - built.order[j].id
  );
  const rank = new Int32Array(n);
  byJoin.forEach((member, r) => (rank[member] = r));
  const angle = new Float64Array(n);
  for (let r = 0; r < n; r++) angle[byJoin[r]] = (r * GOLDEN) % TAU;

  // Friends pull each other's direction together; staff talk to everyone, so
  // their lines would only blur the picture and are left out of the pull.
  const tieWeight = [0, ...options.tieWeights];
  const links: { other: number; weight: number }[][] = Array.from(
    { length: n },
    () => []
  );
  for (const pair of built.pairs) {
    if (built.staff.has(pair.a) || built.staff.has(pair.b)) continue;
    const weight = tieWeight[pair.tie];
    links[pair.a].push({ other: pair.b, weight });
    links[pair.b].push({ other: pair.a, weight });
  }

  // Only connected members move; quiet members keep their evenly spread
  // sunflower places. Bands are counted among connected members.
  const movers = byJoin.filter(member => member < built.active);
  const desired = new Float64Array(n);
  const band = Math.max(8, options.band);
  for (let iteration = 0; iteration < options.iterations; iteration++) {
    for (const i of movers) {
      let sx = Math.cos(angle[i]) * options.inertia;
      let sy = Math.sin(angle[i]) * options.inertia;
      for (const { other, weight } of links[i]) {
        sx += Math.cos(angle[other]) * weight;
        sy += Math.sin(angle[other]) * weight;
      }
      desired[i] = Math.atan2(sy, sx);
    }
    // Spread each band evenly round the whole circle, in the order its
    // members would like to sit, turned to match where they want to be. On
    // their own, friends would all drift to one side; spreading them again
    // every round keeps only who sits next to whom. Bands shift every other
    // round so no seams form between them.
    const shift = iteration % 2 ? Math.floor(band / 2) : 0;
    for (let start = -shift; start < movers.length; start += band) {
      const from = Math.max(0, start);
      const to = Math.min(movers.length, start + band);
      const size = to - from;
      if (size < 2) continue;
      const members = movers
        .slice(from, to)
        .sort((i, j) => desired[i] - desired[j]);
      let cx = 0;
      let cy = 0;
      members.forEach((member, k) => {
        const offset = desired[member] - (TAU * k) / size;
        cx += Math.cos(offset);
        cy += Math.sin(offset);
      });
      const base = Math.atan2(cy, cx);
      members.forEach((member, k) => {
        angle[member] = (base + (TAU * k) / size + TAU) % TAU;
      });
    }
  }
  return { rank, angle };
}
