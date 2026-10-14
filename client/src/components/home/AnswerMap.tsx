import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/contexts/LanguageContext";
import type { AskAnswerState } from "@/lib/ask-lizheng";
import { AnswerMap, loadAnswerMap, sourceItem, type AnswerMapData, type AnswerMapState, type MapSource } from "@shared/ask-answer-map.js";

// The answer map in the homepage's Ask section, as on ask.lizheng.ai (ask-lizheng's
// src/answer-map-panel.jsx, whose drawing code shared/ask-answer-map.js copies): every public
// material a light, farther out newer, the direction its topic. While the answer is found, the
// candidates light and thread to the question; afterwards the cited sources carry the numbers the
// text uses, and a number opens its source as a citation does.
const COPY = {
  zh: {
    found: (n: number) => `${n}份候选材料`,
    lead: (n: number) => `图上标号的是回答引用的${n}份材料，点编号看原文。`,
    card: "判断卡：",
    legend: ["视频与对谈", "文字", "课程与书", "判断卡"],
    axes: "越往外越新，方向是主题",
  },
  en: {
    found: (n: number) => `${n} candidate sources`,
    lead: (n: number) => `The numbered lights are the ${n} sources the answer cites; click a number to open one.`,
    card: "Judgment card: ",
    legend: ["Videos and talks", "Writing", "Courses and book", "Judgment card"],
    axes: "Newer farther out; the direction is the topic",
  },
};

type MapTurn = AskAnswerState & { id: number };

/** What the stream has shown so far, in the map's terms. The final answer numbers its sources
 * 1 to n afresh, so a cited source finds its light by its own public copy, never by number. */
function mapState(map: AnswerMapData, turn: MapTurn, live: boolean, selected: string | null): AnswerMapState {
  const result = turn.result;
  const shown: MapSource[] = result ? result.sources || [] : [...turn.sources, ...(turn.partial?.sources || [])];
  const sources = new Map(shown.map(source => [source.id, source]));
  const candidates = turn.mapCandidates?.length
    ? turn.mapCandidates.map(row => ({ id: row.id, item: sourceItem(map, null, row.key) }))
    : turn.sources.map(source => ({ id: source.id, item: sourceItem(map, source) }));
  const cited = (result ? result.sources || [] : turn.partial?.sources || []).map(source => ({
    id: source.id,
    item: result ? sourceItem(map, source) : candidates.find(row => row.id === source.id)?.item ?? sourceItem(map, source),
  }));
  const cards = (turn.approach?.cards || []).filter(card => map.cardIndex.has(card.id));
  return { live: live && !result, done: !!result, stage: result ? "done" : turn.progress?.stage || "retrieving", candidates, cards, cited, sources, selected };
}

export default function AnswerMapPanel({ turn, live = false, lang, selected = null, onSelect }: {
  turn: MapTurn; live?: boolean; lang: Lang; selected?: string | null; onSelect: (id: string) => void;
}) {
  const t = COPY[lang];
  const canvas = useRef<HTMLCanvasElement>(null);
  const view = useRef<AnswerMap | null>(null);
  const select = useRef(onSelect);
  select.current = onSelect;
  const [map, setMap] = useState<AnswerMapData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    loadAnswerMap("/api/ask-lizheng/answer-map").then(data => { if (alive) setMap(data); }, () => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!map || !canvas.current) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    view.current = new AnswerMap(canvas.current, map, { onSelect: id => select.current(id), reduce });
    return () => { view.current?.destroy(); view.current = null; };
  }, [map]);

  const state = useMemo(() => (map ? mapState(map, turn, live, selected) : null),
    [map, turn.sources, turn.mapCandidates, turn.approach, turn.partial, turn.result, turn.progress?.stage, live, selected]);
  useEffect(() => { if (state) view.current?.update(state); }, [state]);

  if (failed) return null;
  const found = state?.candidates.filter(row => row.item >= 0).length || 0;
  const cards = state?.cards || [];
  const numbered = turn.result?.sources?.length || 0;
  return (
    <figure className={`lz-map ${live ? "is-live" : "is-done"}`}>
      <div className="lz-map-stage">
        <canvas ref={canvas} aria-hidden="true" />
      </div>
      <figcaption>
        {!live && numbered > 0 && <p className="lz-map-lead">{t.lead(numbered)}</p>}
        {((live && found > 0) || cards.length > 0) && (
          <p className="lz-map-counts">
            {live && found > 0 && <span>{t.found(found)}</span>}
            {cards.map(card => <span key={card.id} className="lz-map-card"><i aria-hidden="true" />{t.card}{card.title}</span>)}
          </p>
        )}
        <p className="lz-map-legend">
          {t.legend.map((label, index) => <span key={label}><i className={["v", "t", "c", "k"][index]} aria-hidden="true" />{label}</span>)}
          <span className="lz-map-axes">{t.axes}</span>
        </p>
      </figcaption>
    </figure>
  );
}
