# 主页问问立正组件

主页的原生问答已独立为 `client/src/components/home/AskLizheng.tsx`，可直接沿用组件，外层页面继续刷新设计。它包含预填问题、补充背景、三种提问意图、真实进度、候选材料、逐段回答、出处、停止与重试；AI生成及公开材料边界也在组件内说明。

## 页面接入

组件使用 `lang="zh"` 或 `lang="en"`。主页上它单独成章：`Ask.tsx` 渲染 `#ask` 区块，位于「最近在想的事」之后、「加入超线性学院」之前，导航里叫「问问立正」。组件头部（h2标题、说明、AI回答提示、完整页面链接）就是这一章的标题区，文案在 `content.ts` 的 `HOME_COPY[lang].ask`。保留根锚点 `#ask-lizheng`，登录完成和页内入口依赖它。外观在同目录 `home.css` 的 `.lz-ask-*` 下；可改排版、颜色、间距，保留状态与无障碍属性。

传输层位于 `client/src/lib/ask-lizheng.ts`：同源 `/api/ask-lizheng/ask` 和 `/api/ask-lizheng/meta`。页面不直接持有模型凭证，也不直接访问Circle。`api/ask-lizheng.ts` 负责转发SSE，`vercel.json` 保留主页和ask.lizheng.ai的路由。

账号层位于 `client/src/lib/ask-account.ts`，前端只依赖session/login/logout合同：enabled、authenticated、founding、remaining、reset_at。验证弹窗完成后刷新身份，不自动发送问题。账号入口文案为“验证Founding身份”，可接邮箱验证或Academy SSO，不把页面设计绑定到某个认证提供方。

本批身份入口默认使用邮箱验证码，路由仍为同源`/api/ask-lizheng/auth/*`。`api/ask-lizheng-quota.ts`是Builder调用的受保护额度存储端点；只接受签名的固定额度操作。邮箱、Circle及Redis凭证只保存在Vercel服务端，不能放到页面组件或Builder公开部署参数中。后端合同由`ask-lizheng`仓库的`docs/ACCOUNT_AUTH_HANDOFF.md`维护。

## 当前交付状态

主页架子已发布到 `https://www.lizheng.ai/#ask-lizheng`，代码位于 `sunyuzheng/lizheng-personal-site` 的 `main`。组件包含逐段显示和等待反馈的处理；这些状态依赖后端实际返回的事件。代码中账号及每日额度默认关闭；生产已完成邮箱验证码、真实会话及额度验收并启用。规则是每天3次、Founding Member不限次。

当前候选包含问答、转发、邮箱一次性验证、额度存储边界与跨午夜重试测试，TypeScript检查与生产构建通过。实际Python→Node→Redis链路已用隔离合成身份验证三次限制、失败释放与不限次档位；获批真实邮箱及生产两入口已通过验收。

整体设计刷新可先在当前主页工作区继续。问答接口、资料owner、身份核验和存储配置独立演进；无须把认证逻辑或模型调用写进页面组件。

## 提问记录与模型更新候选

用户指定默认DeepSeek V4 Flash，并要求保存问题。组件的输入框旁新增中英文30天保存提示，提交附query_log_notice:v1；旧客户端未附版本则继续不记录。只保存问题、时间、模型、状态和耗时，不关联账号、邮箱或IP，不保存背景、历史或完整答案，自动过期。关于输入的展开说明同步更新，布局与主页设计保持现有结构。后台meta公开query_logging启用状态。

api/ask-lizheng-query.ts是固定受保护写端点，须位于ask host catchall之前；使用独立query proof前缀、字段白名单、固定Lua和30天TTL。ASK_QUERY_LOG_ENABLED默认false，服务端配置true后启用。Builder仍不持有Redis凭证。owner本机可用pnpm exec tsx scripts/read-ask-query-records.ts --limit 20读取元数据，显式--include-question才读正文；不设公开读取接口，输出不可贴到公开仓库或日志。具体协议、保留和发布协调由后台docs/QUERY_RECORDS.md维护。
