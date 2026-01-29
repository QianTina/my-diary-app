// ============================================
// Keyboard Shortcuts Hook
// 键盘快捷键 Hook
// ============================================

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
}

/**
 * Hook for registering keyboard shortcuts
 * 注册键盘快捷键的 Hook
 * 
 * @param shortcuts - Array of keyboard shortcuts to register
 * @param enabled - Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const {
          key,
          ctrl = false,
          shift = false,
          alt = false,
          meta = false,
          handler,
        } = shortcut;

        // Check if all modifiers match
        const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
        const altMatch = alt ? event.altKey : !event.altKey;
        const metaMatch = meta ? event.metaKey : !event.metaKey;

        // Check if key matches (case-insensitive)
        const keyMatch = event.key.toLowerCase() === key.toLowerCase();

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault();
          handler(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Common keyboard shortcuts for task management
 * 任务管理的常用键盘快捷键
 */
export const TASK_SHORTCUTS = {
  NEW_TASK: { key: 'n', description: 'Create new task 新建任务' },
  SEARCH: { key: '/', description: 'Focus search 聚焦搜索' },
  TOGGLE_VIEW: { key: 'v', description: 'Toggle view mode 切换视图模式' },
  TOGGLE_STATS: { key: 's', description: 'Toggle statistics 切换统计面板' },
  ESCAPE: { key: 'Escape', description: 'Close modal/Clear selection 关闭模态框/清除选择' },
  HELP: { key: '?', shift: true, description: 'Show keyboard shortcuts 显示键盘快捷键' },
} as const;
