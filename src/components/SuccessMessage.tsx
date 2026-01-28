import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const SuccessMessage = ({ 
  message, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 3000 
}: SuccessMessageProps) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  return (
    <div className="flex items-start gap-3 p-4 bg-green-900/30 border border-green-500/50 rounded-lg backdrop-blur-sm">
      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm text-green-200">
        {message}
      </p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-green-400 hover:text-green-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
