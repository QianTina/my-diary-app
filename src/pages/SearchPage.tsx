import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search as SearchIcon } from 'lucide-react';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { AdvancedFilters } from '../components/AdvancedFilters';
import { SearchResults } from '../components/SearchResults';
import { Toast } from '../components/Toast';
import { useThemeStore } from '../store/themeStore';
import { useDiaryStore } from '../store/diaryStore';
import { useAuthStore } from '../store/authStore';
import { searchService } from '../services/searchService';
import type { Mood } from '../types';
import type { DateRange, SearchFilters } from '../services/searchService';

export default function SearchPage() {
  const isDark = useThemeStore((state) => state.isDark);
  const { diaries } = useDiaryStore();
  const { user } = useAuthStore();

  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [searchResults, setSearchResults] = useState(diaries);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 获取所有可用标签
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    diaries.forEach(diary => {
      diary.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [diaries]);

  // 计算活动过滤器数量
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedTags.length > 0) count += selectedTags.length;
    if (selectedMood) count += 1;
    if (dateRange.startDate) count += 1;
    if (dateRange.endDate) count += 1;
    return count;
  }, [selectedTags, selectedMood, dateRange]);

  // 检查是否有活动过滤器
  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() !== '' || activeFilterCount > 0;
  }, [searchQuery, activeFilterCount]);

  // 加载搜索历史
  useEffect(() => {
    if (user) {
      const history = searchService.getHistory(user.id);
      setSearchHistory(history);
    }
  }, [user]);

  // 执行搜索（带防抖）
  const executeSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 验证日期范围
      if (dateRange.startDate && dateRange.endDate && dateRange.startDate > dateRange.endDate) {
        setError('起始日期不能晚于结束日期 Start date cannot be after end date');
        setIsLoading(false);
        return;
      }

      const filters: SearchFilters = {
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        mood: selectedMood || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      };

      const results = await searchService.search(searchQuery, filters);
      setSearchResults(results);

      // 保存搜索历史
      if (searchQuery.trim() && user) {
        await searchService.saveToHistory(searchQuery);
        const updatedHistory = searchService.getHistory(user.id);
        setSearchHistory(updatedHistory);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('搜索失败，请稍后重试 Search failed, please try again');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedTags, selectedMood, dateRange, user]);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [executeSearch]);

  // 处理搜索查询变化
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // 处理历史记录选择
  const handleHistorySelect = (query: string) => {
    setSearchQuery(query);
  };

  // 清除所有过滤器
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedMood(null);
    setDateRange({ startDate: null, endDate: null });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="p-8 max-w-7xl mx-auto">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <SearchIcon className="w-8 h-8" />
            搜索日记 Search Diaries
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            搜索你的日记内容、标签和心情 Search your diary content, tags, and moods
          </p>
        </motion.div>

        {/* 搜索栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onHistorySelect={handleHistorySelect}
            searchHistory={searchHistory}
            autoFocus={true}
          />
        </motion.div>

        {/* 高级过滤器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <AdvancedFilters
            isOpen={isAdvancedOpen}
            onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            selectedMood={selectedMood}
            onMoodChange={setSelectedMood}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            availableTags={availableTags}
            activeFilterCount={activeFilterCount}
          />
        </motion.div>

        {/* 清除过滤器按钮 */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <button
              onClick={clearAllFilters}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white'
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
              }`}
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">
                清除所有过滤器 Clear All Filters
              </span>
            </button>
          </motion.div>
        )}

        {/* 搜索结果 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SearchResults
            results={searchResults}
            searchQuery={searchQuery}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
          />
        </motion.div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Toast
          isOpen={!!error}
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}
