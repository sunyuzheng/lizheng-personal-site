import { applyPageSeo } from "@/lib/seo";
import { AIE_SHANGHAI_DECK_PAGE_META } from "@shared/page-meta";
import { buildAieShanghaiDeckStructuredData } from "@shared/structured-data";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  Grid2X2,
  Minimize2,
  Printer,
  X,
} from "lucide-react";
import {
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  NativeSlide,
  SLIDE_META,
  SlideViewport,
} from "./AieShanghaiDeckSlides";

function slideFromHash() {
  if (typeof window === "undefined") return 0;
  const match = window.location.hash.match(/^#slide-(\d+)$/);
  if (!match) return 0;
  return Math.min(
    Math.max(Number(match[1]) - 1, 0),
    SLIDE_META.length - 1
  );
}

export default function AieShanghaiDeck() {
  const rootRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goTo = useCallback((index: number) => {
    const next = Math.min(Math.max(index, 0), SLIDE_META.length - 1);
    setCurrent(next);
    if (typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}#slide-${next + 1}`
      );
    }
  }, []);

  const previous = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await rootRef.current?.requestFullscreen();
  }, []);

  useEffect(() => {
    setCurrent(slideFromHash());
    const onHashChange = () => setCurrent(slideFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    return applyPageSeo({
      ...AIE_SHANGHAI_DECK_PAGE_META,
      locale: "zh_CN",
      type: "article",
      imageAlt: "AIE Shanghai 2026合作会谈deck封面",
      jsonLd: buildAieShanghaiDeckStructuredData(),
    });
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        previous();
      } else if (
        event.key === "ArrowRight" ||
        event.key === "PageDown" ||
        event.key === " "
      ) {
        event.preventDefault();
        next();
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(SLIDE_META.length - 1);
      } else if (event.key.toLowerCase() === "o") {
        setOverviewOpen(value => !value);
      } else if (event.key.toLowerCase() === "f") {
        void toggleFullscreen();
      } else if (event.key === "Escape" && overviewOpen) {
        setOverviewOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, next, overviewOpen, previous, toggleFullscreen]);

  const onTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 45) return;
    if (distance > 0) previous();
    else next();
  };

  return (
    <div
      ref={rootRef}
      className="aie-deck-page relative h-[100svh] w-full overflow-hidden bg-[#0f2f1d] text-white"
    >
      <style>{`
        @media print {
          @page { size: 13.333in 7.5in; margin: 0; }
          html, body { background: #fff !important; }
          .aie-deck-screen { display: none !important; }
          .aie-deck-print { display: block !important; }
          .aie-deck-print > article {
            display: block;
            width: 1280px;
            height: 720px;
            break-after: page;
            page-break-after: always;
          }
        }
      `}</style>

      <div
        className="aie-deck-screen h-full"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <header className="absolute inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0f2f1d]/92 px-3 backdrop-blur sm:h-16 sm:px-6">
          <a
            href="/decks"
            className="inline-flex h-10 items-center gap-2 px-1 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Decks</span>
          </a>
          <div className="pointer-events-none absolute left-1/2 hidden max-w-[56vw] -translate-x-1/2 text-center md:block">
            <p className="truncate text-sm font-semibold text-white">
              AIE Shanghai 2026 · 上海市人工智能行业协会合作会谈
            </p>
          </div>
          <p className="font-mono text-xs font-semibold tabular-nums text-white/65">
            {String(current + 1).padStart(2, "0")} / {String(SLIDE_META.length).padStart(2, "0")}
          </p>
        </header>

        <main className="absolute inset-x-0 bottom-0 top-14 px-3 pb-20 pt-3 sm:top-16 sm:px-20 sm:pb-24 sm:pt-5">
          <SlideViewport
            index={current}
            className="h-full w-full drop-shadow-[0_26px_45px_rgba(0,0,0,.35)]"
          />
        </main>

        <button
          type="button"
          onClick={previous}
          disabled={current === 0}
          aria-label="上一页"
          title="上一页"
          className="absolute left-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/25 text-white transition hover:bg-black/45 disabled:cursor-not-allowed disabled:opacity-25 sm:flex"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={current === SLIDE_META.length - 1}
          aria-label="下一页"
          title="下一页"
          className="absolute right-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/25 text-white transition hover:bg-black/45 disabled:cursor-not-allowed disabled:opacity-25 sm:flex"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        <nav
          aria-label="Deck控制"
          className="absolute bottom-3 left-1/2 z-40 flex h-12 -translate-x-1/2 items-center border border-white/15 bg-[#10271a]/95 px-1 shadow-2xl backdrop-blur sm:bottom-5"
        >
          <button
            type="button"
            onClick={previous}
            disabled={current === 0}
            aria-label="上一页"
            title="上一页"
            className="flex h-10 w-10 items-center justify-center text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="w-16 text-center font-mono text-xs font-semibold tabular-nums text-white/70">
            {current + 1} / {SLIDE_META.length}
          </span>
          <button
            type="button"
            onClick={next}
            disabled={current === SLIDE_META.length - 1}
            aria-label="下一页"
            title="下一页"
            className="flex h-10 w-10 items-center justify-center text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-white/15" />
          <button
            type="button"
            onClick={() => setOverviewOpen(true)}
            aria-label="打开全部页面"
            title="全部页面（O）"
            className="flex h-10 w-10 items-center justify-center text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Grid2X2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="打印或存为PDF"
            title="打印或存为PDF"
            className="hidden h-10 w-10 items-center justify-center text-white/70 transition hover:bg-white/10 hover:text-white sm:flex"
          >
            <Printer className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
            title={isFullscreen ? "退出全屏（F）" : "进入全屏（F）"}
            className="flex h-10 w-10 items-center justify-center text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Expand className="h-4 w-4" />
            )}
          </button>
        </nav>

        {overviewOpen ? (
          <section className="fixed inset-0 z-50 overflow-y-auto bg-[#0b2416]">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-[#0b2416]/94 px-4 backdrop-blur sm:px-8">
              <div>
                <p className="text-sm font-semibold text-white">全部页面</p>
                <p className="mt-0.5 text-xs text-white/45">选择一页继续</p>
              </div>
              <button
                type="button"
                onClick={() => setOverviewOpen(false)}
                aria-label="关闭全部页面"
                title="关闭"
                className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="mx-auto grid max-w-[1500px] gap-5 px-4 py-6 sm:grid-cols-2 sm:px-8 sm:py-10 lg:grid-cols-3">
              {SLIDE_META.map((title, index) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => {
                    goTo(index);
                    setOverviewOpen(false);
                  }}
                  aria-label={`打开第${index + 1}页：${title}`}
                  className={`group text-left transition ${
                    index === current
                      ? "outline outline-2 outline-offset-4 outline-[#FF8B70]"
                      : "hover:-translate-y-1"
                  }`}
                >
                  <SlideViewport
                    index={index}
                    className="aspect-video w-full border border-white/10 bg-[#06120b] shadow-xl"
                  />
                  <span className="mt-3 flex items-start gap-3 text-sm text-white/65 group-hover:text-white">
                    <span className="font-mono text-xs tabular-nums text-[#7AC892]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="line-clamp-2">{title}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="aie-deck-print hidden" aria-hidden="true">
        {SLIDE_META.map((title, index) => (
          <NativeSlide key={title} index={index} />
        ))}
      </div>
    </div>
  );
}
