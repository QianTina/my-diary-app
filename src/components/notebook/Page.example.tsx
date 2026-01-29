/**
 * Page Component Usage Examples
 * 
 * This file demonstrates various use cases for the Page component.
 */

import React from 'react';
import { FontProvider } from './FontProvider';
import { Page } from './Page';
import type { DiaryEntry, Notebook } from '../../types/notebook';

/**
 * Example 1: Basic page with entry
 */
export function BasicPageExample() {
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

  const entry: DiaryEntry = {
    id: '1',
    userId: 'user1',
    notebookId: '1',
    title: '美好的一天',
    content: '今天天气很好，阳光明媚。\n\n早上去公园散步，看到很多人在锻炼。\n\n下午读了一本好书，收获很多。',
    date: new Date('2024-01-15'),
    bookmarked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <FontProvider notebook={notebook}>
      <div style={{ padding: '20px', background: '#f3f4f6' }}>
        <Page
          entry={entry}
          notebook={notebook}
          pageNumber={1}
          side="left"
        />
      </div>
    </FontProvider>
  );
}

/**
 * Example 2: Empty page
 */
export function EmptyPageExample() {
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
      <div style={{ padding: '20px', background: '#f3f4f6' }}>
        <Page
          notebook={notebook}
          pageNumber={5}
          side="right"
        />
      </div>
    </FontProvider>
  );
}

/**
 * Example 3: Page with bookmark
 */
export function BookmarkedPageExample() {
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

  const entry: DiaryEntry = {
    id: '1',
    userId: 'user1',
    notebookId: '1',
    title: '巴黎之旅',
    content: '今天终于到达巴黎了！\n\n埃菲尔铁塔比想象中更壮观。站在塔下仰望，感受到了人类建筑的伟大。\n\n晚上在塞纳河边散步，欣赏夜景，非常浪漫。',
    date: new Date('2024-02-01'),
    bookmarked: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <FontProvider notebook={notebook}>
      <div style={{ padding: '20px', background: '#f3f4f6' }}>
        <Page
          entry={entry}
          notebook={notebook}
          pageNumber={12}
          side="left"
        />
      </div>
    </FontProvider>
  );
}

/**
 * Example 4: Page with custom paper style override
 */
export function CustomPaperStyleExample() {
  const notebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: '工作日记',
    paperStyle: 'lined',
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
    title: '项目规划',
    content: '今天完成了项目的初步规划。\n\n主要任务：\n1. 需求分析\n2. 技术选型\n3. 架构设计\n4. 时间安排',
    date: new Date('2024-01-20'),
    paperStyle: 'grid', // Override notebook default
    bookmarked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <FontProvider notebook={notebook}>
      <div style={{ padding: '20px', background: '#f3f4f6' }}>
        <Page
          entry={entry}
          notebook={notebook}
          pageNumber={8}
          side="right"
        />
      </div>
    </FontProvider>
  );
}

/**
 * Example 5: Left and right pages side by side
 */
export function PageSpreadExample() {
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

  const leftEntry: DiaryEntry = {
    id: '1',
    userId: 'user1',
    notebookId: '1',
    title: '《人类简史》第一章',
    content: '这本书从认知革命开始讲述人类的历史。\n\n作者认为，正是语言的出现让人类能够进行大规模协作。',
    date: new Date('2024-01-10'),
    bookmarked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const rightEntry: DiaryEntry = {
    id: '2',
    userId: 'user1',
    notebookId: '1',
    title: '《人类简史》第二章',
    content: '农业革命改变了人类的生活方式。\n\n从狩猎采集到定居农耕，人类付出了巨大的代价。',
    date: new Date('2024-01-11'),
    bookmarked: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <FontProvider notebook={notebook}>
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        padding: '20px', 
        background: '#f3f4f6',
        justifyContent: 'center',
      }}>
        <Page
          entry={leftEntry}
          notebook={notebook}
          pageNumber={2}
          side="left"
        />
        <Page
          entry={rightEntry}
          notebook={notebook}
          pageNumber={3}
          side="right"
        />
      </div>
    </FontProvider>
  );
}

/**
 * Example 6: Different paper styles comparison
 */
export function PaperStylesComparisonExample() {
  const paperStyles: Array<{ style: any; name: string }> = [
    { style: 'blank', name: '空白' },
    { style: 'lined', name: '横线' },
    { style: 'grid', name: '方格' },
    { style: 'dotted', name: '点阵' },
    { style: 'vintage', name: '复古' },
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
    <div style={{ padding: '20px' }}>
      <h1>纸张样式对比</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px',
      }}>
        {paperStyles.map(({ style, name }) => {
          const notebook: Notebook = {
            id: '1',
            userId: 'user1',
            name: name,
            paperStyle: style,
            fontFamily: 'system',
            fontSize: 14,
            lineHeight: 1.5,
            createdAt: new Date(),
            updatedAt: new Date(),
            archived: false,
          };

          return (
            <div key={style}>
              <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>{name}</h3>
              <FontProvider notebook={notebook}>
                <Page
                  entry={sampleEntry}
                  notebook={notebook}
                  pageNumber={1}
                  side="left"
                />
              </FontProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Example 7: Long content with scrolling
 */
export function LongContentExample() {
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

  const longContent = `这是一篇很长的日记内容。

第一段：今天发生了很多有趣的事情。早上起床后，阳光透过窗户洒进房间，感觉特别温暖。

第二段：吃完早餐后，我开始了一天的工作。今天的任务比较多，但是效率很高，完成得很顺利。

第三段：中午和朋友一起吃饭，聊了很多话题。我们讨论了最近看的电影、读的书，还有对未来的规划。

第四段：下午继续工作，处理了一些重要的事情。虽然有些挑战，但最终都解决了。

第五段：晚上去健身房锻炼，感觉身体状态很好。运动真的能让人精神焕发。

第六段：回家后看了一会儿书，然后写下了今天的日记。感觉今天过得很充实。

第七段：明天又是新的一天，期待会有更多美好的事情发生。

第八段：生活就是这样，平凡中蕴含着幸福。珍惜每一天，认真生活。`;

  const entry: DiaryEntry = {
    id: '1',
    userId: 'user1',
    notebookId: '1',
    title: '充实的一天',
    content: longContent,
    date: new Date('2024-01-25'),
    bookmarked: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <FontProvider notebook={notebook}>
      <div style={{ padding: '20px', background: '#f3f4f6' }}>
        <Page
          entry={entry}
          notebook={notebook}
          pageNumber={15}
          side="left"
        />
      </div>
    </FontProvider>
  );
}

/**
 * Example CSS for demo layout
 */
const exampleStyles = `
.page-demo {
  padding: 40px;
  background: #f3f4f6;
  min-height: 100vh;
}

.page-demo h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #1f2937;
}

.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-container {
  display: flex;
  justify-content: center;
}

.page-spread {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 20px;
  background: #e5e7eb;
  border-radius: 8px;
}
`;

export { exampleStyles };
