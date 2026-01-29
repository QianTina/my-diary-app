-- ============================================
-- 纸质风格日记本功能数据库迁移脚本
-- ============================================
-- 此脚本为日记应用添加纸质风格日记本功能
-- 包括创建 notebooks 表、更新 diaries 表、创建索引和触发器

-- ============================================
-- 步骤 1: 创建 notebooks 表
-- ============================================
-- 注意：此脚本假设 add_user_authentication.sql 已经执行，diaries 表已有 user_id 列
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cover_color TEXT,
  cover_image TEXT,
  description TEXT,
  paper_style TEXT NOT NULL DEFAULT 'blank' CHECK (paper_style IN ('blank', 'lined', 'grid', 'dotted', 'vintage')),
  font_family TEXT NOT NULL DEFAULT 'system',
  font_size INTEGER NOT NULL DEFAULT 16 CHECK (font_size BETWEEN 12 AND 24),
  line_height DECIMAL(3,1) NOT NULL DEFAULT 1.5 CHECK (line_height BETWEEN 1.2 AND 2.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived BOOLEAN NOT NULL DEFAULT FALSE
);

-- 添加表注释
COMMENT ON TABLE notebooks IS '日记本表 - 用于组织和管理日记条目';
COMMENT ON COLUMN notebooks.id IS '唯一标识符';
COMMENT ON COLUMN notebooks.user_id IS '所属用户 ID';
COMMENT ON COLUMN notebooks.name IS '日记本名称';
COMMENT ON COLUMN notebooks.cover_color IS '封面颜色（可选）';
COMMENT ON COLUMN notebooks.cover_image IS '封面图片 URL（可选）';
COMMENT ON COLUMN notebooks.description IS '日记本描述（可选）';
COMMENT ON COLUMN notebooks.paper_style IS '默认纸张样式：blank(空白), lined(横线), grid(方格), dotted(点阵), vintage(复古)';
COMMENT ON COLUMN notebooks.font_family IS '默认字体系列';
COMMENT ON COLUMN notebooks.font_size IS '默认字体大小（12-24px）';
COMMENT ON COLUMN notebooks.line_height IS '默认行高（1.2-2.0）';
COMMENT ON COLUMN notebooks.created_at IS '创建时间';
COMMENT ON COLUMN notebooks.updated_at IS '最后更新时间';
COMMENT ON COLUMN notebooks.archived IS '是否已归档';

-- ============================================
-- 步骤 2: 为 notebooks 表创建索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_archived ON notebooks(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_notebooks_created_at ON notebooks(created_at DESC);

-- ============================================
-- 步骤 3: 为 diaries 表添加新列
-- ============================================
-- 添加 notebook_id 列（外键关联到 notebooks 表）
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE;

-- 添加 paper_style 列（可选，用于覆盖日记本默认样式）
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS paper_style TEXT CHECK (paper_style IN ('blank', 'lined', 'grid', 'dotted', 'vintage'));

-- 添加 bookmarked 列（书签标记）
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS bookmarked BOOLEAN NOT NULL DEFAULT FALSE;

-- 添加列注释
COMMENT ON COLUMN diaries.notebook_id IS '所属日记本 ID';
COMMENT ON COLUMN diaries.paper_style IS '纸张样式覆盖（可选）：blank(空白), lined(横线), grid(方格), dotted(点阵), vintage(复古)';
COMMENT ON COLUMN diaries.bookmarked IS '是否已添加书签';

-- ============================================
-- 步骤 4: 为 diaries 表创建新索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_diaries_notebook_id ON diaries(notebook_id);
CREATE INDEX IF NOT EXISTS idx_diaries_bookmarked ON diaries(notebook_id, bookmarked);

-- 创建全文搜索索引（用于标题和内容搜索）
CREATE INDEX IF NOT EXISTS idx_diaries_search ON diaries USING GIN (
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, ''))
);

-- ============================================
-- 步骤 5: 创建 updated_at 触发器函数
-- ============================================
-- 创建或替换触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 notebooks 表添加触发器
DROP TRIGGER IF EXISTS update_notebooks_updated_at ON notebooks;
CREATE TRIGGER update_notebooks_updated_at
  BEFORE UPDATE ON notebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 diaries 表添加触发器（如果不存在）
DROP TRIGGER IF EXISTS update_diaries_updated_at ON diaries;
CREATE TRIGGER update_diaries_updated_at
  BEFORE UPDATE ON diaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 步骤 6: 设置 notebooks 表的行级安全策略（RLS）
-- ============================================
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view their own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can insert their own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can update their own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can delete their own notebooks" ON notebooks;

-- SELECT 策略：用户只能查看自己的日记本
CREATE POLICY "Users can view their own notebooks"
ON notebooks FOR SELECT
USING (auth.uid() = user_id);

-- INSERT 策略：用户只能为自己创建日记本
CREATE POLICY "Users can insert their own notebooks"
ON notebooks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE 策略：用户只能更新自己的日记本
CREATE POLICY "Users can update their own notebooks"
ON notebooks FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE 策略：用户只能删除自己的日记本
CREATE POLICY "Users can delete their own notebooks"
ON notebooks FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 步骤 7: 创建迁移辅助函数
-- ============================================
-- 此函数为用户创建默认日记本并迁移现有条目
CREATE OR REPLACE FUNCTION migrate_user_to_notebooks(target_user_id UUID)
RETURNS TABLE(
  default_notebook_id UUID,
  migrated_entries_count INTEGER
) AS $$
DECLARE
  v_notebook_id UUID;
  v_migrated_count INTEGER;
BEGIN
  -- 检查用户是否已有默认日记本
  SELECT id INTO v_notebook_id
  FROM notebooks
  WHERE user_id = target_user_id
    AND name = 'My Diary'
  LIMIT 1;

  -- 如果不存在，创建默认日记本
  IF v_notebook_id IS NULL THEN
    INSERT INTO notebooks (user_id, name, description, paper_style, font_family, font_size, line_height)
    VALUES (
      target_user_id,
      'My Diary',
      'My personal diary',
      'blank',
      'system',
      16,
      1.5
    )
    RETURNING id INTO v_notebook_id;
  END IF;

  -- 迁移所有没有 notebook_id 的条目
  UPDATE diaries
  SET notebook_id = v_notebook_id
  WHERE user_id = target_user_id
    AND notebook_id IS NULL;

  -- 获取迁移的条目数量
  GET DIAGNOSTICS v_migrated_count = ROW_COUNT;

  -- 返回结果
  RETURN QUERY SELECT v_notebook_id, v_migrated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION migrate_user_to_notebooks IS '为指定用户创建默认日记本并迁移现有条目';

-- ============================================
-- 步骤 8: 创建检查迁移状态的函数
-- ============================================
CREATE OR REPLACE FUNCTION check_migration_status(target_user_id UUID)
RETURNS TABLE(
  needs_migration BOOLEAN,
  unmigrated_entries_count INTEGER
) AS $$
DECLARE
  v_unmigrated_count INTEGER;
BEGIN
  -- 统计没有 notebook_id 的条目数量
  SELECT COUNT(*) INTO v_unmigrated_count
  FROM diaries
  WHERE user_id = target_user_id
    AND notebook_id IS NULL;

  -- 返回结果
  RETURN QUERY SELECT 
    (v_unmigrated_count > 0) AS needs_migration,
    v_unmigrated_count AS unmigrated_entries_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_migration_status IS '检查用户是否需要迁移现有条目';

-- ============================================
-- 验证脚本
-- ============================================
-- 运行以下查询来验证迁移是否成功

-- 1. 检查 notebooks 表是否创建
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'notebooks';

-- 2. 检查 diaries 表的新列是否存在
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'diaries' 
--   AND column_name IN ('notebook_id', 'paper_style', 'bookmarked');

-- 3. 检查索引是否创建
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('notebooks', 'diaries');

-- 4. 检查触发器是否创建
-- SELECT trigger_name, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_name LIKE '%updated_at%';

-- 5. 检查 RLS 策略是否创建
-- SELECT policyname, tablename FROM pg_policies WHERE tablename = 'notebooks';

-- 6. 测试迁移函数（替换为实际的 user_id）
-- SELECT * FROM check_migration_status('YOUR_USER_ID');
-- SELECT * FROM migrate_user_to_notebooks('YOUR_USER_ID');

-- ============================================
-- 回滚脚本（如果需要）
-- ============================================
-- 如果需要回滚此迁移，请运行以下命令：

-- DROP FUNCTION IF EXISTS migrate_user_to_notebooks(UUID);
-- DROP FUNCTION IF EXISTS check_migration_status(UUID);
-- DROP POLICY IF EXISTS "Users can view their own notebooks" ON notebooks;
-- DROP POLICY IF EXISTS "Users can insert their own notebooks" ON notebooks;
-- DROP POLICY IF EXISTS "Users can update their own notebooks" ON notebooks;
-- DROP POLICY IF EXISTS "Users can delete their own notebooks" ON notebooks;
-- DROP TRIGGER IF EXISTS update_notebooks_updated_at ON notebooks;
-- DROP TRIGGER IF EXISTS update_diaries_updated_at ON diaries;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP INDEX IF EXISTS idx_diaries_search;
-- DROP INDEX IF EXISTS idx_diaries_bookmarked;
-- DROP INDEX IF EXISTS idx_diaries_notebook_id;
-- DROP INDEX IF EXISTS idx_notebooks_created_at;
-- DROP INDEX IF EXISTS idx_notebooks_archived;
-- DROP INDEX IF EXISTS idx_notebooks_user_id;
-- ALTER TABLE diaries DROP COLUMN IF EXISTS bookmarked;
-- ALTER TABLE diaries DROP COLUMN IF EXISTS paper_style;
-- ALTER TABLE diaries DROP COLUMN IF EXISTS notebook_id;
-- DROP TABLE IF EXISTS notebooks CASCADE;
