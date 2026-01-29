/**
 * 纸质风格日记本服务接口定义
 * 
 * 此文件定义了纸质风格日记本功能的所有服务接口
 */

import type {
  Notebook,
  DiaryEntry,
  CreateNotebookInput,
  UpdateNotebookInput,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
  Page,
  MigrationResult,
  MigrationStatus,
  SearchResult,
} from './notebook';

/**
 * 日记本的 Supabase 服务接口
 */
export interface NotebookService {
  /**
   * 获取用户的所有日记本
   * @param userId - 用户 ID
   * @returns 日记本列表
   */
  getNotebooks: (userId: string) => Promise<Notebook[]>;

  /**
   * 获取单个日记本
   * @param id - 日记本 ID
   * @returns 日记本对象
   */
  getNotebook: (id: string) => Promise<Notebook>;

  /**
   * 创建新日记本
   * @param notebook - 日记本创建数据
   * @returns 创建的日记本对象
   */
  createNotebook: (notebook: CreateNotebookInput) => Promise<Notebook>;

  /**
   * 更新日记本
   * @param id - 日记本 ID
   * @param updates - 更新数据
   * @returns 更新后的日记本对象
   */
  updateNotebook: (id: string, updates: UpdateNotebookInput) => Promise<Notebook>;

  /**
   * 删除日记本
   * @param id - 日记本 ID
   */
  deleteNotebook: (id: string) => Promise<void>;

  /**
   * 归档日记本
   * @param id - 日记本 ID
   */
  archiveNotebook: (id: string) => Promise<void>;
}

/**
 * 条目的 Supabase 服务接口
 */
export interface EntryService {
  /**
   * 获取日记本的所有条目
   * @param notebookId - 日记本 ID
   * @returns 条目列表
   */
  getEntriesForNotebook: (notebookId: string) => Promise<DiaryEntry[]>;

  /**
   * 获取单个条目
   * @param id - 条目 ID
   * @returns 条目对象
   */
  getEntry: (id: string) => Promise<DiaryEntry>;

  /**
   * 创建新条目
   * @param entry - 条目创建数据
   * @returns 创建的条目对象
   */
  createEntry: (entry: CreateDiaryEntryInput) => Promise<DiaryEntry>;

  /**
   * 更新条目
   * @param id - 条目 ID
   * @param updates - 更新数据
   * @returns 更新后的条目对象
   */
  updateEntry: (id: string, updates: UpdateDiaryEntryInput) => Promise<DiaryEntry>;

  /**
   * 删除条目
   * @param id - 条目 ID
   */
  deleteEntry: (id: string) => Promise<void>;

  /**
   * 搜索条目
   * @param userId - 用户 ID
   * @param query - 搜索查询
   * @param notebookId - 可选的日记本 ID（限制搜索范围）
   * @returns 搜索结果列表
   */
  searchEntries: (userId: string, query: string, notebookId?: string) => Promise<SearchResult[]>;
}

/**
 * 现有条目的迁移服务接口
 */
export interface MigrationService {
  /**
   * 为用户创建默认日记本
   * @param userId - 用户 ID
   * @returns 创建的默认日记本对象
   */
  createDefaultNotebook: (userId: string) => Promise<Notebook>;

  /**
   * 迁移现有条目到默认日记本
   * @param userId - 用户 ID
   * @param defaultNotebookId - 默认日记本 ID
   * @returns 迁移结果（包含迁移的条目数量）
   */
  migrateExistingEntries: (userId: string, defaultNotebookId: string) => Promise<MigrationResult>;

  /**
   * 检查用户的迁移状态
   * @param userId - 用户 ID
   * @returns 迁移状态（是否需要迁移及未迁移条目数量）
   */
  checkMigrationStatus: (userId: string) => Promise<MigrationStatus>;
}

/**
 * 分页服务接口
 */
export interface PaginationService {
  /**
   * 根据条目内容和视口尺寸计算页面布局
   * @param entries - 条目列表
   * @param viewportHeight - 视口高度
   * @param fontSize - 字体大小
   * @returns 页面列表
   */
  calculatePages: (entries: DiaryEntry[], viewportHeight: number, fontSize: number) => Page[];

  /**
   * 获取当前可见的页面（当前页 + 相邻页）
   * @param allPages - 所有页面
   * @param currentPage - 当前页码
   * @returns 可见页面列表
   */
  getVisiblePages: (allPages: Page[], currentPage: number) => Page[];

  /**
   * 预加载相邻页面
   * @param currentPage - 当前页码
   * @param totalPages - 总页数
   * @returns 需要预加载的页码列表
   */
  preloadAdjacentPages: (currentPage: number, totalPages: number) => number[];
}
