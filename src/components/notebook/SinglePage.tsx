/**
 * SinglePage Component (Mobile)
 * 
 * Renders a single page view optimized for mobile devices.
 * Provides a responsive, touch-friendly reading experience.
 * 
 * Requirements: 5.2
 */

import React from 'react';
import { Page } from './Page';
import type { DiaryEntry, Notebook } from '../../types/notebook';
import './SinglePage.css';

/**
 * SinglePage component props
 */
export interface SinglePageProps {
  /** The diary entry to display (optional for empty page) */
  entry?: DiaryEntry | null;
  /** The notebook this page belongs to */
  notebook: Notebook;
  /** Page number */
  pageNumber: number;
  /** Total number of pages */
  totalPages?: number;
  /** Optional className for additional styling */
  className?: string;
  /** Callback when user swipes left (next page) */
  onSwipeLeft?: () => void;
  /** Callback when user swipes right (previous page) */
  onSwipeRight?: () => void;
}

/**
 * SinglePage component renders a single page view optimized for mobile devices.
 * Includes touch gesture support for navigation.
 * 
 * @example
 * ```tsx
 * <SinglePage
 *   entry={diaryEntry}
 *   notebook={activeNotebook}
 *   pageNumber={5}
 *   totalPages={20}
 *   onSwipeLeft={() => goToNextPage()}
 *   onSwipeRight={() => goToPreviousPage()}
 * />
 * ```
 */
export const SinglePage: React.FC<SinglePageProps> = ({
  entry,
  notebook,
  pageNumber,
  totalPages,
  className = '',
  onSwipeLeft,
  onSwipeRight,
}) => {
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div 
      className={`single-page ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label={`第 ${pageNumber} 页${totalPages ? ` / 共 ${totalPages} 页` : ''}`}
    >
      {/* Page container */}
      <div className="single-page__container">
        <Page
          entry={entry}
          notebook={notebook}
          pageNumber={pageNumber}
          side="left"
        />
      </div>

      {/* Page indicator */}
      {totalPages && (
        <div 
          className="single-page__indicator"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="single-page__indicator-current">{pageNumber}</span>
          <span className="single-page__indicator-separator">/</span>
          <span className="single-page__indicator-total">{totalPages}</span>
        </div>
      )}

      {/* Swipe hint (shows on first load) */}
      <div className="single-page__swipe-hint" aria-hidden="true">
        <div className="single-page__swipe-hint-left">
          <span>←</span>
          <span>上一页</span>
        </div>
        <div className="single-page__swipe-hint-right">
          <span>下一页</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
};

export default SinglePage;
