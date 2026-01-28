# 用户认证数据库迁移指南

本指南将帮助你为日记应用添加用户认证支持。

## 前提条件

1. ✅ 已有 Supabase 项目
2. ✅ 已配置 `.env` 文件中的 Supabase 连接信息
3. ✅ 已有 `diaries` 表

## 关于用户表

**重要说明**：你不需要手动创建用户表！

Supabase Auth 会自动管理用户表：
- `auth.users` - 用户账户表（自动创建）
- `auth.identities` - 用户身份表（自动创建）
- `auth.sessions` - 用户会话表（自动创建）

你只需要：
1. 在 `diaries` 表中添加 `user_id` 字段
2. 设置行级安全策略（RLS）

## 迁移步骤

### 步骤 1：登录 Supabase Dashboard

1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**

### 步骤 2：执行迁移脚本

1. 在 SQL Editor 中，点击 **New Query**
2. 复制 `sql/add_user_authentication.sql` 文件的内容
3. 粘贴到 SQL Editor 中
4. 点击 **Run** 按钮执行脚本

### 步骤 3：验证迁移

执行以下 SQL 查询来验证迁移是否成功：

```sql
-- 1. 检查 user_id 列是否存在
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diaries' AND column_name = 'user_id';

-- 2. 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'diaries';

-- 3. 检查策略是否创建
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'diaries';
```

预期结果：
- `user_id` 列存在，类型为 `uuid`
- `rowsecurity` 为 `true`
- 应该有 4 个策略（SELECT, INSERT, UPDATE, DELETE）

### 步骤 4：处理现有数据（如果有）

如果你已经有一些日记数据，需要将它们关联到某个用户：

1. 在 Supabase Dashboard 中，进入 **Authentication** -> **Users**
2. 找到你的用户 ID（UUID 格式）
3. 在 SQL Editor 中运行：

```sql
UPDATE diaries 
SET user_id = 'YOUR_USER_ID_HERE' 
WHERE user_id IS NULL;
```

将 `YOUR_USER_ID_HERE` 替换为实际的用户 ID。

## RLS 策略说明

迁移脚本创建了 4 个 RLS 策略：

### 1. SELECT 策略
```sql
CREATE POLICY "Users can view their own diaries"
ON diaries FOR SELECT
USING (auth.uid() = user_id);
```
**作用**：用户只能查看自己的日记

### 2. INSERT 策略
```sql
CREATE POLICY "Users can insert their own diaries"
ON diaries FOR INSERT
WITH CHECK (auth.uid() = user_id);
```
**作用**：用户只能为自己创建日记

### 3. UPDATE 策略
```sql
CREATE POLICY "Users can update their own diaries"
ON diaries FOR UPDATE
USING (auth.uid() = user_id);
```
**作用**：用户只能更新自己的日记

### 4. DELETE 策略
```sql
CREATE POLICY "Users can delete their own diaries"
ON diaries FOR DELETE
USING (auth.uid() = user_id);
```
**作用**：用户只能删除自己的日记

## RLS 工作原理

1. **auth.uid()** 是 PostgreSQL 函数，从 JWT 令牌中提取当前用户 ID
2. JWT 令牌由 Supabase 自动在每个请求中发送
3. RLS 策略在数据库层面执行，即使应用代码有漏洞也能保证安全
4. 如果策略条件不满足，查询返回空结果（就像数据不存在）

## 测试迁移

### 1. 注册新用户

访问 `http://localhost:5173/login`，注册一个新账户。

### 2. 创建日记

登录后，创建一条新日记。

### 3. 验证数据隔离

1. 在 Supabase Dashboard -> Table Editor -> diaries 中查看数据
2. 你应该看到新日记的 `user_id` 字段已填充
3. 注册另一个用户，登录后应该看不到第一个用户的日记

## 常见问题

### Q: 为什么我看不到任何日记？

**A**: 可能的原因：
1. RLS 已启用，但日记的 `user_id` 为 NULL
2. 你没有登录
3. 你登录的用户与日记的 `user_id` 不匹配

**解决方案**：
- 检查 `user_id` 是否正确设置
- 确保已登录
- 为现有日记设置正确的 `user_id`

### Q: 如何临时禁用 RLS 进行调试？

**A**: 在 SQL Editor 中运行：
```sql
ALTER TABLE diaries DISABLE ROW LEVEL SECURITY;
```

**警告**：这会让所有用户都能访问所有数据！调试完成后记得重新启用：
```sql
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
```

### Q: 如何查看当前用户的 ID？

**A**: 在应用中，可以通过 AuthStore 查看：
```typescript
const { user } = useAuthStore();
console.log('Current user ID:', user?.id);
```

或在 SQL Editor 中：
```sql
SELECT auth.uid();
```

### Q: 迁移失败了怎么办？

**A**: 使用回滚脚本：
```sql
DROP POLICY IF EXISTS "Users can view their own diaries" ON diaries;
DROP POLICY IF EXISTS "Users can insert their own diaries" ON diaries;
DROP POLICY IF EXISTS "Users can update their own diaries" ON diaries;
DROP POLICY IF EXISTS "Users can delete their own diaries" ON diaries;
ALTER TABLE diaries DISABLE ROW LEVEL SECURITY;
DROP INDEX IF EXISTS diaries_user_id_idx;
ALTER TABLE diaries DROP COLUMN IF EXISTS user_id;
```

## 下一步

迁移完成后，你需要更新应用代码：

1. ✅ AuthStore - 已完成
2. ✅ LoginPage - 已完成
3. ✅ ProtectedRoute - 已完成
4. ⏳ 更新 diaryStore 以包含 user_id（任务 13）
5. ⏳ 实现用户菜单（任务 9）
6. ⏳ 实现资料页面（任务 8）

## 参考资料

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Supabase RLS 文档](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 文档](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
