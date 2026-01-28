// ============================================
// TaskForm Component
// 任务表单组件
// ============================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useTaskStore } from '../../store/taskStore';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskPriority } from '../../types/task';
import { TASK_CONSTRAINTS, PRIORITY_CONFIG } from '../../types/task';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  mode: 'create' | 'edit';
  defaultDueDate?: string; // YYYY-MM-DD format
}

export function TaskForm({ isOpen, onClose, task, mode, defaultDueDate }: TaskFormProps) {
  const isDark = useThemeStore((state) => state.isDark);
  const { categories, createTask, updateTask, isLoading } = useTaskStore();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with task data when editing
  useEffect(() => {
    if (mode === 'edit' && task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setCategoryId(task.category_id || '');
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    } else {
      resetForm();
    }
  }, [mode, task, isOpen]);

  // Set default due date when provided
  useEffect(() => {
    if (mode === 'create' && defaultDueDate && isOpen) {
      setDueDate(defaultDueDate);
    }
  }, [mode, defaultDueDate, isOpen]);

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategoryId('');
    setDueDate('');
    setErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate title
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      newErrors.title = '任务标题不能为空 Task title cannot be empty';
    } else if (trimmedTitle.length > TASK_CONSTRAINTS.TITLE_MAX_LENGTH) {
      newErrors.title = `任务标题不能超过 ${TASK_CONSTRAINTS.TITLE_MAX_LENGTH} 个字符 Title cannot exceed ${TASK_CONSTRAINTS.TITLE_MAX_LENGTH} characters`;
    }

    // Validate description
    if (description.length > TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `任务描述不能超过 ${TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} 个字符 Description cannot exceed ${TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`;
    }

    // Validate due date
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        newErrors.dueDate = '无效的日期格式 Invalid date format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        const input: CreateTaskInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          category_id: categoryId || undefined,
          due_date: dueDate || undefined,
        };
        await createTask(input);
      } else if (mode === 'edit' && task) {
        const input: UpdateTaskInput = {
          title: title.trim(),
          description: description.trim() || null,
          priority,
          category_id: categoryId || null,
          due_date: dueDate || null,
        };
        await updateTask(task.id, input);
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      setErrors({ submit: '保存失败，请重试 Failed to save, please try again' });
    }
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`
            relative w-full max-w-lg rounded-lg shadow-xl
            ${isDark ? 'bg-gray-800' : 'bg-white'}
          `}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {mode === 'create' ? '创建任务 Create Task' : '编辑任务 Edit Task'}
            </h2>
            <button
              onClick={handleClose}
              className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              aria-label="关闭 Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="task-title"
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                任务标题 Task Title <span className="text-red-500">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入任务标题... Enter task title..."
                className={`
                  w-full px-3 py-2 rounded-lg border transition-colors
                  ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                  ${errors.title ? 'border-red-500' : 'focus:border-purple-500'}
                  focus:outline-none focus:ring-2 focus:ring-purple-500/20
                `}
                maxLength={TASK_CONSTRAINTS.TITLE_MAX_LENGTH}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <p id="title-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="task-description"
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                任务描述 Task Description
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入任务描述... Enter task description..."
                rows={3}
                className={`
                  w-full px-3 py-2 rounded-lg border transition-colors resize-none
                  ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                  ${errors.description ? 'border-red-500' : 'focus:border-purple-500'}
                  focus:outline-none focus:ring-2 focus:ring-purple-500/20
                `}
                maxLength={TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
              {errors.description && (
                <p id="description-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Priority and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label
                  htmlFor="task-priority"
                  className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  优先级 Priority
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className={`
                    w-full px-3 py-2 rounded-lg border transition-colors
                    ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                    focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20
                  `}
                >
                  {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="task-category"
                  className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  分类 Category
                </label>
                <select
                  id="task-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`
                    w-full px-3 py-2 rounded-lg border transition-colors
                    ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                    focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20
                  `}
                >
                  <option value="">无分类 No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="task-due-date"
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                截止日期 Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border transition-colors
                  ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                  ${errors.dueDate ? 'border-red-500' : 'focus:border-purple-500'}
                  focus:outline-none focus:ring-2 focus:ring-purple-500/20
                `}
                aria-invalid={!!errors.dueDate}
                aria-describedby={errors.dueDate ? 'due-date-error' : undefined}
              />
              {errors.dueDate && (
                <p id="due-date-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.dueDate}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.submit}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}
                `}
              >
                取消 Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  bg-purple-600 hover:bg-purple-700 text-white
                `}
              >
                <Save className="w-4 h-4" />
                {isLoading ? '保存中... Saving...' : mode === 'create' ? '创建 Create' : '保存 Save'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
