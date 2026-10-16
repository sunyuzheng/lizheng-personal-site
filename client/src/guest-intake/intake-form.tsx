import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  LockKeyhole,
  Mic2,
  Plus,
  X,
  CircleCheck,
  RotateCcw,
  Download,
} from "lucide-react";

type Draft = {
  name: string;
  contactMethod: "wechat" | "email";
  contact: string;
  city: string;
  industry: string;
  role: string;
  work: string;
  experience: string;
  topics: string[];
  practice: string;
  cases: string;
  knownFor: string;
  links: string;
  membership: string;
  connection: string;
  consent: boolean;
  website: string;
  submissionKey: string;
};
const freshDraft = (): Draft => ({
  name: "",
  contactMethod: "wechat",
  contact: "",
  city: "",
  industry: "",
  role: "",
  work: "",
  experience: "",
  topics: [""],
  practice: "",
  cases: "",
  knownFor: "",
  links: "",
  membership: "",
  connection: "",
  consent: false,
  website: "",
  submissionKey: "",
});
const STORAGE = "superlinear-miao-intake-v1";
const steps = ["认识你", "经历与实践", "想聊的话题", "确认提交"];
const membershipNames: Record<string, string> = {
  stay: "Stay Superlinear",
  builders: "AI Builders学员",
  community: "社区成员",
  other: "其他 / 还没加入",
};
const industries = [
  "产品与技术",
  "内容与传媒",
  "教育与研究",
  "设计与创意",
  "营销与增长",
  "创业与商业",
  "其他领域",
];
function Field({
  label,
  optional = false,
  hint,
  error,
  children,
  id,
}: {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <div className={`field ${error ? "field-error" : ""}`}>
      <div className="field-title">
        <label htmlFor={id}>{label}</label>
        {optional && <span>选填</span>}
      </div>
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p className="error-text" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export default function IntakeForm() {
  const [draft, setDraft] = useState<Draft>(freshDraft),
    [step, setStep] = useState(0),
    [ready, setReady] = useState(false),
    [saved, setSaved] = useState(false),
    [storageAvailable, setStorageAvailable] = useState(true),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState<string | null>(null),
    [restored, setRestored] = useState(false),
    [resetConfirm, setResetConfirm] = useState(false);
  const title = useRef<HTMLHeadingElement>(null),
    didNavigate = useRef(false);
  useEffect(() => {
    try {
      const value = localStorage.getItem(STORAGE);
      if (value) {
        const parsed = JSON.parse(value);
        if (parsed.draft && typeof parsed.draft.name === "string") {
          setDraft({
            ...freshDraft(),
            ...parsed.draft,
            consent: false,
            website: "",
            topics: Array.isArray(parsed.draft.topics)
              ? parsed.draft.topics.slice(0, 3).map(String)
              : [""],
            submissionKey: parsed.draft.submissionKey || crypto.randomUUID(),
          });
          setStep(Math.min(3, Math.max(0, Number(parsed.step) || 0)));
          setRestored(
            Boolean(
              parsed.draft.name || parsed.draft.work || parsed.draft.contact
            )
          );
        }
      } else setDraft(d => ({ ...d, submissionKey: crypto.randomUUID() }));
    } catch {
      setStorageAvailable(false);
      setDraft(d => ({ ...d, submissionKey: crypto.randomUUID() }));
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || result) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify({ draft, step }));
      setSaved(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [draft, step, ready, result]);
  useEffect(() => {
    if (didNavigate.current) title.current?.focus();
  }, [step, result]);
  const update = (key: keyof Draft, value: string | boolean | string[]) => {
    setDraft(d => ({ ...d, [key]: value }));
    setErrors(e => ({ ...e, [key]: "", submit: "" }));
  };
  function validate() {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!draft.name.trim()) next.name = "先告诉我们怎么称呼你吧。";
      if (!draft.contact.trim()) next.contact = "请留一个能联系到你的方式。";
      else if (
        draft.contactMethod === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact.trim())
      )
        next.contact = "请检查邮箱格式。";
      if (!draft.industry.trim()) next.industry = "请选择或填写你的领域。";
      if (!draft.work.trim()) next.work = "简单讲讲你现在正在做什么。";
      if (!draft.membership) next.membership = "请选择你和社区的连接。";
    }
    if (step === 2) {
      const topics = draft.topics
        .map(t => t.trim().toLocaleLowerCase())
        .filter(Boolean);
      if (!topics.length) next.topics = "至少留一个你想聊的话题吧。";
      else if (new Set(topics).size !== topics.length)
        next.topics = "这两个话题重复了，换一个方向试试？";
    }
    if (step === 3 && !draft.consent)
      next.consent = "请确认资料的使用范围后再提交。";
    setErrors(next);
    if (Object.keys(next).length)
      setTimeout(
        () =>
          document
            .querySelector<HTMLElement>(
              ".field-error input, .field-error textarea, .field-error button, .consent input"
            )
            ?.focus(),
        0
      );
    return !Object.keys(next).length;
  }
  function navigate(next: number) {
    didNavigate.current = true;
    setStep(next);
    setErrors({});
    setRestored(false);
  }
  async function submit() {
    if (!validate() || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/guest-intake?__route=submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          topics: draft.topics.filter(t => t.trim()),
        }),
      });
      const data = (await response.json()) as {
        id: string;
        error?: string;
        fieldErrors?: Record<string, string[]>;
      };
      if (!response.ok) {
        if (data.fieldErrors) {
          const fields = Object.fromEntries(
            Object.entries(data.fieldErrors).map(([key, value]) => [
              key,
              value[0],
            ])
          );
          const first = Object.keys(fields)[0];
          const target = [
            "name",
            "contact",
            "industry",
            "work",
            "membership",
          ].includes(first)
            ? 0
            : ["experience", "practice", "cases"].includes(first)
              ? 1
              : ["topics", "knownFor", "links", "connection"].includes(first)
                ? 2
                : 3;
          navigate(target);
          setErrors(fields);
          return;
        }
        throw new Error(
          data.error || "提交暂时没成功，请稍后重试。你的草稿还在。"
        );
      }
      setResult(data.id);
      didNavigate.current = true;
      try {
        localStorage.removeItem(STORAGE);
      } catch {}
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "网络似乎中断了，请重试。",
      });
    } finally {
      setBusy(false);
    }
  }
  function downloadCopy() {
    const text = `Superlinear嘉宾报名资料\n\n称呼：${draft.name}\n联系方式：${draft.contactMethod === "wechat" ? "微信" : "邮箱"} ${draft.contact}\n城市：${draft.city}\n领域：${draft.industry}\n岗位：${draft.role}\n社区连接：${membershipNames[draft.membership]}\n\n现在在做什么\n${draft.work}\n\n重要经历\n${draft.experience}\n\n真实实践\n${draft.practice}\n\n具体案例\n${draft.cases}\n\n想聊的话题\n${draft.topics
      .filter(Boolean)
      .map((t, i) => `${i + 1}. ${t}`)
      .join(
        "\n"
      )}\n\n别人常来问你的问题\n${draft.knownFor}\n\n更多资料\n${draft.links}\n\n与Superlinear的故事\n${draft.connection}\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "我的嘉宾报名资料.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const input = (key: keyof Draft, placeholder: string, maxLength = 120) => (
    <input
      id={key}
      name={key}
      value={String(draft[key])}
      onChange={e => update(key, e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      aria-invalid={!!errors[key]}
      aria-describedby={errors[key] ? `${key}-error` : undefined}
    />
  );
  const textarea = (key: keyof Draft, placeholder: string, rows = 4) => (
    <textarea
      id={key}
      name={key}
      value={String(draft[key])}
      onChange={e => update(key, e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={5000}
      aria-invalid={!!errors[key]}
      aria-describedby={`${key}-hint${errors[key] ? ` ${key}-error` : ""}`}
    />
  );
  const reviewItem = (label: string, value: string, edit: number) => (
    <div className="review-item">
      <div>
        <span>{label}</span>
        <button
          type="button"
          onClick={() => navigate(edit)}
          aria-label={`修改${label}`}
        >
          修改 <ArrowUpRight size={12} />
        </button>
      </div>
      <p>{value || "暂未填写"}</p>
    </div>
  );
  return (
    <div className="site-shell">
      <header className="site-header">
        <a href="/" className="brand" aria-label="返回立正网站">
          <img
            src="/guest-intake/brand/superlinear.png"
            alt="Superlinear Academy"
            width="177"
            height="43"
          />
        </a>
        <div className="header-right">
          <span className="intake-label">COMMUNITY VOICES</span>
          <a
            href="#about-intake"
            onClick={() => {
              const details = document.getElementById("about-intake");
              if (details instanceof HTMLDetailsElement) details.open = true;
            }}
          >
            了解招募 <ArrowUpRight size={15} />
          </a>
        </div>
      </header>
      <main className="intake-layout">
        <aside className="invitation">
          <div className="eyebrow">
            <span className="live-dot" /> 长期征集 · Superlinear社区嘉宾池
          </div>
          <h1>
            你的经历，
            <br />
            值得被
            <span className="title-highlight">
              听见
              <svg viewBox="0 0 220 20" aria-hidden="true">
                <path d="M4 13C52 1 149 2 215 9M11 17C74 8 160 8 208 12" />
              </svg>
            </span>
            。
          </h1>
          <p className="intro">
            那些你亲历的转折、做过的实践，
            <br className="desktop-break" />
            和反复想过的问题，都可能是一场好对话。
          </p>
          <div className="voice-art" aria-hidden="true">
            <div className="voice-label">
              <span className="record-dot" /> THE NEXT VOICE COULD BE YOURS
            </div>
            <div className="soundwave">
              {[
                17, 26, 15, 40, 25, 53, 82, 45, 64, 108, 78, 128, 100, 146, 105,
                67, 116, 83, 48, 72, 39, 60, 28, 43, 20, 30, 14,
              ].map((height, i) => (
                <span
                  key={i}
                  style={{
                    height: `${height}px`,
                    opacity: 0.45 + (1 - Math.abs(i - 13) / 14) * 0.55,
                  }}
                />
              ))}
            </div>
            <div className="voice-bottom">
              <Mic2 size={17} strokeWidth={1.5} />
              <span>从一段真实的经历开始</span>
              <span>01 — ∞</span>
            </div>
          </div>
          <div className="personal-note">
            <div className="note-mark">“</div>
            <p>
              不用先替自己筛选。
              <br />
              每一项几句话，像聊天一样写就好。
            </p>
            <div className="note-sign">
              <span className="signature">姜喵</span>
              <span>Superlinear社区商务负责人</span>
            </div>
          </div>
          <details className="after-details" id="about-intake">
            <summary>
              报名之后，会发生什么？ <ChevronDown size={16} />
            </summary>
            <ol>
              <li>
                <b>先了解你</b>
                <span>姜喵会梳理你的经历，寻找适合展开的部分。</span>
              </li>
              <li>
                <b>等待合适的对话</b>
                <span>遇到匹配的节目，再一起聊选题和故事。</span>
              </li>
              <li>
                <b>一起准备录制</b>
                <span>确定录制后，协助梳理案例、自我介绍与表达。</span>
              </li>
            </ol>
            <p>
              嘉宾池长期开放。Stay
              Superlinear会员优先进入梳理与匹配流程。报名后需等待合适的节目机会。
            </p>
          </details>
        </aside>
        <section
          className={`form-card ${result ? "is-success" : ""}`}
          aria-label="嘉宾报名表"
        >
          {result ? (
            <div className="success-content">
              <div className="success-icon">
                <CircleCheck size={38} strokeWidth={1.4} />
              </div>
              <div className="eyebrow">THANK YOU FOR SHARING</div>
              <h2 tabIndex={-1} ref={title}>
                故事已收到，
                <br />
                谢谢你让我们认识你。
              </h2>
              <p>
                你的资料已进入长期嘉宾池。姜喵会先了解你的经历，遇到合适的播客或话题时，通过你留下的方式联系你。
              </p>
              <div className="receipt">
                <span>报名回执</span>
                <strong>{result.slice(0, 8).toUpperCase()}</strong>
                <span>
                  请留意{draft.contactMethod === "wechat" ? "微信" : "邮箱"}消息
                </span>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={downloadCopy}
              >
                <Download size={17} /> 留存一份我的资料
              </button>
              <a
                className="text-link"
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noreferrer"
              >
                回社区，继续交流 <ArrowUpRight size={15} />
              </a>
            </div>
          ) : (
            <>
              <div className="form-top">
                <span>GUEST INTAKE</span>
                <span className="save-state" role="status">
                  {storageAvailable ? (
                    <>
                      <span className={saved ? "saved-dot" : "saving-dot"} />
                      {saved ? "草稿已保存在此设备" : "自动保存草稿"}
                    </>
                  ) : (
                    "草稿暂无法保存，请保持此页面打开"
                  )}
                </span>
              </div>
              <nav className="stepper" aria-label="填写进度">
                {steps.map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    className={`step ${i === step ? "active" : ""} ${i < step ? "complete" : ""}`}
                    aria-current={i === step ? "step" : undefined}
                    disabled={i > step}
                    onClick={() => navigate(i)}
                  >
                    <span>{i < step ? <Check size={13} /> : `0${i + 1}`}</span>
                    <b>{name}</b>
                  </button>
                ))}
              </nav>
              <form
                noValidate
                onSubmit={e => {
                  e.preventDefault();
                  if (step < 3) {
                    if (validate()) navigate(step + 1);
                  } else submit();
                }}
              >
                <div className="form-heading">
                  <span className="section-kicker">{`0${step + 1} / 04`}</span>
                  <h2 ref={title} tabIndex={-1}>
                    {
                      [
                        "先认识一下你",
                        "聊聊你走过的路",
                        "你想把什么带进对话？",
                        "这就是你的故事起点",
                      ][step]
                    }
                  </h2>
                  <p>
                    {
                      [
                        "从简单的介绍开始，让我们知道怎么找到你。",
                        "不必完整，挑你最想分享的部分就好。",
                        "一个好问题，或者一段想说很久的话，都可以。",
                        "最后看一眼。你可以随时回到前面修改。",
                      ][step]
                    }
                  </p>
                </div>
                {restored && (
                  <div className="restored">
                    <RotateCcw size={14} /> 上次的草稿还在，我们帮你接着写。
                  </div>
                )}
                {step === 0 && (
                  <div className="form-fields">
                    <div className="field-grid">
                      <Field id="name" label="怎么称呼你？" error={errors.name}>
                        {input("name", "你的名字或常用昵称", 80)}
                      </Field>
                      <Field id="city" label="你在哪座城市？" optional>
                        {input("city", "例如：上海 / 新加坡", 80)}
                      </Field>
                    </div>
                    <Field
                      id="contact"
                      label="怎样联系到你？"
                      error={errors.contact}
                    >
                      <div className="contact-input">
                        <select
                          aria-label="联系方式类型"
                          value={draft.contactMethod}
                          onChange={e => {
                            update("contactMethod", e.target.value);
                            update("contact", "");
                          }}
                        >
                          <option value="wechat">微信</option>
                          <option value="email">邮箱</option>
                        </select>
                        <input
                          id="contact"
                          name="contact"
                          type={
                            draft.contactMethod === "email" ? "email" : "text"
                          }
                          placeholder={
                            draft.contactMethod === "email"
                              ? "填写常用邮箱"
                              : "填写微信号，不是微信昵称"
                          }
                          value={draft.contact}
                          onChange={e => update("contact", e.target.value)}
                          maxLength={200}
                          aria-invalid={!!errors.contact}
                          aria-describedby={
                            errors.contact ? "contact-error" : undefined
                          }
                          autoComplete={
                            draft.contactMethod === "email" ? "email" : "off"
                          }
                        />
                      </div>
                    </Field>
                    <div className="field-grid">
                      <Field
                        id="industry"
                        label="你所在的领域"
                        error={errors.industry}
                      >
                        <input
                          id="industry"
                          list="industries"
                          placeholder="选择或输入你的领域"
                          value={draft.industry}
                          onChange={e => update("industry", e.target.value)}
                          maxLength={100}
                          aria-invalid={!!errors.industry}
                        />
                        <datalist id="industries">
                          {industries.map(x => (
                            <option key={x} value={x} />
                          ))}
                        </datalist>
                      </Field>
                      <Field id="role" label="你的岗位或身份" optional>
                        {input("role", "例如：产品经理、创业者", 120)}
                      </Field>
                    </div>
                    <Field
                      id="work"
                      label="现在，你在做什么？"
                      hint="你的工作、业务，或者最近正在投入的一个项目。"
                      error={errors.work}
                    >
                      {textarea(
                        "work",
                        "比如：我在一家教育公司做产品，最近在尝试把AI用进课程研发流程……",
                        3
                      )}
                    </Field>
                    <Field
                      id="membership"
                      label="你和Superlinear的连接"
                      hint="Stay Superlinear会员会优先进入嘉宾梳理和节目匹配流程。"
                      error={errors.membership}
                    >
                      <div
                        className="choice-grid"
                        role="radiogroup"
                        aria-label="你和Superlinear的连接"
                        onKeyDown={e => {
                          const keys = Object.keys(membershipNames);
                          const index = keys.indexOf(draft.membership);
                          if (
                            [
                              "ArrowRight",
                              "ArrowDown",
                              "ArrowLeft",
                              "ArrowUp",
                            ].includes(e.key)
                          ) {
                            e.preventDefault();
                            const offset =
                              e.key === "ArrowRight" || e.key === "ArrowDown"
                                ? 1
                                : -1;
                            const next =
                              (Math.max(0, index) + offset + keys.length) %
                              keys.length;
                            update("membership", keys[next]);
                            e.currentTarget
                              .querySelectorAll<HTMLButtonElement>("button")
                              [next]?.focus();
                          }
                        }}
                      >
                        {Object.entries(membershipNames).map(
                          ([value, label]) => (
                            <button
                              id={value === "stay" ? "membership" : undefined}
                              type="button"
                              role="radio"
                              aria-label={label}
                              aria-checked={draft.membership === value}
                              onClick={() => update("membership", value)}
                              className={
                                draft.membership === value ? "selected" : ""
                              }
                              key={value}
                            >
                              <span className="radio-dot">
                                {draft.membership === value && <span />}
                              </span>
                              {label}
                            </button>
                          )
                        )}
                      </div>
                    </Field>
                  </div>
                )}
                {step === 1 && (
                  <div className="form-fields">
                    <Field
                      id="experience"
                      label="哪段经历，对你特别重要？"
                      optional
                      hint="职业转型、创业、做成或失败过的事，或一个影响你的阶段。"
                    >
                      {textarea(
                        "experience",
                        "那时候发生了什么？你做了什么选择？后来有什么变化？",
                        4
                      )}
                    </Field>
                    <Field
                      id="practice"
                      label="你在哪些领域，有真实的实践？"
                      optional
                      hint="尤其欢迎AI × 你的行业、岗位或业务。没有AI经历也可以。"
                    >
                      {textarea(
                        "practice",
                        "你是怎么做的？它改变了原来的哪个流程？有哪些东西已经跑通了？",
                        4
                      )}
                    </Field>
                    <Field
                      id="cases"
                      label="能讲一个具体的案例吗？"
                      optional
                      hint="一个项目、一件真实发生的事、踩过的坑、做出来的结果都可以。"
                    >
                      {textarea(
                        "cases",
                        "从一个具体场景说起：当时的问题是什么，你试了什么，最后发生了什么？",
                        4
                      )}
                    </Field>
                    <div className="gentle-note">
                      <Mic2 size={18} />
                      <p>
                        不需要每一种都满足。
                        <br />
                        经历、思考、实践里，有一件你真的想讲的事就很好。
                      </p>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="form-fields">
                    <Field
                      id="topics"
                      label="你最想聊的1–3个话题"
                      hint="最近反复在想、特别有表达欲的问题。至少写一个。"
                      error={errors.topics}
                    >
                      <div className="topics">
                        {draft.topics.map((topic, i) => (
                          <div className="topic-row" key={i}>
                            <span>{`0${i + 1}`}</span>
                            <input
                              id={i === 0 ? "topics" : `topic-${i}`}
                              aria-label={`想聊的话题 ${i + 1}`}
                              placeholder={
                                [
                                  "如果给你一支麦克风，你最想聊什么？",
                                  "还有哪个问题，你想再聊深一点？",
                                  "再留一个想聊的方向",
                                ][i]
                              }
                              value={topic}
                              maxLength={300}
                              onChange={e =>
                                update(
                                  "topics",
                                  draft.topics.map((t, index) =>
                                    index === i ? e.target.value : t
                                  )
                                )
                              }
                            />
                            {i > 0 && (
                              <button
                                type="button"
                                aria-label={`删除话题 ${i + 1}`}
                                onClick={() =>
                                  update(
                                    "topics",
                                    draft.topics.filter(
                                      (_, index) => index !== i
                                    )
                                  )
                                }
                              >
                                <X size={15} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {draft.topics.length < 3 && (
                        <button
                          type="button"
                          className="add-topic"
                          onClick={() =>
                            update("topics", [...draft.topics, ""])
                          }
                        >
                          <Plus size={15} /> 再加一个话题
                        </button>
                      )}
                    </Field>
                    <Field
                      id="knownFor"
                      label="别人平时最常因为什么来找你？"
                      optional
                      hint="同事、朋友、同行，最爱问你什么问题？"
                    >
                      {textarea(
                        "knownFor",
                        "也许是请你判断一个方向、解决某类问题，或者听听你的经验……",
                        3
                      )}
                    </Field>
                    <Field
                      id="links"
                      label="还有哪里，可以多了解你一点？"
                      optional
                      hint="LinkedIn、小红书、公众号、个人网站、作品或过往采访，一行一条。"
                    >
                      {textarea(
                        "links",
                        "贴链接或写账号名都可以，没有也完全没关系。",
                        3
                      )}
                    </Field>
                    <Field
                      id="connection"
                      label="你与Superlinear，有什么真实的故事？"
                      optional
                      hint="一次学习、社区连接，或一门课程，有没有影响你的工作和选择？"
                    >
                      {textarea(
                        "connection",
                        "如果有，简单讲讲。之后我们也可以一起梳理。",
                        3
                      )}
                    </Field>
                  </div>
                )}
                {step === 3 && (
                  <div className="form-fields review">
                    <div className="review-person">
                      <span className="person-initial">
                        {draft.name.slice(0, 1)}
                      </span>
                      <div>
                        <h3>{draft.name}</h3>
                        <p>
                          {[draft.industry, draft.role, draft.city]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-link"
                        onClick={() => navigate(0)}
                      >
                        修改 <ArrowUpRight size={13} />
                      </button>
                    </div>
                    {reviewItem(
                      "联系方式",
                      `${draft.contactMethod === "wechat" ? "微信" : "邮箱"} · ${draft.contact}`,
                      0
                    )}
                    {reviewItem("现在在做什么", draft.work, 0)}
                    {reviewItem("重要经历", draft.experience, 1)}
                    {reviewItem(
                      "真实实践与案例",
                      [draft.practice, draft.cases]
                        .filter(Boolean)
                        .join("\n\n"),
                      1
                    )}
                    {reviewItem(
                      "想聊的话题",
                      draft.topics
                        .filter(Boolean)
                        .map((t, i) => `${i + 1}. ${t}`)
                        .join("\n"),
                      2
                    )}
                    {reviewItem("别人常来问你的问题", draft.knownFor, 2)}
                    {reviewItem("更多资料", draft.links, 2)}
                    {reviewItem(
                      "与Superlinear的连接",
                      [membershipNames[draft.membership], draft.connection]
                        .filter(Boolean)
                        .join("\n"),
                      2
                    )}
                    <div
                      className={`consent ${errors.consent ? "field-error" : ""}`}
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={draft.consent}
                          onChange={e => update("consent", e.target.checked)}
                        />
                        <span>
                          我同意将以上资料交由姜喵及Superlinear团队，用于嘉宾梳理、节目匹配和后续联系。资料不会直接公开；录制与对外介绍将另行沟通确认。
                        </span>
                      </label>
                      {errors.consent && (
                        <p className="error-text" role="alert">
                          {errors.consent}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={draft.website}
                    onChange={e => update("website", e.target.value)}
                  />
                </div>
                {errors.submit && (
                  <p className="submit-error" role="alert">
                    {errors.submit}
                  </p>
                )}
                <div className="form-actions">
                  {step > 0 ? (
                    <button
                      type="button"
                      className="back-button"
                      onClick={() => navigate(step - 1)}
                      disabled={busy}
                    >
                      <ArrowLeft size={16} /> 上一步
                    </button>
                  ) : (
                    <span className="required-note">
                      带「选填」的项目可以跳过
                    </span>
                  )}
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={!ready || busy}
                  >
                    {busy
                      ? "正在提交…"
                      : step === 3
                        ? "把我的故事交给姜喵"
                        : "继续填写"}
                    {!busy && <ArrowRight size={17} />}
                  </button>
                </div>
              </form>
              <div className="form-footnote">
                <LockKeyhole size={12} />
                <span>资料仅用于嘉宾沟通与匹配</span>
                <span className="separator-dot">·</span>
                <button type="button" onClick={() => setResetConfirm(true)}>
                  清空草稿
                </button>
              </div>
            </>
          )}
        </section>
      </main>
      <footer className="site-footer">
        <span>REAL PEOPLE. REAL STORIES. SUPERLINEAR.</span>
        <a href="/ops/guest-intake">
          嘉宾池管理 <ArrowUpRight size={12} />
        </a>
      </footer>
      {resetConfirm && (
        <div className="modal-backdrop" onClick={() => setResetConfirm(false)}>
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => {
              if (e.key === "Escape") setResetConfirm(false);
              if (e.key === "Tab") {
                const buttons =
                  e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
                if (e.shiftKey && document.activeElement === buttons[0]) {
                  e.preventDefault();
                  buttons[1]?.focus();
                } else if (
                  !e.shiftKey &&
                  document.activeElement === buttons[1]
                ) {
                  e.preventDefault();
                  buttons[0]?.focus();
                }
              }
            }}
          >
            <h2 id="reset-title">清空这份草稿？</h2>
            <p>本设备上已填写的内容会被移除，需要重新填写。</p>
            <div>
              <button
                type="button"
                className="back-button"
                autoFocus
                onClick={() => setResetConfirm(false)}
              >
                继续填写
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setDraft({
                    ...freshDraft(),
                    submissionKey: crypto.randomUUID(),
                  });
                  navigate(0);
                  setResetConfirm(false);
                }}
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
