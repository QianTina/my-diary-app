import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDiaryStore } from '../store/diaryStore';
import { useThemeStore } from '../store/themeStore';
import { Header } from '../components/Header';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Search, Plus, Tag, Calendar, MapPin, Thermometer, Edit2, Trash2 } from 'lucide-react';
import MarkdownPreview from '../components/MarkdownPreview';
import type { Mood } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
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

  const [currentPrompt] = useState('今天的核心主题是...');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const handleEdit = (id: string) => {
    setEditingId(id);
    navigate('/write');
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    setDeleteDialogOpen(false);
    
    try {
      await deleteDiaryById(deletingId);
      
      // 先关闭 loading
      setIsDeleting(false);
      
      // 显示成功提示
      setToast({ isOpen: true, message: '✅ 日记已删除 Diary deleted successfully', type: 'success' });
    } catch {
      setIsDeleting(false);
      setToast({ isOpen: true, message: '❌ 删除失败，请重试 Delete failed, please retry', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
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
    <div className="min-h-screen">
      {/* 顶部栏 */}
      <Header />
      
      {/* 顶部操作栏 */}
      <div className={`border-b px-8 py-4 flex items-center justify-end ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <button
          onClick={() => navigate('/write')}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>提笔</span>
        </button>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        {/* 写作提示卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-8 mb-8 border cursor-pointer hover:border-purple-500 transition-colors ${
            isDark 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
          }`}
          onClick={() => navigate('/write')}
        >
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentPrompt}
          </h2>
          <div className="flex items-center space-x-4 text-sm">
            <span className={`px-3 py-1 rounded-full ${
              isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-200 text-purple-700'
            }`}>
              #Something
            </span>
            <span className={`px-3 py-1 rounded-full ${
              isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-200 text-blue-700'
            }`}>
              #Fulfil_starting
            </span>
            <button className={`ml-auto transition-colors ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>
              +
            </button>
          </div>
          <p className={`text-sm mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            开始满意记忆... (支持 Markdown)
          </p>
        </motion.div>

        {/* 搜索和筛选 */}
        <div className="mb-6 space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索日记内容..."
              className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:border-purple-500 transition-colors ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center space-x-1 transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : isDark
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={clearSelectedTags}
                  className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300"
                >
                  清空筛选
                </button>
              )}
            </div>
          )}

          {/* 统计信息 */}
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            显示 {filteredDiaries.length} / {diaries.length} 条日记
          </div>
        </div>

        {/* 日记列表 */}
        <div className="space-y-4">
          {isLoading && diaries.length === 0 ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className={isDark ? 'text-gray-500' : 'text-gray-600'}>正在加载...</p>
            </div>
          ) : filteredDiaries.length === 0 ? (
            <div className={`text-center py-20 rounded-2xl border ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-4xl mb-4">{diaries.length === 0 ? '📝' : '🔍'}</p>
              <p className={`text-lg mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {diaries.length === 0 ? '还没有日记' : '没有找到匹配的日记'}
              </p>
              {diaries.length === 0 && (
                <button
                  onClick={() => navigate('/write')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  开始写作
                </button>
              )}
            </div>
          ) : (
            filteredDiaries.map((diary, index) => (
              <motion.div
                key={diary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl p-6 border transition-colors group ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* 头部信息 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {diary.title && (
                      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {diary.title}
                      </h3>
                    )}
                    <div className={`flex items-center space-x-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(diary.createdAt)}</span>
                      </div>
                      {diary.mood && (
                        <span className="text-xl">{getMoodEmoji(diary.mood)}</span>
                      )}
                      {diary.weather && (
                        <div className="flex items-center space-x-1">
                          <Thermometer className="w-4 h-4" />
                          <span>{diary.weather.temp}°C</span>
                        </div>
                      )}
                      {diary.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{diary.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(diary.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(diary.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' 
                          : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 标签 */}
                {diary.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {diary.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 text-xs rounded ${
                          isDark 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 图片 */}
                {diary.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {diary.images.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="relative aspect-square">
                        <img
                          src={img}
                          alt={`图片 ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {idx === 2 && diary.images.length > 3 && (
                          <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center text-white font-bold">
                            +{diary.images.length - 3}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 内容预览 */}
                <div className={`line-clamp-3 prose prose-sm max-w-none ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <MarkdownPreview content={diary.content} isDark={isDark} />
                </div>

                {diary.content.length > 200 && (
                  <button
                    onClick={() => navigate(`/diary/${diary.id}`)}
                    className="mt-3 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                  >
                    阅读更多 →
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* 确认删除对话框 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="删除日记 Delete Diary"
        message="确定要删除这条日记吗？此操作无法撤销。Are you sure you want to delete this diary? This action cannot be undone."
        confirmText="删除 Delete"
        cancelText="取消 Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Loading 遮罩 */}
      <LoadingOverlay 
        isOpen={isDeleting} 
        message="正在删除日记... Deleting diary..."
      />

      {/* Toast 通知 */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
}
