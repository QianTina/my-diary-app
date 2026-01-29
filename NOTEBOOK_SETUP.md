# 纸质风格日记本功能设置指南

## 问题说明

如果你看到以下错误：
```
Could not find the table 'public.diary_entries' in the schema cache
```

这是因为：
1. 代码已经从 `diary_entries` 更新为 `diaries` 表名
2. 需要在 Supabase 中运行数据库迁移脚本

## 设置步骤

### 1. 运行数据库迁移

在 Supabase Dashboard 中执行以下步骤：

1. 打开你的 Supabase 项目
2. 进入 **SQL Editor**
3. 创建新查询
4. 复制并粘贴 `sql/add_paper_diary_notebook.sql` 文件的内容
5. 点击 **Run** 执行脚本

### 2. 验证迁移

运行以下 SQL 查询来验证迁移是否成功：

```sql
-- 检查 notebooks 表是否创建
SELECT table_name FROM information_schema.tables WHERE table_name = 'notebooks';

-- 检查 diaries 表的新列是否存在
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diaries' 
  AND column_name IN ('notebook_id', 'paper_style', 'bookmarked');
```

### 3. 迁移现有数据（如果有）

如果你已经有一些日记条目，需要将它们迁移到默认日记本：

```sql
-- 替换 'YOUR_USER_ID' 为你的实际用户 ID
SELECT * FROM migrate_user_to_notebooks('YOUR_USER_ID');
```

你可以在 Supabase Dashboard 的 **Authentication > Users** 中找到你的用户 ID。

## 迁移脚本功能

`sql/add_paper_diary_notebook.sql` 脚本会：

1. ✅ 创建 `notebooks` 表
2. ✅ 向 `diaries` 表添加以下列：
   - `notebook_id` - 关联到日记本
   - `paper_style` - 纸张样式覆盖（可选）
   - `bookmarked` - 书签标记
3. ✅ 创建必要的索引（提高查询性能）
4. ✅ 创建全文搜索索引
5. ✅ 设置行级安全策略（RLS）
6. ✅ 创建迁移辅助函数

## 功能特性

迁移完成后，你将可以使用：

- 📚 **多日记本管理** - 创建、编辑、删除、归档日记本
- 📄 **纸张样式** - 5种纸张样式（空白、横线、方格、点阵、复古）
- 🎨 **字体自定义** - 字体系列、大小、行高
- 🔖 **书签功能** - 标记重要的日记条目
- 🔍 **全文搜索** - 在日记本中搜索内容
- 📖 **阅读器视图** - 单页/双页展开视图
- 🎵 **环境音效** - 背景音乐和环境声音
- 🎯 **导航控制** - 翻页、目录、书签面板

## 访问功能

迁移完成后，通过以下方式访问：

1. 侧边栏点击 **"日记本"**
2. 或直接访问 `/notebooks`
3. 点击日记本进入阅读器页面 `/notebooks/:id`

## 故障排除

### 问题：迁移脚本执行失败

**解决方案**：
- 确保你有足够的权限
- 检查是否已经运行过 `add_user_authentication.sql`
- 查看错误消息，可能需要先删除冲突的对象

### 问题：看不到日记本列表

**解决方案**：
- 确保已登录
- 检查浏览器控制台是否有错误
- 运行迁移函数创建默认日记本

### 问题：现有日记条目不显示

**解决方案**：
- 运行迁移函数将现有条目分配到默认日记本
- 检查 `diaries` 表中的 `notebook_id` 列是否有值

## 需要帮助？

如果遇到问题：
1. 检查浏览器控制台的错误消息
2. 检查 Supabase Dashboard 的日志
3. 确认所有迁移步骤都已完成
