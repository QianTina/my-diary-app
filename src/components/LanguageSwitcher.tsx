// ============================================
// Language Switcher Component
// 语言切换组件
// ============================================

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

// ============================================
// Component
// ============================================

export const LanguageSwitcher = memo(function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isDark = useThemeStore((state) => state.isDark);

  // Normalize language code (zh-CN -> zh, en-US -> en)
  const currentLanguage = i18n.language?.startsWith('zh') ? 'zh' : 'en';

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
        ${isDark
          ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
          : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
        }
      `}
      aria-label="Switch language"
      title={currentLanguage === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <Languages className="w-4 h-4" />
      <span className="text-sm font-medium">
        {currentLanguage === 'zh' ? '中文' : 'EN'}
      </span>
    </button>
  );
});
