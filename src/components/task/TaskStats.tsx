// ============================================
// Task Statistics Component
// 任务统计组件
// ============================================

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Tag,
  Target
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useTaskStore } from '../../store/taskStore';

// ============================================
// Component Props
// ============================================

interface TaskStatsProps {
  dateRange?: {
    start: string;
    end: string;
  };
}

// ============================================
// Component
// ============================================

export function TaskStats({ dateRange }: TaskStatsProps) {
  const isDark = useThemeStore((state) => state.isDark);
  const { tasks, categories, getCategoriesWithCount } = useTaskStore();
  const [selectedView, setSelectedView] = useState<'overview' | 'priority' | 'category'>('overview');

  // 过滤任务（如果有日期范围）
  const filteredTasks = useMemo(() => {
    if (!dateRange) return tasks;
    
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    return tasks.filter(task => {
      const created = new Date(task.created_at);
      return created >= start && created <= end;
    });
  }, [tasks, dateRange]);

  // 计算统计数据
  const statistics = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'complete').length;
    const incomplete = filteredTasks.filter(t => t.status === 'incomplete').length;
    
    const now = new Date();
    const overdue = filteredTasks.filter(t => 
      t.status === 'incomplete' && 
      t.due_date && 
      new Date(t.due_date) < now
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueToday = filteredTasks.filter(t => {
      if (!t.due_date || t.status === 'complete') return false;
      const dueDate = new Date(t.due_date);
      return dueDate >= today && dueDate < tomorrow;
    }).length;

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const dueThisWeek = filteredTasks.filter(t => {
      if (!t.due_date || t.status === 'complete') return false;
      const dueDate = new Date(t.due_date);
      return dueDate >= today && dueDate < nextWeek;
    }).length;

    const completion_rate = total > 0 ? (completed / total) * 100 : 0;

    const by_priority = {
      high: filteredTasks.filter(t => t.priority === 'high').length,
      medium: filteredTasks.filter(t => t.priority === 'medium').length,
      low: filteredTasks.filter(t => t.priority === 'low').length,
    };

    const by_category: Record<string, number> = {};
    filteredTasks.forEach(task => {
      if (task.category_id) {
        by_category[task.category_id] = (by_category[task.category_id] || 0) + 1;
      }
    });

    return {
      total,
      completed,
      incomplete,
      overdue,
      dueToday,
      dueThisWeek,
      completion_rate: Math.round(completion_rate * 10) / 10,
      by_priority,
      by_category,
    };
  }, [filteredTasks]);

  const categoriesWithCount = getCategoriesWithCount();

  // 获取分类名称
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '未知分类';
  };

  // 获取分类颜色
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedView('overview')}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${selectedView === 'overview'
              ? 'bg-purple-600 text-white'
              : isDark
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }
          `}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          总览 Overview
        </button>
        <button
          onClick={() => setSelectedView('priority')}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${selectedView === 'priority'
              ? 'bg-purple-600 text-white'
              : isDark
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }
          `}
        >
          <Target className="w-4 h-4 inline mr-2" />
          优先级 Priority
        </button>
        <button
          onClick={() => setSelectedView('category')}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${selectedView === 'category'
              ? 'bg-purple-600 text-white'
              : isDark
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }
          `}
        >
          <Tag className="w-4 h-4 inline mr-2" />
          分类 Category
        </button>
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {statistics.total}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                总计 Total
              </div>
            </div>

            {/* Completed */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-500 mb-1">
                {statistics.completed}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                已完成 Completed
              </div>
            </div>

            {/* Incomplete */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <Circle className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-blue-500 mb-1">
                {statistics.incomplete}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                未完成 Incomplete
              </div>
            </div>

            {/* Overdue */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500 mb-1">
                {statistics.overdue}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                已过期 Overdue
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  完成率 Completion Rate
                </h3>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {statistics.completion_rate}%
              </span>
            </div>
            <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${statistics.completion_rate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
              />
            </div>
          </div>

          {/* Due Dates */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                截止日期 Due Dates
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-2xl font-bold text-orange-500 mb-1">
                  {statistics.dueToday}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  今天到期 Due Today
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-2xl font-bold text-yellow-500 mb-1">
                  {statistics.dueThisWeek}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  本周到期 Due This Week
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Priority View */}
      {selectedView === 'priority' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* High Priority */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  高优先级 High Priority
                </span>
              </div>
              <span className="text-2xl font-bold text-red-500">
                {statistics.by_priority.high}
              </span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: statistics.total > 0 
                    ? `${(statistics.by_priority.high / statistics.total) * 100}%` 
                    : '0%' 
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
              />
            </div>
          </div>

          {/* Medium Priority */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  中优先级 Medium Priority
                </span>
              </div>
              <span className="text-2xl font-bold text-yellow-500">
                {statistics.by_priority.medium}
              </span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: statistics.total > 0 
                    ? `${(statistics.by_priority.medium / statistics.total) * 100}%` 
                    : '0%' 
                }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                className="absolute top-0 left-0 h-full bg-yellow-500 rounded-full"
              />
            </div>
          </div>

          {/* Low Priority */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  低优先级 Low Priority
                </span>
              </div>
              <span className="text-2xl font-bold text-blue-500">
                {statistics.by_priority.low}
              </span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: statistics.total > 0 
                    ? `${(statistics.by_priority.low / statistics.total) * 100}%` 
                    : '0%' 
                }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Category View */}
      {selectedView === 'category' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {Object.entries(statistics.by_category).length > 0 ? (
            Object.entries(statistics.by_category).map(([categoryId, count], index) => (
              <div 
                key={categoryId}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(categoryId) }}
                    ></div>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getCategoryName(categoryId)}
                    </span>
                  </div>
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: getCategoryColor(categoryId) }}
                  >
                    {count}
                  </span>
                </div>
                <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: statistics.total > 0 
                        ? `${(count / statistics.total) * 100}%` 
                        : '0%' 
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{ backgroundColor: getCategoryColor(categoryId) }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className={`
              text-center py-12 rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}>
              <Tag className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                还没有分类任务 No categorized tasks yet
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
