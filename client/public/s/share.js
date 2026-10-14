// The shared answer pages at ask.lizheng.ai/s/… (shared/ask-share-page.ts): the page's address to
// copy, send or show as a QR code, and the answer map after the summary, drawn by ask-lizheng's
// answer-map.js (copied beside this file by scripts/sync-ask-app.mjs) from the layout ask.lizheng.ai
// serves at /api/answer-map. A numbered light opens its source below, as a citation does. Clicks
// are counted in Vercel Analytics (event "Ask Page Share", what was done), never the page's words.
import { AnswerMap, loadAnswerMap, sourceItem } from "./answer-map.js";

const url = document.querySelector("[data-share-url]")?.getAttribute("data-share-url") || location.href;
const dialog = document.getElementById("qr");
const track = action => window.va?.("event", { name: "Ask Page Share", data: { action } });
const IN_WECHAT = /MicroMessenger/i.test(navigator.userAgent);

// Where the phone can share, the button that does; inside WeChat, where its own menu does, the way to it.
for (const row of document.querySelectorAll(".share-row")) {
  const send = row.querySelector('[data-share="send"]');
  if (send && typeof navigator.share === "function" && !IN_WECHAT) send.hidden = false;
  if (IN_WECHAT) row.insertAdjacentHTML("beforeend", '<span class="share-wechat">点右上角「···」就能发给朋友</span>');
}

async function copy(button) {
  let done = false;
  try {
    await navigator.clipboard.writeText(url);
    done = true;
  } catch { /* Shown below: the address to select by hand. */ }
  const label = button.dataset.label || button.textContent;
  button.dataset.label = label;
  button.textContent = done ? "已复制" : "长按地址复制";
  setTimeout(() => { button.textContent = label; }, 2000);
  track(done ? "copy" : "copy_failed");
}

document.addEventListener("click", event => {
  const button = event.target instanceof Element ? event.target.closest("[data-share]") : null;
  if (!button) return;
  const action = button.getAttribute("data-share");
  if (action === "copy") void copy(button);
  else if (action === "qr" && dialog) {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    track("qr");
  } else if (action === "close" && dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  } else if (action === "send") {
    track("send");
    navigator.share?.({ title: document.querySelector("h1")?.textContent || "问问立正", url }).catch(() => {});
  }
});
// A click outside the QR code, on the shade, closes it.
dialog?.addEventListener("click", event => { if (event.target === dialog) dialog.close?.(); });

const figure = document.querySelector("[data-map]");
const data = document.getElementById("answer-sources");
if (figure && data) {
  loadAnswerMap("/api/answer-map").then(map => {
    const sources = JSON.parse(data.textContent || "[]");
    const cited = sources.map(source => ({ id: source.id, item: sourceItem(map, source) }));
    if (!cited.some(row => row.item >= 0)) return;
    figure.hidden = false;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const view = new AnswerMap(figure.querySelector("canvas"), map, {
      reduce,
      onSelect: id => { location.hash = `source-${id.slice(1)}`; track("map_source"); },
    });
    view.update({ live: false, done: true, stage: "done", candidates: cited, cards: [], cited,
      sources: new Map(sources.map(source => [source.id, source])), selected: null });
  }, () => { /* Without the layout the page is the same, without the map. */ });
}
