/**
 * LoginPage 单元测试
 * 测试登录页面的渲染和基本功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// Mock Supabase
vi.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
}));

// Mock stores
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
  })),
}));

vi.mock('../../store/themeStore', () => ({
  useThemeStore: vi.fn(() => ({
    isDark: true,
  })),
}));

describe('LoginPage', () => {
  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染登录页面标题', () => {
    renderLoginPage();
    expect(screen.getByText(/个人工作台/i)).toBeInTheDocument();
  });

  it('应该渲染登录表单', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/电子邮件/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  it('应该能够切换到注册模式', () => {
    renderLoginPage();
    const switchButton = screen.getByText(/没有账户？注册/i);
    fireEvent.click(switchButton);
    expect(screen.getByText(/创建新账户/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /注册/i })).toBeInTheDocument();
  });

  it('应该渲染底部提示', () => {
    renderLoginPage();
    expect(screen.getByText(/服务条款和隐私政策/i)).toBeInTheDocument();
  });
});
