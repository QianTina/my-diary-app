# 纸质风格日记本数据库迁移指南

## 概述

此迁移脚本为日记应用添加纸质风格日记本功能，包括：

- 创建 `notebooks` 表用于管理多个日记本
- 为 `diaries` 表添加 `notebook_id`、`paper_style` 和 `bookmarked` 列
- 创建性能优化索引
- 创建自动更新时间戳的触发器
- 提供迁移辅助函数用于创建默认日记本和迁移现有条目

## 迁移步骤

### 1. 在 Supabase 中执行迁移脚本

1. 登录到 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 导航到 **SQL Editor**
4. 创建新查询
5. 复制 `add_paper_diary_notebook.sql` 文件的全部内容
6. 粘贴到 SQL 编辑器中
7. 点击 **Run** 执行脚本

### 2. 验证迁移

执行以下查询来验证迁移是否成功：

```sql
-- 检查 notebooks 表是否创建
SELECT table_name FROM information_schema.tables WHERE table_name = 'notebooks';

-- 检查 diaries 表的新列是否存在
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diaries' 
  AND column_name IN ('notebook_id', 'paper_style', 'bookmarked');

-- 检查索引是否创建
SELECT indexname FROM pg_indexes WHERE tablename IN ('notebooks', 'diaries');

-- 检查触发器是否创建
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%updated_at%';

-- 检查 RLS 策略是否创建
SELECT policyname, tablename FROM pg_policies WHERE tablename = 'notebooks';
```

### 3. 为现有用户迁移数据

如果你有现有的日记条目需要迁移到默认日记本，请执行以下步骤：

#### 方法 A：为单个用户迁移

```sql
-- 替换 'YOUR_USER_ID' 为实际的用户 UUID
-- 你可以在 Supabase Dashboard -> Authentication -> Users 中找到用户 ID

-- 1. 检查是否需要迁移
SELECT * FROM check_migration_status('YOUR_USER_ID');

-- 2. 执行迁移
SELECT * FROM migrate_user_to_notebooks('YOUR_USER_ID');
```

#### 方法 B：为所有用户批量迁移

```sql
-- 为所有有未迁移条目的用户创建默认日记本并迁移条目
DO $$
DECLARE
  user_record RECORD;
  migration_result RECORD;
BEGIN
  -- 遍历所有有未迁移条目的用户
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM diaries 
    WHERE notebook_id IS NULL
  LOOP
    -- 为每个用户执行迁移
    SELECT * INTO migration_result 
    FROM migrate_user_to_notebooks(user_record.user_id);
    
    RAISE NOTICE 'Migrated user %: created notebook %, migrated % entries',
      user_record.user_id,
      migration_result.default_notebook_id,
      migration_result.migrated_entries_count;
  END LOOP;
END $$;
```

## 数据库架构

### notebooks 表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 唯一标识符 |
| user_id | UUID | NOT NULL, FK | 所属用户 ID |
| name | TEXT | NOT NULL | 日记本名称 |
| cover_color | TEXT | - | 封面颜色（可选） |
| cover_image | TEXT | - | 封面图片 URL（可选） |
| description | TEXT | - | 日记本描述（可选） |
| paper_style | TEXT | NOT NULL, CHECK | 默认纸张样式 |
| font_family | TEXT | NOT NULL | 默认字体系列 |
| font_size | INTEGER | NOT NULL, CHECK | 默认字体大小（12-24） |
| line_height | DECIMAL(3,1) | NOT NULL, CHECK | 默认行高（1.2-2.0） |
| created_at | TIMESTAMPTZ | NOT NULL | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL | 最后更新时间 |
| archived | BOOLEAN | NOT NULL | 是否已归档 |

**纸张样式选项：**
- `blank` - 空白
- `lined` - 横线
- `grid` - 方格
- `dotted` - 点阵
- `vintage` - 复古

### diaries 表新增列

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| notebook_id | UUID | FK | 所属日记本 ID |
| paper_style | TEXT | CHECK | 纸张样式覆盖（可选） |
| bookmarked | BOOLEAN | NOT NULL | 是否已添加书签 |

## 索引

### notebooks 表索引
- `idx_notebooks_user_id` - 用户 ID 索引
- `idx_notebooks_archived` - 用户 ID + 归档状态复合索引
- `idx_notebooks_created_at` - 创建时间索引（降序）

### diaries 表新增索引
- `idx_diaries_notebook_id` - 日记本 ID 索引
- `idx_diaries_bookmarked` - 日记本 ID + 书签状态复合索引
- `idx_diaries_search` - 全文搜索 GIN 索引（标题 + 内容）

## 触发器

- `update_notebooks_updated_at` - 自动更新 notebooks 表的 updated_at 字段
- `update_diaries_updated_at` - 自动更新 diaries 表的 updated_at 字段

## 辅助函数

### migrate_user_to_notebooks(target_user_id UUID)

为指定用户创建默认日记本并迁移所有未分配的条目。

**参数：**
- `target_user_id` - 目标用户的 UUID

**返回：**
- `default_notebook_id` - 创建或找到的默认日记本 ID
- `migrated_entries_count` - 迁移的条目数量

**示例：**
```sql
SELECT * FROM migrate_user_to_notebooks('550e8400-e29b-41d4-a716-446655440000');
```

### check_migration_status(target_user_id UUID)

检查用户是否有需要迁移的条目。

**参数：**
- `target_user_id` - 目标用户的 UUID

**返回：**
- `needs_migration` - 是否需要迁移（布尔值）
- `unmigrated_entries_count` - 未迁移的条目数量

**示例：**
```sql
SELECT * FROM check_migration_status('550e8400-e29b-41d4-a716-446655440000');
```

## 行级安全策略（RLS）

notebooks 表启用了 RLS，确保用户只能访问自己的日记本：

- **SELECT** - 用户只能查看自己的日记本
- **INSERT** - 用户只能为自己创建日记本
- **UPDATE** - 用户只能更新自己的日记本
- **DELETE** - 用户只能删除自己的日记本

## 回滚

如果需要回滚此迁移，请执行脚本末尾的回滚命令。

**警告：** 回滚将删除所有日记本数据和相关的日记条目关联！

## 故障排除

### 问题：迁移函数执行失败

**可能原因：**
- 用户 ID 不存在
- 数据库权限不足

**解决方案：**
1. 验证用户 ID 是否正确
2. 确保你有足够的数据库权限
3. 检查 Supabase 日志以获取详细错误信息

### 问题：全文搜索索引创建失败

**可能原因：**
- diaries 表中有 NULL 值

**解决方案：**
索引创建使用了 `COALESCE` 函数来处理 NULL 值，应该不会出现此问题。如果仍然失败，请检查数据库日志。

### 问题：外键约束违规

**可能原因：**
- 尝试为不存在的日记本创建条目

**解决方案：**
确保在创建条目之前日记本已存在，或者先运行迁移函数创建默认日记本。

## 下一步

迁移完成后，你可以：

1. 在应用中实现日记本管理功能
2. 实现纸张样式和字体自定义
3. 实现书签和搜索功能
4. 实现页面翻转动画和导航

参考设计文档和任务列表以了解完整的实现计划。
