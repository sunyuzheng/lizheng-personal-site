import { Fragment, useEffect, useRef, useState } from "react";
import type {
  OpsRecord,
  OpsRange,
  OpsSummary,
  OpsPage,
} from "../../../shared/ask-ops-reader";
import "./ask-ops.css";

type Summary = OpsSummary;
type Page = OpsPage;
const BASE = "/api/ask-lizheng/ops/";
const STATUS: Record<string, string> = {
  answered: "已回答",
  clarify: "需澄清",
  unsupported: "资料不足",
  "sources-only": "返回资料",
  error: "失败",
  cancelled: "取消",
  generating: "生成中 / 尚未确认结束",
};
const RANGES: [OpsRange, string][] = [
  ["today", "今天"],
  ["7", "近7天"],
  ["30", "近30天"],
  ["all", "当前全部"],
];
const number = (n: number) => n.toLocaleString("zh-CN");
const duration = (n: number | null) =>
  n === null ? "尚未结束" : (n / 1000).toFixed(1) + "秒";
const date = (v: string) =>
  new Date(v).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false,
  });
class OpsError extends Error {
  constructor(readonly status: number) {
    super("ops_unavailable");
  }
}

export default function AskOps() {
  const [session, setSession] = useState<
    "loading" | "login" | "forbidden" | "owner"
  >("loading");
  const [email, setEmail] = useState("");
  const [dataset, setDataset] = useState<"legacy" | "archive">("legacy");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [conversation, setConversation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [range, setRange] = useState<OpsRange>("7");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [page, setPage] = useState<Page>({
    records: [],
    next_cursor: null,
    truncated: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(0);
  const [logoutPending, setLogoutPending] = useState(false);
  const epoch = useRef(0);
  const sessionController = useRef(new AbortController());
  const readController = useRef<AbortController | null>(null);
  const exportController = useRef<AbortController | null>(null);
  const paging = useRef(false);

  function clear(next: "login" | "forbidden") {
    epoch.current++;
    sessionController.current.abort();
    sessionController.current = new AbortController();
    readController.current?.abort();
    exportController.current?.abort();
    setSession(next);
    setEmail("");
    setExpanded(null);
    setConversation("");
    setSummary(null);
    setPage({ records: [], next_cursor: null, truncated: false });
    setExporting(0);
    setLoading(false);
    paging.current = false;
  }
  async function api<T>(
    action: string,
    params: Record<string, string> = {},
    signal?: AbortSignal
  ): Promise<T> {
    const at = epoch.current;
    const response = await fetch(
      BASE + action + "?" + new URLSearchParams({ dataset, ...params }),
      {
        credentials: "same-origin",
        cache: "no-store",
        signal: AbortSignal.any([
          signal || sessionController.current.signal,
          AbortSignal.timeout(25_000),
        ]),
      }
    );
    if (at !== epoch.current) throw new DOMException("Cancelled", "AbortError");
    if (!response.ok) throw new OpsError(response.status);
    const value = await response.json();
    if (at !== epoch.current || signal?.aborted)
      throw new DOMException("Cancelled", "AbortError");
    return value;
  }
  function failure(e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    if (e instanceof OpsError && [401, 403].includes(e.status)) {
      clear(e.status === 401 ? "login" : "forbidden");
      setError(
        e.status === 401
          ? "登录已过期，请重新登录。"
          : "此账号没有后台访问权限。"
      );
    } else setError("暂时无法读取，请重试。已显示的数据可能不是最新的。");
  }
  async function checkSession() {
    setError("");
    try {
      const value = await api<{ owner: boolean; email: string }>("session");
      setEmail(value.email);
      setSession("owner");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (e instanceof OpsError && e.status === 401) {
        clear("login");
        setError("");
      } else {
        failure(e);
        if (!(e instanceof OpsError)) setSession("login");
      }
    }
  }
  useEffect(() => {
    sessionController.current = new AbortController();
    void checkSession();
    return () => {
      epoch.current++;
      sessionController.current.abort();
      readController.current?.abort();
      exportController.current?.abort();
    };
  }, []);
  async function refresh() {
    readController.current?.abort();
    const controller = new AbortController();
    readController.current = controller;
    setLoading(true);
    setError("");
    try {
      const [nextSummary, nextPage] = await Promise.all([
        api<Summary>("summary", { range }, controller.signal),
        api<Page>(
          "records",
          { range, ...(conversation ? { conversation } : {}) },
          controller.signal
        ),
      ]);
      if (!controller.signal.aborted) {
        setSummary(nextSummary);
        setPage(nextPage);
      }
    } catch (e) {
      if (!controller.signal.aborted) failure(e);
    } finally {
      if (readController.current === controller) {
        readController.current = null;
        setLoading(false);
      }
    }
  }
  useEffect(() => {
    exportController.current?.abort();
    if (session === "owner") {
      setSummary(null);
      setPage({ records: [], next_cursor: null, truncated: false });
      void refresh();
    }
  }, [session, range, dataset, conversation]);
  async function more() {
    if (!page.next_cursor || paging.current || loading) return;
    paging.current = true;
    setLoading(true);
    const controller = new AbortController();
    readController.current = controller;
    try {
      const next = await api<Page>(
        "records",
        {
          range,
          cursor: page.next_cursor,
          ...(conversation ? { conversation } : {}),
        },
        controller.signal
      );
      setPage(old => {
        const seen = new Set(old.records.map(r => r.record_id));
        return {
          ...next,
          records: [
            ...old.records,
            ...next.records.filter(r => !seen.has(r.record_id)),
          ],
        };
      });
    } catch (e) {
      if (!controller.signal.aborted) failure(e);
    } finally {
      if (readController.current === controller) {
        readController.current = null;
        paging.current = false;
        setLoading(false);
      }
    }
  }
  async function exportRecords() {
    if (exportController.current) return;
    const controller = new AbortController();
    exportController.current = controller;
    const at = epoch.current;
    setExporting(1);
    setError("");
    try {
      const records: OpsRecord[] = [];
      const seen = new Set<string>();
      const cursors = new Set<string>();
      let cursor = "";
      do {
        const next = await api<Page>(
          "export",
          { range, ...(cursor ? { cursor } : {}) },
          controller.signal
        );
        if (next.truncated) throw new Error("Incomplete snapshot");
        for (const row of next.records)
          if (!seen.has(row.record_id)) {
            seen.add(row.record_id);
            records.push(row);
          }
        setExporting(records.length || 1);
        cursor = next.next_cursor || "";
        if (cursor && cursors.has(cursor)) throw new Error("Repeated cursor");
        cursors.add(cursor);
      } while (cursor);
      if (controller.signal.aborted || at !== epoch.current) return;
      const blob = new Blob(
        [
          records.map(r => JSON.stringify(r)).join("\n") +
            (records.length ? "\n" : ""),
        ],
        { type: "application/x-ndjson;charset=utf-8" }
      );
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement("a"), {
        href: url,
        download: `ask-lizheng-${dataset}-${range}-${new Date().toISOString().slice(0, 10)}.jsonl`,
      });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      if (!controller.signal.aborted) {
        failure(e);
        if (!(e instanceof OpsError))
          setError(
            "导出未完成，未下载不完整文件。请重试；已过期记录无法恢复。"
          );
      }
    } finally {
      if (exportController.current === controller) {
        exportController.current = null;
        setExporting(0);
      }
    }
  }
  async function deleteRecord(r: OpsRecord) {
    if (
      deleting ||
      !window.confirm(
        `永久删除这条问答及回答来源？\n\n${r.question}\n\n删除后无法恢复。`
      )
    )
      return;
    setDeleting(true);
    const at = epoch.current;
    try {
      const response = await fetch(
        BASE +
          "delete?" +
          new URLSearchParams({ dataset: "archive", record_id: r.record_id }),
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          signal: AbortSignal.any([
            sessionController.current.signal,
            AbortSignal.timeout(8000),
          ]),
        }
      );
      if (at !== epoch.current) return;
      if (!response.ok) throw new OpsError(response.status);
      setExpanded(null);
      await refresh();
    } catch (e) {
      if (at === epoch.current) failure(e);
    } finally {
      setDeleting(false);
    }
  }
  async function logout() {
    clear("login");
    setError("");
    setLogoutPending(true);
    try {
      const r = await fetch("/api/ask-lizheng/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      });
      if (!r.ok) throw new Error();
      setLogoutPending(false);
    } catch {
      setError("内容已隐藏，但服务端退出尚未确认。请重新退出登录。");
    }
  }
  const t = summary?.totals;
  return (
    <main className="ask-ops">
      <header>
        <div>
          <a href="/" className="ops-wordmark">
            立正
          </a>
          <span> / 问问立正</span>
          <h1>运营后台</h1>
          <p>看见大家在问什么，以及回答做得怎么样。</p>
        </div>
        <div className="ops-private">
          仅自己可见
          {session === "owner" && (
            <>
              <small>{email}</small>
              <button onClick={() => void logout()}>退出登录</button>
            </>
          )}
        </div>
      </header>
      {logoutPending && (
        <button onClick={() => void logout()}>重新退出登录</button>
      )}
      {error && (
        <p className="ops-error" role="alert">
          {error}
        </p>
      )}
      {session === "loading" && <p aria-live="polite">正在核验权限…</p>}
      {(session === "login" || session === "forbidden") && (
        <section className="ops-login">
          <h2>
            {session === "forbidden" ? "此账号没有访问权限" : "登录运营后台"}
          </h2>
          <p>只有预先配置的运营账号能查看提问。社区会员身份不授予后台权限。</p>
          {session === "forbidden" ? (
            <button onClick={() => void logout()}>退出并换账号</button>
          ) : (
            <a
              className="ops-sign-in"
              href="/api/ask-lizheng/auth/login?return=%2Fops%2Fask-lizheng"
            >
              使用现有账号登录
            </a>
          )}
          <button className="ops-link" onClick={() => void checkSession()}>
            重新核验
          </button>
        </section>
      )}
      {session === "owner" && (
        <>
          <div className="ops-toolbar ops-datasets" aria-label="记录类型">
            <button
              aria-pressed={dataset === "archive"}
              disabled={loading || deleting}
              onClick={() => {
                setDataset("archive");
                setConversation("");
                setExpanded(null);
              }}
            >
              问答归档 · 长期保存
            </button>
            <button
              aria-pressed={dataset === "legacy"}
              disabled={loading || deleting}
              onClick={() => {
                setDataset("legacy");
                setConversation("");
                setExpanded(null);
              }}
            >
              旧版提问 · 原30天期限
            </button>
          </div>
          <div className="ops-toolbar">
            <div className="ops-ranges" aria-label="统计周期">
              {RANGES.map(([v, label]) => (
                <button
                  key={v}
                  aria-pressed={range === v}
                  disabled={loading}
                  onClick={() => setRange(v)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div>
              <button disabled={loading} onClick={() => void refresh()}>
                {loading ? "读取中…" : "刷新"}
              </button>
              {exporting ? (
                <button onClick={() => exportController.current?.abort()}>
                  取消导出 · {exporting}条
                </button>
              ) : (
                <button onClick={() => void exportRecords()}>
                  导出本期{dataset === "archive" ? "问答" : "提问"}
                </button>
              )}
            </div>
          </div>
          <p className="ops-note">
            北京时间 ·
            {dataset === "archive"
              ? "新提交的提问、完整回答和所用来源持续保存，直到你手动删除。匿名浏览器不等于独立人数；同一页面的连续提问按会话分组。"
              : "旧版只保存问题、状态和耗时，仍按原30天期限删除。旧版没有完整回答、匿名访客或对话分组，无法补算。"}
          </p>
          {(summary?.truncated || page.truncated) && (
            <p className="ops-error" role="alert">
              读取范围已达上限，以下数量与内容可能不完整。请刷新重试；完整导出暂不可用。
            </p>
          )}
          {t && summary && (
            <>
              <div className="ops-metrics">
                {[
                  [
                    "已保存提问",
                    number(t.questions),
                    "当前仍保留的本期记录，非历史总量",
                  ],
                  [
                    "已回答",
                    number(t.status.answered || 0),
                    "服务端结果，不代表用户已读完",
                  ],
                  [
                    "失败 / 取消",
                    number((t.status.error || 0) + (t.status.cancelled || 0)),
                    "只含已经写入的问题",
                  ],
                  [
                    "平均提问长度",
                    t.questions
                      ? Math.round(t.question_chars / t.questions) + "字"
                      : "—",
                    "只统计提问，不含补充背景",
                  ],
                  [
                    "平均处理耗时",
                    t.completed ? duration(t.duration_ms / t.completed) : "—",
                    "包含失败和取消",
                  ],
                  [
                    "匿名浏览器 / 会话",
                    summary.visitors === null
                      ? "未记录"
                      : `${number(summary.visitors)} / ${number(summary.conversations || 0)}`,
                    summary.conversations
                      ? `本期每会话${(t.questions / summary.conversations).toFixed(1)}次提问；不是人数`
                      : "旧版数据无法推算；刷新页面会开始新会话",
                  ],
                ].map(([label, value, note]) => (
                  <section key={label}>
                    <h2>{label}</h2>
                    <strong>{value}</strong>
                    <p>{note}</p>
                  </section>
                ))}
              </div>
              <section className="ops-chart">
                <div className="ops-section-heading">
                  <h2>每天的提问</h2>
                  <span>当前保留的记录</span>
                </div>
                <div
                  className="ops-bars"
                  role="img"
                  aria-label={summary.daily
                    .map(d => `${d.date}：${d.questions}次`)
                    .join("；")}
                >
                  {summary.daily.map((d, i) => (
                    <div
                      className="ops-bar"
                      key={d.date}
                      title={`${d.date} · ${d.questions}次`}
                    >
                      <span>{d.questions || ""}</span>
                      <div
                        style={{
                          height:
                            Math.max(
                              2,
                              (d.questions /
                                Math.max(
                                  1,
                                  ...summary.daily.map(d => d.questions)
                                )) *
                                100
                            ) + "px",
                        }}
                      />
                      <small>
                        {summary.daily.length <= 7 ||
                        i % Math.ceil(summary.daily.length / 7) === 0
                          ? d.date.slice(5)
                          : ""}
                      </small>
                    </div>
                  ))}
                </div>
                <div className="ops-results">
                  {Object.entries(STATUS).map(([s, label]) => (
                    <span key={s}>
                      {label}
                      <b>{number(t.status[s as keyof typeof t.status] || 0)}</b>
                    </span>
                  ))}
                </div>
              </section>
            </>
          )}
          <section className="ops-records">
            <div className="ops-section-heading">
              <h2>
                {conversation
                  ? "这段会话的问答"
                  : dataset === "archive"
                    ? "问答存档"
                    : "历史提问内容"}
              </h2>
              <span>{page.records.length}条已载入 · 最近在前</span>
            </div>
            {conversation && (
              <p className="ops-note">
                这段会话当前保留{page.conversation_turns || 0}
                次提问；上方指标仍统计所选周期的全部记录。
              </p>
            )}
            {conversation && (
              <button
                onClick={() => {
                  setConversation("");
                  setExpanded(null);
                }}
              >
                返回全部归档
              </button>
            )}
            {page.records.length ? (
              <div className="ops-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>时间</th>
                      <th>问题</th>
                      <th>结果 / 耗时</th>
                      <th>模型</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.records.map(r => (
                      <Fragment key={r.record_id}>
                        <tr>
                          <td>
                            <time>{date(r.created_at)}</time>
                            <small>{r.question_chars}字</small>
                          </td>
                          <td>
                            <p className="ops-question">{r.question}</p>
                            {dataset === "archive" && (
                              <button
                                className="ops-link"
                                aria-expanded={expanded === r.record_id}
                                onClick={() =>
                                  setExpanded(
                                    expanded === r.record_id
                                      ? null
                                      : r.record_id
                                  )
                                }
                              >
                                {expanded === r.record_id
                                  ? "收起回答"
                                  : "查看回答与来源"}
                                {r.turn_number
                                  ? ` · 第${r.turn_number}次提问`
                                  : ""}
                              </button>
                            )}
                          </td>
                          <td>
                            <span className={`ops-status ${r.status}`}>
                              {STATUS[r.status] || r.status}
                            </span>
                            <small>{duration(r.duration_ms)}</small>
                          </td>
                          <td>{r.model}</td>
                        </tr>
                        {expanded === r.record_id && (
                          <tr>
                            <td colSpan={4}>
                              <div className="ops-answer">
                                <div className="ops-section-heading">
                                  <h3>
                                    当次回答
                                    {r.answer_chars
                                      ? ` · ${r.answer_chars}字`
                                      : ""}
                                  </h3>
                                  <div>
                                    {r.conversation_id && (
                                      <button
                                        onClick={() => {
                                          setConversation(r.conversation_id!);
                                          setExpanded(null);
                                        }}
                                      >
                                        查看连续追问
                                      </button>
                                    )}
                                    <button
                                      className="ops-danger"
                                      disabled={deleting}
                                      onClick={() => void deleteRecord(r)}
                                    >
                                      永久删除这条问答
                                    </button>
                                  </div>
                                </div>
                                {r.answer ? (
                                  <>
                                    <p className="ops-answer-summary">
                                      {r.answer.summary}
                                    </p>
                                    {r.answer.sections.map((s, i) => (
                                      <section key={i}>
                                        <h4>{s.heading}</h4>
                                        <p>{s.body}</p>
                                        <small>
                                          {s.kind === "source"
                                            ? "材料观点"
                                            : s.kind === "application"
                                              ? "结合处境"
                                              : "AI综合"}{" "}
                                          · {s.source_ids.join("、")}
                                        </small>
                                      </section>
                                    ))}
                                    {r.answer.limitations && (
                                      <p>{r.answer.limitations}</p>
                                    )}
                                    {r.answer.clarifying_questions.length >
                                      0 && (
                                      <section>
                                        <h4>澄清问题</h4>
                                        {r.answer.clarifying_questions.map(
                                          (q, i) => (
                                            <p key={i}>{q}</p>
                                          )
                                        )}
                                      </section>
                                    )}
                                    {r.answer.followups.length > 0 && (
                                      <section>
                                        <h4>后续问题</h4>
                                        {r.answer.followups.map((q, i) => (
                                          <p key={i}>{q}</p>
                                        ))}
                                      </section>
                                    )}
                                    {r.answer.sources.length > 0 && (
                                      <section>
                                        <h4>当时采用的来源</h4>
                                        {r.answer.sources.map(source => (
                                          <details key={source.id}>
                                            <summary>
                                              {source.id} · {source.title}
                                            </summary>
                                            <p>
                                              {source.date} · {source.author}
                                            </p>
                                            <p>{source.reason}</p>
                                            <p>{source.excerpt}</p>
                                            <a
                                              href={source.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              查看原文
                                            </a>
                                            {source.public_copy_url && (
                                              <a
                                                href={source.public_copy_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                公开资料快照
                                              </a>
                                            )}
                                          </details>
                                        ))}
                                      </section>
                                    )}
                                  </>
                                ) : (
                                  <p>
                                    {r.unconfirmed
                                      ? "服务端尚未确认结束，没有归档完整回答。"
                                      : r.status === "generating"
                                        ? "回答还在生成。"
                                        : "这次没有生成可归档的完整回答。"}
                                    {r.error_code &&
                                      ` 错误标记：${r.error_code}`}
                                  </p>
                                )}
                                <small>
                                  归档的是当次服务端生成结果，不代表用户收到或读完。回答可能引用输入背景。
                                </small>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="ops-empty">
                {loading ? "正在读取提问…" : "本周期没有已保存的记录。"}
              </p>
            )}
            {page.next_cursor && (
              <button disabled={loading} onClick={() => void more()}>
                继续加载
              </button>
            )}
          </section>
          <footer>
            新归档包含提问、当次完整回答、来源和匿名会话标识；不关联邮箱或账号，不单独保存补充背景、提交的历史摘要和模型内部推理。旧版未保存的回答与已过期记录无法恢复。导出文件是私人本地副本，请妥善管理。
            {summary && <span>更新于{date(summary.generated_at)}</span>}
          </footer>
        </>
      )}
    </main>
  );
}
