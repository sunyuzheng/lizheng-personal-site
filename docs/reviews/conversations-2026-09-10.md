# 首页访谈区：2026-09-10 统一封面与精选嘉宾

本页记录八位嘉宾阶段。当前十二位名单、魏慧正式嘉宾页和近期目录更新见[后续扩展记录](conversations-expanded-2026-09-10.md)。

发布授权：用户本轮明确要求制作统一、unbranded 的 thumbnail，强调主题多样性、对话含金量与嘉宾分量，并授权完成检查后直接上线。发布通过 `main` 的 CI 和 Vercel 完成。基于 `origin/main` 的 `0278143258a46337e25efeb4d1b3deb10c168f8a`。发布页面为 `https://www.lizheng.ai/zh#conversations` 与英文首页对应位置，读者是公开网站访客。

预览：`http://127.0.0.1:4178/zh#conversations`；英文为 `http://127.0.0.1:4178/#conversations`。准确实现及双语文案见 `client/src/components/HomeConversations.tsx`。

## 为什么这样改

旧版用六张节目封面，封面的字号、配色、描边、人物数量和构图彼此竞争。它们是为各自平台的信息流设计的；放在个人主页上，读者先看到封面包装，然后才能辨认嘉宾。

最终版采用统一的 16:10 封面：明亮的暖白色底，左侧主题分类与短标题，右侧真实彩色肖像；封面下面列姓名与关键身份。主题取自原片标题、封面和内容，不以平台式悬念作为主要吸引力。网站原生文字与照片分层，文字在窄屏保持清楚，也能由搜索和辅助技术读取。根据用户对中文页面观感的反馈，取消黑白处理与压暗的绿色叠色，恢复自然肤色，适度提亮偏暗照片；统一性由封面格式与排版维持。悬停有克制的放大。宽桌面四栏、中屏双栏、手机单栏，每个完整卡片可点击，八位直接展示。

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
| 毕树超 | YouTube Shorts 联合创始人 · 前 OpenAI 多模态后训练负责人 | 技术前沿 · AI往何处去／模型的自我迭代 | `/guests/shuchao-bi`；[2025，AI路往何方？](https://www.youtube.com/watch?v=eRYBE0dXsmU) |
| Reynold Xin | Databricks 联合创始人、首席架构师 | 技术创业 · 大机会／是怎样抓住的 | `/guests/reynold-xin`；[识别机会](https://www.youtube.com/watch?v=GIv0I-34aaI) |
| 屠龙大实话 | 神经科学博士 · 连续创业者 | 商业实战 · 先学会销售／再动手做产品 | `/guests/yang-ying`；[屠龙博士创业的秘密](https://www.youtube.com/watch?v=vd_oYgwQSBM) |
| 硅谷徐老师 | Howie Xu · Gen 首席AI与创新官 | 周期与判断 · 亲历两轮泡沫／这次有何不同 | `/guests/howie-xu`；[AI泡沫](https://www.youtube.com/watch?v=knTP07tE89Y) |
| 刘嘉 | 清华大学讲席教授 | 认知与教育 · 大脑、AI／与教育的未来 | `/guests/liu-jia`；[脑科学、AI与教育](https://www.youtube.com/watch?v=-Et3GJRSI_0) |
| Vijaye Raji | OpenAI 应用 CTO · Statsig 创始人 | 职业选择 · 从大厂高管／到创业者 | `/guests/vijaye-raji`；[英文职业访谈](https://www.youtube.com/watch?v=iw2QYZeVlOQ) |
| 魏慧 | 洲际酒店集团 AI与架构高级副总裁 | 技术与领导力 · 如何成为／不可替代的人 | 直达[魏慧访谈](https://www.youtube.com/watch?v=99-5ptPiHJ0) |

相对旧版，中文新增田渊栋、徐老师、刘嘉，暂不在中文首页展示 Gergely Orosz。田渊栋补研究深度；徐老师既有中文认知度，也有多年连续对话；刘嘉把 AI 接到认知、学习与人的成长。用户随后指定以魏慧替换 Ryo、屠龙大实话替换贾扬清。魏慧补上从专业能力到领导力的成长，屠龙大实话补上真实生意中的销售与产品实践。其余嘉宾分别体现技术前沿、技术创业与职业选择。两位新嘉宾同步用于中英文首页，未入选的访谈仍保留在完整目录中。

樊登的知名度很高，但当前首页围绕 AI、研究与制作展开，这版优先刘嘉的认知与教育研究。戴雨森已在上方同行评价中出现；Acquired 主持人已在 Hero 的真实合照中出现，不必让同一批姓名占据每一处证明。所有未精选的真实访谈继续保留。

英文首页保留原有 Gergely Orosz，替换同一位置的徐老师，其余七位一致。英文读者对 The Pragmatic Engineer 的识别度更高，而且保留真实英文对话入口。角色为 `Founder, The Pragmatic Engineer`，封面为 `ENGINEERING CAREERS` 与 `Engineering / careers & AI`，直达旧版已经使用的 [Engineering Careers and AI](https://www.youtube.com/watch?v=-WvvJBd3hDI)。这段约 37 分钟的对话是为 lizheng.ai 准备的 unlisted 存档，持链接可看；本次延续原有入口，不更改视频发布状态。

最初口述“硅谷七老师”按嘉宾库中的“硅谷徐老师（Howie Xu）”理解；用户已看到这份名单后授权按统一封面方向制作并上线。

## 身份核对

核对日期：2026-09-10。首页采用足以说明其分量的简短经历，不机械复制陈旧的视频标题。

中文姓名校正：Shuchao Bi 写作“毕树超”，依据[浙江大学校报2007年毕业生专访](https://zdjy.zju.edu.cn/review/toReview?dbID=23&dbName=ZHEJIANGDAXUEBAO&sysID=44749)。首页中文名与本文已统一；上游嘉宾记录使用英文姓名，无需更改链接标识。

- [田渊栋本人主页](https://yuandong-tian.com/)：现为 Recursive Superintelligence Inc 联合创始人，曾任 Meta FAIR Research Scientist Director。因此保留有辨识度的 Meta 经历并标明“前”；英文压缩为 Former Research Director, Meta FAIR。
- [毕树超哥大讲座介绍](https://ai.columbia.edu/events/distinguished-lecture-shuchao-bi-openai)：YouTube Shorts co-founder，曾领导 Shorts 算法组织。其[本人 X 简介](https://x.com/shuchaobi/with_replies)已显示在 Meta Superintelligence Labs 从事研究；本次检索通过索引读取，直接抓取失败。首页保留 Shorts 联创经历，并明确标注“前 OpenAI 多模态后训练负责人”；后者也由用户频道原始访谈描述明确支持，不沿用旧版的现任 OpenAI 头衔。
- [Databricks 官方页面](https://www.databricks.com/dataaisummit/speaker/reynold-xin)：Co-Founder and Chief Architect。
- 屠龙大实话（杨滢）：身份由本频道[原片介绍](https://www.youtube.com/watch?v=vd_oYgwQSBM)、上游嘉宾名录与既有讲师肖像材料共同支持；中文以用户指定的公众昵称显示，英文采用 Yang Ying。
- [Gen 2026-09-04 官方署名文章](https://www.gendigital.com/blog/insights/leadership-perspectives/the-cyber-defense-window)：Howie Xu，Chief AI & Innovation Officer。
- [清华官方教师页](https://www.pcs.tsinghua.edu.cn/info/1008/1350.htm)与[2026年校方报道](https://www.pcs.tsinghua.edu.cn/info/1037/2092.htm)：刘嘉为基础科学讲席教授；首页压缩为清华大学讲席教授。
- [OpenAI 公告](https://openai.com/index/vijaye-raji-to-become-cto-of-applications-with-acquisition-of-statsig/)：Vijaye Raji 出任 CTO of Applications。此处访谈实际讨论职业选择，未把旧采访描述成现任 OpenAI 职位的访谈。
- 魏慧（Wei Manfredi）：[本人参与的 DataIQ 2026 简介与问答](https://www.dataiq.global/dataiq100/wei-manfredi-svp-ai-architecture-ihg-hotels-and-resorts/)确认 IHG Hotels & Resorts 的 SVP, AI & Architecture 身份；中文使用辨识度更高的“洲际酒店集团”。

完整嘉宾目录由 `shared/guest-roster-snapshot.ts` 与 `shared/guest-video-metadata.ts` 的上游来源维护，本次不手改生成文件。潜在的目录头衔更新应由 `sunyuzheng/kedaibiao-content-tools` 单独处理。这里的精选、排序和议题属于首页编辑层。

## 肖像来源

所有图片均为真实人物照片，直接使用原文件。没有生成面孔、拼接合照或修改图片内容。统一视觉由封面布局、窄肖像栏裁切与排版完成，照片保留自然彩色；CSS 仅适度提亮，避免沉重的黑白观感。新增文件位于 `client/public/guest-portraits/`。

| 文件 | 来源与备注 |
| --- | --- |
| `yuandong-tian.png` | [本人网站原图](https://yuandong-tian.com/imgs/bio.png)，637×677。 |
| `shuchao-bi.jpg` | [本人 X](https://x.com/shuchaobi) 的[原始头像](https://pbs.twimg.com/profile_images/1842686033592565760/MoZKV90L.jpg)，400×400；[公开账户资料](https://api.fxtwitter.com/shuchaobi)核对账户与图像的对应。替换首稿中不适合窄栏的哥大演讲照片。 |
| `reynold-xin-color.jpg` | [Databricks 官方作者页](https://www.databricks.com/blog/author/reynold-xin)提供的[官方彩色缩略图](https://www.databricks.com/sites/default/files/styles/max_650x650/public/2022-10/Reynold-Xin.jpg?itok=ofJ_eOc7&v=1665675097)，650×650、约24KB；浅背景、微笑正面肖像。 |
| `yang-ying-color.jpg` | 复用立正于2026-08-12提供的杨滢正式形象照现有裁图，1200×1600、约365KB；源文件为 `Desktop/superlinear/6-活动/Stay Superlinear 大师课/05-2026-12-11-杨滢-商业实战/03-讲师素材/yangying-official-portrait-4-cover-crop.jpg`。来源见同项目 `04-来源与记录/封面制作记录.md`；直接复制现有真人彩色照片。 |
| `howie-xu.jpg` | 复用 `/Users/sunyuzheng/Desktop/superlinear/1-会员社区/stay-superlinear-membership/assets/guest-howie-xu-v1.jpg`，1200×1200；已有会员网站嘉宾肖像。 |
| `/avatars/wei-manfredi.jpg` | 复用本网站既有魏慧真人彩色肖像，490×490。 |
| `gergely-orosz-color.jpg` | [既有英文对谈](https://www.youtube.com/watch?v=-WvvJBd3hDI)的[原始现场封面](https://img.youtube.com/vi/-WvvJBd3hDI/maxresdefault.jpg)，1280×720；CSS 只展示 Gergely 所在区域，保留自然彩色。 |
| `/avatars/liu-jia.jpg` | 复用本网站既有刘嘉肖像，200×200。 |
| `/avatars/vijaye-raji.jpg` | 复用本网站既有 Vijaye 肖像，800×800。 |

## 原片内容核对

逐张查看原始 1280×720 封面，并核对原题、描述和必要章节。首轮原图留在本地 `output/conversations-review/original-covers/`；魏慧、屠龙大实话原图留在 `output/conversations-review/new-guests/`。Gergely 的真实现场照片另外用于英文封面的彩色肖像；其余原频道封面不部署到站点。

- 田渊栋：模型顿悟、研究品味；原片有 Grokking 专门章节，英文封面使用 `Grokking / & research taste`。
- 毕树超：原片 15:54–16:30 区分预训练压缩既有知识与强化学习推动主动迭代，因此采用“模型的自我迭代”。
- Reynold：识别机会、公司成长；没有把 2024 原题的历史估值数字写成当前估值。
- 屠龙大实话：原片 15:00 起讨论书店生意中“先销售、再产品”的实践，其他章节延伸到获取一手信息、失败诊断与长期写作；封面提炼为“先学会销售／再动手做产品”，英文 `Sell first. / Then build.`。
- Howie：亲历互联网泡沫，比较 2000、2008 与本轮 AI 周期，讨论 CEO 判断和校准。
- 刘嘉：脑科学、人机差异、学习与教育；终稿扩大为“大脑、AI与教育的未来”，更贴近原片范围。
- Vijaye：原封面 Facebook VP 到创业者；不把旧片转述为现任 OpenAI 职位的访谈。
- 魏慧：剪辑版原题为《躺平十年，却成为华人天花板，她靠三个底层特质｜魏慧》，完整版标题明确以“不可替代性”为主线；22:21 起专门讨论 Go-to person。封面提炼为“如何成为／不可替代的人”，英文 `Becoming / irreplaceable`。当前完整嘉宾目录未收录魏慧，首页直达已公开的1小时剪辑版，不创建空嘉宾页。
- Gergely：原封面是立正与 Gergely 在 Statsig 办公室面对面对话，标题为 Engineering Careers and AI，保留旧版公开页面已使用的视频入口。

## 验证记录

- `pnpm check`、`pnpm build`、`git diff --check`。构建含中英文首页完整预渲染与 126 个嘉宾子页；既有主包超过 500 kB 的提示未因本次扩展处理。
- 检查默认桌面、390 px、320 px 的中英文页面，以及中间双栏宽度；封面文字与图片没有重叠、裁断或横向溢出。
- 中文八位含 Howie，英文八位含 Gergely；所有肖像成功加载，七个共用内部嘉宾入口（包括中文限定的 Howie）与完整目录返回 HTTP 200；英文以 Gergely 视频替代 Howie，魏慧在两种语言均直达公开视频。浏览器实际核对田渊栋、徐老师及新增屠龙大实话页面。
- 嘉宾卡片与目录入口可以键盘聚焦，有可见焦点样式；装饰性肖像空 alt，主题与身份是可读的原生文字。减少动态效果偏好关闭照片放大。
- 既有 `/guests/...` 为中文规范路径；Gergely 直达英文视频，魏慧直达中文视频。本次没有新增或承诺独立英文嘉宾档案。
- 不变更完整嘉宾目录、视频状态、旧访谈头衔来源、创办动机或其他首页区块。临时浏览器尺寸覆盖在交付前恢复。

## 频道姓名核验（2026-09-10）

用户同时要求纠正频道中同一错字。实际登录 YouTube Studio 全频道搜索“毕书超”返回零条；三期 `7ej2r7XysKc`、`eRYBE0dXsmU`、`minCtoiRHG8` 的线上标题与完整简介均使用 Shuchao / Shuchao Bi，且没有可编辑的既有字幕轨。B站已核对的 `BV1RqLTzNEcW` 标题与完整简介也无错字；未取得其他两期映射。上游1,024条视频元数据、3,365个存档文本/字幕和138个播客 show notes 无该错字。频道最小差异为零，因此没有执行空更新；小红书全量内容未核验。网站姓名错误已由前一提交更正。
