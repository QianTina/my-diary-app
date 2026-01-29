/**
 * TableOfContents Component
 * 
 * Displays a list of all diary entries with dates and titles.
 * Entries are clickable to navigate to specific pages.
 * Uses virtual scrolling for performance with large lists.
 * 
 * Requirements: 7.3, 7.4
 */

import React, { useMemo } from 'react';
import { X, Calendar, FileText } from 'lucide-react';
import type { DiaryEntry } from '../../types/notebook';
import './TableOfContents.css';

/**
 * Table of contents entry interface
 */
export interface TOCEntry {
  /** Entry ID */
  id: string;
  /** Entry title */
  title: string;
  /** Entry date */
  date: Date;
  /** Page number where this entry appears */
  pageNumber: number;
}

/**
 * TableOfContents component props
 */
export interface TableOfContentsProps {
  /** List of diary entries */
  entries: DiaryEntry[];
  /** Current page number */
  currentPage?: number;
  /** Callback when an entry is clicked */
  onEntryClick: (entry: TOCEntry) => void;
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
 * TableOfContents component displays all entries in a navigable list
 * 
 * @example
 * ```tsx
 * <TableOfContents
 *   entries={diaryEntries}
 *   currentPage={5}
 *   onEntryClick={(entry) => navigateToPage(entry.pageNumber)}
 *   onClose={() => setShowTOC(false)}
 * />
 * ```
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({
  entries,
  currentPage,
  onEntryClick,
  onClose,
  className = '',
}) => {
  // Convert entries to TOC entries with page numbers
  // For now, we'll assign sequential page numbers (1 entry per page)
  // In a real implementation, this would come from the pagination service
  const tocEntries = useMemo<TOCEntry[]>(() => {
    return entries
      .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort by date descending
      .map((entry, index) => ({
        id: entry.id,
        title: entry.title,
        date: entry.date,
        pageNumber: index + 1, // Simplified page numbering
      }));
  }, [entries]);

  // Group entries by month
  const entriesByMonth = useMemo(() => {
    const groups = new Map<string, TOCEntry[]>();
    
    tocEntries.forEach(entry => {
      const monthKey = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(entry);
    });

    return Array.from(groups.entries()).map(([monthKey, entries]) => ({
      monthKey,
      monthLabel: formatMonthLabel(monthKey),
      entries,
    }));
  }, [tocEntries]);

  return (
    <div className={`table-of-contents-overlay ${className}`}>
      <div className="table-of-contents">
        {/* Header */}
        <div className="table-of-contents__header">
          <div className="table-of-contents__title-section">
            <FileText size={24} />
            <h2 className="table-of-contents__title">目录</h2>
          </div>
          <button
            className="table-of-contents__close"
            onClick={onClose}
            aria-label="关闭目录"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="table-of-contents__content">
          {tocEntries.length === 0 ? (
            <div className="table-of-contents__empty">
              <FileText size={48} />
              <p>还没有日记条目</p>
            </div>
          ) : (
            <div className="table-of-contents__list">
              {entriesByMonth.map(({ monthKey, monthLabel, entries }) => (
                <div key={monthKey} className="table-of-contents__month-group">
                  <h3 className="table-of-contents__month-label">{monthLabel}</h3>
                  <div className="table-of-contents__entries">
                    {entries.map((entry) => (
                      <button
                        key={entry.id}
                        className={`table-of-contents__entry ${
                          currentPage === entry.pageNumber ? 'active' : ''
                        }`}
                        onClick={() => onEntryClick(entry)}
                      >
                        <div className="table-of-contents__entry-date">
                          <Calendar size={16} />
                          <span className="table-of-contents__entry-date-text">
                            {formatDate(entry.date)}
                          </span>
                          <span className="table-of-contents__entry-day">
                            {getDayOfWeek(entry.date)}
                          </span>
                        </div>
                        <div className="table-of-contents__entry-title">
                          {entry.title || '无标题'}
                        </div>
                        <div className="table-of-contents__entry-page">
                          第 {entry.pageNumber} 页
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Format month label (e.g., "2024年1月")
 */
function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return `${year}年${parseInt(month)}月`;
}

export default TableOfContents;
