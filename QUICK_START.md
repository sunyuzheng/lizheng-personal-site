# 快速部署指南 - 3步完成

## 第1步：推送到GitHub（5分钟）

1. 在GitHub创建新仓库：https://github.com/new
   - 仓库名：`lizheng-personal-site`
   - 可见性：Public 或 Private（都可以）
   - **不要**添加README、.gitignore或license

2. 在终端执行（替换YOUR_USERNAME为您的GitHub用户名）：

```bash
cd /home/ubuntu/lizheng-personal-site
git remote add origin https://github.com/YOUR_USERNAME/lizheng-personal-site.git
git branch -M main
git push -u origin main
```

## 第2步：部署到Vercel（3分钟）

1. 访问 https://vercel.com/new
2. 用GitHub账号登录
3. 选择 `lizheng-personal-site` 仓库
4. 点击 "Deploy"（保持默认设置即可）
5. 等待部署完成

## 第3步：配置域名（5分钟）

### 在Vercel添加域名

1. 在Vercel项目页面 → Settings → Domains
2. 输入 `lizheng.ai` → Add

### 在GoDaddy配置DNS

1. 登录GoDaddy → My Products → lizheng.ai → DNS
2. 添加/修改记录：

```
类型: A
名称: @
值: 76.76.21.21
TTL: 600

类型: CNAME
名称: www
值: cname.vercel-dns.com
TTL: 600
```

3. 保存并等待5-30分钟DNS生效

## 完成！

访问 https://lizheng.ai 查看您的网站。

---

**详细说明请查看 DEPLOYMENT.md**

