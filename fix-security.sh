#!/bin/bash

# 🔒 安全修复脚本
# 用于从 Git 仓库中移除已泄露的 .env 文件

echo "🔒 开始安全修复..."
echo ""

# 1. 检查 .env 是否在 Git 中
if git ls-files --error-unmatch .env > /dev/null 2>&1; then
    echo "⚠️  检测到 .env 文件在 Git 中"
    echo ""
    
    # 2. 从 Git 缓存中移除
    echo "📝 从 Git 缓存中移除 .env..."
    git rm --cached .env
    
    # 3. 提交更改
    echo "💾 提交更改..."
    git add .gitignore .env.example
    git commit -m "chore: remove .env from git and add to .gitignore for security"
    
    echo ""
    echo "✅ .env 已从当前提交中移除"
    echo ""
    echo "⚠️  重要提醒："
    echo "   .env 仍然存在于 Git 历史中！"
    echo "   请执行以下步骤完全清除："
    echo ""
    echo "   1. 重置 Supabase 密钥："
    echo "      - 登录 https://app.supabase.com"
    echo "      - Settings → API → Reset anon key"
    echo ""
    echo "   2. 清除 Git 历史（选择一种方法）："
    echo ""
    echo "      方法 A - 使用 git filter-branch:"
    echo "      git filter-branch --force --index-filter \\"
    echo "        'git rm --cached --ignore-unmatch .env' \\"
    echo "        --prune-empty --tag-name-filter cat -- --all"
    echo "      git push origin --force --all"
    echo ""
    echo "      方法 B - 使用 BFG (推荐，更快):"
    echo "      # 下载 BFG: https://rtyley.github.io/bfg-repo-cleaner/"
    echo "      java -jar bfg.jar --delete-files .env"
    echo "      git reflog expire --expire=now --all"
    echo "      git gc --prune=now --aggressive"
    echo "      git push origin --force --all"
    echo ""
else
    echo "✅ .env 文件不在 Git 中"
    echo "📝 更新 .gitignore..."
    git add .gitignore .env.example
    git commit -m "chore: update .gitignore to exclude .env files"
    echo "✅ 安全配置已更新"
fi

echo ""
echo "📚 更多信息请查看 SECURITY_GUIDE.md"
