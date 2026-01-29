/**
 * NavigationControls Component
 * 
 * Navigation controls for the notebook reader with page navigation,
 * table of contents, and bookmarks.
 * 
 * Requirements: 6.1, 6.2, 7.2, 7.3, 7.4
 */

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  List, 
  Bookmark 
} from 'lucide-react';
import './NavigationControls.css';

/**
 * NavigationControls component props
 */
export interface NavigationControlsProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when previous page is clicked */
  onPreviousPage: () => void;
  /** Callback when next page is clicked */
  onNextPage: () => void;
  /** Callback when jump to date is clicked */
  onJumpToDate?: () => void;
  /** Callback when table of contents is clicked */
  onShowTableOfContents?: () => void;
  /** Callback when bookmarks is clicked */
  onShowBookmarks?: () => void;
  /** Whether previous button is disabled */
  canGoPrevious?: boolean;
  /** Whether next button is disabled */
  canGoNext?: boolean;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * NavigationControls component provides navigation controls for the notebook reader
 * 
 * @example
 * ```tsx
 * <NavigationControls
 *   currentPage={5}
 *   totalPages={20}
 *   onPreviousPage={() => navigateToPreviousPage()}
 *   onNextPage={() => navigateToNextPage()}
 *   onJumpToDate={() => setShowDatePicker(true)}
 *   onShowTableOfContents={() => setShowTOC(true)}
 *   onShowBookmarks={() => setShowBookmarks(true)}
 * />
 * ```
 */
export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  onJumpToDate,
  onShowTableOfContents,
  onShowBookmarks,
  canGoPrevious = true,
  canGoNext = true,
  className = '',
}) => {
  const isPreviousDisabled = currentPage <= 1 || !canGoPrevious;
  const isNextDisabled = currentPage >= totalPages || !canGoNext;

  return (
    <div className={`navigation-controls ${className}`} role="navigation" aria-label="页面导航">
      {/* Left section - Previous button */}
      <div className="navigation-controls__section navigation-controls__section--left">
        <button
          className="navigation-controls__button navigation-controls__button--nav"
          onClick={onPreviousPage}
          disabled={isPreviousDisabled}
          aria-label="上一页"
          title="上一页 (←)"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Center section - Page indicator and actions */}
      <div className="navigation-controls__section navigation-controls__section--center">
        {/* Page indicator */}
        <div className="navigation-controls__page-indicator" role="status" aria-live="polite">
          <span className="navigation-controls__current-page">{currentPage}</span>
          <span className="navigation-controls__separator">/</span>
          <span className="navigation-controls__total-pages">{totalPages}</span>
        </div>

        {/* Action buttons */}
        <div className="navigation-controls__actions">
          {/* Jump to date */}
          {onJumpToDate && (
            <button
              className="navigation-controls__button navigation-controls__button--action"
              onClick={onJumpToDate}
              aria-label="跳转到日期"
              title="跳转到日期"
            >
              <Calendar size={20} />
            </button>
          )}

          {/* Table of contents */}
          {onShowTableOfContents && (
            <button
              className="navigation-controls__button navigation-controls__button--action"
              onClick={onShowTableOfContents}
              aria-label="目录"
              title="目录"
            >
              <List size={20} />
            </button>
          )}

          {/* Bookmarks */}
          {onShowBookmarks && (
            <button
              className="navigation-controls__button navigation-controls__button--action"
              onClick={onShowBookmarks}
              aria-label="书签"
              title="书签"
            >
              <Bookmark size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Right section - Next button */}
      <div className="navigation-controls__section navigation-controls__section--right">
        <button
          className="navigation-controls__button navigation-controls__button--nav"
          onClick={onNextPage}
          disabled={isNextDisabled}
          aria-label="下一页"
          title="下一页 (→)"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;
