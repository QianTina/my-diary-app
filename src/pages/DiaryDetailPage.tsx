import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDiaryStore } from '../store/diaryStore';
import MarkdownPreview from '../components/MarkdownPreview';
import type { Mood } from '../types';

export default function DiaryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { diaries, deleteDiaryById, setEditingId } = useDiaryStore();

  const diary = diaries.find((d) => d.id === id);

  if (!diary) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">日记不存在</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          返回首页
        </button>
      </div>
    );
  }

  const handleEdit = () => {
    setEditingId(diary.id);
    navigate('/write');
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这条日记吗？')) return;
    try {
      await deleteDiaryById(diary.id);
      navigate('/');
    } catch {
      alert('删除失败');
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
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

  const getMoodLabel = (moodValue: Mood | null) => {
    const moodMap = {
      happy: '开心',
      calm: '平静',
      neutral: '一般',
      sad: '难过',
      angry: '生气',
    };
    return moodValue ? moodMap[moodValue] : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center"
      >
        ← 返回列表
      </button>

      {/* 日记内容 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* 标题 */}
        {diary.title && (
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {diary.title}
          </h1>
        )}

        {/* 元信息 */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            {formatDate(diary.createdAt)}
          </div>

          {diary.mood && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
              <span className="text-2xl">{getMoodEmoji(diary.mood)}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getMoodLabel(diary.mood)}
              </span>
            </div>
          )}

          {diary.weather && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <span>🌡️</span>
              <span className="text-sm">
                {diary.weather.temp}°C {diary.weather.description}
              </span>
            </div>
          )}

          {diary.location && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <span>📍</span>
              <span className="text-sm">{diary.location}</span>
            </div>
          )}
        </div>

        {/* 标签 */}
        {diary.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {diary.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 图片 */}
        {diary.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {diary.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`图片 ${idx + 1}`}
                className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        )}

        {/* 正文 */}
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
          <MarkdownPreview content={diary.content} />
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleEdit}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ✏️ 编辑
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            🗑️ 删除
          </button>
        </div>
      </div>

      {/* 更新时间 */}
      {diary.updatedAt !== diary.createdAt && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          最后更新：{formatDate(diary.updatedAt)}
        </div>
      )}
    </motion.div>
  );
}
