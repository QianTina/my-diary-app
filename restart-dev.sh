#!/bin/bash

echo "🧹 清理 Vite 缓存..."
rm -rf node_modules/.vite

echo "🔄 重启开发服务器..."
echo "请在终端中运行: npm run dev"
echo ""
echo "然后访问: http://localhost:5173/notebook-test"
echo ""
echo "如果问题仍然存在，请尝试:"
echo "1. 完全关闭浏览器"
echo "2. 清除浏览器缓存"
echo "3. 重新打开浏览器并访问应用"
