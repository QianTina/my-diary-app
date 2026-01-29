/**
 * 纸质风格日记本 Store 接口定义
 * 
 * 此文件定义了纸质风格日记本功能的所有 Zustand store 接口
 */

import type {
  Notebook,
  DiaryEntry,
  CreateNotebookInput,
  UpdateNotebookInput,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
  PaginationState,
  ViewMode,
  UIPreferences,
  SearchResult,
} from './notebook';

/**
 * 日记本 Store 接口
 */
export interface NotebookStore {
  // 状态
  /** 日记本列表 */
  notebooks: Notebook[];
  /** 当前活动的日记本 */
  activeNotebook: Notebook | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;

  // 操作
  /**
   * 获取用户的所有日记本
   */
  fetchNotebooks: () => Promise<void>;

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
   */
  updateNotebook: (id: string, updates: UpdateNotebookInput) => Promise<void>;

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

  /**
   * 设置当前活动的日记本
   * @param notebook - 日记本对象
   */
  setActiveNotebook: (notebook: Notebook) => void;
}

/**
 * 条目 Store 接口
 */
export interface EntryStore {
  // 状态
  /** 条目列表 */
  entries: DiaryEntry[];
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;

  // 操作
  /**
   * 获取日记本的所有条目
   * @param notebookId - 日记本 ID
   */
  fetchEntriesForNotebook: (notebookId: string) => Promise<void>;

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
   */
  updateEntry: (id: string, updates: UpdateDiaryEntryInput) => Promise<void>;

  /**
   * 删除条目
   * @param id - 条目 ID
   */
  deleteEntry: (id: string) => Promise<void>;

  /**
   * 切换条目的书签状态
   * @param id - 条目 ID
   */
  toggleBookmark: (id: string) => Promise<void>;

  /**
   * 搜索条目
   * @param query - 搜索查询
   * @param notebookId - 可选的日记本 ID（限制搜索范围）
   * @returns 搜索结果列表
   */
  searchEntries: (query: string, notebookId?: string) => Promise<SearchResult[]>;
}

/**
 * UI Store 接口
 * 用于页面导航和用户偏好设置
 */
export interface UIStore {
  // 状态
  /** 视图模式 */
  viewMode: ViewMode;
  /** 分页状态 */
  paginationState: PaginationState;
  /** 是否显示目录 */
  showTableOfContents: boolean;
  /** 是否显示书签面板 */
  showBookmarks: boolean;
  /** 是否启用环境音效 */
  ambientSoundEnabled: boolean;
  /** 环境音效音量 */
  ambientSoundVolume: number;
  /** 是否启用减少动画模式 */
  reduceMotion: boolean;
  /** 是否启用高对比度模式 */
  highContrast: boolean;

  // 操作
  /**
   * 设置视图模式
   * @param mode - 视图模式
   */
  setViewMode: (mode: ViewMode) => void;

  /**
   * 导航到指定页面
   * @param pageNumber - 页码
   */
  navigateToPage: (pageNumber: number) => void;

  /**
   * 导航到下一页
   */
  navigateNext: () => void;

  /**
   * 导航到上一页
   */
  navigatePrevious: () => void;

  /**
   * 跳转到指定日期的条目
   * @param date - 日期
   */
  jumpToDate: (date: Date) => void;

  /**
   * 切换目录显示状态
   */
  toggleTableOfContents: () => void;

  /**
   * 切换书签面板显示状态
   */
  toggleBookmarks: () => void;

  /**
   * 设置环境音效
   * @param enabled - 是否启用
   * @param volume - 音量（可选）
   */
  setAmbientSound: (enabled: boolean, volume?: number) => void;

  /**
   * 设置无障碍偏好
   * @param key - 偏好设置键
   * @param value - 偏好设置值
   */
  setAccessibilityPreference: (key: string, value: boolean) => void;

  /**
   * 加载用户偏好设置
   */
  loadPreferences: () => void;

  /**
   * 保存用户偏好设置
   */
  savePreferences: () => void;
}
