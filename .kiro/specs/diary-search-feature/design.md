# 设计文档

## 概述

本文档描述了"Tina's Log"日记应用搜索功能的技术设计。该搜索系统将提供全文搜索、多维度过滤（标签、心情、日期范围）、实时结果更新、搜索历史记录和响应式用户界面。

### 设计目标

1. **性能**: 通过防抖和高效查询实现快速搜索响应（<500ms）
2. **用户体验**: 提供实时反馈、直观的过滤器和清晰的结果显示
3. **可访问性**: 支持键盘导航、屏幕阅读器和WCAG AA标准
4. **可维护性**: 模块化组件设计，清晰的关注点分离
5. **安全性**: 通过RLS策略确保用户数据隔离

### 技术栈

- **前端**: React 18 + TypeScript + Vite
- **UI库**: 自定义组件（基于现有设计系统）
- **状态管理**: React Hooks (useState, useEffect, useCallback)
- **数据库**: Supabase (PostgreSQL)
- **搜索**: Supabase全文搜索（使用`to_tsquery`和`to_tsvector`）或客户端过滤
- **路由**: React Router
- **存储**: localStorage（搜索历史）
- **样式**: CSS Modules / Tailwind CSS（根据现有项目）

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                     Search Page                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │           SearchBar Component                      │  │
│  │  - 搜索输入                                         │  │
│  │  - 防抖处理                                         │  │
│  │  - 搜索历史下拉                                     │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │      AdvancedFilters Component                     │  │
│  │  - 标签选择器                                       │  │
│  │  - 心情选择器                                       │  │
│  │  - 日期范围选择器                                   │  │
│  │  - 清除过滤器按钮                                   │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │       SearchResults Component                      │  │
│  │  - 结果计数                                         │  │
│  │  - 结果卡片列表                                     │  │
│  │  - 加载状态                                         │  │
│  │  - 空状态                                           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Search Service Layer                        │
│  - executeSearch(query, filters)                        │
│  - buildSupabaseQuery(query, filters)                   │
│  - highlightMatches(text, query)                        │
│  - saveSearchHistory(query)                             │
│  - getSearchHistory()                                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Client                         │
│  - 全文搜索查询                                          │
│  - RLS策略强制执行                                       │
│  - 数据过滤和排序                                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database                         │
│  - diary_entries表                                       │
│  - 全文搜索索引                                          │
│  - 用户数据隔离                                          │
└─────────────────────────────────────────────────────────┘
```

### 数据流

1. **用户输入** → SearchBar组件捕获输入
2. **防抖** → 300ms延迟后触发搜索
3. **构建查询** → SearchService根据过滤器构建Supabase查询
4. **执行查询** → Supabase客户端执行查询（应用RLS）
5. **处理结果** → 高亮匹配项，格式化数据
6. **渲染结果** → SearchResults组件显示结果
7. **保存历史** → 将搜索查询保存到localStorage

## 组件和接口

### 1. SearchPage组件

**职责**: 搜索功能的主容器页面

**Props**: 无（从路由获取状态）

**State**:
```typescript
interface SearchPageState {
  searchQuery: string;           // 当前搜索文本
  selectedTags: string[];        // 选定的标签过滤器
  selectedMood: Mood | null;     // 选定的心情过滤器
  dateRange: DateRange;          // 日期范围过滤器
  searchResults: DiaryEntry[];   // 搜索结果
  isLoading: boolean;            // 加载状态
  isAdvancedOpen: boolean;       // 高级过滤器面板状态
  resultCount: number;           // 结果总数
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

type Mood = 'happy' | 'calm' | 'neutral' | 'sad' | 'angry';
```

**主要方法**:
```typescript
// 处理搜索查询变化（带防抖）
const handleSearchChange = useCallback(
  debounce((query: string) => {
    setSearchQuery(query);
    executeSearch(query, filters);
  }, 300),
  [filters]
);

// 执行搜索
const executeSearch = async (
  query: string,
  filters: SearchFilters
): Promise<void> => {
  setIsLoading(true);
  try {
    const results = await searchService.search(query, filters);
    setSearchResults(results);
    setResultCount(results.length);
    if (query) {
      searchService.saveToHistory(query);
    }
  } catch (error) {
    console.error('Search failed:', error);
    // 显示错误提示
  } finally {
    setIsLoading(false);
  }
};

// 清除所有过滤器
const clearAllFilters = () => {
  setSearchQuery('');
  setSelectedTags([]);
  setSelectedMood(null);
  setDateRange({ startDate: null, endDate: null });
  executeSearch('', {});
};

// 处理键盘快捷键
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      navigate('/search');
      searchInputRef.current?.focus();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 2. SearchBar组件

**职责**: 搜索输入和历史记录下拉

**Props**:
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onHistorySelect: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}
```

**State**:
```typescript
interface SearchBarState {
  isFocused: boolean;
  showHistory: boolean;
  searchHistory: string[];
}
```

**功能**:
- 显示搜索图标和清除按钮
- 聚焦时显示搜索历史下拉
- 支持Escape键清除输入
- 支持向上/向下箭头键导航历史记录
- 支持Enter键选择历史记录项

### 3. AdvancedFilters组件

**职责**: 高级过滤选项面板

**Props**:
```typescript
interface AdvancedFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedMood: Mood | null;
  onMoodChange: (mood: Mood | null) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  availableTags: string[];
  activeFilterCount: number;
}
```

**子组件**:
- **TagSelector**: 多选标签选择器（复选框或标签芯片）
- **MoodSelector**: 单选心情选择器（单选按钮或图标按钮）
- **DateRangePicker**: 起始和结束日期选择器

**布局**:
- 桌面: 可折叠面板，内联显示
- 移动: 全屏模态或底部抽屉

### 4. SearchResults组件

**职责**: 显示搜索结果列表

**Props**:
```typescript
interface SearchResultsProps {
  results: DiaryEntry[];
  searchQuery: string;
  isLoading: boolean;
  onResultClick: (entryId: string) => void;
}
```

**功能**:
- 显示结果计数
- 渲染结果卡片（使用DiaryEntryCard组件）
- 高亮搜索词匹配
- 显示加载骨架屏
- 显示空状态（无结果或无条目）
- 虚拟化长列表（如果结果>100）

### 5. DiaryEntryCard组件（复用/扩展现有组件）

**Props**:
```typescript
interface DiaryEntryCardProps {
  entry: DiaryEntry;
  highlightQuery?: string;
  onClick: () => void;
}
```

**显示内容**:
- 标题（高亮匹配）
- 内容预览（高亮匹配，截断至150字符）
- 日期和时间
- 标签芯片
- 心情图标
- 位置（如果有）

### 6. SearchService

**职责**: 搜索业务逻辑和数据访问

**接口**:
```typescript
interface SearchService {
  // 执行搜索
  search(query: string, filters: SearchFilters): Promise<DiaryEntry[]>;
  
  // 构建Supabase查询
  buildQuery(query: string, filters: SearchFilters): SupabaseQueryBuilder;
  
  // 高亮文本中的匹配项
  highlightMatches(text: string, query: string): string;
  
  // 保存搜索历史
  saveToHistory(query: string): void;
  
  // 获取搜索历史
  getHistory(): string[];
  
  // 清除搜索历史
  clearHistory(): void;
}

interface SearchFilters {
  tags?: string[];
  mood?: Mood;
  startDate?: Date;
  endDate?: Date;
}
```

**实现细节**:

```typescript
class SearchServiceImpl implements SearchService {
  private supabase: SupabaseClient;
  private historyKey = 'diary_search_history';
  private maxHistoryItems = 10;

  async search(query: string, filters: SearchFilters): Promise<DiaryEntry[]> {
    let queryBuilder = this.supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', this.getCurrentUserId())
      .order('created_at', { ascending: false });

    // 全文搜索
    if (query.trim()) {
      // 选项1: 使用Supabase全文搜索（如果可用）
      queryBuilder = queryBuilder.textSearch('fts', query, {
        type: 'websearch',
        config: 'english'
      });
      
      // 选项2: 客户端过滤（备选方案）
      // 在客户端使用.filter()进行文本匹配
    }

    // 标签过滤
    if (filters.tags && filters.tags.length > 0) {
      queryBuilder = queryBuilder.contains('tags', filters.tags);
    }

    // 心情过滤
    if (filters.mood) {
      queryBuilder = queryBuilder.eq('mood', filters.mood);
    }

    // 日期范围过滤
    if (filters.startDate) {
      queryBuilder = queryBuilder.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      queryBuilder = queryBuilder.lte('created_at', endOfDay.toISOString());
    }

    const { data, error } = await queryBuilder;
    
    if (error) throw error;
    return data || [];
  }

  highlightMatches(text: string, query: string): string {
    if (!query.trim()) return text;
    
    const words = query.trim().split(/\s+/);
    let highlighted = text;
    
    words.forEach(word => {
      const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });
    
    return highlighted;
  }

  saveToHistory(query: string): void {
    const history = this.getHistory();
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) return;
    
    // 移除重复项
    const filtered = history.filter(q => q !== trimmedQuery);
    
    // 添加到开头
    const updated = [trimmedQuery, ...filtered].slice(0, this.maxHistoryItems);
    
    localStorage.setItem(
      `${this.historyKey}_${this.getCurrentUserId()}`,
      JSON.stringify(updated)
    );
  }

  getHistory(): string[] {
    const stored = localStorage.getItem(
      `${this.historyKey}_${this.getCurrentUserId()}`
    );
    return stored ? JSON.parse(stored) : [];
  }

  clearHistory(): void {
    localStorage.removeItem(
      `${this.historyKey}_${this.getCurrentUserId()}`
    );
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private getCurrentUserId(): string {
    // 从Supabase auth获取当前用户ID
    return this.supabase.auth.getUser().then(u => u.data.user?.id || '');
  }
}
```

## 数据模型

### DiaryEntry接口

```typescript
interface DiaryEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;              // Markdown格式
  tags: string[];
  mood: Mood | null;
  location: string | null;
  weather: string | null;
  images: string[];             // 图片URL数组
  created_at: string;           // ISO日期字符串
  updated_at: string;
}
```

### 数据库架构

假设现有的`diary_entries`表结构：

```sql
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  mood TEXT,
  location TEXT,
  weather TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 全文搜索列（可选，用于性能优化）
  fts TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
  ) STORED
);

-- 全文搜索索引
CREATE INDEX diary_entries_fts_idx ON diary_entries USING GIN(fts);

-- 用户ID索引（用于RLS查询）
CREATE INDEX diary_entries_user_id_idx ON diary_entries(user_id);

-- 日期索引（用于日期范围查询）
CREATE INDEX diary_entries_created_at_idx ON diary_entries(created_at DESC);

-- RLS策略
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own entries"
  ON diary_entries
  FOR ALL
  USING (auth.uid() = user_id);
```

### SearchHistory数据模型

```typescript
interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

// 存储在localStorage中
// 键: `diary_search_history_${userId}`
// 值: JSON.stringify(string[])
```

## 错误处理

### 错误类型

1. **网络错误**: Supabase连接失败
2. **认证错误**: 用户未登录或会话过期
3. **查询错误**: 无效的搜索参数或数据库错误
4. **验证错误**: 无效的日期范围（起始日期>结束日期）
5. **存储错误**: localStorage访问失败

### 错误处理策略

```typescript
// 搜索错误处理
try {
  const results = await searchService.search(query, filters);
  setSearchResults(results);
} catch (error) {
  if (error instanceof AuthError) {
    // 重定向到登录页面
    navigate('/login');
  } else if (error instanceof NetworkError) {
    // 显示网络错误提示
    toast.error('网络连接失败，请检查您的网络设置');
  } else if (error instanceof ValidationError) {
    // 显示验证错误
    toast.error(error.message);
  } else {
    // 通用错误
    toast.error('搜索失败，请稍后重试');
    console.error('Search error:', error);
  }
  setSearchResults([]);
}

// 日期验证
const validateDateRange = (startDate: Date | null, endDate: Date | null): boolean => {
  if (startDate && endDate && startDate > endDate) {
    toast.error('起始日期不能晚于结束日期');
    return false;
  }
  return true;
};

// localStorage错误处理
const safeLocalStorageAccess = (operation: () => void): void => {
  try {
    operation();
  } catch (error) {
    console.warn('localStorage access failed:', error);
    // 降级：不保存搜索历史，但不影响核心功能
  }
};
```

## 测试策略

### 测试方法

本项目将采用**双重测试方法**：

1. **单元测试**: 验证特定示例、边缘情况和错误条件
2. **属性测试**: 验证跨所有输入的通用属性

这两种方法是互补的，对于全面覆盖都是必要的。单元测试捕获具体的错误，而属性测试验证一般正确性。

### 单元测试

单元测试应专注于：
- 演示正确行为的特定示例
- 组件之间的集成点
- 边缘情况和错误条件

避免编写过多的单元测试 - 基于属性的测试处理覆盖大量输入。

**测试框架**: Vitest + React Testing Library

**测试覆盖**:

1. **SearchService单元测试**
   - 空查询返回所有条目
   - 单个标签过滤
   - 心情过滤
   - 日期范围边界情况
   - 无效日期范围验证
   - 搜索历史保存和检索
   - 搜索历史去重
   - 搜索历史限制（最多10项）

2. **组件单元测试**
   - SearchBar: 输入变化、历史选择、清除按钮
   - AdvancedFilters: 过滤器切换、标签选择、心情选择
   - SearchResults: 空状态、加载状态、结果渲染
   - DiaryEntryCard: 高亮显示、点击处理

3. **集成测试**
   - 完整搜索流程：输入 → 查询 → 结果显示
   - 过滤器组合：多个过滤器同时应用
   - 键盘导航：快捷键、箭头键导航

### 属性测试

**属性测试库**: fast-check（TypeScript的属性测试库）

**配置**: 每个属性测试最少运行100次迭代（由于随机化）

**标签格式**: 每个测试必须用注释引用其设计文档属性
```typescript
// Feature: diary-search-feature, Property {number}: {property_text}
```

每个正确性属性必须由单个基于属性的测试实现。

### 测试环境

- **单元测试**: Vitest + jsdom
- **E2E测试**: Playwright（可选，用于关键用户流程）
- **CI/CD**: GitHub Actions自动运行测试

### 测试数据

- 使用工厂函数生成测试数据
- 模拟Supabase客户端响应
- 使用测试用户ID进行隔离


## 正确性属性

**属性**是一个特征或行为，应该在系统的所有有效执行中保持为真 - 本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。

### 属性 1: 全文搜索匹配

*对于任何*搜索查询和日记条目集合，如果查询不为空，则所有返回的结果都应该在标题或内容中包含至少一个查询词。

**验证: 需求 1.1, 1.2**

### 属性 2: 空查询返回所有条目

*对于任何*用户的日记条目集合，当搜索查询为空时，系统应该返回该用户的所有条目。

**验证: 需求 1.3**

### 属性 3: 防抖延迟执行

*对于任何*搜索输入序列，系统应该在用户停止输入后300毫秒才执行搜索，而不是在每次按键时立即执行。

**验证: 需求 1.4, 15.1**

### 属性 4: 用户数据隔离

*对于任何*搜索查询和过滤器组合，返回的所有结果都应该只属于当前已认证用户，不包含其他用户的条目。

**验证: 需求 1.5, 16.1, 16.2**

### 属性 5: 标签过滤交集

*对于任何*选定的标签集合，所有返回的结果都应该包含所有选定的标签（AND逻辑，不是OR）。

**验证: 需求 2.1**

### 属性 6: 标签过滤器移除更新结果

*对于任何*活动的标签过滤器集合，当移除一个标签时，结果集应该更新为不再要求该标签，可能增加结果数量。

**验证: 需求 2.2, 2.5**

### 属性 7: 选定标签显示为芯片

*对于任何*选定的标签集合，UI应该为每个选定的标签显示一个可移除的标签芯片。

**验证: 需求 2.4**

### 属性 8: 心情过滤精确匹配

*对于任何*选定的心情值，所有返回的结果都应该具有完全相同的心情值。

**验证: 需求 3.1**

### 属性 9: 单一心情选择约束

*对于任何*心情选择操作，系统应该确保最多只有一个心情被选中，选择新心情时自动清除之前的心情。

**验证: 需求 3.4**

### 属性 10: 日期范围过滤

*对于任何*有效的日期范围（起始日期 ≤ 结束日期），所有返回的结果的创建日期都应该在该范围内（包含边界）。

**验证: 需求 4.1, 4.2, 4.3**

### 属性 11: 无效日期范围拒绝

*对于任何*起始日期晚于结束日期的日期范围，系统应该显示验证错误并阻止搜索执行。

**验证: 需求 4.4**

### 属性 12: 加载状态管理

*对于任何*搜索操作，系统应该在搜索开始时显示加载指示器，在搜索完成或失败时隐藏加载指示器。

**验证: 需求 5.2, 5.3**

### 属性 13: 结果计数显示

*对于任何*搜索结果集合，系统应该显示准确的结果总数，该数字应该等于返回的条目数量。

**验证: 需求 5.5**

### 属性 14: 搜索历史持久化

*对于任何*非空搜索查询，执行搜索后，该查询应该被保存到localStorage中，并在下次聚焦搜索栏时可见。

**验证: 需求 6.1, 6.2**

### 属性 15: 搜索历史限制

*对于任何*搜索历史记录，系统应该最多保留10个最近的搜索查询，当添加第11个时自动移除最旧的。

**验证: 需求 6.4**

### 属性 16: 搜索历史去重

*对于任何*重复的搜索查询，系统应该将其移至历史记录顶部而不是创建重复条目，保持历史记录唯一性。

**验证: 需求 6.5**

### 属性 17: 用户特定历史隔离

*对于任何*两个不同的用户，他们的搜索历史应该完全隔离，存储在不同的localStorage键中。

**验证: 需求 6.6**

### 属性 18: 高级过滤器切换

*对于任何*高级过滤器面板状态，点击切换按钮应该反转其状态（展开变折叠，折叠变展开）。

**验证: 需求 7.2**

### 属性 19: 折叠时保留过滤器

*对于任何*活动的过滤器集合，折叠高级过滤器面板不应该清除或修改这些过滤器，它们应该继续应用于搜索结果。

**验证: 需求 7.4**

### 属性 20: 活动过滤器计数显示

*对于任何*过滤器组合，系统应该在高级过滤器切换按钮上显示活动过滤器的准确数量（标签数 + 心情（0或1）+ 日期范围（0、1或2））。

**验证: 需求 7.5**

### 属性 21: 结果卡片完整信息

*对于任何*搜索结果条目，其卡片应该包含标题、内容预览、日期、标签和心情的所有可用信息。

**验证: 需求 8.1**

### 属性 22: 搜索词高亮

*对于任何*非空搜索查询，结果中匹配的搜索词应该被高亮标记（使用`<mark>`标签或等效样式）。

**验证: 需求 8.2**

### 属性 23: 内容截断

*对于任何*内容长度超过150字符的日记条目，预览应该被截断到150字符并附加省略号（...）。

**验证: 需求 8.4**

### 属性 24: 结果按日期降序排列

*对于任何*搜索结果集合，结果应该按创建日期降序排列，最新的条目排在最前面。

**验证: 需求 8.5**

### 属性 25: 清除所有过滤器重置状态

*对于任何*过滤器组合（搜索查询、标签、心情、日期范围），点击"清除所有过滤器"按钮应该移除所有过滤器并显示所有用户条目。

**验证: 需求 10.2, 10.3, 10.5**

### 属性 26: 清除按钮状态管理

*对于任何*过滤器状态，当没有活动过滤器时（搜索为空、无标签、无心情、无日期），"清除所有过滤器"按钮应该被禁用或隐藏。

**验证: 需求 10.4**

### 属性 27: 键盘快捷键导航

*对于任何*应用状态，按下Cmd+K（Mac）或Ctrl+K（Windows/Linux）应该导航到搜索页面并自动聚焦搜索输入栏。

**验证: 需求 11.1, 11.2**

### 属性 28: Escape键清除输入

*对于任何*非空搜索输入，在搜索栏中按下Escape键应该清除输入内容。

**验证: 需求 11.3**

### 属性 29: 箭头键结果导航

*对于任何*搜索结果列表，按下向上/向下箭头键应该在结果之间移动焦点，按下Enter键应该打开当前聚焦的条目。

**验证: 需求 11.4, 11.5**

### 属性 30: 响应式布局适配

*对于任何*视口宽度，系统应该根据屏幕尺寸调整布局：移动设备（<768px）使用全屏模态/底部抽屉，桌面设备使用内联面板。

**验证: 需求 12.1, 12.2, 12.3**

### 属性 31: 触摸目标尺寸

*对于任何*交互元素（按钮、链接、输入框），其可点击/触摸区域应该至少为44x44像素，符合移动端可访问性标准。

**验证: 需求 12.4**

### 属性 32: 主题一致性

*对于任何*主题切换（深色/浅色），所有搜索UI组件应该立即应用相应的主题颜色和样式，包括搜索高亮的对比度。

**验证: 需求 13.1, 13.2, 13.3, 13.4, 13.5**

### 属性 33: ARIA标签完整性

*对于任何*交互元素，系统应该提供适当的ARIA标签（aria-label、aria-labelledby或title），确保屏幕阅读器用户可以理解其功能。

**验证: 需求 14.1, 14.4, 14.6**

### 属性 34: 键盘可访问性

*对于任何*UI功能，应该可以仅通过键盘操作完成（Tab、Enter、Space、Escape、箭头键），无需鼠标。

**验证: 需求 14.2**

### 属性 35: ARIA实时区域更新

*对于任何*搜索结果更新，系统应该使用ARIA live region宣布新的结果计数，让屏幕阅读器用户知道结果已更新。

**验证: 需求 14.3**

### 属性 36: 颜色对比度

*对于任何*文本和背景组合，颜色对比度应该至少达到WCAG AA标准（正常文本4.5:1，大文本3:1）。

**验证: 需求 14.5**

### 属性 37: 结果虚拟化

*对于任何*超过100个条目的搜索结果，系统应该使用虚拟化或分页技术，只渲染可见区域的条目以保持性能。

**验证: 需求 15.3**

### 属性 38: 搜索结果缓存

*对于任何*搜索查询和过滤器组合，如果在短时间内（如5秒）重复执行相同的搜索，系统应该返回缓存的结果而不是重新查询数据库。

**验证: 需求 15.4**

### 属性 39: 未认证用户重定向

*对于任何*未认证的用户，尝试访问搜索页面应该自动重定向到登录页面。

**验证: 需求 16.4**

### 属性 40: URL隐私保护

*对于任何*搜索操作，搜索查询和过滤器不应该出现在URL参数中，避免在浏览器历史记录中暴露敏感信息。

**验证: 需求 16.5**
