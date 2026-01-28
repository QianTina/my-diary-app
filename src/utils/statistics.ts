import type { Diary, Mood } from '../types';

/**
 * 计算总字数
 */
export const getTotalWords = (diaries: Diary[]): number => {
  return diaries.reduce((total, diary) => {
    const words = diary.content.length;
    return total + words;
  }, 0);
};

/**
 * 计算连续写作天数
 */
export const getStreakDays = (diaries: Diary[]): number => {
  if (diaries.length === 0) return 0;

  const sortedDates = diaries
    .map(d => new Date(d.createdAt).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  let currentDate = new Date();

  for (const dateStr of sortedDates) {
    const checkDate = currentDate.toDateString();
    
    if (dateStr === checkDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * 获取心情分布
 */
export const getMoodDistribution = (diaries: Diary[]): Record<Mood, number> => {
  const distribution: Record<Mood, number> = {
    happy: 0,
    calm: 0,
    neutral: 0,
    sad: 0,
    angry: 0,
  };

  diaries.forEach(diary => {
    if (diary.mood) {
      distribution[diary.mood]++;
    }
  });

  return distribution;
};

/**
 * 获取最常用的标签（前10个）
 */
export const getTopTags = (diaries: Diary[], limit = 10): Array<{ tag: string; count: number }> => {
  const tagMap = new Map<string, number>();

  diaries.forEach(diary => {
    diary.tags.forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

/**
 * 获取每月写作数量
 */
export const getMonthlyStats = (diaries: Diary[]): Array<{ month: string; count: number }> => {
  const monthMap = new Map<string, number>();

  diaries.forEach(diary => {
    const date = new Date(diary.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
  });

  return Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // 最近6个月
};

/**
 * 获取平均每篇字数
 */
export const getAverageWords = (diaries: Diary[]): number => {
  if (diaries.length === 0) return 0;
  return Math.round(getTotalWords(diaries) / diaries.length);
};

/**
 * 获取最长的一篇日记
 */
export const getLongestDiary = (diaries: Diary[]): Diary | null => {
  if (diaries.length === 0) return null;
  return diaries.reduce((longest, current) => 
    current.content.length > longest.content.length ? current : longest
  );
};

/**
 * 获取写作时间分布（按小时）
 */
export const getHourlyDistribution = (diaries: Diary[]): number[] => {
  const hours = new Array(24).fill(0);
  
  diaries.forEach(diary => {
    const hour = new Date(diary.createdAt).getHours();
    hours[hour]++;
  });

  return hours;
};
