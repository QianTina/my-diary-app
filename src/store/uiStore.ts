/**
 * UI 状态管理 Store
 * 使用 Zustand 管理 UI 状态、页面导航和用户偏好设置
 */

import { create } from 'zustand';
import type { UIStore } from '../types/notebook-stores';
import type { ViewMode, PaginationState } from '../types/notebook';

/**
 * localStorage 键名
 */
const STORAGE_KEYS = {
  VIEW_MODE: 'paper-diary-ui-view-mode',
  AMBIENT_SOUND_ENABLED: 'paper-diary-ui-ambient-sound-enabled',
  AMBIENT_SOUND_VOLUME: 'paper-diary-ui-ambient-sound-volume',
  REDUCE_MOTION: 'paper-diary-ui-reduce-motion',
  HIGH_CONTRAST: 'paper-diary-ui-high-contrast',
} as const;

/**
 * 默认分页状态
 */
const DEFAULT_PAGINATION_STATE: PaginationState = {
  currentPage: 1,
  totalPages: 0,
  visiblePages: [],
  loadedPageRange: [1, 1],
};

/**
 * 从 localStorage 加载偏好设置
 */
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return defaultValue;
    }
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * 保存偏好设置到 localStorage
 */
const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

/**
 * UI Store
 * 管理视图模式、分页状态、UI 切换和用户偏好设置
 */
export const useUIStore = create<UIStore>((set, get) => ({
  // 状态
  viewMode: loadFromStorage<ViewMode>(STORAGE_KEYS.VIEW_MODE, 'list'),
  paginationState: DEFAULT_PAGINATION_STATE,
  showTableOfContents: false,
  showBookmarks: false,
  ambientSoundEnabled: loadFromStorage<boolean>(STORAGE_KEYS.AMBIENT_SOUND_ENABLED, false),
  ambientSoundVolume: loadFromStorage<number>(STORAGE_KEYS.AMBIENT_SOUND_VOLUME, 0.5),
  reduceMotion: loadFromStorage<boolean>(STORAGE_KEYS.REDUCE_MOTION, false),
  highContrast: loadFromStorage<boolean>(STORAGE_KEYS.HIGH_CONTRAST, false),

  /**
   * 设置视图模式
   */
  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
    saveToStorage(STORAGE_KEYS.VIEW_MODE, mode);
  },

  /**
   * 导航到指定页面
   */
  navigateToPage: (pageNumber: number) => {
    const { paginationState } = get();
    
    // 验证页码范围
    if (pageNumber < 1 || pageNumber > paginationState.totalPages) {
      console.warn(`Invalid page number: ${pageNumber}. Valid range: 1-${paginationState.totalPages}`);
      return;
    }
    
    set((state) => ({
      paginationState: {
        ...state.paginationState,
        currentPage: pageNumber,
        // 更新加载范围：当前页 ± 1
        loadedPageRange: [
          Math.max(1, pageNumber - 1),
          Math.min(state.paginationState.totalPages, pageNumber + 1),
        ],
      },
    }));
  },

  /**
   * 导航到下一页
   */
  navigateNext: () => {
    const { paginationState } = get();
    const nextPage = paginationState.currentPage + 1;
    
    if (nextPage <= paginationState.totalPages) {
      get().navigateToPage(nextPage);
    }
  },

  /**
   * 导航到上一页
   */
  navigatePrevious: () => {
    const { paginationState } = get();
    const previousPage = paginationState.currentPage - 1;
    
    if (previousPage >= 1) {
      get().navigateToPage(previousPage);
    }
  },

  /**
   * 跳转到指定日期的条目
   * 注意：此方法需要与 EntryStore 配合使用来查找日期对应的页码
   */
  jumpToDate: (date: Date) => {
    // 此方法的完整实现需要访问条目数据来确定日期对应的页码
    // 这里提供基本框架，实际实现需要在组件层面结合 EntryStore 使用
    console.log('jumpToDate called with date:', date);
    
    // TODO: 在实际使用时，组件应该：
    // 1. 从 EntryStore 获取条目列表
    // 2. 找到匹配日期的条目
    // 3. 计算该条目所在的页码
    // 4. 调用 navigateToPage(pageNumber)
    
    // 暂时不做任何操作，等待组件层面的实现
  },

  /**
   * 切换目录显示状态
   */
  toggleTableOfContents: () => {
    set((state) => ({
      showTableOfContents: !state.showTableOfContents,
      // 关闭书签面板（同时只显示一个侧边面板）
      showBookmarks: false,
    }));
  },

  /**
   * 切换书签面板显示状态
   */
  toggleBookmarks: () => {
    set((state) => ({
      showBookmarks: !state.showBookmarks,
      // 关闭目录（同时只显示一个侧边面板）
      showTableOfContents: false,
    }));
  },

  /**
   * 设置环境音效
   */
  setAmbientSound: (enabled: boolean, volume?: number) => {
    const updates: Partial<Pick<UIStore, 'ambientSoundEnabled' | 'ambientSoundVolume'>> = {
      ambientSoundEnabled: enabled,
    };
    
    if (volume !== undefined) {
      // 确保音量在 0-1 范围内
      updates.ambientSoundVolume = Math.max(0, Math.min(1, volume));
    }
    
    set(updates);
    
    // 保存到 localStorage
    saveToStorage(STORAGE_KEYS.AMBIENT_SOUND_ENABLED, enabled);
    if (volume !== undefined) {
      saveToStorage(STORAGE_KEYS.AMBIENT_SOUND_VOLUME, updates.ambientSoundVolume!);
    }
  },

  /**
   * 设置无障碍偏好
   */
  setAccessibilityPreference: (key: string, value: boolean) => {
    // 支持的无障碍偏好键
    const validKeys = ['reduceMotion', 'highContrast'] as const;
    
    if (!validKeys.includes(key as typeof validKeys[number])) {
      console.warn(`Invalid accessibility preference key: ${key}`);
      return;
    }
    
    // 更新状态
    set({ [key]: value });
    
    // 保存到 localStorage
    const storageKey = key === 'reduceMotion' 
      ? STORAGE_KEYS.REDUCE_MOTION 
      : STORAGE_KEYS.HIGH_CONTRAST;
    saveToStorage(storageKey, value);
  },

  /**
   * 加载用户偏好设置
   * 从 localStorage 加载所有偏好设置
   */
  loadPreferences: () => {
    set({
      viewMode: loadFromStorage<ViewMode>(STORAGE_KEYS.VIEW_MODE, 'list'),
      ambientSoundEnabled: loadFromStorage<boolean>(STORAGE_KEYS.AMBIENT_SOUND_ENABLED, false),
      ambientSoundVolume: loadFromStorage<number>(STORAGE_KEYS.AMBIENT_SOUND_VOLUME, 0.5),
      reduceMotion: loadFromStorage<boolean>(STORAGE_KEYS.REDUCE_MOTION, false),
      highContrast: loadFromStorage<boolean>(STORAGE_KEYS.HIGH_CONTRAST, false),
    });
  },

  /**
   * 保存用户偏好设置
   * 将当前所有偏好设置保存到 localStorage
   */
  savePreferences: () => {
    const state = get();
    
    saveToStorage(STORAGE_KEYS.VIEW_MODE, state.viewMode);
    saveToStorage(STORAGE_KEYS.AMBIENT_SOUND_ENABLED, state.ambientSoundEnabled);
    saveToStorage(STORAGE_KEYS.AMBIENT_SOUND_VOLUME, state.ambientSoundVolume);
    saveToStorage(STORAGE_KEYS.REDUCE_MOTION, state.reduceMotion);
    saveToStorage(STORAGE_KEYS.HIGH_CONTRAST, state.highContrast);
  },
}));
