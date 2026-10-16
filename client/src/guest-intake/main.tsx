import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import IntakeForm from "./intake-form";
import AdminDashboard from "./dashboard";
import "./intake.css";
function AdminGate() {
  const [status, setStatus] = useState(0);
  useEffect(() => {
    document.title = "嘉宾池管理 · Superlinear";
    let active = true;
    fetch("/api/guest-intake?__route=session", { cache: "no-store" })
      .then(res => {
        if (active) setStatus(res.status);
      })
      .catch(() => {
        if (active) setStatus(503);
      });
    return () => {
      active = false;
    };
  }, []);
  if (status === 200) return <AdminDashboard />;
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a href="/guest-intake">
          <img
            src="/guest-intake/brand/superlinear.png"
            alt="Superlinear Academy"
          />
        </a>
        <a className="text-link" href="/guest-intake">
          返回报名页 <ArrowUpRight size={14} />
        </a>
      </header>
      <main className="auth-card">
        <LockKeyhole size={30} strokeWidth={1.4} />
        <h1>这里是嘉宾池的工作台</h1>
        <p>
          {status === 0
            ? "正在核验管理权限…"
            : status === 401
              ? "使用已获授权的邮箱登录，查看报名资料、梳理话题，并记录每一次沟通。"
              : status === 403
                ? "当前登录邮箱没有嘉宾池的管理权限。请退出已有账号后，使用获授权的邮箱登录。"
                : "暂时无法核验管理权限，请稍后重试。"}
        </p>
        {(status === 401 || status === 403) && (
          <a
            className="primary-button"
            href="/api/ask-lizheng/auth/login?return=/ops/guest-intake"
          >
            登录管理工作台 <ArrowUpRight size={16} />
          </a>
        )}
        {status === 403 && (
          <button
            type="button"
            className="text-link"
            onClick={async () => {
              const res = await fetch("/api/ask-lizheng/auth/logout", {
                method: "POST",
              });
              if (res.ok) location.reload();
            }}
          >
            退出当前账号
          </button>
        )}
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  location.pathname.startsWith("/ops/") ? <AdminGate /> : <IntakeForm />
);
