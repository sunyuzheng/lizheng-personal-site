# 社区播客嘉宾资料收集

报名入口：`https://www.lizheng.ai/guest-intake`。
管理入口：`https://www.lizheng.ai/ops/guest-intake`。

页面内容依据本次已审阅的姜喵长期嘉宾招募说明，保留七项收集方向，以四步表单引导填写。资料仅用于嘉宾梳理、节目匹配和联系；录制及公开介绍另行确认。

## 页面与构建

`client/guest-intake/index.html` 是独立Vite入口，`client/src/guest-intake/` 提供报名和管理界面。单独加载样式，不修改主站首页或其他页面的样式。`vercel.json` 将两个正式路径路由到该入口。报名者无需登录；管理页先核验授权再读取资料。两条路径均不进入搜索索引。

## 数据与权限

`api/guest-intake.ts` 提供submit、session、list、update和export操作。资料使用站点现有私人Redis的独立 `guest-intake:{v1}:` 命名空间，按长期嘉宾池用途保存，并以独立的`GUEST_INTAKE_ENCRYPTION_KEY`密钥加密；不写入公开静态文件或Git仓库。

管理员使用网站现有的超线性学院登录或邮箱验证码流程。`GUEST_INTAKE_ADMIN_EMAILS` 在Vercel Production环境配置为邮箱白名单；不在源码保存实际邮箱。该权限独立于问问立正的运营权限。

申请者在本设备保存草稿，成功提交后清除。服务端限制实际请求字节数，校验必填信息及同意范围，重复提交使用同一UUID去重；不记录原始网络地址。管理端分页读取全部资料后提供检索、状态筛选和本地CSV导出，导出对公式前缀转义。

## 验证

`pnpm check`、`pnpm test:ask-lizheng`、`pnpm build`。嘉宾池测试包含资料校验、持久化与去重、加密、分页、CSV、独立管理员权限，以及邮箱验证和SSO回到管理页的回归。线上检查使用虚构测试报名，并在核验后移除。
