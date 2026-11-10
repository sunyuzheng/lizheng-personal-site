import { useLanguage } from "@/contexts/LanguageContext";

const brandLayers = {
  en: [
    {
      number: "01",
      title: "Build capability that remains yours.",
      label: "Real capability",
      detail:
        "Strip away the credential, title, company, and fashionable tool. What can you still see, decide, and make happen?",
    },
    {
      number: "02",
      title: "Make something reality can answer.",
      label: "Real work",
      detail:
        "Strip away the manager, presentation, and internal scorecard. Does anyone still need it—and can they use, reject, or improve it?",
    },
    {
      number: "03",
      title: "Make what lasts.",
      label: "The horizon",
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

/**
 * The question behind the work, closing About: the statement and why it matters; its three layers
 * side by side between hairlines; then the makers he admires.
 */
export default function DefiningWork() {
  const { lang } = useLanguage();
  return (
    <section id="belief" className="sec ruled belief">
      <div className="wrap">
        <div className="split big">
          <div>
            <div className="eyebrow">
              {lang === "en" ? "The question" : "我关心的问题"}
            </div>
            <h2>
              {lang === "en" ? (
                "AI can make real work easier. It can also amplify fake work a hundredfold."
              ) : (
                <>
                  <span className="phrase">AI让真东西</span>
                  <span className="phrase">更容易做出来，</span>
                  <span className="phrase">也能把fake work</span>
                  <span className="phrase">放大一百倍。</span>
                </>
              )}
            </h2>
          </div>
          <div className="prose">
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

        <div className="cols layers">
          {brandLayers[lang].map(item => (
            <article key={item.number}>
              <div className="t">{item.label}</div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>

        <div className="split admire">
          <h3>
            {lang === "en" ? (
              "I admire people whose work and lives became impossible to separate."
            ) : (
              <>
                <span className="phrase">我敬佩的，</span>
                <span className="phrase">是作品与人</span>
                <span className="phrase">最终变得无法分开。</span>
              </>
            )}
          </h3>
          <div className="prose small">
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
