import { Smile, Wind, Meh, Frown, Flame } from 'lucide-react';
import type { Mood } from '../types';

interface MoodSelectorProps {
  selected: Mood | null;
  onChange: (mood: Mood) => void;
}

const moods: { value: Mood; icon: typeof Smile; label: string; color: string }[] = [
  { value: 'happy', icon: Smile, label: '开心', color: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/50' },
  { value: 'calm', icon: Wind, label: '平静', color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/50' },
  { value: 'neutral', icon: Meh, label: '一般', color: 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border-gray-500/50' },
  { value: 'sad', icon: Frown, label: '难过', color: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border-indigo-500/50' },
  { value: 'angry', icon: Flame, label: '生气', color: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50' },
];

export default function MoodSelector({ selected, onChange }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {moods.map((mood) => {
        const Icon = mood.icon;
        return (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            className={`px-4 py-2 rounded-lg transition-all border flex items-center gap-2 ${
              selected === mood.value
                ? `${mood.color} ring-2 ring-offset-2 ring-offset-gray-900 scale-105`
                : `${mood.color} opacity-60`
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
}
