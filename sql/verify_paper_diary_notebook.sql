-- ============================================
-- 纸质风格日记本功能验证脚本
-- ============================================
-- 此脚本用于验证 add_paper_diary_notebook.sql 迁移是否成功执行

-- ============================================
-- 1. 检查 notebooks 表是否创建
-- ============================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'notebooks'
    ) THEN '✓ notebooks 表已创建'
    ELSE '✗ notebooks 表不存在'
  END AS notebooks_table_status;

-- ============================================
-- 2. 检查 notebooks 表的列
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notebooks'
ORDER BY ordinal_position;

-- ============================================
-- 3. 检查 diaries 表的新列
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'diaries' 
  AND column_name IN ('notebook_id', 'paper_style', 'bookmarked')
ORDER BY ordinal_position;

-- ============================================
-- 4. 检查 notebooks 表的索引
-- ============================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'notebooks'
ORDER BY indexname;

-- ============================================
-- 5. 检查 diaries 表的新索引
-- ============================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'diaries'
  AND indexname IN ('idx_diaries_notebook_id', 'idx_diaries_bookmarked', 'idx_diaries_search')
ORDER BY indexname;

-- ============================================
-- 6. 检查触发器
-- ============================================
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%updated_at%'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 7. 检查 notebooks 表的 RLS 策略
-- ============================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'notebooks'
ORDER BY policyname;

-- ============================================
-- 8. 检查 RLS 是否启用
-- ============================================
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE tablename IN ('notebooks', 'diaries')
ORDER BY tablename;

-- ============================================
-- 9. 检查迁移辅助函数
-- ============================================
SELECT 
  routine_name,
  routine_type,
  data_type AS return_type
FROM information_schema.routines
WHERE routine_name IN ('migrate_user_to_notebooks', 'check_migration_status', 'update_updated_at_column')
ORDER BY routine_name;

-- ============================================
-- 10. 检查约束
-- ============================================
-- notebooks 表的约束
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'notebooks'
ORDER BY constraint_type, constraint_name;

-- diaries 表的外键约束（notebook_id）
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'diaries'
  AND constraint_name LIKE '%notebook%'
ORDER BY constraint_name;

-- ============================================
-- 11. 统计信息
-- ============================================
SELECT 
  'notebooks' AS table_name,
  COUNT(*) AS row_count
FROM notebooks
UNION ALL
SELECT 
  'diaries' AS table_name,
  COUNT(*) AS row_count
FROM diaries
UNION ALL
SELECT 
  'diaries_with_notebook' AS table_name,
  COUNT(*) AS row_count
FROM diaries
WHERE notebook_id IS NOT NULL
UNION ALL
SELECT 
  'diaries_without_notebook' AS table_name,
  COUNT(*) AS row_count
FROM diaries
WHERE notebook_id IS NULL;

-- ============================================
-- 完成
-- ============================================
SELECT '✓ 验证脚本执行完成！请检查上述结果以确认迁移是否成功。' AS status;
