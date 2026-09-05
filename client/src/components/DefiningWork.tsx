import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const brandLayers = {
  en: [
    {
      number: "01",
      title: "Build capability that remains yours.",
      label: "REAL CAPABILITY",
      detail:
        "Strip away the credential, title, company, and fashionable tool. What can you still see, decide, and make happen?",
    },
    {
      number: "02",
      title: "Make something reality can answer.",
      label: "REAL WORK",
      detail:
        "Strip away the manager, presentation, and internal scorecard. Does anyone still need it—and can they use, reject, or improve it?",
    },
    {
      number: "03",
      title: "Make what lasts.",
      label: "THE HORIZON",
      detail:
        "Then ask one question further: after the first release, does the work keep creating value—and keep carrying the maker's judgment?",
    },
  ],
  zh: [
    {
      number: "01",
      title: "学点真本事。",
      label: "能力",
      detail:
        "拿掉学历、title、公司和眼下最热的工具，什么判断和手艺还真正属于你？",
    },
    {
      number: "02",
      title: "做点真东西。",
      label: "现实",
      detail:
        "拿掉老板、汇报和内部评分，做出来的东西还有没有人需要，能不能被使用、拒绝和改进？",
    },
    {
      number: "03",
      title: "MAKE WHAT LASTS.",
      label: "时间",
      detail:
        "再往前一步：第一次发布以后，它还会不会继续创造价值；人们还能不能从中看见做出它的人的判断？",
    },
  ],
};

function SectionLabel({
  children,
  dark = false,
}: {
  children: string;
  dark?: boolean;
}) {
  const { lang } = useLanguage();

  return (
    <p
      className={cn(
        "font-mono text-xs leading-5",
        lang === "en" ? "uppercase tracking-[0.2em]" : "tracking-[0.1em]",
        dark ? "text-superlinear-on-dark" : "text-superlinear-deep"
      )}
    >
      {children}
    </p>
  );
}

export default function DefiningWork() {
  const { lang } = useLanguage();
  return (
    <section
      id="belief"
      className="scroll-mt-[72px] bg-superlinear-canvas py-16 text-superlinear-ink md:py-24"
    >
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <SectionLabel>
              {lang === "en" ? "THE QUESTION" : "我关心的问题"}
            </SectionLabel>
            <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.1] [text-wrap:balance] md:text-5xl">
              {lang === "en" ? (
                "AI can make real work easier. It can also amplify fake work a hundredfold."
              ) : (
                <>
                  AI让真东西更容易做出来，也能把
                  <span className="whitespace-nowrap">fake work</span>
                  放大一百倍。
                </>
              )}
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-[#48443B] md:text-lg md:leading-9">
            <p>
              {lang === "en"
                ? "Fake work substitutes visible activity for hard-to-measure value. A report, model, meeting, or launch can move the result—or merely produce evidence that someone is busy."
                : "Fake work用可见动作代替难以衡量的价值。一份报告、一个模型、一场会议、一次上线，都可能推动结果，也可能只在生产“我们正在推进”的证据。"}
            </p>
            <p>
              {lang === "en"
                ? "So I keep returning to one question: what changed after the work was done? It is the question I use most often when I think about careers, products, organizations, and AI."
                : "所以我会一直追问：这件事做完以后，到底改变了什么？这也是我看职业、产品、组织与AI时，最常用的一把尺子。"}
            </p>
          </div>
        </div>

        <div className="mt-14 grid border-y border-[#D4D0C7] md:grid-cols-3">
          {brandLayers[lang].map((item, index) => (
            <article
              key={item.number}
              className={cn(
                "py-8 md:px-7 md:py-10",
                index > 0 &&
                  "border-t border-[#D4D0C7] md:border-l md:border-t-0"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-superlinear-deep">
                  {item.number}
                </span>
                <p
                  className={cn(
                    "font-mono text-[11px] leading-5 text-superlinear-deep",
                    lang === "en"
                      ? "uppercase tracking-[0.18em]"
                      : "tracking-[0.1em]"
                  )}
                >
                  {item.label}
                </p>
              </div>
              <h3 className="mt-5 text-2xl font-semibold leading-9">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5E584E]">
                {item.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-5 border-l-2 border-superlinear pl-5 md:grid-cols-[0.88fr_1.12fr] md:gap-12 md:pl-7">
          <h3 className="max-w-lg text-2xl font-semibold leading-9 md:text-3xl md:leading-10">
            {lang === "en"
              ? "I admire people whose work and lives became impossible to separate."
              : "我敬佩的，是作品与人最终变得无法分开。"}
          </h3>
          <div className="space-y-3 text-sm leading-7 text-[#5E584E] md:text-base md:leading-8">
            <p>
              {lang === "en"
                ? "I think of the products of Steve Jobs and Zhang Xiaolong, Lionel Messi's football, Christopher Nolan's films, the judgments Geoffrey Hinton and Warren Buffett held through years of disagreement, and Tsunekazu Nishioka's temple craft. Different fields; in each case, the maker is unmistakable in the work."
                : "乔布斯和张小龙的产品，梅西的足球，诺兰的电影，Hinton和巴菲特那些经得起争议与时间的判断，还有西冈常一的手艺。领域不同，作品里都抹不掉做出它的人。"}
            </p>
            <p>
              {lang === "en"
                ? "People shape work, and work shapes people. A defining work takes form version by version as materials, masters, users, markets, and time keep correcting it."
                : "人塑造作品，作品也反过来塑造人。代表作不是一开始就能想对的；它要经过一个个版本，让材料、高手、用户、市场和时间不断校正，才慢慢成立。"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
