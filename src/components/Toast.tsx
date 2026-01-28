import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast = ({
  isOpen,
  message,
  type = 'info',
  duration = 4000,
  onClose,
}: ToastProps) => {
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const bgColors = {
    success: isDark ? 'bg-green-900/30 border-green-500/50' : 'bg-green-50 border-green-200',
    error: isDark ? 'bg-red-900/30 border-red-500/50' : 'bg-red-50 border-red-200',
    info: isDark ? 'bg-blue-900/30 border-blue-500/50' : 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: isDark ? 'text-green-200' : 'text-green-800',
    error: isDark ? 'text-red-200' : 'text-red-800',
    info: isDark ? 'text-blue-200' : 'text-blue-800',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div
        className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm min-w-[300px] max-w-md ${bgColors[type]}`}
      >
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <p className={`flex-1 text-sm font-medium ${textColors[type]}`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`flex-shrink-0 transition-colors ${
            isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
