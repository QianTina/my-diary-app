-- ============================================
-- 用户认证系统数据库迁移脚本
-- ============================================
-- 此脚本将为现有的 diaries 表添加用户认证支持
-- 包括添加 user_id 字段和设置行级安全策略（RLS）

-- 步骤 1: 添加 user_id 列
-- ============================================
-- 为 diaries 表添加 user_id 列，关联到 auth.users 表
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 步骤 2: 为现有数据设置默认 user_id（可选）
-- ============================================
-- 如果你有现有的日记数据，需要将它们关联到某个用户
-- 请将下面的 'YOUR_USER_ID' 替换为实际的用户 UUID
-- 你可以在 Supabase Dashboard -> Authentication -> Users 中找到用户 ID

-- UPDATE diaries 
-- SET user_id = 'YOUR_USER_ID' 
-- WHERE user_id IS NULL;

-- 步骤 3: 创建索引以提高查询性能
-- ============================================
CREATE INDEX IF NOT EXISTS diaries_user_id_idx ON diaries(user_id);

-- 步骤 4: 启用行级安全策略（RLS）
-- ============================================
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 步骤 5: 删除旧的策略（如果存在）
-- ============================================
DROP POLICY IF EXISTS "Users can view their own diaries" ON diaries;
DROP POLICY IF EXISTS "Users can insert their own diaries" ON diaries;
DROP POLICY IF EXISTS "Users can update their own diaries" ON diaries;
DROP POLICY IF EXISTS "Users can delete their own diaries" ON diaries;

-- 步骤 6: 创建 RLS 策略
-- ============================================

-- SELECT 策略：用户只能查看自己的日记
CREATE POLICY "Users can view their own diaries"
ON diaries FOR SELECT
USING (auth.uid() = user_id);

-- INSERT 策略：用户只能为自己创建日记
CREATE POLICY "Users can insert their own diaries"
ON diaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE 策略：用户只能更新自己的日记
CREATE POLICY "Users can update their own diaries"
ON diaries FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE 策略：用户只能删除自己的日记
CREATE POLICY "Users can delete their own diaries"
ON diaries FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 验证脚本
-- ============================================
-- 运行以下查询来验证迁移是否成功

-- 1. 检查 user_id 列是否存在
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'diaries' AND column_name = 'user_id';

-- 2. 检查索引是否创建
-- SELECT indexname 
-- FROM pg_indexes 
-- WHERE tablename = 'diaries' AND indexname = 'diaries_user_id_idx';

-- 3. 检查 RLS 是否启用
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'diaries';

-- 4. 检查策略是否创建
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'diaries';

-- ============================================
-- 回滚脚本（如果需要）
-- ============================================
-- 如果需要回滚此迁移，请运行以下命令：

-- DROP POLICY IF EXISTS "Users can view their own diaries" ON diaries;
-- DROP POLICY IF EXISTS "Users can insert their own diaries" ON diaries;
-- DROP POLICY IF EXISTS "Users can update their own diaries" ON diaries;
-- DROP POLICY IF EXISTS "Users can delete their own diaries" ON diaries;
-- ALTER TABLE diaries DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS diaries_user_id_idx;
-- ALTER TABLE diaries DROP COLUMN IF EXISTS user_id;
