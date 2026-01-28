import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiaryStore } from '../store/diaryStore';
import { useThemeStore } from '../store/themeStore';
import { Header } from '../components/Header';
import { 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Tag, 
  Award,
  BarChart3,
  Clock,
  Smile,
  Meh,
  Frown,
  Angry as AngryIcon,
  Heart,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  getTotalWords,
  getStreakDays,
  getMoodDistribution,
  getTopTags,
  getMonthlyStats,
  getAverageWords,
  getLongestDiary,
} from '../utils/statistics';

type StatWidget = 
  | 'totalDiaries' 
  | 'totalWords' 
  | 'streakDays' 
  | 'averageWords' 
  | 'moodDistribution' 
  | 'topTags' 
  | 'monthlyStats' 
  | 'achievements';

const defaultWidgets: StatWidget[] = [
  'totalDiaries',
  'totalWords',
  'streakDays',
  'averageWords',
  'moodDistribution',
  'topTags',
  'monthlyStats',
  'achievements',
];

export default function StatsPage() {
  const isDark = useThemeStore((state) => state.isDark);
  const { diaries } = useDiaryStore();
  const [showSettings, setShowSettings] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<StatWidget[]>(() => {
    const saved = localStorage.getItem('stats_visible_widgets');
    return saved ? JSON.parse(saved) : defaultWidgets;
  });

  // 计算统计数据
  const stats = useMemo(() => ({
    totalDiaries: diaries.length,
    totalWords: getTotalWords(diaries),
    streakDays: getStreakDays(diaries),
    averageWords: getAverageWords(diaries),
    moodDistribution: getMoodDistribution(diaries),
    topTags: getTopTags(diaries, 8),
    monthlyStats: getMonthlyStats(diaries),
    longestDiary: getLongestDiary(diaries),
  }), [diaries]);

  const moodIcons = {
    happy: { icon: Smile, color: 'text-green-400', label: '开心 Happy' },
    calm: { icon: Heart, color: 'text-blue-400', label: '平静 Calm' },
    neutral: { icon: Meh, color: 'text-gray-400', label: '一般 Neutral' },
    sad: { icon: Frown, color: 'text-yellow-400', label: '难过 Sad' },
    angry: { icon: AngryIcon, color: 'text-red-400', label: '生气 Angry' },
  };

  const maxMoodCount = Math.max(...Object.values(stats.moodDistribution));

  const widgetConfig = {
    totalDiaries: { label: '总日记数 Total Diaries', icon: BookOpen },
    totalWords: { label: '总字数 Total Words', icon: TrendingUp },
    streakDays: { label: '连续天数 Streak Days', icon: Calendar },
    averageWords: { label: '平均字数 Avg Words', icon: BarChart3 },
    moodDistribution: { label: '心情分布 Mood Distribution', icon: Smile },
    topTags: { label: '热门标签 Top Tags', icon: Tag },
    monthlyStats: { label: '写作趋势 Writing Trend', icon: Clock },
    achievements: { label: '成就 Achievements', icon: Award },
  };

  const toggleWidget = (widget: StatWidget) => {
    const newWidgets = visibleWidgets.includes(widget)
      ? visibleWidgets.filter(w => w !== widget)
      : [...visibleWidgets, widget];
    setVisibleWidgets(newWidgets);
    localStorage.setItem('stats_visible_widgets', JSON.stringify(newWidgets));
  };

  const isVisible = (widget: StatWidget) => visibleWidgets.includes(widget);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="p-8 max-w-7xl mx-auto">
        {/* 标题和设置按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📊 写作统计 Writing Statistics
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              记录你的写作旅程 Track your writing journey
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">自定义 Customize</span>
          </button>
        </motion.div>

        {/* 设置面板 */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 rounded-lg border overflow-hidden ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  选择显示的统计维度 Select Statistics to Display
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(widgetConfig).map(([key, { label, icon: Icon }]) => {
                    const widget = key as StatWidget;
                    const visible = isVisible(widget);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleWidget(widget)}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                          visible
                            ? isDark
                              ? 'bg-purple-900/30 border-purple-700 text-purple-300'
                              : 'bg-purple-50 border-purple-200 text-purple-700'
                            : isDark
                              ? 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {visible ? (
                          <Eye className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <EyeOff className="w-4 h-4 flex-shrink-0" />
                        )}
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 核心统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 总日记数 */}
          {isVisible('totalDiaries') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.1 }}
              className={`rounded-lg p-6 border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <BookOpen className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalDiaries}
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                总日记数 Total Diaries
              </p>
            </motion.div>
          )}

          {/* 总字数 */}
          {isVisible('totalWords') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2 }}
              className={`rounded-lg p-6 border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalWords.toLocaleString()}
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                总字数 Total Words
              </p>
            </motion.div>
          )}

          {/* 连续天数 */}
          {isVisible('streakDays') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.3 }}
              className={`rounded-lg p-6 border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.streakDays}
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                连续写作天数 Streak Days
              </p>
            </motion.div>
          )}

          {/* 平均字数 */}
          {isVisible('averageWords') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.4 }}
              className={`rounded-lg p-6 border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.averageWords}
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                平均字数 Avg Words
              </p>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 心情分布 */}
          {isVisible('moodDistribution') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.5 }}
              className={`rounded-lg p-6 border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Smile className="w-5 h-5" />
              心情分布 Mood Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.moodDistribution).map(([mood, count]) => {
                const { icon: Icon, color, label } = moodIcons[mood as keyof typeof moodIcons];
                const percentage = maxMoodCount > 0 ? (count / maxMoodCount) * 100 : 0;
                
                return (
                  <div key={mood}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {label}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {count}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className={`h-full ${color.replace('text-', 'bg-')}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
          )}

          {/* 热门标签 */}
          {isVisible('topTags') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.6 }}
              className={`rounded-lg p-6 border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Tag className="w-5 h-5" />
              热门标签 Top Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.topTags.length > 0 ? (
                stats.topTags.map(({ tag, count }, index) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      isDark 
                        ? 'bg-purple-900/30 text-purple-300 border border-purple-700' 
                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }`}
                  >
                    #{tag} ({count})
                  </motion.span>
                ))
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  还没有标签 No tags yet
                </p>
              )}
            </div>
          </motion.div>
          )}

          {/* 每月趋势 */}
          {isVisible('monthlyStats') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.7 }}
              className={`rounded-lg p-6 border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Clock className="w-5 h-5" />
              写作趋势 Writing Trend
            </h3>
            <div className="space-y-3">
              {stats.monthlyStats.length > 0 ? (
                stats.monthlyStats.map(({ month, count }, index) => {
                  const maxCount = Math.max(...stats.monthlyStats.map(s => s.count));
                  const percentage = (count / maxCount) * 100;
                  
                  return (
                    <div key={month}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {month}
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {count} 篇
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${
                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  还没有数据 No data yet
                </p>
              )}
            </div>
          </motion.div>
          )}

          {/* 成就 */}
          {isVisible('achievements') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.8 }}
              className={`rounded-lg p-6 border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Award className="w-5 h-5" />
              成就 Achievements
            </h3>
            <div className="space-y-3">
              {stats.totalDiaries >= 1 && (
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      初次记录 First Entry
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      完成第一篇日记
                    </p>
                  </div>
                </div>
              )}
              {stats.totalDiaries >= 10 && (
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      坚持写作 Consistent Writer
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      完成 10 篇日记
                    </p>
                  </div>
                </div>
              )}
              {stats.streakDays >= 7 && (
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      一周连续 Week Streak
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      连续写作 7 天
                    </p>
                  </div>
                </div>
              )}
              {stats.totalWords >= 10000 && (
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <span className="text-2xl">📚</span>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      万字作家 10K Words
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      累计写作 10,000 字
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
