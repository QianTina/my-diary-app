import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { CalendarHeaderProps } from '../../types/calendar';
import { useThemeStore } from '../../store/themeStore';

export default function CalendarHeader({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onToday,
  isCurrentMonth
}: CalendarHeaderProps) {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <div className={`calendar-header ${isDark ? 'dark' : ''}`}>
      {/* 月份/年份标题 */}
      <h2 className="calendar-title">
        {format(currentMonth, 'yyyy年M月')}
      </h2>

      {/* 导航按钮 */}
      <div className="calendar-nav">
        <button
          onClick={onPreviousMonth}
          className="nav-button"
          aria-label="上个月"
          title="上个月"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={onToday}
          className="nav-button today-button"
          disabled={isCurrentMonth}
          aria-label="今天"
          title="今天"
        >
          <Calendar className="w-5 h-5" />
          <span className="button-text">今天</span>
        </button>

        <button
          onClick={onNextMonth}
          className="nav-button"
          aria-label="下个月"
          title="下个月"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
