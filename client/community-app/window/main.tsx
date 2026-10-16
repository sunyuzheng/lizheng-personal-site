/**
 * city.lizheng.ai/window: the homepage's window onto the city, alone, for
 * other pages to embed (the deck 差的不是人，是市场 and its web version open
 * it in place of their picture of the city). The same component as on the
 * homepage, filling the frame, without the caption and buttons around it
 * there; its links open in a new tab. `?lang=en` for English.
 *
 * Embedded, it tells the page around it when the city is drawn. With `?keys`
 * (a deck asks for it) it also passes on the keys a deck turns its pages
 * with, so a presenter's clicker still works after someone has clicked into
 * the map. See docs/community-graph.md.
 */
import "@fontsource-variable/geist/wght.css";
import "@/index.css";
import CityWindow from "@/components/home/CityWindow";
import { HOME_COPY } from "@/components/home/content";
import { createRoot } from "react-dom/client";
import "./window.css";

const params = new URLSearchParams(location.search);
const lang = params.get("lang") === "en" ? "en" : "zh";
document.documentElement.lang = lang === "en" ? "en" : "zh-CN";

const embedded = window.parent !== window;
function tell(type: string, extra: Record<string, unknown> = {}) {
  if (embedded)
    window.parent.postMessage({ source: "lizheng-city", type, ...extra }, "*");
}

// The keys a deck turns its pages with; left alone while typing a name or on a link or button.
const PAGING = new Set([
  "ArrowRight",
  "ArrowLeft",
  "ArrowDown",
  "ArrowUp",
  "PageDown",
  "PageUp",
  " ",
  "Home",
  "End",
]);
if (embedded && params.has("keys")) {
  document.addEventListener("keydown", event => {
    if (
      !PAGING.has(event.key) ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.defaultPrevented
    )
      return;
    if (
      (event.target as Element | null)?.closest?.(
        "input, textarea, select, button, a, [contenteditable]"
      )
    )
      return;
    event.preventDefault();
    tell("key", { key: event.key });
  });
}

const copy = HOME_COPY[lang].city;
createRoot(document.getElementById("root")!).render(
  <main
    className={lang === "en" ? "lz-home l-en city-embed" : "lz-home city-embed"}
  >
    <CityWindow
      lang={lang}
      copy={copy.field}
      view={copy.window}
      embed
      onReady={() => tell("ready")}
    />
  </main>
);
