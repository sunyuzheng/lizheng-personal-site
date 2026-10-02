import { SEAL } from "../shared/ask-seal.js";
export const config = { runtime: "edge" };

// ask.lizheng.ai's page comes from the Builder service, which sleeps after five
// idle minutes and takes several seconds, sometimes half a minute, to wake. A
// sleeping service used to mean a blank tab. Pass the page through when Builder
// answers quickly; otherwise say it is waking, keep knocking, and reload.
const ORIGIN = "https://ask-lizheng.ai-builders.space";
export const WAKE_WAIT_MS = 1_500;
const HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};
// Counts the wait, asks /api/meta (which also wakes Builder) until it answers,
// then reloads. Reloads at most once per 10 seconds so a page that stays slow
// cannot loop; after 45 seconds it offers a manual refresh.
export const WAKING_SCRIPT = '(function(){var start=Date.now(),done=false,K="ask-waking-reload";var waited=document.getElementById("waited"),late=document.getElementById("late");setInterval(function(){var s=Math.floor((Date.now()-start)/1000);waited.textContent=s;if(s>=45)late.hidden=false},1000);function last(){try{return+sessionStorage.getItem(K)||0}catch(e){return 0}}function open(){if(Date.now()-last()<10000){late.hidden=false;return}try{sessionStorage.setItem(K,String(Date.now()))}catch(e){}location.reload()}function knock(){if(done)return;var c=new AbortController(),t=setTimeout(function(){c.abort()},20000);fetch("/api/meta",{cache:"no-store",signal:c.signal}).then(function(r){clearTimeout(t);if(r.ok){done=true;open()}else setTimeout(knock,2000)},function(){clearTimeout(t);setTimeout(knock,2000)})}knock()})();';
const STYLE = '*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#f8f5ee;color:#121613;font:16px/1.75 "PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}main{width:100%;max-width:420px;text-align:center}.seal{width:64px;height:auto;fill:#238343}h1{margin:18px 0 0;font:900 28px/1.3 "Noto Serif SC","Songti SC","STSong",serif;letter-spacing:.04em}.status{display:inline-flex;align-items:center;gap:10px;margin:22px 0 0;font-size:17px;font-weight:600;color:#1c6b37}.status::before{content:"";width:9px;height:9px;border-radius:50%;background:#238343;animation:pulse 1.2s ease-in-out infinite}p{margin:10px 0 0;color:#343a35}.note{font-size:14px;color:#6c7069}.late a{color:#1c6b37;font-weight:600}@keyframes pulse{50%{opacity:.25}}@media (prefers-reduced-motion:reduce){.status::before{animation:none}}';
const WAKING_HTML = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>问问立正 · 正在唤醒</title><style>${STYLE}</style></head><body><main>${SEAL.replace("<svg ", '<svg class="seal" ')}<h1>问问立正</h1><p class="status" role="status">问答服务刚才在休眠，正在唤醒…</p><p>闲置几分钟后它会休眠，唤醒通常要十几秒。醒来后这一页会自动打开。</p><p class="note">已等待<span id="waited">0</span>秒</p><p class="note late" id="late" hidden>比平时久，可以<a href="">刷新再试</a>。</p></main><script>${WAKING_SCRIPT}</script></body></html>`;
let policy: Promise<string> | undefined;
function wakingPolicy() {
  policy ??= crypto.subtle.digest("SHA-256", new TextEncoder().encode(WAKING_SCRIPT)).then(digest => {
    const hash = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return `default-src 'none'; style-src 'unsafe-inline'; script-src 'sha256-${hash}'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
  });
  return policy;
}

export default async function handler(request: Request): Promise<Response> {
  if (new URL(request.url).hostname !== "ask.lizheng.ai") return new Response("Not found", { status: 404 });
  if (request.method !== "GET" && request.method !== "HEAD")
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  const page = fetch(`${ORIGIN}/`, { headers: { Accept: "text/html" }, redirect: "manual", cache: "no-store" })
    .catch(() => null);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const slow = new Promise<"slow">(resolve => { timer = setTimeout(() => resolve("slow"), WAKE_WAIT_MS); });
  const first = await Promise.race([page, slow]);
  clearTimeout(timer);
  const head = request.method === "HEAD";
  if (first && first !== "slow" && first.status === 200 && first.headers.get("content-type")?.startsWith("text/html")) {
    if (head) await first.body?.cancel();
    return new Response(head ? null : first.body, { status: 200, headers: HEADERS });
  }
  if (first && first !== "slow") await first.body?.cancel().catch(() => {});
  return new Response(head ? null : WAKING_HTML, {
    status: 503,
    headers: { ...HEADERS, "Retry-After": "5", "Content-Security-Policy": await wakingPolicy() },
  });
}
