# 问问立正：主页与域名集成

问答和公开资料检索的owner是[ask-lizheng](https://github.com/sunyuzheng/ask-lizheng)，资料owner是[lizheng-open-context](https://github.com/sunyuzheng/lizheng-open-context)。本仓库只负责主页原生组件与Vercel入口，不复制语义索引、模型密钥或回答生成逻辑。

- 主页：中英文文章区域内的AskLizheng组件；三种意图、可修改预填、选填背景、真实阶段、候选资料片段、核验后的回答和出处、停止与追问。英文界面明确资料与回答主要使用中文。
- 主页API：POST /api/ask-lizheng/ask、GET /api/ask-lizheng/meta，同源反代到Builder的/api/ask与/api/meta。无客户端模型凭证；问答请求不发送浏览器凭证、不缓存。
- 独立页面：ask.lizheng.ai的host路由反代现有ask-lizheng.ai-builders.space应用，包括资产和API；Vercel托管域名与TLS，Builder托管模型调用、检索与Docker应用。cleanUrls/trailingSlash的现有规范化可能先产生308。
- 对话只在当前页面内存中；刷新清空。问题和背景会发送给Builder处理。本产品不保存或记录对话，不能由此承诺基础设施供应商从不处理日志。
- 原关键词搜索保留在折叠区，不改变其索引或原文导航。Open Context公开入口仍在下方。

本地开发的同源代理默认为http://127.0.0.1:8000，可用ASK_LIZHENG_DEV_TARGET覆盖。先运行问答仓库的服务，再运行本仓库的pnpm dev。协议测试：使用只包含client/src/lib/ask-lizheng.test.ts、node环境的Vitest配置，覆盖UTF-8/CRLF分块、材料先出现、断线、取消、限额与错误。

## 发布与核验

候选更新需要按docs/content-system.md的发布规则审阅精确diff、目标和受众。域名绑定的唯一新增记录是Vercel项目prj_1KMe0nebASAOyDyeHziloegiipL7下的ask.lizheng.ai；当前权威NS由实际DNS查询核对为ns1.vercel-dns.com与ns2.vercel-dns.com。此更新不修改apex、www、邮箱或其他子域记录。

先发布已经批准的Builder模型版本并确认/api/meta，然后发布主页main，绑定已经批准的ask域名。核验TLS、默认模型、真实SSE先收到候选资料、完整回答与出处、停止、手机布局、旧搜索和主页其他区块。代理要明确禁用CDN缓存。模型选择和服务端来源验证仍只由问答owner管理。
