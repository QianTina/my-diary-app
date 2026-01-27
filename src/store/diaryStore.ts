import { create } from 'zustand';
import type { Diary } from '../types';
import { getDiaries, addDiary, updateDiary, deleteDiary } from '../utils/storage';

interface DiaryStore {
  // 状态
  diaries: Diary[];
  isLoading: boolean;
  editingId: string | null;
  searchQuery: string;
  selectedTags: string[];
  
  // 操作
  fetchDiaries: () => Promise<void>;
  createDiary: (diary: Omit<Diary, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDiaryById: (id: string, updates: Partial<Omit<Diary, 'id' | 'createdAt'>>) => Promise<void>;
  deleteDiaryById: (id: string) => Promise<void>;
  setEditingId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  clearSelectedTags: () => void;
  
  // 计算属性
  getFilteredDiaries: () => Diary[];
  getAllTags: () => string[];
}

export const useDiaryStore = create<DiaryStore>((set, get) => ({
  // 初始状态
  diaries: [],
  isLoading: false,
  editingId: null,
  searchQuery: '',
  selectedTags: [],

  // 获取所有日记
  fetchDiaries: async () => {
    set({ isLoading: true });
    try {
      const data = await getDiaries();
      set({ diaries: data });
    } catch (error) {
      console.error('Failed to fetch diaries:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 创建日记
  createDiary: async (diary: Omit<Diary, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true });
    try {
      const newDiary = await addDiary(diary);
      set((state) => ({ diaries: [newDiary, ...state.diaries] }));
    } catch (error) {
      console.error('Failed to create diary:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 更新日记
  updateDiaryById: async (id: string, updates: Partial<Omit<Diary, 'id' | 'createdAt'>>) => {
    set({ isLoading: true });
    try {
      const updated = await updateDiary(id, updates);
      set((state) => ({
        diaries: state.diaries.map((d) => (d.id === id ? updated : d)),
        editingId: null,
      }));
    } catch (error) {
      console.error('Failed to update diary:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 删除日记
  deleteDiaryById: async (id: string) => {
    try {
      await deleteDiary(id);
      set((state) => ({
        diaries: state.diaries.filter((d) => d.id !== id),
        editingId: state.editingId === id ? null : state.editingId,
      }));
    } catch (error) {
      console.error('Failed to delete diary:', error);
      throw error;
    }
  },

  // 设置编辑状态
  setEditingId: (id: string | null) => set({ editingId: id }),

  // 设置搜索关键词
  setSearchQuery: (query: string) => set({ searchQuery: query }),

  // 切换标签选择
  toggleTag: (tag: string) => {
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    }));
  },

  // 清空标签筛选
  clearSelectedTags: () => set({ selectedTags: [] }),

  // 获取过滤后的日记
  getFilteredDiaries: () => {
    const { diaries, searchQuery, selectedTags } = get();
    return diaries.filter((diary) => {
      // 搜索过滤
      const matchesSearch = searchQuery.trim()
        ? diary.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // 标签过滤
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => diary.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  },

  // 获取所有标签（去重并统计）
  getAllTags: () => {
    const { diaries } = get();
    const tagMap = new Map<string, number>();
    
    diaries.forEach((diary) => {
      diary.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1]) // 按使用频率排序
      .map(([tag]) => tag);
  },
}));
