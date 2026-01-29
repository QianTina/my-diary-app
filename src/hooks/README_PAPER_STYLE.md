# 纸张样式继承 Hook

## 概述

`usePaperStyle` Hook 实现了纸质风格日记本的纸张样式继承逻辑。它根据条目和日记本的配置，自动解析出应该使用的有效纸张样式。

## 核心概念

### 纸张样式继承规则

1. **条目覆盖优先**（属性 11）：如果条目有显式的 `paperStyle` 值，使用条目的样式
2. **日记本默认**（属性 10）：如果条目没有覆盖，使用日记本的默认 `paperStyle`
3. **系统默认**：如果都没有，回退到 `'blank'` 空白样式

### 可用的纸张样式

- `blank` - 空白
- `lined` - 横线
- `grid` - 方格
- `dotted` - 点阵
- `vintage` - 复古

## API

### `usePaperStyle(entry?, notebook?)`

解析条目的有效纸张样式。

**参数：**
- `entry?: DiaryEntry | null` - 日记条目（可选）
- `notebook?: Notebook | null` - 所属日记本（可选）

**返回：**
- `PaperStyle` - 有效的纸张样式

**示例：**

```typescript
import { usePaperStyle } from './hooks/usePaperStyle';

function EntryCard({ entry, notebook }) {
  const paperStyle = usePaperStyle(entry, notebook);
  
  return (
    <div className={`paper-${paperStyle}`}>
      {entry.content}
    </div>
  );
}
```

### `useFontSettings(notebook?)`

解析日记本的有效字体设置。

**参数：**
- `notebook?: Notebook | null` - 日记本（可选）

**返回：**
- `{ fontFamily: string, fontSize: number, lineHeight: number }`

**示例：**

```typescript
import { useFontSettings, getFontFamilyCSS } from './hooks/usePaperStyle';

function EntryContent({ notebook }) {
  const { fontFamily, fontSize, lineHeight } = useFontSettings(notebook);
  
  return (
    <div style={{
      fontFamily: getFontFamilyCSS(fontFamily),
      fontSize: `${fontSize}px`,
      lineHeight: lineHeight,
    }}>
      内容...
    </div>
  );
}
```

### `getPaperStyleClassName(paperStyle)`

获取纸张样式的 CSS 类名。

**参数：**
- `paperStyle: PaperStyle` - 纸张样式

**返回：**
- `string` - CSS 类名（例如：`'paper-style-lined'`）

### `getFontFamilyCSS(fontFamily)`

获取字体系列的 CSS 值。

**参数：**
- `fontFamily: string` - 字体系列名称

**返回：**
- `string` - CSS font-family 值

## 使用场景

### 场景 1：条目卡片

在条目卡片中显示正确的纸张样式：

```typescript
function EntryCard({ entry, notebook }) {
  const paperStyle = usePaperStyle(entry, notebook);
  const fontSettings = useFontSettings(notebook);
  
  return (
    <div 
      className={getPaperStyleClassName(paperStyle)}
      style={{
        fontFamily: getFontFamilyCSS(fontSettings.fontFamily),
        fontSize: `${fontSettings.fontSize}px`,
        lineHeight: fontSettings.lineHeight,
      }}
    >
      <h3>{entry.title}</h3>
      <p>{entry.content}</p>
    </div>
  );
}
```

### 场景 2：页面渲染

在页面组件中使用纸张样式：

```typescript
function Page({ entry, notebook }) {
  const paperStyle = usePaperStyle(entry, notebook);
  
  return (
    <div className={`page ${getPaperStyleClassName(paperStyle)}`}>
      {/* 页面内容 */}
    </div>
  );
}
```

### 场景 3：空白页

渲染没有条目的空白页：

```typescript
function EmptyPage({ notebook }) {
  // 没有条目时，使用日记本的默认样式
  const paperStyle = usePaperStyle(undefined, notebook);
  
  return (
    <div className={getPaperStyleClassName(paperStyle)}>
      <p>空白页</p>
    </div>
  );
}
```

## 继承行为示例

### 示例 1：条目有覆盖样式

```typescript
const notebook = {
  paperStyle: 'lined', // 日记本默认：横线
  // ...
};

const entry = {
  paperStyle: 'vintage', // 条目覆盖：复古
  // ...
};

const style = usePaperStyle(entry, notebook);
// 结果: 'vintage' ✓ 使用条目的覆盖样式
```

### 示例 2：条目没有覆盖样式

```typescript
const notebook = {
  paperStyle: 'lined', // 日记本默认：横线
  // ...
};

const entry = {
  // 没有 paperStyle 覆盖
  // ...
};

const style = usePaperStyle(entry, notebook);
// 结果: 'lined' ✓ 继承日记本的默认样式
```

### 示例 3：只有日记本

```typescript
const notebook = {
  paperStyle: 'grid', // 日记本默认：方格
  // ...
};

const style = usePaperStyle(undefined, notebook);
// 结果: 'grid' ✓ 使用日记本的默认样式
```

## 性能优化

Hook 使用 `useMemo` 进行记忆化，只在依赖项变化时重新计算：

```typescript
return useMemo(() => {
  // 计算逻辑
}, [entry?.paperStyle, notebook?.paperStyle]);
```

这确保了在条目或日记本样式没有变化时，不会触发不必要的重新渲染。

## 测试

Hook 的正确性由以下属性测试验证：

- **属性 10：纸张样式继承** - 验证条目继承日记本的默认样式
- **属性 11：纸张样式覆盖** - 验证条目可以覆盖日记本的默认样式

## 相关文件

- `src/hooks/usePaperStyle.ts` - Hook 实现
- `src/hooks/usePaperStyle.example.tsx` - 使用示例
- `src/types/notebook.ts` - 类型定义
- `src/components/notebook/PaperBackground.tsx` - 纸张背景组件
