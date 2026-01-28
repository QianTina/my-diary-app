# 需求文档

## 简介

日历视图功能为"Tina's Log"日记应用提供月度日历展示，让用户能够可视化他们的日记写作模式。该功能类似于GitHub的贡献图，通过颜色强度显示每日日记条目数量，并在日历单元格上叠加心情图标。用户可以导航不同月份，点击日期查看该日的日记条目，并查看月度统计信息。

## 术语表

- **Calendar_View**: 以月度日历格式显示日记条目的用户界面组件
- **Entry_Indicator**: 日历单元格上的视觉标记，表示该日存在日记条目
- **Mood_Icon**: 在日历单元格上显示的表情符号，代表日记条目的心情
- **Entry_Count**: 特定日期的日记条目总数
- **Color_Intensity**: 基于条目数量的视觉强度级别（0条、1条、2-3条、4+条）
- **Monthly_Statistics**: 当前月份的聚合数据（总条目数、连续天数、心情分布）
- **Date_Selection**: 用户点击日历日期以查看该日条目的操作
- **Month_Navigation**: 在不同月份之间切换的功能
- **Streak_Days**: 连续写日记的天数
- **Entry_Modal**: 显示选定日期日记条目的弹窗或侧边面板

## 需求

### 需求 1: 月度日历显示

**用户故事:** 作为用户，我想看到月度日历视图，以便可视化我的日记写作模式

#### 验收标准

1. THE Calendar_View SHALL 显示当前月份的日历网格，包含7列（星期日到星期六）
2. WHEN 日历加载时，THE Calendar_View SHALL 显示当前月份和年份
3. THE Calendar_View SHALL 在日历网格中正确显示每个月的所有日期
4. THE Calendar_View SHALL 标记属于上个月或下个月的日期为不同样式
5. THE Calendar_View SHALL 突出显示今天的日期
6. THE Calendar_View SHALL 在深色和浅色主题下正确渲染

### 需求 2: 条目可视化指示器

**用户故事:** 作为用户，我想看到哪些日期有日记条目，以便追踪我的写作一致性

#### 验收标准

1. WHEN 某日期存在日记条目时，THE Calendar_View SHALL 在该日期单元格上显示视觉指示器
2. THE Calendar_View SHALL 根据Entry_Count使用不同的Color_Intensity级别：
   - 0条条目：无颜色/默认背景
   - 1条条目：浅色强度
   - 2-3条条目：中等强度
   - 4条或以上条目：深色强度
3. THE Calendar_View SHALL 在用户悬停在日期单元格上时显示Entry_Count
4. THE Calendar_View SHALL 确保颜色强度在深色和浅色主题下都清晰可见

### 需求 3: 心情指示器

**用户故事:** 作为用户，我想在日历上看到心情指示器，以便快速识别情绪模式

#### 验收标准

1. WHEN 某日期的日记条目包含心情数据时，THE Calendar_View SHALL 在该日期单元格上显示Mood_Icon
2. WHEN 某日期有多条条目且心情不同时，THE Calendar_View SHALL 显示最常见的心情或最近的心情
3. THE Mood_Icon SHALL 清晰可见且不遮挡日期数字
4. THE Calendar_View SHALL 在悬停时显示心情标签文本

### 需求 4: 日期选择和条目查看

**用户故事:** 作为用户，我想点击日期查看该日的条目，以便快速访问特定日期的日记

#### 验收标准

1. WHEN 用户点击日历日期时，THE Calendar_View SHALL 触发Date_Selection事件
2. WHEN Date_Selection发生时，THE Calendar_View SHALL 显示Entry_Modal展示该日期的所有日记条目
3. THE Entry_Modal SHALL 显示每条日记的标题、摘要、心情、标签和创建时间
4. THE Entry_Modal SHALL 提供链接以查看完整的日记条目
5. WHEN 用户点击Entry_Modal外部或关闭按钮时，THE Calendar_View SHALL 关闭Entry_Modal
6. WHEN 选定日期没有条目时，THE Entry_Modal SHALL 显示空状态消息并提供"写日记"按钮

### 需求 5: 月份导航

**用户故事:** 作为用户，我想在不同月份之间导航，以便查看过去的日记条目

#### 验收标准

1. THE Calendar_View SHALL 提供"上个月"和"下个月"导航按钮
2. WHEN 用户点击"上个月"按钮时，THE Calendar_View SHALL 显示前一个月的日历
3. WHEN 用户点击"下个月"按钮时，THE Calendar_View SHALL 显示下一个月的日历
4. THE Calendar_View SHALL 在月份变化时更新月份/年份标题
5. THE Calendar_View SHALL 在月份变化时重新加载该月的日记数据
6. THE Calendar_View SHALL 在导航期间显示加载状态

### 需求 6: 快速跳转到今天

**用户故事:** 作为用户，我想快速跳转到今天，以便查看最近的条目

#### 验收标准

1. THE Calendar_View SHALL 提供"今天"按钮
2. WHEN 用户点击"今天"按钮时，THE Calendar_View SHALL 导航到当前月份
3. WHEN 导航到当前月份时，THE Calendar_View SHALL 突出显示今天的日期
4. WHEN 当前已显示当前月份时，THE "今天"按钮 SHALL 被禁用或视觉上指示

### 需求 7: 月度统计

**用户故事:** 作为用户，我想看到月度统计信息，以便了解我的写作习惯

#### 验收标准

1. THE Calendar_View SHALL 显示Monthly_Statistics面板，包含以下信息：
   - 当前月份的总条目数
   - 当前月份的Streak_Days（连续写作天数）
   - 心情分布（每种心情的条目数量或百分比）
2. THE Monthly_Statistics SHALL 在月份变化时自动更新
3. THE Monthly_Statistics SHALL 以清晰易读的格式显示数据
4. THE Monthly_Statistics SHALL 使用图标和颜色增强可读性

### 需求 8: 响应式设计

**用户故事:** 作为用户，我想在移动设备上使用日历，以便随时随地查看我的日记模式

#### 验收标准

1. THE Calendar_View SHALL 在移动设备（屏幕宽度 < 768px）上正确渲染
2. WHEN 在移动设备上显示时，THE Calendar_View SHALL 调整日历网格大小以适应屏幕
3. WHEN 在移动设备上显示时，THE Monthly_Statistics SHALL 移动到日历下方或折叠
4. THE Calendar_View SHALL 在移动设备上支持触摸交互
5. THE Entry_Modal SHALL 在移动设备上以全屏或底部抽屉形式显示
6. THE Calendar_View SHALL 在平板设备（768px - 1024px）上优化布局

### 需求 9: 数据加载和性能

**用户故事:** 作为用户，我想快速加载日历视图，以便不等待即可查看我的日记模式

#### 验收标准

1. WHEN Calendar_View首次加载时，THE 系统 SHALL 从Supabase获取当前月份的日记数据
2. THE 系统 SHALL 按日期聚合日记数据以计算Entry_Count
3. THE Calendar_View SHALL 在数据加载期间显示加载状态
4. WHEN 数据加载失败时，THE Calendar_View SHALL 显示错误消息并提供重试选项
5. THE 系统 SHALL 缓存已加载月份的数据以提高性能
6. THE 系统 SHALL 仅在月份变化时获取新数据

### 需求 10: 可访问性

**用户故事:** 作为使用辅助技术的用户，我想能够导航和使用日历视图，以便访问我的日记数据

#### 验收标准

1. THE Calendar_View SHALL 为所有交互元素提供适当的ARIA标签
2. THE Calendar_View SHALL 支持键盘导航（Tab、Enter、箭头键）
3. WHEN 用户使用键盘导航时，THE Calendar_View SHALL 显示清晰的焦点指示器
4. THE Calendar_View SHALL 为屏幕阅读器提供有意义的日期和条目信息
5. THE Calendar_View SHALL 确保颜色对比度符合WCAG 2.1 AA标准
6. THE Calendar_View SHALL 为所有图标和视觉元素提供文本替代

### 需求 11: 路由和导航集成

**用户故事:** 作为用户，我想从应用的任何地方访问日历视图，以便轻松查看我的日记模式

#### 验收标准

1. THE 系统 SHALL 在 /calendar 路由创建CalendarPage组件
2. THE 系统 SHALL 在侧边栏导航中添加日历图标和链接
3. WHEN 用户点击侧边栏中的日历链接时，THE 系统 SHALL 导航到 /calendar 路由
4. THE Calendar_View SHALL 在侧边栏中突出显示为活动页面
5. THE 系统 SHALL 确保日历路由受到身份验证保护（需要登录）
