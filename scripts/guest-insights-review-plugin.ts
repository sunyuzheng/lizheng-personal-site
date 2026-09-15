import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/** Opt-in local review endpoints. This plugin never runs during a production build. */
export function guestInsightsReviewPlugin(): Plugin {
  return {
    name: "local-guest-insights-review",
    apply: "serve",
    configureServer(server) {
      const reviewDir = process.env.GUEST_INSIGHTS_REVIEW_DIR;
      if (!reviewDir) return;
      // Isolated review worktrees may reuse the already installed dependencies.
      const dependencies = path.resolve(server.config.root, "../node_modules");
      if (fs.existsSync(dependencies))
        server.config.server.fs.allow.push(fs.realpathSync(dependencies));
      const routes = new Map([
        [
          "/__review/guest-insights.json",
          ["website/pending-insights.json", "application/json"],
        ],
        [
          "/__review/insights/nan-zhou.md",
          ["articles/nan-zhou-venture-bet.md", "text/plain; charset=utf-8"],
        ],
        [
          "/__review/insights/jinjing-liang.md",
          ["articles/jinjing-liang-orca.md", "text/plain; charset=utf-8"],
        ],
      ]);
      server.middlewares.use((req, res, next) => {
        const route = routes.get((req.url || "").split("?")[0]);
        if (!route) return next();
        const file = path.join(reviewDir, route[0]);
        res.setHeader("X-Robots-Tag", "noindex, nofollow");
        res.setHeader("Cache-Control", "no-store");
        if (!fs.existsSync(file)) {
          res.statusCode = 404;
          res.end("Review file not available.");
          return;
        }
        res.setHeader("Content-Type", route[1]);
        res.end(fs.readFileSync(file));
      });
    },
  };
}
