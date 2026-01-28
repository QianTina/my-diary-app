import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { User, LogOut, ChevronDown } from 'lucide-react';

export const UserMenu = () => {
  const { user, signOut } = useAuthStore();
  const isDark = useThemeStore((state) => state.isDark);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  // 生成用户头像（从电子邮件首字母）
  const getInitial = () => {
    return user.email.charAt(0).toUpperCase();
  };

  const displayName = user.user_metadata?.name || user.email;
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="relative">
      {/* 用户按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
        }`}
      >
        {/* 头像 */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            getInitial()
          )}
        </div>

        {/* 用户信息 */}
        <div className="flex-1 text-left">
          <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {displayName}
          </p>
          <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {user.email}
          </p>
        </div>

        {/* 下拉图标 */}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          } ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单内容 */}
          <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-xl border overflow-hidden z-20 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={handleProfileClick}
              className={`flex items-center gap-3 w-full px-4 py-3 transition-colors text-left ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <User className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                用户资料 Profile
              </span>
            </button>

            <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

            <button
              onClick={handleSignOut}
              className={`flex items-center gap-3 w-full px-4 py-3 transition-colors text-left ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-400 font-medium">
                登出 Sign Out
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
