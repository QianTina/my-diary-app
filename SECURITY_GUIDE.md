# 🔒 安全配置指南

## ⚠️ 紧急：如果密钥已泄露

如果你的 `.env` 文件已经被提交到 GitHub，请立即执行以下步骤：

### 1. 重置 Supabase 密钥

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 点击 **Reset** 按钮重置 `anon` 密钥
5. 复制新的密钥到本地 `.env` 文件

### 2. 从 Git 历史中删除敏感信息

```bash
# 方法 1: 使用 git filter-branch（适用于小仓库）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 方法 2: 使用 BFG Repo-Cleaner（推荐，更快）
# 下载 BFG: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 强制推送到远程仓库
git push origin --force --all
git push origin --force --tags
```

### 3. 配置 Row Level Security (RLS)

即使密钥泄露，RLS 也能保护你的数据：

```sql
-- 在 Supabase SQL Editor 中执行

-- 启用 RLS
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 创建策略：只允许匿名用户访问自己的数据
-- 注意：这需要实现用户认证系统

-- 临时方案：允许所有人读写（仅用于开发）
CREATE POLICY "Enable all access for development"
ON diaries
FOR ALL
USING (true)
WITH CHECK (true);

-- 生产环境推荐：基于用户 ID 的策略
CREATE POLICY "Users can only access their own diaries"
ON diaries
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## 🛡️ 安全最佳实践

### 1. 环境变量管理

#### ✅ 正确做法

```bash
# .env 文件（不提交到 Git）
VITE_SUPABASE_URL='https://your-project.supabase.co'
VITE_SUPABASE_ANON_KEY='your-actual-key'
```

```bash
# .env.example 文件（提交到 Git）
VITE_SUPABASE_URL='your-project-url.supabase.co'
VITE_SUPABASE_ANON_KEY='your-anon-key-here'
```

#### ❌ 错误做法

```typescript
// 不要在代码中硬编码密钥
const supabaseUrl = 'https://ezuuoqccizaqcrmcpoth.supabase.co';
const supabaseKey = 'eyJhbGci...'; // ❌ 危险！
```

### 2. .gitignore 配置

确保 `.gitignore` 包含：

```gitignore
# 环境变量
.env
.env.local
.env.production
.env.development

# 构建产物
dist
build

# 依赖
node_modules

# 日志
*.log
npm-debug.log*

# 系统文件
.DS_Store
Thumbs.db
```

### 3. Supabase 安全配置

#### 启用 Row Level Security (RLS)

```sql
-- 1. 启用 RLS
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 2. 创建用户表（如果需要）
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 添加用户 ID 到日记表
ALTER TABLE diaries ADD COLUMN user_id UUID REFERENCES users(id);

-- 4. 创建访问策略
CREATE POLICY "Users can read their own diaries"
ON diaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diaries"
ON diaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diaries"
ON diaries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diaries"
ON diaries FOR DELETE
USING (auth.uid() = user_id);
```

#### 配置 API 限流

在 Supabase Dashboard 中：
1. **Settings** → **API**
2. 启用 **Rate Limiting**
3. 设置合理的请求限制（如：每分钟 100 次）

### 4. 前端安全

#### 使用环境变量

```typescript
// ✅ 正确：使用环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase not configured, using LocalStorage');
}
```

#### 验证输入

```typescript
// 防止 SQL 注入和 XSS 攻击
const sanitizeInput = (input: string) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // 移除 HTML 标签
    .slice(0, 10000); // 限制长度
};
```

---

## 📋 安全检查清单

部署前请确认：

- [ ] `.env` 文件已加入 `.gitignore`
- [ ] 已创建 `.env.example` 作为配置模板
- [ ] 如果密钥已泄露，已重置 Supabase 密钥
- [ ] 已从 Git 历史中删除敏感信息
- [ ] Supabase 已启用 Row Level Security (RLS)
- [ ] 已配置 API 限流
- [ ] 代码中没有硬编码的密钥
- [ ] 已设置合理的 CORS 策略

---

## 🚀 部署到生产环境

### Vercel 部署

1. 在 Vercel Dashboard 中设置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. 不要在 `vercel.json` 中暴露密钥

### Netlify 部署

1. 在 Netlify Dashboard 中设置环境变量：
   - **Site settings** → **Build & deploy** → **Environment**
   - 添加 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`

---

## 🔍 检测密钥泄露

### 使用 GitHub Secret Scanning

GitHub 会自动扫描公开仓库中的密钥，如果检测到会发送警告邮件。

### 手动检查

```bash
# 搜索 Git 历史中的敏感信息
git log -p | grep -i "supabase"
git log -p | grep -i "anon_key"

# 检查当前提交
git grep -i "supabase_url"
git grep -i "anon_key"
```

---

## 📚 相关资源

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

## ⚡ 快速修复命令

```bash
# 1. 添加 .env 到 .gitignore
echo ".env" >> .gitignore

# 2. 从 Git 缓存中移除 .env
git rm --cached .env

# 3. 提交更改
git add .gitignore
git commit -m "chore: add .env to .gitignore for security"

# 4. 推送到远程
git push origin main
```

**重要提醒**：即使从当前提交中删除了 `.env`，它仍然存在于 Git 历史中。必须使用 `git filter-branch` 或 BFG 完全清除。
