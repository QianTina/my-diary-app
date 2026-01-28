import { useNavigate } from 'react-router-dom';
import { Tag, MapPin, Thermometer, Smile, Meh, Frown, Heart, Angry as AngryIcon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import type { Diary, Mood } from '../types';

interface DiaryEntryCardProps {
  entry: Diary;
  highlightQuery?: string;
  onClick?: () => void;
}

export const DiaryEntryCard = ({ entry, highlightQuery, onClick }: DiaryEntryCardProps) => {
  const isDark = useThemeStore((state) => state.isDark);
  const navigate = useNavigate();

  const moodIcons: Record<Mood, { icon: typeof Smile; color: string; label: string }> = {
    happy: { icon: Smile, color: 'text-green-400', label: '开心' },
    calm: { icon: Heart, color: 'text-blue-400', label: '平静' },
    neutral: { icon: Meh, color: 'text-gray-400', label: '一般' },
    sad: { icon: Frown, color: 'text-yellow-400', label: '难过' },
    angry: { icon: AngryIcon, color: 'text-red-400', label: '生气' },
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/diary/${entry.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  // 高亮文本
  const highlightText = (text: string): string => {
    if (!highlightQuery || !highlightQuery.trim()) return text;

    const words = highlightQuery.trim().split(/\s+/);
    let highlighted = text;

    words.forEach(word => {
      const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
      highlighted = highlighted.replace(
        regex,
        '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>'
      );
    });

    return highlighted;
  };

  const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // 截断内容
  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const MoodIcon = entry.mood ? moodIcons[entry.mood].icon : null;
  const moodColor = entry.mood ? moodIcons[entry.mood].color : '';
  const moodLabel = entry.mood ? moodIcons[entry.mood].label : '';

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isDark
          ? 'bg-gray-800 border-gray-700 hover:border-purple-500 hover:shadow-lg'
          : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
      }`}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* 日期和心情 */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {formatDate(entry.createdAt)}
        </span>
        {MoodIcon && (
          <div className="flex items-center gap-1">
            <MoodIcon className={`w-5 h-5 ${moodColor}`} />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {moodLabel}
            </span>
          </div>
        )}
      </div>

      {/* 标题 */}
      {entry.title && (
        <h3
          className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
          dangerouslySetInnerHTML={{ __html: highlightText(entry.title) }}
        />
      )}

      {/* 内容预览 */}
      <p
        className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
        dangerouslySetInnerHTML={{ __html: highlightText(truncateContent(entry.content)) }}
      />

      {/* 元信息 */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* 标签 */}
        {entry.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {entry.tags.slice(0, 3).map(tag => `#${tag}`).join(', ')}
              {entry.tags.length > 3 && ` +${entry.tags.length - 3}`}
            </span>
          </div>
        )}

        {/* 位置 */}
        {entry.location && (
          <div className="flex items-center gap-1">
            <MapPin className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {entry.location}
            </span>
          </div>
        )}

        {/* 天气 */}
        {entry.weather && (
          <div className="flex items-center gap-1">
            <Thermometer className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {entry.weather.temp}°C {entry.weather.description}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
