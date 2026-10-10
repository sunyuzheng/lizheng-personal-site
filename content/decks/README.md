# 课件网页版

`/decks/<slug>` 是每套 deck 的网页版：顶部是标题、场合、受众和一句话要点，下面每一页幻灯片一节，左边是讲稿（deck里带讲稿时）或这页的文字，右边是这页的截图。幻灯片本身在页首「播放幻灯片」打开。目的是让搜索引擎和读者都能直接读到每一页的内容，访客在手机上也能顺着读下去，不用一页页翻幻灯片。

列表页 `/decks` 的卡片先打开网页版，「播放幻灯片」是第二个按钮。

## 这里有什么

| 路径 | 内容 |
|---|---|
| `sources.json` | 哪些 deck 有网页版、网页版地址、从哪个公开地址读、怎么翻页、讲稿在哪 |
| `pages/<文件名>.json` | **生成的**：每页的标题、文字块（带字号和位置）、链接和讲稿 |
| `../../client/public/deck-slides/<文件名>/` | **生成的**：每页一张 WebP（1280×720）和分享图 `og.jpg` |

文件名是网页版地址去掉 `/decks/`、斜杠换成连字符，例如 `/decks/fake-work-fake-learning/zh` → `fake-work-fake-learning-zh`。

网站构建时 `scripts/deck-pages.ts` 读这些文件和 `shared/deck-index.ts` 里的卡片，写出静态HTML；Vercel 构建不打开任何 deck。

## 内容归谁

每套 deck 的源文件、版本和讲者备注仍归它自己的项目。这里只保存从**公开幻灯片**读出来的东西，deck 改了就重新读一次，不在这里手改文字。读的范围也只到公开版：deck 仓库里没公开的讲稿、原始材料不会进来。

讲稿只在 `sources.json` 写了 `notes` 的 deck 里读。加之前先看一遍备注是不是讲给听众的话：

- 适合：哥伦比亚《假学习的终结》、两套AI副业、腾讯游戏战略，备注就是讲稿。
- 不适合：Amazon那套的备注是写给自己的提示（"Open with…""Say that…"）；《AI会让假工作先爆炸，再贬值》是录视频用的提词卡，备注是"照着说""停一下再翻页"。这两套只用幻灯片上的文字。

暂时没做网页版的（卡片照旧链到原来的地方）：

- 币安：原站特意设了不让搜索引擎收录（`noindex`、`robots.txt` 全禁），而且幻灯片是转成曲线的SVG，没有文字可读。
- 腾讯IEG AI Intensive Bootcamp：是一份每页标着 Confidential 的培训方案PDF。
- 只有回放或还在整理的几张卡（Pinterest、美团、小红书、腾讯IEG战略分析、TSVC×网易新闻）。

## 精做版

《假学习的终结》中英文两页（`/decks/fake-work-fake-learning`、`/zh`）不用自动版，用 `scripts/decks/fake-learning-feature.ts` 手写的版本：讲稿当正文，幻灯片上的表格和数字直接画在网页上，两处“先猜”可以点选，引用是编号注释。正文取自 deck 的讲稿和幻灯片，只改了“在聊天框里写A或B”这类现场用语；**这份文字在网站仓库里**，演讲改了要在这里同步改。`scripts/deck-pages.ts` 的 `FEATURES` 列出哪些地址用精做版；截图和 `pages/` 里的文件仍然照常读，用于分享图和检查。

## 重新读一套或全部

```
node scripts/decks/capture_decks.mjs                # 全部
node scripts/decks/capture_decks.mjs fake-work      # 地址里含这个词的
```

需要本机的 Playwright（默认用 npx 缓存里那份，`PLAYWRIGHT_MODULE` 可改）、Chromium（`PLAYWRIGHT_CHROMIUM` 可改）、`cwebp` 和 macOS 的 `sips`。读完把 `pages/` 和 `deck-slides/` 的改动一起提交。网页版的 sitemap 日期用的是读的那天（`capturedAt`）。上线后对改过的地址提交 IndexNow（见 `docs/seo-geo.md`）。

翻页方式（`nav`）：

- `reveal`：reveal.js 的 deck，用它的接口逐页跳，所有分步出现的内容一次显示。
- `keys`：按右方向键翻页，`active` 是当前页的选择器，`count` 可直接写页数。
- `call:show`：调用页面上的 `show(i)`。

`hide` 是截图前要藏起来的控件，`shot` 是只截某个元素（AIE那套），`viewport` 改窗口大小。

## 加一套新的网页版

1. deck 已经公开、已经在 `shared/deck-index.ts` 里有卡片。
2. 在卡片上加 `page: "/decks/<slug>"`；如果幻灯片原来就挂在 `www.lizheng.ai/decks/<slug>`，把幻灯片挪到 `/decks/<slug>/slides`（`vercel.json` 里先写 `/slides` 那条，再写 `/(.+)` 资源那条；卡片的 `href` 跟着改）。
3. 在 `sources.json` 加一条，跑上面的命令，看一遍截图和 `pages/` 里的文字。
4. `pnpm build` 会检查卡片的 `page` 和这里的文件一一对应。

## 旧链接

幻灯片原来的页内锚点（`#s05`、`#slide-05`、reveal 的 `#/4`）打开网页版时会跳到对应那一节。
