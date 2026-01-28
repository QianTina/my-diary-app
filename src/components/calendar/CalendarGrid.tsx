import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isSameDay } from 'date-fns';
import type { CalendarGridProps } from '../../types/calendar';
import { formatDateKey } from '../../utils/calendarUtils';
import CalendarCell from './CalendarCell';
import { useThemeStore } from '../../store/themeStore';

export default function CalendarGrid({
  currentMonth,
  aggregatedData,
  selectedDate,
  onDateClick
}: CalendarGridProps) {
  const isDark = useThemeStore((state) => state.isDark);

  // 计算日历网格的日期范围
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // 生成日历网格（7列 x N行）
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

  // 星期标题
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className={`calendar-grid ${isDark ? 'dark' : ''}`}>
      {/* 星期标题 */}
      <div className="calendar-weekdays">
        {weekdays.map((day, index) => (
          <div 
            key={index} 
            className="weekday-label"
            aria-label={`星期${day}`}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* 日期网格 */}
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
}
