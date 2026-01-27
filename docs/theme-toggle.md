# 🌓 主题切换功能说明

## 功能概述

应用现在支持**深色模式**和**浅色模式**切换，默认为深色模式。

---

## 🎨 主题对比

### 深色模式（默认）
- **背景**: 深黑色 `bg-gray-950`
- **卡片**: 深灰色 `bg-gray-800`
- **文字**: 白色/浅灰色
- **适用场景**: 夜间使用，护眼舒适

### 浅色模式
- **背景**: 浅灰色 `bg-gray-50`
- **卡片**: 白色 `bg-white`
- **文字**: 深灰色/黑色
- **适用场景**: 白天使用，清晰明亮

---

## 🔧 使用方法

### 方法 1：首页快速切换
1. 在首页顶部栏
2. 点击 ☀️（太阳）或 🌙（月亮）图标
3. 立即切换主题

### 方法 2：设置页面
1. 进入"设置"页面
2. 找到"外观设置"
3. 切换"暗黑模式"开关

---

## 💾 状态持久化

主题选择会自动保存到 `localStorage`：
- 键名: `darkMode`
- 值: `true`（深色）或 `false`（浅色）
- 刷新页面后自动恢复上次选择

---

## 🎯 技术实现

### Hook: useDarkMode
```typescript
// src/hooks/useDarkMode.ts
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true; // 默认深色
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  return [isDark, setIsDark] as const;
}
```

### 使用示例
```typescript
import { useDarkMode } from '../hooks/useDarkMode';

function MyComponent() {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <div className={isDark ? 'bg-gray-900' : 'bg-white'}>
      <button onClick={() => setIsDark(!isDark)}>
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
```

---

## 🎨 主题样式指南

### 条件类名
```typescript
// 背景色
className={isDark ? 'bg-gray-900' : 'bg-white'}

// 文字颜色
className={isDark ? 'text-white' : 'text-gray-900'}

// 边框
className={isDark ? 'border-gray-700' : 'border-gray-200'}

// 悬停效果
className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
```

### 组合使用
```typescript
<div className={`p-4 rounded-lg ${
  isDark 
    ? 'bg-gray-800 text-white border-gray-700' 
    : 'bg-white text-gray-900 border-gray-200'
}`}>
  内容
</div>
```

---

## 📦 已适配的组件

### ✅ 已完成
- Layout（布局）
- Sidebar（侧边栏）
- HomePage（首页）
- WritePage（写作页）
- SettingsPage（设置页）
- MoodSelector（心情选择器）
- TagInput（标签输入）
- ImageUploader（图片上传）

### 🔄 待优化
- DiaryDetailPage（详情页）
- MarkdownPreview（Markdown 预览）
- 其他辅助组件

---

## 🐛 故障排查

### 问题 1：切换后没有变化
**原因**: 组件没有使用 `isDark` 状态  
**解决**: 确保组件导入并使用 `useDarkMode` Hook

```typescript
import { useDarkMode } from '../hooks/useDarkMode';

function MyComponent() {
  const [isDark] = useDarkMode(); // 添加这行
  // 使用 isDark 变量
}
```

### 问题 2：刷新后主题重置
**原因**: localStorage 没有正确保存  
**解决**: 检查浏览器控制台是否有错误

### 问题 3：部分元素没有适配
**原因**: 该元素使用了固定的颜色类名  
**解决**: 将固定类名改为条件类名

```typescript
// ❌ 错误
<div className="bg-gray-900 text-white">

// ✅ 正确
<div className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
```

---

## 🔮 未来优化

### 1. 自动切换
根据系统主题自动切换：
```typescript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

### 2. 更多主题
- 蓝色主题
- 绿色主题
- 自定义主题

### 3. 平滑过渡
添加主题切换动画：
```css
* {
  transition: background-color 0.3s, color 0.3s;
}
```

### 4. 主题预览
在设置页面显示主题预览卡片

---

## 📝 总结

主题切换功能已完成：

✅ **深色/浅色模式**  
✅ **状态持久化**  
✅ **快速切换按钮**  
✅ **全局适配**  
✅ **用户友好**  

现在用户可以根据环境和喜好自由切换主题了！🌓✨
