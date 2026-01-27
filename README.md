# 智能日记 (Smart Diary)

一个功能丰富的智能日记应用，支持多模态记录、环境感知、数据可视化和暗黑模式。

## ✨ 功能特性

### 核心功能 (v2.0)
- 📝 **多页面架构**：首页、写作页、详情页、设置页
- 🎨 **多模态记录**：标题、内容、心情、图片、标签
- 🌤️ **环境感知**：自动获取天气和地理位置
- 🌙 **暗黑模式**：全局主题切换，护眼舒适
- 🎬 **流畅动画**：页面过渡、列表淡入、微交互
- 📱 **响应式设计**：完美适配桌面和移动端

### 基础功能 (v1.0)
- ✅ 日记 CRUD 操作
- ✅ 实时搜索和标签筛选
- ✅ Markdown 支持和预览
- ✅ 草稿自动保存
- ✅ 数据导出/导入（JSON、Markdown）
- ✅ LocalStorage + Supabase 双模式存储

## 🎯 页面导航

```
/                首页 - 日记列表和搜索
/write           写作页 - 创作和编辑
/diary/:id       详情页 - 完整阅读
/settings        设置页 - 主题和数据管理
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 本地开发
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📦 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite (rolldown-vite)
- **路由**: React Router v6
- **状态管理**: Zustand
- **样式**: Tailwind CSS 4
- **动画**: Framer Motion
- **Markdown**: react-markdown
- **数据库**: Supabase (可选)

## 🗄️ 数据存储

### LocalStorage 模式（默认）
无需配置，数据保存在浏览器本地。

### Supabase 模式（可选）
1. 创建 `.env` 文件：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

2. 在 Supabase 中执行 `sql/schema.sql` 创建表结构

## 📖 使用指南

### 标签使用
- 在编辑器下方的标签输入框中输入标签名
- 按 `Enter` 键添加标签
- 点击标签上的 `×` 删除标签
- 在标签云中点击标签进行筛选

### Markdown 语法
支持以下 Markdown 语法：
- 标题：`# H1`, `## H2`, `### H3`
- 粗体：`**粗体**`
- 斜体：`*斜体*`
- 列表：`- 项目` 或 `1. 项目`
- 链接：`[文字](URL)`
- 代码：`` `代码` ``
- 引用：`> 引用内容`

### 数据备份
1. 点击右上角"设置"按钮
2. 选择导出格式（JSON 或 Markdown）
3. 文件会自动下载到本地

### 数据恢复
1. 点击"设置" → "从 JSON 导入"
2. 选择之前导出的 JSON 文件
3. 确认导入即可

## 📚 文档

完整的项目文档请查看 [docs/](./docs/) 目录：

- **[项目完成总结](./docs/completed-summary.md)** - 项目全貌 ⭐
- **[快速开始](./docs/quickstart.md)** - 快速上手指南
- **[安全指南](./docs/security/security-summary.md)** - 环境变量保护
- **[主题实现](./docs/theme/theme-final-fix.md)** - 主题切换方案
- **[部署指南](./docs/deployment.md)** - 生产环境部署
- **[更多文档](./docs/readme.md)** - 完整文档目录

## 🔮 未来计划

- 📅 日历视图
- 🎨 更多主题选项
- 📊 数据统计和可视化
- 🤖 AI 智能助手
- 🔐 用户认证系统
- 📱 PWA 支持

## 🔒 安全

本项目已配置环境变量保护，`.env` 文件不会被提交到 Git。

如需配置 Supabase：
1. 复制 `.env.example` 为 `.env`
2. 填入你的 Supabase 配置
3. 查看 [安全指南](./docs/security/security-summary.md) 了解更多

## 📄 许可证

MIT
