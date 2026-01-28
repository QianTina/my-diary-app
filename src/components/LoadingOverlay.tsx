import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
}

export const LoadingOverlay = ({ isOpen, message = '加载中... Loading...' }: LoadingOverlayProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Loading 内容 */}
      <div className="relative bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-8 flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  );
};
