import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onHistorySelect: (query: string) => void;
  searchHistory: string[];
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar = ({
  value,
  onChange,
  onHistorySelect,
  searchHistory,
  placeholder = '搜索日记... Search diaries...',
  autoFocus = false,
}: SearchBarProps) => {
  const isDark = useThemeStore((state) => state.isDark);
  const [isFocused, setIsFocused] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // 清除输入
  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  // 处理聚焦
  const handleFocus = () => {
    setIsFocused(true);
    if (searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  // 处理失焦
  const handleBlur = () => {
    setIsFocused(false);
    // 延迟隐藏，以便点击历史项能够触发
    setTimeout(() => setShowHistory(false), 200);
  };

  // 处理历史项点击
  const handleHistoryClick = (query: string) => {
    onHistorySelect(query);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, []);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      {/* 搜索输入框 */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
          isFocused
            ? isDark
              ? 'border-purple-500 bg-gray-800'
              : 'border-purple-500 bg-white shadow-md'
            : isDark
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-white'
        }`}
      >
        <Search
          className={`w-5 h-5 flex-shrink-0 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none ${
            isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
          }`}
          aria-label="搜索日记"
          aria-describedby="search-description"
        />
        {value && (
          <button
            onClick={handleClear}
            className={`p-1 rounded-full transition-colors ${
              isDark
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
            aria-label="清除搜索"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 搜索历史下拉 */}
      {showHistory && searchHistory.length > 0 && (
        <div
          ref={dropdownRef}
          className={`absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-lg z-50 overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div
            className={`px-3 py-2 text-xs font-medium ${
              isDark ? 'text-gray-400 bg-gray-900' : 'text-gray-600 bg-gray-50'
            }`}
          >
            最近搜索 Recent Searches
          </div>
          <div className="max-h-64 overflow-y-auto">
            {searchHistory.map((query, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(query)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-50 text-gray-800'
                }`}
              >
                <Clock className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className="flex-1 truncate">{query}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 屏幕阅读器描述 */}
      <span id="search-description" className="sr-only">
        输入关键词搜索日记标题和内容。按 Escape 键清除输入。
      </span>
    </div>
  );
};
