/**
 * usePaperStyle Hook 使用示例
 * 
 * 此文件展示如何在组件中使用纸张样式继承 Hook
 */

import React from 'react';
import { usePaperStyle, useFontSettings, getPaperStyleClassName, getFontFamilyCSS } from './usePaperStyle';
import type { DiaryEntry, Notebook } from '../types/notebook';

/**
 * 示例 1：在条目卡片中使用纸张样式
 */
export function EntryCardExample({ entry, notebook }: { entry: DiaryEntry; notebook: Notebook }) {
  // 解析有效的纸张样式（条目覆盖或日记本默认）
  const paperStyle = usePaperStyle(entry, notebook);
  const fontSettings = useFontSettings(notebook);
  
  return (
    <div 
      className={`entry-card ${getPaperStyleClassName(paperStyle)}`}
      style={{
        fontFamily: getFontFamilyCSS(fontSettings.fontFamily),
        fontSize: `${fontSettings.fontSize}px`,
        lineHeight: fontSettings.lineHeight,
      }}
    >
      <h3>{entry.title}</h3>
      <p>{entry.content}</p>
      <small>纸张样式: {paperStyle}</small>
    </div>
  );
}

/**
 * 示例 2：在页面组件中使用纸张样式
 */
export function PageExample({ entry, notebook }: { entry?: DiaryEntry; notebook: Notebook }) {
  // 如果没有条目，只使用日记本的默认样式
  const paperStyle = usePaperStyle(entry, notebook);
  const fontSettings = useFontSettings(notebook);
  
  return (
    <div 
      className={`page ${getPaperStyleClassName(paperStyle)}`}
      style={{
        fontFamily: getFontFamilyCSS(fontSettings.fontFamily),
        fontSize: `${fontSettings.fontSize}px`,
        lineHeight: fontSettings.lineHeight,
      }}
    >
      {entry ? (
        <>
          <h2>{entry.title}</h2>
          <div className="content">{entry.content}</div>
        </>
      ) : (
        <div className="empty-page">空白页</div>
      )}
    </div>
  );
}

/**
 * 示例 3：演示纸张样式继承和覆盖
 */
export function InheritanceDemo() {
  // 模拟数据
  const notebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: '我的日记',
    paperStyle: 'lined', // 日记本默认：横线
    fontFamily: 'system',
    fontSize: 16,
    lineHeight: 1.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };
  
  const entryWithOverride: DiaryEntry = {
    id: '1',
    userId: 'user1',
    notebookId: '1',
    title: '条目 1',
    content: '这个条目有自己的纸张样式',
    date: new Date(),
    paperStyle: 'vintage', // 条目覆盖：复古
    bookmarked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const entryWithoutOverride: DiaryEntry = {
    id: '2',
    userId: 'user1',
    notebookId: '1',
    title: '条目 2',
    content: '这个条目继承日记本的纸张样式',
    date: new Date(),
    // 没有 paperStyle 覆盖
    bookmarked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const style1 = usePaperStyle(entryWithOverride, notebook);
  const style2 = usePaperStyle(entryWithoutOverride, notebook);
  const style3 = usePaperStyle(undefined, notebook);
  
  return (
    <div className="inheritance-demo">
      <h2>纸张样式继承演示</h2>
      
      <div className="demo-section">
        <h3>日记本默认样式</h3>
        <p>paperStyle: {notebook.paperStyle}</p>
      </div>
      
      <div className="demo-section">
        <h3>条目 1（有覆盖）</h3>
        <p>条目的 paperStyle: {entryWithOverride.paperStyle}</p>
        <p>有效样式: {style1}</p>
        <p className="result">✓ 使用条目的覆盖样式</p>
      </div>
      
      <div className="demo-section">
        <h3>条目 2（无覆盖）</h3>
        <p>条目的 paperStyle: undefined</p>
        <p>有效样式: {style2}</p>
        <p className="result">✓ 继承日记本的默认样式</p>
      </div>
      
      <div className="demo-section">
        <h3>空白页（无条目）</h3>
        <p>有效样式: {style3}</p>
        <p className="result">✓ 使用日记本的默认样式</p>
      </div>
    </div>
  );
}
