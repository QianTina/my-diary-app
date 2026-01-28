import { AlertTriangle, X } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = '确认 Confirm',
  cancelText = '取消 Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmDialogProps) => {
  const isDark = useThemeStore((state) => state.isDark);

  if (!isOpen) return null;

  const variantColors = {
    danger: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  const confirmButtonColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* 对话框 */}
      <div
        className={`relative w-full max-w-md rounded-lg shadow-2xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onCancel}
          className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* 内容 */}
        <div className="p-6">
          {/* 图标和标题 */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-full ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${variantColors[variant]}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {message}
              </p>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                confirmButtonColors[variant]
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
