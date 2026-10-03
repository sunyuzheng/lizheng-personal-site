/**
 * Anonymous usage of the Ask pages, counted on lizheng.ai for the owner's Ops dashboard: how long
 * a page is read (time in front with some input in the last 30 seconds), how far it is scrolled,
 * and which parts are used, each sent once per page view. No text and no account; the server
 * counts the anonymous browser cookie the daily limit already uses. ask.lizheng.ai has the same
 * module (src/usage.js); the server's list of marks is in shared/ask-usage.ts.
 */
export type UsageMark = "h_seen" | "d_shown" | "d_seen" | "d_open" | "d_similar" | "d_more" | "ask" | "answer" | "source" | "export"
  | "c_works" | "c_city" | "c_talks" | "c_calls" | "c_writing" | "c_join";
type Usage = { mark(name: UsageMark): void; watch(element: Element | null, name: UsageMark): void; stop(): void };
const ENDPOINT = "/api/ask-lizheng/usage";
const IDLE_MS = 30_000;
const TIME: [number, string][] = [[10_000, "t10"], [30_000, "t30"], [60_000, "t60"], [180_000, "t180"], [600_000, "t600"]];
const DEPTH: [number, string][] = [[0.25, "s25"], [0.5, "s50"], [0.75, "s75"], [0.98, "s100"]];
const INPUT = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"];
// Sections watched before the count starts are watched once it does.
const pending: [Element | null, UsageMark][] = [];
const NONE: Usage = { mark() {}, watch(element, name) { pending.push([element, name]); }, stop() {} };
let current = NONE;

/** Notes that this page view did `name` (sent once). */
export const markUsage = (name: UsageMark) => current.mark(name);
/** Marks `name` once the element's top reaches the upper 70% of the screen. */
export const watchUsage = (element: Element | null, name: UsageMark) => current.watch(element, name);

/** Starts counting this page view; returns the stop, which sends what is left. */
export function startUsage(surface: "ask" | "home" | "app"): () => void {
  current.stop();
  if (typeof window === "undefined" || /HeadlessChrome|bot|crawl|spider/i.test(navigator.userAgent)) { pending.length = 0; return () => {}; }
  current = tracker(surface);
  const mine = current;
  for (const [element, name] of pending.splice(0)) mine.watch(element, name);
  return () => { mine.stop(); if (current === mine) current = NONE; };
}

function tracker(surface: "ask" | "home" | "app"): Usage {
  const marks = new Set<string>(), sent = new Set<string>();
  let engaged = 0, reported = 0, last = performance.now(), input = last, started = false, stopped = false;
  const active = () => { input = performance.now(); };
  const tick = () => {
    const now = performance.now();
    if (document.visibilityState === "visible" && now - input < IDLE_MS) engaged += Math.min(now - last, 5_000);
    last = now;
    for (const [ms, name] of TIME) if (engaged >= ms) marks.add(name);
  };
  const measure = () => {
    const page = document.documentElement;
    const depth = Math.min(1, (window.scrollY + window.innerHeight) / Math.max(1, page.scrollHeight));
    for (const [share, name] of DEPTH) if (depth >= share) marks.add(name);
  };
  let frame = 0;
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; measure(); }); };
  // Only what changed since the last send: new marks, reading time added.
  const body = (view: boolean) => {
    tick();
    const fresh = [...marks].filter(name => !sent.has(name));
    const added = Math.min(Math.round(engaged - reported), 2 * 3_600_000);
    if (!view && !fresh.length && added < 1_000) return null;
    fresh.forEach(name => sent.add(name));
    reported += added;
    return JSON.stringify({ v: 1, surface, view: view ? 1 : 0, engaged_ms: added, marks: fresh });
  };
  // The first send is an ordinary request, so the cookies it may set are kept; the rest go as
  // beacons whenever the page is hidden, which also covers closing it.
  const begin = () => {
    if (started || stopped) return;
    started = true;
    measure();
    const data = body(true);
    if (data) void fetch(ENDPOINT, { method: "POST", body: data, keepalive: true, credentials: "same-origin", headers: { "Content-Type": "text/plain" } }).catch(() => {});
  };
  const flush = () => {
    if (!started) return;
    const data = body(false);
    if (data && !navigator.sendBeacon?.(ENDPOINT, new Blob([data], { type: "text/plain" })))
      void fetch(ENDPOINT, { method: "POST", body: data, keepalive: true, credentials: "same-origin", headers: { "Content-Type": "text/plain" } }).catch(() => {});
  };
  const onHide = () => { if (document.visibilityState === "hidden") flush(); };
  for (const type of INPUT) window.addEventListener(type, active, { passive: true, capture: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", flush);
  const timer = window.setInterval(tick, 1_000);
  const opening = window.setTimeout(begin, document.readyState === "complete" ? 300 : 1_500);
  const observers: IntersectionObserver[] = [];
  return {
    mark: name => { marks.add(name); },
    watch(element, name) {
      if (!element || typeof IntersectionObserver === "undefined") return;
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { marks.add(name); observer.disconnect(); }
      }, { rootMargin: "0px 0px -30% 0px" });
      observer.observe(element);
      observers.push(observer);
    },
    stop() {
      if (stopped) return;
      flush();
      stopped = true;
      window.clearInterval(timer);
      window.clearTimeout(opening);
      observers.forEach(observer => observer.disconnect());
      for (const type of INPUT) window.removeEventListener(type, active, { capture: true });
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    },
  };
}
