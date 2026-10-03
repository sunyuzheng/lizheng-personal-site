# 问问立正：主页与域名集成

问答和公开资料检索的owner是[ask-lizheng](https://github.com/sunyuzheng/ask-lizheng)，资料owner是[lizheng-open-context](https://github.com/sunyuzheng/lizheng-open-context)。本仓库只负责主页原生组件与Vercel入口，不复制语义索引、模型密钥或回答生成逻辑。

- 主页：文章之后独立的问问立正章节（AskLizheng组件）；两种问法（想明白，可打开「结合我的处境」；从哪读起）、可修改预填、真实阶段、候选资料片段、核验后的回答和出处、停止与追问，完整回答可保存为长图或PDF。英文界面明确资料与回答主要使用中文。
- 主页API：POST /api/ask-lizheng/ask、GET /api/ask-lizheng/meta，POST通过固定目标Edge流式转发到Builder的/api/ask，GET反代到/api/meta。无客户端模型凭证；问答请求不发送浏览器凭证、不缓存。访客提问在转发前另按网络入口计数（每个北京日300次，见ask-lizheng仓库ACCOUNT_QUOTAS.md），防止不保存Cookie的客户端绕过每天3次。超限时同样返回quota_exhausted，另带scope: network，页面据此说明是这个网络的免费次数用完了。
- Founding说明：次数行「如何成为」展开谁是Founding Member、会员得到什么，并链接Stay会员页；额度用完的卡片同样给出会员页链接。名额（前3,000位新年费会员）与价格（$149/¥999）取自会员页与会员事实表，Founding窗口结束或价格变化时同步改`AskLizheng.tsx`（foundingWho、foundingGet）和ask仓库`src/main.jsx`的`FoundingInfo`。
- 独立页面：ask.lizheng.ai的host路由反代现有ask-lizheng.ai-builders.space应用，包括资产和API；/api/ask同样经过流式转发，Vercel托管域名与TLS，Builder托管模型调用、检索与Docker应用。cleanUrls/trailingSlash的现有规范化可能先产生308。
- Builder休眠：Koyeb上的Builder闲置5分钟后深度休眠，唤醒通常几秒，最长约半分钟。ask.lizheng.ai根路径先进`api/ask-lizheng-page.ts`（Edge）：Builder在1.5秒内给出页面就原样转发；否则返回503唤醒页（显示等待秒数，轮询`/api/meta`，醒来后自动刷新；10秒内不重复自动刷新，45秒后提示手动刷新）。资产和API路径照旧直达Builder。主页与独立页读次数1.5秒未回应时显示「正在唤醒问答服务…」，失败后自动重试一次；提问5秒还没连上时说明服务在唤醒。
- 提问说明v4（2026-10-02已定，前后端已实现并宣布）：主页在`/api/meta`宣布`ops_logging.notice: "v4"`（并有`context_archive: true`、`public_display: "deidentified"`）时，换成「问答会保存，去掉个人信息后可能公开，帮到有同样问题的人」的说明（2026-10-03改写，原句是「很多问题是共性的……去掉个人信息后可能整理公开」，含义不变）和四段细则，请求带`query_log_notice: "v4"`；转发层对v4与v3一样签入匿名visitor。完整约定与文案见ask-lizheng仓库`docs/QUERY_RECORDS.md`。
- 个人站writer（`shared/ask-ops-storage.ts`）接受v4开始记录，多带notice_version、has_background和处境原文（只给所有者），写入同一记录HASH；v3形状不变。
- 保存说明的写法（2026-10-02）：输入框下一句写匿名与用途（「提问是匿名的。问答会保存下来，用来改进回答；请勿填写私密信息。」），「说明」展开后与v4同样分四段（为什么保存、保存什么、你的隐私、另外），「你的隐私」讲提问匿名、登录只核验身份且不和提问记在一起。不写「不追踪」或「验证后立刻忘掉」：有匿名的访问计数和使用标识，登录状态加密保存12小时。「直到立正手动删除」这类实现细节不写给用户，保存与删除行为不变；两边文案在`AskLizheng.tsx`的noticeV3/noticeV3Parts与ask仓库`src/main.jsx`的OPS_NOTICE/V3_PARTS。
- 别人在问什么（2026-10-02）：主页（中文）和ask.lizheng.ai首页在没有对话时，用Ops里已发布的真实问答替代示例问题，不分排序。每次访问读主题列表最多三页（每个主题一条，最多60个）和最新20条。同一个问题换个说法的合并成一张卡（`foldDiscovery`/`sameQuestion`），显示最近问的说法，「N次类似提问」是所在主题的提问数加上被归到别的主题的同一个问题（`similarCount`）。四张卡轮流排：最近问的（role fresh）、类似提问最多的（role common，每个主题一次，用最近被问的问题代表；同样多的按点赞、主题种子、只问过一次的顺序）、次近的、次多的；每一类里这个浏览器没看过的先出，刷新换下一批，尽量一个主题一条（2026-10-03）。看过哪些记在本机localStorage（`ask-discovery-seen`），选题规则在`client/src/lib/ask-discovery.ts`的`pickDiscovery`，ask仓库`src/discovery.js`照搬同一规则。点开在原地展开完整回答和出处，「问个类似的」只预填输入框，登录后可点赞；攒够点赞再考虑高赞。数据走`/api/ask-lizheng/discovery/*`，www与ask两个域名各自同源（`api/ask-lizheng-discovery.ts`只接受这两个host，Origin须与host一致）。没有已发布问答时照旧显示示例。问答由Ops自动整理发布（每15分钟一轮，v4、无处境、首轮的提问，AI去掉个人信息并判断后直接发布）。新鲜的卡顶部显示提问时间（Ops给出精确到5分钟的原提问时间，显示成23分钟前、3小时前……，绿色，一小时内前面加一个跳动的小绿点），类似提问数在下面；常问的卡顶部是深色的「N次类似提问」；类似提问只有1次的主题种子显示灰色「常被问到」；不再显示AI总结的主题小标题；标题旁写「最近24小时 N 个新问题」（满20写20+，少于3条不显示）（2026-10-03）。会员视频出处的卡片里有「加入 YouTube 频道会员」，出处外面不再单独放会员说明。隐私政策写明公开时显示大约的提问时间，见ask-lizheng-ops的docs/public-discovery.md「自动整理」。独立浏览页以后再说。
- 转化统计（2026-10-02）：Vercel Web Analytics（Pro，每个事件最多2个属性；UTM报表要Web Analytics Plus，现未开通）。事件都带`surface`（home或ask）：Ask Question（from：typed/example/card/followup，ask页另有clarify）、Ask Discovery Open/Similar（visit：first第一次看到这一区/return再来）、Ask Discovery Vote（vote）、Ask Founding Info、Ask Verify Start、Ask Verify Result（result）、Ask Membership Click（location：founding_panel/quota_card，ask页另有about）、Ask Source Click（kind：article/video/community/other）、ask页的Ask Community Click（location：rail）。会员链接带`utm_source=ask-lizheng&utm_medium=<位置>`。事件不含提问内容或身份；ask页脚本只在lizheng.ai域名加载。
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

问问立正iPhone App（ask-lizheng-ios仓库）显示ask.lizheng.ai，User-Agent带`AskLizhengApp/<版本>`。2026-10-03为上架App Store：App里的验证页只给邮箱验证码，不给「使用超线性学院账号登录」，因为学院登录页带注册入口，而苹果要求允许注册的App也能在App里删除账号；邮箱验证码不建账号。隐私政策在`/ask/privacy`，帮助与联系在`/ask/support`（`client/public/ask/`下的静态页，中英文），App Store的隐私政策与支持网址指向这两页。数据用途改变时，两页、ask页面的「说明」和App的隐私声明要一起改。

## 回答排版（2026-10-03）

主页问答区和 ask.lizheng.ai 用同一套段落标签：「AI综合」是默认，不标；只标「材料里的观点」和「AI推演」，提问带了处境时显示「结合你的处境」。正文已有角标的段落不再重复出处行；「边界」里提到的 S 编号显示成角标；摘要用衬线字体。导出长图（`client/src/lib/ask-share.js`）同步。回答写法的规则在 ask-lizheng 仓库的 `server/answers.py`。

## 使用统计（2026-10-03）

用户想知道用户时长、滚动深度、留存、多少人看「别人在问什么」，并问去哪里看。Vercel Analytics 只有访问量、来源、设备和按钮点击次数，没有停留时间、滚动和回访，所以另做了一份自己的匿名统计，在私人Ops（https://www.lizheng.ai/ops/ask-lizheng ）的「使用情况」里看；流量来源、国家、设备和按钮点击次数照旧看 Vercel 项目的 Analytics。

- 页面：主页问答区（`client/src/lib/ask-usage.ts`，surface `home`）、ask.lizheng.ai（ask 仓库 `src/usage.js`，`ask`，App 里是 `app`）。每次打开页面先发一次（普通请求，好让 Cookie 留下），之后页面隐藏或关闭时用 beacon 补发新增部分。阅读时间只算页面在前台、30秒内有操作的时间。每个记号一次打开只发一次：阅读满10秒/30秒/1分钟/3分钟/10分钟（`t10`…`t600`）、滚过25%/50%/75%/到底（`s25`…`s100`）、看到主页问答区（`h_seen`）、「别人在问什么」显示/看到/点开/问个类似的/看更多（`d_shown` `d_seen` `d_open` `d_similar` `d_more`）、提问、得到回答、点开出处、保存图片或PDF。
- 服务端：`POST /api/ask-lizheng/usage`（两个域名各自同源，`api/ask-lizheng-usage.ts` → `shared/ask-usage.ts`），只收这五个字段，记号有白名单；爬虫、预览和无头浏览器不算；同一网络每天最多600次；`ASK_USAGE_ENABLED=false` 可以关掉。浏览器用主站已有的匿名 Cookie（`__Secure-ask-guest`，30天），存进统计的是另一种用途的加密摘要；`__Secure-ask-first` 记第一次来的日期（400天），用来算回访。
- 存储：Upstash 里 `ask-ops:{v3}:usage:` 下按天的计数（`day:<日>`，每个入口和合计）、HyperLogLog 去重的浏览器数（每天、每个入口、几个漏斗记号、按第一次来那天分组的回访），按天的键400天后过期；`total` 和全部时间的去重数不过期。Ops 的 `shared/usage-store.ts` 读这些键。
- 隐私政策的「访问统计」写明了这些（停留、滚动、看到和点开「别人在问什么」、回访，按天合计，不含提问内容）。
- 主页（2026-10-04）：每一章出现在屏幕上时记一次（`c_works` 代表作、`c_city` 这座城、`c_talks` 对话、`c_calls` 公开判断、`c_writing` 文章、`c_join` 加入；问问立正还是 `h_seen`），Ops 面板的「主页读到哪一章」按主页打开次数算比例。主页上点了哪个链接记成 Vercel Analytics 事件「Home Link」：`section` 是链接所在章节的 id（或 header/footer），`to` 是去向（本站页面去掉语言前缀如 `/guests`，页内锚点如 `#join`，外站是域名加第一段路径，如 `superlinear.academy/` 是免费加入、`superlinear.academy/c` 是帖子）。问问立正区里的链接不重复记，它有自己的「Ask …」事件。代码在 `client/src/pages/Home.tsx`（`useHomeCounts`）和 `client/src/lib/link-target.ts`。

## 设计（2026-10-03）

Cursor 的设计负责人 Ryo Lu 说问问立正「有点太AI了」，用户要求重新设计：读起来舒服、有重点；bold、优雅、不busy；该用品牌色的地方用。ask.lizheng.ai 先改（ask 仓库 docs/PRODUCT.md 同日一条），主页问答区跟着改成同一套：章节标题像其他章节一样靠左；问题框是一张奶白卡片，页面上唯一实心的绿色按钮写「提问」；「别人在问什么」左边是标题和「最近问 ↗ · 最常问 ↗ · 没看过」，右边是细线分开的问题列表，不再有卡片和图标；回答像一篇文章（问题用大号宋体加一条黑线、摘要放大、引用是贴着字的绿色上标、出处是编号注释、操作只是文字按钮）。主页上「最近问」「最常问」打开 ask.lizheng.ai 对应的全部问题（`#recent`、`#frequent`），「没看过」就是这里显示的这一批。Open Context 收成章节末尾的一行。

## 公开问答页与搜索（2026-10-04）

用户说问问立正也可以做SEO，尤其是那些提问和回答。「别人在问什么」里公开的每一条问答，现在在 www.lizheng.ai 有自己的网页，服务端渲染，问题、回答和出处都在第一份HTML里，搜索引擎和AI搜索不用执行JavaScript就能读到：

- `/ask/<public_id>`：一条问答。标题是问题，描述是摘要；顶部森林绿上是话题、提问日期和「N次类似提问」，正文和 ask.lizheng.ai 的回答排法一样（摘要放大、绿色角标、「材料里的观点」「AI推演」、边界说明、编号出处），页尾是「问类似的问题」、几条「也可以接着问」（带着问题打开 ask.lizheng.ai，`?q=` 只填进输入框，不会发送）和「别人还问了」。出处只显示标题、类型、日期和引用理由，不放字幕摘录；会员视频和会员帖子标「会员」。
- `/ask`：所有公开问题，一个问题一行，最新提问在前。
- `/ask/sitemap.xml`：`/ask` 和每条可收录的问答，`lastmod` 是它最后修改的日期；`robots.txt` 里写了这份 sitemap。
- 代码：`shared/ask-public-page.ts`（数据校验、去重、收录规则和页面）、`api/ask-lizheng-public.ts`（从 Ops 的公开列表读，`vercel.json` 只在 www 上把这三个地址交给它）、`client/public/ask/page.js`（不阻塞首屏地加载衬线字体，并把页面上点了哪个链接记成 Vercel Analytics 事件「Ask Page Link」）。字体走 `/fonts/serif.css`，构建时由 `scripts/prerender-guests.ts` 指向当次构建的字体文件。

收录规则：只收录一个问题的第一种问法（同一问题换个说法问的，网页保留，但告诉搜索引擎不要收录，判断方法和主页折叠相同，在 `shared/ask-question-shape.ts`）；回答要完整、有出处、正文至少200字。不是每次被问都新造一页：页面只来自已经去掉个人信息、经提问人同意公开的问答，撤下的问答网页返回404。CDN 缓存10分钟，所以撤下后网页大约十分钟内失效，搜索引擎下次抓取时移除；急需从 Google 搜索结果里拿掉，用 Search Console 的删除工具。隐私政策的「提问和回答」和「保存多久」已写明这些。

这和 `docs/seo-geo.md` 「不为GEO批量生成文章」的原则不冲突：这些页面不是为搜索写的，是已经公开给人看的问答换了一个能被找到的地址；数量随真实提问增长，质量不够的不收录。
