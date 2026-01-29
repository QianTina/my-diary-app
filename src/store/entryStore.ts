/**
 * 日记条目状态管理 Store
 * 使用 Zustand 管理日记条目状态和操作
 */

import { create } from 'zustand';
import { entryService } from '../services/entryService';
import type { EntryStore } from '../types/notebook-stores';
import type { DiaryEntry, CreateDiaryEntryInput, UpdateDiaryEntryInput, SearchResult } from '../types/notebook';

/**
 * 条目 Store
 * 管理日记条目列表和相关操作
 */
export const useEntryStore = create<EntryStore>((set, get) => ({
  // 状态
  entries: [],
  loading: false,
  error: null,

  /**
   * 获取日记本的所有条目
   */
  fetchEntriesForNotebook: async (notebookId: string) => {
    set({ loading: true, error: null });
    
    try {
      const entries = await entryService.getEntriesForNotebook(notebookId);
      set({ entries, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch entries';
      set({ error: errorMessage, loading: false });
      console.error('fetchEntriesForNotebook error:', error);
    }
  },

  /**
   * 创建新条目
   * 使用乐观更新以获得更好的用户体验
   */
  createEntry: async (entry: CreateDiaryEntryInput) => {
    set({ loading: true, error: null });
    
    try {
      const createdEntry = await entryService.createEntry(entry);
      
      // 乐观更新：立即添加到本地状态
      set((state) => ({
        entries: [createdEntry, ...state.entries],
        loading: false,
      }));
      
      return createdEntry;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create entry';
      set({ error: errorMessage, loading: false });
      console.error('createEntry error:', error);
      throw error;
    }
  },

  /**
   * 更新条目
   * 使用乐观更新以获得更好的用户体验
   */
  updateEntry: async (id: string, updates: UpdateDiaryEntryInput) => {
    set({ loading: true, error: null });
    
    // 保存旧状态以便回滚
    const oldEntries = get().entries;
    
    try {
      // 乐观更新：立即更新本地状态
      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry
        ),
      }));
      
      // 执行实际更新
      const updatedEntry = await entryService.updateEntry(id, updates);
      
      // 使用服务器返回的数据更新状态
      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === id ? updatedEntry : entry
        ),
        loading: false,
      }));
    } catch (error) {
      // 回滚到旧状态
      set({
        entries: oldEntries,
        error: error instanceof Error ? error.message : 'Failed to update entry',
        loading: false,
      });
      console.error('updateEntry error:', error);
      throw error;
    }
  },

  /**
   * 删除条目
   * 使用乐观更新以获得更好的用户体验
   */
  deleteEntry: async (id: string) => {
    set({ loading: true, error: null });
    
    // 保存旧状态以便回滚
    const oldEntries = get().entries;
    
    try {
      // 乐观更新：立即从本地状态移除
      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
      }));
      
      // 执行实际删除
      await entryService.deleteEntry(id);
      
      set({ loading: false });
    } catch (error) {
      // 回滚到旧状态
      set({
        entries: oldEntries,
        error: error instanceof Error ? error.message : 'Failed to delete entry',
        loading: false,
      });
      console.error('deleteEntry error:', error);
      throw error;
    }
  },

  /**
   * 切换条目的书签状态
   * 使用乐观更新以获得更好的用户体验
   */
  toggleBookmark: async (id: string) => {
    // 保存旧状态以便回滚
    const oldEntries = get().entries;
    
    try {
      // 找到要切换的条目
      const entry = get().entries.find((e) => e.id === id);
      if (!entry) {
        throw new Error('Entry not found');
      }
      
      // 乐观更新：立即切换书签状态
      const newBookmarkedState = !entry.bookmarked;
      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === id ? { ...e, bookmarked: newBookmarkedState } : e
        ),
      }));
      
      // 执行实际更新
      await entryService.updateEntry(id, { bookmarked: newBookmarkedState });
    } catch (error) {
      // 回滚到旧状态
      set({
        entries: oldEntries,
        error: error instanceof Error ? error.message : 'Failed to toggle bookmark',
      });
      console.error('toggleBookmark error:', error);
      throw error;
    }
  },

  /**
   * 搜索条目
   */
  searchEntries: async (query: string, notebookId?: string): Promise<SearchResult[]> => {
    set({ loading: true, error: null });
    
    try {
      // Get current user ID from auth
      const { data: { user } } = await import('../utils/supabase').then(m => m.supabase.auth.getUser());
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const results = await entryService.searchEntries(user.id, query, notebookId);
      set({ loading: false });
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search entries';
      set({ error: errorMessage, loading: false });
      console.error('searchEntries error:', error);
      throw error;
    }
  },
}));
