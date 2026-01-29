/**
 * BookmarkPanel Component
 * 
 * Displays bookmarked diary entries.
 * Entries are clickable to navigate to specific pages.
 * 
 * Requirements: 7.1, 7.5
 */

import React, { useMemo } from 'react';
import { X, Bookmark, Calendar } from 'lucide-react';
import type { DiaryEntry } from '../../types/notebook';
import './BookmarkPanel.css';

/**
 * Bookmark entry interface
 */
export interface BookmarkEntry {
  /** Entry ID */
  id: string;
  /** Entry title */
  title: string;
  /** Entry date */
  date: Date;
  /** Page number where this entry appears */
  pageNumber: number;
  /** Entry content preview */
  preview?: string;
}

/**
 * BookmarkPanel component props
 */
export interface BookmarkPanelProps {
  /** List of bookmarked diary entries */
  entries: DiaryEntry[];
  /** Current page number */
  currentPage?: number;
  /** Callback when an entry is clicked */
  onEntryClick: (entry: BookmarkEntry) => void;
  /** Callback when bookmark is toggled */
  onToggleBookmark?: (entryId: string) => void;
  /** Callback when close button is clicked */
  onClose: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Format date for display
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get day of week in Chinese
 */
const getDayOfWeek = (date: Date): string => {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return `周${days[date.getDay()]}`;
};

/**
 * Generate content preview (first 100 characters)
 */
const generatePreview = (content: string): string => {
  const plainText = content.replace(/[#*_~`]/g, '').trim();
  return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText;
};

/**
 * BookmarkPanel component displays bookmarked entries
 * 
 * @example
 * ```tsx
 * <BookmarkPanel
 *   entries={bookmarkedEntries}
 *   currentPage={5}
 *   onEntryClick={(entry) => navigateToPage(entry.pageNumber)}
 *   onToggleBookmark={(id) => toggleBookmark(id)}
 *   onClose={() => setShowBookmarks(false)}
 * />
 * ```
 */
export const BookmarkPanel: React.FC<BookmarkPanelProps> = ({
  entries,
  currentPage,
  onEntryClick,
  onToggleBookmark,
  onClose,
  className = '',
}) => {
  // Convert entries to bookmark entries with page numbers
  const bookmarkEntries = useMemo<BookmarkEntry[]>(() => {
    return entries
      .filter(entry => entry.bookmarked)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((entry, index) => ({
        id: entry.id,
        title: entry.title,
        date: entry.date,
        pageNumber: index + 1, // Simplified page numbering
        preview: generatePreview(entry.content),
      }));
  }, [entries]);

  return (
    <div className={`bookmark-panel-overlay ${className}`}>
      <div className="bookmark-panel">
        {/* Header */}
        <div className="bookmark-panel__header">
          <div className="bookmark-panel__title-section">
            <Bookmark size={24} />
            <h2 className="bookmark-panel__title">书签</h2>
            <span className="bookmark-panel__count">
              {bookmarkEntries.length}
            </span>
          </div>
          <button
            className="bookmark-panel__close"
            onClick={onClose}
            aria-label="关闭书签"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="bookmark-panel__content">
          {bookmarkEntries.length === 0 ? (
            <div className="bookmark-panel__empty">
              <Bookmark size={48} />
              <p>还没有添加书签</p>
              <span className="bookmark-panel__empty-hint">
                点击日记条目上的书签图标来添加书签
              </span>
            </div>
          ) : (
            <div className="bookmark-panel__list">
              {bookmarkEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`bookmark-panel__entry ${
                    currentPage === entry.pageNumber ? 'active' : ''
                  }`}
                >
                  <button
                    className="bookmark-panel__entry-content"
                    onClick={() => onEntryClick(entry)}
                  >
                    <div className="bookmark-panel__entry-header">
                      <div className="bookmark-panel__entry-date">
                        <Calendar size={16} />
                        <span className="bookmark-panel__entry-date-text">
                          {formatDate(entry.date)}
                        </span>
                        <span className="bookmark-panel__entry-day">
                          {getDayOfWeek(entry.date)}
                        </span>
                      </div>
                      <div className="bookmark-panel__entry-page">
                        第 {entry.pageNumber} 页
                      </div>
                    </div>
                    <div className="bookmark-panel__entry-title">
                      {entry.title || '无标题'}
                    </div>
                    {entry.preview && (
                      <div className="bookmark-panel__entry-preview">
                        {entry.preview}
                      </div>
                    )}
                  </button>
                  
                  {/* Remove bookmark button */}
                  {onToggleBookmark && (
                    <button
                      className="bookmark-panel__remove-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(entry.id);
                      }}
                      aria-label="移除书签"
                      title="移除书签"
                    >
                      <Bookmark size={18} fill="currentColor" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkPanel;
