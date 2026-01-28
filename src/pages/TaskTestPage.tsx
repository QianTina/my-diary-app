// ============================================
// Task Test Page
// 任务测试页面
// ============================================
// This is a temporary test page to showcase TaskCard and TaskForm components

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { Header } from '../components/Header';
import { TaskCard } from '../components/task/TaskCard';
import { TaskForm } from '../components/task/TaskForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { useThemeStore } from '../store/themeStore';
import { useTaskStore } from '../store/taskStore';
import type { TaskWithCategory } from '../types/task';

export default function TaskTestPage() {
  const isDark = useThemeStore((state) => state.isDark);
  const {
    tasks,
    isLoading,
    error,
    loadTasks,
    loadCategories,
    completeTask,
    uncompleteTask,
    deleteTask,
    clearError,
  } = useTaskStore();

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingTask, setEditingTask] = useState<TaskWithCategory | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

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

      <div className="p-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🧪 任务组件测试 Task Components Test
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            测试 TaskCard 和 TaskForm 组件 Testing TaskCard and TaskForm components
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-center gap-3"
        >
          <button
            onClick={handleCreateTask}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            创建任务 Create Task
          </button>

          <button
            onClick={() => {
              loadTasks();
              loadCategories();
            }}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
              ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新 Refresh
          </button>
        </motion.div>

        {/* Task Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
        >
          共 {tasks.length} 个任务 Total {tasks.length} tasks
        </motion.div>

        {/* Task List */}
        <div className="space-y-3">
          {isLoading && tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                加载中... Loading...
              </p>
            </div>
          ) : tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`
                text-center py-12 rounded-lg border
                ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}
              `}
            >
              <p className={`text-lg mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                还没有任务 No tasks yet
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                点击上方按钮创建第一个任务 Click the button above to create your first task
              </p>
            </motion.div>
          ) : (
            tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskCard
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteClick}
                  onToggleComplete={handleToggleComplete}
                  showActions={true}
                />
              </motion.div>
            ))
          )}
        </div>

        {/* Sample Tasks Info */}
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`
              mt-8 p-4 rounded-lg border
              ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}
            `}
          >
            <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
              💡 提示 Tips
            </h3>
            <ul className={`text-sm space-y-1 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              <li>• 点击"创建任务"按钮测试表单 Click "Create Task" to test the form</li>
              <li>• 创建任务后可以编辑和删除 After creating, you can edit and delete tasks</li>
              <li>• 点击复选框标记任务完成 Click checkbox to mark tasks as complete</li>
              <li>• 支持优先级、分类和截止日期 Supports priority, category, and due date</li>
            </ul>
          </motion.div>
        )}
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        task={editingTask}
        mode={formMode}
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
