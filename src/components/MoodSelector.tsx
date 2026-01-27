import type { Mood } from '../types';

interface MoodSelectorProps {
  selected: Mood | null;
  onChange: (mood: Mood) => void;
}

const moods: { value: Mood; emoji: string; label: string; color: string }[] = [
  { value: 'happy', emoji: '😊', label: '开心', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
  { value: 'calm', emoji: '😌', label: '平静', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'neutral', emoji: '😐', label: '一般', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { value: 'sad', emoji: '😢', label: '难过', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
  { value: 'angry', emoji: '😠', label: '生气', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
];

export default function MoodSelector({ selected, onChange }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-gray-600 self-center mr-2">今天心情：</span>
      {moods.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={`px-3 py-2 rounded-lg transition-all ${
            selected === mood.value
              ? `${mood.color} ring-2 ring-offset-1 ring-current scale-110`
              : `${mood.color} opacity-60`
          }`}
        >
          <span className="text-xl mr-1">{mood.emoji}</span>
          <span className="text-sm font-medium">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
