import { Smile, Frown, Meh, Wind, Flame } from 'lucide-react';
import type { Mood } from '../types';

interface MoodIconProps {
  mood: Mood | string;
  className?: string;
}

export function MoodIcon({ mood, className = 'w-5 h-5' }: MoodIconProps) {
  const moodConfig: Record<string, { icon: typeof Smile; color: string }> = {
    'happy': { icon: Smile, color: 'text-yellow-500' },
    'sad': { icon: Frown, color: 'text-blue-500' },
    'neutral': { icon: Meh, color: 'text-gray-500' },
    'calm': { icon: Wind, color: 'text-green-500' },
    'angry': { icon: Flame, color: 'text-red-500' },
    '开心': { icon: Smile, color: 'text-yellow-500' },
    '难过': { icon: Frown, color: 'text-blue-500' },
    '平静': { icon: Meh, color: 'text-gray-500' },
    '平和': { icon: Wind, color: 'text-green-500' },
    '愤怒': { icon: Flame, color: 'text-red-500' },
  };

  const config = moodConfig[mood] || moodConfig['neutral'];
  const Icon = config.icon;

  return <Icon className={`${className} ${config.color}`} />;
}
