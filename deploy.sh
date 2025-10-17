#!/bin/bash

# 部署脚本 - 推送到GitHub

echo "🚀 开始部署到GitHub..."

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    read -p "请输入提交信息 (默认: Update website): " commit_msg
    commit_msg=${commit_msg:-"Update website"}
    git commit -m "$commit_msg"
else
    echo "✅ 没有新的更改需要提交"
fi

# 推送到GitHub
echo "📤 推送到GitHub..."
git push

echo "✨ 完成！Vercel会自动检测更改并重新部署"
echo "🌐 请访问 https://vercel.com 查看部署状态"
