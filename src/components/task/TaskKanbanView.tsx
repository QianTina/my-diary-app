// ============================================
// Task Kanban View Component
// 任务看板视图组件
// ============================================

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { KanbanColumn } from './KanbanColumn';
import { useTaskStore } from '../../store/taskStore';
import type { TaskWithCategory, TaskPriority, TaskStatus } from '../../types/task';

// ============================================
// Types
// ============================================

interface TaskKanbanViewProps {
  tasks: TaskWithCategory[];
  onEdit: (task: TaskWithCategory) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, isComplete: boolean) => void;
  groupBy?: 'priority' | 'status';
}

type ColumnId = TaskPriority | TaskStatus;

interface Column {
  id: ColumnId;
  title: string;
  tasks: TaskWithCategory[];
  color: string;
}

// ============================================
// Component
// ============================================

export function TaskKanbanView({
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
  groupBy = 'priority',
}: TaskKanbanViewProps) {
  const { updateTask } = useTaskStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks into columns
  const columns = useMemo<Column[]>(() => {
    if (groupBy === 'priority') {
      return [
        {
          id: 'high',
          title: '高优先级 High Priority',
          tasks: tasks.filter((t) => t.priority === 'high'),
          color: 'red',
        },
        {
          id: 'medium',
          title: '中优先级 Medium Priority',
          tasks: tasks.filter((t) => t.priority === 'medium'),
          color: 'yellow',
        },
        {
          id: 'low',
          title: '低优先级 Low Priority',
          tasks: tasks.filter((t) => t.priority === 'low'),
          color: 'blue',
        },
      ];
    } else {
      return [
        {
          id: 'incomplete',
          title: '未完成 To Do',
          tasks: tasks.filter((t) => t.status === 'incomplete'),
          color: 'blue',
        },
        {
          id: 'complete',
          title: '已完成 Completed',
          tasks: tasks.filter((t) => t.status === 'complete'),
          color: 'green',
        },
      ];
    }
  }, [tasks, groupBy]);

  // Get active task for drag overlay
  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeId),
    [activeId, tasks]
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTaskId = active.id as string;
    const overColumnId = over.id as ColumnId;

    // Find the task being dragged
    const task = tasks.find((t) => t.id === activeTaskId);
    if (!task) {
      setActiveId(null);
      return;
    }

    // Update task based on groupBy mode
    try {
      if (groupBy === 'priority') {
        // Update priority
        if (task.priority !== overColumnId) {
          await updateTask(task.id, { priority: overColumnId as TaskPriority });
        }
      } else {
        // Update status
        if (task.status !== overColumnId) {
          if (overColumnId === 'complete') {
            await updateTask(task.id, {
              status: 'complete',
              completed_at: new Date().toISOString(),
            });
          } else {
            await updateTask(task.id, {
              status: 'incomplete',
              completed_at: null,
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }

    setActiveId(null);
  };

  // Handle drag cancel
  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={column.tasks}
            color={column.color}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80 rotate-3 scale-105">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              onToggleComplete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
