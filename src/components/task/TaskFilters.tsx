// ============================================
// Task Filters Component
// 任务过滤器组件
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useTaskStore } from '../../store/taskStore';
import type { TaskFilters as TaskFiltersType, TaskPriority, TaskStatus, DueDateFilter } from '../../types/task';

// ============================================
// Component Props
// ============================================

interface TaskFiltersProps {
  onFiltersChange?: (filters: TaskFiltersType) => void;
}

// ============================================
// Component
// ============================================

export function TaskFilters({ onFiltersChange }: TaskFiltersProps) {
  const isDark = useThemeStore((state) => state.isDark);
  const { filters, categories, setFilters, clearFilters } = useTaskStore();

  // Local search state for debouncing
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters({ search: searchInput });
        onFiltersChange?.({ ...filters, search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle filter change
  const handleFilterChange = useCallback((key: keyof TaskFiltersType, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters({ [key]: value });
    onFiltersChange?.(newFilters);
  }, [filters, setFilters, onFiltersChange]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    clearFilters();
    onFiltersChange?.({
      status: 'all',
      priority: 'all',
      category_id: 'all',
      due_date: 'all',
      search: '',
    });
  }, [clearFilters, onFiltersChange]);

  // Check if any filters are active
  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category_id !== 'all' ||
    filters.due_date !== 'all' ||
    (filters.search && filters.search.length > 0);

  return (
    <div
      className={`
        rounded-lg border p-4
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            过滤器 Filters
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-600 text-white">
              已启用 Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className={`
                text-sm px-3 py-1 rounded-md transition-colors
                ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
              `}
            >
              清除 Clear
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              lg:hidden p-1 rounded-md transition-colors
              ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            `}
            aria-label={isExpanded ? '收起过滤器 Collapse filters' : '展开过滤器 Expand filters'}
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索任务标题或描述... Search tasks..."
            className={`
              w-full pl-10 pr-10 py-2 rounded-lg border transition-colors
              ${isDark 
                ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              }
              focus:outline-none focus:ring-2 focus:ring-purple-500/20
            `}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className={`
                absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors
                ${isDark ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}
              `}
              aria-label="清除搜索 Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Options - Responsive */}
      <div className={`
        grid gap-3
        ${isExpanded ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}
        ${!isExpanded && 'hidden lg:grid'}
      `}>
        {/* Status Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            状态 Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`
              w-full px-3 py-2 rounded-lg border transition-colors
              ${isDark 
                ? 'bg-gray-900 border-gray-600 text-white focus:border-purple-500' 
                : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
              }
              focus:outline-none focus:ring-2 focus:ring-purple-500/20
            `}
          >
            <option value="all">全部 All</option>
            <option value="incomplete">未完成 Incomplete</option>
            <option value="complete">已完成 Complete</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            优先级 Priority
          </label>
          <select
            value={filters.priority || 'all'}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className={`
              w-full px-3 py-2 rounded-lg border transition-colors
              ${isDark 
                ? 'bg-gray-900 border-gray-600 text-white focus:border-purple-500' 
                : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
              }
              focus:outline-none focus:ring-2 focus:ring-purple-500/20
            `}
          >
            <option value="all">全部 All</option>
            <option value="high">高 High</option>
            <option value="medium">中 Medium</option>
            <option value="low">低 Low</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            分类 Category
          </label>
          <select
            value={filters.category_id || 'all'}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
            className={`
              w-full px-3 py-2 rounded-lg border transition-colors
              ${isDark 
                ? 'bg-gray-900 border-gray-600 text-white focus:border-purple-500' 
                : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
              }
              focus:outline-none focus:ring-2 focus:ring-purple-500/20
            `}
          >
            <option value="all">全部 All</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            截止日期 Due Date
          </label>
          <select
            value={filters.due_date || 'all'}
            onChange={(e) => handleFilterChange('due_date', e.target.value)}
            className={`
              w-full px-3 py-2 rounded-lg border transition-colors
              ${isDark 
                ? 'bg-gray-900 border-gray-600 text-white focus:border-purple-500' 
                : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
              }
              focus:outline-none focus:ring-2 focus:ring-purple-500/20
            `}
          >
            <option value="all">全部 All</option>
            <option value="overdue">已过期 Overdue</option>
            <option value="today">今天 Today</option>
            <option value="week">本周 This Week</option>
            <option value="month">本月 This Month</option>
          </select>
        </div>
      </div>
    </div>
  );
}
