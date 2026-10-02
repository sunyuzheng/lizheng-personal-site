# 问问立正 Ops：独立仓库

后台的页面、统计、问答存档读取、分页导出和手动删除由独立私有仓库 `sunyuzheng/ask-lizheng-ops` 及独立 Vercel 项目维护。该项目的 README 是后台架构与运维的规范来源。

本仓库只负责现有账号登录、owner 鉴权、固定目标的短时签名转发，以及提问/回答的归档写入。入口沿用 `https://www.lizheng.ai/ops/ask-lizheng`；未登录或非 owner 无法读取私人问答。后台服务不接收账号 cookie、email、Logto、Circle 或模型供应商凭证。

网页只显示 v3 新版问答；旧 v1 提问保留原有 30 天期限，另存 owner 本地私人备份，不做合并、迁移或新增切换按钮。完整回答仅指当时实际保存的用户可见回答，不包含模型私有思考过程。

签名转发协议和测试见 `shared/ask-ops-gateway.ts`、`tests/ask-ops-gateway.test.ts`；v3 写入仍使用 `shared/ask-ops-storage.ts` 固定命名空间，并与独立后台的 writer-contract 合成测试夹具保持兼容。

独立 Ops 同时管理私人整理候选、逐条授权/审阅、公开版本、主题统计和点赞。保存候选不公开；来源删除由 Ops 原子清除相关公开副本/点赞/榜单。私人整理四种路由仍经过 HOME owner gate 和用途独立的短时证明，正文最大262144字节。

前端未来可调用 `GET /api/ask-lizheng/discovery/questions?window=this_week&sort=recent|frequent|liked` 及 `GET /api/ask-lizheng/discovery/detail?public_id=...`。匿名只读独立审阅的已发布版本；`POST /api/ask-lizheng/discovery/vote` 要求现有已验证登录和 HOME 同源 Origin，Body 为 public_id/expected_revision/vote，最大2048字节。HOME 从验证邮箱计算投票专用不可逆标识，不将邮箱传给 Ops，也不关联私人提问。投票证明与 owner 证明用途隔离。契约、统计口径及游标过期处理以独立 Ops 的 `docs/public-discovery.md` 为准。

本次仅接入固定代理，不添加主页发现组件、不修改提问生成、额度或会员登录。部署时公开 feed 初始为空，已有私人记录需另获对具体公开版本的逐条授权后才能进入。
