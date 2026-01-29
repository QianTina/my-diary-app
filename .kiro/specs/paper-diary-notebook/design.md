# 设计文档：纸质风格日记本

## 概述

纸质风格日记本功能创建了一个沉浸式的拟物化日记体验，模仿实体纸质笔记本。系统基于 React 19 和 TypeScript 构建，使用 Framer Motion 实现流畅动画，使用 Supabase 进行数据持久化。架构将关注点分离为不同的层：数据管理（Zustand store）、UI 组件（React）、动画逻辑（Framer Motion）和后端服务（Supabase）。

设计通过懒加载和分页优先考虑性能，通过键盘导航和屏幕阅读器支持优先考虑无障碍性，通过真实动画和自定义选项优先考虑用户体验。系统支持每个用户拥有多个日记本，每个日记本都有独立的样式偏好，并为现有日记条目提供无缝迁移。

## 架构

### 系统层次

```
┌─────────────────────────────────────────────────────────────┐
│                     表现层                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   日记本     │  │     页面     │  │    导航      │      │
│  │    组件      │  │     组件     │  │    组件      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    动画层                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   翻页       │  │   页面卷曲   │  │   过渡       │      │
│  │   引擎       │  │    效果      │  │   管理器     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     状态管理                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   日记本     │  │    条目      │  │      UI      │      │
│  │   Store      │  │    Store     │  │    Store     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据层                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │    缓存      │  │    迁移      │      │
│  │    客户端    │  │   管理器     │  │    服务      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 组件层次结构

```
App
├── NotebookListView（日记本列表视图）
│   ├── NotebookCard（日记本卡片，多个）
│   ├── CreateNotebookButton（创建日记本按钮）
│   └── SearchBar（搜索栏）
│
└── NotebookReaderView（日记本阅读视图）
    ├── BookCover（书籍封面）
    ├── BookSpine（书脊）
    ├── PageSpread（桌面双页）/ SinglePage（移动单页）
    │   ├── LeftPage（左页）
    │   │   ├── PaperBackground（纸张背景）
    │   │   ├── EntryContent（条目内容）
    │   │   └── PageNumber（页码）
    │   └── RightPage（右页）
    │       ├── PaperBackground（纸张背景）
    │       ├── EntryContent（条目内容）
    │       └── PageNumber（页码）
    ├── NavigationControls（导航控件）
    │   ├── PreviousButton（上一页按钮）
    │   ├── NextButton（下一页按钮）
    │   └── PageIndicator（页面指示器）
    ├── TableOfContents（目录）
    ├── BookmarkPanel（书签面板）
    └── SettingsPanel（设置面板）
```

## 组件和接口

### 核心数据类型

```typescript
// 日记本实体
interface Notebook {
  id: string;
  user_id: string;
  name: string;
  cover_color?: string;
  cover_image?: string;
  description?: string;
  paper_style: PaperStyle;
  font_family: string;
  font_size: number;
  line_height: number;
  created_at: Date;
  updated_at: Date;
  archived: boolean;
}

// 纸张样式枚举
type PaperStyle = 'blank' | 'lined' | 'grid' | 'dotted' | 'vintage';

// 增强的日记条目，包含日记本关联
interface DiaryEntry {
  id: string;
  user_id: string;
  notebook_id: string;
  title: string;
  content: string;
  date: Date;
  paper_style?: PaperStyle; // 覆盖日记本默认设置
  bookmarked: boolean;
  created_at: Date;
  updated_at: Date;
}

// 用于渲染的页面表示
interface Page {
  entries: DiaryEntry[];
  pageNumber: number;
  side: 'left' | 'right';
}

// 分页状态
interface PaginationState {
  currentPage: number;
  totalPages: number;
  visiblePages: Page[];
  loadedPageRange: [number, number];
}
```

### Zustand Store 接口

```typescript
// 日记本 store
interface NotebookStore {
  notebooks: Notebook[];
  activeNotebook: Notebook | null;
  loading: boolean;
  error: string | null;
  
  // 操作
  fetchNotebooks: () => Promise<void>;
  createNotebook: (notebook: Omit<Notebook, 'id' | 'created_at' | 'updated_at'>) => Promise<Notebook>;
  updateNotebook: (id: string, updates: Partial<Notebook>) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  archiveNotebook: (id: string) => Promise<void>;
  setActiveNotebook: (notebook: Notebook) => void;
}

// 条目 store
interface EntryStore {
  entries: DiaryEntry[];
  loading: boolean;
  error: string | null;
  
  // 操作
  fetchEntriesForNotebook: (notebookId: string) => Promise<void>;
  createEntry: (entry: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<DiaryEntry>;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleBookmark: (id: string) => Promise<void>;
  searchEntries: (query: string, notebookId?: string) => Promise<DiaryEntry[]>;
}

// UI store 用于页面导航和偏好设置
interface UIStore {
  viewMode: 'list' | 'grid' | 'reader';
  paginationState: PaginationState;
  showTableOfContents: boolean;
  showBookmarks: boolean;
  ambientSoundEnabled: boolean;
  ambientSoundVolume: number;
  reduceMotion: boolean;
  highContrast: boolean;
  
  // 操作
  setViewMode: (mode: 'list' | 'grid' | 'reader') => void;
  navigateToPage: (pageNumber: number) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  jumpToDate: (date: Date) => void;
  toggleTableOfContents: () => void;
  toggleBookmarks: () => void;
  setAmbientSound: (enabled: boolean, volume?: number) => void;
  setAccessibilityPreference: (key: string, value: boolean) => void;
}
```

### 动画接口

```typescript
// 翻页动画配置
interface PageFlipConfig {
  duration: number; // 毫秒
  easing: string; // CSS 缓动函数
  direction: 'forward' | 'backward';
  reduceMotion: boolean;
}

// 页面卷曲效果配置
interface PageCurlConfig {
  intensity: number; // 0-1
  position: { x: number; y: number };
  enabled: boolean;
}

// 动画控制器
interface AnimationController {
  flipPage: (config: PageFlipConfig) => Promise<void>;
  applyCurlEffect: (config: PageCurlConfig) => void;
  removeCurlEffect: () => void;
  transitionFade: (duration: number) => Promise<void>;
}
```

### 服务接口

```typescript
// 日记本的 Supabase 服务
interface NotebookService {
  getNotebooks: (userId: string) => Promise<Notebook[]>;
  getNotebook: (id: string) => Promise<Notebook>;
  createNotebook: (notebook: Omit<Notebook, 'id' | 'created_at' | 'updated_at'>) => Promise<Notebook>;
  updateNotebook: (id: string, updates: Partial<Notebook>) => Promise<Notebook>;
  deleteNotebook: (id: string) => Promise<void>;
  archiveNotebook: (id: string) => Promise<void>;
}

// 条目的 Supabase 服务
interface EntryService {
  getEntriesForNotebook: (notebookId: string) => Promise<DiaryEntry[]>;
  getEntry: (id: string) => Promise<DiaryEntry>;
  createEntry: (entry: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<DiaryEntry>;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<DiaryEntry>;
  deleteEntry: (id: string) => Promise<void>;
  searchEntries: (userId: string, query: string, notebookId?: string) => Promise<DiaryEntry[]>;
}

// 现有条目的迁移服务
interface MigrationService {
  createDefaultNotebook: (userId: string) => Promise<Notebook>;
  migrateExistingEntries: (userId: string, defaultNotebookId: string) => Promise<number>;
  checkMigrationStatus: (userId: string) => Promise<boolean>;
}

// 分页服务
interface PaginationService {
  calculatePages: (entries: DiaryEntry[], viewportHeight: number, fontSize: number) => Page[];
  getVisiblePages: (allPages: Page[], currentPage: number) => Page[];
  preloadAdjacentPages: (currentPage: number, totalPages: number) => number[];
}
```

## Data Models

### Database Schema

```sql
-- Notebooks table
CREATE TABLE notebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cover_color TEXT,
  cover_image TEXT,
  description TEXT,
  paper_style TEXT NOT NULL DEFAULT 'blank' CHECK (paper_style IN ('blank', 'lined', 'grid', 'dotted', 'vintage')),
  font_family TEXT NOT NULL DEFAULT 'system',
  font_size INTEGER NOT NULL DEFAULT 16 CHECK (font_size BETWEEN 12 AND 24),
  line_height DECIMAL(3,1) NOT NULL DEFAULT 1.5 CHECK (line_height BETWEEN 1.2 AND 2.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add index for user queries
CREATE INDEX idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX idx_notebooks_archived ON notebooks(user_id, archived);

-- Update diary_entries table to add notebook association
ALTER TABLE diary_entries
ADD COLUMN notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
ADD COLUMN paper_style TEXT CHECK (paper_style IN ('blank', 'lined', 'grid', 'dotted', 'vintage')),
ADD COLUMN bookmarked BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for notebook queries
CREATE INDEX idx_diary_entries_notebook_id ON diary_entries(notebook_id);
CREATE INDEX idx_diary_entries_bookmarked ON diary_entries(notebook_id, bookmarked);

-- Add full-text search index for entries
CREATE INDEX idx_diary_entries_search ON diary_entries USING GIN (to_tsvector('english', title || ' ' || content));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notebooks_updated_at
  BEFORE UPDATE ON notebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Data Flow

**Notebook Creation Flow:**
1. User submits notebook creation form
2. UI validates input (name required)
3. Store calls NotebookService.createNotebook()
4. Service inserts record into Supabase
5. Service returns created notebook with generated ID
6. Store updates local state with new notebook
7. UI navigates to new notebook reader view

**Entry Display Flow:**
1. User selects notebook from list
2. Store calls EntryService.getEntriesForNotebook()
3. Service fetches entries from Supabase
4. PaginationService calculates page layout based on viewport and content
5. Store updates paginationState with calculated pages
6. UI renders visible pages (current + adjacent)
7. AnimationController applies page flip when user navigates

**Search Flow:**
1. User enters search query
2. Store calls EntryService.searchEntries() with query and optional notebookId
3. Service executes full-text search using PostgreSQL GIN index
4. Service returns matching entries with relevance ranking
5. UI displays search results with snippets
6. User clicks result → Store navigates to entry's page in its notebook

**Migration Flow:**
1. User logs in after system upgrade
2. MigrationService.checkMigrationStatus() checks for unmigrated entries
3. If unmigrated entries exist:
   - MigrationService.createDefaultNotebook() creates "My Diary" notebook
   - MigrationService.migrateExistingEntries() updates all entries with NULL notebook_id
   - Service returns count of migrated entries
4. UI displays migration success message

### State Management Strategy

**Zustand Store Organization:**
- Separate stores for notebooks, entries, and UI state
- Stores are independent but can subscribe to each other
- Async actions use async/await pattern
- Optimistic updates for better UX (update local state immediately, rollback on error)

**Cache Strategy:**
- Notebook settings cached in memory after first load
- Entry content cached for current notebook only
- Adjacent pages preloaded and cached
- Cache invalidated on CRUD operations
- LocalStorage used for user preferences (ambient sound, accessibility)

**Performance Optimizations:**
- Lazy load entries (fetch only when notebook opened)
- Paginate entries (render only visible pages)
- Debounce search queries (300ms delay)
- Memoize expensive calculations (page layout)
- Use React.memo for page components
- Virtual scrolling for table of contents


## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1：日记本创建验证

*对于任何*日记本创建尝试，系统应要求名称字段并接受可选的 cover_color、cover_image 和 description 字段，拒绝没有名称的创建尝试。

**验证：需求 1.2**

### 属性 2：默认设置分配

*对于任何*新创建的日记本，系统应自动为 paper_style、font_family、font_size 和 line_height 分配默认值。

**验证：需求 1.3**

### 属性 3：日记本字段可变性

*对于任何*现有日记本和对名称、cover_color、cover_image、description、paper_style 或字体设置的任何有效更新，更新操作应成功并持久化更改。

**验证：需求 1.4**

### 属性 4：级联删除

*对于任何*具有关联日记条目的日记本，删除日记本应从数据库中删除日记本及其所有关联条目。

**验证：需求 1.6, 2.4**

### 属性 5：归档保留

*对于任何*日记本，归档它应将 archived 标志设置为 true，将其从主日记本列表查询中排除，但在数据库中保留所有日记本数据和关联条目。

**验证：需求 1.7**

### 属性 6：条目-日记本关联

*对于任何*日记条目创建操作，创建的条目应将其 notebook_id 设置为当前活动日记本的 id。

**验证：需求 2.1**

### 属性 7：迁移分配

*对于任何*具有 NULL notebook_id 的日记条目，运行迁移过程应将其分配给默认日记本的 id。

**验证：需求 2.2, 12.2**

### 属性 8：日记本过滤

*对于任何*日记本选择，查询条目应仅返回 notebook_id 与所选日记本 id 匹配的条目。

**验证：需求 2.3**

### 属性 9：引用完整性

*对于任何*尝试使用 notebooks 表中不存在的 notebook_id 创建日记条目的操作，数据库应以外键约束违规拒绝该操作。

**验证：需求 2.5**

### 属性 10：纸张样式继承

*对于任何*具有默认 paper_style 的日记本和在该日记本中创建的任何没有显式 paper_style 覆盖的新条目，条目在渲染时应继承日记本的默认 paper_style。

**验证：需求 3.2**

### 属性 11：纸张样式覆盖

*对于任何*具有显式 paper_style 值的日记条目，无论日记本的默认 paper_style 如何，条目都应使用该样式渲染。

**验证：需求 3.3**

### 属性 12：设置持久化往返

*对于任何*具有特定 paper_style、font_family、font_size 和 line_height 值的日记本，保存日记本然后检索它应返回具有相同设置值的日记本。

**验证：需求 3.5, 4.5**

### 属性 13：字体设置继承

*对于任何*具有默认字体设置（font_family、font_size、line_height）的日记本及其中的任何条目，渲染这些条目应应用日记本的字体设置。

**验证：需求 4.2**

### 属性 14：分页一致性

*对于任何*日记条目集和视口尺寸，给定相同的输入，分页算法应产生相同的页面布局，并且所有页面上的条目总数应等于输入条目数。

**验证：需求 5.5**

### 属性 15：书签持久化

*对于任何*日记条目，将其 bookmarked 状态切换为 true 应将其添加到书签列表，并且此状态应跨会话持久化（保存和重新加载）。

**验证：需求 7.1, 7.5**

### 属性 16：日期导航

*对于任何*具有关联日记条目的日期，请求跳转到该日期应导航到包含该条目的页码。

**验证：需求 7.2**

### 属性 17：目录完整性

*对于任何*日记本，目录应恰好包含该日记本中每个日记条目的一项，每项显示条目的日期和标题。

**验证：需求 7.3**

### 属性 18：搜索范围覆盖

*对于任何*搜索查询，搜索应在条目标题和内容字段中查找匹配项。

**验证：需求 8.1**

### 属性 19：上下文搜索范围

*对于任何*搜索查询，从日记本列表视图执行时，结果应包括所有日记本的条目；从特定日记本内执行时，结果应仅包括该日记本的条目。

**验证：需求 8.2, 8.3**

### 属性 20：搜索结果完整性

*对于任何*搜索结果条目，结果对象应包含条目的日期、标题和包含匹配文本的内容片段。

**验证：需求 8.4**

### 属性 21：页面加载策略

*对于任何*分页视图中的当前页码 N，系统应加载页面 N-1、N 和 N+1（如果存在），并且不应加载任何其他页面。

**验证：需求 9.1, 9.2**

### 属性 22：日记本设置缓存

*对于任何*已打开的日记本，在同一会话中对该日记本设置的后续访问应从缓存中检索值，而无需进行额外的数据库查询。

**验证：需求 9.4**

### 属性 23：无障碍属性存在

*对于任何*日记本界面中的交互元素，该元素应具有适当的 ARIA 标签、角色或描述以实现屏幕阅读器兼容性。

**验证：需求 10.1**

### 属性 24：键盘导航完整性

*对于任何*通过鼠标/触摸可用的导航操作（下一页、上一页、打开目录、关闭目录、书签），相同的操作应可通过键盘快捷键触发。

**验证：需求 10.5**

### 属性 25：环境音效偏好持久化

*对于任何*用户的环境音效设置（启用状态和音量），保存偏好然后重新加载应用程序应恢复相同的设置值。

**验证：需求 11.4**

### 属性 26：迁移数据保留

*对于任何*迁移前的日记条目集，迁移完成后，所有条目应仍然存在，具有相同的内容、日期和元数据（仅 notebook_id 应更改）。

**验证：需求 12.4, 12.5**

### 属性 27：迁移条目默认值

*对于任何*已迁移的日记条目（之前具有 NULL notebook_id），条目应使用默认日记本的 paper_style 和字体设置渲染。

**验证：需求 12.3**

## 错误处理

### 验证错误

**日记本创建：**
- 缺少名称 → 返回错误："日记本名称是必需的"
- 无效的 paper_style → 返回错误："无效的纸张样式。必须是以下之一：blank、lined、grid、dotted、vintage"
- 字体大小超出范围 → 返回错误："字体大小必须在 12 到 24 之间"
- 行高超出范围 → 返回错误："行高必须在 1.2 到 2.0 之间"

**条目创建：**
- 无效的 notebook_id → 返回错误："未找到日记本"
- 缺少必填字段 → 返回错误："标题和内容是必需的"

### 数据库错误

**连接失败：**
- 网络超时 → 使用指数退避重试最多 3 次
- 连接被拒绝 → 显示错误："无法连接到数据库。请检查您的连接。"

**约束违规：**
- 外键违规 → 返回错误："无效的日记本引用"
- 唯一约束违规 → 返回错误："已存在具有此名称的日记本"

### 迁移错误

**迁移失败：**
- 默认日记本创建失败 → 中止迁移，记录错误，通知用户
- 部分迁移（某些条目已更新，某些失败）→ 回滚事务，重试
- 迁移已完成 → 跳过迁移，返回成功

### 动画错误

**性能下降：**
- 帧率降至 30fps 以下 → 自动切换到减少动画模式
- 动画库加载失败 → 回退到 CSS 过渡

### 搜索错误

**查询错误：**
- 空查询 → 返回空结果（无错误）
- 查询过长（>500 字符）→ 截断查询，继续搜索
- 搜索服务不可用 → 显示错误："搜索暂时不可用"

## 测试策略

### 双重测试方法

此功能需要单元测试和基于属性的测试以实现全面覆盖：

**单元测试**专注于：
- 日记本创建、编辑、删除的具体示例
- 边缘情况（字体大小、行高的边界值）
- 错误条件（无效输入、约束违规）
- 集成点（Supabase 客户端、Zustand stores）
- UI 组件渲染（快照测试）

**基于属性的测试**专注于：
- 对所有输入都成立的通用属性
- 跨操作的数据完整性（CRUD 操作）
- 分页和搜索算法的一致性
- 设置继承和覆盖行为
- 跨各种数据状态的迁移正确性

这些方法共同提供全面覆盖：单元测试捕获特定场景中的具体错误，而属性测试验证输入空间中的一般正确性。

### 基于属性的测试配置

**库选择：**
- 使用 **fast-check** 进行 TypeScript/JavaScript 基于属性的测试
- Fast-check 为原始类型、对象和自定义域提供生成器
- 与 Jest/Vitest 测试运行器无缝集成

**测试配置：**
- 每个属性测试必须运行最少 **100 次迭代**以确保充分随机化
- 使用基于种子的随机化以实现可重现的失败
- 将每个属性测试的超时配置为 10 秒

**测试标记：**
每个基于属性的测试必须包含引用设计文档属性的注释标记：

```typescript
// Feature: paper-diary-notebook, Property 1: Notebook Creation Validation
test('notebook creation requires name field', () => {
  fc.assert(
    fc.property(
      fc.record({
        name: fc.option(fc.string(), { nil: undefined }),
        cover_color: fc.option(fc.string()),
        description: fc.option(fc.string())
      }),
      (notebookData) => {
        const result = createNotebook(notebookData);
        if (notebookData.name === undefined) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.success).toBe(true);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### 测试组织

```
tests/
├── unit/
│   ├── components/
│   │   ├── NotebookCard.test.tsx
│   │   ├── PageSpread.test.tsx
│   │   └── NavigationControls.test.tsx
│   ├── services/
│   │   ├── NotebookService.test.ts
│   │   ├── EntryService.test.ts
│   │   └── MigrationService.test.ts
│   ├── stores/
│   │   ├── notebookStore.test.ts
│   │   ├── entryStore.test.ts
│   │   └── uiStore.test.ts
│   └── utils/
│       ├── pagination.test.ts
│       └── animation.test.ts
│
└── properties/
    ├── notebook-crud.property.test.ts
    ├── entry-association.property.test.ts
    ├── settings-inheritance.property.test.ts
    ├── pagination.property.test.ts
    ├── search.property.test.ts
    ├── migration.property.test.ts
    └── accessibility.property.test.ts
```

### 关键测试场景

**日记本管理：**
- 使用各种可选字段组合创建日记本
- 更新日记本设置并验证持久化
- 删除日记本并验证级联删除
- 归档/取消归档日记本

**条目管理：**
- 在不同日记本中创建条目
- 验证日记本关联
- 测试纸张样式继承和覆盖
- 测试字体设置继承

**分页：**
- 使用不同的条目数和视口大小测试分页
- 验证页面边界正确
- 测试懒加载行为

**搜索：**
- 测试跨所有日记本的搜索
- 测试日记本内的范围搜索
- 验证搜索在标题和内容中查找匹配项
- 测试搜索结果格式

**迁移：**
- 使用各种条目数测试迁移
- 验证数据保留
- 测试默认日记本创建
- 验证所有条目都已分配

**无障碍：**
- 测试所有操作的键盘导航
- 验证交互元素上的 ARIA 属性
- 测试屏幕阅读器兼容性
- 测试减少动画模式

### 性能测试

虽然不是自动化测试的一部分，但手动性能验证应验证：
- 翻页动画在目标设备上保持 60fps
- 懒加载减少初始加载时间
- 搜索在典型数据集上在 500ms 内完成
- 分页计算在 100ms 内完成
