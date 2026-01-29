/**
 * Complete Notebook Page Example
 * 
 * This example demonstrates how to integrate FontProvider and PaperBackground
 * to create a complete notebook page with proper styling inheritance.
 */

import React from 'react';
import { FontProvider, useFontSettings } from './FontProvider';
import { PaperBackgroundWithInheritance } from './PaperBackgroundWithInheritance';
import type { DiaryEntry, Notebook } from '../../types/notebook';

/**
 * Complete notebook page with font and paper style
 */
export function NotebookPageComplete({ entry, notebook }: { 
  entry: DiaryEntry; 
  notebook: Notebook;
}) {
  return (
    <FontProvider notebook={notebook}>
      <div className="notebook-page">
        {/* Paper background with inheritance */}
        <PaperBackgroundWithInheritance 
          entry={entry}
          notebook={notebook}
        />
        
        {/* Content with font settings */}
        <PageContent entry={entry} />
      </div>
    </FontProvider>
  );
}

/**
 * Page content component
 */
function PageContent({ entry }: { entry: DiaryEntry }) {
  const fontSettings = useFontSettings();
  
  return (
    <div 
      className="page-content"
      style={{
        fontFamily: fontSettings.fontFamilyCSS,
        fontSize: `${fontSettings.fontSize}px`,
        lineHeight: fontSettings.lineHeight,
      }}
    >
      <header className="page-header">
        <h1 className="page-title">{entry.title}</h1>
        <time className="page-date">
          {entry.date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </time>
      </header>
      
      <article className="page-body">
        {entry.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </article>
      
      {entry.bookmarked && (
        <div className="page-bookmark" aria-label="已添加书签">
          <span>🔖</span>
        </div>
      )}
    </div>
  );
}

/**
 * Notebook reader with multiple pages
 */
export function NotebookReader({ notebook, entries }: {
  notebook: Notebook;
  entries: DiaryEntry[];
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const currentEntry = entries[currentIndex];
  
  return (
    <FontProvider notebook={notebook}>
      <div className="notebook-reader">
        {/* Header */}
        <header className="reader-header">
          <h1>{notebook.name}</h1>
          <p>{notebook.description}</p>
        </header>
        
        {/* Current page */}
        <div className="reader-page">
          <PaperBackgroundWithInheritance 
            entry={currentEntry}
            notebook={notebook}
          />
          <PageContent entry={currentEntry} />
        </div>
        
        {/* Navigation */}
        <nav className="reader-navigation">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            ← 上一页
          </button>
          <span>
            {currentIndex + 1} / {entries.length}
          </span>
          <button
            onClick={() => setCurrentIndex(Math.min(entries.length - 1, currentIndex + 1))}
            disabled={currentIndex === entries.length - 1}
          >
            下一页 →
          </button>
        </nav>
      </div>
    </FontProvider>
  );
}

/**
 * Notebook list with preview
 */
export function NotebookList({ notebooks }: { notebooks: Notebook[] }) {
  return (
    <div className="notebook-list">
      {notebooks.map(notebook => (
        <NotebookCard key={notebook.id} notebook={notebook} />
      ))}
    </div>
  );
}

/**
 * Notebook card with preview
 */
function NotebookCard({ notebook }: { notebook: Notebook }) {
  return (
    <FontProvider notebook={notebook}>
      <div className="notebook-card">
        {/* Cover */}
        <div 
          className="notebook-cover"
          style={{
            backgroundColor: notebook.coverColor || '#f3f4f6',
            backgroundImage: notebook.coverImage ? `url(${notebook.coverImage})` : undefined,
          }}
        >
          <h2>{notebook.name}</h2>
        </div>
        
        {/* Preview */}
        <div className="notebook-preview">
          <PaperBackgroundWithInheritance notebook={notebook} />
          <PreviewContent notebook={notebook} />
        </div>
        
        {/* Info */}
        <div className="notebook-info">
          <p>{notebook.description}</p>
          <div className="notebook-meta">
            <span>纸张: {notebook.paperStyle}</span>
            <span>字体: {notebook.fontFamily}</span>
            <span>大小: {notebook.fontSize}px</span>
          </div>
        </div>
      </div>
    </FontProvider>
  );
}

/**
 * Preview content
 */
function PreviewContent({ notebook }: { notebook: Notebook }) {
  const fontSettings = useFontSettings();
  
  return (
    <div 
      className="preview-content"
      style={{
        fontFamily: fontSettings.fontFamilyCSS,
        fontSize: `${fontSettings.fontSize}px`,
        lineHeight: fontSettings.lineHeight,
      }}
    >
      <p>这是一个预览文本，展示日记本的样式效果。</p>
      <p>The quick brown fox jumps over the lazy dog.</p>
    </div>
  );
}

/**
 * Complete demo with multiple notebooks and entries
 */
export function CompleteDemo() {
  const notebooks: Notebook[] = [
    {
      id: '1',
      userId: 'user1',
      name: '工作日记',
      description: '记录工作中的点点滴滴',
      paperStyle: 'lined',
      fontFamily: 'system',
      fontSize: 16,
      lineHeight: 1.5,
      coverColor: '#3b82f6',
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
    },
    {
      id: '2',
      userId: 'user1',
      name: '旅行日记',
      description: '记录旅途中的美好时光',
      paperStyle: 'vintage',
      fontFamily: 'handwriting',
      fontSize: 18,
      lineHeight: 1.8,
      coverColor: '#f59e0b',
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
    },
    {
      id: '3',
      userId: 'user1',
      name: '读书笔记',
      description: '记录阅读心得和感悟',
      paperStyle: 'grid',
      fontFamily: 'serif',
      fontSize: 16,
      lineHeight: 1.6,
      coverColor: '#10b981',
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
    },
  ];

  const entries: Record<string, DiaryEntry[]> = {
    '1': [
      {
        id: '1-1',
        userId: 'user1',
        notebookId: '1',
        title: '项目启动会议',
        content: '今天参加了新项目的启动会议，团队成员都很积极...',
        date: new Date('2024-01-15'),
        bookmarked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '1-2',
        userId: 'user1',
        notebookId: '1',
        title: '代码审查',
        content: '完成了本周的代码审查，发现了几个可以优化的地方...',
        date: new Date('2024-01-16'),
        paperStyle: 'dotted', // Override notebook default
        bookmarked: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    '2': [
      {
        id: '2-1',
        userId: 'user1',
        notebookId: '2',
        title: '抵达巴黎',
        content: '终于到达巴黎了！埃菲尔铁塔真的很壮观...',
        date: new Date('2024-02-01'),
        bookmarked: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    '3': [
      {
        id: '3-1',
        userId: 'user1',
        notebookId: '3',
        title: '《人类简史》读后感',
        content: '这本书让我重新思考了人类文明的发展历程...',
        date: new Date('2024-01-20'),
        bookmarked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  const [selectedNotebook, setSelectedNotebook] = React.useState<Notebook | null>(null);

  return (
    <div className="complete-demo">
      <h1>纸质风格日记本 - 完整演示</h1>
      
      {!selectedNotebook ? (
        <>
          <h2>选择一个日记本</h2>
          <div className="notebook-grid">
            {notebooks.map(notebook => (
              <div 
                key={notebook.id}
                onClick={() => setSelectedNotebook(notebook)}
                style={{ cursor: 'pointer' }}
              >
                <NotebookCard notebook={notebook} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setSelectedNotebook(null)}>
            ← 返回日记本列表
          </button>
          <NotebookReader 
            notebook={selectedNotebook}
            entries={entries[selectedNotebook.id] || []}
          />
        </>
      )}
    </div>
  );
}

/**
 * Example CSS styles
 */
const exampleStyles = `
.notebook-page {
  position: relative;
  width: 600px;
  height: 800px;
  margin: 20px auto;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 60px 50px;
  height: 100%;
  overflow: auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  margin: 0 0 10px 0;
  font-size: 1.8em;
  font-weight: 600;
}

.page-date {
  display: block;
  font-size: 0.9em;
  color: #6b7280;
}

.page-body p {
  margin: 1em 0;
}

.page-bookmark {
  position: absolute;
  top: 0;
  right: 30px;
  font-size: 2.5em;
}

.notebook-reader {
  max-width: 800px;
  margin: 0 auto;
}

.reader-header {
  text-align: center;
  margin-bottom: 30px;
}

.reader-page {
  position: relative;
  margin-bottom: 20px;
}

.reader-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.reader-navigation button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reader-navigation button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.notebook-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.notebook-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: transform 0.2s, box-shadow 0.2s;
}

.notebook-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.notebook-cover {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background-size: cover;
  background-position: center;
}

.notebook-cover h2 {
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.notebook-preview {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.preview-content {
  position: relative;
  z-index: 1;
  padding: 20px;
}

.notebook-info {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.notebook-meta {
  display: flex;
  gap: 15px;
  margin-top: 10px;
  font-size: 0.875em;
  color: #6b7280;
}

.complete-demo {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.notebook-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
`;

export { exampleStyles };
