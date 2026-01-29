// ============================================
// Task Management Type Definitions
// 任务管理类型定义
// ============================================

// ============================================
// Enums and Literal Types
// ============================================

/**
 * Task priority levels
 * 任务优先级
 */
export type TaskPriority = 'high' | 'medium' | 'low';

/**
 * Task completion status
 * 任务完成状态
 */
export type TaskStatus = 'complete' | 'incomplete';

/**
 * Task view mode
 * 任务视图模式
 */
export type TaskViewMode = 'list' | 'kanban';

/**
 * Due date filter options
 * 截止日期过滤选项
 */
export type DueDateFilter = 'overdue' | 'today' | 'week' | 'month' | 'all';

// ============================================
// Database Entity Types
// 数据库实体类型
// ============================================

/**
 * Task entity from database
 * 数据库中的任务实体
 */
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category_id: string | null;
  due_date: string | null; // ISO 8601 format
  completed_at: string | null; // ISO 8601 format
  created_at: string;
  updated_at: string;
}

/**
 * Category entity from database
 * 数据库中的分类实体
 */
export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Task-Diary link entity from database
 * 数据库中的任务-日记关联实体
 */
export interface TaskDiaryLink {
  id: string;
  task_id: string;
  diary_entry_id: string;
  created_at: string;
}

// ============================================
// Extended Types with Relations
// 带关联的扩展类型
// ============================================

/**
 * Task with category information
 * 带分类信息的任务
 */
export interface TaskWithCategory extends Task {
  category: Category | null;
}

/**
 * Task with all related data
 * 带所有关联数据的任务
 */
export interface TaskWithLinks extends TaskWithCategory {
  diary_links: TaskDiaryLink[];
}

/**
 * Category with task count
 * 带任务数量的分类
 */
export interface CategoryWithCount extends Category {
  task_count: number;
}

// ============================================
// Input Types for CRUD Operations
// CRUD 操作的输入类型
// ============================================

/**
 * Input for creating a new task
 * 创建新任务的输入
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category_id?: string;
  due_date?: string; // ISO 8601 format
}

/**
 * Input for updating an existing task
 * 更新现有任务的输入
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  category_id?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
}

/**
 * Input for creating a new category
 * 创建新分类的输入
 */
export interface CreateCategoryInput {
  name: string;
  color?: string;
}

/**
 * Input for updating an existing category
 * 更新现有分类的输入
 */
export interface UpdateCategoryInput {
  name?: string;
  color?: string;
}

// ============================================
// Filter and Search Types
// 过滤和搜索类型
// ============================================

/**
 * Filters for querying tasks
 * 查询任务的过滤器
 */
export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  category_id?: string | 'all';
  due_date?: DueDateFilter;
  search?: string;
}

/**
 * Sort options for tasks
 * 任务排序选项
 */
export interface TaskSortOptions {
  field: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'title';
  direction: 'asc' | 'desc';
}

// ============================================
// Statistics Types
// 统计类型
// ============================================

/**
 * Task statistics and metrics
 * 任务统计和指标
 */
export interface TaskStatistics {
  total: number;
  completed: number;
  incomplete: number;
  overdue: number;
  completion_rate: number; // Percentage (0-100)
  by_priority: {
    high: number;
    medium: number;
    low: number;
  };
  by_category: Record<string, number>; // category_id -> count
}

/**
 * Date range for statistics filtering
 * 统计过滤的日期范围
 */
export interface DateRange {
  start: string; // ISO 8601 format
  end: string; // ISO 8601 format
}

// ============================================
// UI State Types
// UI 状态类型
// ============================================

/**
 * Task form state
 * 任务表单状态
 */
export interface TaskFormState {
  mode: 'create' | 'edit';
  task: Task | null;
  isOpen: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

/**
 * Task list state
 * 任务列表状态
 */
export interface TaskListState {
  tasks: TaskWithCategory[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

/**
 * Category manager state
 * 分类管理器状态
 */
export interface CategoryManagerState {
  categories: CategoryWithCount[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
}

// ============================================
// Validation Types
// 验证类型
// ============================================

/**
 * Validation result
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validation rules for task fields
 * 任务字段的验证规则
 */
export interface TaskValidationRules {
  title: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  description: {
    maxLength: number;
  };
  priority: {
    allowedValues: TaskPriority[];
  };
  status: {
    allowedValues: TaskStatus[];
  };
}

// ============================================
// Service Response Types
// 服务响应类型
// ============================================

/**
 * Generic service response
 * 通用服务响应
 */
export interface ServiceResponse<T> {
  data: T | null;
  error: ServiceError | null;
}

/**
 * Service error
 * 服务错误
 */
export interface ServiceError {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

// ============================================
// Calendar Integration Types
// 日历集成类型
// ============================================

/**
 * Task for calendar display
 * 用于日历显示的任务
 */
export interface CalendarTask {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  category: Category | null;
}

// ============================================
// Diary Integration Types
// 日记集成类型
// ============================================

/**
 * Task linked to a diary entry
 * 链接到日记条目的任务
 */
export interface DiaryLinkedTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  link_created_at: string;
}

// ============================================
// Utility Types
// 工具类型
// ============================================

/**
 * Partial task for optimistic updates
 * 用于乐观更新的部分任务
 */
export type PartialTask = Partial<Task> & { id: string };

/**
 * Task with computed properties
 * 带计算属性的任务
 */
export interface TaskWithComputed extends TaskWithCategory {
  isOverdue: boolean;
  isDueToday: boolean;
  isDueThisWeek: boolean;
  daysUntilDue: number | null;
}

// ============================================
// Constants
// 常量
// ============================================

/**
 * Default task values
 * 默认任务值
 */
export const DEFAULT_TASK_VALUES = {
  priority: 'medium' as TaskPriority,
  status: 'incomplete' as TaskStatus,
} as const;

/**
 * Validation constraints
 * 验证约束
 */
export const TASK_CONSTRAINTS = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 500,
  DESCRIPTION_MAX_LENGTH: 5000,
  CATEGORY_NAME_MIN_LENGTH: 1,
  CATEGORY_NAME_MAX_LENGTH: 100,
} as const;

/**
 * Priority display configuration
 * 优先级显示配置
 */
export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; order: number }> = {
  high: {
    label: '高 High',
    color: 'text-red-500',
    order: 1,
  },
  medium: {
    label: '中 Medium',
    color: 'text-yellow-500',
    order: 2,
  },
  low: {
    label: '低 Low',
    color: 'text-blue-500',
    order: 3,
  },
} as const;

/**
 * Status display configuration
 * 状态显示配置
 */
export const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: string }> = {
  complete: {
    label: '已完成 Complete',
    icon: 'check-circle',
  },
  incomplete: {
    label: '未完成 Incomplete',
    icon: 'circle',
  },
} as const;
