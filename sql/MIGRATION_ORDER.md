# 数据库迁移执行顺序

## 概述

本文档说明了日记应用数据库迁移脚本的正确执行顺序。请按照以下顺序执行迁移脚本，以确保数据库架构正确建立。

## 迁移顺序

### 1. 基础表创建（首次安装）

如果这是全新安装，首先创建基础的 diaries 表：

```bash
执行文件: sql/schema.sql 或 sql/create_table_v2.sql
```

**说明：**
- `schema.sql` - 简单版本，适合快速开发
- `create_table_v2.sql` - 完整版本，包含所有 v2.0 功能

**注意：** 如果数据库中已有 diaries 表，可以跳过此步骤。

### 2. 用户认证系统（必需）

在添加纸质日记本功能之前，必须先添加用户认证支持：

```bash
执行文件: sql/add_user_authentication.sql
```

**此步骤会：**
- 为 diaries 表添加 `user_id` 列
- 创建外键关联到 `auth.users` 表
- 设置行级安全策略（RLS）
- 创建用户访问控制策略

**验证：**
```sql
-- 检查 user_id 列是否存在
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diaries' AND column_name = 'user_id';
```

### 3. 纸质风格日记本功能（本任务）

用户认证系统就绪后，执行纸质日记本迁移：

```bash
执行文件: sql/add_paper_diary_notebook.sql
```

**此步骤会：**
- 创建 `notebooks` 表
- 为 diaries 表添加 `notebook_id`、`paper_style`、`bookmarked` 列
- 创建性能优化索引
- 创建自动更新时间戳的触发器
- 创建迁移辅助函数
- 设置 notebooks 表的 RLS 策略

**验证：**
```bash
执行文件: sql/verify_paper_diary_notebook.sql
```

### 4. 任务管理功能（可选）

如果需要任务管理功能，可以执行：

```bash
执行文件: sql/add_task_management.sql
```

**说明：** 此功能独立于纸质日记本功能，可以在任何时候添加。

## 数据迁移

### 为现有用户迁移数据

如果你有现有的日记条目需要迁移到默认日记本：

#### 方法 A：为单个用户迁移

```sql
-- 1. 检查是否需要迁移
SELECT * FROM check_migration_status('YOUR_USER_ID');

-- 2. 执行迁移
SELECT * FROM migrate_user_to_notebooks('YOUR_USER_ID');
```

#### 方法 B：为所有用户批量迁移

```sql
-- 为所有有未迁移条目的用户创建默认日记本并迁移条目
DO $
DECLARE
  user_record RECORD;
  migration_result RECORD;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM diaries 
    WHERE notebook_id IS NULL
  LOOP
    SELECT * INTO migration_result 
    FROM migrate_user_to_notebooks(user_record.user_id);
    
    RAISE NOTICE 'Migrated user %: created notebook %, migrated % entries',
      user_record.user_id,
      migration_result.default_notebook_id,
      migration_result.migrated_entries_count;
  END LOOP;
END $;
```

## 在 Supabase 中执行迁移

### 步骤 1：登录 Supabase Dashboard

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目

### 步骤 2：打开 SQL Editor

1. 在左侧导航栏中点击 **SQL Editor**
2. 点击 **New query** 创建新查询

### 步骤 3：执行迁移脚本

1. 复制迁移脚本的全部内容
2. 粘贴到 SQL 编辑器中
3. 点击 **Run** 执行脚本
4. 检查执行结果，确保没有错误

### 步骤 4：验证迁移

1. 创建新查询
2. 复制 `verify_paper_diary_notebook.sql` 的内容
3. 执行验证脚本
4. 检查所有验证项是否通过

## 常见问题

### Q: 如果我已经执行了部分迁移脚本怎么办？

A: 所有迁移脚本都使用了 `IF NOT EXISTS` 或 `IF EXISTS` 子句，可以安全地重复执行。已存在的对象不会被重复创建。

### Q: 如何回滚迁移？

A: 每个迁移脚本末尾都包含回滚命令。但请注意，回滚会删除数据！

### Q: 迁移失败怎么办？

A: 
1. 检查错误消息
2. 确认前置迁移已执行（特别是 user_id 列）
3. 检查数据库权限
4. 查看 Supabase 日志获取详细信息

### Q: 如何确认迁移成功？

A: 执行 `verify_paper_diary_notebook.sql` 验证脚本，检查所有项目是否通过。

## 依赖关系图

```
schema.sql / create_table_v2.sql (创建 diaries 表)
    ↓
add_user_authentication.sql (添加 user_id)
    ↓
add_paper_diary_notebook.sql (添加 notebooks 功能)
    ↓
verify_paper_diary_notebook.sql (验证)
```

## 下一步

迁移完成后，你可以：

1. 在应用中实现日记本管理功能
2. 实现纸张样式和字体自定义
3. 实现书签和搜索功能
4. 实现页面翻转动画和导航

参考 `.kiro/specs/paper-diary-notebook/` 目录中的设计文档和任务列表。

## 支持

如有问题，请参考：
- `sql/README_PAPER_DIARY_NOTEBOOK.md` - 详细的功能说明
- `.kiro/specs/paper-diary-notebook/design.md` - 设计文档
- `.kiro/specs/paper-diary-notebook/requirements.md` - 需求文档
