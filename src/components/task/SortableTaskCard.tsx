// ============================================
// Sortable Task Card Component
// 可排序的任务卡片组件
// ============================================

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import type { TaskWithCategory } from '../../types/task';

// ============================================
// Types
// ============================================

interface SortableTaskCardProps {
  task: TaskWithCategory;
  onEdit: (task: TaskWithCategory) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, isComplete: boolean) => void;
}

// ============================================
// Component
// ============================================

export const SortableTaskCard = memo(function SortableTaskCard({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete}
      />
    </div>
  );
});
