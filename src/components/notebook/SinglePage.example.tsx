/**
 * SinglePage Component Usage Examples
 * 
 * This file demonstrates various use cases for the SinglePage component.
 */

import React, { useState } from 'react';
import { FontProvider } from './FontProvider';
import { SinglePage } from './SinglePage';
import type { DiaryEntry, Notebook } from '../../types/notebook';

/**
 * Example 1: Basic single page with navigation
 */
export function BasicSinglePageExample() {
  const notebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: '我的日记',
    paperStyle: 'lined',
    fontFamily: 'system',
    fontSize: 16,
    lineHeight: 1.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };

  const entries: DiaryEntry[] = [
    {
      id: '1',
      userId: 'user1',
      notebookId: '1',
      title: '第一天',
      content: '今天开始写日记。\n\n希望能坚持下去，记录生活的点点滴滴。',
      date: new Date('2024-01-15'),
      bookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: 'user1',
      notebookId: '1',
      title: '第二天',
      content: '今天天气很好。\n\n去公园散步，心情愉悦。',
      date: new Date('2024-01-16'),
      bookmarked: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      userId: 'user1',
      notebookId: '1',
      title: '第三天',
      content: '继续记录。\n\n每一天都是新的开始。',
      date: new Date('2024-01-17'),
      bookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const [currentPage, setCurrentPage] = useState(0);

  const handleSwipeLeft = () => {
    if (currentPage < entries.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <FontProvider notebook={notebook}>
      <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
        <SinglePage
          entry={entries[currentPage]}
          notebook={notebook}
          pageNumber={currentPage + 1}
          totalPages={entries.length}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </div>
    </FontProvider>
  );
}

/**
 * Example 2: Single page with button navigation
 */
export function SinglePageWithButtonsExample() {
  const notebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: '旅行日记',
    paperStyle: 'vintage',
    fontFamily: 'handwriting',
    fontSize: 18,
    lineHeight: 1.8,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };

  const entries: DiaryEntry[] = [
    {
      id: '1',
      userId: 'user1',
      notebookId: '1',
      title: '巴黎第一天',
      content: '终于到达巴黎了！\n\n埃菲尔铁塔真的很壮观。',
      date: new Date('2024-02-01'),
      bookmarked: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: 'user1',
      notebookId: '1',
      title: '巴黎第二天',
      content: '今天去了卢浮宫。\n\n看到了蒙娜丽莎，人很多。',
      date: new Date('2024-02-02'),
      bookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const [currentPage, setCurrentPage] = useState(0);

  return (
    <FontProvider notebook={notebook}>
      <div style={{ background: '#f3f4f6', minHeight: '100vh', position: 'relative' }}>
        <SinglePage
          entry={entries[currentPage]}
          notebook={notebook}
          pageNumber={currentPage + 1}
          totalPages={entries.length}
          onSwipeLeft={() => setCurrentPage(Math.min(entries.length - 1, currentPage + 1))}
          onSwipeRight={() => setCurrentPage(Math.max(0, currentPage - 1))}
        />
        
        {/* Navigation buttons */}
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 200,
        }}>
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            style={{
              padding: '10px 20px',
              background: currentPage === 0 ? '#d1d5db' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ← 上一页
          </button>
          
          <button
            onClick={() => setCurrentPage(Math.min(entries.length - 1, currentPage + 1))}
            disabled={currentPage === entries.length - 1}
            style={{
              padding: '10px 20px',
              background: currentPage === entries.length - 1 ? '#d1d5db' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: currentPage === entries.length - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            下一页 →
          </button>
        </div>
      </div>
    </FontProvider>
  );
}

/**
 * Example 3: Empty page
 */
export function EmptySinglePageExample() {
  const notebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: '我的日记',
    paperStyle: 'blank',
    fontFamily: 'serif',
    fontSize: 16,
    lineHeight: 1.6,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };

  return (
    <FontProvider notebook={notebook}>
      <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
        <SinglePage
          notebook={notebook}
          pageNumber={5}
          totalPages={10}
        />
      </div>
    </FontProvider>
  );
}

/**
 * Example 4: Different paper styles on mobile
 */
export function MobilePaperStylesExample() {
  const paperStyles: Array<{ style: any; name: string }> = [
    { style: 'lined', name: '横线' },
    { style: 'grid', name: '方格' },
    { style: 'dotted', name: '点阵' },
    { style: 'vintage', name: '复古' },
  ];

  const [currentStyle, setCurrentStyle] = useState(0);

  const notebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: paperStyles[currentStyle].name,
    paperStyle: paperStyles[currentStyle].style,
    fontFamily: 'system',
    fontSize: 16,
    lineHeight: 1.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };

  const entry: DiaryEntry = {
    id: '1',
    userId: 'user1',
    notebookId: '1',
    title: '纸张样式测试',
    content: '这是一段示例文本，用于展示不同纸张样式的效果。\n\n左右滑动可以切换不同的纸张样式。',
    date: new Date(),
    bookmarked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <FontProvider notebook={notebook}>
      <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
        <SinglePage
          entry={entry}
          notebook={notebook}
          pageNumber={currentStyle + 1}
          totalPages={paperStyles.length}
          onSwipeLeft={() => setCurrentStyle(Math.min(paperStyles.length - 1, currentStyle + 1))}
          onSwipeRight={() => setCurrentStyle(Math.max(0, currentStyle - 1))}
        />
        
        {/* Style indicator */}
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 200,
        }}>
          当前样式: {paperStyles[currentStyle].name}
        </div>
      </div>
    </FontProvider>
  );
}

/**
 * Example CSS for demo layout
 */
const exampleStyles = `
.single-page-demo {
  min-height: 100vh;
  background: #f3f4f6;
}

.demo-controls {
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 200;
}

.demo-button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.demo-button:hover:not(:disabled) {
  background: #2563eb;
}

.demo-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.demo-indicator {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 500;
  z-index: 200;
}
`;

export { exampleStyles };
