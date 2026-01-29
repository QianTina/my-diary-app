/**
 * PageSpread Component Usage Examples
 * 
 * This file demonstrates various use cases for the PageSpread component.
 */

import React, { useState } from 'react';
import { FontProvider } from './FontProvider';
import { PageSpread } from './PageSpread';
import type { DiaryEntry, Notebook } from '../../types/notebook';

/**
 * Example 1: Basic page spread with two entries
 */
export function BasicPageSpreadExample() {
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

  const leftEntry: DiaryEntry = {
    id: '1',
    userId: 'user1',
    notebookId: '1',
    title: '周一',
    content: '今天开始了新的一周。\n\n早上起床后感觉精神很好，准备迎接新的挑战。',
    date: new Date('2024-01-15'),
    bookmarked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const rightEntry: DiaryEntry = {
    id: '2',
    userId: 'user1',
    notebookId: '1',
    title: '周二',
    content: '今天完成了很多工作。\n\n感觉很有成就感，继续保持这个状态。',
    date: new Date('2024-01-16'),
    bookmarked: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <FontProvider notebook={notebook}>
      <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '20px' }}>
        <PageSpread
          leftEntry={leftEntry}
          rightEntry={rightEntry}
          notebook={notebook}
          leftPageNumber={2}
          rightPageNumber={3}
        />
      </div>
    </FontProvider>
  );
}

/**
 * Example 2: Page spread with one empty page
 */
export function HalfEmptyPageSpreadExample() {
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

  const leftEntry: DiaryEntry = {
    id: '1',
    userId: 'user1',
    notebookId: '1',
    title: '巴黎第一天',
    content: '终于到达巴黎了！\n\n埃菲尔铁塔比想象中更壮观。今天走了很多路，但是很开心。',
    date: new Date('2024-02-01'),
    bookmarked: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <FontProvider notebook={notebook}>
      <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '20px' }}>
        <PageSpread
          leftEntry={leftEntry}
          rightEntry={null}
          notebook={notebook}
          leftPageNumber={4}
          rightPageNumber={5}
        />
      </div>
    </FontProvider>
  );
}

/**
 * Example 3: Interactive page spread with navigation
 */
export function InteractivePageSpreadExample() {
  const notebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: '读书笔记',
    paperStyle: 'dotted',
    fontFamily: 'serif',
    fontSize: 16,
    lineHeight: 1.6,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };

  const entries: DiaryEntry[] = [
    {
      id: '1',
      userId: 'user1',
      notebookId: '1',
      title: '《人类简史》- 第一章',
      content: '认知革命是人类历史的转折点。\n\n语言的出现让人类能够进行大规模协作。',
      date: new Date('2024-01-10'),
      bookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: 'user1',
      notebookId: '1',
      title: '《人类简史》- 第二章',
      content: '农业革命改变了人类的生活方式。\n\n从狩猎采集到定居农耕。',
      date: new Date('2024-01-11'),
      bookmarked: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      userId: 'user1',
      notebookId: '1',
      title: '《人类简史》- 第三章',
      content: '文字的发明让知识得以传承。\n\n人类文明开始快速发展。',
      date: new Date('2024-01-12'),
      bookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      userId: 'user1',
      notebookId: '1',
      title: '《人类简史》- 第四章',
      content: '科学革命带来了现代社会。\n\n技术进步改变了一切。',
      date: new Date('2024-01-13'),
      bookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const [currentSpread, setCurrentSpread] = useState(0);
  const totalSpreads = Math.ceil(entries.length / 2);

  const leftEntry = entries[currentSpread * 2] || null;
  const rightEntry = entries[currentSpread * 2 + 1] || null;

  return (
    <FontProvider notebook={notebook}>
      <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '20px' }}>
        {/* Navigation header */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <button
            onClick={() => setCurrentSpread(Math.max(0, currentSpread - 1))}
            disabled={currentSpread === 0}
            style={{
              padding: '10px 20px',
              background: currentSpread === 0 ? '#d1d5db' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentSpread === 0 ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            ← 上一页
          </button>

          <span style={{ fontSize: '16px', color: '#374151' }}>
            第 {currentSpread + 1} / {totalSpreads} 页
          </span>

          <button
            onClick={() => setCurrentSpread(Math.min(totalSpreads - 1, currentSpread + 1))}
            disabled={currentSpread === totalSpreads - 1}
            style={{
              padding: '10px 20px',
              background: currentSpread === totalSpreads - 1 ? '#d1d5db' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentSpread === totalSpreads - 1 ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            下一页 →
          </button>
        </div>

        {/* Page spread */}
        <PageSpread
          leftEntry={leftEntry}
          rightEntry={rightEntry}
          notebook={notebook}
          leftPageNumber={currentSpread * 2 + 2}
          rightPageNumber={currentSpread * 2 + 3}
        />
      </div>
    </FontProvider>
  );
}

/**
 * Example 4: Different paper styles comparison
 */
export function PaperStylesComparisonSpreadExample() {
  const paperStyles: Array<{ style: any; name: string }> = [
    { style: 'lined', name: '横线' },
    { style: 'grid', name: '方格' },
    { style: 'dotted', name: '点阵' },
  ];

  const sampleEntry: DiaryEntry = {
    id: '1',
    userId: 'user1',
    notebookId: '1',
    title: '示例标题',
    content: '这是一段示例文本，用于展示不同纸张样式的效果。\n\n每种样式都有其独特的视觉特点。',
    date: new Date(),
    bookmarked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div style={{ padding: '40px', background: '#f3f4f6' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
        双页展开 - 纸张样式对比
      </h1>

      {paperStyles.map(({ style, name }) => {
        const notebook: Notebook = {
          id: '1',
          userId: 'user1',
          name: name,
          paperStyle: style,
          fontFamily: 'system',
          fontSize: 16,
          lineHeight: 1.5,
          createdAt: new Date(),
          updatedAt: new Date(),
          archived: false,
        };

        return (
          <div key={style} style={{ marginBottom: '60px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
              {name}
            </h2>
            <FontProvider notebook={notebook}>
              <PageSpread
                leftEntry={sampleEntry}
                rightEntry={sampleEntry}
                notebook={notebook}
                leftPageNumber={2}
                rightPageNumber={3}
              />
            </FontProvider>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Example CSS for demo layout
 */
const exampleStyles = `
.page-spread-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.page-spread-demo h1 {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  font-size: 2.5em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.page-spread-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.navigation-button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.navigation-button:hover:not(:disabled) {
  background: #2563eb;
}

.navigation-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 16px;
  color: #374151;
  font-weight: 500;
}
`;

export { exampleStyles };
