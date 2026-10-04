# 在Statsig写的文章（中文版）

立正（Yuzheng Sun）2024年2月到2025年8月在Statsig博客（https://www.statsig.com/blog）发表的19篇英文文章的中文版。不是逐句翻译：按立正的中文表达习惯重写，保留原文的论证、例子、数字、公式和结论，正文图表全部保留。改写由AI协助完成，立正说明他是这些内容的权利方，授权在lizheng.ai公开。

线上地址：`/writing/statsig`（列表页）和 `/writing/statsig/<原文slug>`（每篇一页）。入口在关于页「经历」一节和中文页脚，首页不放。

## 这里有什么

| 路径 | 内容 |
|---|---|
| `YYYYMMDD-<slug>.md` | 正文。日期是原文发布日期（太平洋时间），slug和原文网址一致。开头是 `# 中文标题`，接着是 `- 原文标题：`、`- 原文链接：`、`- 发布日期：`、`- 作者：`，合著和活动回顾另有 `- 合著说明：` 或 `- 说明：` |
| `images/<slug>/` | 原图。正文用 `![简短描述](images/<slug>/<文件>)` 引用，下一段是斜体图注 `*图N　……*`；放回去的两张原文头图以 `00-header` 开头，图注以「原文头图」开头 |
| `manifest.json` | 每篇的作者（含页面上的身份）、原文地址、每张图的原图地址和来源类型、编辑说明（笔误怎么改的） |
| `collection.json` | 列表页的标题、介绍，每篇在列表与搜索结果里的一句话，以及两篇合著和一篇活动回顾页面顶上的说明（用立正的口吻；Markdown里的第三人称说明留给资料库） |
| `html/` | **生成的**每篇正文HTML和 `articles.json`，网站构建时由 `scripts/writing-pages.ts` 套上页面 |

`client/public/writing/statsig/` 里的网页图片（WebP）和分享图 `og.jpg` 也是生成的。

## 改了正文以后

```
python3 scripts/writing/build_statsig_zh.py
```

需要本机有pandoc 3、Pillow和带Playwright的Node（分享图用 `scripts/books/render.mjs` 截图；只改正文时可以加 `--no-share-image` 跳过）。脚本会核对每篇的标题、原文链接、日期和 `manifest.json` 一致，图注一张不少，然后重新生成 `html/` 和网页图片。把这些生成的文件一起提交；Vercel构建只读它们，不跑pandoc。

公式用 `$…$` 和 `$$…$$` 写，pandoc转成MathML，浏览器直接显示，不需要额外的脚本。

正文改了，记得更新 `collection.json` 的 `dateModified`（sitemap用它）。上线后对改过的地址提交IndexNow（见 `docs/seo-geo.md`）。

## 写法约定

- 中英文之间不加空格（立正的习惯）。
- 单人署名的文章，原文的「I」写成「我」；原文的「we」指Statsig时写成「我们（Statsig）」。
- 两篇合著文章（和Pushpendra Nagtode、和客座作者Alexey Komissarouk，原文都是对方署名在前）在文首写明合著者，并说明文中的「我们」指两位作者，不算立正一人的观点。页面头部按原文顺序列出作者。
- 《A/B实验平台怎样让数据科学变得更有意思》是Ronny Kohavi一场线上分享的回顾，文首说明引号里的原话和他讲的经历属于Ronny。
- 原文的明显笔误按原意改正，改法记在 `manifest.json` 的 `editorial_notes`。
- 有13张图的版权不属于立正或Statsig，或者看不出来源（`manifest.json` 里 `source_type` 为 `third-party` 或 `unknown`），立正看过后决定保留。

这份中文稿最早整理在 `~/Desktop/AI/_workspace/statsig-blog-zh/`（那里的README记了抓取范围：怎样确认这19篇是全部、排除了哪些页面）。同一批中文稿也会进入公开资料库lizheng-open-context。
