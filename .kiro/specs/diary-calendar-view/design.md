# 设计文档

## 概述

日历视图功能为"Tina's Log"日记应用添加了一个新的页面，以月度日历格式可视化日记条目。该设计采用类似GitHub贡献图的方法，使用颜色强度表示每日条目数量，并叠加心情图标以快速识别情绪模式。

核心设计原则：
- **渐进式数据加载**: 仅加载当前月份的数据，按需加载其他月份
- **响应式优先**: 移动端和桌面端都有优化的布局
- **主题感知**: 深色和浅色模式下的颜色强度都清晰可见
- **可访问性**: 完整的键盘导航和屏幕阅读器支持
- **性能优化**: 数据缓存和高效的聚合查询

## 架构

### 组件层次结构

```
CalendarPage (页面容器)
├── CalendarHeader (月份/年份标题 + 导航)
│   ├── MonthNavigationButtons (上个月/下个月)
│   └── TodayButton (跳转到今天)
├── CalendarGrid (日历网格)
│   └── CalendarCell[] (日期单元格)
│       ├── DateNumber (日期数字)
│       ├── EntryIndicator (条目颜色指示器)
│       └── MoodIcon (心情图标)
├── MonthlyStats (月度统计面板)
│   ├── TotalEntriesCard (总条目数)
│   ├── StreakCard (连续天数)
│   └── MoodDistribution (心情分布)
└── EntryModal (条目查看弹窗)
    ├── ModalHeader (日期标题)
    ├── EntryList (条目列表)
    │   └── EntryCard[] (单个条目卡片)
    └── EmptyState (无条目状态)
```

### 数据流

```
用户操作 → CalendarPage → Supabase查询 → 数据聚合 → 状态更新 → UI渲染
                ↓
         月份导航 → 重新获取数据 → 更新缓存
                ↓
         日期点击 → 过滤条目 → 显示Modal
```

### 状态管理

使用React Hooks进行本地状态管理：
- `currentMonth`: 当前显示的月份（Date对象）
- `entries`: 当前月份的日记条目数组
- `aggregatedData`: 按日期聚合的数据（Map<string, AggregatedDayData>）
- `selectedDate`: 用户选择的日期
- `isLoading`: 数据加载状态
- `error`: 错误状态
- `monthCache`: 已加载月份的缓存（Map<string, Entry[]>）

## 组件和接口

### 核心类型定义

```typescript
// 日记条目类型（来自现有系统）
interface DiaryEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  location?: string;
  weather?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

// 聚合的日期数据
interface AggregatedDayData {
  date: string; // YYYY-MM-DD格式
  entryCount: number;
  entries: DiaryEntry[];
  primaryMood?: string; // 最常见或最近的心情
  colorIntensity: ColorIntensity;
}

// 颜色强度级别
type ColorIntensity = 'none' | 'low' | 'medium' | 'high';

// 月度统计
interface MonthlyStats {
  totalEntries: number;
  streakDays: number;
  currentStreak: number;
  longestStreak: number;
  moodDistribution: Record<string, number>;
  activeDays: number;
}

// 日历单元格属性
interface CalendarCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  data?: AggregatedDayData;
  onClick: (date: Date) => void;
  onHover?: (date: Date | null) => void;
}

// 月份导航属性
interface MonthNavigationProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  isCurrentMonth: boolean;
}
```

### CalendarPage 组件

主页面组件，协调所有子组件和数据获取。

```typescript
const CalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [aggregatedData, setAggregatedData] = useState<Map<string, AggregatedDayData>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthCache, setMonthCache] = useState<Map<string, DiaryEntry[]>>(new Map());

  // 获取月份数据
  const fetchMonthData = async (month: Date) => {
    const monthKey = formatMonthKey(month);
    
    // 检查缓存
    if (monthCache.has(monthKey)) {
      setEntries(monthCache.get(monthKey)!);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const startDate = startOfMonth(month);
      const endDate = endOfMonth(month);
      
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEntries(data || []);
      setMonthCache(prev => new Map(prev).set(monthKey, data || []));
    } catch (err) {
      setError('加载日历数据失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 聚合数据
  useEffect(() => {
    const aggregated = aggregateEntriesByDate(entries);
    setAggregatedData(aggregated);
  }, [entries]);

  // 月份变化时获取数据
  useEffect(() => {
    fetchMonthData(currentMonth);
  }, [currentMonth]);

  // 处理函数
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  return (
    <div className="calendar-page">
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        isCurrentMonth={isSameMonth(currentMonth, new Date())}
      />
      
      {isLoading ? (
        <LoadingOverlay />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchMonthData(currentMonth)} />
      ) : (
        <div className="calendar-content">
          <CalendarGrid
            currentMonth={currentMonth}
            aggregatedData={aggregatedData}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
          
          <MonthlyStats
            entries={entries}
            currentMonth={currentMonth}
          />
        </div>
      )}

      {selectedDate && (
        <EntryModal
          date={selectedDate}
          entries={getEntriesForDate(selectedDate, aggregatedData)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
```

### CalendarGrid 组件

渲染日历网格，包含星期标题和日期单元格。

```typescript
const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  aggregatedData,
  selectedDate,
  onDateClick
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows: Date[][] = [];
  let days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  return (
    <div className="calendar-grid">
      <div className="calendar-weekdays">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="weekday-label">{day}</div>
        ))}
      </div>
      
      <div className="calendar-days">
        {rows.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-week">
            {week.map(date => {
              const dateKey = formatDateKey(date);
              const data = aggregatedData.get(dateKey);
              
              return (
                <CalendarCell
                  key={dateKey}
                  date={date}
                  isCurrentMonth={isSameMonth(date, currentMonth)}
                  isToday={isToday(date)}
                  isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
                  data={data}
                  onClick={onDateClick}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### CalendarCell 组件

单个日期单元格，显示日期、颜色强度和心情图标。

```typescript
const CalendarCell: React.FC<CalendarCellProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  data,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick(date);
  };

  const getIntensityClass = (intensity: ColorIntensity) => {
    return `intensity-${intensity}`;
  };

  return (
    <div
      className={cn(
        'calendar-cell',
        !isCurrentMonth && 'other-month',
        isToday && 'today',
        isSelected && 'selected',
        data && getIntensityClass(data.colorIntensity)
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${format(date, 'yyyy年M月d日')}${data ? `, ${data.entryCount}条日记` : ''}`}
    >
      <span className="date-number">{format(date, 'd')}</span>
      
      {data?.primaryMood && (
        <span className="mood-icon" title={data.primaryMood}>
          {getMoodEmoji(data.primaryMood)}
        </span>
      )}

      {isHovered && data && (
        <div className="hover-tooltip">
          {data.entryCount} 条日记
        </div>
      )}
    </div>
  );
};
```

### MonthlyStats 组件

显示当前月份的统计信息。

```typescript
const MonthlyStats: React.FC<MonthlyStatsProps> = ({ entries, currentMonth }) => {
  const stats = useMemo(() => calculateMonthlyStats(entries, currentMonth), [entries, currentMonth]);

  return (
    <div className="monthly-stats">
      <h3>本月统计</h3>
      
      <div className="stat-card">
        <div className="stat-icon">📝</div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalEntries}</div>
          <div className="stat-label">总条目数</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🔥</div>
        <div className="stat-content">
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">当前连续天数</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📅</div>
        <div className="stat-content">
          <div className="stat-value">{stats.activeDays}</div>
          <div className="stat-label">活跃天数</div>
        </div>
      </div>

      <div className="mood-distribution">
        <h4>心情分布</h4>
        {Object.entries(stats.moodDistribution).map(([mood, count]) => (
          <div key={mood} className="mood-item">
            <span className="mood-emoji">{getMoodEmoji(mood)}</span>
            <span className="mood-label">{mood}</span>
            <span className="mood-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### EntryModal 组件

显示选定日期的日记条目。

```typescript
const EntryModal: React.FC<EntryModalProps> = ({ date, entries, onClose }) => {
  const navigate = useNavigate();

  const handleEntryClick = (entryId: string) => {
    navigate(`/entry/${entryId}`);
  };

  const handleWriteNew = () => {
    navigate('/write');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="entry-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{format(date, 'yyyy年M月d日')}</h2>
          <button className="close-button" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        <div className="modal-content">
          {entries.length > 0 ? (
            <div className="entry-list">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="entry-card"
                  onClick={() => handleEntryClick(entry.id)}
                >
                  <div className="entry-header">
                    <h3>{entry.title}</h3>
                    {entry.mood && (
                      <span className="entry-mood">{getMoodEmoji(entry.mood)}</span>
                    )}
                  </div>
                  <p className="entry-preview">
                    {entry.content.substring(0, 100)}...
                  </p>
                  <div className="entry-meta">
                    <span className="entry-time">
                      {format(new Date(entry.created_at), 'HH:mm')}
                    </span>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="entry-tags">
                        {entry.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>这一天还没有日记</p>
              <button className="write-button" onClick={handleWriteNew}>
                写一篇日记
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

## 数据模型

### 数据聚合函数

```typescript
// 按日期聚合条目
function aggregateEntriesByDate(entries: DiaryEntry[]): Map<string, AggregatedDayData> {
  const aggregated = new Map<string, AggregatedDayData>();

  entries.forEach(entry => {
    const dateKey = format(new Date(entry.created_at), 'yyyy-MM-dd');
    
    if (!aggregated.has(dateKey)) {
      aggregated.set(dateKey, {
        date: dateKey,
        entryCount: 0,
        entries: [],
        colorIntensity: 'none'
      });
    }

    const dayData = aggregated.get(dateKey)!;
    dayData.entryCount++;
    dayData.entries.push(entry);
    
    // 更新主要心情（最常见的）
    if (entry.mood) {
      dayData.primaryMood = getMostCommonMood(dayData.entries);
    }
    
    // 更新颜色强度
    dayData.colorIntensity = calculateColorIntensity(dayData.entryCount);
  });

  return aggregated;
}

// 计算颜色强度
function calculateColorIntensity(count: number): ColorIntensity {
  if (count === 0) return 'none';
  if (count === 1) return 'low';
  if (count <= 3) return 'medium';
  return 'high';
}

// 获取最常见的心情
function getMostCommonMood(entries: DiaryEntry[]): string | undefined {
  const moodCounts: Record<string, number> = {};
  
  entries.forEach(entry => {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }
  });

  if (Object.keys(moodCounts).length === 0) return undefined;

  return Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)[0][0];
}
```

### 月度统计计算

```typescript
function calculateMonthlyStats(entries: DiaryEntry[], currentMonth: Date): MonthlyStats {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // 总条目数
  const totalEntries = entries.length;

  // 活跃天数（有条目的天数）
  const uniqueDates = new Set(
    entries.map(e => format(new Date(e.created_at), 'yyyy-MM-dd'))
  );
  const activeDays = uniqueDates.size;

  // 心情分布
  const moodDistribution: Record<string, number> = {};
  entries.forEach(entry => {
    if (entry.mood) {
      moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
    }
  });

  // 计算连续天数
  const { currentStreak, longestStreak } = calculateStreaks(entries, currentMonth);

  return {
    totalEntries,
    streakDays: currentStreak,
    currentStreak,
    longestStreak,
    moodDistribution,
    activeDays
  };
}

// 计算连续天数
function calculateStreaks(entries: DiaryEntry[], currentMonth: Date): {
  currentStreak: number;
  longestStreak: number;
} {
  const dates = entries
    .map(e => format(new Date(e.created_at), 'yyyy-MM-dd'))
    .sort();
  
  const uniqueDates = Array.from(new Set(dates));
  
  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const dayDiff = differenceInDays(currDate, prevDate);

    if (dayDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // 计算当前连续天数（从最后一个条目到今天）
  const lastDate = new Date(uniqueDates[uniqueDates.length - 1]);
  const today = new Date();
  const daysSinceLastEntry = differenceInDays(today, lastDate);

  if (daysSinceLastEntry <= 1) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }

  return { currentStreak, longestStreak };
}
```

### Supabase 查询优化

```typescript
// 优化的月度查询
async function fetchMonthEntries(month: Date, userId: string): Promise<DiaryEntry[]> {
  const startDate = startOfMonth(month);
  const endDate = endOfMonth(month);

  const { data, error } = await supabase
    .from('diary_entries')
    .select('id, title, content, mood, tags, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
```


## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: 日历日期完整性

*对于任意*月份，日历网格应该显示该月的所有日期（从第1天到最后一天），并且每个日期只出现一次

**验证需求: 1.3**

### 属性 2: 其他月份日期标记

*对于任意*月份的日历网格，所有不属于当前月份的日期单元格应该被标记为"other-month"样式

**验证需求: 1.4**

### 属性 3: 颜色强度计算

*对于任意*条目数量，颜色强度应该按以下规则计算：
- 0条 → 'none'
- 1条 → 'low'
- 2-3条 → 'medium'
- 4条及以上 → 'high'

**验证需求: 2.2**

### 属性 4: 心情图标显示

*对于任意*有心情数据的日记条目，该日期的日历单元格应该显示心情图标

**验证需求: 3.1**

### 属性 5: 最常见心情选择

*对于任意*有多条不同心情条目的日期，显示的心情应该是出现次数最多的心情

**验证需求: 3.2**

### 属性 6: 日期选择触发

*对于任意*日历日期，点击该日期应该触发Date_Selection事件并显示Entry_Modal

**验证需求: 4.1, 4.2**

### 属性 7: Modal条目信息完整性

*对于任意*日记条目，在Entry_Modal中显示时应该包含标题、内容摘要、心情（如果有）、标签（如果有）和创建时间

**验证需求: 4.3**

### 属性 8: 月份导航往返一致性

*对于任意*月份，执行"下个月"然后"上个月"操作应该返回到原始月份；执行"上个月"然后"下个月"操作也应该返回到原始月份

**验证需求: 5.2, 5.3, 5.4**

### 属性 9: 数据聚合正确性

*对于任意*日记条目集合，按日期聚合后，每个日期的条目数量应该等于该日期的所有条目数量，并且所有条目都应该被包含在聚合结果中

**验证需求: 9.2**

### 属性 10: 月份缓存一致性

*对于任意*月份，第一次加载时应该从API获取数据，第二次访问相同月份时应该使用缓存数据（不再调用API）

**验证需求: 9.5, 9.6**

### 属性 11: 可访问性标签完整性

*对于任意*交互元素（日期单元格、按钮、模态框），应该提供适当的ARIA标签或aria-label属性，使屏幕阅读器能够理解其用途

**验证需求: 10.1, 10.4, 10.6**

### 属性 12: 连续天数计算正确性

*对于任意*日记条目序列，如果连续N天都有条目，则当前连续天数应该为N；如果最后一条条目距今超过1天，则当前连续天数应该为0

**验证需求: 7.2**

## 错误处理

### 数据加载错误

**场景**: Supabase查询失败或网络错误

**处理**:
1. 捕获错误并设置错误状态
2. 显示用户友好的错误消息："加载日历数据失败，请重试"
3. 提供"重试"按钮重新获取数据
4. 记录错误到控制台以便调试

```typescript
try {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error) throw error;
  
  setEntries(data || []);
} catch (err) {
  console.error('Failed to fetch calendar data:', err);
  setError('加载日历数据失败，请重试');
  toast.error('加载日历数据失败');
}
```

### 认证错误

**场景**: 用户未登录或会话过期

**处理**:
1. 检测Supabase认证错误
2. 重定向到登录页面
3. 保存当前路由以便登录后返回

```typescript
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  navigate('/login', { state: { from: '/calendar' } });
  return;
}
```

### 空数据状态

**场景**: 用户在某个月份没有任何日记条目

**处理**:
1. 正常渲染日历网格（不显示错误）
2. 所有日期单元格显示为默认状态（无颜色强度）
3. 月度统计显示0值
4. 点击日期时显示空状态消息和"写日记"按钮

### 日期计算错误

**场景**: 日期库函数返回无效日期

**处理**:
1. 使用try-catch包装日期计算
2. 如果日期无效，回退到当前月份
3. 记录警告到控制台

```typescript
try {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  // ... 继续处理
} catch (err) {
  console.warn('Invalid date calculation, falling back to current month:', err);
  setCurrentMonth(new Date());
}
```

### 缓存数据过期

**场景**: 用户在其他设备或标签页添加了新条目

**处理**:
1. 提供"刷新"按钮手动重新加载数据
2. 可选：实现Supabase实时订阅自动更新
3. 清除缓存并重新获取数据

```typescript
const handleRefresh = () => {
  setMonthCache(new Map()); // 清除缓存
  fetchMonthData(currentMonth); // 重新获取
};
```

## 测试策略

### 双重测试方法

本功能将采用单元测试和基于属性的测试相结合的方法：

- **单元测试**: 验证特定示例、边缘情况和错误条件
- **属性测试**: 验证跨所有输入的通用属性
- 两者互补且都是必需的，以实现全面覆盖

### 单元测试

单元测试专注于：
- 特定示例（如今天的日期突出显示）
- 组件渲染（如日历网格结构）
- 用户交互（如点击日期、导航按钮）
- 边缘情况（如空数据状态、月份边界）
- 错误条件（如API失败、认证错误）

**测试框架**: Vitest + React Testing Library

**示例单元测试**:

```typescript
describe('CalendarPage', () => {
  it('应该显示当前月份和年份', () => {
    render(<CalendarPage />);
    const now = new Date();
    expect(screen.getByText(format(now, 'yyyy年M月'))).toBeInTheDocument();
  });

  it('应该突出显示今天的日期', () => {
    render(<CalendarPage />);
    const today = format(new Date(), 'd');
    const todayCell = screen.getByText(today).closest('.calendar-cell');
    expect(todayCell).toHaveClass('today');
  });

  it('应该在点击日期时显示Entry_Modal', async () => {
    render(<CalendarPage />);
    const dateCell = screen.getAllByRole('button')[10]; // 任意日期
    fireEvent.click(dateCell);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('应该在空数据状态下显示"写日记"按钮', async () => {
    // Mock空数据
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: () => ({
        gte: () => ({
          lte: () => ({
            order: () => Promise.resolve({ data: [], error: null })
          })
        })
      })
    });

    render(<CalendarPage />);
    const dateCell = screen.getAllByRole('button')[10];
    fireEvent.click(dateCell);
    
    await waitFor(() => {
      expect(screen.getByText('写一篇日记')).toBeInTheDocument();
    });
  });
});
```

### 基于属性的测试

基于属性的测试验证跨所有输入的通用属性。

**测试框架**: fast-check (JavaScript/TypeScript的属性测试库)

**配置**: 每个属性测试最少运行100次迭代

**标签格式**: `Feature: diary-calendar-view, Property {number}: {property_text}`

**示例属性测试**:

```typescript
import fc from 'fast-check';

describe('Calendar Properties', () => {
  // Feature: diary-calendar-view, Property 3: 颜色强度计算
  it('应该根据条目数量正确计算颜色强度', () => {
    fc.assert(
      fc.property(fc.nat(100), (count) => {
        const intensity = calculateColorIntensity(count);
        
        if (count === 0) {
          expect(intensity).toBe('none');
        } else if (count === 1) {
          expect(intensity).toBe('low');
        } else if (count <= 3) {
          expect(intensity).toBe('medium');
        } else {
          expect(intensity).toBe('high');
        }
      }),
      { numRuns: 100 }
    );
  });

  // Feature: diary-calendar-view, Property 8: 月份导航往返一致性
  it('月份导航应该保持往返一致性', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (startMonth) => {
          // 下个月 -> 上个月
          const nextMonth = addMonths(startMonth, 1);
          const backToStart = subMonths(nextMonth, 1);
          expect(format(backToStart, 'yyyy-MM')).toBe(format(startMonth, 'yyyy-MM'));

          // 上个月 -> 下个月
          const prevMonth = subMonths(startMonth, 1);
          const backToStart2 = addMonths(prevMonth, 1);
          expect(format(backToStart2, 'yyyy-MM')).toBe(format(startMonth, 'yyyy-MM'));
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: diary-calendar-view, Property 9: 数据聚合正确性
  it('数据聚合应该保持条目完整性', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string(),
            content: fc.string(),
            mood: fc.option(fc.constantFrom('开心', '难过', '平静', '兴奋', '焦虑')),
            created_at: fc.date().map(d => d.toISOString())
          })
        ),
        (entries) => {
          const aggregated = aggregateEntriesByDate(entries);
          
          // 验证总条目数
          let totalCount = 0;
          aggregated.forEach(dayData => {
            totalCount += dayData.entryCount;
          });
          expect(totalCount).toBe(entries.length);

          // 验证每个日期的条目数
          aggregated.forEach(dayData => {
            expect(dayData.entries.length).toBe(dayData.entryCount);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: diary-calendar-view, Property 5: 最常见心情选择
  it('应该选择最常见的心情', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            mood: fc.constantFrom('开心', '难过', '平静', '兴奋', '焦虑'),
            created_at: fc.date().map(d => d.toISOString())
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (entries) => {
          const mostCommon = getMostCommonMood(entries);
          
          // 计算每种心情的出现次数
          const moodCounts: Record<string, number> = {};
          entries.forEach(e => {
            if (e.mood) {
              moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
            }
          });

          // 验证返回的是最常见的心情
          const maxCount = Math.max(...Object.values(moodCounts));
          expect(moodCounts[mostCommon!]).toBe(maxCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: diary-calendar-view, Property 1: 日历日期完整性
  it('日历应该显示月份的所有日期', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (month) => {
          const daysInMonth = getDaysInMonth(month);
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          
          // 生成日历网格
          const startDate = startOfWeek(monthStart);
          const endDate = endOfWeek(monthEnd);
          const allDates: Date[] = [];
          let day = startDate;
          
          while (day <= endDate) {
            allDates.push(day);
            day = addDays(day, 1);
          }

          // 过滤出当前月份的日期
          const currentMonthDates = allDates.filter(d => isSameMonth(d, month));
          
          // 验证日期数量
          expect(currentMonthDates.length).toBe(daysInMonth);
          
          // 验证每个日期只出现一次
          const dateStrings = currentMonthDates.map(d => format(d, 'yyyy-MM-dd'));
          const uniqueDates = new Set(dateStrings);
          expect(uniqueDates.size).toBe(daysInMonth);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 集成测试

集成测试验证组件之间的交互：

```typescript
describe('Calendar Integration', () => {
  it('应该完整的日期选择和条目查看流程', async () => {
    // Mock数据
    const mockEntries = [
      {
        id: '1',
        title: '测试日记',
        content: '这是测试内容',
        mood: '开心',
        created_at: new Date().toISOString()
      }
    ];

    vi.spyOn(supabase, 'from').mockReturnValue({
      select: () => ({
        gte: () => ({
          lte: () => ({
            order: () => Promise.resolve({ data: mockEntries, error: null })
          })
        })
      })
    });

    render(<CalendarPage />);

    // 等待数据加载
    await waitFor(() => {
      expect(screen.queryByText('加载中')).not.toBeInTheDocument();
    });

    // 点击今天的日期
    const today = format(new Date(), 'd');
    const todayCell = screen.getByText(today).closest('.calendar-cell');
    fireEvent.click(todayCell!);

    // 验证modal显示
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('测试日记')).toBeInTheDocument();
    });

    // 关闭modal
    const closeButton = screen.getByLabelText('关闭');
    fireEvent.click(closeButton);

    // 验证modal关闭
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
```

### 测试覆盖率目标

- 组件代码覆盖率: ≥ 80%
- 工具函数覆盖率: ≥ 90%
- 属性测试: 每个属性至少100次迭代
- 关键路径: 100%覆盖（数据加载、聚合、导航）

### 测试数据生成

使用fast-check生成器创建测试数据：

```typescript
// 日记条目生成器
const diaryEntryArbitrary = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  content: fc.string({ minLength: 10, maxLength: 1000 }),
  mood: fc.option(fc.constantFrom('开心', '难过', '平静', '兴奋', '焦虑', '愤怒', '感恩')),
  tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 })),
  location: fc.option(fc.string()),
  weather: fc.option(fc.constantFrom('晴天', '多云', '雨天', '雪天')),
  created_at: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
  updated_at: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString())
});

// 月份生成器
const monthArbitrary = fc.date({
  min: new Date('2020-01-01'),
  max: new Date('2030-12-31')
});
```

## 样式和主题

### CSS变量（主题感知）

```css
/* 浅色主题 */
:root {
  --calendar-bg: #ffffff;
  --calendar-border: #e5e7eb;
  --calendar-text: #1f2937;
  --calendar-text-muted: #6b7280;
  --calendar-today-bg: #dbeafe;
  --calendar-today-border: #3b82f6;
  --calendar-selected-bg: #bfdbfe;
  --calendar-hover-bg: #f3f4f6;
  
  /* 颜色强度 */
  --calendar-intensity-none: transparent;
  --calendar-intensity-low: #dbeafe;
  --calendar-intensity-medium: #93c5fd;
  --calendar-intensity-high: #3b82f6;
  
  /* 统计卡片 */
  --stat-card-bg: #f9fafb;
  --stat-card-border: #e5e7eb;
}

/* 深色主题 */
[data-theme='dark'] {
  --calendar-bg: #1f2937;
  --calendar-border: #374151;
  --calendar-text: #f9fafb;
  --calendar-text-muted: #9ca3af;
  --calendar-today-bg: #1e3a8a;
  --calendar-today-border: #3b82f6;
  --calendar-selected-bg: #1e40af;
  --calendar-hover-bg: #374151;
  
  /* 颜色强度 */
  --calendar-intensity-none: transparent;
  --calendar-intensity-low: #1e3a8a;
  --calendar-intensity-medium: #1e40af;
  --calendar-intensity-high: #3b82f6;
  
  /* 统计卡片 */
  --stat-card-bg: #374151;
  --stat-card-border: #4b5563;
}
```

### 响应式断点

```css
/* 移动设备 */
@media (max-width: 767px) {
  .calendar-page {
    padding: 1rem;
  }
  
  .calendar-cell {
    min-height: 40px;
    font-size: 0.875rem;
  }
  
  .monthly-stats {
    margin-top: 2rem;
  }
  
  .entry-modal {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}

/* 平板设备 */
@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-page {
    padding: 1.5rem;
  }
  
  .calendar-content {
    display: flex;
    flex-direction: column;
  }
}

/* 桌面设备 */
@media (min-width: 1024px) {
  .calendar-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
  }
}
```

## 性能优化

### 1. 数据缓存

使用Map缓存已加载的月份数据，避免重复API调用：

```typescript
const [monthCache, setMonthCache] = useState<Map<string, DiaryEntry[]>>(new Map());
```

### 2. 虚拟化（可选）

如果用户有大量条目，考虑使用react-window虚拟化Entry_Modal中的条目列表。

### 3. 懒加载

仅在用户导航到日历页面时加载日历组件：

```typescript
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
```

### 4. Memoization

使用React.memo和useMemo优化渲染：

```typescript
const CalendarCell = React.memo<CalendarCellProps>(({ date, data, ...props }) => {
  // 组件实现
});

const aggregatedData = useMemo(
  () => aggregateEntriesByDate(entries),
  [entries]
);
```

### 5. 防抖导航

防止用户快速点击导航按钮导致多次API调用：

```typescript
const debouncedNavigate = useMemo(
  () => debounce((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(prev => subMonths(prev, 1));
    } else {
      setCurrentMonth(prev => addMonths(prev, 1));
    }
  }, 300),
  []
);
```

## 依赖库

- **date-fns**: 日期操作和格式化（已在项目中使用）
- **fast-check**: 基于属性的测试
- **@testing-library/react**: React组件测试
- **vitest**: 测试运行器
- **classnames (cn)**: 条件CSS类名（已在项目中使用）

## 实现注意事项

1. **日期时区处理**: 确保所有日期操作使用用户本地时区
2. **性能监控**: 监控大数据集（>1000条条目）的性能
3. **渐进增强**: 基础功能在JavaScript禁用时仍可访问（服务端渲染）
4. **错误边界**: 使用React Error Boundary捕获组件错误
5. **加载状态**: 所有异步操作都应显示加载指示器
6. **空状态**: 为无数据情况提供友好的空状态UI
7. **移动优先**: 先实现移动布局，再增强桌面体验
8. **可访问性**: 遵循WCAG 2.1 AA标准
