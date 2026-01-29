# UIStore 使用指南

UIStore 是纸质风格日记本功能的 UI 状态管理 store，使用 Zustand 实现。它管理视图模式、分页状态、UI 切换和用户偏好设置。

## 功能特性

- ✅ 视图模式管理（列表、网格、阅读器）
- ✅ 页面导航（上一页、下一页、跳转到指定页）
- ✅ UI 切换（目录、书签面板）
- ✅ 环境音效设置
- ✅ 无障碍偏好设置（减少动画、高对比度）
- ✅ localStorage 持久化

## 基本使用

### 导入 Store

```typescript
import { useUIStore } from '../store/uiStore';
```

### 在组件中使用

```typescript
function NotebookReader() {
  // 获取状态和操作
  const viewMode = useUIStore((state) => state.viewMode);
  const paginationState = useUIStore((state) => state.paginationState);
  const navigateNext = useUIStore((state) => state.navigateNext);
  const navigatePrevious = useUIStore((state) => state.navigatePrevious);
  
  return (
    <div>
      <p>当前页: {paginationState.currentPage} / {paginationState.totalPages}</p>
      <button onClick={navigatePrevious}>上一页</button>
      <button onClick={navigateNext}>下一页</button>
    </div>
  );
}
```

## API 参考

### 状态

| 属性 | 类型 | 描述 |
|------|------|------|
| `viewMode` | `'list' \| 'grid' \| 'reader'` | 当前视图模式 |
| `paginationState` | `PaginationState` | 分页状态 |
| `showTableOfContents` | `boolean` | 是否显示目录 |
| `showBookmarks` | `boolean` | 是否显示书签面板 |
| `ambientSoundEnabled` | `boolean` | 是否启用环境音效 |
| `ambientSoundVolume` | `number` | 环境音效音量 (0-1) |
| `reduceMotion` | `boolean` | 是否启用减少动画模式 |
| `highContrast` | `boolean` | 是否启用高对比度模式 |

### 操作方法

#### setViewMode(mode)

设置视图模式并持久化到 localStorage。

```typescript
const setViewMode = useUIStore((state) => state.setViewMode);
setViewMode('reader'); // 切换到阅读器视图
```

#### navigateToPage(pageNumber)

导航到指定页面。会自动验证页码范围并更新加载范围。

```typescript
const navigateToPage = useUIStore((state) => state.navigateToPage);
navigateToPage(5); // 跳转到第 5 页
```

#### navigateNext()

导航到下一页。如果已经是最后一页，则不执行任何操作。

```typescript
const navigateNext = useUIStore((state) => state.navigateNext);
navigateNext();
```

#### navigatePrevious()

导航到上一页。如果已经是第一页，则不执行任何操作。

```typescript
const navigatePrevious = useUIStore((state) => state.navigatePrevious);
navigatePrevious();
```

#### jumpToDate(date)

跳转到指定日期的条目。

**注意**: 此方法需要与 EntryStore 配合使用。在实际使用时，组件应该：
1. 从 EntryStore 获取条目列表
2. 找到匹配日期的条目
3. 计算该条目所在的页码
4. 调用 `navigateToPage(pageNumber)`

```typescript
const jumpToDate = useUIStore((state) => state.jumpToDate);
jumpToDate(new Date('2024-01-15'));
```

#### toggleTableOfContents()

切换目录显示状态。打开目录时会自动关闭书签面板。

```typescript
const toggleTableOfContents = useUIStore((state) => state.toggleTableOfContents);
toggleTableOfContents();
```

#### toggleBookmarks()

切换书签面板显示状态。打开书签面板时会自动关闭目录。

```typescript
const toggleBookmarks = useUIStore((state) => state.toggleBookmarks);
toggleBookmarks();
```

#### setAmbientSound(enabled, volume?)

设置环境音效。音量会自动限制在 0-1 范围内。

```typescript
const setAmbientSound = useUIStore((state) => state.setAmbientSound);

// 启用环境音效
setAmbientSound(true);

// 启用环境音效并设置音量
setAmbientSound(true, 0.7);

// 禁用环境音效（不改变音量）
setAmbientSound(false);
```

#### setAccessibilityPreference(key, value)

设置无障碍偏好。支持的键：`'reduceMotion'`、`'highContrast'`。

```typescript
const setAccessibilityPreference = useUIStore((state) => state.setAccessibilityPreference);

// 启用减少动画模式
setAccessibilityPreference('reduceMotion', true);

// 启用高对比度模式
setAccessibilityPreference('highContrast', true);
```

#### loadPreferences()

从 localStorage 加载所有用户偏好设置。通常在应用启动时调用。

```typescript
const loadPreferences = useUIStore((state) => state.loadPreferences);
loadPreferences();
```

#### savePreferences()

将当前所有偏好设置保存到 localStorage。

```typescript
const savePreferences = useUIStore((state) => state.savePreferences);
savePreferences();
```

## 使用示例

### 示例 1: 页面导航控件

```typescript
function PageNavigation() {
  const { currentPage, totalPages } = useUIStore((state) => state.paginationState);
  const navigateNext = useUIStore((state) => state.navigateNext);
  const navigatePrevious = useUIStore((state) => state.navigatePrevious);
  const navigateToPage = useUIStore((state) => state.navigateToPage);
  
  return (
    <div className="page-navigation">
      <button 
        onClick={navigatePrevious}
        disabled={currentPage === 1}
      >
        上一页
      </button>
      
      <span>第 {currentPage} 页 / 共 {totalPages} 页</span>
      
      <button 
        onClick={navigateNext}
        disabled={currentPage === totalPages}
      >
        下一页
      </button>
      
      <input
        type="number"
        min={1}
        max={totalPages}
        value={currentPage}
        onChange={(e) => navigateToPage(Number(e.target.value))}
      />
    </div>
  );
}
```

### 示例 2: 侧边栏切换

```typescript
function Sidebar() {
  const showTableOfContents = useUIStore((state) => state.showTableOfContents);
  const showBookmarks = useUIStore((state) => state.showBookmarks);
  const toggleTableOfContents = useUIStore((state) => state.toggleTableOfContents);
  const toggleBookmarks = useUIStore((state) => state.toggleBookmarks);
  
  return (
    <div className="sidebar">
      <button onClick={toggleTableOfContents}>
        {showTableOfContents ? '关闭' : '打开'}目录
      </button>
      
      <button onClick={toggleBookmarks}>
        {showBookmarks ? '关闭' : '打开'}书签
      </button>
      
      {showTableOfContents && <TableOfContents />}
      {showBookmarks && <BookmarkPanel />}
    </div>
  );
}
```

### 示例 3: 环境音效控制

```typescript
function AmbientSoundControl() {
  const ambientSoundEnabled = useUIStore((state) => state.ambientSoundEnabled);
  const ambientSoundVolume = useUIStore((state) => state.ambientSoundVolume);
  const setAmbientSound = useUIStore((state) => state.setAmbientSound);
  
  return (
    <div className="ambient-sound-control">
      <label>
        <input
          type="checkbox"
          checked={ambientSoundEnabled}
          onChange={(e) => setAmbientSound(e.target.checked)}
        />
        启用环境音效
      </label>
      
      {ambientSoundEnabled && (
        <label>
          音量:
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={ambientSoundVolume}
            onChange={(e) => setAmbientSound(true, Number(e.target.value))}
          />
          {Math.round(ambientSoundVolume * 100)}%
        </label>
      )}
    </div>
  );
}
```

### 示例 4: 无障碍设置

```typescript
function AccessibilitySettings() {
  const reduceMotion = useUIStore((state) => state.reduceMotion);
  const highContrast = useUIStore((state) => state.highContrast);
  const setAccessibilityPreference = useUIStore((state) => state.setAccessibilityPreference);
  
  return (
    <div className="accessibility-settings">
      <h3>无障碍设置</h3>
      
      <label>
        <input
          type="checkbox"
          checked={reduceMotion}
          onChange={(e) => setAccessibilityPreference('reduceMotion', e.target.checked)}
        />
        减少动画
      </label>
      
      <label>
        <input
          type="checkbox"
          checked={highContrast}
          onChange={(e) => setAccessibilityPreference('highContrast', e.target.checked)}
        />
        高对比度模式
      </label>
    </div>
  );
}
```

### 示例 5: 应用启动时加载偏好设置

```typescript
function App() {
  const loadPreferences = useUIStore((state) => state.loadPreferences);
  
  useEffect(() => {
    // 应用启动时加载用户偏好设置
    loadPreferences();
  }, [loadPreferences]);
  
  return (
    <div className="app">
      {/* 应用内容 */}
    </div>
  );
}
```

## localStorage 键名

UIStore 使用以下 localStorage 键名来持久化用户偏好设置：

- `paper-diary-ui-view-mode`: 视图模式
- `paper-diary-ui-ambient-sound-enabled`: 环境音效启用状态
- `paper-diary-ui-ambient-sound-volume`: 环境音效音量
- `paper-diary-ui-reduce-motion`: 减少动画模式
- `paper-diary-ui-high-contrast`: 高对比度模式

## 注意事项

1. **页面导航**: `navigateToPage` 会自动验证页码范围，无效的页码会被忽略并在控制台输出警告。

2. **侧边栏互斥**: 目录和书签面板是互斥的，打开一个会自动关闭另一个。

3. **音量范围**: 环境音效音量会自动限制在 0-1 范围内。

4. **jumpToDate 实现**: `jumpToDate` 方法需要在组件层面结合 EntryStore 使用，因为它需要访问条目数据来确定日期对应的页码。

5. **localStorage 错误处理**: 所有 localStorage 操作都有错误处理，如果读写失败会在控制台输出错误信息但不会中断应用运行。

6. **初始化**: 建议在应用启动时调用 `loadPreferences()` 来加载用户的偏好设置。

## 测试

UIStore 包含完整的单元测试，覆盖所有功能：

```bash
npm test -- src/store/uiStore.test.ts
```

测试覆盖：
- ✅ 视图模式设置和持久化
- ✅ 页面导航（包括边界情况）
- ✅ UI 切换（目录、书签）
- ✅ 环境音效设置
- ✅ 无障碍偏好设置
- ✅ localStorage 加载和保存

## 相关文件

- `src/store/uiStore.ts`: UIStore 实现
- `src/store/uiStore.test.ts`: UIStore 单元测试
- `src/types/notebook-stores.ts`: UIStore 接口定义
- `src/types/notebook.ts`: 相关类型定义
