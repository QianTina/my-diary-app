import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDiaryStore } from '../store/diaryStore';
import { useThemeStore } from '../store/themeStore';
import { Header } from '../components/Header';
import { 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  Tag,
  MapPin,
  Thermometer
} from 'lucide-react';
import type { Diary, Mood } from '../types';

interface GroupedDiaries {
  [year: string]: {
    [month: string]: Diary[];
  };
}

export default function ArchivePage() {
  const isDark = useThemeStore((state) => state.isDark);
  const { diaries } = useDiaryStore();
  const navigate = useNavigate();
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // 按年月分组
  const groupedDiaries = useMemo(() => {
    const grouped: GroupedDiaries = {};

    diaries.forEach(diary => {
      const date = new Date(diary.createdAt);
      const year = date.getFullYear().toString();
      const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped[year]) {
        grouped[year] = {};
      }
      if (!grouped[year][monthKey]) {
        grouped[year][monthKey] = [];
      }
      grouped[year][monthKey].push(diary);
    });

    return grouped;
  }, [diaries]);

  const years = Object.keys(groupedDiaries).sort((a, b) => parseInt(b) - parseInt(a));

  const toggleYear = (year: string) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  const getMoodEmoji = (mood: Mood | null) => {
    const moodMap = {
      happy: '😊',
      calm: '😌',
      neutral: '😐',
      sad: '😢',
      angry: '😠',
    };
    return mood ? moodMap[mood] : null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('zh-CN', { month: 'long' });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="p-8 max-w-5xl mx-auto">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📚 归档 Archive
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            按时间线浏览所有日记 Browse all diaries by timeline
          </p>
        </motion.div>

        {/* 统计信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-6 p-4 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                共 <span className="font-bold">{diaries.length}</span> 篇日记
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                跨越 <span className="font-bold">{years.length}</span> 年
              </span>
            </div>
          </div>
        </motion.div>

        {/* 时间线 */}
        <div className="space-y-6">
          {years.length > 0 ? (
            years.map((year, yearIndex) => {
              const isYearExpanded = expandedYears.has(year);
              const months = Object.keys(groupedDiaries[year]).sort().reverse();
              const yearTotal = months.reduce(
                (sum, month) => sum + groupedDiaries[year][month].length,
                0
              );

              return (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + yearIndex * 0.1 }}
                >
                  {/* 年份标题 */}
                  <button
                    onClick={() => toggleYear(year)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isYearExpanded ? (
                        <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      ) : (
                        <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      )}
                      <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {year}
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        ({yearTotal} 篇)
                      </span>
                    </div>
                  </button>

                  {/* 月份列表 */}
                  {isYearExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 ml-8 space-y-4"
                    >
                      {months.map((monthKey) => {
                        const isMonthExpanded = expandedMonths.has(monthKey);
                        const monthDiaries = groupedDiaries[year][monthKey];
                        const monthName = getMonthName(monthKey);

                        return (
                          <div key={monthKey}>
                            {/* 月份标题 */}
                            <button
                              onClick={() => toggleMonth(monthKey)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                isDark
                                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {isMonthExpanded ? (
                                  <ChevronDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                ) : (
                                  <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                )}
                                <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {monthName}
                                </span>
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  ({monthDiaries.length} 篇)
                                </span>
                              </div>
                            </button>

                            {/* 日记列表 */}
                            {isMonthExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 ml-6 space-y-3"
                              >
                                {monthDiaries.map((diary) => (
                                  <motion.div
                                    key={diary.id}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => navigate(`/diary/${diary.id}`)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                      isDark
                                        ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                                        : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                                    }`}
                                  >
                                    {/* 日期和心情 */}
                                    <div className="flex items-center justify-between mb-2">
                                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {formatDate(diary.createdAt)}
                                      </span>
                                      {diary.mood && (
                                        <span className="text-lg">{getMoodEmoji(diary.mood)}</span>
                                      )}
                                    </div>

                                    {/* 标题 */}
                                    {diary.title && (
                                      <h3 className={`text-lg font-semibold mb-2 ${
                                        isDark ? 'text-white' : 'text-gray-900'
                                      }`}>
                                        {diary.title}
                                      </h3>
                                    )}

                                    {/* 内容预览 */}
                                    <p className={`text-sm line-clamp-2 mb-3 ${
                                      isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                      {diary.content}
                                    </p>

                                    {/* 元信息 */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs">
                                      {diary.tags.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Tag className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            {diary.tags.slice(0, 3).join(', ')}
                                          </span>
                                        </div>
                                      )}
                                      {diary.location && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            {diary.location}
                                          </span>
                                        </div>
                                      )}
                                      {diary.weather && (
                                        <div className="flex items-center gap-1">
                                          <Thermometer className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            {typeof diary.weather === 'string' ? diary.weather : JSON.stringify(diary.weather)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">还没有日记 No diaries yet</p>
              <p className="text-sm mt-2">开始记录你的生活吧！</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
