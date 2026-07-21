# lizheng.ai 内容系统

本文档说明各个公开页面分别承担什么任务、哪些信息由谁维护，以及如何避免个人主页、产品站和 GitHub 彼此重复或口径漂移。

## 一条主线

个人主页的中心不是一份产品目录，也不是履历或粉丝数。它要回答的是：

> 一个判断怎样进入现实、接受反馈，再变成别人真正能使用的能力、作品和系统。

首页用一个更个人的问题开场：“从经济学到 AI：一个判断，最后能不能改变结果？”经历、公开判断、当前工作、书和访谈分别回答这个问题。`Build AI systems that compound` 仍然是 AI 工作的一条主张，但不再承担整个人主页的首屏定位。

## 品牌与产品的关系

| 名称                | 角色                                 | 首页如何出现           |
| ------------------- | ------------------------------------ | ---------------------- |
| Superlinear         | 整个教育、社区与实践体系的上位品牌   | 不单独做产品卡         |
| Superlinear Academy | 长期免费的学习与 builder 社区        | 导航与页尾的低门槛入口 |
| AI Builders         | 从使用 AI 到可靠构建的结构化课程     | `Work` 中的“建立能力”  |
| Stay Superlinear    | 持续学习、反馈、作品与关系的付费会员 | `Work` 中的“长期环境”  |
| Enterprise programs | 把方法接入团队工作流与组织约束       | `Work` 中的“组织实践”  |
| 书与公开对话        | 形成、公开检验和长期保存判断         | 独立内容章节与子页面   |

产品解释到“为什么属于这条主线”为止。价格、完整权益和转化论证留在各自产品站，避免个人主页变成 landing page。

## 页面分工

| 页面                  | 首要任务                           | 不承担的任务                           |
| --------------------- | ---------------------------------- | -------------------------------------- |
| `/`                   | 建立人物主线与选择性证据           | 罗列全部项目、全部嘉宾或完整销售论证   |
| `/book`               | 说明两本书分别解决什么问题         | 复制单书销售页                         |
| `/zbs`                | 介绍《真本事》、购买入口与 AI 顾问 | 保存发布期排名、价格和会过期的个人简介 |
| `/guests`             | 完整的访谈人物与内容档案           | 把所有嘉宾都包装成“科技领袖”           |
| `/collab`             | 演讲、企业项目、顾问与长期合作分流 | 接受播客邀请                           |
| `/collab/creators`    | 英文节目邀请与 host kit            | 泛合作入口                             |
| `/zh/collab/creators` | 面向中文播客与视频主的主要邀请页   | 产品销售页                             |

旧 PDF 已退出；`/collab/podcast-one-pager.pdf` 只保留永久跳转。节目主资料以 creator 页面为唯一公开版本。

## 事实来源

| 内容                                  | Canonical source                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 身份、履历、数字、公开措辞边界        | [`sunyuzheng/yuzheng-profile`](https://github.com/sunyuzheng/yuzheng-profile) 的 `facts.json` 与 `EVIDENCE.md` |
| 嘉宾名单与单集归属                    | [`sunyuzheng/kedaibiao-content-tools`](https://github.com/sunyuzheng/kedaibiao-content-tools) 的 `guests.json` |
| AI Builders 当前产品事实              | `ai-builders-2027` 产品仓库与 `ai-builders.com`                                                                |
| Stay Superlinear 当前权益、价格与状态 | `stay-superlinear` 产品仓库与 `staysuperlinear.com`                                                            |
| 网站页面取舍与信息层级                | 本仓库及本文档                                                                                                 |

网站会保留部署快照，但不把快照误认为上游事实源。可变数字必须带 `as_of`；“200+”统一写成“200+ 场公开对话”，不写成“200+ 位嘉宾”。

## 当前可用口径

最后核对：2026-07-21。

- 400K+ 跨平台关注者（数据截至 2026-07-12）
- 3,000+ 付费学员（数据截至 2026-07-12）
- 200+ 场公开对话（数据截至 2026-07-12）
- AI Builders Maven 评分 4.9/5（数据截至 2026-07-12）
- 600+ 公开学员项目帖（数据截至 2026-07-08）
- Superlinear Academy 免费社区 19,180 人（数据截至 2026-07-16；公开表达“近 20,000 人”）
- 2023 年 2 月、GPT-4 发布前首次写成《关于 ChatGPT 最重要的五个问题》
- 现居西雅图；线下工作的默认地点是西雅图
- Stay Superlinear canonical URL：`https://staysuperlinear.com`
- AI Builders canonical URL：`https://ai-builders.com`

## GitHub 的任务

GitHub 不复制整页个人叙事。它负责回答一个更窄的问题：这个人实际公开做出了什么、愿意把哪些系统交给别人使用？

Profile README 只需要：一句身份、当前三项工作、精选公共项目、书与公开内容入口、Seattle 和联系方式。置顶仓库优先选真实可用、边界清楚、README 完整的工具，不按 stars 机械排序。

## 更新检查

公开发布前依次检查：

1. 新数字是否已经进入 `yuzheng-profile/facts.json`，并附 `as_of` 与证据。
2. 是否误把 Statsig 被 OpenAI 收购写成孙煜征加入 OpenAI。
3. 是否混淆免费 Superlinear Academy 与付费 Stay Superlinear。
4. 是否把对话场次写成嘉宾人数。
5. 是否使用 `staysuperlinear.com`、`ai-builders.com` 和 `www.lizheng.ai`。
6. 页面 title、description、canonical、OG、sitemap 与正文是否一致。
7. `pnpm check` 与 `pnpm build` 是否通过。
8. 公开部署、GitHub 资料修改和归档操作是否已经单独审阅并获批。
