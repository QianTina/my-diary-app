// ============================================
// Task Store - Zustand State Management
// 任务状态管理
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { taskService } from '../services/taskService';
import type {
  Task,
  Category,
  TaskWithCategory,
  TaskWithLinks,
  CreateTaskInput,
  UpdateTaskInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  TaskFilters,
  TaskStatistics,
  TaskViewMode,
  DateRange,
  CategoryWithCount,
} from '../types/task';

// ============================================
// Store Interface
// ============================================

interface TaskStore {
  // State
  tasks: TaskWithCategory[];
  categories: Category[];
  filters: TaskFilters;
  viewMode: TaskViewMode;
  selectedTask: TaskWithLinks | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Task Actions
  loadTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  uncompleteTask: (id: string) => Promise<void>;
  selectTask: (id: string) => Promise<void>;
  clearSelectedTask: () => void;
  
  // Category Actions
  loadCategories: () => Promise<void>;
  createCategory: (input: CreateCategoryInput) => Promise<void>;
  updateCategory: (id: string, input: UpdateCategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Filter Actions
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  
  // View Actions
  setViewMode: (mode: TaskViewMode) => void;
  
  // Computed Getters
  getFilteredTasks: () => TaskWithCategory[];
  getStatistics: () => TaskStatistics | null;
  getCategoriesWithCount: () => CategoryWithCount[];
  getTasksByCategory: (categoryId: string | null) => TaskWithCategory[];
  getOverdueTasks: () => TaskWithCategory[];
  getTodayTasks: () => TaskWithCategory[];
  
  // Utility Actions
  clearError: () => void;
  invalidateCache: () => void;
}

// ============================================
// Cache Configuration
// 缓存配置
// ============================================

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================
// Store Implementation
// ============================================

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial State
      tasks: [],
      categories: [],
      filters: {
        status: 'all',
        priority: 'all',
        category_id: 'all',
        due_date: 'all',
        search: '',
      },
      viewMode: 'list',
      selectedTask: null,
      isLoading: false,
      error: null,
      lastFetch: null,

      // ============================================
      // Task Actions
      // ============================================

      /**
       * Load all tasks from the server
       * 从服务器加载所有任务
       */
      loadTasks: async () => {
        const state = get();
        const now = Date.now();
        
        // Check cache
        if (state.lastFetch && now - state.lastFetch < CACHE_TTL) {
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await taskService.getTasks(state.filters);
          
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            return;
          }
          
          set({
            tasks: response.data || [],
            isLoading: false,
            lastFetch: now,
          });
        } catch (error) {
          console.error('Failed to load tasks:', error);
          set({
            error: '加载任务失败 Failed to load tasks',
            isLoading: false,
          });
        }
      },

      /**
       * Create a new task
       * 创建新任务
       */
      createTask: async (input: CreateTaskInput) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await taskService.createTask(input);
          
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            throw new Error(response.error.message);
          }
          
          if (response.data) {
            // Optimistic update
            set((state) => ({
              tasks: [{ ...response.data!, category: null }, ...state.tasks],
              isLoading: false,
              lastFetch: null, // Invalidate cache
            }));
            
            // Reload to get full data with category
            await get().loadTasks();
          }
        } catch (error) {
          console.error('Failed to create task:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Update an existing task
       * 更新现有任务
       */
      updateTask: async (id: string, input: UpdateTaskInput) => {
        set({ isLoading: true, error: null });
        
        try {
          // Optimistic update
          const oldTasks = get().tasks;
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...input } : task
            ),
          }));
          
          const response = await taskService.updateTask(id, input);
          
          if (response.error) {
            // Rollback on error
            set({ tasks: oldTasks, error: response.error.message, isLoading: false });
            throw new Error(response.error.message);
          }
          
          set({ isLoading: false, lastFetch: null });
          
          // Reload to get full data
          await get().loadTasks();
        } catch (error) {
          console.error('Failed to update task:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Delete a task
       * 删除任务
       */
      deleteTask: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Optimistic update
          const oldTasks = get().tasks;
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
          }));
          
          const response = await taskService.deleteTask(id);
          
          if (response.error) {
            // Rollback on error
            set({ tasks: oldTasks, error: response.error.message, isLoading: false });
            throw new Error(response.error.message);
          }
          
          set({ isLoading: false, lastFetch: null });
        } catch (error) {
          console.error('Failed to delete task:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Mark a task as complete
       * 标记任务为完成
       */
      completeTask: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Optimistic update
          const oldTasks = get().tasks;
          const now = new Date().toISOString();
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, status: 'complete' as const, completed_at: now }
                : task
            ),
          }));
          
          const response = await taskService.completeTask(id);
          
          if (response.error) {
            // Rollback on error
            set({ tasks: oldTasks, error: response.error.message, isLoading: false });
            throw new Error(response.error.message);
          }
          
          set({ isLoading: false, lastFetch: null });
        } catch (error) {
          console.error('Failed to complete task:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Mark a task as incomplete
       * 标记任务为未完成
       */
      uncompleteTask: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Optimistic update
          const oldTasks = get().tasks;
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, status: 'incomplete' as const, completed_at: null }
                : task
            ),
          }));
          
          const response = await taskService.uncompleteTask(id);
          
          if (response.error) {
            // Rollback on error
            set({ tasks: oldTasks, error: response.error.message, isLoading: false });
            throw new Error(response.error.message);
          }
          
          set({ isLoading: false, lastFetch: null });
        } catch (error) {
          console.error('Failed to uncomplete task:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Select a task to view details
       * 选择任务查看详情
       */
      selectTask: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await taskService.getTask(id);
          
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            return;
          }
          
          set({ selectedTask: response.data, isLoading: false });
        } catch (error) {
          console.error('Failed to select task:', error);
          set({
            error: '加载任务详情失败 Failed to load task details',
            isLoading: false,
          });
        }
      },

      /**
       * Clear selected task
       * 清除选中的任务
       */
      clearSelectedTask: () => {
        set({ selectedTask: null });
      },

      // ============================================
      // Category Actions
      // ============================================

      /**
       * Load all categories
       * 加载所有分类
       */
      loadCategories: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await taskService.getCategories();
          
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            return;
          }
          
          set({ categories: response.data || [], isLoading: false });
        } catch (error) {
          console.error('Failed to load categories:', error);
          set({
            error: '加载分类失败 Failed to load categories',
            isLoading: false,
          });
        }
      },

      /**
       * Create a new category
       * 创建新分类
       */
      createCategory: async (input: CreateCategoryInput) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await taskService.createCategory(input);
          
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            throw new Error(response.error.message);
          }
          
          if (response.data) {
            set((state) => ({
              categories: [...state.categories, response.data!],
              isLoading: false,
            }));
          }
        } catch (error) {
          console.error('Failed to create category:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Update a category
       * 更新分类
       */
      updateCategory: async (id: string, input: UpdateCategoryInput) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await taskService.updateCategory(id, input);
          
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            throw new Error(response.error.message);
          }
          
          if (response.data) {
            set((state) => ({
              categories: state.categories.map((cat) =>
                cat.id === id ? response.data! : cat
              ),
              isLoading: false,
            }));
            
            // Reload tasks to update category references
            await get().loadTasks();
          }
        } catch (error) {
          console.error('Failed to update category:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Delete a category
       * 删除分类
       */
      deleteCategory: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await taskService.deleteCategory(id);
          
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            throw new Error(response.error.message);
          }
          
          set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== id),
            isLoading: false,
          }));
          
          // Reload tasks to update category references
          await get().loadTasks();
        } catch (error) {
          console.error('Failed to delete category:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // ============================================
      // Filter Actions
      // ============================================

      /**
       * Set filters
       * 设置过滤器
       */
      setFilters: (filters: Partial<TaskFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          lastFetch: null, // Invalidate cache
        }));
        
        // Reload tasks with new filters
        get().loadTasks();
      },

      /**
       * Clear all filters
       * 清除所有过滤器
       */
      clearFilters: () => {
        set({
          filters: {
            status: 'all',
            priority: 'all',
            category_id: 'all',
            due_date: 'all',
            search: '',
          },
          lastFetch: null,
        });
        
        // Reload tasks
        get().loadTasks();
      },

      // ============================================
      // View Actions
      // ============================================

      /**
       * Set view mode
       * 设置视图模式
       */
      setViewMode: (mode: TaskViewMode) => {
        set({ viewMode: mode });
      },

      // ============================================
      // Computed Getters
      // ============================================

      /**
       * Get filtered tasks based on current filters
       * 根据当前过滤器获取过滤后的任务
       */
      getFilteredTasks: () => {
        const { tasks, filters } = get();
        
        return tasks.filter((task) => {
          // Status filter
          if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
            return false;
          }
          
          // Priority filter
          if (filters.priority && filters.priority !== 'all' && task.priority !== filters.priority) {
            return false;
          }
          
          // Category filter
          if (filters.category_id && filters.category_id !== 'all') {
            if (task.category_id !== filters.category_id) {
              return false;
            }
          }
          
          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesTitle = task.title.toLowerCase().includes(searchLower);
            const matchesDescription = task.description?.toLowerCase().includes(searchLower);
            if (!matchesTitle && !matchesDescription) {
              return false;
            }
          }
          
          return true;
        });
      },

      /**
       * Get task statistics
       * 获取任务统计
       */
      getStatistics: () => {
        const tasks = get().tasks;
        
        if (tasks.length === 0) {
          return null;
        }
        
        const total = tasks.length;
        const completed = tasks.filter((t) => t.status === 'complete').length;
        const incomplete = tasks.filter((t) => t.status === 'incomplete').length;
        
        const now = new Date();
        const overdue = tasks.filter(
          (t) => t.status === 'incomplete' && t.due_date && new Date(t.due_date) < now
        ).length;
        
        const completion_rate = total > 0 ? (completed / total) * 100 : 0;
        
        const by_priority = {
          high: tasks.filter((t) => t.priority === 'high').length,
          medium: tasks.filter((t) => t.priority === 'medium').length,
          low: tasks.filter((t) => t.priority === 'low').length,
        };
        
        const by_category: Record<string, number> = {};
        tasks.forEach((task) => {
          if (task.category_id) {
            by_category[task.category_id] = (by_category[task.category_id] || 0) + 1;
          }
        });
        
        return {
          total,
          completed,
          incomplete,
          overdue,
          completion_rate: Math.round(completion_rate * 10) / 10,
          by_priority,
          by_category,
        };
      },

      /**
       * Get categories with task count
       * 获取带任务数量的分类
       */
      getCategoriesWithCount: () => {
        const { categories, tasks } = get();
        
        return categories.map((category) => ({
          ...category,
          task_count: tasks.filter((task) => task.category_id === category.id).length,
        }));
      },

      /**
       * Get tasks by category
       * 按分类获取任务
       */
      getTasksByCategory: (categoryId: string | null) => {
        const tasks = get().tasks;
        return tasks.filter((task) => task.category_id === categoryId);
      },

      /**
       * Get overdue tasks
       * 获取过期任务
       */
      getOverdueTasks: () => {
        const tasks = get().tasks;
        const now = new Date();
        
        return tasks.filter(
          (task) =>
            task.status === 'incomplete' &&
            task.due_date &&
            new Date(task.due_date) < now
        );
      },

      /**
       * Get today's tasks
       * 获取今天的任务
       */
      getTodayTasks: () => {
        const tasks = get().tasks;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return tasks.filter((task) => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate >= today && dueDate < tomorrow;
        });
      },

      // ============================================
      // Utility Actions
      // ============================================

      /**
       * Clear error message
       * 清除错误消息
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Invalidate cache and force reload
       * 使缓存失效并强制重新加载
       */
      invalidateCache: () => {
        set({ lastFetch: null });
      },
    }),
    {
      name: 'task-store',
      partialize: (state) => ({
        filters: state.filters,
        viewMode: state.viewMode,
      }),
    }
  )
);
