export type AskAccount = {
  enabled: boolean; authenticated?: boolean; founding?: boolean;
  remaining?: number | null; reset_at?: string; login_ready?: boolean; unavailable?: boolean;
};
export async function readAskAccount(): Promise<AskAccount | null> {
  try {
    const response = await fetch("/api/ask-lizheng/auth/session", { credentials: "same-origin", cache: "no-store" });
    if (!response.headers.get("content-type")?.includes("application/json")) return null;
    const value = await response.json();
    if (!response.ok) return { enabled: true, unavailable: true };
    if (typeof value.enabled !== "boolean") return null;
    return value;
  } catch { return null; }
}
const DRAFT = "ask-login-draft-v1";
export function takeAskDraft(): { question: string; context: string; intent: string } | null {
  try {
    const raw = sessionStorage.getItem(DRAFT); sessionStorage.removeItem(DRAFT);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (typeof value.question !== "string" || typeof value.context !== "string" ||
        !["understand", "apply", "find"].includes(value.intent) ||
        !Number.isFinite(value.saved) || Date.now() - value.saved > 600_000) return null;
    return { question: value.question.slice(0, 2000), context: value.context.slice(0, 2500), intent: value.intent };
  } catch { return null; }
}
export function finishAskLogin() {
  const url = new URL(location.href);
  if (url.searchParams.get("ask_login") !== "done") return;
  url.searchParams.delete("ask_login"); history.replaceState(null, "", url);
  if (window.opener) window.opener.postMessage({ type: "ask-login-complete" }, location.origin);
  window.close();
}
export function beginAskLogin(draft: { question: string; context: string; intent: string }, done: () => void) {
  const base = `/api/ask-lizheng/auth/login?return=${encodeURIComponent(location.pathname)}`;
  const popup = window.open(`${base}&popup=1`, "ask-academy-login", "width=520,height=720");
  if (!popup) {
    try { sessionStorage.setItem(DRAFT, JSON.stringify({ ...draft, saved: Date.now() })); } catch {}
    location.assign(base); return () => {};
  }
  let finished = false;
  const cleanup = () => { clearInterval(timer); clearTimeout(expiry); window.removeEventListener("message", message); };
  const complete = () => { if (finished) return; finished = true; cleanup(); done(); };
  const message = (event: MessageEvent) => {
    if (event.origin === location.origin && event.source === popup && event.data?.type === "ask-login-complete") complete();
  };
  window.addEventListener("message", message);
  const timer = setInterval(() => { if (popup.closed) complete(); }, 500);
  const expiry = setTimeout(cleanup, 660_000);
  return cleanup;
}
export async function logoutAsk() {
  await fetch("/api/ask-lizheng/auth/logout", { method: "POST", credentials: "same-origin", cache: "no-store" });
}
