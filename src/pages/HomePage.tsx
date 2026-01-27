import { motion, AnimatePresence } from 'framer-motion';
import { useDiaryStore } from '../store/diaryStore';
import MarkdownPreview from '../components/MarkdownPreview';
import { useNavigate } from 'react-router-dom';
import type { Mood } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const {
    diaries,
    isLoading,
    searchQuery,
    selectedTags,
    setSearchQuery,
    toggleTag,
    clearSelectedTags,
    getFilteredDiaries,
    getAllTags,
    deleteDiaryById,
    setEditingId,
  } = useDiaryStore();

  const handleEdit = (id: string) => {
    setEditingId(id);
    navigate('/write');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这条日记吗？')) return;
    try {
      await deleteDiaryById(id);
    } catch {
      alert('删除失败');
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMoodEmoji = (moodValue: Mood | null) => {
    const moodMap = {
      happy: '😊',
      calm: '😌',
      neutral: '😐',
      sad: '😢',
      angry: '😠',
    };
    return moodValue ? moodMap[moodValue] : null;
  };

  const filteredDiaries = getFilteredDiaries();
  const allTags = getAllTags();

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 搜索日记内容..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
        />

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">标签筛选：</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                #{tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={clearSelectedTags}
                className="text-sm text-red-500 hover:text-red-700"
              >
                清空筛选
              </button>
            )}
          </div>
        )}

        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          显示 {filteredDiaries.length} / {diaries.length} 条日记
        </div>
      </motion.div>

      {/* 快速写作按钮 */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/write')}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-medium text-lg"
      >
        ✍️ 写新日记
      </motion.button>

      {/* 日记列表 */}
      <div className="space-y-4">
        {isLoading && diaries.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p>正在加载...</p>
          </div>
        ) : filteredDiaries.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <p className="text-4xl mb-4">{diaries.length === 0 ? '📝' : '🔍'}</p>
            <p className="text-lg">
              {diaries.length === 0 ? '还没有日记，点击上方按钮开始写作吧！' : '没有找到匹配的日记'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredDiaries.map((diary, index) => (
              <motion.div
                key={diary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    {diary.title && (
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                        {diary.title}
                      </h3>
                    )}
                    <div className="flex items-center gap-3 flex-wrap text-sm">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        {formatDate(diary.createdAt)}
                      </span>
                      {diary.mood && (
                        <span className="text-2xl">{getMoodEmoji(diary.mood)}</span>
                      )}
                      {diary.weather && (
                        <span className="text-gray-500 dark:text-gray-400">
                          🌡️ {diary.weather.temp}°C {diary.weather.description}
                        </span>
                      )}
                      {diary.location && (
                        <span className="text-gray-500 dark:text-gray-400">
                          📍 {diary.location}
                        </span>
                      )}
                    </div>
                    {diary.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {diary.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(diary.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm transition-colors px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(diary.id)}
                      className="text-red-500 hover:text-red-700 text-sm transition-colors px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      删除
                    </button>
                  </div>
                </div>

                {/* 图片展示 */}
                {diary.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {diary.images.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="relative aspect-square">
                        <img
                          src={img}
                          alt={`图片 ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {idx === 2 && diary.images.length > 3 && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white font-bold">
                            +{diary.images.length - 3}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 内容预览 */}
                <div className="text-gray-800 dark:text-gray-300 line-clamp-3">
                  <MarkdownPreview content={diary.content} />
                </div>

                {diary.content.length > 200 && (
                  <button
                    onClick={() => navigate(`/diary/${diary.id}`)}
                    className="text-blue-500 hover:text-blue-700 text-sm mt-2"
                  >
                    阅读更多 →
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
