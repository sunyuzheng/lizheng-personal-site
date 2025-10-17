# 部署指南 - lizheng.ai

本文档提供将个人主页部署到Vercel并配置自定义域名的完整步骤。

## 前置要求

- GitHub账号
- Vercel账号（可以用GitHub登录）
- GoDaddy域名管理权限（lizheng.ai）

## 步骤1：推送代码到GitHub

### 1.1 初始化Git仓库（如果还没有）

```bash
cd /home/ubuntu/lizheng-personal-site
git init
git add .
git commit -m "Initial commit: Personal website for lizheng.ai"
```

### 1.2 创建GitHub仓库

1. 访问 https://github.com/new
2. 仓库名称：`lizheng-personal-site`（或任意名称）
3. 设置为 **Public** 或 **Private**（都可以）
4. **不要**勾选 "Add README" 或 ".gitignore"（我们已经有了）
5. 点击 "Create repository"

### 1.3 推送代码

```bash
# 将GitHub仓库地址替换为您的实际地址
git remote add origin https://github.com/YOUR_USERNAME/lizheng-personal-site.git
git branch -M main
git push -u origin main
```

## 步骤2：部署到Vercel

### 2.1 导入项目到Vercel

1. 访问 https://vercel.com
2. 点击 "Sign Up" 或 "Log In"，选择 "Continue with GitHub"
3. 授权Vercel访问您的GitHub账号
4. 点击 "Import Project" 或 "New Project"
5. 选择您刚创建的 `lizheng-personal-site` 仓库
6. 点击 "Import"

### 2.2 配置项目设置

Vercel会自动检测到这是一个Vite项目。确认以下设置：

- **Framework Preset**: Vite
- **Install Command**: `pnpm install`
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist/public`

### 2.3 环境变量设置

在Vercel项目设置中添加以下环境变量（Environment Variables）：

```
VITE_APP_TITLE=Yuzheng Sun | 课代表立正
VITE_APP_LOGO=/profile.jpg
```

保存后点击 **Redeploy** 以使最新环境变量生效。

### 2.4 部署

点击 "Deploy" 按钮，等待部署完成（通常1-2分钟）。

部署成功后，Vercel会提供一个临时域名，如：
`https://lizheng-personal-site.vercel.app`

## 步骤3：配置自定义域名

### 3.1 在Vercel添加域名

1. 在Vercel项目页面，点击 "Settings"
2. 选择左侧菜单的 "Domains"
3. 在输入框中输入：`lizheng.ai`
4. 点击 "Add"
5. Vercel会显示需要配置的DNS记录

### 3.2 在GoDaddy配置DNS

1. 登录 GoDaddy账号
2. 进入 "My Products" → 找到 `lizheng.ai` → 点击 "DNS"
3. 添加以下DNS记录：

#### 方式A：使用A记录（推荐）

删除现有的A记录，添加：

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | 600 |
| CNAME | www | cname.vercel-dns.com | 600 |

#### 方式B：使用CNAME记录

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | @ | cname.vercel-dns.com | 600 |
| CNAME | www | cname.vercel-dns.com | 600 |

**注意**：某些DNS提供商不允许在根域名(@)使用CNAME，如果遇到这种情况，请使用方式A。

### 3.3 等待DNS生效

- DNS更改通常需要几分钟到48小时生效
- 可以使用 https://dnschecker.org 检查DNS传播状态
- 输入 `lizheng.ai` 查看全球DNS解析情况

### 3.4 验证部署

DNS生效后，访问 https://lizheng.ai 应该能看到您的个人主页。

Vercel会自动为您的域名配置免费的SSL证书（HTTPS）。

## 步骤4：后续更新

每次您想更新网站内容：

1. 修改代码
2. 提交并推送到GitHub：
   ```bash
   git add .
   git commit -m "Update content"
   git push
   ```
3. Vercel会自动检测到更改并重新部署（通常1-2分钟）

## 常见问题

### Q: 部署失败怎么办？

查看Vercel的部署日志（Deployment Logs），通常会显示具体错误信息。

### Q: 域名配置后还是看不到网站？

1. 确认DNS记录配置正确
2. 使用 `dig lizheng.ai` 或 `nslookup lizheng.ai` 检查DNS解析
3. 清除浏览器缓存
4. 等待更长时间（最多48小时）

### Q: 如何更新Superlinear Academy社区配置？

修改 `client/index.html` 中的社区widget配置，然后提交推送即可。

### Q: Vercel免费版有限制吗？

免费版限制：
- 100 GB带宽/月
- 无限部署次数
- 对于个人网站完全够用

## 技术支持

如有问题，可以：
- 查看Vercel文档：https://vercel.com/docs
- 联系Vercel支持：https://vercel.com/support
- 查看项目GitHub Issues

---

**祝部署顺利！🚀**
