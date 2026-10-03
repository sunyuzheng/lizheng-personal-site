# lizheng.ai域名运行手册

这个目录是`lizheng.ai`域名、DNS与关键路由的长期真源。个人站仓库负责部署，因此域名运行信息也归这里维护。

## 归属

- 域名：`lizheng.ai`
- 网站项目：Vercel项目`lizheng-personal-site_codex`
- Vercel团队：`yuzhengs-projects-9ae1e000`
- 关键Host：
  - `lizheng.ai`
  - `www.lizheng.ai`
  - `creators.lizheng.ai`
  - `podcast.lizheng.ai`
  - `speaker.lizheng.ai`
  - `notify.lizheng.ai`
  - `pod.lizheng.ai`
  - `shop.lizheng.ai` / `www.shop.lizheng.ai`
  - `members.shop.lizheng.ai`
  - `support.shop.lizheng.ai`
- DNS期望状态：[`lizheng.ai.records.json`](lizheng.ai.records.json)
- 自动验证：[`scripts/verify-domain.ts`](../../../scripts/verify-domain.ts)

原始zone导出、EPP/Auth Code、支付资料与注册联系人信息不属于Git仓库。

## 当前阶段

2026-09-15权威DNS已切换到Vercel，域名服务器为`ns1.vercel-dns.com`与`ns2.vercel-dns.com`。两台.ai注册局服务器已确认新委派；新播客域名`pod.lizheng.ai`已通过Transistor DNS验证、HTTPS与实际播放验收。切换当天部分递归解析器仍可能命中旧缓存。GoDaddy继续作为注册商。`lizheng.ai.records.json`中的`lifecyclePhase`只描述公开可验证的DNS迁移阶段。Domain Lock、Auto Renewal、联系人验证和其他注册商后台状态不会由本仓库脚本验证，也不在这个公开仓库记录；需要变更时回到注册商后台单独核验和审批。

## 为什么DNS不能只看网站

`lizheng.ai`除了主站和Podcast子域，还有`notify.lizheng.ai`的Resend/SES发信认证，以及`support.shop.lizheng.ai`的Fourthwall、SendGrid和Zendesk客服邮件配置。更换Nameserver时，必须同时保留SPF、DKIM、MX与DMARC；网站能打开不等于迁移已经成功。

`creators.lizheng.ai`是中文播客与视频合作页的传播短入口；它以308永久跳转到`https://www.lizheng.ai/collab/creators`（2026-09-30起中文页不带`/zh`前缀），避免维护两份页面状态。

`speaker.lizheng.ai`是定向嘉宾邀请页的独立入口；它承载邀请别人来到立正节目中的页面，与邀请立正参加别人节目的`creators.lizheng.ai`分工相反。

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

## 2026-09-15切换记录

当前GoDaddy完整导出共29条，包括26条服务记录、2条NS和1条SOA。26条服务记录全部保留；其中主站、www、podcast、creators和speaker继续使用已存在的Vercel项目绑定，解析由默认ALIAS提供。其余21条原服务记录与新增pod CNAME组成22条Vercel自定义记录。原始zone与完整核验结果保存在迁移工作包private目录，不提交Git。

- `pod.lizheng.ai`：Transistor原生节目主页；与现有`podcast.lizheng.ai`独立网站分开。
- 商店继续由Fourthwall提供，会员入口保留原有跳转。
- 自定义TTL按原值保留为600/3600；Vercel默认ALIAS的展开A记录TTL由提供商管理。
- 切换前，对四台权威DNS完成112次查询，记录值、TXT全文、MX优先级与自定义TTL全部通过。
- 本轮仅迁DNS，注册商迁移需要另行安排。

原GoDaddy Nameservers为`ns43.domaincontrol.com`与`ns44.domaincontrol.com`；如需回滚，须先确认原zone仍可用，并按本手册变更规则审批。

07:41 PDT后，目标权威DNS复核56/56项通过。随后Transistor Custom Domain通过DNS验证，`pod.lizheng.ai`的HTTPS主页与E531单集可正常打开，E531实际播放后暂停且无媒体错误。已保存旧Transistor网址自动跳转到新域名。RSS仍使用`https://feeds.transistor.fm/kedaibiao`，现有订阅无须更换。
