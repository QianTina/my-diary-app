# 🚨 紧急安全操作指南

## ⚠️ 当前状态

✅ **已完成**：
- `.env` 已从 Git 缓存中移除
- `.gitignore` 已更新，包含 `.env`
- 已创建 `.env.example` 作为配置模板
- 已创建安全文档和修复脚本

❌ **待完成**：
- 重置 Supabase 密钥
- 提交更改到 Git
- 清除 Git 历史中的密钥
- 启用 Row Level Security

---

## 🎯 立即执行（5 分钟）

### 步骤 1: 重置 Supabase 密钥 ⭐ 最重要

1. 打开浏览器，访问：https://app.supabase.com
2. 登录你的账号
3. 选择项目（URL 包含 `ezuuoqccizaqcrmcpoth`）
4. 点击左侧菜单 **Settings** → **API**
5. 找到 **Project API keys** 部分
6. 在 `anon` `public` 密钥旁边，点击 **眼睛图标** 查看密钥
7. 点击 **Reset** 按钮（或 **Regenerate** 按钮）
8. 确认重置
9. 复制新的密钥

### 步骤 2: 更新本地 .env 文件

```bash
# 编辑 .env 文件
# 将新密钥粘贴进去

VITE_SUPABASE_URL='https://ezuuoqccizaqcrmcpoth.supabase.co'
VITE_SUPABASE_ANON_KEY='新的密钥粘贴在这里'
```

### 步骤 3: 提交安全修复

```bash
# 添加安全相关文件
git add .gitignore .env.example
git add SECURITY_*.md fix-security.sh

# 提交更改
git commit -m "security: remove .env from git and add security guides"

# 推送到远程
git push origin main
```

### 步骤 4: 测试应用

```bash
# 启动开发服务器
npm run dev

# 测试功能是否正常
# 1. 创建新日记
# 2. 查看日记列表
# 3. 编辑日记
# 4. 删除日记
```

---

## 🧹 清除 Git 历史（重要）

即使从当前提交中删除了 `.env`，旧密钥仍然存在于 Git 历史中。

### 方法 1: 使用 BFG Repo-Cleaner（推荐）

```bash
# 1. 安装 BFG
# macOS:
brew install bfg

# 或下载 JAR 文件:
# https://rtyley.github.io/bfg-repo-cleaner/

# 2. 克隆镜像仓库
git clone --mirror https://github.com/你的用户名/my-diary-app.git

# 3. 进入镜像目录
cd my-diary-app.git

# 4. 删除 .env 文件
bfg --delete-files .env

# 5. 清理
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 6. 强制推送
git push --force

# 7. 返回工作目录
cd ..
rm -rf my-diary-app.git

# 8. 重新克隆干净的仓库
cd ..
rm -rf my-diary-app
git clone https://github.com/你的用户名/my-diary-app.git
cd my-diary-app
```

### 方法 2: 使用 git filter-branch

```bash
# 警告：这会重写整个 Git 历史
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送
git push origin --force --all
git push origin --force --tags
```

---

## 🛡️ 启用 Row Level Security

### 在 Supabase Dashboard 中

1. 访问：https://app.supabase.com
2. 选择你的项目
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New query**
5. 粘贴以下 SQL：

```sql
-- 启用 RLS
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 创建策略（允许所有访问，用于开发）
CREATE POLICY "Enable all access for development"
ON diaries
FOR ALL
USING (true)
WITH CHECK (true);
```

6. 点击 **Run** 执行

### 验证 RLS 状态

```sql
-- 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'diaries';

-- 应该看到 rowsecurity = true
```

---

## 📋 完整检查清单

### 立即执行（必须）

- [ ] 1. 重置 Supabase anon key
- [ ] 2. 更新本地 .env 文件
- [ ] 3. 提交安全修复到 Git
- [ ] 4. 测试应用功能正常

### 重要（强烈建议）

- [ ] 5. 清除 Git 历史中的密钥
- [ ] 6. 启用 Row Level Security (RLS)
- [ ] 7. 配置 API 限流

### 可选（增强安全）

- [ ] 8. 配置 pre-commit hook
- [ ] 9. 启用 GitHub Secret Scanning
- [ ] 10. 实现用户认证系统

---

## 🔍 验证安全性

### 检查 GitHub 仓库

1. 访问你的 GitHub 仓库
2. 使用搜索功能（按 `/` 键）
3. 搜索：`VITE_SUPABASE` 或 `ezuuoqccizaqcrmcpoth`
4. 如果能搜到，说明还在历史中，需要清除

### 检查本地 Git

```bash
# 搜索 Git 历史
git log -p | grep -i "VITE_SUPABASE"

# 如果有输出，说明还在历史中
```

---

## ⚡ 快速命令

```bash
# 一键提交安全修复
git add .gitignore .env.example SECURITY_*.md fix-security.sh
git commit -m "security: remove .env from git and add security guides"
git push origin main

# 测试应用
npm run dev

# 构建生产版本
npm run build
```

---

## 📞 需要帮助？

### 文档

- 📖 **快速修复**: `SECURITY_QUICKFIX.md`
- 📖 **完整指南**: `SECURITY_GUIDE.md`
- 📖 **总结**: `SECURITY_SUMMARY.md`

### 在线资源

- Supabase 文档: https://supabase.com/docs
- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
- Git 文档: https://git-scm.com/docs

---

## ✅ 完成后

完成所有步骤后，你的应用将是安全的：

✅ 密钥已重置，旧密钥失效
✅ .env 不会再被提交到 Git
✅ Git 历史已清理
✅ RLS 保护数据库
✅ 应用正常运行

**恭喜！你的应用现在是安全的！** 🎉

---

## 📝 记住

**永远不要：**
- ❌ 提交 `.env` 文件到 Git
- ❌ 在代码中硬编码密钥
- ❌ 在公开场合分享密钥

**始终要：**
- ✅ 使用 `.env.example` 作为模板
- ✅ 确保 `.env` 在 `.gitignore` 中
- ✅ 启用 Row Level Security
- ✅ 定期检查安全配置

---

**现在就开始执行吧！** 🚀
