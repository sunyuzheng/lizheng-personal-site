# 问问立正：主页与域名集成

问答和公开资料检索的owner是[ask-lizheng](https://github.com/sunyuzheng/ask-lizheng)，资料owner是[lizheng-open-context](https://github.com/sunyuzheng/lizheng-open-context)。本仓库只负责主页原生组件与Vercel入口，不复制语义索引、模型密钥或回答生成逻辑。

- 主页：文章之后独立的问问立正章节（AskLizheng组件）；两种问法（想明白，可打开「结合我的处境」；从哪读起）、可修改预填、真实阶段、候选资料片段、核验后的回答和出处、停止与追问，完整回答可保存为长图或PDF。英文界面明确资料与回答主要使用中文。
- 主页API：POST /api/ask-lizheng/ask、GET /api/ask-lizheng/meta，POST通过固定目标Edge流式转发到Builder的/api/ask，GET反代到/api/meta。无客户端模型凭证；问答请求不发送浏览器凭证、不缓存。访客提问在转发前另按网络入口计数（每个北京日300次，见ask-lizheng仓库ACCOUNT_QUOTAS.md），防止不保存Cookie的客户端绕过每天3次。超限时同样返回quota_exhausted，另带scope: network，页面据此说明是这个网络的免费次数用完了。
- Founding说明：次数行「如何成为」展开谁是Founding Member、会员得到什么，并链接Stay会员页；额度用完的卡片同样给出会员页链接。名额（前3,000位新年费会员）与价格（$149/¥999）取自会员页与会员事实表，Founding窗口结束或价格变化时同步改`AskLizheng.tsx`（foundingWho、foundingGet）和ask仓库`src/main.jsx`的`FoundingInfo`。
- 独立页面：ask.lizheng.ai的host路由反代现有ask-lizheng.ai-builders.space应用，包括资产和API；/api/ask同样经过流式转发，Vercel托管域名与TLS，Builder托管模型调用、检索与Docker应用。cleanUrls/trailingSlash的现有规范化可能先产生308。
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
