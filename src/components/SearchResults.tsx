import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { DiaryEntryCard } from './DiaryEntryCard';
import type { Diary } from '../types';

interface SearchResultsProps {
  results: Diary[];
  searchQuery: string;
  isLoading: boolean;
  onResultClick?: (entryId: string) => void;
  hasActiveFilters: boolean;
}

export const SearchResults = ({
  results,
  searchQuery,
  isLoading,
  onResultClick,
  hasActiveFilters,
}: SearchResultsProps) => {
  const isDark = useThemeStore((state) => state.isDark);

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className={`w-12 h-12 animate-spin mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          搜索中... Searching...
        </p>
      </div>
    );
  }

  // 空状态 - 无结果
  if (results.length === 0 && hasActiveFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <BookOpen className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          未找到匹配的日记 No Results Found
        </h3>
        <p className={`text-sm text-center mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          尝试使用不同的关键词或调整过滤条件
          <br />
          Try different keywords or adjust your filters
        </p>
      </motion.div>
    );
  }

  // 空状态 - 无日记
  if (results.length === 0 && !hasActiveFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <BookOpen className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          还没有日记 No Diaries Yet
        </h3>
        <p className={`text-sm text-center mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          开始记录你的生活吧！
          <br />
          Start documenting your life!
        </p>
      </motion.div>
    );
  }

  // 显示结果
  return (
    <div>
      {/* 结果计数 */}
      <div
        className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        找到 <span className="font-bold">{results.length}</span> 条日记
        {' · '}
        Found <span className="font-bold">{results.length}</span> {results.length === 1 ? 'entry' : 'entries'}
      </div>

      {/* 结果列表 */}
      <div className="space-y-4">
        {results.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <DiaryEntryCard
              entry={entry}
              highlightQuery={searchQuery}
              onClick={onResultClick ? () => onResultClick(entry.id) : undefined}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
