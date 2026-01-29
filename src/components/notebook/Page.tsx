/**
 * Page Component
 * 
 * Renders a single page with paper background, entry content, and page number.
 * Includes shadows and depth effects for a realistic book appearance.
 * 
 * Requirements: 5.3, 5.4
 */

import React from 'react';
import { PaperBackgroundWithInheritance } from './PaperBackgroundWithInheritance';
import { useFontSettings } from './FontProvider';
import type { DiaryEntry, Notebook } from '../../types/notebook';
import './Page.css';

/**
 * Page component props
 */
export interface PageProps {
  /** The diary entry to display (optional for empty pages) */
  entry?: DiaryEntry | null;
  /** The notebook this page belongs to */
  notebook: Notebook;
  /** Page number */
  pageNumber: number;
  /** Page side (left or right) */
  side: 'left' | 'right';
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Page component renders a single page with paper background, entry content,
 * page number, and realistic shadows/depth effects.
 * 
 * @example
 * ```tsx
 * <Page
 *   entry={diaryEntry}
 *   notebook={activeNotebook}
 *   pageNumber={1}
 *   side="left"
 * />
 * ```
 */
export const Page: React.FC<PageProps> = ({
  entry,
  notebook,
  pageNumber,
  side,
  className = '',
}) => {
  const fontSettings = useFontSettings();

  return (
    <div 
      className={`page page--${side} ${className}`}
      data-page-number={pageNumber}
      role="article"
      aria-label={entry ? `页面 ${pageNumber}: ${entry.title}` : `页面 ${pageNumber}: 空白页`}
    >
      {/* Paper background with inheritance */}
      <PaperBackgroundWithInheritance 
        entry={entry}
        notebook={notebook}
        className="page__background"
      />
      
      {/* Page content */}
      <div 
        className="page__content"
        style={{
          fontFamily: fontSettings.fontFamilyCSS,
          fontSize: `${fontSettings.fontSize}px`,
          lineHeight: fontSettings.lineHeight,
        }}
      >
        {entry ? (
          <>
            {/* Entry header */}
            <header className="page__header">
              <h2 className="page__title">{entry.title}</h2>
              <time 
                className="page__date"
                dateTime={entry.date.toISOString()}
              >
                {entry.date.toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </time>
            </header>
            
            {/* Entry content */}
            <article className="page__body">
              {entry.content.split('\n').map((paragraph, index) => (
                paragraph.trim() ? (
                  <p key={index} className="page__paragraph">
                    {paragraph}
                  </p>
                ) : (
                  <br key={index} />
                )
              ))}
            </article>
            
            {/* Bookmark indicator */}
            {entry.bookmarked && (
              <div 
                className="page__bookmark"
                role="img"
                aria-label="已添加书签"
              >
                <span>🔖</span>
              </div>
            )}
          </>
        ) : (
          /* Empty page */
          <div className="page__empty" aria-label="空白页">
            <span className="page__empty-text">空白页</span>
          </div>
        )}
      </div>
      
      {/* Page number */}
      <div 
        className="page__number"
        aria-label={`第 ${pageNumber} 页`}
      >
        {pageNumber}
      </div>
      
      {/* Shadow effects for depth */}
      <div className="page__shadow" aria-hidden="true" />
      <div className="page__edge-shadow" aria-hidden="true" />
    </div>
  );
};

export default Page;
