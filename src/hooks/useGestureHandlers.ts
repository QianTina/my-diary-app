/**
 * Gesture Handlers Hook
 * 
 * Provides swipe and keyboard navigation handlers for the notebook reader.
 * Supports touch gestures and keyboard shortcuts.
 * 
 * Requirements: 6.3, 6.4, 6.5, 6.6
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * Gesture handlers configuration
 */
export interface GestureHandlersConfig {
  /** Callback when swipe left (next page) */
  onSwipeLeft?: () => void;
  /** Callback when swipe right (previous page) */
  onSwipeRight?: () => void;
  /** Callback when arrow left key pressed */
  onArrowLeft?: () => void;
  /** Callback when arrow right key pressed */
  onArrowRight?: () => void;
  /** Callback when arrow up key pressed */
  onArrowUp?: () => void;
  /** Callback when arrow down key pressed */
  onArrowDown?: () => void;
  /** Callback when Home key pressed */
  onHome?: () => void;
  /** Callback when End key pressed */
  onEnd?: () => void;
  /** Minimum swipe distance in pixels */
  swipeThreshold?: number;
  /** Enable/disable gesture handlers */
  enabled?: boolean;
}

/**
 * Touch event data
 */
interface TouchData {
  startX: number;
  startY: number;
  startTime: number;
}

/**
 * Hook for handling swipe gestures and keyboard navigation
 * 
 * @example
 * ```tsx
 * const { ref } = useGestureHandlers({
 *   onSwipeLeft: () => navigateNext(),
 *   onSwipeRight: () => navigatePrevious(),
 *   onArrowLeft: () => navigatePrevious(),
 *   onArrowRight: () => navigateNext(),
 * });
 * 
 * return <div ref={ref}>...</div>;
 * ```
 */
export const useGestureHandlers = (config: GestureHandlersConfig) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onArrowLeft,
    onArrowRight,
    onArrowUp,
    onArrowDown,
    onHome,
    onEnd,
    swipeThreshold = 50,
    enabled = true,
  } = config;

  const touchDataRef = useRef<TouchData | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    touchDataRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, [enabled]);

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !touchDataRef.current) return;

    const touch = e.changedTouches[0];
    const { startX, startY, startTime } = touchDataRef.current;
    
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const deltaTime = Date.now() - startTime;

    // Calculate swipe velocity
    const velocity = Math.abs(deltaX) / deltaTime;

    // Check if it's a horizontal swipe (not vertical scroll)
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    
    // Check if swipe distance exceeds threshold
    const exceedsThreshold = Math.abs(deltaX) > swipeThreshold;

    if (isHorizontalSwipe && exceedsThreshold && velocity > 0.3) {
      if (deltaX > 0) {
        // Swipe right (previous page)
        onSwipeRight?.();
      } else {
        // Swipe left (next page)
        onSwipeLeft?.();
      }
    }

    touchDataRef.current = null;
  }, [enabled, swipeThreshold, onSwipeLeft, onSwipeRight]);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't handle if user is typing in an input
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onArrowRight?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onArrowDown?.();
        break;
      case 'Home':
        e.preventDefault();
        onHome?.();
        break;
      case 'End':
        e.preventDefault();
        onEnd?.();
        break;
    }
  }, [enabled, onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onHome, onEnd]);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Keyboard events (on document)
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleTouchStart, handleTouchEnd, handleKeyDown]);

  /**
   * Ref callback to attach to element
   */
  const ref = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  return { ref };
};

/**
 * Keyboard shortcuts configuration
 */
export const KEYBOARD_SHORTCUTS = {
  previousPage: ['ArrowLeft', 'PageUp'],
  nextPage: ['ArrowRight', 'PageDown'],
  firstPage: ['Home'],
  lastPage: ['End'],
  tableOfContents: ['t', 'T'],
  bookmarks: ['b', 'B'],
  search: ['/', 'Ctrl+f', 'Cmd+f'],
} as const;

/**
 * Hook for keyboard shortcuts with help panel
 */
export const useKeyboardShortcuts = (handlers: {
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onFirstPage?: () => void;
  onLastPage?: () => void;
  onTableOfContents?: () => void;
  onBookmarks?: () => void;
  onSearch?: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = e.key;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Previous page
      if (key === 'ArrowLeft' || key === 'PageUp') {
        e.preventDefault();
        handlers.onPreviousPage?.();
      }
      // Next page
      else if (key === 'ArrowRight' || key === 'PageDown') {
        e.preventDefault();
        handlers.onNextPage?.();
      }
      // First page
      else if (key === 'Home') {
        e.preventDefault();
        handlers.onFirstPage?.();
      }
      // Last page
      else if (key === 'End') {
        e.preventDefault();
        handlers.onLastPage?.();
      }
      // Table of contents
      else if (key === 't' || key === 'T') {
        e.preventDefault();
        handlers.onTableOfContents?.();
      }
      // Bookmarks
      else if (key === 'b' || key === 'B') {
        e.preventDefault();
        handlers.onBookmarks?.();
      }
      // Search
      else if (key === '/' || (isCtrlOrCmd && key === 'f')) {
        e.preventDefault();
        handlers.onSearch?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
};
