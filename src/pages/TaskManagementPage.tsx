// ============================================
// Task Management Page
// 任务管理页面
// ============================================

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, ListTodo, LayoutGrid, BarChart3, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { TaskFilters } from '../components/task/TaskFilters';
import { TaskListView } from '../components/task/TaskListView';
import { TaskKanbanView } from '../components/task/TaskKanbanView';
import { TaskForm } from '../components/task/TaskForm';
import { TaskStats } from '../components/task/TaskStats';
import { CategoryManager } from '../components/task/CategoryManager';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { useThemeStore } from '../store/themeStore';
import { useTaskStore } from '../store/taskStore';
import { useKeyboardShortcuts, TASK_SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import type { TaskWithCategory } from '../types/task';

// ============================================
// Component
// ============================================

export default function TaskManagementPage() {
  const { t } = useTranslation();
  const isDark = useThemeStore((state) => state.isDark);
  const {
    tasks,
    isLoading,
    error,
    viewMode,
    loadTasks,
    loadCategories,
    completeTask,
    uncompleteTask,
    deleteTask,
    setViewMode,
    getFilteredTasks,
    getStatistics,
    clearError,
  } = useTaskStore();

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingTask, setEditingTask] = useState<TaskWithCategory | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Statistics panel state
  const [showStats, setShowStats] = useState(false);

  // Category manager state
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Sort state
  const [sortBy, setSortBy] = useState<'priority' | 'due_date' | 'created_at'>('created_at');

  // Kanban group by state
  const [kanbanGroupBy, setKanbanGroupBy] = useState<'priority' | 'status'>('priority');

  // Search input ref for keyboard focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: TASK_SHORTCUTS.NEW_TASK.key,
      handler: () => handleCreateTask(),
    },
    {
      key: TASK_SHORTCUTS.SEARCH.key,
      handler: () => searchInputRef.current?.focus(),
    },
    {
      key: TASK_SHORTCUTS.TOGGLE_VIEW.key,
      handler: () => setViewMode(viewMode === 'list' ? 'kanban' : 'list'),
    },
    {
      key: TASK_SHORTCUTS.TOGGLE_STATS.key,
      handler: () => setShowStats(!showStats),
    },
    {
      key: TASK_SHORTCUTS.ESCAPE.key,
      handler: () => {
        if (isFormOpen) setIsFormOpen(false);
        if (showCategoryManager) setShowCategoryManager(false);
        if (deleteDialogOpen) setDeleteDialogOpen(false);
      },
    },
  ]);

  // Toast state
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  // Load tasks and categories on mount
  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  // Show error toast
  useEffect(() => {
    if (error) {
      setToast({
        isOpen: true,
        message: error,
        type: 'error',
      });
      clearError();
    }
  }, [error]);

  // Get filtered tasks
  const filteredTasks = getFilteredTasks();
  const statistics = getStatistics();

  // Handle create task
  const handleCreateTask = () => {
    setFormMode('create');
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Handle edit task
  const handleEditTask = (task: TaskWithCategory) => {
    setFormMode('edit');
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Handle delete task click
  const handleDeleteClick = (taskId: string) => {
    setDeletingTaskId(taskId);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deletingTaskId) return;

    try {
      await deleteTask(deletingTaskId);
      setToast({
        isOpen: true,
        message: t('task.taskDeleted'),
        type: 'success',
      });
    } catch (error) {
      setToast({
        isOpen: true,
        message: t('error.deleteTask'),
        type: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingTaskId(null);
    }
  };

  // Handle toggle complete
  const handleToggleComplete = async (taskId: string, isComplete: boolean) => {
    try {
      if (isComplete) {
        await uncompleteTask(taskId);
        setToast({
          isOpen: true,
          message: t('task.taskIncomplete'),
          type: 'success',
        });
      } else {
        await completeTask(taskId);
        setToast({
          isOpen: true,
          message: t('task.taskCompleted'),
          type: 'success',
        });
      }
    } catch (error) {
      setToast({
        isOpen: true,
        message: t('task.operationFailed'),
        type: 'error',
      });
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <ListTodo className="w-8 h-8 text-purple-600" />
                {t('task.title')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('task.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Category Manager Button */}
              <button
                onClick={() => setShowCategoryManager(true)}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                  ${isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                    : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
                  }
                `}
              >
                <Tag className="w-4 h-4" />
                <span className="hidden sm:inline">{t('category.title')}</span>
              </button>

              {/* Statistics Button */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                  ${showStats
                    ? 'bg-purple-600 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                    : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
                  }
                `}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('task.stats.title')}</span>
              </button>

              {/* View Mode Toggle */}
              <div className={`flex items-center rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    px-3 py-2 rounded-l-lg transition-colors flex items-center gap-2
                    ${viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-400 hover:text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900'
                    }
                  `}
                  aria-label={t('task.view.list')}
                >
                  <ListTodo className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{t('task.view.list')}</span>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`
                    px-3 py-2 rounded-r-lg transition-colors flex items-center gap-2
                    ${viewMode === 'kanban'
                      ? 'bg-purple-600 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-400 hover:text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900'
                    }
                  `}
                  aria-label={t('task.view.kanban')}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{t('task.view.kanban')}</span>
                </button>
              </div>

              {/* New Task Button */}
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('task.newTask')}</span>
                <span className="sm:hidden">{t('common.create')}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Panel */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`
              mb-6 p-6 rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              任务统计 Task Statistics
            </h3>
            <TaskStats />
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <TaskFilters />
        </motion.div>

        {/* Task View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading && tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('common.loading')}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <TaskListView
              tasks={filteredTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteClick}
              onToggleComplete={handleToggleComplete}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          ) : (
            <>
              {/* Kanban Group By Toggle */}
              <div className="mb-4 flex items-center gap-3">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('task.view.groupBy')}:
                </span>
                <div className={`flex items-center rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setKanbanGroupBy('priority')}
                    className={`
                      px-3 py-1.5 rounded-l-lg transition-colors text-sm
                      ${kanbanGroupBy === 'priority'
                        ? 'bg-purple-600 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-400 hover:text-white'
                        : 'bg-white text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    {t('task.view.groupByPriority')}
                  </button>
                  <button
                    onClick={() => setKanbanGroupBy('status')}
                    className={`
                      px-3 py-1.5 rounded-r-lg transition-colors text-sm
                      ${kanbanGroupBy === 'status'
                        ? 'bg-purple-600 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-400 hover:text-white'
                        : 'bg-white text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    {t('task.view.groupByStatus')}
                  </button>
                </div>
              </div>

              {/* Kanban View */}
              <TaskKanbanView
                tasks={filteredTasks}
                onEdit={handleEditTask}
                onDelete={handleDeleteClick}
                onToggleComplete={handleToggleComplete}
                groupBy={kanbanGroupBy}
              />
            </>
          )}
        </motion.div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        task={editingTask}
        mode={formMode}
      />

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title={t('task.deleteTask')}
        message={t('task.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingTaskId(null);
        }}
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
}
