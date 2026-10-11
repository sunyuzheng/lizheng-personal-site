# 社区关系图：community.lizheng.ai

超线性学院社区的单独页面。每一盏灯是一位成员；两个人之间只要有人给对方的帖子或评论留过言、点过赞，就连上一条线。首页的「我们在建一座城」只画成员（`docs/community-city.md`），这个页面把成员之间的来往也画出来。

## 页面上有什么

- **位置**：越靠中间的人加入得越早，一圈一圈往外长，像年轮。每个人占的面积一样大，所以灯是均匀铺开的；某个月加入的人多，那一圈就厚。同一段时间加入的人里，来往多的人排在相近的方向（`ringLayout`，见下）。
- **三种线**：点赞之交（只有点赞）、聊过几句（至少一条评论或回复）、常来常往（双方都给对方留过言，并且评论不少于4条，或者跨了3个月以上；也包括双方都有来往、互动很多又跨月的）。前两种是暖白色，越常来往越亮；常来常往是薄荷绿。
- **团队的线**：管理员和版主（2026年10月有16个账号，含立正、鸭哥和官方号）几乎和所有人都有来往，他们的线全画出来会在中心汇成一片白。所以总览时不画团队的线，只画成员之间的；鼠标移到团队成员身上或点开时，他们的线才亮。页面上的「是成员之间自发的」百分比也按这个口径算：两头都不是团队账号的连接占多少。
- **开场**：从2024年8月开始，一个月一个月重放这座城长起来的过程，镜头跟着往外拉。点一下或拖动就跳到现在。底部时间轴可以拖到任何一个月，或者重播。
- **看一个人**：点一盏灯（或搜名字、随机遇见一位），其他线退暗，这个人的线全亮，镜头把TA和来往对象框在空出的地方；右侧（手机上是底部）列出TA来往最多的人、各是哪种来往、评论和点赞次数、从哪个月开始。点名单里的人可以接着走下去。网址变成 `#<public_uid>`，复制下来发给别人，打开就是这个人。
- **头像**：放大到一定程度，或点开一个人时，连接最多的人显示头像和名字；没有头像的人只显示名字。头像和名字作为一个整体摆放，不压页面文字，也不互相重叠，放不下的人只保留一盏灯，鼠标移上去能看到是谁。
- **动起来的地方**：没人操作时整座城慢慢转；最近两个月有过评论的连线上偶尔有光点流过；点开一个人时，光点沿着TA的线流向TA。系统设置「减少动态效果」时，不播开场、不转、不流动。

## 数据从哪里来

- **成员**：Circle Admin API 的成员列表（`community_members`，每次约255次请求）。和首页地图是同一次读取：每月的任务先跑这个页面，首页地图用 `--members-file` 复用刚读到的名单，不再读第二遍。
- **来往**：Circle Data API 的事件流（`community_events`）里的三种事件：`post.liked`（给帖子点赞）、`post.comment.liked`（给评论点赞）、`post.comment.created`（评论或回复）。评论连到帖子作者，回复连到被回复的那条评论的作者，点赞连到被点赞的帖子或评论的作者。
- **不算的**：给自己帖子或评论的互动、已经不是成员的人、私信、群聊和直播聊天。Data API 不能按事件类型筛选，每次读取会收到所有事件（大部分是加入和离开空间），脚本只留下这三种，读取时就丢掉名字、邮箱和正文。
- Data API 和 Admin API 是两套额度：Data API 每分钟600次、每次2,000条事件，不占 Admin API 的月度额度。2026年10月从头读完全部历史约1,300次请求、几分钟；本地缓存（`tmp/community-graph/interactions.ndjson`）之后只读新增的部分。
- **花费**：不花钱。Circle 套餐已含两个接口；Vercel Blob 上是一个约1.5MB的JSON（压缩传输约400KB）和一张约0.85MB的头像图。

## 怎么更新

- GitHub Actions 每月1日北京时间10:00（`.github/workflows/community-city.yml`）先跑 `pnpm community:graph --upload`，再跑首页地图。定时运行时如果线上数据还不到20天就跳过。也可以在 Actions 页面手动运行。
- 需要的密钥：`CIRCLE_ADMIN_API`、`CIRCLE_DATA_API`、`BLOB_READ_WRITE_TOKEN`，都放在 GitHub 仓库的 Actions secret 里；本地放在 `.env`。工作流日志只打印数量，不打印名字。
- 上传时如果新数据的人数或连接数比线上少10%以上，就不覆盖（确认无误加 `--force`）。头像图每次换新文件名，页面缓存不会把新数据配上旧头像。

## 手动运行

```bash
pnpm community:graph --fetch-only
pnpm community:graph
pnpm community:graph --upload
```

第一条只更新本地缓存；第二条生成 `client/public/community/graph.json` 和头像图（开发服务器读的就是它们）；第三条同时上传。第一次在一台新电脑上跑，可以加 `--seed=…/circle-data-analytics/private/events-part1.ndjson,…/events-part2.ndjson`，先从已有的导出里导入历史，只向 Circle 读之后的部分。成员名单缓存一周，`--refresh-members` 强制重读。`--no-avatars` 不做头像图。

本地看页面：`pnpm dev`，打开 `/community-app/`；英文版加 `?lang=en`。

## 数据格式

`scripts/community/output.ts`。成员按加入时间排序，所以第 i 位成员的半径就是 √((i+0.5)/总人数)，方向是 `angle[i]`（0–9999 表示一整圈）。连接按两端序号排序，`a` 存和上一条的差值。

```json
{ "version": 1, "generatedAt": "2026-10-11", "start": "2024-08", "months": 27, "count": 25311,
  "linked": [...], "names": [...], "joined": [...], "angle": [...], "heat": "…",
  "activity": [序号差, 帖子数, 评论数, …], "staff": [...],
  "pairs": { "a": [...], "b": [...], "tie": "1213…", "likes": [...], "comments": [...], "first": [...], "last": [...] },
  "avatars": { "file": "avatars-xxxxxxxxxx.webp", "columns": 32, "rows": 32, "cell": 64, "cells": [序号差, 格子, …] } }
```

`joined`、`first`、`last` 是从2024年8月起的月份序号。头像图只收连接最多的1,024位有头像的成员（64×64像素一格）。

## 布局

`ringLayout`（`scripts/community/graph.ts`）：每个人的半径由加入顺序决定；方向先按向日葵螺旋均匀撒开，再迭代40轮：每个人朝自己来往对象的方向靠（常来常往拉得最重，团队的线不参与），然后每120个同期加入的人重新均匀摊开一整圈，只保留谁挨着谁。只靠拉的话所有有来往的人会挤到同一边；每轮重新摊开，保持密度均匀。力导向布局（ForceAtlas2）试过：这个社区连得太密，又有几个人和几千人有来往，画出来是一团没有结构的白球，所以没有用。

## 页面怎么放在 community.lizheng.ai

和 ask.lizheng.ai 一样由主站托管：`client/community-app/` 是 Vite 的第二个入口，构建到 `dist/public/community-app/`；`scripts/prerender-community.ts` 写出英文页 `/community-app/en/`。`vercel.json` 里 `community.lizheng.ai` 的 `/` 和 `/en` 指向这两页，`www.lizheng.ai/community-app` 跳到 community.lizheng.ai。域名要在 Vercel 项目 `lizheng-personal-site_codex` 里加上 `community.lizheng.ai`（lizheng.ai 的解析在 Vercel，加域名时会自动加记录）。

需要立刻把某个人从图上拿掉时，把线上 `graph.json` 里对应的 `linked` 和 `names` 改成空字符串、从 `avatars.cells` 去掉TA，再用 `vercel blob put` 覆盖同一路径；TA的灯和线还在，但不再显示名字、头像和主页链接。
