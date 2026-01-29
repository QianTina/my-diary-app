-- ============================================
-- 快速修复脚本
-- 为现有日记添加 user_id 和 notebook_id
-- ============================================

-- 步骤 1: 检查并添加 user_id 列（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'diaries' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE diaries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to diaries table';
  ELSE
    RAISE NOTICE 'user_id column already exists';
  END IF;
END $$;

-- 步骤 2: 为所有现有日记设置 user_id（使用第一个用户）
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- 获取第一个用户的 ID
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    -- 更新所有没有 user_id 的日记
    UPDATE diaries 
    SET user_id = first_user_id 
    WHERE user_id IS NULL;
    
    RAISE NOTICE 'Updated diaries with user_id: %', first_user_id;
  ELSE
    RAISE NOTICE 'No users found in auth.users table';
  END IF;
END $$;

-- 步骤 3: 执行完整的日记本迁移脚本
-- （这会创建 notebooks 表和添加 notebook_id 列）
-- 请先执行 add_paper_diary_notebook.sql

-- 步骤 4: 为当前用户创建默认日记本并迁移日记
DO $$
DECLARE
  current_user_id UUID;
  default_notebook_id UUID;
  migrated_count INTEGER;
BEGIN
  -- 获取当前用户 ID（替换为你的实际用户 ID）
  SELECT id INTO current_user_id FROM auth.users LIMIT 1;
  
  IF current_user_id IS NOT NULL THEN
    -- 调用迁移函数
    SELECT * INTO default_notebook_id, migrated_count
    FROM migrate_user_to_notebooks(current_user_id);
    
    RAISE NOTICE 'Migration complete!';
    RAISE NOTICE 'Default notebook ID: %', default_notebook_id;
    RAISE NOTICE 'Migrated entries: %', migrated_count;
  ELSE
    RAISE NOTICE 'No user found';
  END IF;
END $$;

-- 步骤 5: 验证结果
SELECT 
  'Notebooks' as table_name,
  COUNT(*) as count
FROM notebooks
UNION ALL
SELECT 
  'Diaries with notebook_id' as table_name,
  COUNT(*) as count
FROM diaries
WHERE notebook_id IS NOT NULL
UNION ALL
SELECT 
  'Diaries without notebook_id' as table_name,
  COUNT(*) as count
FROM diaries
WHERE notebook_id IS NULL;
