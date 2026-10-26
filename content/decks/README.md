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

- 适合：哥伦比亚《假学习的终结》、两套AI副业、腾讯游戏战略、通往AGI之路直播《差的不是人，是市场》，备注就是讲稿。
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
3. 在 `sources.json` 加一条，跑上面的命令，看一遍截图和 `pages/` 里的文字。每页的标题先取 deck 里那一页的 `data-title`，没有就取 `aria-label`（「第N页：…」），再没有就取页里的 h1/h2；只给讲者视图看的标签（「封面：」「转场：」）别放在 `data-title`，否则会成为网页版上的标题（通往AGI之路那套改成了 `data-pv-title`）。
4. `pnpm build` 会检查卡片的 `page` 和这里的文件一一对应。

## 可交互的一页

幻灯片上的一页如果代表一个在线的页面（比如社区地图），deck 可以在这页放一个带 `data-live="https://…"` 的元素（再加 `data-live-href` 给「在新页面打开」用，`data-live-label` 作标题）。读的时候会记下来，网页版这一页的图片上就多一个「打开互动地图」：点了才在图片的位置载入那个页面，旁边一行写怎么玩、可以在新页面打开。通往AGI之路那套第3页就是这样嵌 `city.lizheng.ai/window`（主页那扇看得见这座城的窗，单独成页，见 `docs/community-graph.md`）。deck 自己的按钮在截图时用 `hide` 藏起来。

## 旧链接

幻灯片原来的页内锚点（`#s05`、`#slide-05`、reveal 的 `#/4`）打开网页版时会跳到对应那一节。

## 不公开的 deck

有密码的分享入口也可以出现在列表里，但只放已公开的标题、受众和简介，不生成逐页网页版、截图或搜索索引：

- `/decks/tencent-judgment-engineering`：腾讯IEG《什么是好的战略分析？》，2026-07-09的30页v16正式版。卡片标记`passwordProtected`；回源仍由原交付项目`strategy-briefing-judgment-engineering`拥有，Vercel项目为`tencent-ai-native-builder-gap`。只有输入分享密码后才能解开幻灯片和PDF；PPTX、讲者备注和原始素材不在分享包中。
- 加密构建使用`scripts/decks/build-protected.mjs --source <本机PNG/PDF导出目录> --output <仅含加密产物的dist目录> --password-file <本机私有密码文件> --slug tencent-judgment-engineering --title '什么是好的战略分析？'`。输出目录必须为空或由同一构建拥有。密码默认生成至少20个随机字符，也可采用用户指定的密码（至少8个字符）；不写进命令、Git或浏览器存储。仅部署输出目录；先验证回源，再发布个人站转接和卡片。
- 新部署会移除回源当前版本的明文图片、`deck.pdf`与`deck.pptx`，旧的不可变部署地址不在这一变更的撤回范围内。加密包仍可能被下载，已持有密码者可保存解密后的内容。

有的幻灯片只给特定的人看，挂在 `/decks/<slug>/slides`，但不进 `shared/deck-index.ts`、没有网页版、不让搜索引擎收录：

- `/decks/same-tools-different-results`（Build with AI 第一节课，cohort 14，2026-10-17）：整份课件和讲稿加了密，打开先输密码。源文件和加密构建在 `superlinear/1-客户交付/decks/Maven Course/module1-cohort14-web/`（`scripts/build_protected.mjs`），回源是 Vercel 项目 `same-tools-different-results-2026`。`vercel.json` 里三条：`/decks/<slug>` 307 到 `/slides`，`/slides` 和 `/(.+)` 转到回源。
- `/decks/same-tools-different-results-zh`（上面那份的中文版，给 AI Builders 自学版录制，2026-10-19）：做法相同，密码不同。源文件和加密构建在 `superlinear/1-客户交付/decks/Maven Course/module1-zh-selfpaced-web/`，回源是 Vercel 项目 `same-tools-different-results-zh-2026`；它的生产地址被 Vercel 截成了 `same-tools-different-results-zh-202.vercel.app`（不是笔误），`vercel.json` 里的三条转到这个地址。
- `/decks/ai-answers-you-choose`（Build with AI 第四节课，cohort 14，2026-10-25）：做法和第一节相同，密码也相同。源文件和加密构建在 `superlinear/1-客户交付/decks/Maven Course/module4-cohort14-web/`，回源是 Vercel 项目 `ai-answers-you-choose-2026`（`ai-answers-you-choose-2026.vercel.app`）。
- `/decks/ai-answers-you-choose-zh`（上面那份的中文版，给 AI Builders 自学版录制，2026-10-26）：做法和第一节中文版相同，密码也和第一节中文版相同。源文件和加密构建在 `superlinear/1-客户交付/decks/Maven Course/module4-zh-selfpaced-web/`，回源是 Vercel 项目 `ai-answers-you-choose-zh-2026`。
- `/decks/ask-lizheng-one-day`（《问问立正一天上线》竖屏PPT，2026-10-26）：给小红书「AI玩家」小赛的短视频录屏用，立正点一下走一步、边讲边录。内容本来就要公开，所以没加密；同样不进列表、不让搜索引擎收录。源文件在 `superlinear/4-知识资产/video-scripts/projects/ask-lizheng-builder-space/vertical-deck/`（`tools/build_dist.sh` 生成 `dist/`），回源是 Vercel 项目 `ask-lizheng-one-day-2026`（`ask-lizheng-one-day-2026.vercel.app`）。
