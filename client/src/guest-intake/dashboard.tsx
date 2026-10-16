import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Download,
  Search,
  X,
  Users,
  RefreshCw,
  Check,
  ArrowRight,
} from "lucide-react";
import type { IntakeRecord } from "@shared/guest-intake";
const statuses: Record<string, string> = {
  new: "待了解",
  contacted: "已联系",
  matched: "已匹配",
  archived: "已归档",
};
const members: Record<string, string> = {
  stay: "Stay Superlinear",
  builders: "AI Builders",
  community: "社区成员",
  other: "其他",
};
function date(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}
export default function AdminDashboard() {
  const [records, setRecords] = useState<IntakeRecord[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [membership, setMembership] = useState(""),
    [selected, setSelected] = useState<IntakeRecord | null>(null),
    [notes, setNotes] = useState(""),
    [nextStatus, setNextStatus] = useState("new"),
    [saving, setSaving] = useState(false),
    [notice, setNotice] = useState("");
  const closeButton = useRef<HTMLButtonElement>(null),
    lastTrigger = useRef<HTMLElement | null>(null);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const all: IntakeRecord[] = [];
      const seen = new Set<string>();
      let cursor: string | null = null;
      do {
        const res = await fetch(
          `/api/guest-intake?__route=list${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
          { cache: "no-store" }
        );
        const data = (await res.json()) as {
          records: IntakeRecord[];
          nextCursor?: string | null;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "暂时无法读取资料。");
        for (const record of data.records)
          if (!seen.has(record.id)) {
            all.push(record);
            seen.add(record.id);
          }
        const next = data.nextCursor || null;
        if (next === cursor && next)
          throw new Error("读取中断，请重新刷新资料。");
        cursor = next;
      } while (cursor);
      setRecords(all);
    } catch (e) {
      setError(e instanceof Error ? e.message : "暂时无法读取资料。");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (selected) {
      closeButton.current?.focus();
      const old = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = old;
        lastTrigger.current?.focus();
      };
    }
  }, [selected?.id]);
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return records.filter(
      r =>
        (!status || r.status === status) &&
        (!membership || r.membership === membership) &&
        (!q ||
          [
            r.name,
            r.industry,
            r.role,
            r.city,
            r.work,
            r.experience,
            ...r.topics,
            r.practice,
            r.cases,
            r.knownFor,
            r.links,
            r.connection,
            r.notes,
          ]
            .join(" ")
            .toLocaleLowerCase()
            .includes(q))
    );
  }, [records, query, status, membership]);
  function open(record: IntakeRecord) {
    lastTrigger.current = document.activeElement as HTMLElement;
    setSelected(record);
    setNotes(record.notes);
    setNextStatus(record.status);
    setNotice("");
  }
  async function save() {
    if (!selected || saving) return;
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch(
        `/api/guest-intake?__route=update&id=${selected.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes, status: nextStatus }),
        }
      );
      const data = (await res.json()) as {
        record: IntakeRecord;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "保存失败，请重试。");
      setRecords(rs =>
        rs.map(r => (r.id === data.record.id ? data.record : r))
      );
      setSelected(data.record);
      setNotice("已保存跟进记录");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "保存失败，请重试。");
    } finally {
      setSaving(false);
    }
  }
  function exportAll() {
    const columns: [string, keyof IntakeRecord][] = [
      ["称呼", "name"],
      ["联系方式类型", "contactMethod"],
      ["联系方式", "contact"],
      ["城市", "city"],
      ["领域", "industry"],
      ["岗位", "role"],
      ["现在在做什么", "work"],
      ["重要经历", "experience"],
      ["想聊的话题", "topics"],
      ["真实实践", "practice"],
      ["具体案例", "cases"],
      ["别人常问的问题", "knownFor"],
      ["更多资料", "links"],
      ["社区身份", "membership"],
      ["社区连接", "connection"],
      ["跟进状态", "status"],
      ["备注", "notes"],
      ["报名时间", "submittedAt"],
    ];
    const cell = (value: unknown) => {
      let text = Array.isArray(value) ? value.join(" / ") : String(value ?? "");
      if (/^[\s\u0000-\u001f]*[=+\-@]/u.test(text) || /^[\t\r\n]/u.test(text))
        text = "'" + text;
      return '"' + text.replaceAll('"', '""') + '"';
    };
    const csv =
      "\uFEFF" +
      [
        columns.map(c => cell(c[0])).join(","),
        ...records.map(r => columns.map(c => cell(r[c[1]])).join(",")),
      ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "Superlinear嘉宾池.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const detail = (label: string, value: string) => (
    <div className="detail-field">
      <span>{label}</span>
      <p>{value || "暂未填写"}</p>
    </div>
  );
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a href="/guest-intake">
          <img
            src="/guest-intake/brand/superlinear.png"
            alt="Superlinear Academy"
          />
        </a>
        <div>
          <a className="text-link" href="/guest-intake">
            打开报名页 <ArrowUpRight size={14} />
          </a>
          <button
            type="button"
            className="text-link"
            onClick={async () => {
              const response = await fetch("/api/ask-lizheng/auth/logout", {
                method: "POST",
              });
              if (response.ok) window.location.reload();
            }}
          >
            退出
          </button>
        </div>
      </header>
      <main>
        <div className="admin-title">
          <div>
            <div className="eyebrow">THE COMMUNITY GUEST BOOK</div>
            <h1>每一个值得展开的故事</h1>
            <p>在这里认识大家，也为下一场好对话找到合适的人。</p>
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={exportAll}
            disabled={loading || !!error}
          >
            <Download size={15} /> 导出全部资料
          </button>
        </div>
        <div className="stats">
          {[
            ["嘉宾池总人数", records.length],
            ["等待初步了解", records.filter(r => r.status === "new").length],
            [
              "已开始沟通",
              records.filter(r => r.status === "contacted").length,
            ],
            ["已匹配节目", records.filter(r => r.status === "matched").length],
          ].map(([label, value]) => (
            <div className="stat" key={String(label)}>
              <span>{label}</span>
              <strong>{String(value).padStart(2, "0")}</strong>
            </div>
          ))}
        </div>
        <div className="admin-toolbar">
          <label className="search-input">
            <Search size={16} />
            <input
              aria-label="搜索嘉宾资料"
              placeholder="搜名字、行业、话题，或某段经历…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="clear-search"
                aria-label="清空搜索"
                onClick={() => setQuery("")}
              >
                <X size={14} />
              </button>
            )}
          </label>
          <select
            aria-label="筛选跟进状态"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">全部状态</option>
            {Object.entries(statuses).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="筛选社区身份"
            value={membership}
            onChange={e => setMembership(e.target.value)}
          >
            <option value="">全部社区身份</option>
            {Object.entries(members).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="icon-button"
            aria-label="刷新资料"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={15} />
          </button>
        </div>
        {error ? (
          <div className="empty-state" role="alert">
            <p>{error}</p>
            <button className="text-link" onClick={load}>
              再试一次 <ArrowRight size={14} />
            </button>
          </div>
        ) : loading ? (
          <div className="loading-text" role="status">
            正在整理嘉宾资料…
          </div>
        ) : (
          <div className="table-wrap">
            {filtered.length ? (
              <table className="intake-table">
                <thead>
                  <tr>
                    <th>嘉宾 / 查看资料</th>
                    <th>领域与身份</th>
                    <th>想聊的话题</th>
                    <th>社区连接</th>
                    <th>跟进状态</th>
                    <th>报名时间</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td>
                        <button className="row-button" onClick={() => open(r)}>
                          {r.name}
                        </button>
                      </td>
                      <td>
                        {r.industry}
                        {r.role && (
                          <small className="table-subline">{r.role}</small>
                        )}
                      </td>
                      <td className="topic-preview">{r.topics.join(" / ")}</td>
                      <td>
                        <span className="member-tag">
                          {members[r.membership]}
                        </span>
                      </td>
                      <td>
                        <span className={`status-tag status-${r.status}`}>
                          {statuses[r.status]}
                        </span>
                      </td>
                      <td>{date(r.submittedAt)}</td>
                      <td>
                        <button
                          className="row-button"
                          aria-label={`查看${r.name}的资料`}
                          onClick={() => open(r)}
                        >
                          <ArrowUpRight size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <Users size={30} strokeWidth={1.3} />
                <h2>
                  {records.length
                    ? "还没找到匹配的故事"
                    : "下一段故事，正在路上"}
                </h2>
                <p>
                  {records.length
                    ? "试试别的话题关键词，或调整筛选条件。"
                    : "分享报名页之后，大家的经历和话题就会汇集到这里。"}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="admin-bottom">
          <span>
            当前显示 {filtered.length} 位 / 共 {records.length} 位
          </span>
          <span>报名资料仅供嘉宾沟通与节目匹配</span>
        </div>
      </main>
      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <section
            className="detail-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-name"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => {
              if (e.key === "Escape") setSelected(null);
              if (e.key === "Tab") {
                const items = Array.from(
                  e.currentTarget.querySelectorAll<HTMLElement>(
                    "button, textarea, select, a[href]"
                  )
                ).filter(el => !el.hasAttribute("disabled"));
                const first = items[0],
                  last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <div className="drawer-head">
              <h2 id="guest-name">{selected.name}</h2>
              <button
                ref={closeButton}
                className="icon-button"
                aria-label="关闭嘉宾资料"
                onClick={() => setSelected(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="drawer-meta">
              <span className="member-tag">{members[selected.membership]}</span>
              <span className={`status-tag status-${selected.status}`}>
                {statuses[selected.status]}
              </span>
              <span className="drawer-date">
                报名于 {date(selected.submittedAt)}
              </span>
            </div>
            <div className="detail-list">
              {detail(
                "联系方式",
                `${selected.contactMethod === "wechat" ? "微信" : "邮箱"} · ${selected.contact}`
              )}
              {detail(
                "领域 / 岗位 / 城市",
                [selected.industry, selected.role, selected.city]
                  .filter(Boolean)
                  .join(" · ")
              )}
              {detail("现在在做什么", selected.work)}
              {detail("重要经历", selected.experience)}
              {detail("真实实践", selected.practice)}
              {detail("具体案例", selected.cases)}
              {detail(
                "想聊的话题",
                selected.topics.map((t, i) => `${i + 1}. ${t}`).join("\n")
              )}
              {detail("别人常来问的问题", selected.knownFor)}
              {detail("更多资料", selected.links)}
              {detail("与Superlinear的故事", selected.connection)}
            </div>
            <div className="notes-box">
              <label htmlFor="notes">给这段故事，留一点跟进线索</label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => {
                  setNotes(e.target.value);
                  setNotice("");
                }}
                placeholder="适合什么节目？有哪些想继续追问的地方？"
                maxLength={5000}
              />
              <div className="notes-actions">
                <select
                  className="status-select"
                  aria-label="修改跟进状态"
                  value={nextStatus}
                  onChange={e => {
                    setNextStatus(e.target.value);
                    setNotice("");
                  }}
                >
                  {Object.entries(statuses).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  className="primary-button"
                  disabled={saving}
                  onClick={save}
                >
                  {saving ? "正在保存…" : "保存跟进"}
                  <Check size={14} />
                </button>
              </div>
              <p className="admin-message" role="status">
                {notice}
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
