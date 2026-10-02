# 问问立正 Ops：独立仓库

后台的页面、统计、问答存档读取、分页导出和手动删除由独立私有仓库 `sunyuzheng/ask-lizheng-ops` 及独立 Vercel 项目维护。该项目的 README 是后台架构与运维的规范来源。

本仓库只负责现有账号登录、owner 鉴权、固定目标的短时签名转发，以及提问/回答的归档写入。入口沿用 `https://www.lizheng.ai/ops/ask-lizheng`；未登录或非 owner 无法读取问答。后台服务不接收账号 cookie、email、Logto、Circle 或模型供应商凭证。

网页只显示 v3 新版问答；旧 v1 提问保留原有 30 天期限，另存 owner 本地私人备份，不做合并、迁移或新增切换按钮。完整回答仅指当时实际保存的用户可见回答，不包含模型私有思考过程。

签名转发协议和测试见 `shared/ask-ops-gateway.ts`、`tests/ask-ops-gateway.test.ts`；v3 写入仍使用 `shared/ask-ops-storage.ts` 固定命名空间，并与独立后台的 writer-contract 合成测试夹具保持兼容。
