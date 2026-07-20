# lizheng.ai 开发指南

**站点**：[lizheng.ai](https://lizheng.ai) · **仓库**：[github.com/sunyuzheng/lizheng-personal-site](https://github.com/sunyuzheng/lizheng-personal-site)

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
    data/         ← 静态数据（guest-data.ts、const.ts 等）
    contexts/     ← ThemeContext、LanguageContext
    hooks/        ← 自定义 hooks
    lib/          ← utils.ts, seo.ts
  public/
    avatars/      ← 头像图片（testimonials + endorsers）
    book/         ← 《真本事》封面图
    yuzheng-sun-headshot.jpg ← 主持人资料与默认分享头像

shared/           ← 前后端共用的数据类型和数据文件
server/           ← Express server（生产环境静态文件服务 + SPA routing）
api/              ← Vercel Edge Function（AI chat 接口）
scripts/          ← 构建辅助脚本
docs/             ← 数据结构和嘉宾维护说明
```

---

## 路由

| 路径               | 页面                         |
| ------------------ | ---------------------------- |
| `/`                | 首页（个人简介、评价、频道） |
| `/guests`          | 嘉宾目录                     |
| `/guests/:slug`    | 单个嘉宾详情                 |
| `/zbs` 或 `/book`  | 《真本事》书页               |
| `/collab`          | 演讲、企业项目与长期合作入口 |
| `/collab/creators` | 播客、视频与创作者邀请       |

---

## 常见更新任务

### 修改首页内容

编辑 `client/src/pages/Home.tsx`：

- `testimonials` 数组 → 学员评价
- `endorsements` → 推荐语
- `playlists` → 话题分类

### 修改合作页面

- 商业与组织合作：`client/src/pages/Collab.tsx`
- 播客与创作者邀请：`client/src/pages/CreatorCollab.tsx`
- 两页共享的搜索与分享文案：`shared/collab-meta.ts`

### 修改图片

将图片放入 `client/public/avatars/`（头像）或 `client/public/`（其他），
代码里用 `/avatars/filename.jpg` 这样的相对路径引用。

### 更新嘉宾数据

```bash
pnpm refresh:guests   # 拉取视频元数据 → 类型检查 → 重新构建
```

详见 `docs/guests-maintenance.md`。

---

## 构建与部署

```bash
pnpm build        # 本地构建（Vite + 预渲染嘉宾页和合作页）
./deploy.sh       # 提交 + 推送到 GitHub（Vercel 自动触发部署）
```

**Vercel 环境变量**（在 Vercel Dashboard → Settings → Environment Variables 配置）：

| 变量                        | 说明                           |
| --------------------------- | ------------------------------ |
| `VITE_APP_TITLE`            | 页面标题                       |
| `VITE_APP_LOGO`             | favicon 路径                   |
| `VITE_ANALYTICS_ENDPOINT`   | Umami 域名                     |
| `VITE_ANALYTICS_WEBSITE_ID` | Umami 站点 ID                  |
| `ANTHROPIC_API_KEY`         | Claude API key（AI chat 功能） |

---

## 技术栈

React 18 + TypeScript + Vite + Tailwind CSS v4 + Shadcn UI + Wouter + Express + Vercel
