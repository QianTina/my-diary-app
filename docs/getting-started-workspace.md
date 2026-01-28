# 🚀 开始开发个人工作台

## 📋 准备工作

### 1. 确认环境
```bash
# 检查 Node.js 版本
node --version  # 应该 >= 18

# 检查 npm 版本
npm --version

# 确认项目可以运行
npm run dev
```

### 2. 确认 Supabase 配置
```bash
# 检查 .env 文件
cat .env

# 应该包含：
# VITE_SUPABASE_URL=your-url
# VITE_SUPABASE_ANON_KEY=your-key
```

---

## 🎯 第一步：安装认证依赖

```bash
# 安装 Supabase Auth UI
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

---

## 📁 第二步：创建文件结构

### 创建认证相关目录和文件

```bash
# 创建目录
mkdir -p src/pages/auth
mkdir -p src/components/auth
mkdir -p src/types

# 创建文件（空文件，稍后填充内容）
touch src/pages/auth/LoginPage.tsx
touch src/pages/auth/ProfilePage.tsx
touch src/components/auth/AuthProvider.tsx
touch src/components/auth/ProtectedRoute.tsx
touch src/components/auth/UserMenu.tsx
touch src/store/authStore.ts
touch src/types/auth.ts
```

---

## 📝 第三步：实现认证系统

### 1. 创建认证类型定义

**文件：** `src/types/auth.ts`

```typescript
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

### 2. 创建认证 Store

**文件：** `src/store/authStore.ts`

```typescript
import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ 
        user: user as User | null, 
        isAuthenticated: !!user,
        isLoading: false 
      });

      // 监听认证状态变化
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          user: session?.user as User | null,
          isAuthenticated: !!session?.user,
          isLoading: false
        });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
```

### 3. 创建登录页面

**文件：** `src/pages/auth/LoginPage.tsx`

```typescript
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-lg ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Tina's Workspace
          </h1>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            登录以继续使用
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#9333ea',
                  brandAccent: '#7c3aed',
                },
              },
            },
          }}
          theme={isDark ? 'dark' : 'light'}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: '邮箱',
                password_label: '密码',
                button_label: '登录',
                loading_button_label: '登录中...',
                link_text: '已有账号？登录',
              },
              sign_up: {
                email_label: '邮箱',
                password_label: '密码',
                button_label: '注册',
                loading_button_label: '注册中...',
                link_text: '没有账号？注册',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
```

### 4. 创建路由保护组件

**文件：** `src/components/auth/ProtectedRoute.tsx`

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
```

### 5. 创建用户菜单组件

**文件：** `src/components/auth/UserMenu.tsx`

```typescript
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserMenu() {
  const { user, signOut } = useAuthStore();
  const isDark = useThemeStore((state) => state.isDark);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className={`p-4 border-t ${
      isDark ? 'border-gray-800' : 'border-gray-200'
    }`}>
      <div className="flex items-center space-x-3 px-4 py-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
          {user.email?.[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium truncate ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {user.user_metadata?.name || user.email}
          </div>
          <div className={`text-xs truncate ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>
            {user.email}
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <button
          onClick={() => navigate('/profile')}
          className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
            isDark
              ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>个人资料</span>
        </button>

        <button
          onClick={handleSignOut}
          className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
            isDark
              ? 'text-gray-400 hover:bg-gray-800 hover:text-red-400'
              : 'text-gray-600 hover:bg-gray-100 hover:text-red-600'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </button>
      </div>
    </div>
  );
}
```

### 6. 更新 App.tsx

**文件：** `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Pages
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/auth/ProfilePage';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import WritePage from './pages/WritePage';
import DiaryDetailPage from './pages/DiaryDetailPage';
import SettingsPage from './pages/SettingsPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 受保护的路由 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="write" element={<WritePage />} />
            <Route path="diary/:id" element={<DiaryDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 7. 更新 Sidebar 组件

**文件：** `src/components/Sidebar.tsx`

在底部添加用户菜单：

```typescript
import UserMenu from './auth/UserMenu';

// ... 在 Sidebar 组件的 return 中，底部添加：

{/* User Menu */}
<UserMenu />
```

---

## 🗄️ 第四步：配置数据库

### 1. 在 Supabase Dashboard 执行 SQL

访问：https://app.supabase.com → 你的项目 → SQL Editor

```sql
-- 1. 为 diaries 表添加 user_id
ALTER TABLE diaries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. 启用 RLS
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 3. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Enable all access for development" ON diaries;

-- 4. 创建新策略
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

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS diaries_user_id_idx ON diaries(user_id);
```

### 2. 更新 diaryStore.ts

在创建日记时添加 user_id：

```typescript
// src/store/diaryStore.ts

// 在 createDiary 函数中
createDiary: async (diaryData) => {
  set({ isLoading: true });
  try {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const newDiary: DiaryEntry = {
      id: crypto.randomUUID(),
      ...diaryData,
      user_id: user.id, // 添加 user_id
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // ... 其余代码保持不变
  }
}
```

---

## ✅ 第五步：测试

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 测试流程
1. 访问 http://localhost:5173
2. 应该自动跳转到 /login
3. 注册一个新账号
4. 登录成功后应该跳转到首页
5. 创建一条日记
6. 退出登录
7. 用另一个账号登录
8. 确认看不到第一个账号的日记

### 3. 验证 RLS
在 Supabase Dashboard → Table Editor → diaries
- 应该只能看到当前登录用户的数据

---

## 🎉 完成！

现在你已经完成了用户认证系统的基础实现！

### 下一步

1. **完善个人资料页面** (`src/pages/auth/ProfilePage.tsx`)
2. **开始实现日历功能**（参考 workspace-development-plan.md）
3. **实现待办功能**

---

## 📝 常见问题

### Q: 登录后页面空白？
A: 检查浏览器控制台是否有错误，确认 Supabase 配置正确。

### Q: 无法创建日记？
A: 确认 RLS 策略已正确配置，检查 user_id 是否正确添加。

### Q: 主题切换不工作？
A: 确认 ThemeStore 正常工作，检查 LoginPage 是否正确使用主题。

---

## 🆘 需要帮助？

如果遇到问题：
1. 检查浏览器控制台错误
2. 检查 Supabase Dashboard 的日志
3. 查看 [Supabase Auth 文档](https://supabase.com/docs/guides/auth)

---

**创建时间：** 2025-01-27
**预计完成时间：** 1-2 天
