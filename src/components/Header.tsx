import { useThemeStore } from '../store/themeStore';
import { Sun, Moon } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  title?: string;
  showDate?: boolean;
}

export const Header = ({ title, showDate = true }: HeaderProps) => {
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const today = new Date().toLocaleDateString('zh-CN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className={`border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10 ${
      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      {/* 左侧：日期或标题 */}
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {showDate ? today : title}
      </div>

      {/* 右侧：语言切换和主题切换按钮 */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark 
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
          aria-label="切换主题"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
