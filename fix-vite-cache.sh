#!/bin/bash

echo "🔧 修复 Vite 缓存问题"
echo "===================="
echo ""

# 1. 清理 Vite 缓存
echo "1️⃣ 清理 Vite 缓存..."
rm -rf node_modules/.vite
echo "✅ Vite 缓存已清理"
echo ""

# 2. 清理 dist 目录
echo "2️⃣ 清理 dist 目录..."
rm -rf dist
echo "✅ dist 目录已清理"
echo ""

# 3. 清理测试文件
echo "3️⃣ 清理测试文件..."
rm -f src/test-import.ts
echo "✅ 测试文件已清理"
echo ""

echo "✨ 清理完成！"
echo ""
echo "📝 下一步操作："
echo "1. 在终端中运行: npm run dev"
echo "2. 等待服务器启动完成"
echo "3. 在浏览器中访问: http://localhost:5173/notebook-test"
echo "4. 如果浏览器已打开，请按 Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows) 硬刷新"
echo ""
echo "🎯 如果问题仍然存在，请尝试："
echo "   - 完全关闭浏览器并重新打开"
echo "   - 清除浏览器缓存"
echo "   - 重启 VS Code"
