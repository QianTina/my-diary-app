/**
 * FontProvider Usage Examples
 * 
 * This file demonstrates how to use FontProvider and font-related hooks
 * in various components.
 */

import React from 'react';
import { FontProvider, useFontContext, useFontSettings } from './FontProvider';
import type { Notebook, DiaryEntry } from '../../types/notebook';

/**
 * Example 1: Basic usage with FontProvider
 */
export function BasicExample() {
  const notebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: '我的日记',
    paperStyle: 'lined',
    fontFamily: 'serif',
    fontSize: 18,
    lineHeight: 1.6,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };

  return (
    <FontProvider notebook={notebook}>
      <EntryContent />
    </FontProvider>
  );
}

/**
 * Example 2: Entry content with font settings
 */
function EntryContent() {
  const { settings, fontsLoaded } = useFontContext();

  return (
    <div
      className="entry-content"
      style={{
        fontFamily: settings.fontFamilyCSS,
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
        opacity: fontsLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
      }}
    >
      <h2>日记标题</h2>
      <p>
        这是日记内容。字体设置来自日记本配置：
        <br />
        字体系列: {settings.fontFamily}
        <br />
        字体大小: {settings.fontSize}px
        <br />
        行高: {settings.lineHeight}
      </p>
      {!fontsLoaded && <small>字体加载中...</small>}
    </div>
  );
}

/**
 * Example 3: Multiple entries with same font settings
 */
export function MultipleEntriesExample() {
  const notebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: '我的日记',
    paperStyle: 'lined',
    fontFamily: 'handwriting',
    fontSize: 16,
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
      title: '第一天',
      content: '今天是美好的一天...',
      date: new Date('2024-01-01'),
      bookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: 'user1',
      notebookId: '1',
      title: '第二天',
      content: '继续记录生活...',
      date: new Date('2024-01-02'),
      bookmarked: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return (
    <FontProvider notebook={notebook}>
      <div className="entries-list">
        {entries.map(entry => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </FontProvider>
  );
}

/**
 * Entry card component using font settings
 */
function EntryCard({ entry }: { entry: DiaryEntry }) {
  const settings = useFontSettings();

  return (
    <article
      className="entry-card"
      style={{
        fontFamily: settings.fontFamilyCSS,
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
      }}
    >
      <h3>{entry.title}</h3>
      <time>{entry.date.toLocaleDateString('zh-CN')}</time>
      <p>{entry.content}</p>
      {entry.bookmarked && <span>🔖</span>}
    </article>
  );
}

/**
 * Example 4: Font settings comparison
 */
export function FontComparisonExample() {
  const notebooks: Notebook[] = [
    {
      id: '1',
      userId: 'user1',
      name: '系统字体',
      paperStyle: 'lined',
      fontFamily: 'system',
      fontSize: 16,
      lineHeight: 1.5,
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
    },
    {
      id: '2',
      userId: 'user1',
      name: '手写字体',
      paperStyle: 'lined',
      fontFamily: 'handwriting',
      fontSize: 18,
      lineHeight: 1.8,
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
    },
    {
      id: '3',
      userId: 'user1',
      name: '衬线字体',
      paperStyle: 'lined',
      fontFamily: 'serif',
      fontSize: 16,
      lineHeight: 1.6,
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
    },
    {
      id: '4',
      userId: 'user1',
      name: '无衬线字体',
      paperStyle: 'lined',
      fontFamily: 'sansSerif',
      fontSize: 16,
      lineHeight: 1.5,
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
    },
  ];

  const sampleText = '这是一段示例文本，用于展示不同字体的效果。The quick brown fox jumps over the lazy dog.';

  return (
    <div className="font-comparison">
      <h1>字体样式对比</h1>
      {notebooks.map(notebook => (
        <div key={notebook.id} className="comparison-item">
          <h2>{notebook.name}</h2>
          <FontProvider notebook={notebook}>
            <FontSample text={sampleText} />
          </FontProvider>
        </div>
      ))}
    </div>
  );
}

/**
 * Font sample component
 */
function FontSample({ text }: { text: string }) {
  const { settings, fontsLoaded } = useFontContext();

  return (
    <div className="font-sample">
      <div
        className="sample-text"
        style={{
          fontFamily: settings.fontFamilyCSS,
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
        }}
      >
        {text}
      </div>
      <div className="sample-info">
        <small>
          字体: {settings.fontFamily} | 
          大小: {settings.fontSize}px | 
          行高: {settings.lineHeight} |
          {fontsLoaded ? ' ✓ 已加载' : ' ⏳ 加载中'}
        </small>
      </div>
    </div>
  );
}

/**
 * Example 5: Nested FontProviders (override)
 */
export function NestedProvidersExample() {
  const parentNotebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: '父日记本',
    paperStyle: 'lined',
    fontFamily: 'system',
    fontSize: 16,
    lineHeight: 1.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };

  const childNotebook: Notebook = {
    id: '2',
    userId: 'user1',
    name: '子日记本',
    paperStyle: 'lined',
    fontFamily: 'handwriting',
    fontSize: 20,
    lineHeight: 2.0,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };

  return (
    <div className="nested-example">
      <h1>嵌套 FontProvider 示例</h1>
      
      <FontProvider notebook={parentNotebook}>
        <div className="parent-section">
          <h2>父级字体设置</h2>
          <FontInfo />
          
          <FontProvider notebook={childNotebook}>
            <div className="child-section">
              <h2>子级字体设置（覆盖）</h2>
              <FontInfo />
            </div>
          </FontProvider>
        </div>
      </FontProvider>
    </div>
  );
}

/**
 * Display current font info
 */
function FontInfo() {
  const { settings } = useFontContext();

  return (
    <div
      className="font-info"
      style={{
        fontFamily: settings.fontFamilyCSS,
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
      }}
    >
      <p>当前字体设置：</p>
      <ul>
        <li>字体系列: {settings.fontFamily}</li>
        <li>字体大小: {settings.fontSize}px</li>
        <li>行高: {settings.lineHeight}</li>
      </ul>
      <p>这段文字使用当前的字体设置显示。</p>
    </div>
  );
}

/**
 * Example CSS styles (for reference)
 */
const exampleStyles = `
.entry-content {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.entry-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.entry-card h3 {
  margin: 0 0 8px 0;
}

.entry-card time {
  display: block;
  margin-bottom: 12px;
  font-size: 0.875em;
  color: #6b7280;
}

.font-comparison {
  padding: 20px;
}

.comparison-item {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.font-sample {
  padding: 20px;
  background: #f9fafb;
  border-radius: 4px;
}

.sample-text {
  margin-bottom: 12px;
}

.sample-info {
  color: #6b7280;
}

.nested-example {
  padding: 20px;
}

.parent-section {
  padding: 20px;
  background: #f3f4f6;
  border-radius: 8px;
}

.child-section {
  margin-top: 20px;
  padding: 20px;
  background: #e5e7eb;
  border-radius: 8px;
}

.font-info {
  padding: 16px;
  background: #fff;
  border-radius: 4px;
}
`;

export { exampleStyles };
