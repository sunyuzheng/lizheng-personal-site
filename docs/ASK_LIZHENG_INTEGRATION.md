# 主页问问立正组件

主页的原生问答已独立为 `client/src/components/home/AskLizheng.tsx`，可直接沿用组件，外层页面继续刷新设计。它包含预填问题、补充背景、三种提问意图、真实进度、候选材料、逐段回答、出处、停止与重试；AI生成及公开材料边界也在组件内说明。

## 页面接入

组件使用 `lang="zh"` 或 `lang="en"`；当前主页已经接入。保留根锚点 `#ask-lizheng`，登录完成和页内入口依赖它。外观在同目录 `home.css` 的 `.lz-ask-*` 下；可改排版、颜色、间距，保留状态与无障碍属性。

传输层位于 `client/src/lib/ask-lizheng.ts`：同源 `/api/ask-lizheng/ask` 和 `/api/ask-lizheng/meta`。页面不直接持有模型凭证，也不直接访问Circle。`api/ask-lizheng.ts` 负责转发SSE，`vercel.json` 保留主页和ask.lizheng.ai的路由。

账号层位于 `client/src/lib/ask-account.ts`，前端只依赖session/login/logout合同：enabled、authenticated、founding、remaining、reset_at。验证弹窗完成后刷新身份，不自动发送问题。账号入口文案为“验证Founding身份”，可接邮箱验证或Academy SSO，不把页面设计绑定到某个认证提供方。

## 当前交付状态

主页架子已发布到 `https://www.lizheng.ai/#ask-lizheng`，代码位于 `sunyuzheng/lizheng-personal-site` 的 `main`。组件包含逐段显示和等待反馈的处理；这些状态依赖后端实际返回的事件。账号及每日额度开关默认关闭，未配置时不会妨碍已有问答。最新规则是每天3次、Founding Member不限次；真实验证路径和额度启用在后续配置验收后上线。

当前主页候选的79项问答/转发/账号测试、TypeScript检查和生产构建已通过。浏览器已用合成身份检查额度耗尽、保留问题、验证回跳和手机布局；这不代表真实账号已上线。

整体设计刷新可先在当前主页工作区继续。问答接口、资料owner、身份核验和存储配置独立演进；无须把认证逻辑或模型调用写进页面组件。
