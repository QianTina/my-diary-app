-- ============================================
-- 任务管理系统数据库迁移脚本
-- Task Management System Database Migration
-- ============================================
-- 此脚本创建任务管理系统所需的所有表和 RLS 策略
-- This script creates all tables and RLS policies for the task management system

-- ============================================
-- 步骤 1: 创建分类表 (Categories Table)
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0 AND length(name) <= 100),
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 步骤 2: 创建任务表 (Tasks Table)
-- ============================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 500),
  description TEXT CHECK (length(description) <= 5000),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('complete', 'incomplete')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- 创建更新时间戳触发器
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 步骤 3: 创建任务-日记关联表 (Task-Diary Links Table)
-- ============================================

CREATE TABLE IF NOT EXISTS task_diary_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  diary_entry_id UUID NOT NULL REFERENCES diaries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, diary_entry_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_task_diary_links_task_id ON task_diary_links(task_id);
CREATE INDEX IF NOT EXISTS idx_task_diary_links_diary_entry_id ON task_diary_links(diary_entry_id);

-- ============================================
-- 步骤 4: 启用行级安全策略 (Enable RLS)
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_diary_links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 步骤 5: 创建分类表的 RLS 策略 (Categories RLS Policies)
-- ============================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

-- SELECT 策略：用户只能查看自己的分类
CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT 策略：用户只能为自己创建分类
CREATE POLICY "Users can insert their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE 策略：用户只能更新自己的分类
CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE 策略：用户只能删除自己的分类
CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 步骤 6: 创建任务表的 RLS 策略 (Tasks RLS Policies)
-- ============================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- SELECT 策略：用户只能查看自己的任务
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT 策略：用户只能为自己创建任务
CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE 策略：用户只能更新自己的任务
CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE 策略：用户只能删除自己的任务
CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 步骤 7: 创建任务-日记关联表的 RLS 策略 (Task-Diary Links RLS Policies)
-- ============================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view links for their tasks" ON task_diary_links;
DROP POLICY IF EXISTS "Users can create links for their tasks" ON task_diary_links;
DROP POLICY IF EXISTS "Users can delete links for their tasks" ON task_diary_links;

-- SELECT 策略：用户只能查看自己任务的关联
CREATE POLICY "Users can view links for their tasks"
  ON task_diary_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_diary_links.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- INSERT 策略：用户只能为自己的任务创建关联
CREATE POLICY "Users can create links for their tasks"
  ON task_diary_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_diary_links.task_id
      AND tasks.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM diaries
      WHERE diaries.id = task_diary_links.diary_entry_id
      AND diaries.user_id = auth.uid()
    )
  );

-- DELETE 策略：用户只能删除自己任务的关联
CREATE POLICY "Users can delete links for their tasks"
  ON task_diary_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_diary_links.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- ============================================
-- 验证脚本 (Verification Queries)
-- ============================================
-- 运行以下查询来验证迁移是否成功
-- Run these queries to verify the migration was successful

-- 1. 检查表是否创建
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('categories', 'tasks', 'task_diary_links');

-- 2. 检查索引是否创建
-- SELECT tablename, indexname FROM pg_indexes 
-- WHERE tablename IN ('categories', 'tasks', 'task_diary_links');

-- 3. 检查 RLS 是否启用
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE tablename IN ('categories', 'tasks', 'task_diary_links');

-- 4. 检查策略是否创建
-- SELECT tablename, policyname, cmd FROM pg_policies 
-- WHERE tablename IN ('categories', 'tasks', 'task_diary_links');

-- 5. 检查约束是否创建
-- SELECT table_name, constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name IN ('categories', 'tasks', 'task_diary_links');

-- ============================================
-- 回滚脚本 (Rollback Script)
-- ============================================
-- 如果需要回滚此迁移，请运行以下命令：
-- If you need to rollback this migration, run the following commands:

-- DROP TABLE IF EXISTS task_diary_links CASCADE;
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
