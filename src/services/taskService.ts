// ============================================
// Task Service
// 任务服务
// ============================================
// This service handles all task-related operations with Supabase
// 此服务处理所有与 Supabase 相关的任务操作

import { supabase } from '../utils/supabase';
import { retryWithBackoff, isRetryableError } from '../utils/retry';
import type {
  Task,
  Category,
  TaskDiaryLink,
  CreateTaskInput,
  UpdateTaskInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  TaskFilters,
  TaskStatistics,
  TaskWithCategory,
  TaskWithLinks,
  ServiceResponse,
  ServiceError,
  DateRange,
} from '../types/task';
import { TASK_CONSTRAINTS } from '../types/task';

// ============================================
// Validation Functions
// 验证函数
// ============================================

/**
 * Validate task title
 * 验证任务标题
 */
function validateTitle(title: string): ServiceError | null {
  const trimmed = title.trim();
  
  if (trimmed.length === 0) {
    return {
      code: 'INVALID_TITLE',
      message: '任务标题不能为空 Task title cannot be empty',
      field: 'title',
    };
  }
  
  if (trimmed.length > TASK_CONSTRAINTS.TITLE_MAX_LENGTH) {
    return {
      code: 'TITLE_TOO_LONG',
      message: `任务标题不能超过 ${TASK_CONSTRAINTS.TITLE_MAX_LENGTH} 个字符 Task title cannot exceed ${TASK_CONSTRAINTS.TITLE_MAX_LENGTH} characters`,
      field: 'title',
    };
  }
  
  return null;
}

/**
 * Validate task description
 * 验证任务描述
 */
function validateDescription(description: string | null | undefined): ServiceError | null {
  if (!description) return null;
  
  if (description.length > TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
    return {
      code: 'DESCRIPTION_TOO_LONG',
      message: `任务描述不能超过 ${TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} 个字符 Task description cannot exceed ${TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`,
      field: 'description',
    };
  }
  
  return null;
}

/**
 * Validate category name
 * 验证分类名称
 */
function validateCategoryName(name: string): ServiceError | null {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return {
      code: 'INVALID_CATEGORY_NAME',
      message: '分类名称不能为空 Category name cannot be empty',
      field: 'name',
    };
  }
  
  if (trimmed.length > TASK_CONSTRAINTS.CATEGORY_NAME_MAX_LENGTH) {
    return {
      code: 'CATEGORY_NAME_TOO_LONG',
      message: `分类名称不能超过 ${TASK_CONSTRAINTS.CATEGORY_NAME_MAX_LENGTH} 个字符 Category name cannot exceed ${TASK_CONSTRAINTS.CATEGORY_NAME_MAX_LENGTH} characters`,
      field: 'name',
    };
  }
  
  return null;
}

/**
 * Validate due date format
 * 验证截止日期格式
 */
function validateDueDate(dueDate: string | null | undefined): ServiceError | null {
  if (!dueDate) return null;
  
  const date = new Date(dueDate);
  if (isNaN(date.getTime())) {
    return {
      code: 'INVALID_DATE_FORMAT',
      message: '无效的日期格式 Invalid date format',
      field: 'due_date',
    };
  }
  
  return null;
}

// ============================================
// Task Service Class
// 任务服务类
// ============================================

export class TaskService {
  /**
   * Get current authenticated user ID
   * 获取当前认证用户 ID
   */
  private async getCurrentUserId(): Promise<string | null> {
    if (!supabase) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Handle Supabase errors
   * 处理 Supabase 错误
   */
  private handleError(error: unknown, operation: string): ServiceError {
    console.error(`TaskService ${operation} error:`, error);
    
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        code: 'DATABASE_ERROR',
        message: String(error.message),
        details: error,
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: `操作失败 ${operation} failed`,
      details: error,
    };
  }

  // ============================================
  // Task CRUD Operations
  // 任务 CRUD 操作
  // ============================================

  /**
   * Create a new task
   * 创建新任务
   */
  async createTask(input: CreateTaskInput): Promise<ServiceResponse<Task>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      // Validate input
      const titleError = validateTitle(input.title);
      if (titleError) return { data: null, error: titleError };

      const descError = validateDescription(input.description);
      if (descError) return { data: null, error: descError };

      const dueDateError = validateDueDate(input.due_date);
      if (dueDateError) return { data: null, error: dueDateError };

      // Get current user
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      // Create task
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: input.title.trim(),
          description: input.description?.trim() || null,
          priority: input.priority || 'medium',
          category_id: input.category_id || null,
          due_date: input.due_date || null,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: this.handleError(error, 'createTask') };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'createTask') };
    }
  }

  /**
   * Get a single task by ID
   * 根据 ID 获取单个任务
   */
  async getTask(id: string): Promise<ServiceResponse<TaskWithLinks>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      // Get task with category
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (taskError) {
        return { data: null, error: this.handleError(taskError, 'getTask') };
      }

      if (!task) {
        return {
          data: null,
          error: { code: 'NOT_FOUND', message: '任务不存在 Task not found' },
        };
      }

      // Get diary links
      const { data: links, error: linksError } = await supabase
        .from('task_diary_links')
        .select('*')
        .eq('task_id', id);

      if (linksError) {
        return { data: null, error: this.handleError(linksError, 'getTask') };
      }

      return {
        data: {
          ...task,
          diary_links: links || [],
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'getTask') };
    }
  }

  /**
   * Get all tasks with optional filters
   * 获取所有任务（可选过滤）
   */
  async getTasks(filters?: TaskFilters): Promise<ServiceResponse<TaskWithCategory[]>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      // Build query
      let query = supabase
        .from('tasks')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', userId);

      // Apply filters
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters.priority && filters.priority !== 'all') {
          query = query.eq('priority', filters.priority);
        }

        if (filters.category_id && filters.category_id !== 'all') {
          query = query.eq('category_id', filters.category_id);
        }

        if (filters.due_date && filters.due_date !== 'all') {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          switch (filters.due_date) {
            case 'overdue':
              query = query.lt('due_date', today.toISOString()).eq('status', 'incomplete');
              break;
            case 'today':
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              query = query.gte('due_date', today.toISOString()).lt('due_date', tomorrow.toISOString());
              break;
            case 'week':
              const nextWeek = new Date(today);
              nextWeek.setDate(nextWeek.getDate() + 7);
              query = query.gte('due_date', today.toISOString()).lt('due_date', nextWeek.toISOString());
              break;
            case 'month':
              const nextMonth = new Date(today);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              query = query.gte('due_date', today.toISOString()).lt('due_date', nextMonth.toISOString());
              break;
          }
        }

        // Search query (client-side filtering for now)
        // TODO: Implement full-text search with PostgreSQL
      }

      // Order by created_at descending
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return { data: null, error: this.handleError(error, 'getTasks') };
      }

      // Apply search filter client-side
      let filteredData = data || [];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(task =>
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower))
        );
      }

      return { data: filteredData, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'getTasks') };
    }
  }

  /**
   * Update an existing task
   * 更新现有任务
   */
  async updateTask(id: string, input: UpdateTaskInput): Promise<ServiceResponse<Task>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      // Validate input
      if (input.title !== undefined) {
        const titleError = validateTitle(input.title);
        if (titleError) return { data: null, error: titleError };
      }

      if (input.description !== undefined) {
        const descError = validateDescription(input.description);
        if (descError) return { data: null, error: descError };
      }

      if (input.due_date !== undefined) {
        const dueDateError = validateDueDate(input.due_date);
        if (dueDateError) return { data: null, error: dueDateError };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {};
      if (input.title !== undefined) updateData.title = input.title.trim();
      if (input.description !== undefined) updateData.description = input.description?.trim() || null;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.category_id !== undefined) updateData.category_id = input.category_id;
      if (input.due_date !== undefined) updateData.due_date = input.due_date;
      if (input.completed_at !== undefined) updateData.completed_at = input.completed_at;

      // Update task
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: this.handleError(error, 'updateTask') };
      }

      if (!data) {
        return {
          data: null,
          error: { code: 'NOT_FOUND', message: '任务不存在 Task not found' },
        };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'updateTask') };
    }
  }

  /**
   * Delete a task
   * 删除任务
   */
  async deleteTask(id: string): Promise<ServiceResponse<void>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return { data: null, error: this.handleError(error, 'deleteTask') };
      }

      return { data: undefined, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'deleteTask') };
    }
  }

  // ============================================
  // Task Status Operations
  // 任务状态操作
  // ============================================

  /**
   * Mark a task as complete
   * 标记任务为完成
   */
  async completeTask(id: string): Promise<ServiceResponse<Task>> {
    return this.updateTask(id, {
      status: 'complete',
      completed_at: new Date().toISOString(),
    } as UpdateTaskInput);
  }

  /**
   * Mark a task as incomplete
   * 标记任务为未完成
   */
  async uncompleteTask(id: string): Promise<ServiceResponse<Task>> {
    return this.updateTask(id, {
      status: 'incomplete',
      completed_at: null,
    } as UpdateTaskInput);
  }

  // ============================================
  // Category Operations
  // 分类操作
  // ============================================

  /**
   * Create a new category
   * 创建新分类
   */
  async createCategory(input: CreateCategoryInput): Promise<ServiceResponse<Category>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      // Validate input
      const nameError = validateCategoryName(input.name);
      if (nameError) return { data: null, error: nameError };

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          name: input.name.trim(),
          color: input.color || null,
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          return {
            data: null,
            error: {
              code: 'DUPLICATE_CATEGORY',
              message: '分类名称已存在 Category name already exists',
              field: 'name',
            },
          };
        }
        return { data: null, error: this.handleError(error, 'createCategory') };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'createCategory') };
    }
  }

  /**
   * Get all categories
   * 获取所有分类
   */
  async getCategories(): Promise<ServiceResponse<Category[]>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) {
        return { data: null, error: this.handleError(error, 'getCategories') };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'getCategories') };
    }
  }

  /**
   * Update a category
   * 更新分类
   */
  async updateCategory(id: string, input: UpdateCategoryInput): Promise<ServiceResponse<Category>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      if (input.name !== undefined) {
        const nameError = validateCategoryName(input.name);
        if (nameError) return { data: null, error: nameError };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name.trim();
      if (input.color !== undefined) updateData.color = input.color;

      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return {
            data: null,
            error: {
              code: 'DUPLICATE_CATEGORY',
              message: '分类名称已存在 Category name already exists',
              field: 'name',
            },
          };
        }
        return { data: null, error: this.handleError(error, 'updateCategory') };
      }

      if (!data) {
        return {
          data: null,
          error: { code: 'NOT_FOUND', message: '分类不存在 Category not found' },
        };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'updateCategory') };
    }
  }

  /**
   * Delete a category
   * 删除分类
   */
  async deleteCategory(id: string): Promise<ServiceResponse<void>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return { data: null, error: this.handleError(error, 'deleteCategory') };
      }

      return { data: undefined, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'deleteCategory') };
    }
  }

  // ============================================
  // Diary Link Operations
  // 日记关联操作
  // ============================================

  /**
   * Link a task to a diary entry
   * 将任务链接到日记条目
   */
  async linkTaskToDiary(taskId: string, diaryEntryId: string): Promise<ServiceResponse<TaskDiaryLink>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      const { data, error } = await supabase
        .from('task_diary_links')
        .insert({
          task_id: taskId,
          diary_entry_id: diaryEntryId,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return {
            data: null,
            error: {
              code: 'LINK_EXISTS',
              message: '链接已存在 Link already exists',
            },
          };
        }
        return { data: null, error: this.handleError(error, 'linkTaskToDiary') };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'linkTaskToDiary') };
    }
  }

  /**
   * Unlink a task from a diary entry
   * 取消任务与日记条目的链接
   */
  async unlinkTaskFromDiary(taskId: string, diaryEntryId: string): Promise<ServiceResponse<void>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      const { error } = await supabase
        .from('task_diary_links')
        .delete()
        .eq('task_id', taskId)
        .eq('diary_entry_id', diaryEntryId);

      if (error) {
        return { data: null, error: this.handleError(error, 'unlinkTaskFromDiary') };
      }

      return { data: undefined, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'unlinkTaskFromDiary') };
    }
  }

  /**
   * Get all tasks linked to a diary entry
   * 获取链接到日记条目的所有任务
   */
  async getTasksForDiaryEntry(diaryEntryId: string): Promise<ServiceResponse<Task[]>> {
    try {
      if (!supabase) {
        return {
          data: null,
          error: { code: 'NO_CLIENT', message: 'Supabase client not initialized' },
        };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: '用户未登录 User not authenticated' },
        };
      }

      const { data, error } = await supabase
        .from('task_diary_links')
        .select(`
          task:tasks(*)
        `)
        .eq('diary_entry_id', diaryEntryId);

      if (error) {
        return { data: null, error: this.handleError(error, 'getTasksForDiaryEntry') };
      }

      const tasks = (data?.map(item => (item as any).task).filter(Boolean) || []) as Task[];
      return { data: tasks, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'getTasksForDiaryEntry') };
    }
  }

  // ============================================
  // Statistics Operations
  // 统计操作
  // ============================================

  /**
   * Get task statistics
   * 获取任务统计
   */
  async getStatistics(dateRange?: DateRange): Promise<ServiceResponse<TaskStatistics>> {
    try {
      const tasksResponse = await this.getTasks();
      
      if (tasksResponse.error || !tasksResponse.data) {
        return { data: null, error: tasksResponse.error };
      }

      let tasks = tasksResponse.data;

      // Filter by date range if provided
      if (dateRange) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        tasks = tasks.filter(task => {
          const created = new Date(task.created_at);
          return created >= start && created <= end;
        });
      }

      // Calculate statistics
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'complete').length;
      const incomplete = tasks.filter(t => t.status === 'incomplete').length;
      
      const now = new Date();
      const overdue = tasks.filter(t => 
        t.status === 'incomplete' && 
        t.due_date && 
        new Date(t.due_date) < now
      ).length;

      const completion_rate = total > 0 ? (completed / total) * 100 : 0;

      const by_priority = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      };

      const by_category: Record<string, number> = {};
      tasks.forEach(task => {
        if (task.category_id) {
          by_category[task.category_id] = (by_category[task.category_id] || 0) + 1;
        }
      });

      const statistics: TaskStatistics = {
        total,
        completed,
        incomplete,
        overdue,
        completion_rate: Math.round(completion_rate * 10) / 10,
        by_priority,
        by_category,
      };

      return { data: statistics, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'getStatistics') };
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();
