# Growth Data Analytics Playbook作者简介更新

核对日期：2026-10-13。用户于2026-10-14确认提交并上线；正文与SEO文案按已审阅版本发布。

## 发布目标与范围

- 仓库：`sunyuzheng/lizheng-personal-site`；本地分支：`book/authors-20261013`。
- 获得确认后合入`main`，由现有Vercel生产部署发布到`https://www.lizheng.ai`，面向公开读者及搜索引擎。
- 正文：`/book/growth-data-analytics-playbook#authors`，以及同页下载的EPUB和PDF。
- 中英文书目：`/book`、`/en/book`，补齐三位作者的署名与LinkedIn链接，更新标题与搜索摘要。
- 结构化数据：原书、中文版及章节共用作者姓名、稳定人物ID和LinkedIn身份链接；中文版目录页增加与可见简介一致的当前职位及机构。
- 书页导航增加“作者”入口；没有改动书中章节内容。

## 来源与事实取舍

| 作者 | 核对结果 | 来源 |
|---|---|---|
| Mengying Li | Hilbert的Fractional Head of Growth，2026年8月起；此前Braintrust的数据与增长工作已结束。保留与本书相关的历史经历。 | [LinkedIn](https://www.linkedin.com/in/mengyingli/)、[本人近况及Hilbert转发](https://www.linkedin.com/posts/hilbertsai_welcome-mengying-li-to-hilberts-growth-team-activity-7500586544345432064-90es) |
| Joe Kumar | Anthropic的Member of Technical Staff，2026年6月起；个人页标题仍为Data Engineer。写作“从事数据工程工作”，保留正式职位，不自行推断职级。 | [LinkedIn](https://www.linkedin.com/in/joekumar/)的标题、About与Experience |
| 孙煜征 | Superlinear Academy创始人兼CEO；原Statsig Principal Data Scientist兼布道师。 | [LinkedIn](https://www.linkedin.com/in/yuzhengsun/)；`yuzheng-profile/facts.json`及`BIOS.md` |

Mengying的Experience列表仍将Braintrust显示为Present，但本人近况明确表示已经离开；当前简介依据本人更近的自述和Hilbert的公开欢迎信息。临时项目与活动职务不进入长期书籍简介。Joe在Facebook/Meta的工作始于2015年、截至2026年，故把原书的“九年多”改成“十余年”。孙煜征与Statsig/OpenAI的时间关系沿用个人事实owner，不写成曾在OpenAI任职。

## 准确正文与SEO改动

三位作者的最终正文以[`12-authors.md`](../../content/books/growth-data-analytics-playbook-zh/chapters/12-authors.md)为准；网页HTML、EPUB和PDF从同一份源文生成。具体实现与元数据的完整差异见本地`git diff`。

### 中文书目

标题：Growth Data Analytics Playbook与《真本事》｜孙煜征的书

摘要：《Growth Data Analytics Playbook》由Mengying Li、Joe Kumar与孙煜征合著，讨论产品市场匹配、留存、增长核算与实验，中文版免费阅读和下载。另有孙煜征所著《真本事：从会工作到会赚钱》。

### 英文书目

标题：Growth Data Analytics Playbook & 真本事 · Yuzheng Sun

摘要：Growth Data Analytics Playbook by Mengying Li, Joe Kumar, and Yuzheng Sun: product-market fit, retention, and experimentation. Also explore Yuzheng's Chinese book 真本事.

## 维护

以后更新作者信息时，同步`chapters/12-authors.md`与`shared/book-authors.ts`中的当前身份，并重建作者HTML及两种电子书。`sameAs`用于连接LinkedIn身份；机构与正式职位只在确实展示当前简介的中文版页面输出，不用现职去改写2025年的出版归属。

## 本地验证

- `pnpm check`、`pnpm build`、`git diff --check`通过。
- 中英文书目与中文版目录页的初始HTML均包含三位作者的链接，且各有唯一H1；JSON-LD可正常解析，11个章节的作者ID保持一致。
- 书目、目录、章节及两种下载资源返回200，PDF与EPUB的Content-Type正确。
- PDF共173页；更新的第172–173页已渲染检查。EPUB和PDF都包含新简介。
- 浏览器已检查中文版作者区、中英文书目。预览截图在`output/review/authors-desktop.png`，文本diff在`output/review/author-update.diff`。
