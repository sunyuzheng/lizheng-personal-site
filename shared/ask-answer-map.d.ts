// Types for shared/ask-answer-map.js, copied from ask-lizheng src/answer-map.js (scripts/sync-ask-app.mjs).
export type AnswerMapData = {
  v: number; release: string; years: [number, number]; radius: [number, number, number];
  topics: { k: string; l: string; a: [number, number]; n: number }[];
  kinds: string; t: number[]; r: number[]; g: number[]; keys: string[];
  cards: { id: string; title: string; t: number; src: number[] }[];
  byKey: Map<string, number>; byVideo: Map<string, number>; cardIndex: Map<string, number>;
};
export type MapSource = { id: string; url?: string; title?: string; date?: string; public_copy_url?: string };
export type AnswerMapState = {
  live: boolean; done: boolean; stage: string;
  candidates: { id: string; item: number }[];
  cards: { id: string; title: string; source_ids: string[] }[];
  cited: { id: string; item: number }[];
  sources: Map<string, MapSource>;
  selected: string | null;
};
export function loadAnswerMap(url?: string): Promise<AnswerMapData>;
export function sourceItem(map: AnswerMapData, source: MapSource | null | undefined, key?: string): number;
export class AnswerMap {
  constructor(canvas: HTMLCanvasElement, map: AnswerMapData, options?: { onSelect?: (id: string) => void; reduce?: boolean; ambient?: boolean });
  update(state: AnswerMapState): void;
  destroy(): void;
}
