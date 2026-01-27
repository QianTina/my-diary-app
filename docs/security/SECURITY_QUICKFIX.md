# 🚨 密钥泄露快速修复指南

## 问题说明

你的 `.env` 文件包含 Supabase 密钥，如果已提交到 GitHub，这些密钥可能已经泄露。

**泄露的信息：**
- ❌ `VITE_SUPABASE_URL`: `https://ezuuoqccizaqcrmcpoth.supabase.co`
- ❌ `VITE_SUPABASE_ANON_KEY`: `eyJhbGci...`

---

## ⚡ 立即执行（5 分钟）

### 步骤 1: 重置 Supabase 密钥 ⭐ 最重要

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目 `ezuuoqccizaqcrmcpoth`
3. 点击 **Settings** → **API**
4. 找到 **Project API keys** 部分
5. 点击 `anon` `public` 密钥旁边的 **Reset** 按钮
6. 复制新密钥，更新本地 `.env` 文件

```bash
# 更新 .env 文件中的密钥
VITE_SUPABASE_ANON_KEY='新的密钥'
```

### 步骤 2: 从 Git 中移除 .env

```bash
# 运行自动修复脚本
./fix-security.sh

# 或手动执行
git rm --cached .env
git add .gitignore .env.example
git commit -m "chore: remove .env from git for security"
git push origin main
```

---

## 🔍 检查是否已泄露

### 检查 GitHub 仓库

```bash
# 在 GitHub 仓库页面搜索
# 搜索关键词: "VITE_SUPABASE" 或 "ezuuoqccizaqcrmcpoth"
```

如果能搜索到，说明已经泄露，必须清除 Git 历史。

---

## 🧹 清除 Git 历史（如果已泄露）

### 方法 1: 使用 BFG Repo-Cleaner（推荐）

```bash
# 1. 下载 BFG
# 访问: https://rtyley.github.io/bfg-repo-cleaner/
# 或使用 Homebrew: brew install bfg

# 2. 备份仓库
git clone --mirror git@github.com:你的用户名/my-diary-app.git

# 3. 清除 .env 文件
cd my-diary-app.git
bfg --delete-files .env

# 4. 清理和推送
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# 5. 克隆干净的仓库
cd ..
rm -rf my-diary-app
git clone git@github.com:你的用户名/my-diary-app.git
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

## 🛡️ 防止未来泄露

### 1. 确认 .gitignore 配置

```bash
# 检查 .gitignore 是否包含 .env
cat .gitignore | grep ".env"

# 应该看到：
# .env
# .env.local
# .env.production
# .env.development
```

### 2. 使用 .env.example

```bash
# .env.example (提交到 Git)
VITE_SUPABASE_URL='your-project-url.supabase.co'
VITE_SUPABASE_ANON_KEY='your-anon-key-here'

# .env (不提交到 Git)
VITE_SUPABASE_URL='https://ezuuoqccizaqcrmcpoth.supabase.co'
VITE_SUPABASE_ANON_KEY='实际的密钥'
```

### 3. 配置 Git Hooks（可选）

```bash
# 创建 pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
if git diff --cached --name-only | grep -q "^.env$"; then
    echo "❌ 错误: 不能提交 .env 文件！"
    echo "请将敏感信息移到 .env 文件中"
    exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
```

---

## 📊 安全等级评估

### 当前风险等级

| 项目 | 状态 | 风险 |
|------|------|------|
| Anon Key 泄露 | ⚠️ 可能 | 中等 |
| Service Role Key 泄露 | ✅ 未泄露 | 低 |
| RLS 已启用 | ❓ 未知 | 高 |
| API 限流 | ❓ 未知 | 中等 |

### Supabase Anon Key 说明

**好消息：** Supabase 的 `anon` 密钥设计为可以公开的：
- ✅ 它只能访问启用了 RLS 的表
- ✅ 它不能执行管理操作
- ✅ 它有内置的速率限制

**但是：** 如果你的表没有启用 RLS，任何人都可以读写数据！

---

## 🔐 启用 Row Level Security (RLS)

在 Supabase SQL Editor 中执行：

```sql
-- 1. 启用 RLS
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 2. 临时策略（开发环境）
CREATE POLICY "Enable all access for development"
ON diaries FOR ALL
USING (true)
WITH CHECK (true);

-- 3. 生产环境策略（需要实现用户认证）
-- 暂时不要执行，等实现用户系统后再用
-- CREATE POLICY "Users can only access their own diaries"
-- ON diaries FOR ALL
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);
```

---

## ✅ 完成检查清单

- [ ] 已重置 Supabase anon key
- [ ] 已更新本地 .env 文件
- [ ] 已从 Git 中移除 .env
- [ ] 已更新 .gitignore
- [ ] 已创建 .env.example
- [ ] 如果已泄露，已清除 Git 历史
- [ ] 已启用 Supabase RLS
- [ ] 已配置 API 限流
- [ ] 已测试应用仍能正常工作

---

## 🆘 需要帮助？

如果遇到问题，请查看：
- 📚 完整指南: `SECURITY_GUIDE.md`
- 🔧 Supabase 文档: https://supabase.com/docs/guides/auth/row-level-security
- 💬 GitHub Issues: 提交问题到项目仓库

---

## 📝 总结

**最重要的 3 件事：**

1. ⭐ **立即重置 Supabase 密钥**
2. 🔒 **确保 .env 在 .gitignore 中**
3. 🛡️ **启用 Row Level Security (RLS)**

完成这些步骤后，你的应用就安全了！
