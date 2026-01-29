/**
 * 数据映射工具函数
 * 
 * 用于在数据库行格式和应用层对象格式之间进行转换
 */

import type { 
  Notebook, 
  NotebookRow, 
  DiaryEntry, 
  DiaryEntryRow,
  MigrationResult,
  MigrationStatus,
} from '../types/notebook';

/**
 * 将数据库行转换为 Notebook 对象
 */
export function notebookRowToNotebook(row: NotebookRow): Notebook {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    coverColor: row.cover_color,
    coverImage: row.cover_image,
    description: row.description,
    paperStyle: row.paper_style,
    fontFamily: row.font_family,
    fontSize: row.font_size,
    lineHeight: row.line_height,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    archived: row.archived,
  };
}

/**
 * 将 Notebook 对象转换为数据库行格式
 */
export function notebookToNotebookRow(notebook: Notebook): NotebookRow {
  return {
    id: notebook.id,
    user_id: notebook.userId,
    name: notebook.name,
    cover_color: notebook.coverColor,
    cover_image: notebook.coverImage,
    description: notebook.description,
    paper_style: notebook.paperStyle,
    font_family: notebook.fontFamily,
    font_size: notebook.fontSize,
    line_height: notebook.lineHeight,
    created_at: notebook.createdAt.toISOString(),
    updated_at: notebook.updatedAt.toISOString(),
    archived: notebook.archived,
  };
}

/**
 * 将数据库行转换为 DiaryEntry 对象
 */
export function diaryEntryRowToDiaryEntry(row: DiaryEntryRow): DiaryEntry {
  return {
    id: row.id,
    userId: row.user_id,
    notebookId: row.notebook_id,
    title: row.title,
    content: row.content,
    date: new Date(row.date),
    paperStyle: row.paper_style,
    bookmarked: row.bookmarked,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * 将 DiaryEntry 对象转换为数据库行格式
 */
export function diaryEntryToDiaryEntryRow(entry: DiaryEntry): DiaryEntryRow {
  return {
    id: entry.id,
    user_id: entry.userId,
    notebook_id: entry.notebookId,
    title: entry.title,
    content: entry.content,
    date: entry.date.toISOString(),
    paper_style: entry.paperStyle,
    bookmarked: entry.bookmarked,
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString(),
  };
}

/**
 * 将迁移函数的数据库结果转换为 MigrationResult 对象
 */
export function mapMigrationResult(dbResult: {
  default_notebook_id: string;
  migrated_entries_count: number;
}): MigrationResult {
  return {
    defaultNotebookId: dbResult.default_notebook_id,
    migratedEntriesCount: dbResult.migrated_entries_count,
  };
}

/**
 * 将迁移状态检查的数据库结果转换为 MigrationStatus 对象
 */
export function mapMigrationStatus(dbResult: {
  needs_migration: boolean;
  unmigrated_entries_count: number;
}): MigrationStatus {
  return {
    needsMigration: dbResult.needs_migration,
    unmigratedEntriesCount: dbResult.unmigrated_entries_count,
  };
}

/**
 * 验证日记本名称
 */
export function validateNotebookName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: '日记本名称是必需的' };
  }
  if (name.length > 100) {
    return { valid: false, error: '日记本名称不能超过 100 个字符' };
  }
  return { valid: true };
}

/**
 * 验证字体大小
 */
export function validateFontSize(size: number): { valid: boolean; error?: string } {
  if (size < 12 || size > 24) {
    return { valid: false, error: '字体大小必须在 12 到 24 之间' };
  }
  return { valid: true };
}

/**
 * 验证行高
 */
export function validateLineHeight(height: number): { valid: boolean; error?: string } {
  if (height < 1.2 || height > 2.0) {
    return { valid: false, error: '行高必须在 1.2 到 2.0 之间' };
  }
  return { valid: true };
}

/**
 * 验证纸张样式
 */
export function validatePaperStyle(style: string): { valid: boolean; error?: string } {
  const validStyles = ['blank', 'lined', 'grid', 'dotted', 'vintage'];
  if (!validStyles.includes(style)) {
    return { 
      valid: false, 
      error: `无效的纸张样式。必须是以下之一：${validStyles.join(', ')}` 
    };
  }
  return { valid: true };
}

/**
 * 创建默认日记本配置
 */
export function createDefaultNotebookConfig(userId: string): Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    userId,
    name: 'My Diary',
    description: 'My personal diary',
    paperStyle: 'blank',
    fontFamily: 'system',
    fontSize: 16,
    lineHeight: 1.5,
    archived: false,
  };
}
