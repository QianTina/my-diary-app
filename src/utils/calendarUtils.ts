import { format, differenceInDays } from 'date-fns';
import type { ColorIntensity, AggregatedDayData, MonthlyStats } from '../types/calendar';
import type { Diary } from '../types';

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * 格式化月份为 YYYY-MM 格式
 */
export function formatMonthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * 根据条目数量计算颜色强度
 */
export function calculateColorIntensity(count: number): ColorIntensity {
  if (count === 0) return 'none';
  if (count === 1) return 'low';
  if (count <= 3) return 'medium';
  return 'high';
}

/**
 * 获取心情对应的 emoji
 */
export function getMoodEmoji(mood: string): string {
  const moodMap: Record<string, string> = {
    'happy': '😊',
    'sad': '😢',
    'neutral': '😐',
    'calm': '😌',
    'angry': '😠',
    '开心': '😊',
    '难过': '😢',
    '平静': '😐',
    '平和': '😌',
    '愤怒': '😠',
    '兴奋': '🤩',
    '焦虑': '😰',
    '感恩': '🙏',
  };
  
  return moodMap[mood] || '😐';
}

/**
 * 按日期聚合日记条目
 */
export function aggregateEntriesByDate(entries: Diary[]): Map<string, AggregatedDayData> {
  const aggregated = new Map<string, AggregatedDayData>();

  entries.forEach(entry => {
    const dateKey = formatDateKey(new Date(entry.createdAt));
    
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
    
    if (entry.mood) {
      dayData.primaryMood = getMostCommonMood(dayData.entries);
    }
    
    dayData.colorIntensity = calculateColorIntensity(dayData.entryCount);
  });

  return aggregated;
}

/**
 * 获取最常见的心情
 */
export function getMostCommonMood(entries: Diary[]): string | undefined {
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

/**
 * 计算月度统计数据
 */
export function calculateMonthlyStats(entries: Diary[], _currentMonth: Date): MonthlyStats {
  const totalEntries = entries.length;

  const uniqueDates = new Set(
    entries.map(e => formatDateKey(new Date(e.createdAt)))
  );
  const activeDays = uniqueDates.size;

  const moodDistribution: Record<string, number> = {};
  entries.forEach(entry => {
    if (entry.mood) {
      moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
    }
  });

  const { currentStreak, longestStreak } = calculateStreaks(entries);

  return {
    totalEntries,
    currentStreak,
    longestStreak,
    moodDistribution,
    activeDays
  };
}

/**
 * 计算连续天数
 */
export function calculateStreaks(entries: Diary[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dates = entries
    .map(e => formatDateKey(new Date(e.createdAt)))
    .sort();
  
  const uniqueDates = Array.from(new Set(dates));
  
  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

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

  const lastDate = new Date(uniqueDates[uniqueDates.length - 1]);
  const today = new Date();
  const daysSinceLastEntry = differenceInDays(today, lastDate);

  let currentStreak = 0;
  if (daysSinceLastEntry <= 1) {
    currentStreak = 1;
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const prevDate = new Date(uniqueDates[i]);
      const currDate = new Date(uniqueDates[i + 1]);
      const dayDiff = differenceInDays(currDate, prevDate);
      
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}
