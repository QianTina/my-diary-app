# 任务管理功能文档 / Task Management Feature Documentation

## 📋 概述 / Overview

任务管理系统是 Tina's Log 的核心功能之一，提供完整的待办事项管理能力，包括任务创建、分类、过滤、统计和与日历/日记的集成。

The Task Management System is one of the core features of Tina's Log, providing complete todo management capabilities including task creation, categorization, filtering, statistics, and integration with calendar/diary.

## ✨ 主要功能 / Key Features

### 1. 任务管理 / Task Management
- ✅ 创建、编辑、删除任务
- ✅ 标记任务完成/未完成
- ✅ 设置优先级（高/中/低）
- ✅ 设置截止日期
- ✅ 添加任务描述
- ✅ 任务分类

### 2. 分类管理 / Category Management
- ✅ 创建自定义分类
- ✅ 9种预设颜色
- ✅ 分类任务计数
- ✅ 编辑和删除分类

### 3. 过滤和搜索 / Filtering & Search
- ✅ 按状态过滤（全部/未完成/已完成）
- ✅ 按优先级过滤
- ✅ 按分类过滤
- ✅ 按截止日期过滤（已过期/今天/本周/本月）
- ✅ 实时搜索（标题和描述）
- ✅ 搜索防抖（300ms）

### 4. 视图模式 / View Modes
- ✅ 列表视图（List View）
- ✅ 看板视图（Kanban View）
  - 按优先级分组
  - 按状态分组
  - 拖拽式任务管理

### 5. 统计面板 / Statistics Dashboard
- ✅ 总览视图（总任务数、完成率、过期任务）
- ✅ 按优先级统计
- ✅ 按分类统计
- ✅ 进度条可视化

### 6. 集成功能 / Integrations
- ✅ 日历集成（任务指示器、快速创建）
- ✅ 日记集成（双向关联）
- ✅ 任务-日记链接

### 7. 性能优化 / Performance
- ✅ Zustand 缓存（5分钟 TTL）
- ✅ React.memo 优化
- ✅ useMemo 和 useCallback
- ✅ 搜索防抖
- ✅ 乐观更新

### 8. 用户体验 / User Experience
- ✅ 响应式设计
- ✅ 深色/浅色主题
- ✅ 双语界面（中英文）
- ✅ 流畅动画（Framer Motion）
- ✅ 键盘快捷键
- ✅ 无障碍支持（ARIA）

## 🏗️ 架构 / Architecture

### 文件结构 / File Structure

```
src/
├── components/task/
│   ├── TaskCard.tsx              # 任务卡片组件
│   ├── TaskForm.tsx              # 任务表单（创建/编辑）
│   ├── TaskFilters.tsx           # 过滤器组件
│   ├── TaskListView.tsx          # 列表视图
│   ├── TaskKanbanView.tsx        # 看板视图
│   ├── KanbanColumn.tsx          # 看板列
│   ├── SortableTaskCard.tsx      # 可拖拽任务卡片
│   ├── TaskStats.tsx             # 统计面板
│   ├── CategoryManager.tsx       # 分类管理
│   └── TaskDetailModal.tsx       # 任务详情模态框
├── pages/
│   └── TaskManagementPage.tsx    # 主任务管理页面
├── services/
│   └── taskService.ts            # 任务服务层
├── store/
│   └── taskStore.ts              # Zustand 状态管理
├── types/
│   └── task.ts                   # TypeScript 类型定义
└── hooks/
    └── useKeyboardShortcuts.ts   # 键盘快捷键 Hook
```

### 数据流 / Data Flow

```
UI Components
    ↓
Zustand Store (taskStore)
    ↓
Task Service (taskService)
    ↓
Supabase Client
    ↓
PostgreSQL Database
```

## 🔧 技术栈 / Tech Stack

- **Frontend**: React 19, TypeScript
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **i18n**: i18next, react-i18next

## 📦 数据库架构 / Database Schema

### Tables

#### tasks
```sql
- id: uuid (PK)
- user_id: uuid (FK)
- title: text
- description: text
- priority: text (high/medium/low)
- status: text (complete/incomplete)
- category_id: uuid (FK)
- due_date: timestamptz
- completed_at: timestamptz
- created_at: timestamptz
- updated_at: timestamptz
```

#### categories
```sql
- id: uuid (PK)
- user_id: uuid (FK)
- name: text
- color: text
- created_at: timestamptz
- updated_at: timestamptz
```

#### task_diary_links
```sql
- id: uuid (PK)
- task_id: uuid (FK)
- diary_entry_id: uuid (FK)
- created_at: timestamptz
```

## 🎯 使用指南 / Usage Guide

### 创建任务 / Create Task

```typescript
import { useTaskStore } from '../store/taskStore';

const { createTask } = useTaskStore();

await createTask({
  title: '完成项目文档',
  description: '编写技术文档和用户指南',
  priority: 'high',
  category_id: 'category-uuid',
  due_date: '2026-02-01T00:00:00Z',
});
```

### 过滤任务 / Filter Tasks

```typescript
const { setFilters } = useTaskStore();

setFilters({
  status: 'incomplete',
  priority: 'high',
  category_id: 'category-uuid',
  due_date: 'today',
  search: '文档',
});
```

### 获取统计 / Get Statistics

```typescript
const { getStatistics } = useTaskStore();

const stats = getStatistics();
// {
//   total: 10,
//   completed: 5,
//   incomplete: 5,
//   overdue: 2,
//   completion_rate: 50,
//   by_priority: { high: 3, medium: 4, low: 3 },
//   by_category: { 'uuid-1': 5, 'uuid-2': 5 }
// }
```

## ⌨️ 键盘快捷键 / Keyboard Shortcuts

| 快捷键 | 功能 | Shortcut | Function |
|--------|------|----------|----------|
| `n` | 新建任务 | `n` | New Task |
| `/` | 聚焦搜索 | `/` | Focus Search |
| `v` | 切换视图 | `v` | Toggle View |
| `s` | 切换统计 | `s` | Toggle Stats |
| `Esc` | 关闭模态框 | `Esc` | Close Modal |

## 🎨 主题支持 / Theme Support

任务管理系统完全支持深色和浅色主题，所有组件都会根据当前主题自动调整颜色。

The task management system fully supports dark and light themes, with all components automatically adjusting colors based on the current theme.

## 🌐 国际化 / Internationalization

系统支持中英文双语，使用 i18next 进行翻译管理。

The system supports Chinese and English bilingual interface using i18next for translation management.

**注意**: 当前版本的语言切换功能存在已知问题，正在修复中。

**Note**: There is a known issue with language switching in the current version, which is being fixed.

## 🔒 安全性 / Security

- ✅ Row Level Security (RLS) 策略
- ✅ 用户数据隔离
- ✅ 输入验证
- ✅ SQL 注入防护（Supabase）

## 📊 性能指标 / Performance Metrics

- ✅ 初始加载时间: < 2秒
- ✅ 操作响应时间: < 100ms
- ✅ 搜索防抖: 300ms
- ✅ 缓存有效期: 5分钟

## 🐛 已知问题 / Known Issues

1. **i18n 语言切换不工作** - 正在修复中
2. **看板视图在移动端的拖拽体验** - 待优化

详见 `KNOWN_ISSUES.md`

## 🚀 未来计划 / Future Plans

- [ ] 任务标签系统
- [ ] 任务附件上传
- [ ] 任务评论功能
- [ ] 批量操作
- [ ] 导出功能
- [ ] 任务归档
- [ ] 任务提醒通知
- [ ] 任务模板

## 📝 开发者注意事项 / Developer Notes

### 添加新的任务字段

1. 更新数据库 schema (`sql/add_task_management.sql`)
2. 更新 TypeScript 类型 (`src/types/task.ts`)
3. 更新 TaskService (`src/services/taskService.ts`)
4. 更新 TaskForm 组件 (`src/components/task/TaskForm.tsx`)
5. 更新 TaskCard 组件 (`src/components/task/TaskCard.tsx`)

### 添加新的过滤器

1. 更新 TaskFilters 类型 (`src/types/task.ts`)
2. 更新 TaskFilters 组件 (`src/components/task/TaskFilters.tsx`)
3. 更新 TaskService.getTasks 方法 (`src/services/taskService.ts`)
4. 更新 taskStore.getFilteredTasks 方法 (`src/store/taskStore.ts`)

## 📚 相关文档 / Related Documentation

- [任务管理迁移指南](./task-management-migration.md)
- [任务管理完成总结](./task-management-complete.md)
- [已知问题](../KNOWN_ISSUES.md)

## 👥 贡献者 / Contributors

- Kiro AI Assistant

## 📄 许可证 / License

MIT

---

**最后更新 / Last Updated**: 2026-01-29
**版本 / Version**: 1.0.0
