import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { supabase } from '../../utils/supabase';
import { getErrorMessage } from '../../utils/errorMessages';
import { ErrorMessage } from '../../components/ErrorMessage';
import { SuccessMessage } from '../../components/SuccessMessage';
import { Header } from '../../components/Header';
import { User, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const isDark = useThemeStore((state) => state.isDark);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Supabase 客户端未初始化 Supabase client not initialized');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: name.trim(),
          avatar_url: avatarUrl.trim(),
        },
      });

      if (error) throw error;

      setSuccess('资料更新成功 Profile updated successfully');
    } catch (err: any) {
      console.error('更新资料失败:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`flex items-center justify-center h-full ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>加载中... Loading...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* 顶部栏 */}
      <Header showDate={true} />

      {/* 内容区 */}
      <div className="max-w-2xl mx-auto p-6">
        <div className={`rounded-lg shadow-lg border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <User className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              用户资料 User Profile
            </h2>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 电子邮件（只读） */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              电子邮件 Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className={`w-full px-4 py-2 border rounded-lg cursor-not-allowed ${
                isDark 
                  ? 'border-gray-600 bg-gray-700 text-gray-400' 
                  : 'border-gray-300 bg-gray-100 text-gray-500'
              }`}
            />
          </div>

          {/* 名称 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              名称 Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入您的名称 Enter your name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDark 
                  ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-500' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* 头像 URL */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              头像 URL Avatar URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDark 
                  ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-500' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* 头像预览 */}
          {avatarUrl && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                头像预览 Avatar Preview
              </label>
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className={`w-20 h-20 rounded-full object-cover border-2 ${
                  isDark ? 'border-gray-600' : 'border-gray-300'
                }`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* 消息提示 */}
          {error && (
            <ErrorMessage 
              message={error} 
              onClose={() => setError('')}
            />
          )}
          
          {success && (
            <SuccessMessage 
              message={success} 
              onClose={() => setSuccess('')}
            />
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isLoading ? '保存中... Saving...' : '保存更改 Save Changes'}
          </button>
        </form>
      </div>
    </div>
  </div>
  );
};
