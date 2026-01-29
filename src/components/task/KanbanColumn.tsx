// ============================================
// Kanban Column Component
// 看板列组件
// ============================================

import { memo } from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTaskCard } from './SortableTaskCard';
import { useThemeStore } from '../../store/themeStore';
import type { TaskWithCategory } from '../../types/task';

// ============================================
// Types
// ============================================

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: TaskWithCategory[];
  color: string;
  onEdit: (task: TaskWithCategory) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, isComplete: boolean) => void;
}

// ============================================
// Color Mapping
// ============================================

const colorClasses = {
  red: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-500/20 text-red-700 dark:text-red-300',
  },
  yellow: {
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-600 dark:text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  },
  blue: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  },
  green: {
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-500/20 text-green-700 dark:text-green-300',
  },
};

// ============================================
// Component
// ============================================

export const KanbanColumn = memo(function KanbanColumn({
  id,
  title,
  tasks,
  color,
  onEdit,
  onDelete,
  onToggleComplete,
}: KanbanColumnProps) {
  const isDark = useThemeStore((state) => state.isDark);
  const { setNodeRef, isOver } = useDroppable({ id });

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex flex-col h-full min-h-[500px] rounded-lg border-2 transition-all
        ${isOver ? `${colors.border} ${colors.bg}` : isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
      `}
    >
      {/* Column Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <span
            className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${colors.badge}
            `}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="flex-1 p-4 overflow-y-auto space-y-3"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                暂无任务 No tasks
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            ))
          )}
        </SortableContext>
      </div>
    </motion.div>
  );
});
