# 主页的问问立正一章

2026-10-15 起，主页这一章是问问立正的入口，问答本身只在 ask.lizheng.ai 一处（ask-lizheng 仓库的页面）。立正同意体检报告里的建议：主页问答区和 ask 页是两套界面，每个功能都要做两遍。之前主页自己提问、显示回答的那一版在 git 历史里（2026-10-15 之前的 `client/src/components/home/AskLizheng.tsx`），经过见 [ask-lizheng.md](ask-lizheng.md) 各日期段落。

## 这一章有什么

- `client/src/components/home/Ask.tsx` 渲染 `#ask` 区块，在超线性学院（这座城）之后、对话之前，导航里叫「问问立正」；它把 Open Context 那一行作为 children 交给 `AskLizheng.tsx`，排在最后。
- `AskLizheng.tsx`：标题区（小标题「AI问答」、h2、两句介绍、「打开完整页面 →」，文案在 `content.ts` 的 `HOME_COPY[lang].ask`）；提问框（想明白、从哪读起两种问法）；框下的提问说明和「说明」（同步来的 `shared/ask-public-qa.js`，和 ask 页、隐私政策一字不差）；中文页的「别人在问什么」（最常问、最近问，先三条，「再看N个问题」到八条，再往后「看更多问题 →」，每条旁边可以点赞）；英文页没有列表，是两个例题，框里多一句「问题会在 ask.lizheng.ai 打开，那一页是中文，可以用英文问」。
- 宽屏（1040px 以上）问题框在左、列表在右，Open Context 在问题框下面的空白里；窄屏依次排下来。样式在同目录 `home.css` 的 `.lz-ask-*` 下。根锚点 `#ask-lizheng` 保留（登录完成后的返回地址 `safeReturnPath` 还指向它）。

## 问题怎么交给 ask 页

- 点「提问」（或 ⌘/Ctrl+Enter），新标签打开 `askPageUrl(问题, 问法)`：`https://ask.lizheng.ai/#q=<问题>`，从哪读起再加 `&mode=find`。问题放在 # 后面，不会到任何服务器、不进访问日志。打开后主页的框清空，回来再点不会问两遍；打不开新标签的浏览器在原页打开。
- ask 页（ask-lizheng `src/home-question.js`）读到 `#q=`：如果这一页是从 www.lizheng.ai 打开的，能发送时马上发出，和在那里点「提问」一样；从别处打开只放进输入框不发，所以链接永远不能替人提问。发出前改了问题或问法就不自动发。主页框下的说明和 ask 页的一样，所以从主页问就是在那条说明下问。
- 「别人在问什么」的每一条是一个链接，新标签打开它自己的网页（`discoveryLink`：Ops 给的 `share_url`，即 `ask.lizheng.ai/s/<日期>/<词>`，没有时 `/q/<编号>`）。
- 有人点进问题框或打开「说明」时，读一次 `/api/ask-lizheng/meta`：把「说明」里写回答的服务写成具体的名字（DeepSeek，以及它没及时回应时改由 OpenAI 写），也顺便叫醒回答服务。

## 不在这里的

回答、材料、材料地图、分享栏、保存图片和PDF、反馈问题、今天的次数、Founding 验证、结合我的处境：都只在 ask 页。主站的接口照旧：ask 页用 `/api/ask`（同一个转发函数 `api/ask-lizheng.ts`），登录用 `/api/ask-lizheng/auth/*`；`/api/ask-lizheng/ask` 这个主页用的入口已经没人调用，留着给更新之前打开的主页。

## 统计

- 主页记：这一章出现在屏幕上（`h_seen`）、列表出现和被看到（`d_shown`、`d_seen`）、点开一条（`d_open`）、看更多问题（`d_more`）；Vercel 事件 Ask Handoff（`from`：typed、example）、Ask Discovery Open/Sort/Expand/More/Vote。
- 一个问题只在 ask 页算一次（`ask` 计在 ask.lizheng.ai 那一行，Vercel 事件 Ask Question 的 `from` 是 `home`），所以 Ops「使用情况」里主页那一行的「提问」从 2026-10-15 起没有数；存档记录的 entrypoint 也都是 standalone。

## 测试与核对

`pnpm check`、`pnpm test:ask-lizheng`。改了交接的格式，要和 ask-lizheng 的 `src/home-question.js`、`tests/test_home_question.mjs` 一起改。本机看这一章：`/api/ask-lizheng/*` 在开发时转到 `ASK_LIZHENG_DEV_TARGET`（默认 127.0.0.1:8000 的回答服务），它没有「别人在问什么」的接口；要看列表，可以起一个返回线上 `discovery/lists` 和 `meta` 副本的小服务，把这个变量指过去。
