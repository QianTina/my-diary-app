import { useState, useEffect, useMemo, useCallback } from 'react';
import { addMonths, subMonths, isSameMonth, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '../utils/supabase';
import type { Diary } from '../types';
import { aggregateEntriesByDate, formatDateKey, formatMonthKey } from '../utils/calendarUtils';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import MonthlyStats from '../components/calendar/MonthlyStats';
import EntryModal from '../components/calendar/EntryModal';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ErrorMessage } from '../components/ErrorMessage';
import { useThemeStore } from '../store/themeStore';
import { useTaskStore } from '../store/taskStore';
import type { TaskWithCategory } from '../types/task';

export default function CalendarPage() {
  const isDark = useThemeStore((state) => state.isDark);
  const { tasks, loadTasks } = useTaskStore();
  
  // 状态管理
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Diary[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthCache, setMonthCache] = useState<Map<string, Diary[]>>(new Map());

  // 聚合数据
  const aggregatedData = useMemo(
    () => aggregateEntriesByDate(entries),
    [entries]
  );

  // 获取月份数据
  const fetchMonthData = useCallback(async (month: Date) => {
    const monthKey = formatMonthKey(month);
    
    // 检查缓存
    if (monthCache.has(monthKey)) {
      setEntries(monthCache.get(monthKey)!);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!supabase) {
        // 本地存储模式
        const localData = localStorage.getItem('diary_items');
        if (localData) {
          const allEntries = JSON.parse(localData) as Diary[];
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          
          const filtered = allEntries.filter(entry => {
            const entryDate = new Date(entry.createdAt);
            return entryDate >= monthStart && entryDate <= monthEnd;
          });
          
          setEntries(filtered);
          setMonthCache(prev => new Map(prev).set(monthKey, filtered));
        } else {
          setEntries([]);
        }
      } else {
        // Supabase 模式
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const { data, error: fetchError } = await supabase
          .from('diaries')
          .select('*')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString())
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // 映射数据
        const mappedData = (data || []).map(item => ({
          id: item.id,
          user_id: item.user_id,
          title: item.title || '',
          content: item.content,
          mood: item.mood,
          weather: item.weather,
          location: item.location || '',
          tags: item.tags || [],
          images: item.images || [],
          isEncrypted: item.is_encrypted || false,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));

        setEntries(mappedData);
        setMonthCache(prev => new Map(prev).set(monthKey, mappedData));
      }
    } catch (err) {
      console.error('Failed to fetch calendar data:', err);
      setError('加载日历数据失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [monthCache]);

  // 月份变化时获取数据
  useEffect(() => {
    fetchMonthData(currentMonth);
    loadTasks(); // 加载任务数据
  }, [currentMonth]);

  // 导航处理函数
  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(prev => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDate(null);
  }, []);

  // 获取选定日期的条目
  const getEntriesForDate = (date: Date): Diary[] => {
    const dateKey = formatDateKey(date);
    const dayData = aggregatedData.get(dateKey);
    return dayData?.entries || [];
  };

  // 获取选定日期的任务
  const getTasksForDate = (date: Date): TaskWithCategory[] => {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = task.due_date.split('T')[0];
      return taskDate === dateStr;
    });
  };

  return (
    <div className={`calendar-page ${isDark ? 'dark' : ''}`}>
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        isCurrentMonth={isSameMonth(currentMonth, new Date())}
      />
      
      {isLoading ? (
        <LoadingOverlay isOpen={true} message="加载日历数据中..." />
      ) : error ? (
        <div className="p-4">
          <ErrorMessage message={error} onClose={() => setError(null)} />
          <button
            onClick={() => fetchMonthData(currentMonth)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            重试
          </button>
        </div>
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
          entries={getEntriesForDate(selectedDate)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
