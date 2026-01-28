/**
 * 认证状态管理 Store
 * 使用 Zustand 管理用户认证状态
 */

import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { AuthState } from '../types/auth';
import { mapSupabaseUser } from '../types/auth';

/**
 * 认证 Store
 * 管理用户登录状态、用户信息和认证操作
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  /**
   * 初始化认证状态
   * 从 Supabase 获取当前用户并设置监听器
   */
  initialize: async () => {
    if (!supabase) {
      console.warn('Supabase 客户端未初始化');
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      // 获取当前会话
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('获取会话失败:', error);
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }

      // 设置初始用户状态
      const user = mapSupabaseUser(session?.user || null);
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });

      // 监听认证状态变化
      supabase.auth.onAuthStateChange((_event, session) => {
        const user = mapSupabaseUser(session?.user || null);
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      });
    } catch (error) {
      console.error('初始化认证状态失败:', error);
      set({ isLoading: false, isAuthenticated: false, user: null });
    }
  },

  /**
   * 登出
   * 终止当前会话并清除用户状态
   */
  signOut: async () => {
    if (!supabase) {
      console.warn('Supabase 客户端未初始化');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('登出失败:', error);
        throw error;
      }

      // 清除用户状态
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('登出过程中发生错误:', error);
      throw error;
    }
  },
}));
