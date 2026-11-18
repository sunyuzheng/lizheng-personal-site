import type { Lang } from "@/contexts/LanguageContext";
import { FLP_READ_URL } from "@shared/book-links";
import assets from "./assets.json";
import layout from "./layout.html?raw";
import css from "./gallery.css?inline";

export function installGallery(host: HTMLDivElement, lang: Lang) {
  const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  const styles = document.createElement("style");
  styles.textContent = css;
  root.innerHTML = layout;
  root.prepend(styles);
  const english = lang === "en";
  if (english) {
    const text: Record<string, string> = {
      ".home": "Yuzheng Sun / Books & publishing",
      ".language": "中文",
      ".skip": "Skip to book details",
      "#shelf": "Bookshelf",
      "#lightLabel": "Dim lights",
      "#close": "← Close book",
      "#textlink": "Text edition ↗︎",
      "#detail": "About the book　＋",
    };
    for (const [selector, label] of Object.entries(text)) {
      root.querySelector(selector)!.textContent = label;
    }
    root.querySelector(".home")!.setAttribute("href", "/en");
    const language = root.querySelector<HTMLAnchorElement>(".language")!;
    language.href = "/books";
    language.hreflang = "zh";
    root.querySelector(".index")!.setAttribute("aria-label", "Choose a book");
    root
      .querySelector("canvas")!
      .setAttribute(
        "aria-label",
        "Three-dimensional book. Drag or use the controls to turn the page."
      );
    root.querySelector("#prev")!.setAttribute("aria-label", "Previous page");
    root.querySelector("#next")!.setAttribute("aria-label", "Next page");
  }
  // Paint the printed cover while the independent 3D chunk is loading.
  const mobile = window.matchMedia("(max-width: 680px)").matches;
  root.querySelector<HTMLElement>(".backdrop")!.style.backgroundImage =
    `url("${mobile ? assets["office-m"] : assets["office-w"]}")`;
  root.querySelector("#credit")!.textContent = english
    ? "Yuzheng Sun · Superlinear Press"
    : "孙煜征 著 · Superlinear Press";
  const action = root.querySelector<HTMLButtonElement>("#open")!;
  action.textContent = english ? "Open the prologue　＋" : "翻开序言　＋";
  action.onclick = () => {
    window.location.href = FLP_READ_URL;
  };
  const detail = root.querySelector<HTMLButtonElement>("#detail")!;
  detail.onclick = () => document.getElementById("flp")?.scrollIntoView();

  let active = true;
  let unmount: (() => void) | undefined;
  import("./gallery.js")
    .then(({ mountGallery }) => {
      if (active) unmount = mountGallery(root, lang);
    })
    .catch(() => {
      // The book catalogue and native reading links also work without WebGL.
      if (active) host.dataset.mode = "static";
    });
  return () => {
    active = false;
    unmount?.();
    root.replaceChildren();
  };
}
