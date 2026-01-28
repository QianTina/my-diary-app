# 任务管理系统数据库迁移指南
# Task Management System Database Migration Guide

## 概述 Overview

本文档说明如何为任务管理系统设置数据库表和安全策略。

This document explains how to set up database tables and security policies for the task management system.

## 前提条件 Prerequisites

- ✅ Supabase 项目已创建 (Supabase project created)
- ✅ 用户认证系统已配置 (User authentication system configured)
- ✅ `diaries` 表已添加 `user_id` 字段 (diaries table has user_id column)

## 迁移步骤 Migration Steps

### 1. 打开 Supabase SQL Editor

1. 登录 Supabase Dashboard
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"

### 2. 执行迁移脚本

1. 点击 "New Query" 创建新查询
2. 复制 `sql/add_task_management.sql` 文件的全部内容
3. 粘贴到 SQL Editor
4. 点击 "Run" 执行脚本

### 3. 验证迁移

执行以下查询验证迁移是否成功：

```sql
-- 检查表是否创建
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'tasks', 'task_diary_links');

-- 应该返回 3 行：categories, tasks, task_diary_links
```

```sql
-- 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('categories', 'tasks', 'task_diary_links');

-- 所有表的 rowsecurity 应该为 true
```

```sql
-- 检查策略数量
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('categories', 'tasks', 'task_diary_links')
GROUP BY tablename;

-- categories: 4 个策略
-- tasks: 4 个策略
-- task_diary_links: 3 个策略
```

## 数据库架构 Database Schema

### Categories 表（分类）

| 列名 Column | 类型 Type | 说明 Description |
|------------|----------|------------------|
| id | UUID | 主键 Primary key |
| user_id | UUID | 用户 ID User ID (FK to auth.users) |
| name | TEXT | 分类名称 Category name (1-100 chars) |
| color | TEXT | 颜色代码 Color code (optional) |
| created_at | TIMESTAMPTZ | 创建时间 Creation timestamp |
| updated_at | TIMESTAMPTZ | 更新时间 Update timestamp |

**约束 Constraints:**
- `name` 不能为空或纯空格 (not empty or whitespace)
- `(user_id, name)` 唯一 (unique per user)

### Tasks 表（任务）

| 列名 Column | 类型 Type | 说明 Description |
|------------|----------|------------------|
| id | UUID | 主键 Primary key |
| user_id | UUID | 用户 ID User ID (FK to auth.users) |
| title | TEXT | 任务标题 Task title (1-500 chars) |
| description | TEXT | 任务描述 Task description (max 5000 chars) |
| priority | TEXT | 优先级 Priority (high/medium/low) |
| status | TEXT | 状态 Status (complete/incomplete) |
| category_id | UUID | 分类 ID Category ID (FK to categories) |
| due_date | TIMESTAMPTZ | 截止日期 Due date (optional) |
| completed_at | TIMESTAMPTZ | 完成时间 Completion timestamp |
| created_at | TIMESTAMPTZ | 创建时间 Creation timestamp |
| updated_at | TIMESTAMPTZ | 更新时间 Update timestamp |

**约束 Constraints:**
- `title` 不能为空或纯空格 (not empty or whitespace)
- `priority` 必须是 high/medium/low
- `status` 必须是 complete/incomplete
- 默认 priority = 'medium', status = 'incomplete'

### Task_Diary_Links 表（任务-日记关联）

| 列名 Column | 类型 Type | 说明 Description |
|------------|----------|------------------|
| id | UUID | 主键 Primary key |
| task_id | UUID | 任务 ID Task ID (FK to tasks) |
| diary_entry_id | UUID | 日记 ID Diary ID (FK to diaries) |
| created_at | TIMESTAMPTZ | 创建时间 Creation timestamp |

**约束 Constraints:**
- `(task_id, diary_entry_id)` 唯一 (unique pair)

## 行级安全策略 Row Level Security Policies

### Categories 策略

- ✅ **SELECT**: 用户只能查看自己的分类
- ✅ **INSERT**: 用户只能创建自己的分类
- ✅ **UPDATE**: 用户只能更新自己的分类
- ✅ **DELETE**: 用户只能删除自己的分类

### Tasks 策略

- ✅ **SELECT**: 用户只能查看自己的任务
- ✅ **INSERT**: 用户只能创建自己的任务
- ✅ **UPDATE**: 用户只能更新自己的任务
- ✅ **DELETE**: 用户只能删除自己的任务

### Task_Diary_Links 策略

- ✅ **SELECT**: 用户只能查看自己任务的关联
- ✅ **INSERT**: 用户只能为自己的任务和日记创建关联
- ✅ **DELETE**: 用户只能删除自己任务的关联

## 索引优化 Index Optimization

以下索引已创建以提高查询性能：

- `idx_categories_user_id` - 按用户查询分类
- `idx_tasks_user_id` - 按用户查询任务
- `idx_tasks_due_date` - 按截止日期查询任务
- `idx_tasks_status` - 按状态过滤任务
- `idx_tasks_category_id` - 按分类过滤任务
- `idx_tasks_priority` - 按优先级过滤任务
- `idx_task_diary_links_task_id` - 查询任务的日记关联
- `idx_task_diary_links_diary_entry_id` - 查询日记的任务关联

## 级联删除行为 Cascade Delete Behavior

- 删除用户 → 删除该用户的所有分类、任务和关联
- 删除分类 → 将关联任务的 `category_id` 设为 NULL
- 删除任务 → 删除该任务的所有日记关联
- 删除日记 → 删除该日记的所有任务关联

## 回滚步骤 Rollback Steps

如果需要回滚迁移，在 SQL Editor 中执行：

```sql
DROP TABLE IF EXISTS task_diary_links CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

⚠️ **警告 Warning**: 回滚将删除所有任务数据！请确保已备份。

## 常见问题 Troubleshooting

### 问题 1: 迁移脚本执行失败

**可能原因:**
- `auth.users` 表不存在（需要先启用 Supabase Auth）
- `diaries` 表不存在（需要先创建日记表）

**解决方案:**
1. 确保 Supabase Auth 已启用
2. 确保 `diaries` 表已创建
3. 按顺序执行迁移脚本

### 问题 2: RLS 策略阻止数据访问

**可能原因:**
- 用户未登录
- `user_id` 字段未正确设置

**解决方案:**
1. 确保用户已通过 Supabase Auth 登录
2. 在创建任务时确保设置了正确的 `user_id`

### 问题 3: 外键约束错误

**可能原因:**
- 尝试关联不存在的分类或日记

**解决方案:**
1. 确保分类存在后再关联任务
2. 确保日记存在后再创建关联

## 下一步 Next Steps

迁移完成后，你可以：

1. ✅ 创建 TypeScript 类型定义
2. ✅ 实现 Task Service
3. ✅ 创建 Zustand Store
4. ✅ 实现 UI 组件

参考 `.kiro/specs/workspace-todo-management/tasks.md` 了解详细的实现步骤。

## 相关文档 Related Documentation

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Task Management Requirements](../.kiro/specs/workspace-todo-management/requirements.md)
- [Task Management Design](../.kiro/specs/workspace-todo-management/design.md)

---

**创建时间 Created**: 2025-01-28
**版本 Version**: 1.0.0
