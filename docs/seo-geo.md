# lizheng.ai SEO / GEO 维护说明

最后核对：2026-07-21。

## 原则

GEO 不是一套独立于 SEO 的标签或提示词。对这个站最重要的是：

1. 关键事实与判断直接存在于初始 HTML，不依赖爬虫执行 JavaScript。
2. 中英文页面各有稳定 URL、self-canonical 和 reciprocal hreflang。
3. 人物、别名、履历、Seattle、当前项目和常见误解在可见页面中说清楚。
4. JSON-LD 只用来消除歧义，而不是堆关键词。所有页面共用 `https://www.lizheng.ai/#person`。
5. 日期、数字与书目信息必须可核对；不知道真实更新日期时，sitemap 宁可不写 `lastmod`。
6. `llms.txt` 是辅助索引，不代替网页正文。

## 当前路由

| 英文               | 中文                  | 任务                               |
| ------------------ | --------------------- | ---------------------------------- |
| `/`                | `/zh`                 | 人物主线                           |
| `/about`           | `/zh/about`           | 中性事实、履历、项目关系与口径澄清 |
| `/book`            | `/zh/book`            | 两本书                             |
| `/collab`          | `/zh/collab`          | 演讲、企业项目与长期合作           |
| `/collab/creators` | `/zh/collab/creators` | 播客与视频节目邀请                 |

`/zbs` 与 `/guests` 是中文为主的内容页。

## 构建与发布检查

- `pnpm check`
- `pnpm build`
- `vercel build --yes`
- 核心页初始 HTML 内存在唯一 `h1` 和完整正文。
- sitemap URL 与 canonical 一一对应，不含 `changefreq` 或 `priority`。
- 不存在的页面和资源返回 404，不是首页 HTML。
- `/zh`、`/zh/about`、`/zh/book` 与对应英文页有双向 hreflang。
- JSON-LD 可全部 parse，书的 ISBN、出版社与日期和可见正文一致。

## 发布后

1. 用线上 URL 重新检查 200 / 308 / 404、canonical、hreflang、robots 和 sitemap。
2. 只对本次真实更新的 URL 提交 IndexNow。验证文件是 `/689b140bbc4b350173aa574f3cb9609f.txt`。
3. 在 Google Search Console 检查索引与查询；在 Bing Webmaster Tools 检查 AI citations、grounding queries 和 citation share。
4. 在 Vercel Analytics 单独观察 ChatGPT 的 `utm_source=chatgpt.com` 引用流量。

## 站外剩余项

“课代表立正”的品牌词目前有两类站外冲突：

1. `www.superlinear.academy` 的未登录首页是动态 Feed。Circle sitemap 中还有大量公开成员自我介绍，搜索引擎可能把成员简介拼进 Academy 的摘要。应在 Circle 后台把未登录首页改成一张可控的公开 Page，并关闭 `Say Hello` 对未登录访客的可见性与用户 profile indexing；不要只改 meta description，也不要靠 `robots.txt` 隐藏已经收录的页面。
2. `lizheng.carrd.co`、`superlinear-web-link.lovable.app`、`superlinear-growth-hub.lovable.app` 和 `lizhengai.vercel.app` 仍在公开提供旧版履历与数字。先稳定新版主站，再对可控副本做服务器永久跳转；做不到真跳转的旧平台应 `noindex` 或下线，最后通过 Google / Bing 站长工具重新抓取。

不要在本仓库里用 canonical 假装能解决站外冲突。Circle 的社区访问权限也不能仅靠导航隐藏或 `robots.txt` 代替。

后续最值得新增的内容不是批量 SEO 文章，而是少量有原始日期、证据、后续发展和自我修正的观点页。在原始文字稿与证据未整理好之前，不为了“GEO”凭空生成。
