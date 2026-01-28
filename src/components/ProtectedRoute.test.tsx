/**
 * ProtectedRoute 单元测试
 * 测试路由保护逻辑
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Mock AuthStore
const mockUseAuthStore = vi.fn();
vi.mock('../store/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>受保护的内容</div>;
  const LoginComponent = () => <div>登录页面</div>;

  const renderProtectedRoute = (initialPath = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<TestComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('加载中时应显示加载指示器', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderProtectedRoute();
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('未认证时应重定向到登录页面', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderProtectedRoute();
    expect(screen.getByText('登录页面')).toBeInTheDocument();
  });

  it('已认证时应渲染受保护的内容', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    renderProtectedRoute();
    // 由于已认证，应该能看到受保护的内容而不是登录页面
    expect(screen.queryByText('登录页面')).not.toBeInTheDocument();
    expect(screen.getByText('受保护的内容')).toBeInTheDocument();
  });
});
