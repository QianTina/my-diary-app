# 多页面架构说明

## 📐 页面结构

应用已从单页面重构为多页面架构，使用 React Router 进行路由管理。

### 页面列表

```
/                    首页（日记列表）
/write               写作页面
/diary/:id           日记详情页
/settings            设置页面
```

---

## 🏗️ 架构设计

### 1. 布局组件 (Layout)

**位置**: `src/components/Layout.tsx`

**功能**:
- 顶部导航栏（固定）
- 页面内容区（Outlet）
- 底部信息
- 路由切换动画

**特点**:
- 响应式设计
- 暗黑模式适配
- 导航高亮显示
- 平滑过渡动画

### 2. 页面组件

#### 首页 (HomePage)
**路径**: `/`  
**文件**: `src/pages/HomePage.tsx`

**功能**:
- 日记列表展示
- 搜索和筛选
- 快速写作按钮
- 卡片式布局

**特点**:
- 内容预览（最多 3 行）
- 图片网格（最多显示 3 张）
- 标签筛选
- 淡入动画

#### 写作页面 (WritePage)
**路径**: `/write`  
**文件**: `src/pages/WritePage.tsx`

**功能**:
- 新建日记
- 编辑日记
- 草稿自动保存
- 预览模式

**特点**:
- 表单验证
- 环境信息自动获取
- 取消确认
- 提示信息

#### 日记详情页 (DiaryDetailPage)
**路径**: `/diary/:id`  
**文件**: `src/pages/DiaryDetailPage.tsx`

**功能**:
- 完整内容展示
- 图片查看（点击放大）
- 编辑和删除
- 返回列表

**特点**:
- 大字体标题
- 完整元信息
- 图片网格
- Markdown 渲染

#### 设置页面 (SettingsPage)
**路径**: `/settings`  
**文件**: `src/pages/SettingsPage.tsx`

**功能**:
- 主题切换
- 数据导出/导入
- 关于信息
- 清空数据

**特点**:
- 分类清晰
- 危险操作警告
- 统计信息
- 开关动画

---

## 🎨 UI/UX 改进

### 1. 导航体验
- **固定顶栏**: 滚动时始终可见
- **路由高亮**: 当前页面蓝色高亮
- **图标语言**: emoji 直观表达
- **响应式**: 移动端隐藏文字

### 2. 页面过渡
- **淡入动画**: 页面切换平滑
- **方向动画**: 左右滑动效果
- **加载状态**: Spinner 提示

### 3. 内容组织
- **首页**: 快速浏览，一键写作
- **写作页**: 专注创作，无干扰
- **详情页**: 沉浸阅读，完整展示
- **设置页**: 集中管理，分类清晰

---

## 📦 文件结构

```
src/
├── components/
│   ├── Layout.tsx              # 布局组件
│   ├── TagInput.tsx            # 标签输入
│   ├── MarkdownPreview.tsx     # Markdown 预览
│   ├── MoodSelector.tsx        # 心情选择器
│   └── ImageUploader.tsx       # 图片上传
├── pages/
│   ├── HomePage.tsx            # 首页
│   ├── WritePage.tsx           # 写作页
│   ├── DiaryDetailPage.tsx     # 详情页
│   └── SettingsPage.tsx        # 设置页
├── store/
│   └── diaryStore.ts           # 状态管理
├── utils/
│   ├── storage.ts              # 数据持久化
│   ├── weather.ts              # 环境感知
│   └── export.ts               # 导出工具
├── hooks/
│   └── useDarkMode.ts          # 暗黑模式
├── App.tsx                     # 路由配置
└── main.tsx                    # 应用入口
```

---

## 🔄 路由配置

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="write" element={<WritePage />} />
      <Route path="diary/:id" element={<DiaryDetailPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

---

## 🎯 用户流程

### 1. 查看日记
```
首页 → 浏览列表 → 点击"阅读更多" → 详情页
```

### 2. 写新日记
```
首页 → 点击"写新日记" → 写作页 → 填写内容 → 保存 → 返回首页
```

### 3. 编辑日记
```
首页/详情页 → 点击"编辑" → 写作页（加载数据）→ 修改 → 保存 → 返回
```

### 4. 管理设置
```
任意页面 → 点击"设置" → 设置页 → 导出/导入/主题切换
```

---

## 💡 技术实现

### 1. 路由管理
```typescript
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// 导航
const navigate = useNavigate();
navigate('/write');

// 参数
const { id } = useParams<{ id: string }>();
```

### 2. 状态共享
```typescript
// 所有页面共享 Zustand Store
const { diaries, createDiary, ... } = useDiaryStore();
```

### 3. 页面动画
```typescript
<motion.div
  key={location.pathname}
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 20 }}
>
  <Outlet />
</motion.div>
```

### 4. 导航高亮
```typescript
<NavLink
  to="/"
  className={({ isActive }) =>
    isActive ? 'active-class' : 'normal-class'
  }
>
  首页
</NavLink>
```

---

## 📊 性能优化

### 1. 代码分割
- 每个页面独立组件
- 按需加载（可进一步优化）

### 2. 状态管理
- Zustand 集中管理
- 避免 prop drilling

### 3. 动画性能
- Framer Motion 硬件加速
- 仅在必要时使用动画

---

## 🚀 部署注意事项

### SPA 路由配置

#### Vercel
自动支持，无需配置。

#### Netlify
创建 `public/_redirects`:
```
/*    /index.html   200
```

#### Nginx
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 🔮 未来优化

### 1. 懒加载
```typescript
const HomePage = lazy(() => import('./pages/HomePage'));
```

### 2. 预加载
```typescript
<Link to="/write" prefetch>写作</Link>
```

### 3. 缓存策略
- 页面级缓存
- 数据预取

### 4. 移动端优化
- 底部导航栏
- 手势操作
- 下拉刷新

---

## 📝 使用指南

### 开发模式
```bash
npm run dev
```

访问 `http://localhost:5173`

### 生产构建
```bash
npm run build
npm run preview
```

### 路由测试
- `/` - 首页
- `/write` - 写作页
- `/diary/xxx` - 详情页（需要有日记）
- `/settings` - 设置页

---

## 🎉 总结

多页面架构带来的优势：

✅ **清晰的功能分离**: 每个页面职责单一  
✅ **更好的用户体验**: 专注当前任务  
✅ **易于维护**: 代码组织清晰  
✅ **性能优化**: 按需加载  
✅ **SEO 友好**: 独立 URL（可配合 SSR）  
✅ **扩展性强**: 易于添加新页面  

现在应用结构更加专业，用户体验更加流畅！🚀
