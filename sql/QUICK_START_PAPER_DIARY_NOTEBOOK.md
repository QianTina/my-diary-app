# 纸质风格日记本功能 - 快速开始指南

## 🚀 快速执行（5分钟）

### 前提条件

- ✅ Supabase 项目已创建
- ✅ diaries 表已存在
- ✅ 用户认证系统已配置（user_id 列已添加）

### 执行步骤

#### 1. 执行迁移脚本

在 Supabase SQL Editor 中执行：

```sql
-- 复制并执行 sql/add_paper_diary_notebook.sql 的全部内容
```

#### 2. 验证迁移

```sql
-- 快速验证：检查 notebooks 表是否创建
SELECT COUNT(*) FROM notebooks;

-- 完整验证：执行 sql/verify_paper_diary_notebook.sql
```

#### 3. 迁移现有数据（如果有）

```sql
-- 为所有用户批量迁移
DO $
DECLARE
  user_record RECORD;
  migration_result RECORD;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM diaries 
    WHERE notebook_id IS NULL AND user_id IS NOT NULL
  LOOP
    SELECT * INTO migration_result 
    FROM migrate_user_to_notebooks(user_record.user_id);
    
    RAISE NOTICE 'Migrated user %: notebook %, entries %',
      user_record.user_id,
      migration_result.default_notebook_id,
      migration_result.migrated_entries_count;
  END LOOP;
END $;
```

## 📊 数据库架构概览

### notebooks 表

```sql
CREATE TABLE notebooks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,           -- 所属用户
  name TEXT NOT NULL,               -- 日记本名称
  cover_color TEXT,                 -- 封面颜色
  cover_image TEXT,                 -- 封面图片
  description TEXT,                 -- 描述
  paper_style TEXT DEFAULT 'blank', -- 纸张样式
  font_family TEXT DEFAULT 'system',-- 字体
  font_size INTEGER DEFAULT 16,     -- 字体大小
  line_height DECIMAL(3,1) DEFAULT 1.5, -- 行高
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT FALSE    -- 是否归档
);
```

### diaries 表新增字段

```sql
ALTER TABLE diaries ADD COLUMN:
  - notebook_id UUID              -- 所属日记本
  - paper_style TEXT              -- 纸张样式覆盖
  - bookmarked BOOLEAN            -- 是否书签
```

## 🔍 常用查询

### 创建日记本

```sql
INSERT INTO notebooks (user_id, name, description, paper_style)
VALUES (
  auth.uid(),
  'My Travel Diary',
  'Recording my adventures',
  'vintage'
)
RETURNING *;
```

### 查询用户的所有日记本

```sql
SELECT * FROM notebooks
WHERE user_id = auth.uid()
  AND archived = FALSE
ORDER BY created_at DESC;
```

### 查询日记本中的条目

```sql
SELECT * FROM diaries
WHERE notebook_id = 'YOUR_NOTEBOOK_ID'
ORDER BY created_at DESC;
```

### 搜索日记内容

```sql
SELECT * FROM diaries
WHERE notebook_id = 'YOUR_NOTEBOOK_ID'
  AND to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', 'search term')
ORDER BY created_at DESC;
```

### 添加书签

```sql
UPDATE diaries
SET bookmarked = TRUE
WHERE id = 'YOUR_DIARY_ID';
```

### 查询书签条目

```sql
SELECT * FROM diaries
WHERE notebook_id = 'YOUR_NOTEBOOK_ID'
  AND bookmarked = TRUE
ORDER BY created_at DESC;
```

## 🛠️ 迁移辅助函数

### 检查迁移状态

```sql
SELECT * FROM check_migration_status('USER_ID');
-- 返回: needs_migration, unmigrated_entries_count
```

### 执行迁移

```sql
SELECT * FROM migrate_user_to_notebooks('USER_ID');
-- 返回: default_notebook_id, migrated_entries_count
```

## 📝 纸张样式选项

- `blank` - 空白纸张
- `lined` - 横线纸张
- `grid` - 方格纸张
- `dotted` - 点阵纸张
- `vintage` - 复古纸张

## 🎨 字体设置范围

- **font_size**: 12-24 (px)
- **line_height**: 1.2-2.0

## 🔒 安全策略（RLS）

所有表都启用了行级安全策略：

- ✅ 用户只能访问自己的日记本
- ✅ 用户只能访问自己的日记条目
- ✅ 级联删除：删除日记本会删除所有关联条目

## ⚡ 性能优化

已创建的索引：

- `idx_notebooks_user_id` - 用户查询
- `idx_notebooks_archived` - 归档状态查询
- `idx_diaries_notebook_id` - 日记本条目查询
- `idx_diaries_bookmarked` - 书签查询
- `idx_diaries_search` - 全文搜索（GIN 索引）

## 🐛 故障排除

### 错误：relation "notebooks" does not exist

**原因：** 迁移脚本未执行

**解决：** 执行 `sql/add_paper_diary_notebook.sql`

### 错误：column "user_id" does not exist

**原因：** 用户认证迁移未执行

**解决：** 先执行 `sql/add_user_authentication.sql`

### 错误：foreign key constraint violation

**原因：** 尝试引用不存在的 notebook_id

**解决：** 确保日记本存在，或先创建日记本

### 迁移函数返回 0 条迁移

**原因：** 所有条目已有 notebook_id

**解决：** 这是正常的，表示不需要迁移

## 📚 相关文档

- `README_PAPER_DIARY_NOTEBOOK.md` - 详细功能说明
- `MIGRATION_ORDER.md` - 完整迁移顺序
- `verify_paper_diary_notebook.sql` - 验证脚本
- `.kiro/specs/paper-diary-notebook/design.md` - 设计文档

## ✅ 验证清单

- [ ] notebooks 表已创建
- [ ] diaries 表新增 3 个字段（notebook_id, paper_style, bookmarked）
- [ ] 所有索引已创建（6个）
- [ ] 触发器已创建（2个）
- [ ] RLS 策略已创建（4个）
- [ ] 迁移函数已创建（2个）
- [ ] 现有数据已迁移（如适用）

## 🎉 完成！

迁移完成后，你可以开始实现前端功能：

1. 日记本管理 UI
2. 纸张样式选择器
3. 字体自定义
4. 书签功能
5. 搜索功能
6. 页面翻转动画

参考任务列表：`.kiro/specs/paper-diary-notebook/tasks.md`
