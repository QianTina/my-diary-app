// ============================================
// Task Management Page
// 任务管理页面
// ============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ListTodo, LayoutGrid, BarChart3, Tag } from 'lucide-react';
import { Header } from '../components/Header';
import { TaskFilters } from '../components/task/TaskFilters';
import { TaskListView } from '../components/task/TaskListView';
import { TaskForm } from '../components/task/TaskForm';
import { TaskStats } from '../components/task/TaskStats';
import { CategoryManager } from '../components/task/CategoryManager';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { useThemeStore } from '../store/themeStore';
import { useTaskStore } from '../store/taskStore';
import type { TaskWithCategory } from '../types/task';

// ============================================
// Component
// ============================================

export default function TaskManagementPage() {
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
        message: '✅ 任务已删除 Task deleted successfully',
        type: 'success',
      });
    } catch (error) {
      setToast({
        isOpen: true,
        message: '❌ 删除失败 Delete failed',
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
          message: '✅ 任务标记为未完成 Task marked as incomplete',
          type: 'success',
        });
      } else {
        await completeTask(taskId);
        setToast({
          isOpen: true,
          message: '🎉 任务已完成 Task completed',
          type: 'success',
        });
      }
    } catch (error) {
      setToast({
        isOpen: true,
        message: '❌ 操作失败 Operation failed',
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
                任务管理 Task Management
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                管理你的待办事项和项目任务 Manage your todos and project tasks
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
                <span className="hidden sm:inline">分类 Categories</span>
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
                <span className="hidden sm:inline">统计 Stats</span>
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
                  aria-label="列表视图 List view"
                >
                  <ListTodo className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">列表 List</span>
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
                  aria-label="看板视图 Kanban view"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">看板 Kanban</span>
                </button>
              </div>

              {/* New Task Button */}
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">新建任务 New Task</span>
                <span className="sm:hidden">新建 New</span>
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
                加载中... Loading...
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
            <div className={`
              text-center py-16 rounded-lg border
              ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}
            `}>
              <LayoutGrid className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                看板视图开发中 Kanban View Coming Soon
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                看板视图功能即将推出 Kanban view will be available soon
              </p>
            </div>
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
        title="删除任务 Delete Task"
        message="确定要删除这个任务吗？此操作无法撤销。Are you sure you want to delete this task? This action cannot be undone."
        confirmText="删除 Delete"
        cancelText="取消 Cancel"
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
