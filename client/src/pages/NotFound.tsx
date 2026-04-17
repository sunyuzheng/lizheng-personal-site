import { Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F1A] text-zinc-100">
      <div className="text-center px-4">
        <div className="text-8xl font-bold text-amber-300 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-zinc-100 mb-3">页面不存在</h1>
        <p className="text-zinc-400 mb-8">
          你访问的页面可能已被移动或删除。
        </p>
        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-amber-300"
        >
          <Home className="w-4 h-4" />
          回到首页
        </button>
      </div>
    </div>
  );
}
