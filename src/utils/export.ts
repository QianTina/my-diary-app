import type { Diary } from '../types';

/**
 * 导出日记为 JSON 文件
 */
export const exportToJSON = (diaries: Diary[]) => {
  const dataStr = JSON.stringify(diaries, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `diary-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * 导出日记为 Markdown 文件（合并为一个文件）
 */
export const exportToMarkdown = (diaries: Diary[]) => {
  const markdown = diaries
    .map((diary) => {
      const date = new Date(diary.createdAt).toLocaleString('zh-CN');
      const tags = diary.tags.length > 0 ? `\n**标签**: ${diary.tags.map(t => `#${t}`).join(' ')}` : '';
      return `## ${date}${tags}\n\n${diary.content}\n\n---\n`;
    })
    .join('\n');

  const blob = new Blob([`# 我的日记\n\n${markdown}`], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `diary-export-${new Date().toISOString().split('T')[0]}.md`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * 从 JSON 文件导入日记
 */
export const importFromJSON = (file: File): Promise<Diary[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!Array.isArray(data)) {
          throw new Error('Invalid JSON format');
        }
        // 验证数据结构
        const validDiaries = data.filter(
          (item) =>
            item.id &&
            item.content &&
            item.createdAt &&
            Array.isArray(item.tags)
        );
        resolve(validDiaries);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
