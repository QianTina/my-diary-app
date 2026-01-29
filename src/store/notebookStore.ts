/**
 * 日记本状态管理 Store
 * 使用 Zustand 管理日记本状态和操作
 */

import { create } from 'zustand';
import { notebookService } from '../services/notebookService';
import type { NotebookStore } from '../types/notebook-stores';
import type { Notebook, CreateNotebookInput, UpdateNotebookInput } from '../types/notebook';

/**
 * 日记本 Store
 * 管理日记本列表、活动日记本和相关操作
 */
export const useNotebookStore = create<NotebookStore>((set, get) => ({
  // 状态
  notebooks: [],
  activeNotebook: null,
  loading: false,
  error: null,

  /**
   * 获取用户的所有日记本
   */
  fetchNotebooks: async () => {
    set({ loading: true, error: null });
    
    try {
      // Get current user ID from auth
      const { data: { user } } = await import('../utils/supabase').then(m => m.supabase.auth.getUser());
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const notebooks = await notebookService.getNotebooks(user.id);
      set({ notebooks, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notebooks';
      set({ error: errorMessage, loading: false });
      console.error('fetchNotebooks error:', error);
    }
  },

  /**
   * 创建新日记本
   * 使用乐观更新以获得更好的用户体验
   */
  createNotebook: async (notebook: CreateNotebookInput) => {
    set({ loading: true, error: null });
    
    try {
      const createdNotebook = await notebookService.createNotebook(notebook);
      
      // 乐观更新：立即添加到本地状态
      set((state) => ({
        notebooks: [createdNotebook, ...state.notebooks],
        loading: false,
      }));
      
      return createdNotebook;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create notebook';
      set({ error: errorMessage, loading: false });
      console.error('createNotebook error:', error);
      throw error;
    }
  },

  /**
   * 更新日记本
   * 使用乐观更新以获得更好的用户体验
   */
  updateNotebook: async (id: string, updates: UpdateNotebookInput) => {
    set({ loading: true, error: null });
    
    // 保存旧状态以便回滚
    const oldNotebooks = get().notebooks;
    const oldActiveNotebook = get().activeNotebook;
    
    try {
      // 乐观更新：立即更新本地状态
      set((state) => ({
        notebooks: state.notebooks.map((nb) =>
          nb.id === id ? { ...nb, ...updates } : nb
        ),
        activeNotebook:
          state.activeNotebook?.id === id
            ? { ...state.activeNotebook, ...updates }
            : state.activeNotebook,
      }));
      
      // 执行实际更新
      const updatedNotebook = await notebookService.updateNotebook(id, updates);
      
      // 使用服务器返回的数据更新状态
      set((state) => ({
        notebooks: state.notebooks.map((nb) =>
          nb.id === id ? updatedNotebook : nb
        ),
        activeNotebook:
          state.activeNotebook?.id === id
            ? updatedNotebook
            : state.activeNotebook,
        loading: false,
      }));
    } catch (error) {
      // 回滚到旧状态
      set({
        notebooks: oldNotebooks,
        activeNotebook: oldActiveNotebook,
        error: error instanceof Error ? error.message : 'Failed to update notebook',
        loading: false,
      });
      console.error('updateNotebook error:', error);
      throw error;
    }
  },

  /**
   * 删除日记本
   * 使用乐观更新以获得更好的用户体验
   */
  deleteNotebook: async (id: string) => {
    set({ loading: true, error: null });
    
    // 保存旧状态以便回滚
    const oldNotebooks = get().notebooks;
    const oldActiveNotebook = get().activeNotebook;
    
    try {
      // 乐观更新：立即从本地状态移除
      set((state) => ({
        notebooks: state.notebooks.filter((nb) => nb.id !== id),
        activeNotebook: state.activeNotebook?.id === id ? null : state.activeNotebook,
      }));
      
      // 执行实际删除
      await notebookService.deleteNotebook(id);
      
      set({ loading: false });
    } catch (error) {
      // 回滚到旧状态
      set({
        notebooks: oldNotebooks,
        activeNotebook: oldActiveNotebook,
        error: error instanceof Error ? error.message : 'Failed to delete notebook',
        loading: false,
      });
      console.error('deleteNotebook error:', error);
      throw error;
    }
  },

  /**
   * 归档日记本
   * 使用乐观更新以获得更好的用户体验
   */
  archiveNotebook: async (id: string) => {
    set({ loading: true, error: null });
    
    // 保存旧状态以便回滚
    const oldNotebooks = get().notebooks;
    const oldActiveNotebook = get().activeNotebook;
    
    try {
      // 乐观更新：立即从本地状态移除（归档的日记本不显示在主列表中）
      set((state) => ({
        notebooks: state.notebooks.filter((nb) => nb.id !== id),
        activeNotebook: state.activeNotebook?.id === id ? null : state.activeNotebook,
      }));
      
      // 执行实际归档
      await notebookService.archiveNotebook(id);
      
      set({ loading: false });
    } catch (error) {
      // 回滚到旧状态
      set({
        notebooks: oldNotebooks,
        activeNotebook: oldActiveNotebook,
        error: error instanceof Error ? error.message : 'Failed to archive notebook',
        loading: false,
      });
      console.error('archiveNotebook error:', error);
      throw error;
    }
  },

  /**
   * 设置当前活动的日记本
   */
  setActiveNotebook: (notebook: Notebook) => {
    set({ activeNotebook: notebook });
  },
}));
