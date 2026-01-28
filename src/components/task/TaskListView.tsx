// ============================================
// Task List View Component
// 任务列表视图组件
// ============================================

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListTodo, ArrowUpDown } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { useThemeStore } from '../../store/themeStore';
import type { TaskWithCategory } from '../../types/task';

// ============================================
// Component Props
// ============================================

interface TaskListViewProps {
  tasks: TaskWithCategory[];
  onEdit: (task: TaskWithCategory) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, isComplete: boolean) => void;
  sortBy?: 'priority' | 'due_date' | 'created_at';
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (sortBy: 'priority' | 'due_date' | 'created_at') => void;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Sort tasks based on criteria
 * 根据条件排序任务
 */
function sortTasks(
  tasks: TaskWithCategory[],
  sortBy: 'priority' | 'due_date' | 'created_at',
  direction: 'asc' | 'desc'
): TaskWithCategory[] {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'priority': {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      }
      case 'due_date': {
        // Tasks without due dates go to the end
        if (!a.due_date && !b.due_date) comparison = 0;
        else if (!a.due_date) comparison = 1;
        else if (!b.due_date) comparison = -1;
        else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        break;
      }
      case 'created_at': {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      }
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

// ============================================
// Component
// ============================================

export function TaskListView({
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
  sortBy = 'created_at',
  sortDirection = 'desc',
  onSortChange,
}: TaskListViewProps) {
  const isDark = useThemeStore((state) => state.isDark);

  // Sort tasks
  const sortedTasks = useMemo(
    () => sortTasks(tasks, sortBy, sortDirection),
    [tasks, sortBy, sortDirection]
  );

  // Empty state
  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          text-center py-16 rounded-lg border
          ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}
        `}
      >
        <ListTodo className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
        <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          没有找到任务 No tasks found
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          尝试调整过滤器或创建新任务 Try adjusting filters or create a new task
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      {onSortChange && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            排序 Sort by:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSortChange('priority')}
              className={`
                px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5
                ${sortBy === 'priority'
                  ? 'bg-purple-600 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              优先级 Priority
              {sortBy === 'priority' && <ArrowUpDown className="w-3 h-3" />}
            </button>
            <button
              onClick={() => onSortChange('due_date')}
              className={`
                px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5
                ${sortBy === 'due_date'
                  ? 'bg-purple-600 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              截止日期 Due Date
              {sortBy === 'due_date' && <ArrowUpDown className="w-3 h-3" />}
            </button>
            <button
              onClick={() => onSortChange('created_at')}
              className={`
                px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5
                ${sortBy === 'created_at'
                  ? 'bg-purple-600 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              创建时间 Created
              {sortBy === 'created_at' && <ArrowUpDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      )}

      {/* Task Count */}
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        共 {tasks.length} 个任务 {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03 }}
              layout
            >
              <TaskCard
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
                showActions={true}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
