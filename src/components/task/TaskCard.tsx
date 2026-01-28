// ============================================
// TaskCard Component
// 任务卡片组件
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Edit2, 
  Trash2, 
  Calendar,
  Tag as TagIcon,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useTaskStore } from '../../store/taskStore';
import type { TaskWithCategory } from '../../types/task';
import { PRIORITY_CONFIG } from '../../types/task';

interface TaskCardProps {
  task: TaskWithCategory;
  onEdit?: (task: TaskWithCategory) => void;
  onDelete?: (taskId: string) => void;
  onToggleComplete?: (taskId: string, isComplete: boolean) => void;
  showActions?: boolean;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  showActions = true,
}: TaskCardProps) {
  const isDark = useThemeStore((state) => state.isDark);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate if task is overdue
  const isOverdue = task.status === 'incomplete' && task.due_date && new Date(task.due_date) < new Date();

  // Format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (taskDate.getTime() === today.getTime()) {
      return '今天 Today';
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return '明天 Tomorrow';
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Handle checkbox click
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(task.id, task.status === 'complete');
    }
  };

  // Handle edit click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    }
  };

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative rounded-lg border p-4 transition-all
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        ${isHovered ? (isDark ? 'border-gray-600 shadow-lg' : 'border-gray-300 shadow-md') : ''}
        ${task.status === 'complete' ? 'opacity-60' : ''}
      `}
    >
      {/* Priority indicator bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
          priorityConfig.color.replace('text-', 'bg-')
        }`}
      />

      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className={`
            flex-shrink-0 mt-0.5 transition-colors
            ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
          `}
          aria-label={task.status === 'complete' ? '标记为未完成 Mark as incomplete' : '标记为完成 Mark as complete'}
        >
          {task.status === 'complete' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={`
              text-base font-medium mb-1
              ${task.status === 'complete' ? 'line-through' : ''}
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p
              className={`
                text-sm mb-2 line-clamp-2
                ${isDark ? 'text-gray-400' : 'text-gray-600'}
              `}
            >
              {task.description}
            </p>
          )}

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Priority badge */}
            <span
              className={`
                px-2 py-0.5 rounded-full font-medium
                ${isDark ? 'bg-gray-700' : 'bg-gray-100'}
                ${priorityConfig.color}
              `}
            >
              {priorityConfig.label}
            </span>

            {/* Category badge */}
            {task.category && (
              <span
                className={`
                  flex items-center gap-1 px-2 py-0.5 rounded-full
                  ${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}
                `}
              >
                <TagIcon className="w-3 h-3" />
                {task.category.name}
              </span>
            )}

            {/* Due date */}
            {task.due_date && (
              <span
                className={`
                  flex items-center gap-1 px-2 py-0.5 rounded-full
                  ${
                    isOverdue
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : isDark
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }
                `}
              >
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                <Calendar className="w-3 h-3" />
                {formatDueDate(task.due_date)}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {showActions && (
          <div
            className={`
              flex items-center gap-1 transition-opacity
              ${isHovered ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <button
              onClick={handleEditClick}
              className={`
                p-1.5 rounded transition-colors
                ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400' : 'hover:bg-blue-50 text-gray-600 hover:text-blue-600'}
              `}
              aria-label="编辑任务 Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDeleteClick}
              className={`
                p-1.5 rounded transition-colors
                ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-600 hover:text-red-600'}
              `}
              aria-label="删除任务 Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Overdue indicator */}
      {isOverdue && (
        <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-3 h-3" />
          <span>已过期 Overdue</span>
        </div>
      )}
    </motion.div>
  );
}
