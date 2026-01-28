/**
 * 登录页面
 * 提供登录和注册功能
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../utils/errorMessages';
import { ErrorMessage } from '../../components/ErrorMessage';
import { SuccessMessage } from '../../components/SuccessMessage';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 如果已登录，重定向到主页
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // 如果 Supabase 未配置，显示错误信息
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-400 mb-4">配置错误</h2>
          <p className="text-gray-300">
            请在 .env 文件中配置 Supabase 连接信息：
          </p>
          <ul className="mt-4 text-gray-400 text-sm space-y-2">
            <li>• VITE_SUPABASE_URL</li>
            <li>• VITE_SUPABASE_ANON_KEY</li>
          </ul>
        </div>
      </div>
    );
  }

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        // 登录
        if (!supabase) throw new Error('Supabase 未配置');
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // 登录成功，AuthStore 会自动更新并重定向
      } else {
        // 注册
        if (!supabase) throw new Error('Supabase 未配置');
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        setMessage('注册成功！请检查您的电子邮件以确认账户。');
      }
    } catch (err: any) {
      console.error('认证错误:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📔 个人工作台
          </h1>
          <p className="text-gray-400">
            {mode === 'login' ? '登录您的账户' : '创建新账户'}
          </p>
        </div>

        {/* 认证表单 */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 电子邮件 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                电子邮件 / Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            {/* 密码 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                密码 / Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
              {mode === 'signup' && (
                <p className="mt-1 text-xs text-gray-500">密码至少 6 个字符</p>
              )}
            </div>

            {/* 错误消息 */}
            {error && (
              <ErrorMessage 
                message={error} 
                onClose={() => setError('')}
              />
            )}

            {/* 成功消息 */}
            {message && (
              <SuccessMessage 
                message={message} 
                onClose={() => setMessage('')}
              />
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'login' ? '登录中...' : '注册中...'}
                </span>
              ) : (
                mode === 'login' ? '登录 / Sign In' : '注册 / Sign Up'
              )}
            </button>
          </form>

          {/* 切换模式 */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setMessage('');
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {mode === 'login' ? '没有账户？注册' : '已有账户？登录'}
            </button>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>登录即表示您同意我们的服务条款和隐私政策</p>
        </div>
      </div>
    </div>
  );
}
