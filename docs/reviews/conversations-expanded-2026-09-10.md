# 首页十二位嘉宾与近期访谈补齐

## 范围与授权

用户要求在已上线的八位基础上新增四位；最终指定为 Mike Vernal、Ethan Evans、周楠、MIT 教授 Kevin Chen。此前提到加回 Ryo、贾扬清的要求已被这次更正取代。继续沿用本任务完成核验后直接上线的授权，发布到 `https://www.lizheng.ai/zh#conversations` 与英文首页，受众为公开网站访客。

保留暖白色封面、真实彩色肖像与主题/姓名/身份的层级，桌面四栏三行。中文保留硅谷徐老师，英文同一位置保留 Gergely Orosz，两种语言各十二位。其余首页区块不变。

## 四张新增卡片

短标题是内容提炼，不是逐字引语。

| 嘉宾 | 中文身份 | 分类与短标题 | 入口 |
| --- | --- | --- | --- |
| Mike Vernal | Conviction 合伙人 · 前红杉合伙人、Facebook 副总裁 | 投资与创新 · AI、投资／与公司成长 | `/guests/mike-vernal` |
| Ethan Evans | 前 Amazon 副总裁 · 高管教练 | 管理与影响力 · 技术之外／如何建立影响力 | `/guests/ethan-evans` |
| 周楠 / Nan Zhou | 硅谷科技投资人 · Cerebras 早期投资人 | 非共识投资 · 在共识之前／看见机会 | `/guests/zhou-nan` |
| Kevin Chen | MIT 电气工程与计算机科学副教授 | 科学与工程 · 微型机器人／与科学的边界 | `/guests/kevin-chen` |

Mike 补充投资与公司成长，Ethan 补充组织中的影响力，周楠呈现最近一轮 AI 投资判断，Kevin 把研究范围延伸到实体机器人和科学探索。现有八位和顺序保留，新增四位组成第三行。

魏慧同时补建正式嘉宾页，因此首页入口由 YouTube 单片改为 `/guests/wei-manfredi`，让访客可以查看人物与已公开节目。

## 内容与身份来源

- Mike：[AI and Investing](https://www.youtube.com/watch?v=Ody9st7QDlU)、[Big Tech and Company Building](https://www.youtube.com/watch?v=PmEnEfzA0bA)。两条是此前专为 lizheng.ai 上传的 unlisted 存档，匿名可以观看；用户本轮又明确指定在首页展示 Mike，保持原视频状态。身份由 [Sarah Guo 的合伙人公告](https://saranormous.substack.com/p/mike-vernal-conviction)、[Mike 本人简介](https://www.linkedin.com/in/vernal)、[Sequoia 历史访谈](https://articles.sequoiacap.com/2019-05-29-mike-vernal)支持。
- Ethan：[职业发展如何平衡技术、人脉和业务](https://www.youtube.com/watch?v=RRSMjC_BF8Y)的章节讨论升职中不变的要素、关系、技术与业务、软实力；[本人关于页](https://www.ethanevans.com/about)确认已从 Amazon VP 退休，现从事领导力教育。
- 周楠：[2026-09-02 公开剪辑](https://www.youtube.com/watch?v=my_lMhlKLVk)讨论共识形成前下注、Cerebras 与 Scale AI、风险拆解、AI 工作流和创业误区。身份依据该片完整简介与[高通创投本人访谈](https://www.qualcommventures.com/insights/blog/meet-the-qualcomm-ventures-team-five-questions-with-nan-zhou-director-qualcomm-technologies-inc/)，不把旧的 Director 当作当前职务。本人使用 Nan Zhou；更正英文名时通过显式 slug 保留既有 `/guests/zhou-nan` 链接。
- Kevin：[第一期](https://www.youtube.com/watch?v=6FvFgTWO9BU)在实验室讨论昆虫级飞行机器人与科研意义，[第二期](https://www.youtube.com/watch?v=2fpnJlHPhGA)讨论科学的局限；[MIT EECS 人员页](https://www.eecs.mit.edu/people/yufeng-kevin-chen/)和[实验室介绍](https://smrl.mit.edu/people/)确认 Associate Professor 身份。

## 肖像来源

原片封面均逐张核对，本地留在 `output/conversations-review/expanded-guests/`。新增正式图片直接复制公开原图，没有生成或修改人脸；由网站 CSS 裁切和轻微提亮。

| 部署文件 | 来源与选择 |
| --- | --- |
| `guest-portraits/mike-vernal-color.jpg` | [真实访谈原始封面](https://i.ytimg.com/vi/Ody9st7QDlU/maxresdefault.jpg)，1280×720。CSS 只呈现右侧 Mike，放大到与其他肖像接近的面部比例。使用无叠字的现场照片。 |
| `guest-portraits/ethan-evans.jpg` | [本人网站蓝底正式肖像](https://cdn.prod.website-files.com/65dbe0bf854c3a7926a66959/65f10b293a07925e550630ad_ethan-headshot-blue-p-500.jpg)，500 px 宽，来自关于页。 |
| `guest-portraits/nan-zhou.jpg` | [高通创投正式肖像](https://www.qualcommventures.com/wp-content/uploads/2021/03/NanZhou@2x-768x582.jpg)，768×582。 |
| `guest-portraits/kevin-chen.jpg` | [MIT EECS 当前彩色肖像](https://www.eecs.mit.edu/wp-content/uploads/2021/07/Chen_Kevin_preferred-as-of-Oct-2024-scaled-e1778187044191-500x500.jpg)，500×500。选明亮室内背景的照片，替代实验室网站较暗的旧头像。 |

## 嘉宾目录维护

内容先在 `kedaibiao-content-tools` 的 `guests.json` 与 `guest_video_metadata.json` 更新，通过校验并推送后再生成网站快照。更新限于本轮指定嘉宾和2026年4月至今清晰可确认的新增公开访谈，不重新推断无关嘉宾身份。

逐条核对实际匿名观看状态：元数据的 `privacy: public` 不能区分普通公开视频与会员视频。周楠9月完整版 `BseWUBpOHY4`、魏慧完整版 `Y9rmTZOM5Z4` 等仍为会员专属，本轮新关联使用普通公开剪辑。Mike 的两条网站专用 unlisted 是用户明确指定展示的例外，视频状态保持不变。


目录最终由 126 增至 139 个档案，唯一视频由 348 增至 365 条。新增魏慧、Mike Vernal、王路、Ethan Zheng、Carina、Jove Zhong、Tech Roast Show、Zero 刘希元、张昊阳、Wu Kan、勤勤、Vera & 粒粒、麻省理工长毛兔。既有周楠新增两期公开对话，Howie 新增一期年度对话，Kevin 精确更新职务。原有348条视频 metadata 原样保留。

上游提交 `827d6358bc1d37e3222fe9655c9ccf877bd40734` 完成补齐；`b3ca5f384010aed76f5ba537b6b51f2563cd3984` 进一步修复贾扬清字段的源/消费者漂移，保留网站已经上线的准确履历，避免同步回退。两个提交均已推送并通过上游校验。

同步时通过 `KEDAIBIAO_CHANNEL_DIR=/Users/sunyuzheng/Desktop/AI/_workspace/kedaibiao-guests-20260910` 读取干净 worktree，未覆盖其他任务使用的内容 checkout。完整来源与排除记录见上游 `docs/嘉宾目录更新-2026-09-10.md`。

## 验证

- `pnpm refresh:guests` 完成同步、类型检查与正式构建；生成139个嘉宾子页及更新后的目录和sitemap。
- 逐项检查139个slug唯一、静态子页存在、视频标题完整、精选视频归属和按播放量排序；周楠旧URL及4期关联正确，会员完整版未被新增关联。
- 中英文各12张卡片；1280px桌面、390px手机及320px英文窄屏检查没有文字溢出。照片保持自然肤色，Mike的现场照片按人脸比例调整裁切。
- 浏览器核验周楠最新精选、魏慧和Mike新页；完整目录显示139位，搜索周楠返回已更新条目。首页已有嘉宾与其他区块保持不变。
