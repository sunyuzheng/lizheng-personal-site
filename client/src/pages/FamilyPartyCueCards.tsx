import { applyPageSeo } from "@/lib/seo";
import { FAMILY_PARTY_CUE_CARDS_PAGE_META } from "@shared/page-meta";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  type ReactNode,
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const CARDS = [
  {
    time: "00:00–05:00",
    label: "开场",
    title: "大家认识的，\n可能只是我的10%。",
  },
  {
    time: "05:00–11:00",
    label: "经历",
    title: "每次选择，都在缩短判断与后果的距离。",
  },
  { time: "11:00–19:00", label: "观察", title: "AI正在重写工作的价格表。" },
  {
    time: "19:00–25:00",
    label: "选择",
    title: "求职与创业，其实都在问同一道题。",
  },
  {
    time: "25:00–26:00",
    label: "现场邀请",
    title: "把今天的问题，\n带进接下来的30天。",
  },
  { time: "26:00–27:00", label: "收束", title: "别把记分牌误认成世界。" },
  {
    time: "27:00–57:00",
    label: "Q&A",
    title: "先听真实选择，再一起找下一步。",
  },
  { time: "57:00–60:00", label: "结束", title: "把话筒交还给真实世界。" },
] as const;

function cardFromHash() {
  if (typeof window === "undefined") return 0;
  const match = window.location.hash.match(/^#card-(\d+)$/);
  if (!match) return 0;
  return Math.min(Math.max(Number(match[1]) - 1, 0), CARDS.length - 1);
}

function BulletList({ children }: { children: ReactNode }) {
  return (
    <ul className="cue-list grid gap-3 text-[#2a2926] sm:gap-4">{children}</ul>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-[0.62em] h-2 w-2 shrink-0 rounded-full bg-[#238343]" />
      <span>{children}</span>
    </li>
  );
}

function MustSay({ children }: { children: ReactNode }) {
  return (
    <blockquote className="cue-callout border-l-4 border-[#238343] bg-[#e8efe5] px-5 py-4 font-semibold leading-snug text-[#17151d] sm:px-7 sm:py-6">
      {children}
    </blockquote>
  );
}

function CardBody({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="cue-body">
        <BulletList>
          <Bullet>三次举手：老朋友 / 通过自媒体认识 / 第一次见</Bullet>
          <Bullet>自媒体≈工作的一成，是我与外界连接的公开接口</Bullet>
          <Bullet>第一身份：Superlinear创始人 + builder</Bullet>
          <Bullet>拿掉学校、公司、职位、平台，你靠什么说明价值？</Bullet>
        </BulletList>
        <MustSay>
          AI把“答案”变便宜以后，问题从“谁答得更好”，变成“谁来出题、谁判断答案是否成立、谁把它变成结果”。
        </MustSay>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="cue-body">
        <BulletList>
          <Bullet>腾讯：30人数据与AI团队，路径很清楚</Bullet>
          <Bullet>关键发现：分析正确、模型准确，不等于结果会被采用</Bullet>
          <Bullet>Statsig：离产品、客户和反馈更近</Bullet>
          <Bullet>
            Statsig这段经历结束后：全职搭建Superlinear，再缩短一步
          </Bullet>
        </BulletList>
        <MustSay>
          这些选择的共同点，不是公司越来越小，而是自己的判断离现实后果越来越近。
        </MustSay>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="cue-body">
        <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] border border-[#d8d2c6] bg-white text-center font-semibold text-[#17151d]">
          {[
            ["出题", "选什么问题"],
            ["做题", "生成与执行"],
            ["判题", "什么算好"],
            ["采用", "变成结果"],
          ].map(([name, note], itemIndex) => (
            <div
              key={name}
              className={`px-2 py-4 sm:px-4 sm:py-6 ${
                itemIndex > 0 ? "border-l border-[#d8d2c6]" : ""
              } ${itemIndex === 1 ? "bg-[#e8efe5]" : ""}`}
            >
              <p className="cue-chart-label">{name}</p>
              <p className="mt-1 text-[10px] font-normal text-[#716a60] sm:text-sm">
                {note}
              </p>
            </div>
          ))}
        </div>
        <BulletList>
          <Bullet>AI正在快速压低“做题”的成本</Bullet>
          <Bullet>更稀缺：选问题、定标准、推动采用、承担后果</Bullet>
          <Bullet>求职：漂亮履历会泛滥，可检查的作品更值钱</Bullet>
          <Bullet>创业：原型便宜了，不等于有人关心、付费、复用</Bullet>
        </BulletList>
        <MustSay>
          会出题不是会写prompt，而是知道什么值得做、为谁做、做到什么才算数。
        </MustSay>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="cue-body">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
          <section className="border border-[#d8d2c6] bg-white p-4 sm:p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#238343]">
              求职
            </p>
            <p className="cue-panel-copy font-semibold">
              如果AI把现在的任务压缩10倍，我能不能开始负责一个更完整的结果？
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#716a60]">
              往上学问题，往下学采用；做一份可检查、可使用的真实交付。
            </p>
          </section>
          <section className="border border-[#d8d2c6] bg-white p-4 sm:p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#238343]">
              创业
            </p>
            <p className="cue-panel-copy font-semibold">
              一个不欠我任何东西的人，愿不愿给时间、数据、信任、钱，或者再次回来？
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#716a60]">
              原型可以晚点精修，真实反馈一定要早点来。
            </p>
          </section>
        </div>
        <MustSay>
          组织形式不是答案，离真实结果有多近才是。也可以问孩子：你最近做了什么？谁真的用过？你怎么知道它有用？
        </MustSay>
      </div>
    );
  }

  if (index === 4) {
    return (
      <div className="cue-body">
        <div className="grid items-center gap-5 sm:grid-cols-[1fr_220px] sm:gap-9">
          <div>
            <BulletList>
              <Bullet>送大家30天Stay Superlinear会员体验</Bullet>
              <Bullet>无需绑卡，到期自动结束</Bullet>
              <Bullet>短码：0905；二维码留到Q&A结束</Bullet>
              <Bullet>9月8日晚上11:59（西雅图时间）前领取</Bullet>
            </BulletList>
            <p className="mt-5 border-t border-[#d8d2c6] pt-4 text-xs leading-relaxed text-[#716a60]">
              有人卡住时再说：注册/登录 → 邮箱验证码 → 进入会员社区 →
              下一页显示¥0且无需支付。已有会员不延长会期。
            </p>
          </div>
          <div className="mx-auto w-full max-w-[220px] border border-[#d8d2c6] bg-white p-3 shadow-[0_16px_42px_rgba(25,42,31,0.12)]">
            <img
              src="/decks/0905/invite-0905-qr.png"
              alt="Stay Superlinear 30天体验领取二维码"
              className="aspect-square w-full"
            />
            <p className="mt-2 break-all text-center font-mono text-[10px] text-[#4b4238]">
              stay.superlinear.academy/invite/0905
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (index === 5) {
    return (
      <div className="cue-body justify-center">
        <div className="grid gap-4 sm:gap-6">
          <MustSay>
            真正重要的不是选择一个听起来更勇敢的身份，而是别把记分牌误认成世界。
          </MustSay>
          <div className="border border-[#d8d2c6] bg-white px-5 py-5 sm:px-8 sm:py-7">
            <p className="cue-closing font-bold leading-tight text-[#17151d]">
              AI越会做题，人越要会出题。
            </p>
            <p className="cue-closing mt-2 font-bold leading-tight text-[#238343]">
              学点真本事，做点真东西。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (index === 6) {
    return (
      <div className="cue-body">
        <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr] sm:gap-5">
          <section className="border border-[#d8d2c6] bg-white p-4 sm:p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#238343]">
              先邀请
            </p>
            <BulletList>
              <Bullet>带了10本《真本事》，作为现场提问礼物，送完为止</Bullet>
              <Bullet>职业转换与求职</Bullet>
              <Bullet>大公司里的AI变化</Bullet>
              <Bullet>副业与创业验证</Bullet>
              <Bullet>孩子与下一代能力</Bullet>
            </BulletList>
          </section>
          <section className="border border-[#d8d2c6] bg-white p-4 sm:p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#238343]">
              回答顺序
            </p>
            <ol className="cue-list grid gap-3 text-[#2a2926] sm:gap-4">
              <li>
                <strong className="text-[#238343]">1.</strong>{" "}
                复述他真正面对的选择
              </li>
              <li>
                <strong className="text-[#238343]">2.</strong>{" "}
                判断缺的是信息、能力，还是反馈
              </li>
              <li>
                <strong className="text-[#238343]">3.</strong>{" "}
                给一个下周就能做的小实验
              </li>
            </ol>
          </section>
        </div>
        <p className="text-sm leading-relaxed text-[#716a60] sm:text-base">
          冷场备用：非技术背景先学工具还是行业问题？｜大公司里怎样分辨内部任务和真实价值？｜有全职工作和家庭，怎样低风险验证创业想法？
        </p>
      </div>
    );
  }

  return (
    <div className="cue-body justify-center">
      <BulletList>
        <Bullet>重申一句：AI越会做题，人越要会出题</Bullet>
        <Bullet>提醒：二维码还在，愿意继续聊的会后见</Bullet>
        <Bullet>感谢三校校友会、志愿者和现场每一位家人</Bullet>
      </BulletList>
      <MustSay>
        谢谢大家。希望今天之后，你不只是多知道几个AI工具，而是更愿意去做一件能被真实世界检验的东西。
      </MustSay>
    </div>
  );
}

export default function FamilyPartyCueCards() {
  const touchStartX = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index: number) => {
    const next = Math.min(Math.max(index, 0), CARDS.length - 1);
    setCurrent(next);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#card-${next + 1}`
    );
  }, []);

  const previous = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    setCurrent(cardFromHash());
    const onHashChange = () => setCurrent(cardFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    return applyPageSeo({
      ...FAMILY_PARTY_CUE_CARDS_PAGE_META,
      imageAlt: "课代表立正",
      locale: "zh_CN",
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
        goTo(0);
      } else if (event.key === "End") {
        goTo(CARDS.length - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, next, previous]);

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

  const card = CARDS[current];

  return (
    <div
      className="relative h-[100svh] w-full overflow-hidden bg-[#f3efe7] text-[#17151d]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <style>{`
        .cue-title { font-size: clamp(2rem, 6.2vw, 5.25rem); }
        .cue-title-compact { font-size: clamp(1.85rem, 4.6vw, 4rem); }
        .cue-list { font-size: clamp(1rem, 2.15vw, 1.7rem); line-height: 1.52; }
        .cue-callout { font-size: clamp(1rem, 2.25vw, 1.8rem); }
        .cue-chart-label { font-size: clamp(1rem, 2.3vw, 1.9rem); }
        .cue-panel-copy { font-size: clamp(1rem, 2.05vw, 1.55rem); line-height: 1.42; }
        .cue-closing { font-size: clamp(1.5rem, 4.2vw, 3.5rem); }
        .cue-body { display: flex; min-height: 0; flex: 1; flex-direction: column; gap: clamp(1rem, 3vh, 2rem); }
        @media (max-height: 690px) {
          .cue-title { font-size: clamp(1.75rem, 5.4vw, 3.2rem); }
          .cue-list { font-size: clamp(.92rem, 1.8vw, 1.25rem); line-height: 1.4; }
          .cue-callout { font-size: clamp(.94rem, 1.9vw, 1.3rem); }
          .cue-body { gap: .75rem; }
        }
      `}</style>

      <div className="absolute inset-x-0 top-0 h-1 bg-[#d8d2c6]">
        <div
          className="h-full bg-[#238343] transition-[width] duration-300"
          style={{ width: `${((current + 1) / CARDS.length) * 100}%` }}
        />
      </div>

      <header className="absolute inset-x-0 top-1 z-20 flex h-14 items-center justify-between border-b border-[#d8d2c6] bg-[#f3efe7]/95 px-4 backdrop-blur sm:h-16 sm:px-7">
        <a
          href="/decks"
          className="text-xs font-bold tracking-[0.12em] text-[#716a60] transition hover:text-[#17151d] sm:text-sm"
        >
          AI时代的求职与创业
        </a>
        <p className="font-mono text-xs font-semibold tabular-nums text-[#716a60] sm:text-sm">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(CARDS.length).padStart(2, "0")}
        </p>
      </header>

      <main className="absolute inset-x-0 bottom-[74px] top-[61px] overflow-y-auto px-5 py-5 sm:bottom-[86px] sm:top-[69px] sm:px-12 sm:py-8 lg:px-[8vw]">
        <article className="mx-auto flex min-h-full w-full max-w-[1180px] flex-col">
          <div className="mb-3 flex items-baseline gap-3 sm:mb-5">
            <span className="font-mono text-sm font-bold tabular-nums text-[#238343] sm:text-base">
              {card.time}
            </span>
            <span className="text-xs font-semibold tracking-[0.16em] text-[#716a60] sm:text-sm">
              {card.label}
            </span>
          </div>
          <h1
            className={`cue-title mb-5 max-w-[18ch] whitespace-pre-line font-bold leading-[1.03] tracking-[-0.045em] sm:mb-7 ${current === 4 ? "cue-title-compact" : ""}`}
          >
            {card.title}
          </h1>
          <CardBody index={current} />
        </article>
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-20 flex h-[74px] items-center justify-between border-t border-[#d8d2c6] bg-[#f3efe7]/96 px-3 backdrop-blur sm:h-[86px] sm:px-7">
        <button
          type="button"
          onClick={previous}
          disabled={current === 0}
          aria-label="上一张"
          title="上一张（← / Page Up）"
          className="flex h-11 items-center gap-2 px-3 text-sm font-semibold text-[#4b4238] transition hover:bg-white disabled:opacity-25 sm:px-5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">上一张</span>
        </button>

        <nav aria-label="提示卡导航" className="flex items-center gap-2">
          {CARDS.map((item, index) => (
            <button
              key={`${item.time}-${item.label}`}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`第${index + 1}张：${item.label}`}
              aria-current={index === current ? "step" : undefined}
              className={`h-2.5 rounded-full transition-all ${
                index === current
                  ? "w-7 bg-[#238343]"
                  : "w-2.5 bg-[#c8c0b3] hover:bg-[#8f877a]"
              }`}
            />
          ))}
        </nav>

        <button
          type="button"
          onClick={next}
          disabled={current === CARDS.length - 1}
          aria-label="下一张"
          title="下一张（→ / Space / Page Down）"
          className="flex h-11 items-center gap-2 px-3 text-sm font-semibold text-[#4b4238] transition hover:bg-white disabled:opacity-25 sm:px-5"
        >
          <span className="hidden sm:inline">下一张</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}
