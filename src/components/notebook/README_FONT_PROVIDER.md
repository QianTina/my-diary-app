# FontProvider 组件

## 概述

`FontProvider` 是一个 React Context Provider，用于管理和应用日记本的字体设置。它负责加载字体系列并将字体配置传递给子组件。

## 功能特性

- ✅ 加载多种字体系列（系统、手写、衬线、无衬线）
- ✅ 从日记本配置中提取字体设置
- ✅ 验证字体大小和行高范围
- ✅ 提供字体加载状态
- ✅ 支持嵌套 Provider（子级覆盖父级）
- ✅ 自动回退到默认设置

## 支持的字体系列

### 1. System（系统默认）
- CSS: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- 使用场景：日常记录、快速书写

### 2. Handwriting（手写风格）
- CSS: `"Caveat", "Dancing Script", cursive`
- 使用场景：个人日记、创意写作

### 3. Serif（衬线体）
- CSS: `"Merriweather", "Georgia", serif`
- 使用场景：正式文档、长篇阅读

### 4. Sans-Serif（无衬线体）
- CSS: `"Inter", "Helvetica Neue", sans-serif`
- 使用场景：现代风格、清晰易读

## 字体设置范围

### 字体大小（fontSize）
- 最小值：12px
- 最大值：24px
- 默认值：16px

### 行高（lineHeight）
- 最小值：1.2
- 最大值：2.0
- 默认值：1.5

## API

### FontProvider

Context Provider 组件，为子组件提供字体设置。

**Props:**
- `notebook?: Notebook | null` - 提供字体设置的日记本
- `children: React.ReactNode` - 子组件

**示例:**
```tsx
import { FontProvider } from './components/notebook/FontProvider';

function App() {
  return (
    <FontProvider notebook={activeNotebook}>
      <EntryContent />
    </FontProvider>
  );
}
```

### useFontContext()

获取完整的字体上下文，包括设置和加载状态。

**返回值:**
```typescript
{
  settings: {
    fontFamily: string;      // 字体系列名称
    fontSize: number;        // 字体大小（px）
    lineHeight: number;      // 行高
    fontFamilyCSS: string;   // CSS font-family 值
  };
  fontsLoaded: boolean;      // 字体是否已加载
}
```

**注意:** 必须在 `FontProvider` 内部使用，否则会抛出错误。

**示例:**
```tsx
import { useFontContext } from './components/notebook/FontProvider';

function EntryContent() {
  const { settings, fontsLoaded } = useFontContext();
  
  return (
    <div style={{
      fontFamily: settings.fontFamilyCSS,
      fontSize: `${settings.fontSize}px`,
      lineHeight: settings.lineHeight,
      opacity: fontsLoaded ? 1 : 0.5,
    }}>
      内容...
    </div>
  );
}
```

### useFontSettings()

便捷 Hook，仅获取字体设置。

**返回值:**
```typescript
{
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontFamilyCSS: string;
}
```

**注意:** 可以在 `FontProvider` 外部使用，会返回默认设置。

**示例:**
```tsx
import { useFontSettings } from './components/notebook/FontProvider';

function EntryCard() {
  const settings = useFontSettings();
  
  return (
    <div style={{
      fontFamily: settings.fontFamilyCSS,
      fontSize: `${settings.fontSize}px`,
      lineHeight: settings.lineHeight,
    }}>
      内容...
    </div>
  );
}
```

## 使用场景

### 场景 1: 基本使用

为整个日记本应用字体设置：

```tsx
function NotebookReader({ notebook }) {
  return (
    <FontProvider notebook={notebook}>
      <div className="notebook-reader">
        <EntryList />
        <EntryDetail />
      </div>
    </FontProvider>
  );
}
```

### 场景 2: 条目列表

在条目列表中应用统一字体：

```tsx
function EntryList() {
  const settings = useFontSettings();
  
  return (
    <div className="entry-list">
      {entries.map(entry => (
        <div
          key={entry.id}
          style={{
            fontFamily: settings.fontFamilyCSS,
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
          }}
        >
          {entry.title}
        </div>
      ))}
    </div>
  );
}
```

### 场景 3: 字体加载状态

显示字体加载状态：

```tsx
function EntryContent() {
  const { settings, fontsLoaded } = useFontContext();
  
  return (
    <div>
      {!fontsLoaded && (
        <div className="loading">字体加载中...</div>
      )}
      <div
        style={{
          fontFamily: settings.fontFamilyCSS,
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          opacity: fontsLoaded ? 1 : 0.5,
          transition: 'opacity 0.3s ease',
        }}
      >
        内容...
      </div>
    </div>
  );
}
```

### 场景 4: 嵌套 Provider

在特定区域覆盖字体设置：

```tsx
function NotebookPage() {
  return (
    <FontProvider notebook={mainNotebook}>
      <div className="main-content">
        {/* 使用主日记本的字体 */}
        <EntryContent />
        
        {/* 在侧边栏使用不同的字体 */}
        <FontProvider notebook={sidebarNotebook}>
          <Sidebar />
        </FontProvider>
      </div>
    </FontProvider>
  );
}
```

## 字体加载机制

FontProvider 使用以下策略加载字体：

1. **Google Fonts API**: 从 Google Fonts 加载 Web 字体
2. **本地字体**: 使用系统已安装的字体
3. **Font Face API**: 使用 `document.fonts` API 检测加载状态
4. **优雅降级**: 如果字体加载失败，自动回退到系统字体

### 加载流程

```
1. 组件挂载
   ↓
2. 检查 document.fonts API 支持
   ↓
3. 创建 FontFace 对象
   ↓
4. 并行加载所有字体
   ↓
5. 等待 document.fonts.ready
   ↓
6. 设置 fontsLoaded = true
```

## 性能优化

### 1. 记忆化

使用 `useMemo` 缓存字体设置：

```typescript
const settings = useMemo(() => ({
  fontFamily,
  fontSize,
  lineHeight,
  fontFamilyCSS,
}), [fontFamily, fontSize, lineHeight]);
```

### 2. 懒加载

字体在组件挂载时异步加载，不阻塞渲染。

### 3. 错误处理

字体加载失败时不会影响应用，自动使用回退字体。

## 验证和约束

### 字体大小验证

```typescript
function validateFontSize(size: number): number {
  return Math.max(12, Math.min(24, size));
}
```

### 行高验证

```typescript
function validateLineHeight(height: number): number {
  return Math.max(1.2, Math.min(2.0, height));
}
```

## 与其他组件集成

### 与 PaperBackground 集成

```tsx
function Page({ entry, notebook }) {
  return (
    <FontProvider notebook={notebook}>
      <div className="page">
        <PaperBackgroundWithInheritance 
          entry={entry}
          notebook={notebook}
        />
        <EntryContent entry={entry} />
      </div>
    </FontProvider>
  );
}
```

### 与 usePaperStyle 集成

```tsx
function EntryCard({ entry, notebook }) {
  const paperStyle = usePaperStyle(entry, notebook);
  const fontSettings = useFontSettings();
  
  return (
    <div
      className={`entry-card paper-${paperStyle}`}
      style={{
        fontFamily: fontSettings.fontFamilyCSS,
        fontSize: `${fontSettings.fontSize}px`,
        lineHeight: fontSettings.lineHeight,
      }}
    >
      {entry.content}
    </div>
  );
}
```

## 测试

### 单元测试示例

```typescript
import { render, screen } from '@testing-library/react';
import { FontProvider, useFontSettings } from './FontProvider';

test('provides default font settings', () => {
  function TestComponent() {
    const settings = useFontSettings();
    return <div>{settings.fontFamily}</div>;
  }
  
  render(
    <FontProvider>
      <TestComponent />
    </FontProvider>
  );
  
  expect(screen.getByText('system')).toBeInTheDocument();
});

test('applies notebook font settings', () => {
  const notebook = {
    fontFamily: 'serif',
    fontSize: 18,
    lineHeight: 1.6,
    // ...
  };
  
  function TestComponent() {
    const settings = useFontSettings();
    return (
      <div>
        {settings.fontFamily}-{settings.fontSize}-{settings.lineHeight}
      </div>
    );
  }
  
  render(
    <FontProvider notebook={notebook}>
      <TestComponent />
    </FontProvider>
  );
  
  expect(screen.getByText('serif-18-1.6')).toBeInTheDocument();
});
```

## 相关文件

- `src/components/notebook/FontProvider.tsx` - 组件实现
- `src/components/notebook/FontProvider.example.tsx` - 使用示例
- `src/types/notebook.ts` - 类型定义
- `src/hooks/usePaperStyle.ts` - 纸张样式 Hook

## 需求验证

此组件实现了以下需求：

- **需求 4.1**: 提供至少四种字体系列类别
- **需求 4.2**: 将日记本的字体设置应用于所有条目

## 属性验证

此组件支持以下属性的验证：

- **属性 13**: 字体设置继承 - 条目继承日记本的字体设置
