# 问问立正：主页与域名集成

问答和公开资料检索的owner是[ask-lizheng](https://github.com/sunyuzheng/ask-lizheng)，资料owner是[lizheng-open-context](https://github.com/sunyuzheng/lizheng-open-context)。本仓库只负责主页原生组件与Vercel入口，不复制语义索引、模型密钥或回答生成逻辑。本站、Builder、Ops 和数据库怎样配合，每份数据归谁、每条规则在哪执行，见 ask-lizheng 仓库的 [docs/ARCHITECTURE.md](https://github.com/sunyuzheng/ask-lizheng/blob/main/docs/ARCHITECTURE.md)。

2026-10-04当前产品原则：问问立正是公开问答，提问时同意保存和公开使用问题、完整回答与出处，帮助别人、改进回答并用于内容选题。主页与独立页输入旁明确写这一点；App在发送前单独列明实际AI处理方，按钮写「同意AI处理与公开使用」。分享是取得链接和传播的功能。处境原文不保存、不单独公开，完整回答可能引用细节并随问答公开使用；邮箱和登录身份按其核验用途处理。历史v1/v3保留原使用范围。产品owner的当前规则在ask仓库docs/PRODUCT.md和docs/QUERY_RECORDS.md；以下日期段落保留当时实施记录。

当前AI转发对象由Builder负责人核实为DeepSeek（生成）和OpenAI（向量匹配）；网关只记用量元数据、不留问答正文。本仓库中英文隐私政策按具体请求数据分别披露，不使用未经核实的训练或同等保护保证。2026-10-04正式[Builder数据说明](https://space.ai-builders.com/privacy)已上线，政策据此披露DeepSeek可能保存输入及改进模型、无训练退出机制和未启用零保留，以及传输、访问限制与删除协调。App本机v4同意包含模型、已核实接收方和记录模式；未知回答服务商无法在App确认发送。部署问答后端后，再从其干净提交执行sync:ask-app更新这里实际提供的App页面。

- 主页：文章之后独立的问问立正章节（AskLizheng组件）；两种问法（想明白，可打开「结合我的处境」；从哪读起）、可修改预填、真实阶段、候选资料片段、核验后的回答和出处、停止与追问，完整回答可保存为长图或PDF。英文界面明确资料与回答主要使用中文。
- 主页API：POST /api/ask-lizheng/ask、GET /api/ask-lizheng/meta，POST通过固定目标Edge流式转发到Builder的/api/ask，GET反代到/api/meta。无客户端模型凭证；问答请求不发送浏览器凭证、不缓存。访客提问在转发前另按网络入口计数（每个北京日300次，见ask-lizheng仓库ACCOUNT_QUOTAS.md），防止不保存Cookie的客户端绕过每天3次。超限时同样返回quota_exhausted，另带scope: network，页面据此说明是这个网络的免费次数用完了。
- Founding说明：次数行「如何成为」展开谁是Founding Member、会员得到什么，并链接Stay会员页；额度用完的卡片同样给出会员页链接。名额（前3,000位新年费会员）与价格（$149/¥999）取自会员页与会员事实表，Founding窗口结束或价格变化时同步改`AskLizheng.tsx`（foundingWho、foundingGet）和ask仓库`src/main.jsx`的`FoundingInfo`。
- 独立页面：ask.lizheng.ai的host路由反代现有ask-lizheng.ai-builders.space应用，包括资产和API；/api/ask同样经过流式转发，Vercel托管域名与TLS，Builder托管模型调用、检索与Docker应用。cleanUrls/trailingSlash的现有规范化可能先产生308。
- Builder休眠：Koyeb上的Builder闲置5分钟后深度休眠，唤醒通常几秒，最长约半分钟。2026-10-04起 ask.lizheng.ai 的页面不再从 Builder 取：页面文件放在本站 `client/public/ask-app/`，打开即显示（见下文「ask.lizheng.ai 的页面文件」）；Builder 只回答提问和给 `/api/meta`。页面读 `/api/meta` 最多等一分钟，3秒没回就显示「问答服务正在唤醒，通常十几秒，可以先写问题」，醒来前不能发送。原来的唤醒页（`api/ask-lizheng-page.ts`）已删。主页与独立页读次数1.5秒未回应时显示「正在唤醒问答服务…」，失败后自动重试一次；提问5秒还没连上时说明服务在唤醒。
- 提问说明v4（2026-10-02已定，前后端已实现并宣布）：主页在`/api/meta`宣布`ops_logging.notice: "v4"`（并有`context_archive: true`、`public_display: "deidentified"`）时，换成「问答会保存，去掉个人信息后可能公开，帮到有同样问题的人」的说明（2026-10-03改写，原句是「很多问题是共性的……去掉个人信息后可能整理公开」，含义不变）和四段细则，请求带`query_log_notice: "v4"`；转发层对v4与v3一样签入匿名visitor。完整约定与文案见ask-lizheng仓库`docs/QUERY_RECORDS.md`。
- 个人站writer（`shared/ask-ops-storage.ts`）接受v4开始记录，多带notice_version、has_background和处境原文（只给所有者），写入同一记录HASH；v3形状不变。
- 保存说明的写法（2026-10-02）：输入框下一句写匿名与用途（「提问是匿名的。问答会保存下来，用来改进回答；请勿填写私密信息。」），「说明」展开后与v4同样分四段（为什么保存、保存什么、你的隐私、另外），「你的隐私」讲提问匿名、登录只核验身份且不和提问记在一起。不写「不追踪」或「验证后立刻忘掉」：有匿名的访问计数和使用标识，登录状态加密保存12小时。「直到立正手动删除」这类实现细节不写给用户，保存与删除行为不变；两边文案在`AskLizheng.tsx`的noticeV3/noticeV3Parts与ask仓库`src/main.jsx`的OPS_NOTICE/V3_PARTS。
- 别人在问什么（2026-10-02，2026-10-04改为两份固定列表）：主页（中文）和ask.lizheng.ai首页在没有对话时，用Ops里已发布的真实问答替代示例问题。2026-10-04起只有「最近问」「最常问」两个标签，每个人看到的一样（立正决定去掉按浏览器轮换的「没看过」，以便整份缓存、不再每来一个人就查一遍数据库）：页面读一次 `/api/ask-lizheng/discovery/lists`（Ops 的两份列表，各30条，CDN缓存1分钟），`discoveryView`（`client/src/lib/ask-discovery.ts`，ask仓库`src/discovery.js`同一规则，测试在本仓库`tests/ask-discovery-pick.test.ts`）决定显示什么：最近问是真实提问，按提问时间从近到远，主题种子不算；最常问每个主题一条，用点赞最多的问题代表（2026-10-05起；一样多时用最近被问的），按类似提问数、点赞、主题种子先于只问过一次的、发布时间排，卡片下「另外N个类似提问」展开同主题的其他问题（Ops每个主题给最多8条，点赞多的在前，每条也能点赞、点开）。同一个问题换个说法的合并成一张卡（`foldDiscovery`/`sameQuestion`），最近问显示最近问的说法、最常问显示点赞最多的说法（合并进来的说法也在展开的类似提问里），「N次类似提问」是所在主题的提问数加上被归到别的主题的同一个问题（`similarCount`）。主页显示所选标签的前四条，「看更多问题 ↗」到ask.lizheng.ai的同一列表（`#recent`/`#frequent`）；ask.lizheng.ai先显示四条，「看更多问题」展开整份，最后是「看全部问题 ↗」到 www.lizheng.ai/ask。点开在原地展开完整回答和出处（`detail`，同样缓存1分钟），「问个类似的」只预填输入框；每条右边是点赞（箭头加数字，参考Product Hunt和Reddit；2026-10-05起不用登录、按浏览器计数：`resolveDiscoveryVoter`把访客Cookie换算成点赞专用标识，同一网络每天给同一条最多20次、总共500次；页面马上显示、失败退回，本机记住点过哪些，`likeState`在列表追上前显示自己这票），展开的回答末尾也有同一个赞和「反馈或举报↗」（2026-10-06立正定：不发邮件，统一到社区帖子 superlinear.academy/c/tools/ask-lizheng 下留言；点的时候顺手复制这条问答的公开页链接，留言时贴上），「分享」复制这条问答公开页 `www.lizheng.ai/ask/<public_id>` 的链接，手机还可「发给朋友…」（分享别人的问答不给多问一次；统计标记 `d_share`）。数据走`/api/ask-lizheng/discovery/*`，www与ask两个域名各自同源（`api/ask-lizheng-discovery.ts`只接受这两个host，Origin须与host一致）。没有已发布问答时照旧显示示例。问答由Ops自动整理发布（每15分钟一轮，v4、无处境、首轮的提问，AI去掉个人信息并判断后直接发布）。新鲜的卡顶部显示提问时间（Ops给出精确到5分钟的原提问时间，显示成23分钟前、3小时前……，绿色，一小时内前面加一个跳动的小绿点），类似提问数在下面；最常问的卡顶部是深色的「N次类似提问」；类似提问只有1次的主题种子显示灰色「常被问到」；标题旁写「最近24小时 N 个新问题」（满30写30+，少于3条不显示）。会员视频出处的卡片里有「加入 YouTube 频道会员」。隐私政策写明公开时显示大约的提问时间，见ask-lizheng-ops的docs/public-discovery.md「自动整理」。
- 转化统计（2026-10-02）：Vercel Web Analytics（Pro，每个事件最多2个属性；UTM报表要Web Analytics Plus，现未开通）。事件都带`surface`（home或ask）：Ask Question（from：typed/example/card/followup，ask页另有clarify）、Ask Discovery Open/Similar/Share（view：recent或frequent，2026-10-04前是visit）、Ask Discovery Sort（sort）、Ask Discovery More（view）、ask页的Ask Discovery All（看全部问题）、Ask Discovery Vote（vote）、Ask Founding Info、Ask Verify Start、Ask Verify Result（result）、Ask Membership Click（location：founding_panel/quota_card，ask页另有about）、Ask Source Click（kind：article/video/community/other）、ask页的Ask Community Click（location：rail）。会员链接带`utm_source=ask-lizheng&utm_medium=<位置>`。事件不含提问内容或身份；ask页脚本只在lizheng.ai域名加载。
- 对话只在当前页面内存中；刷新清空。问题和背景会发送给Builder处理。本产品不保存或记录对话，不能由此承诺基础设施供应商从不处理日志。
- 2026-10-01起主页不再有关键词搜索：找原文由「从哪读起」承担，搜索组件已删除。`client/public/search/{zh,en}.json`保留为公开索引，超线性学院新标签页插件（`AI/apps/superlinear-newtab`）从`https://www.lizheng.ai/search/{lang}.json`读取，不能删除或改格式。问答卡片下方是Open Context入口，告诉想自己做的人材料已在GitHub开源。

本地开发的同源代理默认为http://127.0.0.1:8000，可用ASK_LIZHENG_DEV_TARGET覆盖。先运行问答仓库的服务，再运行本仓库的pnpm dev。pnpm test:ask-lizheng使用独立node环境配置，覆盖SSE客户端与固定目标relay的分块、材料先出现、断线、取消、限额、重定向与错误。

## 发布与核验

候选更新需要按docs/content-system.md的发布规则审阅精确diff、目标和受众。域名绑定的唯一新增记录是Vercel项目prj_1KMe0nebASAOyDyeHziloegiipL7下的ask.lizheng.ai；当前权威NS由实际DNS查询核对为ns1.vercel-dns.com与ns2.vercel-dns.com。此更新不修改apex、www、邮箱或其他子域记录。

先发布已经批准的Builder模型版本并确认/api/meta，然后发布主页main，绑定已经批准的ask域名。核验TLS、默认模型、真实SSE先收到候选资料、完整回答与出处、停止、手机布局、旧搜索和主页其他区块。代理要明确禁用CDN缓存与内容变换。外部rewrite实测曾积累资料片段至完整结果，故问答改为显式流式Function，并验证早资料到达；Node本地测试不能证明Edge兼容。线上Edge不支持Fetch redirect:error，使用manual并拒绝3xx，不转发Location、Cookie或Authorization。模型选择和服务端来源验证仍只由问答owner管理。

2026-09-30候选核验：41项客户端与relay测试、类型检查与构建通过。浏览器已核验本地Grok 4.5完整回答、出处跳转、停止、手机无横向溢出、中英文入口与旧关键词搜索。Vercel受保护预览dpl_7Y88FBJ9KjGaQCrzU8y1MWZcvAPa连接当前生产Builder（仍是grok-4-fast），HTTP 200且no-store,no-transform，初次sources比result提前6.598秒；CLI计时包含认证准备，不能当用户端延迟。Grok 4.5生产调用与ask域名TLS要在批准发布后再核验。

域名基线核验的NS、A、邮件相关记录均通过。旧verify:domain的6项HTTP断言与当前生产页标题/跳转不一致，命令因此未全通过；这发生在Ask发布前，未改写这些旧断言或其他正在维护的域名资料。

## 断线恢复与回答准备摘要（本地候选）

2026-09-30：质量更新已在生产使用Grok4.5 / medium，ask域名TLS与主页入口已验收。新候选在等待时显示基于实际检索材料与判断卡的回答思路、要核对的问题及候选来源；明确尚不是完整结论。模型仍由问答仓库负责，没有额外模型调用。

Builder等待与Edge转发每5秒发送约2KB的标准SSE注释；它用于保活，不伪装新进度。转发完整事件后再插入注释，避免破坏跨分块UTF-8/JSON；未完成事件有512KB界限。转发100秒总期限返回relay_timeout，断流返回upstream_stream_interrupted，客户端110秒结束等待并取消连接。完整结果立即结束读取，停止和所有终止路径清理计时器与上游读取。

断线、超时或模型故障可在原回合明确点击重新生成；内存保留原问题、背景、意图与历史，不自动重试。重新生成不覆盖用户正在写的新草稿。回归51项、类型检查与预览构建通过；本地真实模型已验证提前材料/回答思路与完整结果，断线模拟已验证主页和独立页面的原请求恢复。375像素视口页面无横向溢出，停止后材料保留。本次正式发布仍需精确diff批准。

## 逐段阅读与持续连接反馈（本地候选）

上一轮断线恢复已在fc700134b527f8c8bd732199229fa8712027c111发布，Builder保活填充已调整为16KB。本次在同一原生组件增加partial事件：已完整返回的回答段落先通过问答服务器的来源编号与格式检查，再显示“正在生成的回答”，明确完整回答仍在生成。每次partial替换前一个快照、按编号合并服务器来源，避免重复出处锚点；repairing撤回暂存段落，result替换为最终内容与最终来源。停止或失败不将段落当完整回答，问题与材料留在内存中。

连接提示按实际收到的非空数据更新，并限为每秒最多一次渲染；SSE注释不推进处理阶段、不虚构模型思考。12秒没有数据时提示暂未收到新响应，超过30秒明确可以先打开原文或停止。公开回答思路与原文仍可提前阅读；不读取、存储或展示provider原始reasoning_content。

57项客户端与relay测试、类型检查和构建通过，覆盖partial快照替换、出处合并、修复/最终结果撤回、保活活动节流及既有断线恢复。浏览器真实Flash转型问答已显示提前段落与完整回答，375像素手机布局无水平溢出，15个引用链接均有目标。问答owner继续使用Grok4.5默认；Flash只是已经测试的服务端候选，没有浏览器模型选择器。候选仍待精确diff批准，批准后需核验正式Builder→Edge→浏览器流式链路。

本地合成慢流在33秒仍展示连接状态、已有段落与长等待提示；停止后原问题与材料保留，未完成段落隐藏。手动重试保持同一回合；修复时撤回段落，完整结果替换，没有自动重试。模拟不连接模型，仅作为交互边界验证。

## 私人Ops与问答归档候选

用户要求提问和回答都存档。新v3保存提示对应问题、完整已核验回答、所用来源快照及匿名会话统计，持续至立正手动删除；旧v1仍30天自动过期。最小新增仅包括保存提示与签名标识、服务端归档、私人Ops，不改变模型、Logto、额度及最新主页/会员说明。详见[Ops说明](ask-ops.md)。

## iPhone App

问问立正iPhone App（ask-lizheng-ios仓库）显示ask.lizheng.ai，User-Agent带`AskLizhengApp/<版本>`。2026-10-03为上架App Store：App里的验证页只给邮箱验证码，不给「使用超线性学院账号登录」，因为学院登录页带注册入口，而苹果要求允许注册的App也能在App里删除账号；邮箱验证码不建账号。隐私政策在`/ask/privacy`，帮助与联系在`/ask/support`（`client/public/ask/`下的静态页，中英文），App Store的隐私政策与支持网址指向这两页。数据用途改变时，两页、ask页面的「说明」和App的隐私声明要一起改；输入框下那句、「说明」里的「这里是公开问答」、处境和分享的说明以及隐私政策开头那段，只在 ask-lizheng 的 `src/public-qa.js` 改（见下面「公开问答怎么说」）。

## 安卓 App（2026-10-06）

问问立正安卓App（ask-lizheng-android仓库）和iPhone App一样显示ask.lizheng.ai，User-Agent带`AskLizhengApp/<版本>`，所以页面在App里同样不显示会员购买链接、第一次提问前单独征求AI同意、验证页只给邮箱验证码。立正定的分发方式：Google Play用学院的开发者账号上架；中国大陆直接下载，安装包放在本仓库`client/public/ask/android/`，下载页是`/ask/android`（版本、大小、签名证书指纹；在微信里打开时提示改用浏览器）。两边用同一把签名密钥，手机可以在两种安装方式之间直接覆盖更新。

发新版：在安卓仓库跑`scripts/release.sh`，把新的安装包改名成`ask-lizheng.apk`覆盖`client/public/ask/android/`里的那份（网址不带版本号，ask页和下载页都链它；旧的带版本号网址由`vercel.json`转到它），再改下载页里的版本、大小和日期。Google Play 2026-10-07上架：https://play.google.com/store/apps/details?id=ai.lizheng.ask 。隐私政策和帮助页写明了安卓App：保存图片进相册、下载PDF进「下载」，不读其他文件。

## 回答排版（2026-10-03）

主页问答区和 ask.lizheng.ai 用同一套段落标签：「AI综合」是默认，不标；只标「材料里的观点」和「AI推演」，提问带了处境时显示「结合你的处境」。正文已有角标的段落不再重复出处行；「边界」里提到的 S 编号显示成角标；摘要用衬线字体。导出长图（`client/src/lib/ask-share.js`）同步。回答写法的规则在 ask-lizheng 仓库的 `server/answers.py`。

## 使用统计（2026-10-03）

用户想知道用户时长、滚动深度、留存、多少人看「别人在问什么」，并问去哪里看。Vercel Analytics 只有访问量、来源、设备和按钮点击次数，没有停留时间、滚动和回访，所以另做了一份自己的匿名统计，在私人Ops（https://www.lizheng.ai/ops/ask-lizheng ）的「使用情况」里看；流量来源、国家、设备和按钮点击次数照旧看 Vercel 项目的 Analytics。

- 页面：主页问答区（`client/src/lib/ask-usage.ts`，surface `home`）、ask.lizheng.ai（ask 仓库 `src/usage.js`，`ask`，App 里是 `app`）。每次打开页面先发一次（普通请求，好让 Cookie 留下），之后页面隐藏或关闭时用 beacon 补发新增部分。阅读时间只算页面在前台、30秒内有操作的时间。每个记号一次打开只发一次：阅读满10秒/30秒/1分钟/3分钟/10分钟（`t10`…`t600`）、滚过25%/50%/75%/到底（`s25`…`s100`）、看到主页问答区（`h_seen`）、「别人在问什么」显示/看到/点开/问个类似的/看更多（`d_shown` `d_seen` `d_open` `d_similar` `d_more`）、提问、得到回答、点开出处、保存图片或PDF。
- 服务端：`POST /api/ask-lizheng/usage`（两个域名各自同源，`api/ask-lizheng-usage.ts` → `shared/ask-usage.ts`），只收这五个字段，记号有白名单；爬虫、预览和无头浏览器不算；同一网络每天最多600次；`ASK_USAGE_ENABLED=false` 可以关掉。浏览器用主站已有的匿名 Cookie（`__Secure-ask-guest`，30天），存进统计的是另一种用途的加密摘要；`__Secure-ask-first` 记第一次来的日期（400天），用来算回访。
- 存储：Upstash 里 `ask-ops:{v3}:usage:` 下按天的计数（`day:<日>`，每个入口和合计）、HyperLogLog 去重的浏览器数（每天、每个入口、几个漏斗记号、按第一次来那天分组的回访），按天的键400天后过期；`total` 和全部时间的去重数不过期。Ops 的 `shared/usage-store.ts` 读这些键。
- 隐私政策的「访问统计」写明了这些（停留、滚动、看到和点开「别人在问什么」、回访，按天合计，不含提问内容）。
- 主页（2026-10-04）：每一章出现在屏幕上时记一次（`c_works` 代表作、`c_city` 这座城、`c_talks` 对话、`c_calls` 公开判断、`c_writing` 文章、`c_join` 加入；问问立正还是 `h_seen`），Ops 面板的「主页读到哪一章」按主页打开次数算比例。主页上点了哪个链接记成 Vercel Analytics 事件「Home Link」：`section` 是链接所在章节的 id（没有 id 的数字与评价、现场照片、结尾邀请用类名 proof、scenes、invite；页头页脚是 header/footer），`to` 是去向（本站页面去掉语言前缀如 `/guests`，页内锚点如 `#join`，外站是域名加第一段路径，如 `superlinear.academy/` 是免费加入、`superlinear.academy/c` 是帖子）。问问立正区里的链接不重复记，它有自己的「Ask …」事件。代码在 `client/src/pages/Home.tsx`（`useHomeCounts`）和 `client/src/lib/link-target.ts`。

## 设计（2026-10-03）

Cursor 的设计负责人 Ryo Lu 说问问立正「有点太AI了」，用户要求重新设计：读起来舒服、有重点；bold、优雅、不busy；该用品牌色的地方用。ask.lizheng.ai 先改（ask 仓库 docs/PRODUCT.md 同日一条），主页问答区跟着改成同一套：章节标题像其他章节一样靠左；问题框是一张奶白卡片，页面上唯一实心的绿色按钮写「提问」；「别人在问什么」左边是标题和「最近问 ↗ · 最常问 ↗ · 没看过」，右边是细线分开的问题列表，不再有卡片和图标；回答像一篇文章（问题用大号宋体加一条黑线、摘要放大、引用是贴着字的绿色上标、出处是编号注释、操作只是文字按钮）。主页上「最近问」「最常问」打开 ask.lizheng.ai 对应的全部问题（`#recent`、`#frequent`），「没看过」就是这里显示的这一批。Open Context 收成章节末尾的一行。

## 公开问答页与搜索（2026-10-04）

用户说问问立正也可以做SEO，尤其是那些提问和回答。「别人在问什么」里公开的每一条问答，现在在 www.lizheng.ai 有自己的网页，服务端渲染，问题、回答和出处都在第一份HTML里，搜索引擎和AI搜索不用执行JavaScript就能读到：

- `/ask/<public_id>`：一条问答。标题是问题，描述是摘要；顶部森林绿上是话题、提问日期和「N次类似提问」，正文和 ask.lizheng.ai 的回答排法一样（摘要放大、绿色角标、「材料里的观点」「AI推演」、边界说明、编号出处），页尾是「问类似的问题」、几条「也可以接着问」（带着问题打开 ask.lizheng.ai，`?q=` 只填进输入框，不会发送）和「别人还问了」。出处只显示标题、类型、日期和引用理由，不放字幕摘录；会员视频和会员帖子标「会员」。
- `/ask`：所有公开问题，一个问题一行，最新提问在前。
- `/ask/sitemap.xml`：`/ask` 和每条可收录的问答，`lastmod` 是它最后修改的日期；`robots.txt` 里写了这份 sitemap。
- 代码：`shared/ask-public-page.ts`（数据校验、去重、收录规则和页面）、`api/ask-lizheng-public.ts`（从 Ops 的 `index` 一次读出全部公开问题，暖着的函数留5分钟；`vercel.json` 只在 www 上把这三个地址交给它）、`client/public/ask/page.js`（不阻塞首屏地加载衬线字体，并把页面上点了哪个链接记成 Vercel Analytics 事件「Ask Page Link」）。字体走 `/fonts/serif.css`，构建时由 `scripts/prerender-guests.ts` 指向当次构建的字体文件。

收录规则：只收录一个问题的第一种问法（同一问题换个说法问的，网页保留，但告诉搜索引擎不要收录，判断方法和主页折叠相同，在 `shared/ask-question-shape.ts`）；回答要完整、有出处、正文至少200字。不是每次被问都新造一页：页面只来自已经去掉个人信息、经提问人同意公开的问答，撤下的问答网页返回404。CDN 缓存10分钟，所以撤下后网页大约十分钟内失效，搜索引擎下次抓取时移除；急需从 Google 搜索结果里拿掉，用 Search Console 的删除工具。隐私政策的「提问和回答」和「保存多久」已写明这些。

这和 `docs/seo-geo.md` 「不为GEO批量生成文章」的原则不冲突：这些页面不是为搜索写的，是已经公开给人看的问答换了一个能被找到的地址；数量随真实提问增长，质量不够的不收录。

## ask.lizheng.ai 的页面文件（2026-10-04）

用户提出：「别人在问什么」不用等 Builder 启动就该能看。Builder 闲置后休眠，原来 ask.lizheng.ai 的页面本身也从 Builder 取，所以休眠时人人先等十几秒唤醒页；其实页面只是静态文件，问题列表来自 Ops（经本站），都不需要 Builder。现在：

- 页面文件放在本站 `client/public/ask-app/`（`index.html`、脚本和样式，`version.json` 记着来自 ask-lizheng 的哪个提交）。`vercel.json`：ask.lizheng.ai 的 `/` 给 `/ask-app`，`/ask-app/assets/` 下的脚本样式是本站文件，标题字体（`noto-serif-sc-*.woff2`）用本站构建出的同一批文件；ask.lizheng.ai 的 `/robots.txt` 指向公开问答的 sitemap；www 上打开 `/ask-app` 跳到 ask.lizheng.ai。其他路径（`/api/meta` 等）照旧给 Builder。
- 页面一打开就显示，问题列表随即出现；读 `/api/meta`（Builder）最多等一分钟，3秒没回就说「问答服务正在唤醒，通常十几秒，可以先写问题」，醒来前不能发送。主页问答区同样。
- 改了 ask-lizheng 的前端（`src/`、`index.html`）：在 ask-lizheng 提交并推到 main，然后在本仓库 `pnpm sync:ask-app [ask-lizheng 路径]`（默认 `/Users/sunyuzheng/Desktop/AI/apps/ask-lizheng`），提交，按主站流程上线。不用再为纯前端改动部署 Builder。改了后端才部署 Builder。脚本要求 ask-lizheng 没有未提交的改动、两边 `@fontsource/noto-serif-sc` 版本相同，并把上一版的文件多留一次，给更新前刚打开的页面用。它同时把 ask-lizheng 的 `src/public-qa.js` 拷成 `shared/ask-public-qa.js`，并在 `version.json` 里记下哈希。
- 守护：`tests/ask-app-files.test.ts` 查页面引用的文件都在；构建时 `scripts/prerender-guests.ts` 查页面要的每个字体本站都有，缺了构建失败。

## 首屏标题（2026-10-04）

ask.lizheng.ai 首屏改为「卡住的时候，问问立正。」，下面一句「六年、四百多期视频（一半是会员视频）、两百多篇文章。AI从里面找出和你的问题相关的部分，整理成回答，每段都标明出处。」（数字依据和取舍见 ask-lizheng 仓库 docs/PRODUCT.md 同日一条）。主页问答区的介绍和公开问答页页尾跟着改成同一说法。App Store 上的介绍还是旧说法，下次更新 App 时再改。

## 《真本事》课程进入材料库（2026-10-04）

用户授权把《真本事》会员课程23节视频课的文字稿补进 Open Context（`course-lesson`），问问立正重建了语义索引。出处上标「会员课程」（主页问答区、ask.lizheng.ai、公开问答页一致），说明文字稿已公开、课程视频需超线性学院会员。首屏、主页问答区和公开问答页的介绍加上「《真本事》整门课」。

## 分享这条回答（2026-10-04）

用户要求每个提问和回答都能成为一个可以分享的单独页面，比图片和PDF轻，也能把人引来提问；分享就多一次提问机会，鼓励分享。用户在开发中定的规则：链接带日期，用一个和问题相关的英文词而不是随机码（`ask.lizheng.ai/s/2026-10-04/ai-work-value`，同一天撞词加 -2、-3）；能分享的就给搜索引擎，不给的就不分享；分享不是同意（提问时已同意保存和使用），只是一个功能，所以链接一直有效，提问者不能撤回；「保存图片」「下载PDF」收进「分享这条回答」；「结合我的处境」里填的内容不保存，并在界面上写明；奖励不提微信。

- 流程：Builder 在 v4 的完整回答里附 `share: {record_id, word, proof}`（proof 是 `HMAC-SHA256(ASK_QUOTA_STORE_SECRET, "ask-share:v1:<record_id>:<word>")`，word 来自模型的 `slug`，见 ask-lizheng 仓库 docs/QUERY_RECORDS.md）。页面点「分享这条回答」展开：一句话说清分享页显示什么，「复制分享链接」「保存图片」「下载PDF」。复制分享链接时 `POST /api/ask-lizheng/share`（www 和 ask 各自同源，`api/ask-lizheng-share.ts` → `shared/ask-share-link.ts`），返回链接并复制；手机上还有「发给朋友…」。没有 `share` 的回答（v3、旧服务器）只有图片和PDF。
- 存储（固定 Lua，`{v3}` 同一个 hash tag）：记录 HASH 加 `share_slug`、`shared_at`；`ask-ops:{v3}:share:<day>:<slug>` 指向记录 id，永久留给这条记录（记录删除后也不让给别的问题）；`ask-ops:{v3}:shares` 有序集合给站点地图用。只有 answered 的 v4 记录、还在、没有删除墓碑，才能分享；同一条再分享还是原地址。
- 分享页：`vercel.json` 把 ask.lizheng.ai 的 `/s/<day>/<slug>` 交给同一个函数，`shared/ask-share-page.ts` 按公开问答页的样式渲染问题、摘要、段落、边界、出处（不放字幕摘录）、页尾「去问问立正」和「也可以接着问」；用到处境的回答，推演段落标「结合提问者的处境」。每次实时读记录，`Cache-Control: no-store`，立正在 Ops 删除记录后立刻 404（「这个分享不在了」）。日期是记录自己的 `day`，日期或词对不上都打不开。www 上的 `/s/*` 308 到 ask；ask 上其他 `/s/*` 都给 404 页，不落到 Builder。
- 搜索：每个分享页都 `index, follow`，带和公开问答页一样的结构化数据；站点地图 `ask.lizheng.ai/s/sitemap.xml` 列出全部，ask 的 robots.txt 已写。
- 预览卡片：og:title 是问题，og:description 是摘要开头，og:image 是 `/og/ask-share.jpg`（1200×630，森林绿底、印章、「卡住的时候，问问立正。」，文字都在正中的正方形里，被裁成方图也完整），`itemprop` 的 image 是 `/og/ask-share-square.jpg`（印章方图，给微信缩略图）。微信不接公众号 JS-SDK 时，卡片取什么由微信决定，标题和描述一定对。
- 字体与脚本：分享页在 ask 域名上，只认 vercel.json 指定的路径。`/s/fonts.css` 由构建时的 `scripts/prerender-guests.ts` 写出，引用 ask-app 当前版本的标题字体样式；`/s/page.js` 加载字体，并把点击记为 Vercel 事件「Ask Page Link」（page 是 share）。
- 分享奖励：「分享这条回答，今天多问一次」。次数账本的主体本来就是本站 `resolveIdentity` 算的（Builder 只取 sha256），所以奖励由本站直接改账本键 `ask-quota:v1:{sha256(subject)}:<北京日>:used`：固定 Lua，当天 used 大于0才减1，同时写 `…:share-bonus` 标记（和账本一起过期），每天一次；不经过 quota-storage 的命令校验，也不碰它。Founding 不给；User-Agent 带 MicroMessenger 或 AskLizhengApp/ 不给，页面在这两处也不显示。session 多返回 `share_bonus`（今天分享还能不能多问一次），次数用完时次数行下面多一行「分享上面的回答，今天多问一次」。
- 处境不保存：Builder 的 `/api/meta` 里 `context_archive` 为 false，v4 开始记录的 `context` 为空。主页问答区和 ask 页对 v4 同时接受 true 和 false；false 时处境输入框下面用深色字写「这里填的内容只用来生成这次回答，我们不保存。」，「说明」里的「你的隐私」同样改写；隐私政策「结合我的处境」一条已改。
- 统计：usage 的 day 和 total 哈希里 `<入口>:share`、`all:share`（每条第一次分享）、`<入口>:share_bonus`、`all:share_bonus`、`all:share_view`（分享页被真人打开，不算爬虫和链接预览），私人 Ops「使用情况」的「分享」一栏读这些数；不记分享了什么。Vercel 事件「Ask Share」（surface 和 action：open、link、bonus、send）。
- 上线顺序：本站先上（页面先接受 `context_archive` 为 false），再上 Builder（开始附 `share`、不再保存处境），最后 Ops。反过来的话，旧页面看到 false 会暂停提问。测试：`tests/ask-share.test.ts`，`tests/test_ask_share_lua.py`（和真实的记录写入脚本、额度脚本一起跑）。

## 数据库升级提醒（2026-10-04）

问问立正、Ops 和分享都用 Vercel Storage 里的 Upstash 库 `ask-lizheng-kv`（原名 upstash-kv-byzantium-school；Fixed 250MB）。10-04 立正要求打开 Auto Upgrade（在 Upstash 控制台的库 Settings 里开，Vercel 的配置窗口里那个开关是锁住的），并且升级时要通知他。`api/ask-lizheng-db-watch.ts` 由 Vercel Cron 每天 01:00 UTC 调一次（`vercel.json` 的 `crons`）：读 `INFO memory` 的 `maxmemory`（套餐上限），和上次记在 `ask:watch:v1:db` 的不同就用邮箱验证码那把 Resend 密钥从 `立正 <podcast@notify.lizheng.ai>` 发信到 sunyuzheng@gmail.com；第一次运行发一封「提醒已开启」。项目设了 `CRON_SECRET` 时只有 Cron 能调；没设时谁调都只在套餐变化时发信。`used_memory` 和控制台的数据大小对不上（10-04 是 0.3MB 对 4–7MB），所以不用它判断快满了。同一天 Coffee Pass 换成自己的按量付费库 `stay-coffee-pass-kv`，不再和问问立正共用。

## 公开问答怎么说（2026-10-04）

立正想用一个比方让大家直观理解这个场域。定为「在讲座上举手提问」：问答会公开，像讲座有录像、放到网上、搜得到；不记名，我们不知道是谁问的；「结合我的处境」像递给台上的一张纸条，只用来回答、不保存，但回答可能提到纸条上的内容；做法是只写愿意当众说的话。输入框下写「这里像在讲座上举手提问：问答会公开，但不记名。只写愿意当众说的话。」（立正同意不再写「提问表示同意」）。

这些话只有一份：ask-lizheng 的 `src/public-qa.js`。`pnpm sync:ask-app` 把它拷成本仓库的 `shared/ask-public-qa.js`（类型在 `shared/ask-public-qa.d.ts`），主页问答区的提示、「说明」、处境和分享面板都从它取（主页用「我」，ask页面用「立正」）。`tests/ask-public-qa.test.ts` 检查拷贝和 `version.json` 记的哈希一致（不能在这里手改），并检查隐私政策中英文开头那段和它的 `policy` 一字不差。改措辞：在 ask-lizheng 改、提交、推 main，再在这里同步；要改隐私政策开头，同时改这页。App 第一次提问前的同意页（ask-lizheng `AppConsent`）不在这份文件里，改它要顾及苹果审核。

## 看的东西写成文件（2026-10-04）

立正看了整体架构后决定：大家看的东西在写的时候就生成好，看的时候不再去查数据库，这样数据库或后台出事时，「别人在问什么」、公开问答页和分享页照常能看（ask-lizheng 的 `docs/ARCHITECTURE.md`）。两个站都读一个私有的 Vercel Blob 存储，用它自己的令牌 `ASK_FILES_BLOB_TOKEN`（本项目原有的 `BLOB_READ_WRITE_TOKEN` 是社区地图的公开存储，不混用）：

- `public/`：Ops 在公开问答变化时写列表、索引和每条回答，每次完整导出后写心跳 `public/state.json`（ask-lizheng-ops 的 docs/public-discovery.md「公开内容写成文件」）。本站 `shared/ask-public-files.ts` 的 `publicJson`：心跳三分钟内就用文件，文件里没有的问题就是已撤下（404）；心跳过期就问 Ops；Ops 也答不上来才拿最后一份文件顶上。所以导出一直失败也不会让撤下的问答留着。`/api/ask-lizheng/discovery/lists`、`detail` 和 `/ask` 的页面都走它；旧的分页列表照旧问 Ops。CDN 缓存不变（列表1分钟、问答页10分钟）。
- `share/<day>/<slug>.json`：分享时本站顺手写一份回答的副本（没配令牌就不写）。分享页照旧实时读记录（删除立刻生效、真人打开要计数），只在数据库答不上来时用副本；数据库说已经没有了，就不用副本。Ops 删除记录前先删副本，删不掉就不删记录。这个功能上线前分享过的页面没有副本，要等再被分享一次。
- 隐私政策「保存多久」加了一句：每天另存一份备份，留30天，删除的问答在之前的备份里最多再留30天（备份在 Ops，见它的 docs/backup.md）。
- 旧回答里的内部出处编号：2026-10-04 之前有些回答在正文里写了「S1 说得更直接」这类内部编号（Builder 之后改成只在引用标记 [S1] 里出现）。主站送出回答时（`/api/ask-lizheng/discovery/detail`、`/ask/<id>` 页面、分享页）把这类编号读成读者看到的「出处1」（`shared/ask-source-labels.ts`，只换这条回答自己的出处编号，不动引用标记和原文摘录），所以不用改已经公开的数据。
- 看实际读的是哪里：列表、回答和 `/ask` 页面的响应头 `X-Ask-Public-Source` 是 `files`（文件）、`ops`（问了 Ops）或 `last-files`（Ops 答不上来，用了最后一份文件）。
- 测试：`tests/ask-public-files.test.ts`（什么时候信文件、什么时候问 Ops）、`tests/ask-share-copy.test.ts`（副本只在数据库答不上来时顶上）。

## 会员核验少查 Circle、《真本事》页的聊天下线（2026-10-05）

10-05 看服务用量时发现两件事，立正说「要处理的处理掉」「会员核验我们自己想办法」「/zbs可以下线了，这个可以完全取代」。

- 会员核验：以前每次登录都向 Circle 管理接口查一次，登录后每15分钟再查一次，没有上限；这个接口按月有额度，和学院其他工具共用（规则见 `docs/community-city.md` 引的 circle-data-analytics 文档）。现在 `foundingStatus`（`shared/ask-access.ts`）先看上次查到的结果：用邮箱的加密摘要记30天（键 `ask:member:v1:<摘要>`，值只有是否 Founding 和时间），是 Founding 的一周内不再查，不是的一天内不再查（登录时一小时，刚加入的人再登录一次就能认出来）；登录后的会话每小时看一次这个结果。每个自然月（UTC）最多真正查 `CIRCLE_MONTHLY_LIMIT` = 1,000 次（计数键 `ask:member:v1:circle:<YYYY-MM>`），用完或 Circle 查不了时沿用上次结果；从没查过的人超额时按普通身份，Circle 出错时登录照旧报错。每天的数据库检查（`api/ask-lizheng-db-watch.ts`）在用到八成时给立正发一封邮件，每月最多一封。隐私政策「保存多久」加了「Founding身份的核验结果最多保存30天」。测试：`tests/ask-access.test.ts`「asking Circle rarely」、`tests/ask-db-watch.test.ts`「the member-check count」。
- `/zbs`：书页保留（购买入口、目录、推荐语都在），原来调用 Anthropic 的聊天（`api/chat.ts`）删除，那一块换成问问立正的入口，用 ask.lizheng.ai 和主页已有的话；开源的《真本事》Skill 那块留着。`ANTHROPIC_API_KEY` 不再需要。

## 公开问答原样公开（2026-10-05）

立正：「自动去个人信息这一步删掉吧，没必要了。」此后「别人在问什么」和公开问答页原样展示问题和完整回答，AI 只判断值不值得公开、归到主题（ask-lizheng `/api/curate` 的 `v: 2`，Ops 按提问时间决定用哪一版；之前问的人看到的是「去掉个人信息后公开」，仍按原来的方式改写）。`/api/meta` 的 `public_display` 改成 `as_asked`，本站主页问答区两种都认。改了的说法：主页问答区说明「真实的提问和回答，由AI挑选后原样展示。」、`/ask` 页的描述和导语、隐私政策三处（公开问答与同意、保存什么、DeepSeek 那条）和英文对应句、App 支持页「别人在问什么是什么」、两个 robots.txt 的注释；ask.lizheng.ai 的说明和同意框随 `pnpm sync:ask-app` 进来。
