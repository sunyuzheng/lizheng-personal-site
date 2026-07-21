#!/bin/bash
set -euo pipefail

if [[ "$(git branch --show-current)" != "main" ]]; then
    echo "❌ 部署只允许从 main 分支执行。"
    exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
    echo "❌ 工作区仍有未审阅或未提交的改动。"
    echo "   本脚本不会自动 git add 或 commit；请先明确检查并提交目标文件。"
    git status --short
    exit 1
fi

echo "🔎 TypeScript 检查"
pnpm check

echo "🏗️  生产构建"
pnpm build

echo "📤 推送已审阅的 main 提交"
git push origin main

echo "✅ 已推送。Vercel Git Integration 会自动触发生产部署。"
