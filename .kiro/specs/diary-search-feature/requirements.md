# 需求文档

## 简介

本文档定义了"Tina's Log"日记应用的搜索功能需求。该功能允许用户通过关键词、标签、心情和日期范围搜索和过滤他们的日记条目，提供实时搜索结果、搜索历史记录和高级过滤选项。

## 术语表

- **Search_System**: 负责处理搜索查询、过滤和结果显示的系统组件
- **User**: 使用日记应用的已认证用户
- **Diary_Entry**: 包含标题、内容、标签、心情、位置、天气和图片的日记条目
- **Search_Query**: 用户输入的搜索文本
- **Filter**: 用于缩小搜索结果范围的条件（标签、心情、日期范围）
- **Search_History**: 存储在本地存储中的最近搜索记录
- **Search_Result**: 匹配搜索条件的日记条目
- **Full_Text_Search**: 在日记标题和内容中搜索关键词的功能
- **Tag_Filter**: 按一个或多个标签过滤条目的功能
- **Mood_Filter**: 按心情状态过滤条目的功能
- **Date_Range_Filter**: 按起始和结束日期过滤条目的功能
- **Debounce**: 延迟搜索执行直到用户停止输入的技术（300毫秒）
- **Highlight**: 在搜索结果中视觉标记匹配的搜索词
- **Advanced_Filter_Panel**: 包含所有过滤选项的可折叠UI面板
- **Search_Page**: 位于/search路由的专用搜索界面组件

## 需求

### 需求 1: 全文搜索

**用户故事:** 作为用户，我想通过关键词搜索我的日记条目，以便快速找到特定的记忆。

#### 验收标准

1. WHEN 用户在搜索栏中输入文本 THEN THE Search_System SHALL 在日记标题和内容中搜索匹配的关键词
2. WHEN 搜索查询包含多个词 THEN THE Search_System SHALL 返回包含任一词的条目
3. WHEN 搜索查询为空 THEN THE Search_System SHALL 显示所有日记条目
4. WHEN 用户输入搜索文本 THEN THE Search_System SHALL 在用户停止输入后300毫秒执行搜索（防抖）
5. WHEN 搜索执行时 THEN THE Search_System SHALL 仅返回属于当前已认证用户的条目

### 需求 2: 标签过滤

**用户故事:** 作为用户，我想按标签过滤，以便找到关于特定主题的条目。

#### 验收标准

1. WHEN 用户选择一个或多个标签 THEN THE Search_System SHALL 仅显示包含所有选定标签的条目
2. WHEN 用户取消选择标签 THEN THE Search_System SHALL 更新结果以排除该标签过滤器
3. WHEN 没有选择标签 THEN THE Search_System SHALL 不应用标签过滤
4. WHEN 标签被选择 THEN THE Search_System SHALL 将选定的标签显示为可移除的标签芯片
5. WHEN 用户点击标签芯片的移除按钮 THEN THE Search_System SHALL 从过滤器中移除该标签并更新结果

### 需求 3: 心情过滤

**用户故事:** 作为用户，我想按心情过滤，以便查看特定情绪状态的条目。

#### 验收标准

1. WHEN 用户选择心情（开心、平静、中性、悲伤、愤怒）THEN THE Search_System SHALL 仅显示具有该心情的条目
2. WHEN 用户取消选择心情 THEN THE Search_System SHALL 移除心情过滤并更新结果
3. WHEN 没有选择心情 THEN THE Search_System SHALL 不应用心情过滤
4. THE Search_System SHALL 一次仅允许选择一个心情过滤器

### 需求 4: 日期范围过滤

**用户故事:** 作为用户，我想按日期范围过滤，以便找到特定时间段的条目。

#### 验收标准

1. WHEN 用户设置起始日期 THEN THE Search_System SHALL 仅显示在该日期或之后创建的条目
2. WHEN 用户设置结束日期 THEN THE Search_System SHALL 仅显示在该日期或之前创建的条目
3. WHEN 用户同时设置起始和结束日期 THEN THE Search_System SHALL 显示在该日期范围内的条目
4. WHEN 起始日期晚于结束日期 THEN THE Search_System SHALL 显示验证错误并阻止搜索
5. WHEN 没有设置日期过滤器 THEN THE Search_System SHALL 不应用日期范围过滤

### 需求 5: 实时搜索结果

**用户故事:** 作为用户，我想实时看到搜索结果，以便获得即时反馈。

#### 验收标准

1. WHEN 用户修改搜索查询或过滤器 THEN THE Search_System SHALL 在300毫秒防抖后自动更新结果
2. WHEN 搜索正在执行时 THEN THE Search_System SHALL 显示加载指示器
3. WHEN 搜索完成时 THEN THE Search_System SHALL 隐藏加载指示器并显示结果
4. WHEN 搜索结果更新时 THEN THE Search_System SHALL 保持用户的滚动位置（如果可能）
5. THE Search_System SHALL 在结果列表上方显示找到的条目总数

### 需求 6: 搜索历史

**用户故事:** 作为用户，我想看到我最近的搜索，以便快速重复常见搜索。

#### 验收标准

1. WHEN 用户执行搜索 THEN THE Search_System SHALL 将搜索查询保存到本地存储
2. WHEN 用户聚焦搜索栏 THEN THE Search_System SHALL 显示最近10次搜索的下拉列表
3. WHEN 用户点击搜索历史项 THEN THE Search_System SHALL 填充搜索栏并执行该搜索
4. WHEN 搜索历史超过10项 THEN THE Search_System SHALL 移除最旧的条目
5. WHEN 用户执行重复搜索 THEN THE Search_System SHALL 将其移至历史记录顶部而不是创建重复项
6. THE Search_System SHALL 将搜索历史存储在localStorage中，键名为特定于用户的

### 需求 7: 高级搜索选项

**用户故事:** 作为用户，我想访问高级搜索选项，以便进行更精确的搜索。

#### 验收标准

1. THE Search_System SHALL 提供一个可折叠的高级过滤器面板
2. WHEN 用户点击高级过滤器切换按钮 THEN THE Search_System SHALL 展开或折叠高级过滤器面板
3. WHEN 高级过滤器面板展开时 THEN THE Search_System SHALL 显示标签、心情和日期范围过滤器
4. WHEN 高级过滤器面板折叠时 THEN THE Search_System SHALL 隐藏过滤器选项但保留活动过滤器
5. THE Search_System SHALL 在高级过滤器切换按钮上显示活动过滤器的计数

### 需求 8: 搜索结果显示

**用户故事:** 作为用户，我想看到带有高亮显示的搜索结果，以便快速识别匹配项。

#### 验收标准

1. WHEN 显示搜索结果时 THEN THE Search_System SHALL 将每个结果显示为卡片，包含标题、内容预览、日期、标签和心情
2. WHEN 搜索查询不为空时 THEN THE Search_System SHALL 在结果标题和内容中高亮显示匹配的搜索词
3. WHEN 用户点击搜索结果卡片 THEN THE Search_System SHALL 导航到该日记条目的详细视图
4. WHEN 内容超过预览长度时 THEN THE Search_System SHALL 截断内容并显示省略号
5. THE Search_System SHALL 按日期降序显示搜索结果（最新的在前）

### 需求 9: 空状态处理

**用户故事:** 作为用户，当没有找到结果时，我想看到有用的消息，以便了解发生了什么。

#### 验收标准

1. WHEN 搜索返回零结果 THEN THE Search_System SHALL 显示空状态消息
2. WHEN 显示空状态时 THEN THE Search_System SHALL 提供有用的建议（例如"尝试不同的关键词"或"清除过滤器"）
3. WHEN 用户没有任何日记条目时 THEN THE Search_System SHALL 显示不同的空状态消息，鼓励他们创建第一个条目
4. THE Search_System SHALL 在空状态中包含清除所有过滤器的按钮

### 需求 10: 清除过滤器

**用户故事:** 作为用户，我想一次清除所有过滤器，以便开始新的搜索。

#### 验收标准

1. THE Search_System SHALL 提供"清除所有过滤器"按钮
2. WHEN 用户点击"清除所有过滤器"按钮 THEN THE Search_System SHALL 移除所有活动过滤器（搜索查询、标签、心情、日期范围）
3. WHEN 所有过滤器被清除时 THEN THE Search_System SHALL 显示所有日记条目
4. WHEN 没有活动过滤器时 THEN THE Search_System SHALL 禁用或隐藏"清除所有过滤器"按钮
5. WHEN 过滤器被清除时 THEN THE Search_System SHALL 清空搜索输入栏

### 需求 11: 键盘快捷键

**用户故事:** 作为用户，我想使用键盘快捷键打开搜索，以便快速访问搜索功能。

#### 验收标准

1. WHEN 用户按下Cmd+K（Mac）或Ctrl+K（Windows/Linux）THEN THE Search_System SHALL 导航到搜索页面
2. WHEN 搜索页面打开时 THEN THE Search_System SHALL 自动聚焦搜索输入栏
3. WHEN 用户在搜索输入栏中按下Escape键 THEN THE Search_System SHALL 清除搜索输入
4. WHEN 用户在搜索结果中按下向上/向下箭头键 THEN THE Search_System SHALL 在结果之间导航
5. WHEN 用户在搜索结果上按下Enter键 THEN THE Search_System SHALL 打开选定的日记条目

### 需求 12: 响应式设计

**用户故事:** 作为用户，我想在移动设备和桌面设备上使用搜索功能，以便在任何设备上访问我的日记。

#### 验收标准

1. WHEN 在移动设备上查看时 THEN THE Search_System SHALL 调整布局以适应较小的屏幕
2. WHEN 在移动设备上时 THEN THE Search_System SHALL 将高级过滤器显示为全屏模态或底部抽屉
3. WHEN 在桌面设备上时 THEN THE Search_System SHALL 将高级过滤器显示为内联可折叠面板
4. WHEN 在任何设备上时 THEN THE Search_System SHALL 确保所有交互元素都足够大以便触摸
5. THE Search_System SHALL 在所有屏幕尺寸上保持可读性和可用性

### 需求 13: 主题支持

**用户故事:** 作为用户，我想让搜索界面遵循我的主题偏好，以便获得一致的视觉体验。

#### 验收标准

1. WHEN 用户启用深色主题时 THEN THE Search_System SHALL 使用深色主题颜色和样式
2. WHEN 用户启用浅色主题时 THEN THE Search_System SHALL 使用浅色主题颜色和样式
3. WHEN 主题更改时 THEN THE Search_System SHALL 立即更新所有搜索UI组件
4. THE Search_System SHALL 确保搜索高亮在两种主题中都清晰可见
5. THE Search_System SHALL 对所有搜索UI元素使用应用的主题颜色变量

### 需求 14: 无障碍访问

**用户故事:** 作为使用辅助技术的用户，我想访问搜索功能，以便我可以独立搜索我的日记。

#### 验收标准

1. THE Search_System SHALL 为所有交互元素提供适当的ARIA标签
2. THE Search_System SHALL 确保所有功能都可以通过键盘访问
3. WHEN 搜索结果更新时 THEN THE Search_System SHALL 使用ARIA实时区域宣布结果计数
4. THE Search_System SHALL 为过滤器控件提供清晰的标签和说明
5. THE Search_System SHALL 在所有文本和背景之间保持足够的颜色对比度（WCAG AA标准）
6. THE Search_System SHALL 为图标按钮提供可访问的名称和工具提示

### 需求 15: 性能优化

**用户故事:** 作为用户，我想要快速的搜索响应，以便获得流畅的搜索体验。

#### 验收标准

1. WHEN 用户输入搜索查询时 THEN THE Search_System SHALL 使用300毫秒防抖延迟搜索执行
2. WHEN 搜索大量条目时 THEN THE Search_System SHALL 在500毫秒内返回结果
3. WHEN 渲染搜索结果时 THEN THE Search_System SHALL 使用虚拟化或分页来处理大型结果集（超过100项）
4. THE Search_System SHALL 缓存搜索结果以避免重复查询
5. THE Search_System SHALL 优化Supabase查询以最小化数据传输

### 需求 16: 数据安全

**用户故事:** 作为用户，我想确保我的搜索只返回我自己的日记条目，以便保护我的隐私。

#### 验收标准

1. THE Search_System SHALL 仅搜索属于当前已认证用户的日记条目
2. WHEN 执行搜索查询时 THEN THE Search_System SHALL 在Supabase查询中包含用户ID过滤器
3. THE Search_System SHALL 依赖Supabase行级安全（RLS）策略来强制执行数据隔离
4. WHEN 用户未认证时 THEN THE Search_System SHALL 重定向到登录页面
5. THE Search_System SHALL 不在URL参数或浏览器历史记录中暴露敏感搜索数据
