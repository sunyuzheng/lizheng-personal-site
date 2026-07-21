# lizheng.ai 开发指南

**站点**：[www.lizheng.ai](https://www.lizheng.ai) · **仓库**：[github.com/sunyuzheng/lizheng-personal-site](https://github.com/sunyuzheng/lizheng-personal-site)

---

## 本地开发

```bash
pnpm install   # 首次或依赖变更后
pnpm dev       # 启动开发服务器 → http://localhost:3000
```

---

## 目录结构

```
client/
  src/
    pages/        ← 页面：首页、嘉宾、书页、合作入口、播客邀请、404
    components/   ← UI 组件（ui/、guests/、collab/）
    contexts/     ← ThemeContext、LanguageContext
    hooks/        ← 自定义 hooks
    lib/          ← utils.ts, seo.ts
  public/
    avatars/      ← 嘉宾与推荐人头像
    book/         ← 《真本事》封面图
    yuzheng-sun-headshot.jpg ← 主持人资料与默认分享头像

shared/           ← 页面 metadata、嘉宾部署快照与共用数据类型
server/           ← 可选的 Express 静态服务（Vercel 线上不经过这一层）
api/              ← Vercel Edge Function（AI chat 接口）
scripts/          ← 构建辅助脚本
docs/             ← 数据结构和嘉宾维护说明
```

---

## 路由

| 路径                  | 页面                               |
| --------------------- | ---------------------------------- |
| `/`                   | 首页（主线、判断、实践、对话与书） |
| `/guests`             | 嘉宾目录                           |
| `/guests/:slug`       | 单个嘉宾详情                       |
| `/book`               | 两本书总览                         |
| `/zbs`                | 《真本事》单书页与 AI 顾问         |
| `/collab`             | 演讲、企业项目与长期合作入口       |
| `/collab/creators`    | 播客、视频与创作者邀请             |
| `/zh/collab`          | 中文合作入口                       |
| `/zh/collab/creators` | 中文节目邀请页                     |

---

## 常见更新任务

### 修改首页内容

编辑 `client/src/pages/Home.tsx`：

- `ideas` / `featuredPrediction` / `predictions` → 判断与公开记录
- `work` → AI Builders、Stay Superlinear 与企业项目
- `selectedGuests` / `endorsements` → 首页精选证据

页面的取舍与品牌关系见 `docs/content-system.md` 和 `docs/homepage-narrative-outline.md`。

### 修改合作页面

- 商业与组织合作：`client/src/pages/Collab.tsx`
- 播客与创作者邀请：`client/src/pages/CreatorCollab.tsx`
- 两页共享的搜索与分享文案：`shared/collab-meta.ts`
- 中文合作页使用真实路径 `/zh/collab` 与 `/zh/collab/creators`，便于分享预览；旧的 `?lang=zh` 链接仍可打开。

### 修改图片

将图片放入 `client/public/avatars/`（头像）或 `client/public/`（其他），
代码里用 `/avatars/filename.jpg` 这样的相对路径引用。

### 更新嘉宾数据

```bash
pnpm refresh:guests   # 同步嘉宾快照 → 类型检查 → 重新构建
```

详见 `docs/guests-maintenance.md`。

---

## 构建与部署

```bash
pnpm build        # 本地构建（Vite + 预渲染嘉宾页和合作页）
./deploy.sh       # 只检查、构建并推送已经审阅和提交的 main
```

**Vercel 环境变量**（在 Vercel Dashboard → Settings → Environment Variables 配置）：

| 变量                | 说明                                    |
| ------------------- | --------------------------------------- |
| `ANTHROPIC_API_KEY` | 《真本事》AI 顾问所用；纯静态页面不需要 |

---

## 技术栈

React 18 + TypeScript + Vite + Tailwind CSS v4 + Shadcn UI + Wouter + Express + Vercel
