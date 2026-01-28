import { ChevronDown, ChevronUp, Smile, Meh, Frown, Heart, Angry as AngryIcon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import type { Mood } from '../types';
import type { DateRange } from '../services/searchService';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedMood: Mood | null;
  onMoodChange: (mood: Mood | null) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  availableTags: string[];
  activeFilterCount: number;
}

export const AdvancedFilters = ({
  isOpen,
  onToggle,
  selectedTags,
  onTagsChange,
  selectedMood,
  onMoodChange,
  dateRange,
  onDateRangeChange,
  availableTags,
  activeFilterCount,
}: AdvancedFiltersProps) => {
  const isDark = useThemeStore((state) => state.isDark);

  const moodOptions: { value: Mood; icon: typeof Smile; label: string; color: string }[] = [
    { value: 'happy', icon: Smile, label: '开心 Happy', color: 'text-green-400' },
    { value: 'calm', icon: Heart, label: '平静 Calm', color: 'text-blue-400' },
    { value: 'neutral', icon: Meh, label: '一般 Neutral', color: 'text-gray-400' },
    { value: 'sad', icon: Frown, label: '难过 Sad', color: 'text-yellow-400' },
    { value: 'angry', icon: AngryIcon, label: '生气 Angry', color: 'text-red-400' },
  ];

  // 处理标签选择
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  // 处理心情选择
  const handleMoodSelect = (mood: Mood) => {
    if (selectedMood === mood) {
      onMoodChange(null); // 取消选择
    } else {
      onMoodChange(mood);
    }
  };

  // 处理日期变化
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onDateRangeChange({ ...dateRange, startDate: date });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onDateRangeChange({ ...dateRange, endDate: date });
  };

  // 格式化日期为 input[type="date"] 格式
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="w-full">
      {/* 切换按钮 */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
          isDark
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 text-white'
            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
        }`}
        aria-expanded={isOpen}
        aria-controls="advanced-filters-panel"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">高级过滤 Advanced Filters</span>
          {activeFilterCount > 0 && (
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                isDark
                  ? 'bg-purple-900 text-purple-300'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {/* 过滤器面板 */}
      {isOpen && (
        <div
          id="advanced-filters-panel"
          className={`mt-3 p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          {/* 标签选择器 */}
          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-3 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              标签 Tags
            </label>
            {availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? isDark
                            ? 'bg-purple-900 text-purple-300 border-2 border-purple-700'
                            : 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                      aria-pressed={isSelected}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                暂无标签 No tags available
              </p>
            )}
          </div>

          {/* 心情选择器 */}
          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-3 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              心情 Mood
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {moodOptions.map(({ value, icon: Icon, label, color }) => {
                const isSelected = selectedMood === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleMoodSelect(value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? isDark
                          ? 'bg-purple-900/30 border-purple-700'
                          : 'bg-purple-50 border-purple-300'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    aria-pressed={isSelected}
                    aria-label={label}
                  >
                    <Icon className={`w-6 h-6 ${color}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 日期范围选择器 */}
          <div>
            <label
              className={`block text-sm font-medium mb-3 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              日期范围 Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start-date"
                  className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  起始日期 From
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={formatDateForInput(dateRange.startDate)}
                  onChange={handleStartDateChange}
                  max={formatDateForInput(dateRange.endDate || new Date())}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>
              <div>
                <label
                  htmlFor="end-date"
                  className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  结束日期 To
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={formatDateForInput(dateRange.endDate)}
                  onChange={handleEndDateChange}
                  min={formatDateForInput(dateRange.startDate)}
                  max={formatDateForInput(new Date())}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>
            </div>
            {dateRange.startDate && dateRange.endDate && dateRange.startDate > dateRange.endDate && (
              <p className="mt-2 text-sm text-red-500">
                起始日期不能晚于结束日期 Start date cannot be after end date
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
