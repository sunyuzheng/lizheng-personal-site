import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Vercel runs api/*.ts on Node as ES modules, unbundled: every relative import they reach,
// directly or through shared/, must name its file with .js, or the function fails to load in
// production (500) while tests and the local build, which resolve bare paths, still pass. Edge
// functions are bundled, so they are exempt.
const ROOT = path.resolve(__dirname, "..");
const RELATIVE = /(?:import|export)\s[^;]*?from\s+["'](\.{1,2}\/[^"']+)["']|import\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g;
function bareImports(file: string, seen = new Set<string>()): string[] {
  if (seen.has(file)) return [];
  seen.add(file);
  const problems: string[] = [];
  for (const match of readFileSync(file, "utf8").matchAll(RELATIVE)) {
    const spec = match[1] ?? match[2];
    if (!spec.endsWith(".js")) { problems.push(`${path.relative(ROOT, file)} → ${spec}`); continue; }
    problems.push(...bareImports(path.resolve(path.dirname(file), spec.replace(/\.js$/, ".ts")), seen));
  }
  return problems;
}

describe("api functions", () => {
  const node = readdirSync(path.join(ROOT, "api")).filter(name => name.endsWith(".ts") &&
    !/runtime:\s*["']edge["']/.test(readFileSync(path.join(ROOT, "api", name), "utf8")));
  it.each(node)("%s imports only files Node can load", name => {
    expect(bareImports(path.join(ROOT, "api", name))).toEqual([]);
  });
});
