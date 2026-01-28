import { useMemo } from 'react';
import { BookOpen, Flame, Calendar as CalendarIcon, Smile } from 'lucide-react';
import type { MonthlyStatsProps } from '../../types/calendar';
import { calculateMonthlyStats } from '../../utils/calendarUtils';
import { MoodIcon } from '../MoodIcon';
import { useThemeStore } from '../../store/themeStore';

export default function MonthlyStats({ entries, currentMonth }: MonthlyStatsProps) {
  const isDark = useThemeStore((state) => state.isDark);
  
  const stats = useMemo(
    () => calculateMonthlyStats(entries, currentMonth),
    [entries, currentMonth]
  );

  return (
    <div className={`monthly-stats ${isDark ? 'dark' : ''}`}>
      <h3 className="stats-title">本月统计</h3>
      
      {/* 统计卡片 */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalEntries}</div>
            <div className="stat-label">总条目数</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Flame className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">当前连续天数</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeDays}</div>
            <div className="stat-label">活跃天数</div>
          </div>
        </div>
      </div>

      {/* 心情分布 */}
      {Object.keys(stats.moodDistribution).length > 0 && (
        <div className="mood-distribution">
          <h4 className="mood-title">
            <Smile className="w-4 h-4" />
            <span>心情分布</span>
          </h4>
          <div className="mood-list">
            {Object.entries(stats.moodDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([mood, count]) => (
                <div key={mood} className="mood-item">
                  <span className="mood-emoji" aria-label={`心情: ${mood}`}>
                    <MoodIcon mood={mood} className="w-5 h-5" />
                  </span>
                  <span className="mood-label">{mood}</span>
                  <span className="mood-count">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
