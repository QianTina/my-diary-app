/**
 * PageSpread Component (Desktop)
 * 
 * Renders two pages side-by-side with a book spine in the center.
 * Designed for desktop viewports to provide a realistic book reading experience.
 * 
 * Requirements: 5.1
 */

import React from 'react';
import { Page } from './Page';
import type { DiaryEntry, Notebook } from '../../types/notebook';
import './PageSpread.css';

/**
 * PageSpread component props
 */
export interface PageSpreadProps {
  /** Left page entry (optional for empty page) */
  leftEntry?: DiaryEntry | null;
  /** Right page entry (optional for empty page) */
  rightEntry?: DiaryEntry | null;
  /** The notebook these pages belong to */
  notebook: Notebook;
  /** Left page number */
  leftPageNumber: number;
  /** Right page number */
  rightPageNumber: number;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * PageSpread component renders two pages side-by-side with a book spine,
 * creating a realistic book reading experience on desktop devices.
 * 
 * @example
 * ```tsx
 * <PageSpread
 *   leftEntry={entry1}
 *   rightEntry={entry2}
 *   notebook={activeNotebook}
 *   leftPageNumber={2}
 *   rightPageNumber={3}
 * />
 * ```
 */
export const PageSpread: React.FC<PageSpreadProps> = ({
  leftEntry,
  rightEntry,
  notebook,
  leftPageNumber,
  rightPageNumber,
  className = '',
}) => {
  return (
    <div 
      className={`page-spread ${className}`}
      role="region"
      aria-label={`双页展开: 第 ${leftPageNumber} 页和第 ${rightPageNumber} 页`}
    >
      {/* Left page */}
      <div className="page-spread__left">
        <Page
          entry={leftEntry}
          notebook={notebook}
          pageNumber={leftPageNumber}
          side="left"
        />
      </div>

      {/* Book spine */}
      <div 
        className="page-spread__spine"
        role="presentation"
        aria-hidden="true"
      >
        <div className="page-spread__spine-shadow" />
        <div className="page-spread__spine-highlight" />
      </div>

      {/* Right page */}
      <div className="page-spread__right">
        <Page
          entry={rightEntry}
          notebook={notebook}
          pageNumber={rightPageNumber}
          side="right"
        />
      </div>
    </div>
  );
};

export default PageSpread;
