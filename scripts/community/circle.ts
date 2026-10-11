/**
 * Circle reads shared by the community data builds: the member list (Admin API)
 * and the interaction events behind the connection map (Data API). Both keep
 * only what the pages need; e-mail addresses, profile fields and message text
 * are dropped as each page arrives.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const ADMIN_API = "https://app.circle.so/api/admin/v2";
const DATA_ORIGIN = "https://app.circle.so";
const EVENTS_PATH = "/data_api/v1/community_events";
const MEMBERS_PER_PAGE = 100;
const EVENTS_PER_PAGE = 2000;
// Data API pages are fetched a few at a time; it allows 600 requests a minute.
const EVENT_CONCURRENCY = 4;
// Circle can write an event a little after it happened, so each incremental
// read starts ten minutes before the last one ended; duplicates are dropped.
const CURSOR_OVERLAP_MS = 10 * 60 * 1000;

export interface MemberRecord {
  id: number;
  uid: string;
  name: string;
  avatar: string;
  posts: number;
  comments: number;
  /** Milliseconds since the epoch; 0 when unknown. */
  created: number;
  seen: number;
}

/** One like or comment, reduced to who acted on whose post or comment. */
export interface Interaction {
  id: string;
  /** When Circle recorded it (the read cursor) and when it happened. */
  created: string;
  at: string;
  kind: "like" | "comment-like" | "comment";
  actor: number;
  actorUid?: string;
  actorStaff?: true;
  post?: number;
  postAuthor?: number;
  postAuthorStaff?: true;
  space?: number;
  comment?: number;
  commentAuthor?: number;
  commentAuthorStaff?: true;
  parentComment?: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getJson(url: string, token: string, label: string) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // Circle rejects requests without a browser-like user agent.
        "User-Agent": "Mozilla/5.0",
      },
    });
    if (response.ok) return response.json();
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`Circle ${label} ${response.status}`);
    }
    const retryAfter = Number(response.headers.get("retry-after") ?? 0);
    await sleep(Math.max(retryAfter * 1000, 2000 * 2 ** attempt));
  }
  throw new Error(`Circle ${label} kept failing`);
}

// The name members show on their profile. Anything that looks like contact
// details (an e-mail address or a phone number) is left out.
export function displayName(member: {
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}) {
  const raw =
    member.name ||
    [member.first_name, member.last_name].filter(Boolean).join(" ");
  const name = String(raw ?? "")
    .normalize("NFC")
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!name || name.includes("@") || /\d{6,}/.test(name.replace(/[\s-]/g, "")))
    return "";
  return [...name].slice(0, 40).join("");
}

interface RawMember {
  id?: number;
  public_uid?: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  posts_count?: number;
  comments_count?: number;
  created_at?: string;
  last_seen_at?: string | null;
}

const toTime = (value?: string | null) => (value ? Date.parse(value) || 0 : 0);

interface MemberProgress {
  startedAt: number;
  count: number;
  page: number;
  members: MemberRecord[];
}

/**
 * All active members: ceil(members / 100) Admin API requests. The Admin API
 * has a monthly cap shared with other Superlinear tools, so the read stops
 * before it starts when it would need more than maxRequests. With a progress
 * file, an interrupted read resumes where it stopped (within 12 hours)
 * instead of spending the requests again.
 */
export async function fetchMembers(
  token: string,
  maxRequests: number,
  progressFile?: string
) {
  const pageUrl = (page: number) =>
    `${ADMIN_API}/community_members?per_page=${MEMBERS_PER_PAGE}&page=${page}&status=active`;
  let progress: MemberProgress | null = null;
  if (progressFile && fs.existsSync(progressFile)) {
    const saved = JSON.parse(
      fs.readFileSync(progressFile, "utf8")
    ) as MemberProgress;
    if (Date.now() - saved.startedAt < 12 * 60 * 60 * 1000) progress = saved;
  }
  const byId = new Map<number, MemberRecord>();
  const add = (records: RawMember[]) => {
    for (const member of records) {
      if (!member.public_uid || !member.id) continue;
      byId.set(member.id, {
        id: member.id,
        uid: member.public_uid,
        name: displayName(member),
        avatar: member.avatar_url || "",
        posts: member.posts_count ?? 0,
        comments: member.comments_count ?? 0,
        created: toTime(member.created_at),
        seen: toTime(member.last_seen_at),
      });
    }
  };
  let count: number;
  let page: number;
  let startedAt: number;
  if (progress) {
    for (const member of progress.members) byId.set(member.id, member);
    ({ count, page, startedAt } = progress);
    console.log(
      `Resuming the member read after page ${page} (${byId.size} members so far)`
    );
  } else {
    const first = (await getJson(pageUrl(1), token, "members page 1")) as {
      count: number;
      records: RawMember[];
    };
    add(first.records);
    count = first.count;
    page = 1;
    startedAt = Date.now();
  }
  const pages = Math.ceil(count / MEMBERS_PER_PAGE);
  console.log(`${count} active members → ${pages} Admin API requests`);
  if (pages - page + 1 > maxRequests) {
    throw new Error(
      `Needs ${pages - page + 1} requests, above --max-admin-requests=${maxRequests}. Reserve budget first.`
    );
  }
  const save = () => {
    if (!progressFile) return;
    const saved: MemberProgress = {
      startedAt,
      count,
      page,
      members: [...byId.values()],
    };
    fs.writeFileSync(progressFile, JSON.stringify(saved));
  };
  while (page < pages) {
    page++;
    const result = (await getJson(
      pageUrl(page),
      token,
      `members page ${page}`
    )) as {
      records: RawMember[];
    };
    add(result.records);
    if (page % 10 === 0) save();
    if (page % 25 === 0) console.log(`  members page ${page}/${pages}`);
    await sleep(250);
  }
  const members = [...byId.values()];
  // A short read (an API hiccup mid-way) must not replace a full snapshot.
  if (members.length < count * 0.98) {
    throw new Error(
      `Only ${members.length} of ${count} members came back. Not writing.`
    );
  }
  if (progressFile && fs.existsSync(progressFile)) fs.unlinkSync(progressFile);
  return members;
}

interface RawEvent {
  id: string;
  name: string;
  created_at: string;
  triggered_at?: string;
  payload?: {
    initiator?: {
      id?: number;
      public_uid?: string;
      is_admin?: boolean;
      is_moderator?: boolean;
    };
    posts_basic?: RawPost;
    posts_event?: RawPost;
    posts_image?: RawPost;
    space?: { id?: number };
    comment?: RawComment;
  };
}

interface RawPost {
  id?: number;
  community_member_id?: number;
  record_owner_is_admin?: boolean;
}

interface RawComment {
  id?: number;
  community_member_id?: number;
  parent_comment_id?: number | null;
  record_owner_is_admin?: boolean;
}

const KINDS: Record<string, Interaction["kind"]> = {
  "post.liked": "like",
  "post.comment.liked": "comment-like",
  "post.comment.created": "comment",
};

function compact<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) => item !== undefined && item !== null
    )
  ) as T;
}

/** Reduces a Data API event to an interaction, or null for anything else. */
function toInteraction(event: RawEvent): Interaction | null {
  const kind = KINDS[event.name];
  const payload = event.payload ?? {};
  const actor = payload.initiator;
  if (!kind || !actor?.id) return null;
  const post =
    payload.posts_basic ?? payload.posts_event ?? payload.posts_image;
  const comment = payload.comment;
  return compact({
    id: event.id,
    created: event.created_at,
    at: event.triggered_at ?? event.created_at,
    kind,
    actor: actor.id,
    actorUid: actor.public_uid,
    actorStaff:
      actor.is_admin || actor.is_moderator ? (true as const) : undefined,
    post: post?.id,
    postAuthor: post?.community_member_id,
    postAuthorStaff: post?.record_owner_is_admin ? (true as const) : undefined,
    space: payload.space?.id,
    comment: comment?.id,
    commentAuthor: comment?.community_member_id,
    commentAuthorStaff: comment?.record_owner_is_admin
      ? (true as const)
      : undefined,
    parentComment: comment?.parent_comment_id ?? undefined,
  });
}

/**
 * The same reduction for the minimized exports kept by circle-data-analytics
 * (its scripts/pull-circle-data.mjs), so a local cache can start from them.
 */
function fromMinimizedExport(event: {
  id: string;
  name: string;
  created_at: string;
  triggered_at?: string;
  actor?: {
    id?: number;
    public_uid?: string;
    is_admin?: boolean;
    is_moderator?: boolean;
  };
  space?: { id?: number };
  post?: RawPost;
  comment?: RawComment;
}): Interaction | null {
  return toInteraction({
    id: event.id,
    name: event.name,
    created_at: event.created_at,
    triggered_at: event.triggered_at,
    payload: {
      initiator: event.actor,
      posts_basic: event.post,
      space: event.space,
      comment: event.comment,
    },
  });
}

export class InteractionCache {
  private file: string;
  private cursorFile: string;
  private seen = new Set<string>();
  items: Interaction[] = [];
  cursor = "";

  constructor(dir: string) {
    fs.mkdirSync(dir, { recursive: true });
    this.file = path.join(dir, "interactions.ndjson");
    this.cursorFile = path.join(dir, "events-cursor.json");
    if (fs.existsSync(this.file)) {
      for (const line of fs.readFileSync(this.file, "utf8").split("\n")) {
        if (!line) continue;
        const item = JSON.parse(line) as Interaction;
        if (this.seen.has(item.id)) continue;
        this.seen.add(item.id);
        this.items.push(item);
      }
    }
    if (fs.existsSync(this.cursorFile)) {
      this.cursor =
        JSON.parse(fs.readFileSync(this.cursorFile, "utf8")).created ?? "";
    }
  }

  private append(items: Interaction[]) {
    const fresh = items.filter(item => !this.seen.has(item.id));
    for (const item of fresh) {
      this.seen.add(item.id);
      this.items.push(item);
    }
    if (fresh.length) {
      fs.appendFileSync(
        this.file,
        fresh.map(item => JSON.stringify(item)).join("\n") + "\n"
      );
    }
    return fresh.length;
  }

  private advance(created: string) {
    if (created > this.cursor) {
      this.cursor = created;
      fs.writeFileSync(this.cursorFile, JSON.stringify({ created }));
    }
  }

  /** Imports minimized circle-data-analytics exports (oldest first). */
  async seed(files: string[]) {
    for (const file of files) {
      const lines = readline.createInterface({
        input: fs.createReadStream(file, "utf8"),
        crlfDelay: Infinity,
      });
      const batch: Interaction[] = [];
      let last = "";
      for await (const line of lines) {
        if (!line.includes('"post.')) {
          const created = /"created_at":"([^"]+)"/.exec(line)?.[1];
          if (created && created > last) last = created;
          continue;
        }
        const item = fromMinimizedExport(JSON.parse(line));
        if (item) batch.push(item);
        if (item && item.created > last) last = item.created;
      }
      const added = this.append(batch);
      if (last) this.advance(last);
      console.log(
        `Seeded ${added} interactions from ${path.basename(file)} (through ${last})`
      );
    }
  }

  /**
   * Reads every event Circle recorded after the cursor (all of them on the
   * first run) and keeps the interactions. Each page holds 2,000 events.
   */
  async pull(token: string, maxRequests: number) {
    const first = new URL(EVENTS_PATH, DATA_ORIGIN);
    first.searchParams.set("per_page", String(EVENTS_PER_PAGE));
    first.searchParams.set("sort", "oldest");
    if (this.cursor) {
      const from = new Date(Date.parse(this.cursor) - CURSOR_OVERLAP_MS);
      first.searchParams.set("created_at_gt", from.toISOString());
    }
    type Page = {
      events?: RawEvent[];
      pagination?: { next_page_uri?: string | null };
    };
    const firstPage = (await getJson(
      first.toString(),
      token,
      "events page 1"
    )) as Page;
    let requests = 1;
    let events = 0;
    let added = 0;
    const take = (page: Page) => {
      const list = page.events ?? [];
      events += list.length;
      const items: Interaction[] = [];
      let last = "";
      for (const event of list) {
        if (event.created_at > last) last = event.created_at;
        const item = toInteraction(event);
        if (item) items.push(item);
      }
      added += this.append(items);
      return last;
    };
    let last = take(firstPage);
    const next = firstPage.pagination?.next_page_uri;
    if (next) {
      // Later pages share the first page's base_timestamp, so they can be
      // fetched in parallel by page number without shifting under us.
      const template = new URL(next, DATA_ORIGIN);
      if (template.origin !== DATA_ORIGIN)
        throw new Error("Unexpected pagination host");
      let pageNumber = Number(template.searchParams.get("page") ?? 2);
      let done = false;
      while (!done) {
        if (requests + EVENT_CONCURRENCY > maxRequests) {
          throw new Error(
            `Stopped at ${requests} Data API requests (--max-data-requests=${maxRequests}); the cache keeps what was read.`
          );
        }
        const numbers = Array.from(
          { length: EVENT_CONCURRENCY },
          (_, i) => pageNumber + i
        );
        const pages = (await Promise.all(
          numbers.map(number => {
            const url = new URL(template);
            url.searchParams.set("page", String(number));
            return getJson(url.toString(), token, `events page ${number}`);
          })
        )) as Page[];
        requests += pages.length;
        for (const page of pages) {
          if (!(page.events ?? []).length) {
            done = true;
            break;
          }
          const pageLast = take(page);
          if (pageLast > last) last = pageLast;
          if (!page.pagination?.next_page_uri) {
            done = true;
            break;
          }
        }
        // Only advance once a whole batch has been read, so an interrupted
        // run resumes without gaps.
        if (last) this.advance(last);
        pageNumber += EVENT_CONCURRENCY;
        if (requests % 100 < EVENT_CONCURRENCY) {
          console.log(
            `  events: ${requests} requests, ${events} events, through ${last}`
          );
        }
        await sleep(150);
      }
    }
    if (last) this.advance(last);
    console.log(
      `Data API: ${requests} requests, ${events} events, ${added} new interactions (through ${this.cursor})`
    );
  }
}
