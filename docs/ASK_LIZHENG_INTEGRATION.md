# 主页问问立正组件

主页的原生问答已独立为 `client/src/components/home/AskLizheng.tsx`，可直接沿用组件，外层页面继续刷新设计。它包含预填问题、补充背景、三种提问意图、真实进度、候选材料、逐段回答、出处、停止与重试；AI生成及公开材料边界也在组件内说明。

## 页面接入

组件使用 `lang="zh"` 或 `lang="en"`。主页上它单独成章：`Ask.tsx` 渲染 `#ask` 区块，位于「最近在想的事」之后、「加入超线性学院」之前，导航里叫「问问立正」。组件头部（h2标题、说明、AI回答提示、完整页面链接）就是这一章的标题区，文案在 `content.ts` 的 `HOME_COPY[lang].ask`。保留根锚点 `#ask-lizheng`，登录完成和页内入口依赖它。外观在同目录 `home.css` 的 `.lz-ask-*` 下；可改排版、颜色、间距，保留状态与无障碍属性。

传输层位于 `client/src/lib/ask-lizheng.ts`：同源 `/api/ask-lizheng/ask` 和 `/api/ask-lizheng/meta`。页面不直接持有模型凭证，也不直接访问Circle。`api/ask-lizheng.ts` 负责转发SSE，`vercel.json` 保留主页和ask.lizheng.ai的路由。

账号层位于 `client/src/lib/ask-account.ts`，前端只依赖session/login/logout合同：enabled、authenticated、founding、remaining、reset_at。验证弹窗完成后刷新身份，不自动发送问题。账号入口文案为“验证Founding身份”，可接邮箱验证或Academy SSO，不把页面设计绑定到某个认证提供方。

本批身份入口默认使用邮箱验证码，路由仍为同源`/api/ask-lizheng/auth/*`。`api/ask-lizheng-quota.ts`是Builder调用的受保护额度存储端点；只接受签名的固定额度操作。邮箱、Circle及Redis凭证只保存在Vercel服务端，不能放到页面组件或Builder公开部署参数中。后端合同由`ask-lizheng`仓库的`docs/ACCOUNT_AUTH_HANDOFF.md`维护。

## 当前交付状态

主页架子已发布到 `https://www.lizheng.ai/#ask-lizheng`，代码位于 `sunyuzheng/lizheng-personal-site` 的 `main`。组件包含逐段显示和等待反馈的处理；这些状态依赖后端实际返回的事件。账号及每日额度开关默认关闭，未配置时不会妨碍已有问答。最新规则是每天3次、Founding Member不限次；真实验证路径和额度启用在后续配置验收后上线。

当前候选包含问答、转发、邮箱一次性验证、额度存储边界与跨午夜重试测试，TypeScript检查与生产构建通过。实际Python→Node→Redis链路已用隔离合成身份验证三次限制、失败释放与不限次档位；真实账号仍须通过邮件验收后启用。

整体设计刷新可先在当前主页工作区继续。问答接口、资料owner、身份核验和存储配置独立演进；无须把认证逻辑或模型调用写进页面组件。
