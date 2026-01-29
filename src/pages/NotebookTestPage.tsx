/**
 * Notebook Test Page
 * 
 * 测试页面，用于展示纸质风格日记本的新组件
 */

import React, { useState } from 'react';
import { FontProvider } from '../components/notebook/FontProvider';
import { Page } from '../components/notebook/Page';
import { PageSpread } from '../components/notebook/PageSpread';
import { PaperBackground } from '../components/notebook/PaperBackground';
import type { DiaryEntry, Notebook, PaperStyle } from '../types/notebook';

export default function NotebookTestPage() {
  const [selectedPaperStyle, setSelectedPaperStyle] = useState<PaperStyle>('lined');
  const [selectedFontFamily, setSelectedFontFamily] = useState('system');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);

  // 示例日记本
  const notebook: Notebook = {
    id: '1',
    userId: 'user1',
    name: '我的测试日记本',
    paperStyle: selectedPaperStyle,
    fontFamily: selectedFontFamily,
    fontSize: fontSize,
    lineHeight: lineHeight,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };

  // 示例条目
  const sampleEntry: DiaryEntry = {
    id: '1',
    userId: 'user1',
    notebookId: '1',
    title: '美好的一天',
    content: `今天天气很好，阳光明媚。

早上去公园散步，看到很多人在锻炼身体。空气清新，心情愉悦。

中午和朋友一起吃饭，聊了很多有趣的话题。我们讨论了最近看的电影、读的书，还有对未来的规划。

下午继续工作，处理了一些重要的事情。虽然有些挑战，但最终都解决了。

晚上去健身房锻炼，感觉身体状态很好。运动真的能让人精神焕发。

回家后看了一会儿书，然后写下了今天的日记。感觉今天过得很充实。`,
    date: new Date(),
    bookmarked: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const paperStyles: PaperStyle[] = ['blank', 'lined', 'grid', 'dotted', 'vintage'];
  const fontFamilies = ['system', 'handwriting', 'serif', 'sansSerif'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* 标题 */}
        <h1 style={{
          textAlign: 'center',
          color: 'white',
          marginBottom: '40px',
          fontSize: '2.5em',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}>
          📖 纸质风格日记本 - 组件测试
        </h1>

        {/* 控制面板 */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>
            🎨 样式控制面板
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}>
            {/* 纸张样式选择 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
              }}>
                纸张样式
              </label>
              <select
                value={selectedPaperStyle}
                onChange={(e) => setSelectedPaperStyle(e.target.value as PaperStyle)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                }}
              >
                {paperStyles.map(style => (
                  <option key={style} value={style}>
                    {style === 'blank' && '空白'}
                    {style === 'lined' && '横线'}
                    {style === 'grid' && '方格'}
                    {style === 'dotted' && '点阵'}
                    {style === 'vintage' && '复古'}
                  </option>
                ))}
              </select>
            </div>

            {/* 字体系列选择 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
              }}>
                字体系列
              </label>
              <select
                value={selectedFontFamily}
                onChange={(e) => setSelectedFontFamily(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>
                    {font === 'system' && '系统默认'}
                    {font === 'handwriting' && '手写风格'}
                    {font === 'serif' && '衬线体'}
                    {font === 'sansSerif' && '无衬线体'}
                  </option>
                ))}
              </select>
            </div>

            {/* 字体大小 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
              }}>
                字体大小: {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                style={{
                  width: '100%',
                }}
              />
            </div>

            {/* 行高 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
              }}>
                行高: {lineHeight}
              </label>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                style={{
                  width: '100%',
                }}
              />
            </div>
          </div>
        </div>

        {/* 页面展示区域 */}
        <div style={{
          display: 'flex',
          gap: '40px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {/* 左页 */}
          <div>
            <h3 style={{
              textAlign: 'center',
              color: 'white',
              marginBottom: '20px',
              fontSize: '1.2em',
            }}>
              左页（带内容）
            </h3>
            <FontProvider notebook={notebook}>
              <Page
                entry={sampleEntry}
                notebook={notebook}
                pageNumber={2}
                side="left"
              />
            </FontProvider>
          </div>

          {/* 右页 */}
          <div>
            <h3 style={{
              textAlign: 'center',
              color: 'white',
              marginBottom: '20px',
              fontSize: '1.2em',
            }}>
              右页（空白页）
            </h3>
            <FontProvider notebook={notebook}>
              <Page
                notebook={notebook}
                pageNumber={3}
                side="right"
              />
            </FontProvider>
          </div>
        </div>

        {/* 双页展开展示区域 */}
        <div style={{
          marginTop: '60px',
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937', textAlign: 'center' }}>
            📚 双页展开视图（桌面）
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '30px' }}>
            在桌面设备上，两页并排显示，中间有书脊效果
          </p>
          <FontProvider notebook={notebook}>
            <PageSpread
              leftEntry={sampleEntry}
              rightEntry={{
                ...sampleEntry,
                id: '2',
                title: '第二天',
                content: '继续记录生活的点点滴滴。\n\n每一天都是新的开始，充满希望和可能。\n\n珍惜当下，活在当下。',
              }}
              notebook={notebook}
              leftPageNumber={2}
              rightPageNumber={3}
            />
          </FontProvider>
        </div>

        {/* 纸张样式预览 */}
        <div style={{
          marginTop: '60px',
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '30px', color: '#1f2937' }}>
            📄 所有纸张样式预览
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            {paperStyles.map(style => (
              <div key={style}>
                <h4 style={{
                  textAlign: 'center',
                  marginBottom: '10px',
                  color: '#374151',
                }}>
                  {style === 'blank' && '空白'}
                  {style === 'lined' && '横线'}
                  {style === 'grid' && '方格'}
                  {style === 'dotted' && '点阵'}
                  {style === 'vintage' && '复古'}
                </h4>
                <div style={{
                  width: '100%',
                  height: '300px',
                  position: 'relative',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onClick={() => setSelectedPaperStyle(style)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                >
                  <PaperBackground paperStyle={style} />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '14px',
                  }}>
                    点击选择此样式
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 说明文字 */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          color: 'white',
          fontSize: '14px',
          opacity: 0.9,
        }}>
          <p>💡 提示：使用上方的控制面板调整纸张样式、字体和排版设置</p>
          <p>🎯 这些组件将用于构建完整的纸质风格日记本阅读体验</p>
        </div>
      </div>
    </div>
  );
}
