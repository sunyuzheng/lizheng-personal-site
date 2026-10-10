/**
 * The hand-built web edition of "The End of Fake Learning" / 《假学习的终结》 (Columbia, 2026-10-02), at
 * /decks/fake-work-fake-learning and /decks/fake-work-fake-learning/zh. It replaces the generated page for
 * this deck (scripts/deck-pages.ts): the talk track becomes the article, and the slides' tables and
 * numbers are drawn on the page instead of shown as pictures.
 *
 * The words come from the deck's talk track and slides (columbia-fake-work-learning.vercel.app), with
 * only live-room phrases changed ("type it in the chat" became the guess buttons here). Unlike the
 * generated pages, this text lives in this file: when the talk changes, edit it here too.
 */
import { SEAL } from "../../shared/ask-seal.ts";

type Lang = "en" | "zh";

export interface FeatureContext {
  lang: Lang;
  /** Absolute URL of this page. */
  url: string;
  /** The other language's page (path). */
  alternatePath: string;
  /** Where the slides play (path on this site). */
  slides: string;
  description: string;
  jsonLd: unknown;
  image: string;
}

const SITE_URL = "https://www.lizheng.ai";

// ---------- sources ----------

const SOURCES = {
  bjork: {
    url: "https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/11/soderstorm_ra_learningvsperformance.pdf",
    en: "Soderstrom & Bjork, “Learning Versus Performance: An Integrative Review,” Perspectives on Psychological Science, 2015.",
    zh: "Soderstrom & Bjork，《Learning Versus Performance: An Integrative Review》，Perspectives on Psychological Science，2015。",
  },
  deslauriers: {
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6765278/",
    en: "Deslauriers et al., “Measuring actual learning versus feeling of learning in response to being actively engaged in the classroom,” PNAS, 2019. Randomized, Harvard introductory physics.",
    zh: "Deslauriers等，《Measuring actual learning versus feeling of learning in response to being actively engaged in the classroom》，PNAS，2019。随机实验，哈佛物理入门课。",
  },
  kornell: {
    url: "https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Hays_Kornell_RBjork_inpress.pdf",
    en: "Kornell, Hays & Bjork, “Unsuccessful retrieval attempts enhance subsequent learning,” Journal of Experimental Psychology, 2009.",
    zh: "Kornell, Hays & Bjork，《Unsuccessful retrieval attempts enhance subsequent learning》，Journal of Experimental Psychology，2009。",
  },
  bastani: {
    url: "https://doi.org/10.1073/pnas.2422633122",
    en: "Bastani et al., “Generative AI without guardrails can harm learning,” PNAS, 2025. Randomized, about 1,000 high-school math students in Turkey; changes are relative to students without AI. The tutor version used teacher-supplied solutions and common mistakes.",
    zh: "Bastani等，《Generative AI without guardrails can harm learning》，PNAS，2025。随机实验，约1,000名土耳其高中生；变化均相对于没用AI的学生。辅导版使用老师提供的解法和常见错误。",
  },
  chiang: {
    url: "https://www.newyorker.com/culture/the-weekend-essay/why-ai-isnt-going-to-make-art",
    en: "Ted Chiang, “Why A.I. Isn’t Going to Make Art,” The New Yorker, 2024.",
    zh: "特德·姜（Ted Chiang），《Why A.I. Isn’t Going to Make Art》，The New Yorker，2024。",
  },
  spence: {
    url: "https://www.nobelprize.org/prizes/economic-sciences/2001/spence/facts/",
    en: "Michael Spence, Nobel Prize in Economic Sciences, 2001, for the analysis of markets with asymmetric information (job-market signaling).",
    zh: "迈克尔·斯宾塞，2001年诺贝尔经济学奖，获奖工作是不对称信息市场的分析（就业市场信号）。",
  },
} as const;
type SourceKey = keyof typeof SOURCES;
const SOURCE_ORDER: SourceKey[] = ["bjork", "deslauriers", "kornell", "bastani", "chiang", "spence"];
const ref = (key: SourceKey) => {
  const n = SOURCE_ORDER.indexOf(key) + 1;
  return `&#8288;<sup class="ref"><a href="#note-${n}" aria-label="note ${n}">${n}</a></sup>`;
};

const READING = {
  en: [
    { title: "Two Major Pitfalls in Learning AI: Looking for Textbooks, Copying Homework", url: "https://www.superlinear.academy/c/ai-resources-en/two-major-pitfalls-in-learning-ai-looking-for-textbooks-only-reading-not-doing-copying-homework-relying-on-tutorials" },
    { title: "Why Everyone Is Learning the Nouns, but the Real Gap Comes from the Verbs", url: "https://www.superlinear.academy/c/ai-resources-en/why-everyone-is-learning-the-nouns-but-the-real-gap-comes-from-the-verbs" },
    { title: "Five Gaps Between AI Users and AI Builders", url: "https://www.superlinear.academy/c/ai-resources-en/five-gaps-between-ai-users-and-ai-builders-and-the-technical-reasons-behind-them-a-big-tech-worker-s-take" },
    { title: "Why AI Education Should Go Beyond Content Creation to Engineering Infrastructure", url: "https://www.superlinear.academy/c/ai-resources-en/ai-builder-space-en" },
    { title: "如何识别与消灭 fake work (fake work, in Chinese)", url: "https://www.superlinear.academy/c/ai-resources/fake-work" },
    { title: "Don't build: 看清demo和production之间的鸿沟 (in Chinese)", url: "https://www.superlinear.academy/c/ai-resources/dont-build" },
  ],
  zh: [
    { title: "假学习的终结（文章版）", url: "https://www.superlinear.academy/c/ai-resources/fake-learning" },
    { title: "如何识别与消灭 fake work", url: "https://www.superlinear.academy/c/ai-resources/fake-work" },
    { title: "学AI的两大误区：找课本（只看不动手），抄作业（依赖tutorial）", url: "https://www.superlinear.academy/c/ai-resources/ai-tutorial" },
    { title: "为什么所有人都在学名词，但真正拉开差距的是动词", url: "https://www.superlinear.academy/c/ai-resources/verb" },
    { title: "AI User 与 AI Builder 的 5 个差距，和背后具体技术原因", url: "https://www.superlinear.academy/c/ai-resources/ai-mastery" },
    { title: "Don't build: 看清demo和production之间的鸿沟", url: "https://www.superlinear.academy/c/ai-resources/dont-build" },
    { title: "告别教程思维：为什么 AI 教育不应局限于内容创作，而应该引进工程基建", url: "https://www.superlinear.academy/c/tools/ai-builder-space" },
  ],
};

// ---------- small pieces ----------

const p = (...paragraphs: string[]) => paragraphs.map(text => `<p>${text}</p>`).join("\n");

/** Horizontal bars around a zero line. `domain` is the value range the track covers. */
function bars(rows: Array<{ label: string; sub?: string; value: number | null; text: string; tone: "ink" | "soft" | "adverse"; hidden?: boolean }>, domain: [number, number], ariaLabel: string): string {
  const [lo, hi] = domain;
  const span = hi - lo;
  const zero = ((0 - lo) / span) * 100;
  const body = rows
    .map(row => {
      const v = row.value ?? 0;
      const left = v >= 0 ? zero : zero - (Math.abs(v) / span) * 100;
      const width = (Math.abs(v) / span) * 100;
      const mark = row.value === null ? `<span class="bar-dot" style="left:${zero.toFixed(2)}%"></span>` : `<span class="bar-fill ${row.tone}" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%"></span>`;
      return `<div class="bar-row${row.hidden ? " hold" : ""}"><span class="bar-label">${row.label}${row.sub ? `<small>${row.sub}</small>` : ""}</span><span class="bar-track"><span class="bar-zero" style="left:${zero.toFixed(2)}%"></span>${mark}</span><b class="bar-value ${row.tone}">${row.text}</b></div>`;
    })
    .join("");
  return `<div class="bars" role="img" aria-label="${ariaLabel}">${body}</div>`;
}

// ---------- copy ----------

const COPY = {
  en: {
    htmlLang: "en",
    locale: "en_US",
    title: "The End of Fake Learning: what it means to learn when AI can do the work · Yuzheng Sun",
    kicker: ["Columbia University", "COMS W4995 Agentic Engineering", "October 2, 2026"],
    h1: "The End of Fake Learning",
    sub: "When finishing the work stopped proving you learned it",
    byline: "Yuzheng Sun · Founder, Superlinear Academy",
    home: "/en",
    homeLabel: "Yuzheng Sun, back to the homepage",
    name: "Yuzheng Sun",
    allDecks: "All decks",
    decks: "/en/decks",
    about: "About",
    aboutHref: "/en/about",
    play: "Play the slides",
    edition: "中文版",
    editionLang: "zh-CN",
    readTime: "A guest talk for Columbia’s Agentic Engineering course · about 15 minutes to read",
    skip: "Skip to content",
    contents: "Contents",
    slideLink: "This slide",
    chapters: ["What learning is", "Backwards", "When AI is right", "Fake work", "New grades", "Spotter", "What proves you"],
    notes: "Notes",
    reading: "Further reading",
    readingIntro: "Essays of mine the talk draws on, on Superlinear Academy.",
    aboutTitle: "About this talk",
    aboutBody: `A guest session for Columbia University’s COMS W4995 Agentic Engineering, October 2, 2026. This page is the talk written out for reading; the slides are <a href="SLIDES">here</a>, and there is a <a href="ALT" hreflang="zh-CN" lang="zh-CN">中文版</a>.`,
    askTitle: "Still have a question?",
    askBody: "Ask Lizheng answers from what I have said and written in public, with a source for every answer.",
    askCta: "Ask Lizheng",
    footer: "Decks on the web",
    seeNumbers: "See the numbers",
    showResult: "Show the result",
    justShow: "Just show me",
    guessFirst: "Make both guesses first, or",
  },
  zh: {
    htmlLang: "zh-CN",
    locale: "zh_CN",
    title: "假学习的终结：AI时代，怎样才算真正学会｜孙煜征",
    kicker: ["哥伦比亚大学", "COMS W4995 Agentic Engineering", "2026年10月2日"],
    h1: "假学习的终结",
    sub: "当“做完”不再证明“学会”",
    byline: "立正 · 孙煜征 · Superlinear Academy创始人",
    home: "/",
    homeLabel: "孙煜征 · 课代表立正，回到首页",
    name: "孙煜征",
    allDecks: "全部课件",
    decks: "/decks",
    about: "关于我",
    aboutHref: "/about",
    play: "播放幻灯片",
    edition: "English",
    editionLang: "en",
    readTime: "哥伦比亚大学Agentic Engineering课的客座分享 · 读完约15分钟",
    skip: "跳到正文",
    contents: "目录",
    slideLink: "看这一页幻灯片",
    chapters: ["什么是学会", "为什么反着", "AI做对的时候", "假工作", "新的分数", "保护员，不是叉车", "还能证明你的"],
    notes: "注释",
    reading: "延伸阅读",
    readingIntro: "这场分享用到的我的几篇文章，在Superlinear Academy。",
    aboutTitle: "关于这场分享",
    aboutBody: `2026年10月2日，哥伦比亚大学COMS W4995 Agentic Engineering课的客座分享。这一页是把演讲写下来、方便阅读的版本；原幻灯片在<a href="SLIDES">这里</a>，也有<a href="ALT" hreflang="en" lang="en">英文版</a>。`,
    askTitle: "还有问题？",
    askBody: "可以去「问问立正」问，回答来自我公开讲过、写过的内容，每条都带出处。",
    askCta: "问问立正",
    footer: "课件网页版",
    seeNumbers: "看数字",
    showResult: "看结果",
    justShow: "直接看结果",
    guessFirst: "两道题都猜完再看，或者",
  },
};

// ---------- sections ----------

interface Slide {
  n: number;
  chapter: number;
  title: string;
  body: string;
}

function slides(lang: Lang): Slide[] {
  if (lang === "en") {
    return [
      {
        n: 2,
        chapter: 0,
        title: "The grade sees the result. Learning happens in the process.",
        body: `${p(
          "Start with a thought experiment. Take any homework you have ever handed in. Now imagine you had copied it instead. Same answers. Same grade. Your transcript cannot tell the difference. But you learned nothing.",
          "Why? Because the grade looks at the result, and learning happens in the process: being stuck on problem three for an hour, trying the wrong approach, figuring out why it failed. Copying keeps the result and deletes the process.",
        )}
<figure class="fig"><div class="grid g3" role="table" aria-label="What the grade sees when you do the homework and when you copy it">
<div class="g-row g-head" role="row"><span role="columnheader"></span><span role="columnheader">The result<small>what the grade sees</small></span><span role="columnheader">The process<small>where the learning happens</small></span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">Do the homework</span><span role="cell">A grade</span><span role="cell"><strong>Learning</strong></span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">Copy it</span><span role="cell">The same grade</span><span role="cell" class="adverse-text"><strong>Nothing</strong></span></div>
</div><figcaption>Same result. Same grade. No process, no learning.</figcaption></figure>
${p(
  "For most of your education the two came together, because the only practical way to get the result was to go through the process. So we never had to ask what learning actually is. Teachers and grades answered that for us.",
  "Now AI can produce the result without you going through the process. So you have to answer it yourself.",
)}`,
      },
      {
        n: 3,
        chapter: 0,
        title: "Real learning is what you can still do: without the help, later, on a new problem.",
        body: `${p(
          `Learning scientists have a classic distinction for this: performance versus learning.${ref("bjork")}`,
          "Performance is how well you do right now, during practice or right after it, usually with help around you. Learning is what is left later, when the help is gone, time has passed, and the problem has changed.",
        )}
<figure class="fig"><ol class="trio">
<li><span>01 · Take away the help</span><strong>No AI. No notes. No tutorial.</strong></li>
<li><span>02 · Wait</span><strong>A week later, not right after.</strong></li>
<li><span>03 · Change the problem</span><strong>New inputs. A new constraint.</strong></li>
</ol><figcaption>Doing well with the help, right after, on the same problem is <em>performance</em>.</figcaption></figure>
${p(
  "So here is the definition I want you to leave with. You have really learned something if you can still do it without the help, a week later, on a problem you have not seen.",
)}
<p class="pull">Everything else is performance. And fake learning is simply mistaking one for the other: treating “I made it” as “I learned it.”</p>
${p("Which raises a practical problem. If learning only shows up later, how do you know, while you are learning, whether it is happening?")}`,
      },
      {
        n: 4,
        chapter: 1,
        title: "Guess first: which group learned more? Which group felt it did?",
        body: `${p(
          "Mostly, by feeling. So let’s test your feeling.",
          `Harvard ran a randomized experiment in an introductory physics course.${ref("deslauriers")} Same content, same handouts. One group got a clear, polished lecture from a highly rated instructor. The other group worked through the problems in small groups, got stuck, and then got the explanation.`,
        )}
<figure class="fig guess" data-guess="physics">
<div class="pair"><div><span>Group A</span><p>A clear, polished lecture from a highly rated instructor.</p></div><div><span>Group B</span><p>Work the problems in small groups. Get stuck. Then the explanation.</p></div></div>
<div class="q"><p><b>01</b>Which group learned more, measured by a test?</p><div class="choices" data-q="learned" data-answer="B"><button type="button" aria-pressed="false" value="A">A</button><button type="button" aria-pressed="false" value="B">B</button></div></div>
<div class="q"><p><b>02</b>Which group <em>felt</em> it had learned more?</p><div class="choices" data-q="felt" data-answer="A"><button type="button" aria-pressed="false" value="A">A</button><button type="button" aria-pressed="false" value="B">B</button></div></div>
<p class="guess-go"><button type="button" class="go" data-reveal="physics" disabled>Show the result ↓</button></p>
</figure>`,
      },
      {
        n: 5,
        chapter: 1,
        title: "Your feeling of learning is often backwards.",
        body: `<figure class="fig result" id="result-physics" data-hold="physics">
<p class="fig-title">Group B (worked it out) compared with Group A (polished lecture)</p>
${bars(
  [
    { label: "Learned", sub: "test score", value: 0.46, text: "B higher · +0.46 SD", tone: "ink" },
    { label: "Felt they learned", sub: "self-rating", value: -0.56, text: "B lower · −0.56 SD", tone: "adverse" },
  ],
  [-0.8, 0.8],
  "Group B scored 0.46 standard deviations higher on the test than Group A, and rated their own learning 0.56 standard deviations lower.",
)}
<p class="feedback" data-feedback="physics" hidden></p>
<details><summary>See the numbers</summary><table><thead><tr><th></th><th>A · polished lecture</th><th>B · worked it out</th></tr></thead><tbody><tr><th>Learned (test score)</th><td>Less</td><td>More · +0.46 SD</td></tr><tr><th>Felt they learned (self-rating)</th><td>More</td><td>Less · −0.56 SD</td></tr></tbody></table><p>SD: standard deviations. Deslauriers et al., PNAS, 2019.${ref("deslauriers")}</p></details>
<div class="hold-cover"><p>Make both guesses first, or <button type="button" data-reveal="physics">just show me</button>.</p></div>
</figure>
${p(
  "Group B, the ones who worked it out, scored clearly higher on the test. And they felt they had learned less. Group A, the lecture, learned less, felt they had learned more, and said they wished every physics class were taught that way.",
  "Smooth made people think they had learned. Struggle made them think they hadn’t. The truth was often the reverse. The researchers’ reading: the extra effort of working it out felt like not learning, when it was actually a sign that learning was happening.",
  "We see the same thing in our own AI courses. We build in guided mistakes on purpose, and students get frustrated; some decide the course is bad. The smoothest sessions get the warmest reactions, and it is easy to walk out remembering the feeling and not the skill.",
  "So why would struggle teach more?",
)}`,
      },
      {
        n: 6,
        chapter: 1,
        title: "The more you get wrong, the more you learn.",
        body: `${p("Because learning happens where your idea and reality don’t match.")}
<figure class="fig"><ol class="loop"><li><b>01</b>You guess.</li><li><b>02</b>Reality disagrees.</li><li><b>03</b>You ask why.</li><li><b>04</b>Your idea changes.</li></ol></figure>
${p(
  "You guess. Reality disagrees. You ask why. And the idea in your head actually changes. If you never guessed, there is nothing to disagree with, and nothing changes.",
  `Psychologists have shown this again and again. Try to answer first, even if you get it wrong, then see the right answer, and it sticks better than if you had simply studied the answer.${ref("kornell")}`,
)}
<aside class="note"><span>The catch</span><p>The error has to come with feedback. Something has to tell you what went wrong. Frustration alone is not learning.</p></aside>
${p(
  "And if your guess a minute ago was wrong, you will remember this result better than the people who got it right. That is the mechanism, working on you.",
  "So: the more you get wrong, the more you learn. And smooth learning, with nothing to get wrong, often teaches nothing.",
)}`,
      },
      {
        n: 7,
        chapter: 2,
        title: "AI is most dangerous when it’s right.",
        body: `${p("Now look at tutorials and AI through this lens.")}
<figure class="fig"><ol class="trio smooth">
<li><span>A polished lecture</span><strong>You watch someone else think.</strong></li>
<li><span>A tutorial</span><strong>Someone already made every mistake for you.</strong></li>
<li><span>An AI answer</span><strong>It’s right before you’re even stuck.</strong></li>
</ol><p class="scale"><span>Smoother</span><span>Less chance to be wrong →</span></p></figure>
${p(
  "A tutorial is polished smoothness. Someone has already tried every step and filled every hole. You follow along, it works the first time, and it feels fast. But you never had a chance to be wrong. I once put it this way: what a tutorial teaches you keeps getting cheaper; what it lets you skip is the most valuable part.",
  "AI is smoothness taken to the limit. The answer is on the screen before you have started to think. The code runs before you are stuck.",
  "So the most dangerous moment is not when AI is wrong. It is when AI is right, and you think you have learned it too. That feeling of “I got it” makes you stop. You don’t try it again yourself. You don’t change the problem. The exact place where learning needed to happen gets skipped.",
  "Here is what that looks like when someone measures it.",
)}`,
      },
      {
        n: 8,
        chapter: 2,
        title: "The practice got better. The learning got worse.",
        body: `${p(`A randomized experiment with nearly a thousand high-school math students in Turkey.${ref("bastani")} For several practice sessions, one group could ask GPT-4 anything.`)}
<figure class="fig">
<p class="fig-title">Students who could ask GPT-4 for answers, compared with students who had no AI</p>
${bars(
  [
    { label: "Practice", sub: "with GPT-4", value: 48, text: "+48%", tone: "soft" },
    { label: "Exam", sub: "GPT-4 taken away", value: -17, text: "−17%", tone: "adverse" },
  ],
  [-40, 140],
  "Practice scores rose 48 percent with GPT-4; exam scores without it were 17 percent lower than for students who never had AI.",
)}
</figure>
${p(
  "Their practice scores went up 48 percent. Then came the exam, with no AI for anyone. The students who had practiced with GPT-4 scored 17 percent lower than students who never had it.",
  "Better practice. Worse learning. In the same students, over the same weeks. And nobody could see it until the AI was taken away.",
)}
<aside class="note"><span>A caveat</span><p>I’m an economist, so: these are relative changes, in high-school math, in one country. Not a universal law about AI. And there was a third group in this study; we will come back to it.</p></aside>
${p(`The writer Ted Chiang has the best image for this.${ref("chiang")} Using ChatGPT to write your essays is like bringing a forklift into the weight room. The weights move. The muscle doesn’t grow. And if you are learning AI, be careful: the tool you are learning with is exactly that forklift.`, "This is not only a school problem.")}`,
      },
      {
        n: 9,
        chapter: 3,
        title: "Fake learning and fake work fool the same thing: your sense of progress.",
        body: `${p(
          "I learned this at work, not in school.",
          "At Tencent I led a team, and my main job was relaying: translating my boss’s strategy into actions for the team, then reporting the team’s results back up. I was good at it. My boss liked me, my team liked me, and I was comfortable. But I kept asking myself: what progress am I actually making? What value am I creating?",
        )}
<figure class="fig portrait-row"><img src="/home/portrait.webp" width="815" height="900" alt="Yuzheng Sun, in a white T-shirt, arms crossed" loading="lazy" decoding="async"><div class="grid g2" role="table" aria-label="Fake work and fake learning">
<div class="g-row" role="row"><span class="g-key" role="rowheader">Fake work</span><span role="cell">Visible activity standing in for value that’s hard to measure.</span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">Fake learning</span><span role="cell">Visible results standing in for growth that’s hard to measure.</span></div>
</div></figure>
${p(
  "I call this fake work: visible activity standing in for value that is hard to measure. It is structural. When value is hard to measure, organizations watch progress reports, meetings and decks, so people start producing those. And the worst part is the feeling. A whole day of meetings, you are exhausted, and your brain tells you it was a productive day.",
)}
<p class="pull">Fake learning and fake work fool the same thing: your sense of progress.</p>
${p(
  "And that illusion is trained. In school, teachers and grades tell you what good is. At work, your boss and your KPIs do. After more than a decade of this, what we are best at is satisfying whoever is grading us. We were trained to be insensitive to value.",
  "So people who come out of fake learning drift naturally into fake work. Not because they don’t try. It is the only kind of trying they were trained for.",
)}`,
      },
      {
        n: 10,
        chapter: 4,
        title: "A new tool feels like progress. It expires in months.",
        body: `${p(
          "In school, the scores were grades. For people learning AI, there are new scores: how many tools you have learned, and how many prototypes you have built.",
          "Start with tools. Learn a new tool, set up an automation, finish a tutorial: the progress is visible. You can screenshot it, post it, put it on your résumé. But AI tools turn over every few months. Half a year later, many of the buttons and commands you learned are gone.",
        )}
<figure class="fig"><div class="grid g3" role="table" aria-label="What you collect and what stays">
<div class="g-row g-head" role="row"><span role="columnheader"></span><span role="columnheader">What you collect<small>a new tool, an automation, a finished tutorial</small></span><span role="columnheader">What stays<small>habits, methods, ways of thinking</small></span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">Feels like progress</span><span role="cell"><strong>Right away</strong></span><span role="cell">Hardly at all</span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">You can show it</span><span role="cell">Screenshot, post, résumé</span><span role="cell">You can’t</span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">Half a year later</span><span role="cell" class="adverse-text">Many buttons are gone</span><span role="cell"><strong>Still there</strong></span></div>
</div><figcaption>The tool feels most like progress, and expires fastest. The method feels like nothing, and stays with you.</figcaption></figure>
${p(
  "What stays is invisible: habits, methods, ways of thinking. You split a fuzzy task into steps you can check. When the result is wrong, you look for the cause instead of switching tools and trying again. You cannot screenshot that. But change the tool, wait a year, change the problem, and it is still there. It passes the test we started with.",
  "I have trained thousands of people at tech companies, and the pattern is consistent. With the same model, some people decide AI is unreliable, and others turn it into a dependable work system. The difference is not the tool. It is the method.",
  "So why does everyone collect tools? A tool has a moment when you have “learned it.” A method has no such moment; it grows while you work. The tool feels like the most progress and expires fastest. The method feels like no progress and stays with you. Backwards again.",
)}`,
      },
      {
        n: 11,
        chapter: 4,
        title: "A demo only has to be right at the demo. A product has to stay right.",
        body: `${p("Now prototypes. With a coding agent, you can build a convincing app in an afternoon. But a prototype is best at the smooth case: clear requirements, simple data, and one user, which is you.")}
<figure class="fig"><div class="pair big"><div><span>A prototype · one afternoon with an agent</span><p>Clear requirements. Simple data. One user: you.</p></div><div><span class="adverse-text">A product · other people</span><p>Inputs you never imagined. Data that breaks. And you’re not in the room.</p></div></div></figure>
${p(
  "A product faces other people. They type things you never imagined. The data breaks. The requirements change next month. And when they use it, you are not in the room. As I put it in an essay called “Don’t build”: a demo only has to be right at the moment you show it; a product has to stay right while reality keeps changing.",
  "Every step from prototype to product is your idea hitting reality. You thought users would do this; they did that. Many of the right decisions simply do not exist until you have seen the wrong version. Every collision is a lesson.",
  "That is why a prototype feels like such fast progress: it skips exactly the part where you would have learned.",
)}
<p class="pull">So in the AI era, real learning lives on two roads: from a tool to a method, and from a prototype to a product.</p>`,
      },
      {
        n: 12,
        chapter: 5,
        title: "Same AI. Different design. Different learning.",
        body: `${p("So should you use less AI? No. Remember the math study. There was a third group.")}
<figure class="fig guess" data-guess="tutor">
<p class="fig-title">A prediction first. Same GPT-4, but it only gives hints, never answers. Does the exam loss…</p>
<div class="choices wide" data-q="tutor" data-answer="gone"><button type="button" aria-pressed="false" value="stays">Stay</button><button type="button" aria-pressed="false" value="shrinks">Shrink</button><button type="button" aria-pressed="false" value="gone">Disappear</button></div>
</figure>
<figure class="fig result" id="result-tutor" data-hold="tutor">
<p class="fig-title">Two designs of GPT-4, compared with students who had no AI</p>
${bars(
  [
    { label: "Forklift · practice", sub: "answers on request", value: 48, text: "+48%", tone: "soft" },
    { label: "Forklift · exam", sub: "no AI", value: -17, text: "−17%", tone: "adverse" },
    { label: "Spotter · practice", sub: "hints, not answers", value: 127, text: "+127%", tone: "soft", hidden: true },
    { label: "Spotter · exam", sub: "no AI", value: null, text: "No significant loss", tone: "ink", hidden: true },
  ],
  [-40, 140],
  "With answers on request, practice rose 48 percent and the exam fell 17 percent. With hints only, practice rose 127 percent and the exam showed no significant loss.",
)}
<p class="feedback" data-feedback="tutor" hidden></p>
<details><summary>See the numbers</summary><table><thead><tr><th></th><th>GPT-4 as forklift</th><th>GPT-4 as spotter</th></tr></thead><tbody><tr><th>How it helped</th><td>Answers on request</td><td>Hints, not answers</td></tr><tr><th>Practice (with the help)</th><td>+48%</td><td>+127%</td></tr><tr><th>Exam (no AI)</th><td>−17%</td><td>No significant loss</td></tr></tbody></table><p>Bastani et al., PNAS, 2025.${ref("bastani")}</p></details>
<div class="hold-cover"><p>Pick an answer above, or <button type="button" data-reveal="tutor">just show me</button>.</p></div>
</figure>
${p(
  "Teachers gave that GPT-4 the solutions and the common mistakes, and told it to give hints, not answers. On practice, that group improved even more: 127 percent. And on the exam, the loss essentially disappeared.",
  "Same AI. Different design. The difference is whether students still got a chance to think first, and to be wrong.",
)}
<p class="pull">That is the difference between a forklift and a spotter. A forklift lifts for you. A spotter stands behind you, lets you do the lift, and grabs the bar only when you are about to fail.</p>`,
      },
      {
        n: 13,
        chapter: 5,
        title: "Where it counts, choose the hard path.",
        body: `${p(
          "Using AI as a spotter means choosing the hard path, at the moments that count.",
          "Not all difficulty is worth it. Yan Wang, who spoke with me that day, calls things like configuring environments, requesting API tokens and debugging ports fake difficulty. They burn willpower, they give you the feeling of working hard, and they don’t make you any wiser. Hand those to AI without guilt. Keep the real difficulty: is this worth doing, how should it be broken down, and is the result actually good?",
        )}
<figure class="fig"><div class="pair"><div><span>Fake difficulty · hand it to AI</span><p>Setting up environments, tokens, ports. Burns willpower. Grows nothing.</p></div><div><span>Real difficulty · keep it</span><p>Is this worth doing? How should it be split? Is the result actually good?</p></div></div></figure>
<h3>Then three moves</h3>
<ol class="moves">
<li><b>Guess first.</b> Before the agent runs, write down how you would do it and where you expect it to break. Then look at what it did. Being wrong is where the learning is.</li>
<li><b>Take the help away.</b> A day or two later, close the AI and do it again, or explain it to someone. Wherever you get stuck is what you haven’t learned yet.</li>
<li><b>Change the problem.</b> New data, a new constraint, a different user. See if you can still do it.</li>
</ol>
${p(
  "The first move gives you the chance to be wrong. The other two test whether you learned: without the help, later, on a new problem.",
  "It will feel slower and harder. That is not falling behind. That is what learning feels like from the inside.",
)}`,
      },
      {
        n: 14,
        chapter: 6,
        title: "When anyone can make beautiful work, the work stops proving anything.",
        body: `${p(`Now the economics. Michael Spence won a Nobel prize for an idea you already understand: a signal only works when it is hard to fake.${ref("spence")}`)}
<figure class="fig"><div class="grid g3" role="table" aria-label="What you can show, what it used to signal, and what it costs now">
<div class="g-row g-head" role="row"><span role="columnheader">What you can show</span><span role="columnheader">Used to signal</span><span role="columnheader">Now costs</span></div>
<div class="g-row" role="row"><span class="g-key" role="cell">A polished essay</span><span role="cell">You can write.</span><span role="cell"><strong>A prompt.</strong></span></div>
<div class="g-row" role="row"><span class="g-key" role="cell">Code that passes the tests</span><span role="cell">You can code.</span><span role="cell"><strong>An agent run.</strong></span></div>
<div class="g-row" role="row"><span class="g-key" role="cell">A GitHub full of projects</span><span role="cell">You can build.</span><span role="cell"><strong>A weekend.</strong></span></div>
</div></figure>
<aside class="note"><span>My prediction</span><p>This is a prediction, not a measured fact. Fake learning booms first: it has never been cheaper to produce the result. Then it stops paying. When every applicant has ten polished AI projects, the projects stop telling anyone apart. The same will happen to fake work: first an explosion, then a collapse in its value.</p></aside>
${p("What will still prove you is what you can do once the help is gone. Expect interviewers to stop asking what you built, and start asking why you built it that way, what broke, and what you would change.")}`,
      },
      {
        n: 15,
        chapter: 6,
        title: "What ends is a misunderstanding.",
        body: `${p(
          "So what ends? Not grades, certificates or tutorials. They will stay, and they are still useful. What ends is a misunderstanding: mistaking “I made it” for “I learned it,” and mistaking smooth for progress.",
          "For anyone who actually wants to learn, this is good news. A spotter who is always available, endlessly patient, and able to see where your thinking went wrong used to be almost impossible to find. Now it is on your laptop. The only question is whether you let it lift for you, or have it watch you lift.",
          "You may have noticed that twice on this page, I asked you to guess before showing you the result. The guesses that were wrong are the ones you will remember.",
        )}
<p class="closing">Something you learned with AI this month: close the AI, change the problem. <em>Can you still do it?</em></p>
<p class="signoff">Learn real skills. Make real things.</p>`,
      },
    ];
  }
  return [
    {
      n: 2,
      chapter: 0,
      title: "分数看的是结果，学习发生在过程里",
      body: `${p(
        "先想一件事：你交过的任何一份作业，如果当时是抄的，答案一样，分数一样，成绩单分辨不出来。但你什么都没学到。",
        "原因很简单：分数看的是结果，学习发生在过程里。在第三题卡一个小时，试一个错的方法，搞明白它为什么错，这些都在过程里。抄作业，结果还在，过程没了。",
      )}
<figure class="fig"><div class="grid g3" role="table" aria-label="自己做作业和抄作业，分数能看到什么">
<div class="g-row g-head" role="row"><span role="columnheader"></span><span role="columnheader">结果<small>分数看得见</small></span><span role="columnheader">过程<small>学习发生的地方，分数看不见</small></span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">把作业做一遍</span><span role="cell">一个分数</span><span role="cell"><strong>学到的东西</strong></span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">抄一份作业</span><span role="cell">一样的分数</span><span role="cell" class="adverse-text"><strong>什么都没有</strong></span></div>
</div><figcaption>结果一样，分数一样。过程没了，学习也没了。</figcaption></figure>
${p(
  "过去，结果和过程总是一起出现，因为拿到结果最现实的办法，就是自己走一遍过程。所以我们很少需要问：学会到底是什么？这个问题一直有人替我们回答：老师，还有分数。",
  "AI来了以后，作业和项目都可以由AI做出来，分数就回答不了这个问题了。你得自己回答。",
)}`,
    },
    {
      n: 3,
      chapter: 0,
      title: "真正学会，是撤掉帮助、过一段时间、换一道题，你还会",
      body: `${p(
        `学习科学里有一个经典区分：表现和学习。${ref("bjork")}`,
        "表现，是你当下做得怎么样：练习的时候，或者刚做完的时候，身边通常还有帮助。学习，是过后还剩下什么：帮助撤掉了，时间过去了，题目也换了。",
      )}
<figure class="fig"><ol class="trio">
<li><span>01 · 撤掉帮助</span><strong>不用AI，不看笔记，不照教程。</strong></li>
<li><span>02 · 过一段时间</span><strong>一周以后，不是刚做完。</strong></li>
<li><span>03 · 换一道题</span><strong>换一批输入，加一个约束。</strong></li>
</ol><figcaption>有帮助、刚做完、同一道题上做得好，叫<em>表现</em>。</figcaption></figure>
${p("所以我想请大家记住这个定义：真正学会，是撤掉帮助、过一段时间、换一道题，你还会。")}
<p class="pull">除此之外的，都是表现。假学习，就是把表现当成了学习：把“做出来了”，当成“学会了”。</p>
${p("这就带来一个很现实的问题：如果学会要过一段时间才看得出来，那学的时候，我们靠什么判断自己学会了没有？")}`,
    },
    {
      n: 4,
      chapter: 1,
      title: "先猜：哪一组学得更多？哪一组觉得自己学得更多？",
      body: `${p(
        "靠感觉。那我们就来测一下你的感觉。",
        `哈佛在一门物理入门课上做过一个随机实验。${ref("deslauriers")}内容完全一样，讲义也一样。A组听一位好评很高的老师讲课，讲得清清楚楚。B组分小组自己做题，卡住了，再听讲解。`,
      )}
<figure class="fig guess" data-guess="physics">
<div class="pair"><div><span>A组</span><p>一位好评很高的老师，讲得清清楚楚。</p></div><div><span>B组</span><p>分小组自己做题，卡住了，再听讲解。</p></div></div>
<div class="q"><p><b>01</b>哪一组在测验里学得更多？</p><div class="choices" data-q="learned" data-answer="B"><button type="button" aria-pressed="false" value="A">A组</button><button type="button" aria-pressed="false" value="B">B组</button></div></div>
<div class="q"><p><b>02</b>哪一组<em>觉得</em>自己学得更多？</p><div class="choices" data-q="felt" data-answer="A"><button type="button" aria-pressed="false" value="A">A组</button><button type="button" aria-pressed="false" value="B">B组</button></div></div>
<p class="guess-go"><button type="button" class="go" data-reveal="physics" disabled>看结果 ↓</button></p>
</figure>`,
    },
    {
      n: 5,
      chapter: 1,
      title: "学会的感觉和学会，常常是反着的",
      body: `<figure class="fig result" id="result-physics" data-hold="physics">
<p class="fig-title">自己做题的B组，和听讲的A组相比</p>
${bars(
  [
    { label: "真的学到", sub: "测验成绩", value: 0.46, text: "B组更高 · +0.46 SD", tone: "ink" },
    { label: "觉得学到", sub: "自我评价", value: -0.56, text: "B组更低 · −0.56 SD", tone: "adverse" },
  ],
  [-0.8, 0.8],
  "B组的测验成绩比A组高0.46个标准差，对自己学得怎么样的评价却低0.56个标准差。",
)}
<p class="feedback" data-feedback="physics" hidden></p>
<details><summary>看数字</summary><table><thead><tr><th></th><th>A · 听讲</th><th>B · 自己做</th></tr></thead><tbody><tr><th>真的学到（测验成绩）</th><td>更少</td><td>更多 · +0.46 SD</td></tr><tr><th>觉得学到（自我评价）</th><td>更多</td><td>更少 · −0.56 SD</td></tr></tbody></table><p>SD：标准差。Deslauriers等，PNAS，2019。${ref("deslauriers")}</p></details>
<div class="hold-cover"><p>两道题都猜完再看，或者<button type="button" data-reveal="physics">直接看结果</button>。</p></div>
</figure>
${p(
  "自己动手的B组，测验成绩明显更好，却觉得自己学得更少。听讲的A组学得更少，却觉得学得更多，还希望所有物理课都这样上。",
  "顺利，让人以为自己学会了；吃力，让人以为自己没学会。真相常常相反。研究者的解释是：自己做题多出来的那份吃力，被学生误读成了没学好，而它恰恰说明学习正在发生。",
  "这跟我们教AI课的观察很吻合。我们很注重给大家“guided mistakes”，但它会让学员烦躁、有挫败感，甚至觉得这门课教得不好。反而越顺畅的课，学员观感越好。可上完课，很容易只记得一个感受，没有真的学进去。",
  "那为什么吃力反而学得更多？",
)}`,
    },
    {
      n: 6,
      chapter: 1,
      title: "错得越多，学得越多",
      body: `${p("因为学习发生在你的想法和现实对不上的时候。")}
<figure class="fig"><ol class="loop"><li><b>01</b>先猜一个答案。</li><li><b>02</b>猜错了。</li><li><b>03</b>去想为什么错。</li><li><b>04</b>原来的想法被改掉。</li></ol></figure>
${p(
  "你先猜一个答案，猜错了，才会去想为什么错，脑子里原来的想法才会被改掉。如果你从来没猜，就没有对不上，也就什么都没变。",
  `心理学实验一再发现：先自己试着回答，哪怕答错，再看正确答案，比直接看答案学得更牢。${ref("kornell")}`,
)}
<aside class="note"><span>前提</span><p>错了，要有东西告诉你错在哪，错才有用。光是烦躁和挫败，不等于学习。</p></aside>
${p(
  "顺便说一句：刚才猜错的人，会比猜对的人更记得这个结果。这个机制，刚刚就在你身上发生了。",
  "所以，错得越多，学得越多。反过来，顺利的学习，经常是无效的学习。",
)}`,
    },
    {
      n: 7,
      chapter: 2,
      title: "AI最危险的时候，是它做对了",
      body: `${p("明白了这一点，就能看清教程和AI的问题。")}
<figure class="fig"><ol class="trio smooth">
<li><span>一堂讲得很好的课</span><strong>你在看别人思考。</strong></li>
<li><span>一个教程</span><strong>坑都有人替你踩过了。</strong></li>
<li><span>一个AI答案</span><strong>你还没卡住，它已经对了。</strong></li>
</ol><p class="scale"><span>一个比一个顺利</span><span>留给你犯错的机会越来越少 →</span></p></figure>
${p(
  "教程是打磨过的顺利。每一步都有人替你试过，坑都提前填好了，你照着做，一次就成。感觉学得很快，但你从头到尾没有机会错。我以前写过：教程教会你的东西，其实已经不值钱了；它帮你跳过的东西，反而最值钱。",
  "AI是更极致的顺利。你还没开始想，答案已经在屏幕上；你还没卡住，代码已经跑通了。",
  "所以，AI把东西做出来以后，最危险的不是它做错了，而是它做对了，你以为自己也会了。这个“我会了”的感觉，会让你停下来。你不会再自己试一遍，也不会换一道题检验。真学习最需要发生的地方，就这样被跳过了。",
  "有人把这件事量了出来。",
)}`,
    },
    {
      n: 8,
      chapter: 2,
      title: "练习做得更好了，学得却更差了",
      body: `${p(`这是一项随机实验，将近一千名土耳其高中生学数学。${ref("bastani")}练习阶段，一组随时可以问GPT-4。`)}
<figure class="fig">
<p class="fig-title">随时可以问GPT-4的学生，和没用AI的学生相比</p>
${bars(
  [
    { label: "练习成绩", sub: "随时可以问GPT-4", value: 48, text: "+48%", tone: "soft" },
    { label: "考试成绩", sub: "拿走GPT-4之后", value: -17, text: "−17%", tone: "adverse" },
  ],
  [-40, 140],
  "练习成绩高了48%；考试时不能用AI，成绩比从没用过AI的学生低17%。",
)}
</figure>
${p(
  "他们的练习成绩高了48%。可一到考试，谁都不能用AI，这组学生的成绩反而比从没用过AI的学生低了17%。",
  "练习变好了，学习变差了。同一批人，同样几周。而且在AI被拿走之前，谁也看不出来。",
)}
<aside class="note"><span>补一句</span><p>经济学出身的人得加一句：这是相对变化，是高中数学，是一个国家的一次实验，不是关于AI的普遍规律。这项研究里还有第三组，我后面再讲。</p></aside>
${p(`科幻作家特德·姜有个比喻：${ref("chiang")}用ChatGPT写作文，就像开着叉车进健身房。杠铃举起来了，肌肉没有长。学AI的人尤其要小心：你用来学AI的工具，恰好就是那台叉车。`, "而且，这件事不只发生在学校。")}`,
    },
    {
      n: 9,
      chapter: 3,
      title: "Fake learning和fake work，骗的是同一个东西：你对“进步”的感觉",
      body: `${p(
        "这件事，我是在工作里想明白的。",
        "我在腾讯带团队时，主要工作就是上传下达、互相翻译：把老板的战略翻译成下面的动作，再把大家的成果往上汇报。我做得还挺好，老板和下面的人都喜欢我，我也过得很舒服。但我越来越常问自己：我到底有什么进步？我创造了什么价值？",
      )}
<figure class="fig portrait-row"><img src="/home/portrait.webp" width="815" height="900" alt="孙煜征，白T恤，抱臂" loading="lazy" decoding="async"><div class="grid g2" role="table" aria-label="Fake work和fake learning">
<div class="g-row" role="row"><span class="g-key" role="rowheader">Fake work</span><span role="cell">用可见的动作，代替难以衡量的价值。</span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">Fake learning</span><span role="cell">用可见的结果，代替难以衡量的成长。</span></div>
</div></figure>
${p("我把这叫fake work：用可见的动作，代替难以衡量的价值。它是结构性的：知识工作的价值很难衡量，组织只好看进度、报告、会议这些看得见的动作，人也就开始生产动作。它最危险的也是那种感觉：开了一天会，累得要命，大脑告诉你今天很努力。事情没有前进，你却有了前进的感觉。")}
<p class="pull">Fake learning和fake work，骗的是同一个东西：你对“进步”的感觉。</p>
${p(
  "这种错觉是被训练出来的。在学校，老师和分数告诉你什么算好；在公司，老板和KPI告诉你什么算好。十几年下来，我们练得最熟的是让打分的人满意，却很少练过自己判断什么是真的好。我们被训练成了对价值不敏感的人。",
  "所以，从假学习里走出来的人，进了公司，会自然而然地做fake work。不是他们不努力，是他们只被训练过这一种努力。",
)}`,
    },
    {
      n: 10,
      chapter: 4,
      title: "学会一个新工具最像进步，几个月就过期",
      body: `${p(
        "在学校，分数是结果。学AI的人也有自己的分数：学会了几个工具，做出了几个原型。",
        "先说工具。学会一个新工具，搭好一个自动化，进步看得见：能截图，能发朋友圈，能写进简历。可AI工具几个月就换一轮。半年后，你熟悉的那些按钮和命令，很多已经不在了。",
      )}
<figure class="fig"><div class="grid g3" role="table" aria-label="你攒下的和留下来的">
<div class="g-row g-head" role="row"><span role="columnheader"></span><span role="columnheader">你攒下的<small>一个新工具、一个自动化、一个学完的教程</small></span><span role="columnheader">留下来的<small>习惯、方法和思维方式</small></span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">进步的感觉</span><span role="cell"><strong>马上就有</strong></span><span role="cell">几乎没有</span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">拿得出来吗</span><span role="cell">能截图，能发朋友圈，能写进简历</span><span role="cell">没法截图</span></div>
<div class="g-row" role="row"><span class="g-key" role="rowheader">半年以后</span><span role="cell" class="adverse-text">很多按钮已经不在了</span><span role="cell"><strong>都还在</strong></span></div>
</div><figcaption>学工具最有进步的感觉，却过期最快；养习惯最没有进步的感觉，却一直留在你身上。</figcaption></figure>
${p(
  "留下来的，是看不见的东西：习惯、方法和思维方式。比如，拿到一个模糊的需求，你会先把它拆成能检验的小步；结果不对，你会先找原因，而不是换个工具再试一遍。这些东西没法截图，却不会过期：换一个工具、过一年、换一个问题，它们都还在，正好通过我们开头那个检验。",
  "我培训过几千个科技公司的人，结论越来越明确：同一个模型，有人觉得它不靠谱，有人把它用成了稳定的工作系统。差别不在工具，在方法。",
  "那为什么大家还是爱攒工具？因为工具有一个清楚的“学会了”的时刻，方法没有，它是在做事里一点点长出来的。学工具最有进步的感觉，却过期最快；养习惯最没有进步的感觉，却一直留在你身上。又是反着的。",
)}`,
    },
    {
      n: 11,
      chapter: 4,
      title: "原型只需要在展示那一刻是对的，产品要在现实变化时一直是对的",
      body: `${p("再说原型。有了coding agent，一个下午就能做出一个像模像样的App。可原型最擅长的是顺利的情况：需求清楚，数据简单，用户只有你自己。")}
<figure class="fig"><div class="pair big"><div><span>原型 · 和agent一起的一个下午</span><p>需求清楚。数据简单。用户只有你自己。</p></div><div><span class="adverse-text">产品 · 面对别人</span><p>用户输入你没想到的东西。数据会出错。而且你不在旁边。</p></div></div></figure>
${p(
  "产品要面对别人。用户会输入你没想到的东西，数据会出错，需求下个月就变；而且用户用的时候，你不在旁边。我在《Don't build》里写过：demo只需要在展示的那一刻是对的，产品要在现实不断变化的时候，一直是对的。",
  "从原型到产品，每一步都是你的想法撞上现实：你以为用户会这样用，结果人家偏偏那样用。很多正确的决定，在看到错误的版本之前，根本不存在。错一次，学一次。",
  "原型让人觉得进步神速，恰恰因为它跳过了最该学的这一段。",
)}
<p class="pull">所以，AI时代的真学习，常常就在这两段路上：从学会一个工具，到养成一种做事的方法；从做出一个原型，到做成一个产品。</p>`,
    },
    {
      n: 12,
      chapter: 5,
      title: "同一个AI，不同的设计，不同的学习",
      body: `${p("那要不要少用AI？不用。回到那个数学实验，它还有第三组。")}
<figure class="fig guess" data-guess="tutor">
<p class="fig-title">先预测一下：同样是GPT-4，但只给提示、不给答案。考试的损失会……</p>
<div class="choices wide" data-q="tutor" data-answer="gone"><button type="button" aria-pressed="false" value="stays">保持</button><button type="button" aria-pressed="false" value="shrinks">缩小</button><button type="button" aria-pressed="false" value="gone">消失</button></div>
</figure>
<figure class="fig result" id="result-tutor" data-hold="tutor">
<p class="fig-title">GPT-4的两种用法，和没用AI的学生相比</p>
${bars(
  [
    { label: "叉车 · 练习", sub: "有问必答，直接给答案", value: 48, text: "+48%", tone: "soft" },
    { label: "叉车 · 考试", sub: "不用AI", value: -17, text: "−17%", tone: "adverse" },
    { label: "保护员 · 练习", sub: "只给提示，不给答案", value: 127, text: "+127%", tone: "soft", hidden: true },
    { label: "保护员 · 考试", sub: "不用AI", value: null, text: "没有显著损失", tone: "ink", hidden: true },
  ],
  [-40, 140],
  "直接给答案：练习高48%，考试低17%。只给提示：练习高127%，考试没有显著损失。",
)}
<p class="feedback" data-feedback="tutor" hidden></p>
<details><summary>看数字</summary><table><thead><tr><th></th><th>GPT-4当叉车</th><th>GPT-4当保护员</th></tr></thead><tbody><tr><th>怎么帮你</th><td>有问必答，直接给答案</td><td>只给提示，不给答案</td></tr><tr><th>练习（有帮助时）</th><td>+48%</td><td>+127%</td></tr><tr><th>考试（不用AI）</th><td>−17%</td><td>没有显著损失</td></tr></tbody></table><p>Bastani等，PNAS，2025。${ref("bastani")}</p></details>
<div class="hold-cover"><p>先在上面选一个，或者<button type="button" data-reveal="tutor">直接看结果</button>。</p></div>
</figure>
${p(
  "老师给这个GPT-4提供了标准解法和学生常犯的错误，要求它只给提示，不给答案。练习阶段，这组提升更多：127%。考试时，损失基本消失了。",
  "同一个AI，不同的设计。区别就在于：学生还有没有机会自己先想、自己犯错。",
)}
<p class="pull">这就是叉车和保护员的区别。叉车替你举；保护员站在你身后，让你自己举，只在你快撑不住的时候托一把。</p>`,
    },
    {
      n: 13,
      chapter: 5,
      title: "在关键处，选难的那条路",
      body: `${p(
        "把AI当保护员，就是在关键处，故意选难的那条路。",
        "但不是所有的难都值得选。那天和我一起讲的鸭哥，把配环境、申请token、调端口这类事叫作“假困难”：它们消耗意志力，给人一种“我在努力”的错觉，却不增长你的智慧。这类事，尽管交给AI。难，要留给真正的问题：这件事值不值得做，该怎么拆，做出来的东西好不好。",
      )}
<figure class="fig"><div class="pair"><div><span>假困难 · 交给AI</span><p>配环境、申请token、调端口。消耗意志力，不长本事。</p></div><div><span>真困难 · 留给自己</span><p>这件事值不值得做？该怎么拆？做出来的东西好不好？</p></div></div></figure>
<h3>然后是三步</h3>
<ol class="moves">
<li><b>先自己猜，再让AI动手。</b>写下你打算怎么做，你觉得哪里会出错，然后再看AI的结果。错了，才有得学。</li>
<li><b>撤掉帮助，再做一遍。</b>过一两天，关掉AI，自己重做一遍，或者讲给别人听。卡住的地方，就是还没学会的地方。</li>
<li><b>换一道题。</b>改一个条件：换一批数据，加一个约束，换一个用户。看你还会不会。</li>
</ol>
${p(
  "第一步，让你有机会犯错；后两步，是在检验你学会了没有：撤掉帮助、过一段时间、换一道题，你还会不会。",
  "做的时候，你会觉得更慢、更吃力。那不是退步，是学习在发生。",
)}`,
    },
    {
      n: 14,
      chapter: 6,
      title: "人人都能用AI做出漂亮的作品，作品就证明不了什么了",
      body: `${p(`换上经济学家的帽子。迈克尔·斯宾塞因为一个大家凭直觉就懂的道理拿了诺贝尔奖：一个信号，只有在难以伪造时才有用。${ref("spence")}`)}
<figure class="fig"><div class="grid g3" role="table" aria-label="你拿得出来的、过去说明什么、现在的成本">
<div class="g-row g-head" role="row"><span role="columnheader">你拿得出来的</span><span role="columnheader">过去说明</span><span role="columnheader">现在的成本</span></div>
<div class="g-row" role="row"><span class="g-key" role="cell">一篇漂亮的文章</span><span role="cell">你会写。</span><span role="cell"><strong>一句提示词。</strong></span></div>
<div class="g-row" role="row"><span class="g-key" role="cell">一份能通过测试的代码</span><span role="cell">你会写代码。</span><span role="cell"><strong>一次agent运行。</strong></span></div>
<div class="g-row" role="row"><span class="g-key" role="cell">满满一个GitHub的项目</span><span role="cell">你能做东西。</span><span role="cell"><strong>一个周末。</strong></span></div>
</div></figure>
<aside class="note"><span>我的预测</span><p>这是预测，不是已经测到的事实：假学习会先繁荣，做出结果从来没有这么便宜过；然后贬值。当每个申请者都有十个漂亮的AI项目，项目就区分不了任何人。就像fake work会先爆炸，再贬值。</p></aside>
${p("能证明你的，只剩撤掉帮助以后你还会的东西。面试官会不再只问你做了什么，而是问你为什么这样设计，哪里坏过，你会怎么改。")}`,
    },
    {
      n: 15,
      chapter: 6,
      title: "终结的，是一种误会",
      body: `${p(
        "假学习的终结，不是说分数、证书和教程会消失。它们还会在，也还有用。终结的是一种误会：把做出来了，当成学会了；把顺利，当成进步。",
        "对真心想学的人，这是个好消息。过去，要找一个随时在线、极有耐心、能看出你哪里想错的保护员，几乎不可能。现在它就在你手边。区别只在于，你让它替你举，还是让它看着你举。",
        "你可能注意到了，这一页有两次，我都是先请你猜，再给结果。猜错的那些，恰恰是你最记得住的。",
      )}
<p class="closing">你这个月用AI学会的一样东西，关掉AI、换一道题，<em>还会吗？</em></p>
<p class="signoff">学点真本事，做点真东西。</p>`,
    },
  ];
}

const INTRO = {
  en: p(
    "For your whole education, one assumption did a lot of quiet work: if you finished it, you learned it.",
    "Teachers graded on it. Employers hired on it. And you judged yourself by it.",
    "AI just broke that assumption. Anything you can finish, it can now finish for you. So here is a question most of us were never made to answer: what does it actually mean to have learned something? And why does learning so often feel backwards?",
  ),
  zh: p(
    "你受过的所有教育，都悄悄依赖着一个前提：做完了，就说明你学会了。",
    "老师按这个打分，公司按这个招人，你自己也按这个判断自己有没有进步。",
    "AI打破了这个前提。你能做完的，它现在都能替你做完。所以我想回答一个我们很少被逼着回答的问题：学会，到底是什么？为什么学习常常让人感觉是反的？",
  ),
};

// The physics guess has two questions; the tutor guess one. Feedback reinforces the talk's point that a
// wrong guess is the one you remember.
const FEEDBACK = {
  en: { sep: " ", right: "You got it.", wrong: "You guessed otherwise, so you’ll remember this one.", learned: "Learned more: Group B.", felt: "Felt it learned more: Group A.", tutor: "The loss essentially disappeared." },
  zh: { sep: "", right: "你猜对了。", wrong: "你猜错了，所以会记得更牢。", learned: "学得更多的是B组。", felt: "觉得自己学得更多的是A组。", tutor: "考试的损失基本消失了。" },
};

const STYLE = `
:root{--paper:#fbf9f5;--paper-2:#f3efe6;--ink:#141714;--ink-2:#3b3f3a;--muted:#6b6e67;--faint:#9a9b93;--rule:#e2dccf;--green:#238343;--green-text:#1c6b37;--forest:#0f3d23;--forest-2:#0b2f1b;--forest-glow:#1a5132;--on-forest:#f8f1e4;--on-forest-2:rgb(248 241 228/.78);--on-forest-3:rgb(248 241 228/.56);--adverse:#b4532a;--soft:#c9c2b3;--serif:"Noto Serif SC","Songti SC","STSong",Georgia,serif;--sans:"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--measure:700px;--wide:980px;--gut:clamp(18px,5vw,56px);color-scheme:light}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-padding-top:76px}body{margin:0;background:var(--paper);color:var(--ink);font:18px/1.8 var(--sans);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
html[lang="zh-CN"] body{font-size:17.5px;line-height:1.95}
/* Noto Serif SC is loaded in 700 and 900 only: Latin text uses the variable Source Serif, and regular-weight Chinese stays sans. */
html[lang="en"]{--serif:"Source Serif 4 Variable","Noto Serif SC",Georgia,serif}
a{color:inherit;text-decoration:none}h1,h2,h3,p,ol,ul,figure,blockquote{margin:0}img{max-width:100%}button{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--green);outline-offset:3px;border-radius:3px}
.skip{position:absolute;left:-9999px}.skip:focus{left:16px;top:12px;z-index:30;padding:8px 12px;background:var(--on-forest);color:var(--forest)}
.wrap{max-width:calc(var(--wide) + 2*var(--gut));margin:0 auto;padding-left:var(--gut);padding-right:var(--gut)}
.col{max-width:var(--measure)}
.stage{background:radial-gradient(110% 90% at 92% -10%,var(--forest-glow) 0%,rgb(26 81 50/0) 60%),linear-gradient(180deg,var(--forest) 0%,var(--forest-2) 100%);color:var(--on-forest)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:22px;font-size:14px}
.brand{display:inline-flex;align-items:center;gap:10px;font:700 16px/1 var(--serif);letter-spacing:.06em;color:var(--on-forest)}
.brand svg{width:38px;height:auto;fill:var(--on-forest)}
.bar nav{display:flex;gap:20px;color:var(--on-forest-2)}.bar nav a:hover{color:var(--on-forest)}
.hero{padding:clamp(56px,9vw,120px) 0 clamp(48px,7vw,92px)}
.kicker{font-size:14px;color:var(--on-forest-3)}.kicker span+span::before{content:"·";margin:0 8px}
.hero h1{margin-top:18px;font:900 clamp(44px,7.4vw,92px)/1.08 var(--serif);letter-spacing:-.01em;font-feature-settings:"palt"}
html[lang="zh-CN"] .hero h1{letter-spacing:.02em}
.hero .sub{margin-top:20px;max-width:24em;font:500 clamp(20px,2.4vw,28px)/1.5 var(--serif);color:var(--on-forest-2)}
.byline{margin-top:28px;font-size:15px;color:var(--on-forest-3)}
.actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px 22px;margin-top:30px;font-size:15px}
.play{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:8px;background:var(--on-forest);color:var(--forest);font-weight:700}
.play:hover{background:#fff}
.alt{color:var(--on-forest-2);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}.alt:hover{color:var(--on-forest)}
.toc{position:sticky;top:0;z-index:20;background:rgb(251 249 245/.95);-webkit-backdrop-filter:saturate(1.3) blur(10px);backdrop-filter:saturate(1.3) blur(10px);border-bottom:1px solid var(--rule)}
.toc .wrap{display:flex;align-items:center;gap:24px;height:60px}
.toc-title{flex:0 0 auto;font:800 16px/1 var(--serif)}
.toc nav{flex:1 1 auto;display:flex;gap:22px;overflow-x:auto;scrollbar-width:none;white-space:nowrap;font-size:14.5px;color:var(--muted)}.toc nav::-webkit-scrollbar{display:none}
.toc nav a{padding:19px 0 17px;border-bottom:2px solid transparent}.toc nav a:hover{color:var(--ink)}.toc nav a[aria-current=true]{color:var(--ink);border-bottom-color:var(--ink)}
.toc .play-sm{flex:0 0 auto;font-size:14px;font-weight:700;color:var(--green-text)}.toc .play-sm:hover{text-decoration:underline;text-underline-offset:4px}
.progress{position:absolute;left:0;bottom:-1px;height:2px;width:0;background:var(--ink)}
main{padding-bottom:24px}
.intro{padding-top:clamp(48px,6vw,80px)}
.intro p{font:400 clamp(20px,2vw,23px)/1.8 var(--serif);color:var(--ink)}
html[lang="zh-CN"] .intro p{font-family:var(--sans);font-size:clamp(19px,1.9vw,21px)}
.intro p+p{margin-top:16px}
.intro .meta{margin-top:26px;font:14px/1.7 var(--sans);color:var(--muted)}
.slide{padding-top:clamp(56px,7vw,96px)}
.slide-head{border-top:2px solid var(--ink);padding-top:14px}
.slide-kicker{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;font-size:13.5px;color:var(--muted)}
.slide-kicker b{font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
.slide-kicker a{margin-left:auto;color:var(--muted)}.slide-kicker a:hover{color:var(--green-text)}
.slide h2{margin-top:14px;max-width:24em;font:800 clamp(27px,3.4vw,42px)/1.28 var(--serif);font-feature-settings:"palt";text-wrap:balance}
.body{margin-top:26px}
.body>p,.body>h3,.body>ol.moves{max-width:var(--measure)}
.body>p{color:var(--ink-2)}
.body>p+p{margin-top:18px}
.body h3{margin-top:44px;font:800 22px/1.4 var(--serif)}
.ref{font-size:.68em;line-height:0;vertical-align:.55em;margin-left:1px}.ref a{color:var(--green-text);font-weight:700;padding:0 1px}
.pull{margin:34px 0;padding-left:22px;border-left:3px solid var(--ink);font:700 clamp(21px,2.2vw,26px)/1.6 var(--serif);color:var(--ink)}
.note{max-width:var(--measure);margin:30px 0;padding:16px 20px;background:var(--paper-2);border-radius:4px}
.note span{display:block;font-size:12.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.note p{margin-top:6px;font-size:16.5px;line-height:1.8;color:var(--ink-2)}
.fig{margin:36px 0;max-width:var(--wide)}
.fig figcaption,.fig-title{font-size:14.5px;line-height:1.7;color:var(--muted)}
.fig figcaption{margin-top:14px}
.fig-title{margin-bottom:14px;color:var(--ink-2);font-weight:600}
.grid{border-top:1px solid var(--ink)}
.g-row{display:grid;gap:4px 24px;padding:14px 0;border-bottom:1px solid var(--rule);align-items:baseline}
.g3 .g-row{grid-template-columns:minmax(120px,1fr) 1.3fr 1.3fr}
.g2 .g-row{grid-template-columns:minmax(120px,.6fr) 2fr}
.g-head{padding:10px 0 12px;font-size:13px;font-weight:700;letter-spacing:.04em;color:var(--ink)}
.g-head small{display:block;font-weight:400;letter-spacing:0;color:var(--muted)}
.g-row>span{font-size:17px;line-height:1.6;color:var(--ink-2)}
.g-head>span{font-size:13px}
.g-key{font-weight:700;color:var(--ink)!important}
.g-row strong{font:800 18px/1.5 var(--serif);color:var(--ink)}
.adverse-text,.adverse-text strong{color:var(--adverse)!important}
.trio{list-style:none;padding:0;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--ink)}
.trio li{padding:16px 22px 18px 0}
.trio li+li{padding-left:22px;border-left:1px solid var(--rule)}
.trio span{display:block;font-size:13px;font-weight:700;letter-spacing:.04em;color:var(--muted)}
.trio strong{display:block;margin-top:8px;font:800 20px/1.45 var(--serif)}
.smooth li:nth-child(2) strong{color:#4a4d48}.smooth li:nth-child(3) strong{color:var(--adverse)}
.scale{display:flex;justify-content:space-between;margin-top:10px;padding-top:8px;border-top:1px dashed var(--soft);font-size:13px;color:var(--muted)}
.loop{list-style:none;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid var(--ink)}
.loop li{position:relative;padding:16px 26px 16px 0;font:800 19px/1.45 var(--serif)}
.loop li b{display:block;font:700 13px/1 var(--sans);color:var(--muted);margin-bottom:10px}
.loop li:not(:last-child)::after{content:"→";position:absolute;right:8px;top:40px;font:400 20px/1 var(--sans);color:var(--faint)}
.pair{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--ink)}
.pair>div{padding:16px 24px 18px 0}
.pair>div+div{padding-left:24px;border-left:1px solid var(--rule)}
.pair span{display:block;font-size:13px;font-weight:700;letter-spacing:.04em;color:var(--muted)}
.pair p{margin-top:8px;font-size:17px;line-height:1.65;color:var(--ink-2)}
.pair.big p{font:800 21px/1.5 var(--serif);color:var(--ink)}
.portrait-row{display:grid;grid-template-columns:150px 1fr;gap:28px;align-items:end}
.portrait-row img{display:block;width:150px;height:auto}
.moves{list-style:none;padding:0;margin-top:18px;counter-reset:m}
.moves li{position:relative;padding:18px 0 18px 64px;border-top:1px solid var(--rule);color:var(--ink-2)}
.moves li:last-child{border-bottom:1px solid var(--rule)}
.moves li::before{counter-increment:m;content:counter(m);position:absolute;left:0;top:10px;font:900 40px/1 var(--serif);color:var(--ink)}
.moves b{color:var(--ink)}
html[lang="zh-CN"] .moves b{margin-right:4px}
.bars{display:grid;gap:10px;border-top:1px solid var(--ink);padding-top:16px}
.bar-row{display:grid;grid-template-columns:minmax(120px,190px) 1fr minmax(110px,170px);gap:16px;align-items:center}
.bar-label{font-size:15px;font-weight:700;line-height:1.35}.bar-label small{display:block;font-weight:400;font-size:13px;color:var(--muted)}
.bar-track{position:relative;height:30px;background:repeating-linear-gradient(90deg,transparent 0 calc(25% - 1px),rgb(20 23 20/.05) calc(25% - 1px) 25%)}
.bar-zero{position:absolute;top:-6px;bottom:-6px;width:1px;background:var(--ink)}
.bar-fill{position:absolute;top:4px;bottom:4px;border-radius:2px}
.bar-fill.ink{background:var(--ink)}.bar-fill.soft{background:var(--soft)}.bar-fill.adverse{background:var(--adverse)}
.bar-dot{position:absolute;top:9px;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:var(--ink)}
.bar-value{font:800 17px/1.3 var(--serif)}.bar-value.adverse{color:var(--adverse)}.bar-value.soft{color:var(--ink-2)}
.fig details{margin-top:16px;font-size:14.5px;color:var(--muted)}
.fig summary{cursor:pointer}.fig summary:hover{color:var(--ink)}
.fig table{margin-top:10px;width:100%;border-collapse:collapse;font-size:14.5px;font-variant-numeric:tabular-nums}
.fig th,.fig td{padding:8px 10px 8px 0;text-align:left;border-bottom:1px solid var(--rule);vertical-align:top}
.fig thead th{color:var(--ink);border-bottom:1px solid var(--ink)}
.fig details p{margin-top:8px}
.guess .pair{margin-bottom:18px}
.q{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 18px;padding:12px 0;border-top:1px solid var(--rule)}
.q p{font-size:17px;color:var(--ink)}.q p b{margin-right:12px;font-size:13px;color:var(--muted)}
.choices{display:flex;gap:8px}
.choices button{min-width:64px;padding:8px 16px;border:1px solid var(--ink-2);border-radius:6px;background:transparent;cursor:pointer;font-weight:700}
.choices button:hover{border-color:var(--green);color:var(--green-text)}
.choices button[aria-pressed=true]{background:var(--green);border-color:var(--green);color:#fff}
.choices.wide{margin-top:4px}
.guess-go{padding-top:14px;border-top:1px solid var(--rule)}
.go{padding:10px 18px;border:0;border-radius:6px;background:var(--green);color:#fff;font-weight:700;cursor:pointer}
.go[disabled]{background:var(--soft);cursor:default}
.result{position:relative}
.hold-cover{display:none}
.js .result.holding .bars,.js .result.holding details{filter:blur(7px);opacity:.45;pointer-events:none;user-select:none}
.js .result.holding .hold-cover{display:flex;position:absolute;inset:40px 0 0;align-items:center;justify-content:center;text-align:center}
.hold-cover p{padding:12px 18px;background:var(--paper);border-radius:6px;font-size:15px;color:var(--ink-2);box-shadow:0 0 0 1px var(--rule)}
.hold-cover button{border:0;background:none;padding:0;color:var(--green-text);font-weight:700;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.js .bar-row.hold{opacity:0}
.js .result.shown .bar-row.hold{opacity:1;transition:opacity .5s ease .2s}
.feedback{margin-top:14px;padding:10px 14px;border-left:3px solid var(--green);background:var(--paper-2);font-size:15.5px;color:var(--ink)}
.closing{margin:38px 0 0;max-width:20em;font:800 clamp(26px,3.2vw,38px)/1.45 var(--serif);color:var(--ink)}
.closing em{font-style:normal;color:var(--green-text)}
.signoff{margin-top:28px;font:700 17px/1.6 var(--serif);letter-spacing:.04em;color:var(--muted)}
.end{margin-top:clamp(72px,9vw,120px);border-top:2px solid var(--ink);padding-top:28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:36px 48px}
.end h2{font:800 20px/1.45 var(--serif)}
.end ol,.end ul{margin-top:12px;padding-left:1.2em;font-size:14.5px;line-height:1.7;color:var(--ink-2)}
.end li+li{margin-top:8px}
.end li a{color:var(--green-text);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;overflow-wrap:anywhere}
.end p{margin-top:10px;font-size:15px;line-height:1.8;color:var(--ink-2)}
.end p a,.end .go-link{color:var(--green-text);font-weight:700}
.end p a{text-decoration:underline;text-underline-offset:3px;font-weight:400}
.end .go-link{display:inline-block;margin-top:10px}
.end .wide-col{grid-column:1/-1}
footer{margin-top:72px;border-top:1px solid var(--rule);color:var(--muted);font-size:13px}
footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 24px;padding-top:22px;padding-bottom:40px}
footer nav{display:flex;flex-wrap:wrap;gap:6px 18px}footer a:hover{color:var(--green-text)}
html[lang="en"] .toc-title{display:none}
@media (max-width:820px){html[lang="en"] .toc-title{display:block}.toc nav{display:none}.toc .wrap{justify-content:space-between}.toc-title{flex:1 1 auto}}
@media (max-width:720px){
.g3 .g-row{grid-template-columns:1fr 1fr}.g3 .g-row>span:first-child{grid-column:1/-1}.g3 .g-head>span:first-child{display:none}
.g2 .g-row{grid-template-columns:1fr}
.trio,.pair,.loop{grid-template-columns:1fr}
.trio li,.trio li+li,.pair>div,.pair>div+div{padding:14px 0;border-left:0;border-top:1px solid var(--rule)}
.trio li:first-child,.pair>div:first-child{border-top:0}
.loop li{padding:12px 0;border-top:1px solid var(--rule)}.loop li:first-child{border-top:0}
.loop li:not(:last-child)::after{content:"↓";right:4px;top:auto;bottom:12px}
.bar-row{grid-template-columns:1fr auto;gap:6px 12px}.bar-track{grid-column:1/-1;grid-row:2}
.portrait-row{grid-template-columns:96px 1fr;gap:18px}.portrait-row img{width:96px}
.slide-kicker a{margin-left:0}
.moves li{padding-left:48px}.moves li::before{font-size:32px}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function script(lang: Lang): string {
  const f = FEEDBACK[lang];
  return `(()=>{document.documentElement.classList.add("js");const F=${JSON.stringify(f)};
const h=location.hash,m=h.match(/^#s(\\d+)$/)||h.match(/^#slide-0+(\\d+)$/);if(m){const t=document.getElementById("slide-"+(+m[1]));if(t){history.replaceState(null,"","#slide-"+(+m[1]));t.scrollIntoView()}}
const holds={};document.querySelectorAll(".result[data-hold]").forEach(r=>{holds[r.dataset.hold]=r;r.classList.add("holding")});
const answers={};
function reveal(name){const r=holds[name];if(!r)return;r.classList.remove("holding");r.classList.add("shown");const fb=r.querySelector("[data-feedback]");const g=document.querySelector('[data-guess="'+name+'"]');if(!fb||!g)return;const lines=[];g.querySelectorAll(".choices").forEach(c=>{const q=c.dataset.q,a=answers[q];if(!a)return;const ok=a===c.dataset.answer;lines.push((name==="physics"?(q==="learned"?F.learned:F.felt):F.tutor)+F.sep+(ok?F.right:F.wrong))});if(!lines.length)lines.push(name==="physics"?F.learned+F.sep+F.felt:F.tutor);fb.textContent=lines.join(F.sep);fb.hidden=false}
document.querySelectorAll(".choices").forEach(c=>c.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;c.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));answers[c.dataset.q]=b.value;const g=c.closest("[data-guess]");const name=g.dataset.guess;const all=[...g.querySelectorAll(".choices")].every(x=>answers[x.dataset.q]);const go=g.querySelector(".go");if(go)go.disabled=!all;if(name==="tutor"&&all)reveal("tutor")}));
document.querySelectorAll("[data-reveal]").forEach(b=>b.addEventListener("click",()=>{const name=b.dataset.reveal;reveal(name);if(b.classList.contains("go"))holds[name]?.scrollIntoView({behavior:"smooth",block:"start"})}));
const bar=document.querySelector(".progress"),main=document.querySelector("main");const tick=()=>{if(!bar||!main)return;const r=main.getBoundingClientRect(),p=Math.min(1,Math.max(0,-r.top/(r.height-innerHeight)));bar.style.width=p*100+"%"};addEventListener("scroll",tick,{passive:true});tick();
const links=[...document.querySelectorAll(".toc nav a")];if(links.length&&"IntersectionObserver"in window){const io=new IntersectionObserver(es=>{for(const e of es){if(e.isIntersecting){const c=e.target.dataset.chapter;links.forEach(a=>a.setAttribute("aria-current",String(a.dataset.chapter===c)))}}},{rootMargin:"-35% 0px -60% 0px"});document.querySelectorAll(".slide").forEach(s=>io.observe(s))}})();`;
}

export function renderFakeLearningFeature(ctx: FeatureContext): string {
  const { lang } = ctx;
  const t = COPY[lang];
  const all = slides(lang);
  const firstOfChapter = new Map<number, number>();
  for (const s of all) if (!firstOfChapter.has(s.chapter)) firstOfChapter.set(s.chapter, s.n);
  const slideHref = (n: number) => `${ctx.slides}#s${String(n).padStart(2, "0")}`;
  const sections = all
    .map(s => `<section class="slide" id="slide-${s.n}" data-chapter="${s.chapter}">
<div class="wrap">
<div class="slide-head"><p class="slide-kicker"><b>${String(s.chapter + 1).padStart(2, "0")}</b><span>${t.chapters[s.chapter]}</span><a href="${slideHref(s.n)}">${t.slideLink} ↗</a></p>
<h2>${s.title}</h2></div>
<div class="body">
${s.body}
</div>
</div>
</section>`)
    .join("\n");
  const nav = t.chapters.map((name, i) => `<a href="#slide-${firstOfChapter.get(i)}" data-chapter="${i}">${name}</a>`).join("");
  const notes = SOURCE_ORDER.map((key, i) => `<li id="note-${i + 1}"><a href="${SOURCES[key].url}" rel="noopener" target="_blank">${SOURCES[key][lang]}</a></li>`).join("");
  const reading = READING[lang].map(r => `<li><a href="${r.url}" rel="noopener" target="_blank">${r.title}</a></li>`).join("");
  const aboutBody = t.aboutBody.replace("SLIDES", ctx.slides).replace("ALT", ctx.alternatePath);
  const altUrl = `${SITE_URL}${ctx.alternatePath}`;
  const zhUrl = lang === "zh" ? ctx.url : altUrl;
  const enUrl = lang === "en" ? ctx.url : altUrl;
  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t.title}</title>
<meta name="description" content="${ctx.description.replaceAll('"', "&quot;")}">
<link rel="canonical" href="${ctx.url}">
<link rel="alternate" hreflang="en" href="${enUrl}">
<link rel="alternate" hreflang="zh-CN" href="${zhUrl}">
<link rel="alternate" hreflang="x-default" href="${zhUrl}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="立正 · Yuzheng Sun">
<meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${t.h1}">
<meta property="og:description" content="${ctx.description.replaceAll('"', "&quot;")}">
<meta property="og:url" content="${ctx.url}">
<meta property="og:image" content="${ctx.image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${t.h1}">
<meta property="article:published_time" content="2026-10-02">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t.h1}">
<meta name="twitter:description" content="${ctx.description.replaceAll('"', "&quot;")}">
<meta name="twitter:image" content="${ctx.image}">
<meta name="theme-color" content="#0f3d23">
<link rel="icon" href="/favicon.jpg">
<link rel="apple-touch-icon" href="/apple-touch-icon.jpg">
<link rel="preload" as="style" href="/fonts/serif.css" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/fonts/serif.css"></noscript>
<style>${STYLE.trim()}</style>
<script type="application/ld+json">${JSON.stringify(ctx.jsonLd).replace(/</g, "\\u003c")}</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<a class="skip" href="#main">${t.skip}</a>
<header class="stage">
<div class="wrap">
<div class="bar"><a class="brand" href="${t.home}" aria-label="${t.homeLabel}">${SEAL}<span>${t.name}</span></a>
<nav aria-label="${t.allDecks}"><a href="${t.decks}">${t.allDecks}</a><a href="${t.aboutHref}">${t.about}</a></nav></div>
<div class="hero">
<p class="kicker">${t.kicker.map(k => `<span>${k}</span>`).join("")}</p>
<h1>${t.h1}</h1>
<p class="sub">${t.sub}</p>
<p class="byline">${t.byline}</p>
<div class="actions"><a class="play" href="${ctx.slides}">▶ ${t.play}</a><a class="alt" href="${ctx.alternatePath}" hreflang="${t.editionLang}" lang="${t.editionLang}">${t.edition}</a></div>
</div>
</div>
</header>
<div class="toc"><div class="wrap"><span class="toc-title">${t.h1}</span><nav aria-label="${t.contents}">${nav}</nav><a class="play-sm" href="${ctx.slides}">▶ ${t.play}</a></div><div class="progress"></div></div>
<main id="main">
<div class="wrap intro"><div class="col">
${INTRO[lang]}
<p class="meta">${t.readTime}</p>
</div></div>
${sections}
<div class="wrap">
<div class="end">
<section class="wide-col" aria-labelledby="notes-title"><h2 id="notes-title">${t.notes}</h2><ol>${notes}</ol></section>
<section aria-labelledby="reading-title"><h2 id="reading-title">${t.reading}</h2><p>${t.readingIntro}</p><ul>${reading}</ul></section>
<section aria-labelledby="about-title"><h2 id="about-title">${t.aboutTitle}</h2><p>${aboutBody}</p>
<h2 style="margin-top:28px">${t.askTitle}</h2><p>${t.askBody}</p><a class="go-link" href="https://ask.lizheng.ai/">${t.askCta} →</a></section>
</div>
</div>
</main>
<footer><div class="wrap"><span>${t.footer} · ${t.name}</span><nav aria-label="${t.allDecks}"><a href="${t.decks}">${t.allDecks}</a><a href="${t.aboutHref}">${t.about}</a><a href="${t.home}">lizheng.ai</a></nav></div></footer>
<script>${script(lang)}</script>
</body>
</html>
`;
}

/** The sources this page cites, for the page's structured data. */
export function fakeLearningCitations(): Array<{ "@type": string; url: string; name: string }> {
  return SOURCE_ORDER.map(key => ({ "@type": "CreativeWork", url: SOURCES[key].url, name: SOURCES[key].en }));
}
