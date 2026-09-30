import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource-variable/geist/wght.css";
import "@fontsource-variable/geist-mono/wght.css";
import App from "./App";
import "./index.css";

// Serif fonts load after first paint; see fonts.css.
void import("./fonts.css");

const root = document.getElementById("root")!;
const app = <App />;

if (root.dataset.ssr === "true") {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
