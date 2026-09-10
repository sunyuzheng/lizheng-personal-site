# 首页访谈区：2026-09-10 统一封面与精选嘉宾

发布授权：用户本轮明确要求制作统一、unbranded 的 thumbnail，强调主题多样性、对话含金量与嘉宾分量，并授权完成检查后直接上线。发布通过 `main` 的 CI 和 Vercel 完成。基于 `origin/main` 的 `0278143258a46337e25efeb4d1b3deb10c168f8a`。发布页面为 `https://www.lizheng.ai/zh#conversations` 与英文首页对应位置，读者是公开网站访客。

预览：`http://127.0.0.1:4178/zh#conversations`；英文为 `http://127.0.0.1:4178/#conversations`。准确实现及双语文案见 `client/src/components/HomeConversations.tsx`。

## 为什么这样改

旧版用六张节目封面，封面的字号、配色、描边、人物数量和构图彼此竞争。它们是为各自平台的信息流设计的；放在个人主页上，读者先看到封面包装，然后才能辨认嘉宾。

最终版采用统一的 16:10 封面：浅灰绿色底，左侧主题分类与短标题，右侧真实肖像；封面下面列姓名与关键身份。主题取自原片标题、封面和内容，不以平台式悬念作为主要吸引力。网站原生文字与照片分层，文字在窄屏保持清楚，也能由搜索和辅助技术读取。肖像以 CSS 灰阶和轻微绿色叠色与网站协调，悬停有克制的放大。宽桌面四栏、中屏双栏、手机单栏，每个完整卡片可点击，八位直接展示。

这既呈现公开对话的分量，也解释立正与嘉宾聊什么。名气不是唯一的筛选条件：研究、创业与产品、认知与教育三个方向，应当一起支持个人主页“学点真本事，做点真东西”的主张。

## 页面文案与中文名单

- 眉题：200+场公开对话
- 标题：和他们，把问题聊透。
- 说明：研究是怎么突破的，产品是怎么做成的，人又该怎样成长？
- 页尾：YouTube、B站、小红书 · 40万+关注者；查看全部嘉宾访谈

下表中的短标题是对原片内容的编辑提炼，不作为嘉宾原话或逐字节目原题；“／”表示封面中的换行。

| 嘉宾 | 页面身份 | 分类 · 封面标题 | 入口与相关节目 |
| --- | --- | --- | --- |
| 田渊栋 | 前 Meta FAIR 研究总监 | AI研究 · 模型的顿悟／研究者的品味 | `/guests/tian-yuandong`；[研究、顿悟与优雅](https://www.youtube.com/watch?v=dymM40bVIhQ) |
| 毕书超 | YouTube Shorts 联合创始人 · 前 OpenAI 多模态后训练负责人 | 技术前沿 · AI往何处去／模型的自我迭代 | `/guests/shuchao-bi`；[2025，AI路往何方？](https://www.youtube.com/watch?v=eRYBE0dXsmU) |
| Reynold Xin | Databricks 联合创始人、首席架构师 | 技术创业 · 大机会／是怎样抓住的 | `/guests/reynold-xin`；[识别机会](https://www.youtube.com/watch?v=GIv0I-34aaI) |
| 贾扬清 | Caffe 作者 · Lepton AI 创始人（被 NVIDIA 收购） | 创业圆桌 · AI创业／从模型到市场 | `/guests/yangqing-jia`；[AI创业圆桌](https://www.youtube.com/watch?v=Lt-lVe957hc) |
| 硅谷徐老师 | Howie Xu · Gen 首席AI与创新官 | 周期与判断 · 亲历两轮泡沫／这次有何不同 | `/guests/howie-xu`；[AI泡沫](https://www.youtube.com/watch?v=knTP07tE89Y) |
| 刘嘉 | 清华大学讲席教授 | 认知与教育 · 大脑、AI／与教育的未来 | `/guests/liu-jia`；[脑科学、AI与教育](https://www.youtube.com/watch?v=-Et3GJRSI_0) |
| Vijaye Raji | OpenAI 应用 CTO · Statsig 创始人 | 职业选择 · 从大厂高管／到创业者 | `/guests/vijaye-raji`；[英文职业访谈](https://www.youtube.com/watch?v=iw2QYZeVlOQ) |
| Ryo Lu | 前 Cursor 设计负责人 | 设计与创造 · 走出Figma／在代码中设计 | `/guests/ryo-lu`；[设计与代码](https://www.youtube.com/watch?v=BnL5qaBzmR0) |

相对旧版，中文新增田渊栋、徐老师、刘嘉，暂不在中文首页展示 Gergely Orosz。田渊栋补研究深度；徐老师既有中文认知度，也有多年连续对话；刘嘉把 AI 接到认知、学习与人的成长。保留的五位分别体现产品创新、技术创业、基础设施、职业选择与制作方法。贾扬清对应多人圆桌，因此显示“圆桌”，不把活动包装成独家单人专访。

樊登的知名度很高，但当前首页围绕 AI、研究与制作展开，这版优先刘嘉的认知与教育研究。戴雨森已在上方同行评价中出现；Acquired 主持人已在 Hero 的真实合照中出现，不必让同一批姓名占据每一处证明。所有未精选的真实访谈继续保留。

英文首页保留原有 Gergely Orosz，替换同一位置的徐老师，其余七位一致。英文读者对 The Pragmatic Engineer 的识别度更高，而且保留真实英文对话入口。角色为 `Founder, The Pragmatic Engineer`，封面为 `ENGINEERING CAREERS` 与 `Engineering / careers & AI`，直达旧版已经使用的 [Engineering Careers and AI](https://www.youtube.com/watch?v=-WvvJBd3hDI)。这段约 37 分钟的对话是为 lizheng.ai 准备的 unlisted 存档，持链接可看；本次延续原有入口，不更改视频发布状态。

最初口述“硅谷七老师”按嘉宾库中的“硅谷徐老师（Howie Xu）”理解；用户已看到这份名单后授权按统一封面方向制作并上线。

## 身份核对

核对日期：2026-09-10。首页采用足以说明其分量的简短经历，不机械复制陈旧的视频标题。

- [田渊栋本人主页](https://yuandong-tian.com/)：现为 Recursive Superintelligence Inc 联合创始人，曾任 Meta FAIR Research Scientist Director。因此保留有辨识度的 Meta 经历并标明“前”；英文压缩为 Former Research Director, Meta FAIR。
- [毕书超哥大讲座介绍](https://ai.columbia.edu/events/distinguished-lecture-shuchao-bi-openai)：YouTube Shorts co-founder，曾领导 Shorts 算法组织。其[本人 X 简介](https://x.com/shuchaobi/with_replies)已显示在 Meta Superintelligence Labs 从事研究；本次检索通过索引读取，直接抓取失败。首页保留 Shorts 联创经历，并明确标注“前 OpenAI 多模态后训练负责人”；后者也由用户频道原始访谈描述明确支持，不沿用旧版的现任 OpenAI 头衔。
- [Databricks 官方页面](https://www.databricks.com/dataaisummit/speaker/reynold-xin)：Co-Founder and Chief Architect。
- [贾扬清本人主页](https://daggerfs.com/)：当前创建 Intent Lab。Caffe 作者、Lepton AI 创始人是持续成立的历史成就；原网页明确写明 Lepton 被 NVIDIA 收购，首页同样补充这一信息。
- [Gen 2026-09-04 官方署名文章](https://www.gendigital.com/blog/insights/leadership-perspectives/the-cyber-defense-window)：Howie Xu，Chief AI & Innovation Officer。
- [清华官方教师页](https://www.pcs.tsinghua.edu.cn/info/1008/1350.htm)与[2026年校方报道](https://www.pcs.tsinghua.edu.cn/info/1037/2092.htm)：刘嘉为基础科学讲席教授；首页压缩为清华大学讲席教授。
- [OpenAI 公告](https://openai.com/index/vijaye-raji-to-become-cto-of-applications-with-acquisition-of-statsig/)：Vijaye Raji 出任 CTO of Applications。此处访谈实际讨论职业选择，未把旧采访描述成现任 OpenAI 职位的访谈。
- [Ryo 本人主页](https://ryo.lu/)将 Cursor 列于过去工作，因此使用“前 Cursor 设计负责人”。

完整嘉宾目录由 `shared/guest-roster-snapshot.ts` 与 `shared/guest-video-metadata.ts` 的上游来源维护，本次不手改生成文件。潜在的目录头衔更新应由 `sunyuzheng/kedaibiao-content-tools` 单独处理。这里的精选、排序和议题属于首页编辑层。

## 肖像来源

所有图片均为真实人物照片，直接使用原文件。没有生成面孔、拼接合照或修改图片内容。统一视觉由 CSS 的窄肖像栏裁切、灰阶和叠色完成。新增文件位于 `client/public/guest-portraits/`。

| 文件 | 来源与备注 |
| --- | --- |
| `yuandong-tian.png` | [本人网站原图](https://yuandong-tian.com/imgs/bio.png)，637×677。 |
| `shuchao-bi.jpg` | [本人 X](https://x.com/shuchaobi) 的[原始头像](https://pbs.twimg.com/profile_images/1842686033592565760/MoZKV90L.jpg)，400×400；[公开账户资料](https://api.fxtwitter.com/shuchaobi)核对账户与图像的对应。替换首稿中不适合窄栏的哥大演讲照片。 |
| `reynold-xin.jpg` | [Databricks 官方讲者页](https://www.databricks.com/dataaisummit/speaker/reynold-xin)提供的[官方头像](https://www.databricks.com/dataaisummit/sites/default/files/styles/headshot/public/media/images/dataaisummit_speaker/Reynold%2520Xin_1781024107894001xST3.jpg?h=fbe83f66&itok=QiTM-vKm)，300×300。 |
| `yangqing-jia.jpg` | [本人网站原图](https://daggerfs.com/assets/img/profile.jpg)，512×512。 |
| `howie-xu.jpg` | 复用 `/Users/sunyuzheng/Desktop/superlinear/1-会员社区/stay-superlinear-membership/assets/guest-howie-xu-v1.jpg`，1200×1200；已有会员网站嘉宾肖像。 |
| `ryo-lu.jpg` | [Cursor Compile 讲者页](https://cursor.com/compile)的[原始头像](https://cursor.com/marketing-static/compile/speakers/ryo.jpg)，173×216；用于封面右侧肖像栏。 |
| `gergely-orosz.png` | [本人 About 页面](https://blog.pragmaticengineer.com/about/)中的[原始头像](https://storage.ghost.io/c/39/f8/39f85cc7-8637-40fc-a57c-f45754453717/content/images/2015/12/pragmatic-engineer-profile-image.png)，300×338，仅用于英文首页。 |
| `/avatars/liu-jia.jpg` | 复用本网站既有刘嘉肖像，200×200。 |
| `/avatars/vijaye-raji.jpg` | 复用本网站既有 Vijaye 肖像，800×800。 |

## 原片内容核对

逐张查看九张原始 1280×720 封面，并核对原题、描述和必要章节。原图留在本地 `output/conversations-review/original-covers/`，不部署到站点。

- 田渊栋：模型顿悟、研究品味；原片有 Grokking 专门章节，英文封面使用 `Grokking / & research taste`。
- 毕书超：原片 15:54–16:30 区分预训练压缩既有知识与强化学习推动主动迭代，因此采用“模型的自我迭代”。
- Reynold：识别机会、公司成长；没有把 2024 原题的历史估值数字写成当前估值。
- 贾扬清：GenAI 成本、开源与闭源、中间层及小公司机会；原片是四位嘉宾的现场圆桌，封面保留圆桌分类。
- Howie：亲历互联网泡沫，比较 2000、2008 与本轮 AI 周期，讨论 CEO 判断和校准。
- 刘嘉：脑科学、人机差异、学习与教育；终稿扩大为“大脑、AI与教育的未来”，更贴近原片范围。
- Vijaye：原封面 Facebook VP 到创业者；不把旧片转述为现任 OpenAI 职位的访谈。
- Ryo：原封面离开 Figma、Baby Cursor、软件设计的概念进化，封面提炼为直接在代码中设计。
- Gergely：原封面是立正与 Gergely 在 Statsig 办公室面对面对话，标题为 Engineering Careers and AI，保留旧版公开页面已使用的视频入口。

## 验证记录

- `pnpm check`、`pnpm build`、`git diff --check`。构建含中英文首页完整预渲染与 126 个嘉宾子页；既有主包超过 500 kB 的提示未因本次扩展处理。
- 检查默认桌面、390 px、320 px 的中英文页面，以及中间双栏宽度；封面文字与图片没有重叠、裁断或横向溢出。
- 中文八位含 Howie，英文八位含 Gergely；所有肖像成功加载，八个内部嘉宾入口与完整目录返回 HTTP 200，浏览器实际核对田渊栋与徐老师页面。
- 嘉宾卡片与目录入口可以键盘聚焦，有可见焦点样式；装饰性肖像空 alt，主题与身份是可读的原生文字。减少动态效果偏好关闭照片放大。
- 既有 `/guests/...` 为中文规范路径；Gergely 直达英文视频。本次没有新增或承诺独立英文嘉宾档案。
- 不变更完整嘉宾目录、视频状态、旧访谈头衔来源、创办动机或其他首页区块。临时浏览器尺寸覆盖在交付前恢复。
