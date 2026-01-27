# Supabase 数据库迁移指南

## 问题说明

如果你看到以下错误：
```
Could not find the 'images' column of 'diaries' in the schema cache
```

这说明你的 Supabase 数据库表结构还是旧版本，需要更新到 v2.0。

---

## 解决方案

### 方案一：迁移现有表（推荐，保留数据）

如果你已经有日记数据，使用此方案可以保留所有数据。

#### 步骤：

1. **登录 Supabase**
   - 访问 https://supabase.com
   - 进入你的项目

2. **打开 SQL Editor**
   - 左侧菜单点击 "SQL Editor"
   - 点击 "New query"

3. **执行迁移脚本**
   - 复制 `sql/migration_v2.sql` 的全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 执行

4. **验证结果**
   - 应该看到 "Migration completed successfully!"
   - 检查表结构是否包含新字段

5. **刷新应用**
   - 刷新浏览器页面
   - 尝试创建新日记

---

### 方案二：重新创建表（会删除数据）

如果你的数据不重要，可以重新创建表。

⚠️ **警告**：此操作会删除所有现有数据！

#### 步骤：

1. **备份数据（可选）**
   - 在应用中导出为 JSON
   - 保存到本地

2. **删除旧表**
   ```sql
   DROP TABLE IF EXISTS diaries CASCADE;
   ```

3. **创建新表**
   - 复制 `sql/schema.sql` 的全部内容
   - 在 SQL Editor 中执行

4. **导入数据（可选）**
   - 在应用中从 JSON 导入

---

## 迁移脚本详解

### 添加的新字段

```sql
-- 标题
title TEXT DEFAULT ''

-- 心情（5 种选项）
mood TEXT CHECK (mood IN ('happy', 'sad', 'neutral', 'calm', 'angry'))

-- 天气信息（JSON 格式）
weather JSONB
-- 示例：{"temp": 15, "description": "Partly cloudy"}

-- 地理位置
location TEXT DEFAULT ''
-- 示例："上海 · 静安"

-- 图片数组
images TEXT[] DEFAULT '{}'
-- 示例：["data:image/png;base64,...", "data:image/jpeg;base64,..."]

-- 加密标记
is_encrypted BOOLEAN DEFAULT FALSE

-- 更新时间
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### 性能优化索引

```sql
-- 心情索引（用于筛选）
CREATE INDEX idx_diaries_mood ON diaries(mood);

-- 创建时间索引（用于排序）
CREATE INDEX idx_diaries_created_at ON diaries(created_at DESC);

-- 标签索引（用于搜索）
CREATE INDEX idx_diaries_tags ON diaries USING GIN(tags);
```

---

## 验证迁移

### 1. 检查表结构

在 SQL Editor 中执行：

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'diaries'
ORDER BY ordinal_position;
```

应该看到以下字段：
- id
- title
- content
- mood
- weather
- location
- tags
- images
- is_encrypted
- created_at
- updated_at

### 2. 测试插入

```sql
INSERT INTO diaries (
  title,
  content,
  mood,
  weather,
  location,
  tags,
  images
) VALUES (
  '测试日记',
  '这是一条测试内容',
  'happy',
  '{"temp": 20, "description": "Sunny"}'::jsonb,
  '北京 · 朝阳',
  ARRAY['测试', '开心'],
  ARRAY['https://example.com/image.jpg']
);
```

### 3. 测试查询

```sql
SELECT * FROM diaries ORDER BY created_at DESC LIMIT 1;
```

---

## 常见问题

### Q1: 迁移后旧数据的新字段是什么值？

**A**: 所有新字段都有默认值：
- `title`: 空字符串 `''`
- `mood`: `NULL`
- `weather`: `NULL`
- `location`: 空字符串 `''`
- `images`: 空数组 `{}`
- `is_encrypted`: `FALSE`
- `updated_at`: 等于 `created_at`

### Q2: 如何批量更新旧数据？

**A**: 可以手动设置默认值：

```sql
-- 为所有旧日记设置默认标题
UPDATE diaries 
SET title = '未命名日记' 
WHERE title = '';

-- 为所有旧日记设置默认心情
UPDATE diaries 
SET mood = 'neutral' 
WHERE mood IS NULL;
```

### Q3: 迁移失败怎么办？

**A**: 检查错误信息：
1. 如果提示权限不足，确保你是项目所有者
2. 如果提示字段已存在，说明已经迁移过了
3. 如果提示语法错误，检查 SQL 语句是否完整

### Q4: 可以回滚吗？

**A**: 可以删除新字段（但会丢失新数据）：

```sql
ALTER TABLE diaries DROP COLUMN IF EXISTS title;
ALTER TABLE diaries DROP COLUMN IF EXISTS mood;
ALTER TABLE diaries DROP COLUMN IF EXISTS weather;
ALTER TABLE diaries DROP COLUMN IF EXISTS location;
ALTER TABLE diaries DROP COLUMN IF EXISTS images;
ALTER TABLE diaries DROP COLUMN IF EXISTS is_encrypted;
ALTER TABLE diaries DROP COLUMN IF EXISTS updated_at;
```

---

## 本地开发（LocalStorage 模式）

如果你使用 LocalStorage 模式（没有配置 Supabase），不需要执行任何迁移。

应用会自动处理数据结构的升级：
- 旧数据会自动添加默认值
- 新数据会包含所有字段

---

## 生产环境建议

### 1. 备份数据
迁移前务必备份：
```sql
-- 导出为 CSV
COPY diaries TO '/tmp/diaries_backup.csv' CSV HEADER;
```

### 2. 测试环境验证
先在测试项目中执行迁移，确认无误后再在生产环境执行。

### 3. 监控错误
迁移后监控应用日志，确保没有错误。

### 4. 性能优化
如果数据量大（>10000 条），考虑：
- 分批更新
- 在低峰期执行
- 添加更多索引

---

## 快速命令

### 一键迁移（保留数据）
```bash
# 1. 复制迁移脚本
cat sql/migration_v2.sql

# 2. 在 Supabase SQL Editor 中粘贴并执行
```

### 一键重建（删除数据）
```bash
# 1. 复制完整 schema
cat sql/schema.sql

# 2. 在 Supabase SQL Editor 中执行
DROP TABLE IF EXISTS diaries CASCADE;
-- 然后粘贴 schema.sql 的内容
```

---

## 总结

✅ **推荐方案**：使用 `migration_v2.sql` 迁移现有表  
✅ **数据安全**：迁移前先导出备份  
✅ **验证完整**：迁移后测试所有功能  
✅ **性能优化**：已添加必要的索引  

迁移完成后，应用就可以正常使用所有 v2.0 的新功能了！🎉
