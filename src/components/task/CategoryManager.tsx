// ============================================
// Category Manager Component
// 分类管理组件
// ============================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useTaskStore } from '../../store/taskStore';
import { ConfirmDialog } from '../ConfirmDialog';
import { Toast } from '../Toast';
import type { Category } from '../../types/task';

// ============================================
// Component Props
// ============================================

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================
// Predefined Colors
// 预定义颜色
// ============================================

const PRESET_COLORS = [
  { name: '红色 Red', value: '#ef4444' },
  { name: '橙色 Orange', value: '#f97316' },
  { name: '黄色 Yellow', value: '#eab308' },
  { name: '绿色 Green', value: '#22c55e' },
  { name: '青色 Cyan', value: '#06b6d4' },
  { name: '蓝色 Blue', value: '#3b82f6' },
  { name: '紫色 Purple', value: '#a855f7' },
  { name: '粉色 Pink', value: '#ec4899' },
  { name: '灰色 Gray', value: '#6b7280' },
];

// ============================================
// Component
// ============================================

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const isDark = useThemeStore((state) => state.isDark);
  const {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesWithCount,
    clearError,
  } = useTaskStore();

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', color: PRESET_COLORS[0].value });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

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

  // Get categories with task count
  const categoriesWithCount = getCategoriesWithCount();

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

  // Handle create category
  const handleCreate = () => {
    setFormMode('create');
    setEditingCategory(null);
    setFormData({ name: '', color: PRESET_COLORS[0].value });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Handle edit category
  const handleEdit = (category: Category) => {
    setFormMode('edit');
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color || PRESET_COLORS[0].value });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Handle delete category click
  const handleDeleteClick = (categoryId: string) => {
    setDeletingCategoryId(categoryId);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deletingCategoryId) return;

    try {
      await deleteCategory(deletingCategoryId);
      setToast({
        isOpen: true,
        message: '✅ 分类已删除 Category deleted successfully',
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
      setDeletingCategoryId(null);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = '分类名称不能为空 Category name is required';
    } else if (formData.name.trim().length > 100) {
      errors.name = '分类名称不能超过 100 个字符 Category name cannot exceed 100 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (formMode === 'create') {
        await createCategory({
          name: formData.name.trim(),
          color: formData.color,
        });
        setToast({
          isOpen: true,
          message: '✅ 分类已创建 Category created successfully',
          type: 'success',
        });
      } else if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          color: formData.color,
        });
        setToast({
          isOpen: true,
          message: '✅ 分类已更新 Category updated successfully',
          type: 'success',
        });
      }

      setIsFormOpen(false);
      setFormData({ name: '', color: PRESET_COLORS[0].value });
      setEditingCategory(null);
    } catch (error) {
      setToast({
        isOpen: true,
        message: '❌ 操作失败 Operation failed',
        type: 'error',
      });
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setFormData({ name: '', color: PRESET_COLORS[0].value });
    setFormErrors({});
    setEditingCategory(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-2xl max-h-[80vh] overflow-hidden
          rounded-xl shadow-2xl z-50
          ${isDark ? 'bg-gray-800' : 'bg-white'}
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Tag className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              分类管理 Category Management
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}
            `}
            aria-label="关闭 Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* Create Button */}
          {!isFormOpen && (
            <button
              onClick={handleCreate}
              className="w-full mb-4 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              创建新分类 Create New Category
            </button>
          )}

          {/* Form */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className={`
                  mb-6 p-4 rounded-lg border
                  ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}
                `}
              >
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formMode === 'create' ? '创建分类 Create Category' : '编辑分类 Edit Category'}
                </h3>

                {/* Name Input */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    分类名称 Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：工作、学习、生活... e.g., Work, Study, Life..."
                    className={`
                      w-full px-4 py-2 rounded-lg border transition-colors
                      ${isDark 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                      }
                      focus:outline-none focus:ring-2 focus:ring-purple-500/20
                      ${formErrors.name ? 'border-red-500' : ''}
                    `}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                {/* Color Picker */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    分类颜色 Category Color
                  </label>
                  <div className="grid grid-cols-9 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`
                          w-10 h-10 rounded-lg transition-all
                          ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-purple-500' : ''}
                          ${isDark ? 'ring-offset-gray-900' : 'ring-offset-white'}
                        `}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        aria-label={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '保存中... Saving...' : formMode === 'create' ? '创建 Create' : '保存 Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleFormCancel}
                    className={`
                      flex-1 px-4 py-2 rounded-lg transition-colors
                      ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}
                    `}
                  >
                    取消 Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Category List */}
          <div className="space-y-2">
            <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              已有分类 Existing Categories ({categoriesWithCount.length})
            </h3>

            {categoriesWithCount.length === 0 ? (
              <div className={`
                text-center py-8 rounded-lg border
                ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}
              `}>
                <Tag className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  还没有分类，点击上方按钮创建 No categories yet, click above to create
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {categoriesWithCount.map((category) => (
                  <motion.div
                    key={category.id}
                    layout
                    className={`
                      flex items-center justify-between p-4 rounded-lg border transition-colors
                      ${isDark ? 'bg-gray-900 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color || '#6b7280' }}
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {category.name}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {category.task_count} 个任务 {category.task_count} {category.task_count === 1 ? 'task' : 'tasks'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className={`
                          p-2 rounded-lg transition-colors
                          ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}
                        `}
                        aria-label="编辑 Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category.id)}
                        className={`
                          p-2 rounded-lg transition-colors
                          ${isDark ? 'hover:bg-red-900/20 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-600 hover:text-red-600'}
                        `}
                        aria-label="删除 Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="删除分类 Delete Category"
        message="确定要删除这个分类吗？该分类下的任务将不再有分类标签。Are you sure you want to delete this category? Tasks in this category will no longer have a category label."
        confirmText="删除 Delete"
        cancelText="取消 Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingCategoryId(null);
        }}
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </>
  );
}
