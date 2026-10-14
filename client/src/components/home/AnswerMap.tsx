import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/contexts/LanguageContext";
import type { AskAnswerState } from "@/lib/ask-lizheng";
import { AnswerMap, loadAnswerMap, membersOnly, sourceItem, type AnswerMapData, type AnswerMapState, type MapSource } from "@shared/ask-answer-map.js";

// The answer map in the homepage's Ask section, as on ask.lizheng.ai (ask-lizheng's
// src/answer-map-panel.jsx, whose drawing code shared/ask-answer-map.js copies): every public
// material a thin stroke on a timeline, a row a topic, 2020 at the left and today at the right,
// where the question is. While the answer is found, the candidates light and thread to the
// question; afterwards the cited sources carry the numbers the text uses, and a number opens the
// video or post it cites (and its source card below). Members' content is gold.
const COPY = {
  zh: {
    found: (n: number) => `${n}份候选材料`,
    reach: (lo: number, hi: number) => (lo === hi ? `，都在${lo}年` : `，从${lo}年到${hi}年`),
    lead: (n: number, reach: string) => `亮着的${n}份是这条回答引用的${reach}。点编号打开原视频或原帖。`,
    members: "金色的是会员内容，打开需要会员。",
    card: "判断卡：",
    legend: "每一道细线是一份材料：按主题分行，越往右越新。",
    words: (own: boolean) => ({ question: own ? "你的问题" : "这个问题", card: "判断卡", member: "会员" }),
  },
  en: {
    found: (n: number) => `${n} candidate sources`,
    reach: (lo: number, hi: number) => (lo === hi ? `, all from ${lo}` : `, from ${lo} to ${hi}`),
    lead: (n: number, reach: string) => `The ${n} lit strokes are the sources this answer cites${reach}; click a number to open the video or post.`,
    members: "Gold ones are members' content; opening them needs a membership.",
    card: "Judgment card: ",
    legend: "Each thin stroke is one source: a row per topic, newer to the right.",
    words: (own: boolean) => ({ question: own ? "Your question" : "This question", card: "Judgment card", member: "Members" }),
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

/** `own`: the reader's own question (an opened public question is someone else's). */
export default function AnswerMapPanel({ turn, live = false, lang, selected = null, own = true, onSelect, onOpen }: {
  turn: MapTurn; live?: boolean; lang: Lang; selected?: string | null; own?: boolean; onSelect: (id: string) => void; onOpen?: (source: MapSource) => void;
}) {
  const t = COPY[lang];
  const canvas = useRef<HTMLCanvasElement>(null);
  const view = useRef<AnswerMap | null>(null);
  const select = useRef(onSelect);
  select.current = onSelect;
  const opened = useRef(onOpen);
  opened.current = onOpen;
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
    view.current = new AnswerMap(canvas.current, map, { onSelect: id => select.current(id), onOpen: source => opened.current?.(source), reduce, words: t.words(own) });
    return () => { view.current?.destroy(); view.current = null; };
  }, [map]);

  const state = useMemo(() => (map ? mapState(map, turn, live, selected) : null),
    [map, turn.sources, turn.mapCandidates, turn.approach, turn.partial, turn.result, turn.progress?.stage, live, selected]);
  useEffect(() => { if (state) view.current?.update(state); }, [state]);

  if (failed) return null;
  const found = state?.candidates.filter(row => row.item >= 0).length || 0;
  const cards = state?.cards || [];
  const numbered = turn.result?.sources?.length || 0;
  const members = (turn.result?.sources || []).some(membersOnly);
  // How far back the answer reaches: the years of the sources it cites.
  const years = (turn.result?.sources || []).map(source => Number(source.date?.slice(0, 4))).filter(Boolean);
  const reach = years.length ? t.reach(Math.min(...years), Math.max(...years)) : "";
  return (
    <figure className={`lz-map ${live ? "is-live" : "is-done"}`}>
      <div className="lz-map-stage">
        <canvas ref={canvas} aria-hidden="true" />
      </div>
      <figcaption>
        {!live && numbered > 0 && <p className="lz-map-lead">{t.lead(numbered, reach)}{members && <span className="lz-map-member"> {t.members}</span>}</p>}
        {((live && found > 0) || cards.length > 0) && (
          <p className="lz-map-counts">
            {live && found > 0 && <span>{t.found(found)}</span>}
            {cards.map(card => <span key={card.id} className="lz-map-card"><i aria-hidden="true" />{t.card}{card.title}</span>)}
          </p>
        )}
        <p className="lz-map-legend">{t.legend}</p>
      </figcaption>
    </figure>
  );
}
