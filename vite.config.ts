import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { Plugin as PostcssPlugin } from "postcss";
import { defineConfig } from "vite";
import { guestInsightsReviewPlugin } from "./scripts/guest-insights-review-plugin";

// @fontsource lists a .woff fallback after every .woff2 source. Every browser
// the site supports reads woff2, so dropping the fallback keeps the Noto Serif
// SC stylesheet (hundreds of unicode-range slices) smaller and stops the
// unused .woff files from being emitted.
const dropWoffFallbacks: PostcssPlugin = {
  postcssPlugin: "drop-woff-fallbacks",
  // `Once` runs before Vite rewrites url() references, so the dropped files
  // are never emitted.
  Once(root) {
    root.walkAtRules("font-face", rule => {
      rule.walkDecls("src", decl => {
        decl.value = decl.value.replace(
          /,\s*url\([^)]*\.woff\)\s*format\(["']woff["']\)/g,
          ""
        );
      });
    });
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), guestInsightsReviewPlugin()],
  css: {
    postcss: {
      plugins: [dropWoffFallbacks],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
