import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDiaryStore } from '../store/diaryStore';
import { useThemeStore } from '../store/themeStore';
import TagInput from '../components/TagInput';
import MarkdownPreview from '../components/MarkdownPreview';
import MoodSelector from '../components/MoodSelector';
import ImageUploader from '../components/ImageUploader';
import { getCurrentWeather, getCurrentLocation } from '../utils/weather';
import { Eye, Edit3, X, Save } from 'lucide-react';
import type { Mood } from '../types';

export default function WritePage() {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
  const { editingId, diaries, createDiary, updateDiaryById, setEditingId, isLoading } = useDiaryStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mood, setMood] = useState<Mood | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);

  const DRAFT_KEY = 'diary_draft_v2';

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

      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        void 0;
      }

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

  const today = new Date().toLocaleDateString('zh-CN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen">
      {/* 顶部栏 */}
      <header className={`border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{today}</div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {isPreview ? <Edit3 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button
            onClick={handleCancel}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X className="w-4 h-4" />
            <span>取消</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? '保存中...' : editingId ? '更新' : '保存'}</span>
          </button>
        </div>
      </header>

      <div className="p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 标题输入 */}
          <input
            type="text"
            placeholder="标题（可选）"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full text-3xl font-bold bg-transparent border-none outline-none ${
              isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
            }`}
            disabled={isLoading}
          />

          {/* 心情选择器 */}
          <MoodSelector selected={mood} onChange={setMood} />

          {/* 内容输入/预览 */}
          {isPreview ? (
            <div className={`min-h-[400px] p-6 rounded-xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <MarkdownPreview content={content} isDark={isDark} />
            </div>
          ) : (
            <textarea
              className={`w-full min-h-[400px] p-6 border rounded-xl focus:outline-none focus:border-purple-500 resize-none transition-colors ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="开始写作...（支持 Markdown 格式）"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
            />
          )}

          {/* 图片上传 */}
          <ImageUploader images={images} onChange={setImages} />

          {/* 标签输入 */}
          <TagInput tags={tags} onChange={setTags} />

          {/* 提示信息 */}
          <div className={`p-4 rounded-lg text-sm border ${
            isDark 
              ? 'bg-gray-800/50 text-gray-400 border-gray-700' 
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            💡 保存时会自动获取当前天气和位置信息
          </div>
        </motion.div>
      </div>
    </div>
  );
}
