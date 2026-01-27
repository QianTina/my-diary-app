# 🔧 快速修复：Supabase 数据库错误

## 常见错误

### 错误 1：字段缺失
```
Could not find the 'images' column of 'diaries' in the schema cache
```

### 错误 2：表不存在或字段缺失
```
ERROR: 42703: column "tags" does not exist
```

## 原因
你的 Supabase 数据库需要创建或更新表结构到 v2.0。

---

## 🚀 解决方案（推荐）

### 全新创建表（最简单）

⚠️ **注意**：会删除现有数据！如果有重要数据，请先在应用中导出备份。

#### 3 步解决：

**步骤 1：登录 Supabase**
- 访问 https://supabase.com
- 进入你的项目
- 点击左侧 "SQL Editor"

**步骤 2：执行以下 SQL**

复制并执行：

```sql
-- 删除旧表
DROP TABLE IF EXISTS diaries CASCADE;

-- 创建新表
CREATE TABLE diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT DEFAULT '',
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('happy', 'sad', 'neutral', 'calm', 'angry')),
  weather JSONB,
  location TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建索引
CREATE INDEX idx_diaries_mood ON diaries(mood);
CREATE INDEX idx_diaries_created_at ON diaries(created_at DESC);
CREATE INDEX idx_diaries_tags ON diaries USING GIN(tags);

-- 启用 RLS
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "允许匿名读写"
ON diaries FOR ALL TO anon
USING (true) WITH CHECK (true);

-- 插入欢迎日记
INSERT INTO diaries (title, content, mood, tags) VALUES 
('欢迎使用智能日记', '这是你的第一条日记！开始记录生活的点点滴滴吧 ✨', 'happy', ARRAY['欢迎', '开始']);

SELECT 'Table created successfully!' AS status;
```

**步骤 3：刷新应用**
- 刷新浏览器页面
- 问题解决！✅

---

## 📋 完整脚本文件

如果你想使用文件：

**文件位置**: `sql/create_table_v2.sql`

在 Supabase SQL Editor 中执行该文件的全部内容。

---

## ✅ 验证成功

执行以下 SQL 检查表结构：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diaries'
ORDER BY ordinal_position;
```

应该看到 12 个字段：
- ✅ id (uuid)
- ✅ title (text)
- ✅ content (text)
- ✅ mood (text)
- ✅ weather (jsonb)
- ✅ location (text)
- ✅ tags (ARRAY)
- ✅ images (ARRAY)
- ✅ is_encrypted (boolean)
- ✅ created_at (timestamp)
- ✅ updated_at (timestamp)

---

## 🔄 如果有备份数据

1. **导出备份**（在执行 SQL 前）
   - 应用中：设置 → 导出为 JSON

2. **执行上面的 SQL**

3. **导入数据**
   - 应用中：设置 → 从 JSON 导入

---

## 💡 本地开发模式

如果你没有配置 Supabase（使用 LocalStorage），不需要任何操作！

应用会自动处理数据结构。

---

## 🆘 还是不行？

### 检查清单：

1. **环境变量正确吗？**
   ```env
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```

2. **重启开发服务器**
   ```bash
   # 停止服务器（Ctrl+C）
   npm run dev
   ```

3. **清除浏览器缓存**
   - 硬刷新：Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)

4. **检查 Supabase 项目状态**
   - 确保项目正常运行
   - 检查 API 密钥是否正确

---

## 📚 相关文档

- `sql/schema.sql` - 完整表结构
- `sql/create_table_v2.sql` - 建表脚本
- `sql/migration_v2.sql` - 迁移脚本（保留数据）
- `docs/supabase-migration.md` - 详细迁移指南

---

**问题解决后，尽情享受智能日记的所有功能吧！** 🎉📝✨
