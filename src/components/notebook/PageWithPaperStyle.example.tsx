/**
 * Page Component with Paper Style Inheritance - Example
 * 
 * This example demonstrates how to use PaperBackgroundWithInheritance
 * in a real page component for the diary notebook reader.
 */

import React from 'react';
import { PaperBackgroundWithInheritance } from './PaperBackgroundWithInheritance';
import { useFontSettings, getFontFamilyCSS } from '../../hooks/usePaperStyle';
import type { DiaryEntry, Notebook } from '../../types/notebook';

interface PageProps {
  /** The diary entry to display (optional for empty pages) */
  entry?: DiaryEntry;
  /** The notebook this page belongs to */
  notebook: Notebook;
  /** Page number */
  pageNumber: number;
  /** Page side (left or right) */
  side: 'left' | 'right';
}

/**
 * Page component that displays a single page with inherited paper style
 * and font settings from the notebook.
 */
export const PageExample: React.FC<PageProps> = ({
  entry,
  notebook,
  pageNumber,
  side,
}) => {
  // Get font settings from notebook
  const { fontFamily, fontSize, lineHeight } = useFontSettings(notebook);
  
  return (
    <div className={`page page--${side}`}>
      {/* Paper background with automatic style inheritance */}
      <PaperBackgroundWithInheritance 
        entry={entry}
        notebook={notebook}
        className="page__background"
      />
      
      {/* Page content with notebook font settings */}
      <div 
        className="page__content"
        style={{
          fontFamily: getFontFamilyCSS(fontFamily),
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
        }}
      >
        {entry ? (
          <>
            <h2 className="page__title">{entry.title}</h2>
            <time className="page__date">
              {entry.date.toLocaleDateString('zh-CN')}
            </time>
            <div className="page__text">{entry.content}</div>
            {entry.bookmarked && (
              <span className="page__bookmark" aria-label="已添加书签">
                🔖
              </span>
            )}
          </>
        ) : (
          <div className="page__empty">空白页</div>
        )}
      </div>
      
      {/* Page number */}
      <div className="page__number">{pageNumber}</div>
    </div>
  );
};

/**
 * Example: Page Spread (two pages side by side)
 */
export const PageSpreadExample: React.FC<{
  leftEntry?: DiaryEntry;
  rightEntry?: DiaryEntry;
  notebook: Notebook;
  leftPageNumber: number;
  rightPageNumber: number;
}> = ({ leftEntry, rightEntry, notebook, leftPageNumber, rightPageNumber }) => {
  return (
    <div className="page-spread">
      <PageExample
        entry={leftEntry}
        notebook={notebook}
        pageNumber={leftPageNumber}
        side="left"
      />
      <div className="page-spread__spine" />
      <PageExample
        entry={rightEntry}
        notebook={notebook}
        pageNumber={rightPageNumber}
        side="right"
      />
    </div>
  );
};

/**
 * Example: Demonstrating paper style inheritance
 */
export const InheritanceDemo: React.FC = () => {
  // Mock notebook with default paper style
  const notebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: '我的日记',
    paperStyle: 'lined', // Default: lined
    fontFamily: 'system',
    fontSize: 16,
    lineHeight: 1.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };
  
  // Entry with paper style override
  const entryWithOverride: DiaryEntry = {
    id: '1',
    userId: 'user1',
    notebookId: '1',
    title: '特殊的一天',
    content: '这个条目使用复古纸张样式',
    date: new Date(),
    paperStyle: 'vintage', // Override: vintage
    bookmarked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Entry without override (inherits notebook default)
  const entryWithoutOverride: DiaryEntry = {
    id: '2',
    userId: 'user1',
    notebookId: '1',
    title: '普通的一天',
    content: '这个条目继承日记本的横线样式',
    date: new Date(),
    // No paperStyle override
    bookmarked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  return (
    <div className="inheritance-demo">
      <h1>纸张样式继承演示</h1>
      
      <section className="demo-section">
        <h2>日记本默认样式: {notebook.paperStyle}</h2>
        <p>所有条目默认使用这个样式，除非条目有自己的覆盖样式。</p>
      </section>
      
      <section className="demo-section">
        <h2>示例 1: 条目有覆盖样式</h2>
        <p>条目的 paperStyle: {entryWithOverride.paperStyle}</p>
        <div className="demo-page">
          <PageExample
            entry={entryWithOverride}
            notebook={notebook}
            pageNumber={1}
            side="left"
          />
        </div>
        <p className="demo-result">
          ✓ 使用条目的覆盖样式 (vintage)，而不是日记本的默认样式 (lined)
        </p>
      </section>
      
      <section className="demo-section">
        <h2>示例 2: 条目没有覆盖样式</h2>
        <p>条目的 paperStyle: undefined</p>
        <div className="demo-page">
          <PageExample
            entry={entryWithoutOverride}
            notebook={notebook}
            pageNumber={2}
            side="right"
          />
        </div>
        <p className="demo-result">
          ✓ 继承日记本的默认样式 (lined)
        </p>
      </section>
      
      <section className="demo-section">
        <h2>示例 3: 空白页（无条目）</h2>
        <div className="demo-page">
          <PageExample
            notebook={notebook}
            pageNumber={3}
            side="left"
          />
        </div>
        <p className="demo-result">
          ✓ 使用日记本的默认样式 (lined)
        </p>
      </section>
    </div>
  );
};

/**
 * Example CSS styles (for reference)
 */
const exampleStyles = `
.page {
  position: relative;
  width: 400px;
  height: 600px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.page__background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.page__content {
  position: relative;
  z-index: 1;
  padding: 40px;
  height: 100%;
  overflow: auto;
}

.page__title {
  margin: 0 0 8px 0;
  font-size: 1.5em;
  font-weight: 600;
}

.page__date {
  display: block;
  margin-bottom: 16px;
  font-size: 0.875em;
  color: #6b7280;
}

.page__text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  font-style: italic;
}

.page__number {
  position: absolute;
  bottom: 20px;
  right: 40px;
  font-size: 0.875em;
  color: #6b7280;
}

.page__bookmark {
  position: absolute;
  top: 0;
  right: 20px;
  font-size: 2em;
}

.page-spread {
  display: flex;
  gap: 0;
}

.page-spread__spine {
  width: 20px;
  background: linear-gradient(to right, #e5e7eb, #f3f4f6, #e5e7eb);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.demo-section {
  margin: 40px 0;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.demo-page {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.demo-result {
  padding: 12px;
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
  color: #166534;
  font-weight: 500;
}
`;

export { exampleStyles };
