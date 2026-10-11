/**
 * Where the community data lives, shared by city.lizheng.ai and the
 * homepage window onto it. Published by the monthly workflow
 * (docs/community-graph.md); the dev server reads the local file written by
 * `pnpm community:graph`.
 */
import { decode, isGraphFile, type Community } from "./data";

const GRAPH_URL =
  "https://kwicxc1px65aokwa.public.blob.vercel-storage.com/community/graph.json";
// Vite sets import.meta.env; the homepage prerender runs under tsx, where it is absent.
const DEV = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);
export const DATA_URL = DEV ? "/community/graph.json" : GRAPH_URL;

export const PAGE_URL = {
  zh: "https://city.lizheng.ai/",
  en: "https://city.lizheng.ai/en",
};

/** The address of the full page, focused on one member when given. */
export function pageUrl(lang: "zh" | "en", uid?: string) {
  return uid ? `${PAGE_URL[lang]}#${uid}` : PAGE_URL[lang];
}

export async function loadCommunity(): Promise<Community | null> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) return null;
    const json = await response.json();
    return isGraphFile(json) ? decode(json) : null;
  } catch {
    return null;
  }
}
