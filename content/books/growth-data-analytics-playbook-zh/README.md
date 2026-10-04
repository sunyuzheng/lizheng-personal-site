# Growth Data Analytics Playbook 中文版

《Growth Data Analytics Playbook》（Mengying Li、Joe Kumar、孙煜征合著，Statsig Press 2025）的免费中文版。不是逐句翻译：按立正的中文表达习惯整本重写，保留原书全部框架、案例、图表和练习，几道练习补了计算过程或注意事项。改写由AI协助完成，立正授权在lizheng.ai免费发布。

线上地址：`/book/growth-data-analytics-playbook`（目录页）和 `/book/growth-data-analytics-playbook/<1–10|conclusion>`（每章一页）。`/book` 和首页代表作里的这本书都链接到这里，不另设书目。

## 这里有什么

| 路径 | 内容 |
|---|---|
| `book.json` | 章节顺序、每页的标题和搜索摘要、下载文件名、原书信息 |
| `chapters/*.md` | 正文。每章以 `# 第N章　标题` 开头，第二段是 `> 对应原书Chapter N: …` |
| `images/*.png` | 图（灰度，最宽1600px）。正文用 `![图X-Y　图注](images/fig-XX-YY.png)` 引用 |
| `cover/cover.html`、`cover/og.html` | 封面和分享图的设计稿，由Chromium截图生成 |
| `styles/` | EPUB和PDF的样式 |
| `html/` | **生成的**每章正文HTML，网站构建时由 `scripts/book-pages.ts` 套上页面 |

`client/public/book/growth-data-analytics-playbook/` 里的网页图片（WebP）、封面、分享图、EPUB和PDF也是生成的。

## 改了正文以后

```
python3 scripts/books/build_gdap_zh.py
```

需要本机有pandoc 3、Pillow、pypdf和带Playwright的Node（`scripts/books/render.mjs` 说明了Playwright从哪里找）。脚本会核对每章H1和 `book.json` 一致、引用的图都在，然后重新生成 `html/`、网页图片、封面、EPUB和PDF。把这些生成的文件一起提交；Vercel构建只读它们，不跑pandoc和Chromium。

正文改了，记得更新 `book.json` 的 `dateModified`（sitemap用它）。上线后对改过的地址提交IndexNow（见 `docs/seo-geo.md`）。

## 写法约定

- 中英文之间不加空格（立正的习惯）。
- 书里的「我们」指三位作者；只有第十章Marketplace的故事写成立正第一人称，那是他本人的经历。
- 原书的明显错误在中文版里直接改正，改法写在正文里（比如第4章、第7章、第8章、第9章练习后的说明）。
