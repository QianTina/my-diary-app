# 🚀 个人工作台开发计划

## 📋 项目概述

将现有的日记应用扩展为综合性的个人工作台，包含日记、日历、待办、笔记等多个功能模块。

---

## 🎯 第一阶段目标：用户系统 + 日历待办

### 功能范围

#### 必须完成（MVP）
- ✅ 日记功能（已完成）
- 🔜 用户认证系统
- 🔜 日历视图
- 🔜 待办事项管理

#### 暂不实现
- ❌ 笔记功能（第二阶段）
- ❌ 目标管理（第二阶段）
- ❌ 数据统计（第二阶段）

---

## 📅 开发计划

### Week 1-2: 用户认证系统

#### 目标
实现完整的用户注册、登录、数据隔离功能。

#### 技术栈
- Supabase Auth
- @supabase/auth-ui-react
- Row Level Security (RLS)

#### 任务清单

##### 1. 安装依赖
```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

##### 2. 创建认证页面
- [ ] `src/pages/auth/LoginPage.tsx` - 登录页面
- [ ] `src/pages/auth/RegisterPage.tsx` - 注册页面（可选，使用 Auth UI）
- [ ] `src/pages/auth/ProfilePage.tsx` - 个人资料页面

##### 3. 创建认证组件
- [ ] `src/components/auth/AuthProvider.tsx` - 认证上下文
- [ ] `src/components/auth/ProtectedRoute.tsx` - 路由保护
- [ ] `src/components/auth/UserMenu.tsx` - 用户菜单

##### 4. 更新路由
```typescript
// src/App.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="write" element={<WritePage />} />
      {/* ... 其他路由 */}
    </Route>
  </Route>
</Routes>
```

##### 5. 数据库迁移
```sql
-- 1. 为 diaries 表添加 user_id
ALTER TABLE diaries ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. 更新现有数据（如果有）
-- UPDATE diaries SET user_id = '你的用户ID' WHERE user_id IS NULL;

-- 3. 启用 RLS
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 4. 创建策略
CREATE POLICY "Users can view their own diaries"
ON diaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diaries"
ON diaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diaries"
ON diaries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diaries"
ON diaries FOR DELETE
USING (auth.uid() = user_id);
```

##### 6. 更新 Store
```typescript
// src/store/diaryStore.ts
// 创建日记时自动添加 user_id
const { data: { user } } = await supabase.auth.getUser();
const newDiary = {
  ...diaryData,
  user_id: user?.id,
};
```

##### 7. 更新侧边栏
- [ ] 添加用户头像和名称
- [ ] 添加退出登录按钮
- [ ] 显示用户信息

#### 验收标准
- [ ] 用户可以注册新账号
- [ ] 用户可以登录/登出
- [ ] 未登录用户无法访问应用
- [ ] 用户只能看到自己的日记
- [ ] 数据完全隔离

---

### Week 3-4: 日历功能

#### 目标
实现日历视图，可以查看和管理事件。

#### 技术栈
- react-big-calendar
- date-fns

#### 任务清单

##### 1. 安装依赖
```bash
npm install react-big-calendar date-fns
npm install --save-dev @types/react-big-calendar
```

##### 2. 创建数据模型
```sql
-- 创建 events 表
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#3b82f6',
  location TEXT,
  reminder INTEGER, -- 提前多少分钟提醒
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can manage their own events"
ON events FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 创建索引
CREATE INDEX events_user_id_idx ON events(user_id);
CREATE INDEX events_start_time_idx ON events(start_time);
```

##### 3. 创建页面和组件
- [ ] `src/pages/CalendarPage.tsx` - 日历主页面
- [ ] `src/components/calendar/CalendarView.tsx` - 日历视图组件
- [ ] `src/components/calendar/EventModal.tsx` - 事件编辑弹窗
- [ ] `src/components/calendar/EventList.tsx` - 事件列表
- [ ] `src/components/calendar/MiniCalendar.tsx` - 小日历（可选）

##### 4. 创建 Store
```typescript
// src/store/calendarStore.ts
interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  location?: string;
  reminder?: number;
  created_at: string;
  updated_at: string;
}

interface CalendarState {
  events: Event[];
  isLoading: boolean;
  selectedDate: Date;
  viewMode: 'month' | 'week' | 'day';
  
  fetchEvents: () => Promise<void>;
  createEvent: (event: Partial<Event>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
}
```

##### 5. 更新路由和导航
```typescript
// 添加到路由
<Route path="calendar" element={<CalendarPage />} />

// 更新侧边栏
{ path: '/calendar', icon: Calendar, label: '日历', enLabel: 'Calendar' }
```

##### 6. 功能实现
- [ ] 月视图、周视图、日视图切换
- [ ] 创建事件
- [ ] 编辑事件
- [ ] 删除事件
- [ ] 拖拽调整事件时间
- [ ] 点击日期快速创建事件
- [ ] 事件颜色分类

#### 验收标准
- [ ] 可以查看月/周/日视图
- [ ] 可以创建、编辑、删除事件
- [ ] 事件正确显示在日历上
- [ ] 可以拖拽调整事件时间
- [ ] 数据持久化到 Supabase

---

### Week 5-6: 待办事项

#### 目标
实现待办事项管理功能。

#### 技术栈
- dnd-kit（拖拽排序）
- date-fns

#### 任务清单

##### 1. 安装依赖
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

##### 2. 创建数据模型
```sql
-- 创建 todos 表
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  tags TEXT[],
  order_index INTEGER DEFAULT 0,
  parent_id UUID REFERENCES todos(id), -- 支持子任务
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 启用 RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can manage their own todos"
ON todos FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 创建索引
CREATE INDEX todos_user_id_idx ON todos(user_id);
CREATE INDEX todos_completed_idx ON todos(completed);
CREATE INDEX todos_due_date_idx ON todos(due_date);
```

##### 3. 创建页面和组件
- [ ] `src/pages/TodoPage.tsx` - 待办主页面
- [ ] `src/components/todo/TodoList.tsx` - 待办列表
- [ ] `src/components/todo/TodoItem.tsx` - 单个待办项
- [ ] `src/components/todo/TodoForm.tsx` - 添加/编辑表单
- [ ] `src/components/todo/TodoFilters.tsx` - 筛选器
- [ ] `src/components/todo/TodoStats.tsx` - 统计信息

##### 4. 创建 Store
```typescript
// src/store/todoStore.ts
interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  category?: string;
  tags: string[];
  order_index: number;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  filter: 'all' | 'active' | 'completed';
  sortBy: 'created' | 'due_date' | 'priority';
  
  fetchTodos: () => Promise<void>;
  createTodo: (todo: Partial<Todo>) => Promise<void>;
  updateTodo: (id: string, todo: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  reorderTodos: (todos: Todo[]) => Promise<void>;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  setSortBy: (sortBy: 'created' | 'due_date' | 'priority') => void;
}
```

##### 5. 更新路由和导航
```typescript
// 添加到路由
<Route path="todo" element={<TodoPage />} />

// 更新侧边栏
{ path: '/todo', icon: CheckSquare, label: '待办', enLabel: 'Todo' }
```

##### 6. 功能实现
- [ ] 添加待办事项
- [ ] 标记完成/未完成
- [ ] 编辑待办事项
- [ ] 删除待办事项
- [ ] 设置优先级（高/中/低）
- [ ] 设置截止日期
- [ ] 添加标签
- [ ] 拖拽排序
- [ ] 筛选（全部/进行中/已完成）
- [ ] 搜索功能
- [ ] 子任务支持（可选）

#### 验收标准
- [ ] 可以创建、编辑、删除待办
- [ ] 可以标记完成状态
- [ ] 可以设置优先级和截止日期
- [ ] 可以拖拽排序
- [ ] 可以按状态筛选
- [ ] 数据持久化到 Supabase

---

### Week 7: 集成和优化

#### 任务清单

##### 1. 功能集成
- [ ] 日记和日历关联（某天的日记显示在日历上）
- [ ] 待办和日历关联（有截止日期的待办显示在日历上）
- [ ] 统一的数据加载状态
- [ ] 统一的错误处理

##### 2. UI/UX 优化
- [ ] 响应式设计优化
- [ ] 加载动画
- [ ] 空状态设计
- [ ] 错误提示优化
- [ ] 快捷键支持

##### 3. 性能优化
- [ ] 数据分页加载
- [ ] 虚拟滚动（长列表）
- [ ] 图片懒加载
- [ ] 代码分割

##### 4. 测试
- [ ] 功能测试
- [ ] 边界情况测试
- [ ] 性能测试
- [ ] 移动端测试

---

## 🗂️ 项目结构

```
src/
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ProfilePage.tsx
│   ├── HomePage.tsx              # 仪表盘（新增）
│   ├── DiaryPage.tsx             # 日记列表（重命名）
│   ├── WritePage.tsx
│   ├── DiaryDetailPage.tsx
│   ├── CalendarPage.tsx          # 日历（新增）
│   ├── TodoPage.tsx              # 待办（新增）
│   └── SettingsPage.tsx
│
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── UserMenu.tsx
│   ├── calendar/
│   │   ├── CalendarView.tsx
│   │   ├── EventModal.tsx
│   │   └── EventList.tsx
│   ├── todo/
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoForm.tsx
│   │   └── TodoFilters.tsx
│   ├── dashboard/                # 仪表盘组件（新增）
│   │   ├── QuickStats.tsx
│   │   ├── RecentDiaries.tsx
│   │   ├── UpcomingEvents.tsx
│   │   └── TodoSummary.tsx
│   └── ... (现有组件)
│
├── store/
│   ├── authStore.ts              # 认证状态（新增）
│   ├── diaryStore.ts
│   ├── calendarStore.ts          # 日历状态（新增）
│   ├── todoStore.ts              # 待办状态（新增）
│   └── themeStore.ts
│
├── types/
│   ├── auth.ts                   # 认证类型（新增）
│   ├── calendar.ts               # 日历类型（新增）
│   ├── todo.ts                   # 待办类型（新增）
│   └── diary.ts                  # 日记类型（重命名）
│
└── utils/
    ├── supabase.ts
    ├── auth.ts                   # 认证工具（新增）
    └── ... (现有工具)
```

---

## 🎨 UI 设计建议

### 仪表盘（新首页）
```
┌─────────────────────────────────────────┐
│  欢迎回来，Tina！                        │
│  今天是 2025年1月27日 星期二              │
├─────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ 📝 日记  │  │ ✅ 待办  │  │ 📅 事件  │ │
│  │   12    │  │   5/8   │  │    3    │ │
│  └─────────┘  └─────────┘  └─────────┘ │
├─────────────────────────────────────────┤
│  最近日记                                │
│  ┌─────────────────────────────────┐   │
│  │ 今天的心情很好...                │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  即将到来的事件                          │
│  • 团队会议 - 今天 14:00                │
│  • 项目截止 - 明天                      │
└─────────────────────────────────────────┘
```

### 侧边栏更新
```
Tina's Workspace
├── 🏠 仪表盘 (Dashboard)
├── 📝 日记 (Diary)
├── 📅 日历 (Calendar)
├── ✅ 待办 (Todo)
├── ⚙️ 设置 (Settings)
└── 👤 个人资料
```

---

## 📊 数据库 Schema 总览

```sql
-- 用户表（Supabase Auth 自带）
auth.users

-- 日记表（已有，需要添加 user_id）
diaries (
  id, user_id, title, content, mood, weather,
  location, tags, images, is_encrypted,
  created_at, updated_at
)

-- 事件表（新增）
events (
  id, user_id, title, description,
  start_time, end_time, all_day, color,
  location, reminder, created_at, updated_at
)

-- 待办表（新增）
todos (
  id, user_id, title, description, completed,
  priority, due_date, category, tags,
  order_index, parent_id,
  created_at, updated_at, completed_at
)
```

---

## 🔧 技术要点

### 1. 认证流程
```typescript
// 1. 用户登录
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// 2. 获取当前用户
const { data: { user } } = await supabase.auth.getUser();

// 3. 监听认证状态
supabase.auth.onAuthStateChange((event, session) => {
  // 处理登录/登出
});

// 4. 登出
await supabase.auth.signOut();
```

### 2. RLS 策略
```sql
-- 确保用户只能访问自己的数据
CREATE POLICY "policy_name"
ON table_name
FOR operation
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### 3. 实时订阅（可选）
```typescript
// 订阅数据变化
const subscription = supabase
  .channel('todos')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => {
      // 处理数据变化
    }
  )
  .subscribe();
```

---

## ✅ 验收标准

### 功能完整性
- [ ] 所有核心功能正常工作
- [ ] 数据正确保存和读取
- [ ] 用户数据完全隔离

### 用户体验
- [ ] 界面美观，交互流畅
- [ ] 响应式设计，适配移动端
- [ ] 加载状态和错误提示清晰

### 性能
- [ ] 页面加载时间 < 2s
- [ ] 操作响应时间 < 500ms
- [ ] 无明显卡顿

### 安全性
- [ ] RLS 正确配置
- [ ] 敏感信息加密
- [ ] XSS/CSRF 防护

---

## 📝 开发注意事项

### 1. 代码规范
- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 统一的命名规范
- 充分的代码注释

### 2. Git 工作流
- 为每个功能创建独立分支
- 提交信息清晰明确
- 定期合并到主分支

### 3. 测试
- 每个功能完成后进行测试
- 测试边界情况
- 测试不同设备和浏览器

### 4. 文档
- 更新 README
- 记录 API 变化
- 更新数据库 Schema 文档

---

## 🎯 成功指标

### 第一阶段完成标准
- [ ] 用户可以注册和登录
- [ ] 用户可以查看和管理日历事件
- [ ] 用户可以创建和管理待办事项
- [ ] 所有数据正确隔离
- [ ] 应用稳定运行

### 用户反馈
- [ ] 邀请 3-5 个用户测试
- [ ] 收集使用反馈
- [ ] 根据反馈优化

---

**预计完成时间：** 6-7 周
**当前状态：** 准备开始
**下一步：** 实现用户认证系统

---

**创建时间：** 2025-01-27
**版本：** v1.0
