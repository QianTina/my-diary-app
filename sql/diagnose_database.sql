-- ============================================
-- 数据库诊断脚本
-- 用于检查当前数据库状态
-- ============================================

-- 1. 检查 diaries 表的列
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'diaries'
ORDER BY ordinal_position;

-- 2. 检查 notebooks 表是否存在
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'notebooks'
) AS notebooks_table_exists;

-- 3. 如果 notebooks 表存在，查看所有日记本
SELECT * FROM notebooks;

-- 4. 查看所有日记（前10条）
SELECT 
  id, 
  title, 
  CASE 
    WHEN column_name = 'user_id' THEN 'user_id exists'
    ELSE 'user_id missing'
  END as user_id_status,
  CASE 
    WHEN column_name = 'notebook_id' THEN 'notebook_id exists'
    ELSE 'notebook_id missing'
  END as notebook_id_status,
  created_at
FROM diaries
LIMIT 10;

-- 5. 统计日记数量
SELECT 
  COUNT(*) as total_diaries,
  COUNT(CASE WHEN notebook_id IS NULL THEN 1 END) as diaries_without_notebook,
  COUNT(CASE WHEN notebook_id IS NOT NULL THEN 1 END) as diaries_with_notebook
FROM diaries;
