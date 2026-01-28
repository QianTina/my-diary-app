import type { Diary } from '../types';

/**
 * 颜色强度级别
 * - none: 无条目
 * - low: 1条条目
 * - medium: 2-3条条目
 * - high: 4条及以上条目
 */
export type ColorIntensity = 'none' | 'low' | 'medium' | 'high';

/**
 * 聚合的日期数据
 */
export interface AggregatedDayData {
  /** 日期字符串 (YYYY-MM-DD格式) */
  date: string;
  /** 该日期的条目数量 */
  entryCount: number;
  /** 该日期的所有日记条目 */
  entries: Diary[];
  /** 主要心情（最常见或最近的心情） */
  primaryMood?: string;
  /** 颜色强度级别 */
  colorIntensity: ColorIntensity;
}

/**
 * 月度统计数据
 */
export interface MonthlyStats {
  /** 总条目数 */
  totalEntries: number;
  /** 当前连续天数 */
  currentStreak: number;
  /** 最长连续天数 */
  longestStreak: number;
  /** 心情分布 (心情 -> 数量) */
  moodDistribution: Record<string, number>;
  /** 活跃天数（有条目的天数） */
  activeDays: number;
}

/**
 * 日历单元格属性
 */
export interface CalendarCellProps {
  /** 日期对象 */
  date: Date;
  /** 是否属于当前月份 */
  isCurrentMonth: boolean;
  /** 是否是今天 */
  isToday: boolean;
  /** 是否被选中 */
  isSelected: boolean;
  /** 聚合的日期数据（如果有） */
  data?: AggregatedDayData;
  /** 点击事件处理函数 */
  onClick: (date: Date) => void;
}

/**
 * 日历网格属性
 */
export interface CalendarGridProps {
  /** 当前显示的月份 */
  currentMonth: Date;
  /** 聚合的数据 Map */
  aggregatedData: Map<string, AggregatedDayData>;
  /** 选中的日期 */
  selectedDate: Date | null;
  /** 日期点击处理函数 */
  onDateClick: (date: Date) => void;
}

/**
 * 日历头部属性
 */
export interface CalendarHeaderProps {
  /** 当前月份 */
  currentMonth: Date;
  /** 上个月按钮点击处理 */
  onPreviousMonth: () => void;
  /** 下个月按钮点击处理 */
  onNextMonth: () => void;
  /** 今天按钮点击处理 */
  onToday: () => void;
  /** 是否是当前月份 */
  isCurrentMonth: boolean;
}

/**
 * 月度统计组件属性
 */
export interface MonthlyStatsProps {
  /** 日记条目数组 */
  entries: Diary[];
  /** 当前月份 */
  currentMonth: Date;
}

/**
 * 条目弹窗属性
 */
export interface EntryModalProps {
  /** 选中的日期 */
  date: Date;
  /** 该日期的条目列表 */
  entries: Diary[];
  /** 关闭弹窗处理函数 */
  onClose: () => void;
}
