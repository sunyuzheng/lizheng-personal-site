import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root")!;
const isChineseContentPath =
  window.location.pathname === "/zbs" ||
  window.location.pathname === "/guests" ||
  window.location.pathname.startsWith("/guests/");
const defaultLang =
  window.location.pathname === "/zh" ||
  window.location.pathname.startsWith("/zh/") ||
  isChineseContentPath ||
  new URLSearchParams(window.location.search).get("lang") === "zh"
    ? "zh"
    : "en";
const app = <App defaultLang={defaultLang} />;

if (root.dataset.ssr === "true") {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
