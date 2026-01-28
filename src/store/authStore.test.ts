/**
 * AuthStore 单元测试
 * 测试认证状态管理的核心功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';

// Mock Supabase
vi.mock('../utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    useAuthStore.setState({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });
  });

  describe('初始状态', () => {
    it('应该有正确的初始值', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('initialize', () => {
    it('应该是一个函数', () => {
      const state = useAuthStore.getState();
      expect(typeof state.initialize).toBe('function');
    });
  });

  describe('signOut', () => {
    it('应该是一个函数', () => {
      const state = useAuthStore.getState();
      expect(typeof state.signOut).toBe('function');
    });
  });

  describe('状态更新', () => {
    it('应该能够更新用户状态', () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };

      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('应该能够清除用户状态', () => {
      // 先设置用户
      useAuthStore.setState({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
      });

      // 清除用户
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
