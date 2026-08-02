# lizheng.ai域名运行手册

这个目录是`lizheng.ai`域名、DNS与关键路由的长期真源。个人站仓库负责部署，因此域名运行信息也归这里维护。

## 归属

- 域名：`lizheng.ai`
- 网站项目：Vercel项目`lizheng-personal-site_codex`
- Vercel团队：`yuzhengs-projects-9ae1e000`
- 关键Host：
  - `lizheng.ai`
  - `www.lizheng.ai`
  - `podcast.lizheng.ai`
  - `notify.lizheng.ai`
- DNS期望状态：[`lizheng.ai.records.json`](lizheng.ai.records.json)
- 自动验证：[`scripts/verify-domain.ts`](../../../scripts/verify-domain.ts)

原始zone导出、EPP/Auth Code、支付资料与注册联系人信息不属于Git仓库。

## 当前阶段

GoDaddy仍是注册商与权威DNS；`lizheng.ai.records.json`中的`lifecyclePhase`只描述公开可验证的DNS迁移阶段。Domain Lock、Auto Renewal、联系人验证和其他注册商后台状态不会由本仓库脚本验证，也不在这个公开仓库记录；需要变更时回到注册商后台单独核验和审批。

## 为什么DNS不能只看网站

`lizheng.ai`除了主站和Podcast子域，还有`notify.lizheng.ai`的发信认证。更换Nameserver时，必须同时保留SPF、DKIM、MX与DMARC；网站能打开不等于迁移已经成功。

## 验证命令

检查当前公开状态：

```bash
pnpm verify:domain
```

在切Nameserver前，直接检查尚未对外生效的Vercel权威DNS：

```bash
pnpm verify:domain -- --server ns1.vercel-dns.com --ns target
pnpm verify:domain -- --server ns2.vercel-dns.com --ns target
```

Vercel会把项目的ALIAS在权威DNS中展开成A记录，因此目标侧不要求继续返回GoDaddy侧的原始CNAME；验证脚本会分别使用两套正确的路由预期。

切换完成后：

```bash
pnpm verify:domain -- --ns target
```

## 迁移顺序

1. 导出并校验当前完整zone。
2. 先在目标DNS建立所有记录。
3. 直接查询目标权威Nameserver，验证网站、Podcast与邮件记录。
4. 再切公开Nameserver，观察至少48小时。
5. 网站、Podcast与邮件稳定后，最后转注册商。
6. 转入后核对隐私、自动续费、联系人验证与新到期日。

不要在同一个动作中同时更换DNS与注册商。这样即使目标DNS有问题，注册商转入前仍可把Nameserver切回原提供商。

## 变更规则

- 新增子域、邮件服务或验证TXT时，先更新真实DNS，再同步`lizheng.ai.records.json`
- 修改`vercel.json`中的Host路由时，运行完整域名验证
- 任何Nameserver、注册商、Auto Renewal、Domain Lock或联系人变更，都需要单独审阅与明确批准
- 域名转移授权码不得进入文件、Git、终端参数或聊天记录

## 官方资料

- [Vercel：转入与转出域名](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain)
- [Vercel：域名续费](https://vercel.com/docs/domains/working-with-domains/renew-a-domain)
- [Vercel：DNS管理](https://vercel.com/docs/domains/working-with-dns)
