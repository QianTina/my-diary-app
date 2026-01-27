import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDiaryStore } from '../store/diaryStore';
import TagInput from '../components/TagInput';
import MarkdownPreview from '../components/MarkdownPreview';
import MoodSelector from '../components/MoodSelector';
import ImageUploader from '../components/ImageUploader';
import { getCurrentWeather, getCurrentLocation } from '../utils/weather';
import type { Mood } from '../types';

export default function WritePage() {
  const navigate = useNavigate();
  const { editingId, diaries, createDiary, updateDiaryById, setEditingId, isLoading } = useDiaryStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mood, setMood] = useState<Mood | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);

  const DRAFT_KEY = 'diary_draft_v2';

  // 加载编辑数据或草稿
  useEffect(() => {
    if (editingId) {
      const diary = diaries.find((d) => d.id === editingId);
      if (diary) {
        setTitle(diary.title);
        setContent(diary.content);
        setTags(diary.tags);
        setMood(diary.mood);
        setImages(diary.images);
      }
    } else {
      // 恢复草稿
      try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
          const parsed = JSON.parse(draft);
          setTitle(parsed.title || '');
          setContent(parsed.content || '');
          setTags(parsed.tags || []);
          setMood(parsed.mood || null);
          setImages(parsed.images || []);
        }
      } catch {
        void 0;
      }
    }
  }, [editingId, diaries]);

  // 草稿自动保存
  useEffect(() => {
    if (editingId) return;
    try {
      const draft = { title, content, tags, mood, images };
      if (content || title) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      void 0;
    }
  }, [title, content, tags, mood, images, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    try {
      // 获取环境信息
      const [weather, location] = await Promise.all([
        getCurrentWeather(),
        getCurrentLocation(),
      ]);

      if (editingId) {
        await updateDiaryById(editingId, {
          title,
          content,
          tags,
          mood,
          images,
          weather,
          location,
          isEncrypted: false,
        });
      } else {
        await createDiary({
          title,
          content,
          tags,
          mood,
          images,
          weather,
          location,
          isEncrypted: false,
        });
      }

      // 清除草稿
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        void 0;
      }

      // 返回首页
      setEditingId(null);
      navigate('/');
    } catch (error) {
      alert('保存失败，请重试');
    }
  };

  const handleCancel = () => {
    if (content || title) {
      if (!window.confirm('确定要放弃当前内容吗？')) return;
    }
    setEditingId(null);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      void 0;
    }
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingId ? '✏️ 编辑日记' : '✍️ 写新日记'}
          </h2>
          {content && (
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              {isPreview ? '📝 编辑' : '👁️ 预览'}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 标题输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标题（可选）
            </label>
            <input
              type="text"
              placeholder="给日记起个标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
              disabled={isLoading}
            />
          </div>

          {/* 心情选择器 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              今天心情
            </label>
            <MoodSelector selected={mood} onChange={setMood} />
          </div>

          {/* 内容输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              内容 <span className="text-red-500">*</span>
            </label>
            {isPreview ? (
              <div className="min-h-[300px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <MarkdownPreview content={content} />
              </div>
            ) : (
              <textarea
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 transition-all"
                rows={12}
                placeholder="今天发生了什么...（支持 Markdown 格式）"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
              />
            )}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              支持 Markdown 格式：**粗体** *斜体* `代码` [链接](URL)
            </div>
          </div>

          {/* 图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              图片（最多 9 张）
            </label>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {/* 标签输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标签
            </label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {/* 按钮组 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isLoading}
              className={`px-8 py-2 text-white rounded-lg transition-all ${
                editingId
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </span>
              ) : editingId ? (
                '✓ 确认更新'
              ) : (
                '✓ 立即记录'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 提示信息 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300"
      >
        💡 <strong>提示：</strong>保存时会自动获取当前天气和位置信息，内容会自动保存为草稿
      </motion.div>
    </motion.div>
  );
}
