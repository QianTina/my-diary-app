import { useState } from 'react';
import { format } from 'date-fns';
import { memo } from 'react';
import type { CalendarCellProps } from '../../types/calendar';
import { MoodIcon } from '../MoodIcon';
import { useThemeStore } from '../../store/themeStore';
import { useTaskStore } from '../../store/taskStore';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

const CalendarCell = memo(function CalendarCell({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  data,
  onClick
}: CalendarCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isDark = useThemeStore((state) => state.isDark);
  const { tasks } = useTaskStore();

  // 获取当前日期的任务
  const dateStr = format(date, 'yyyy-MM-dd');
  const dateTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = task.due_date.split('T')[0];
    return taskDate === dateStr;
  });

  const completedTasks = dateTasks.filter(t => t.status === 'complete').length;
  const incompleteTasks = dateTasks.filter(t => t.status === 'incomplete').length;
  const overdueTasks = dateTasks.filter(t => {
    if (t.status === 'complete') return false;
    const taskDueDate = new Date(t.due_date!);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDueDate < today;
  }).length;

  const handleClick = () => {
    onClick(date);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(date);
    }
  };

  // 获取颜色强度类名
  const getIntensityClass = () => {
    if (!data || data.colorIntensity === 'none') return '';
    return `intensity-${data.colorIntensity}`;
  };

  // 构建类名
  const cellClasses = [
    'calendar-cell',
    !isCurrentMonth && 'other-month',
    isToday && 'today',
    isSelected && 'selected',
    getIntensityClass()
  ].filter(Boolean).join(' ');

  // ARIA 标签
  const ariaLabel = `${format(date, 'yyyy年M月d日')}${data ? `, ${data.entryCount}条日记` : ', 无日记'}${dateTasks.length > 0 ? `, ${dateTasks.length}个任务` : ''}`;

  return (
    <div
      className={cellClasses}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <span className="date-number">{format(date, 'd')}</span>
      
      {/* 心情图标 */}
      {data?.primaryMood && (
        <span 
          className="mood-icon" 
          title={data.primaryMood}
          aria-label={`心情: ${data.primaryMood}`}
        >
          <MoodIcon mood={data.primaryMood} className="w-4 h-4" />
        </span>
      )}

      {/* 任务指示器 */}
      {dateTasks.length > 0 && (
        <div className="task-indicators flex items-center gap-0.5 mt-1">
          {overdueTasks > 0 && (
            <span 
              className="task-indicator overdue"
              title={`${overdueTasks} 个过期任务`}
              aria-label={`${overdueTasks} 个过期任务`}
            >
              <AlertCircle className="w-3 h-3 text-red-500" />
            </span>
          )}
          {incompleteTasks > 0 && (
            <span 
              className="task-indicator incomplete"
              title={`${incompleteTasks} 个未完成任务`}
              aria-label={`${incompleteTasks} 个未完成任务`}
            >
              <Circle className="w-3 h-3 text-blue-500" />
            </span>
          )}
          {completedTasks > 0 && (
            <span 
              className="task-indicator complete"
              title={`${completedTasks} 个已完成任务`}
              aria-label={`${completedTasks} 个已完成任务`}
            >
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            </span>
          )}
        </div>
      )}

      {isHovered && (data || dateTasks.length > 0) && (
        <div className={`hover-tooltip ${isDark ? 'dark' : ''}`}>
          {data && <div>{data.entryCount} 条日记</div>}
          {dateTasks.length > 0 && (
            <div>
              {dateTasks.length} 个任务
              {completedTasks > 0 && ` (${completedTasks} 已完成)`}
              {overdueTasks > 0 && ` (${overdueTasks} 已过期)`}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default CalendarCell;
