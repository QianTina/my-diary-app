/**
 * 数据映射工具函数的单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  notebookRowToNotebook,
  notebookToNotebookRow,
  diaryEntryRowToDiaryEntry,
  diaryEntryToDiaryEntryRow,
  mapMigrationResult,
  mapMigrationStatus,
  validateNotebookName,
  validateFontSize,
  validateLineHeight,
  validatePaperStyle,
  createDefaultNotebookConfig,
} from './notebookMappers';
import type { NotebookRow, DiaryEntryRow } from '../types/notebook';

describe('notebookMappers', () => {
  describe('notebookRowToNotebook', () => {
    it('should convert database row to Notebook object', () => {
      const row: NotebookRow = {
        id: '123',
        user_id: 'user-456',
        name: 'Test Notebook',
        cover_color: '#ff0000',
        cover_image: 'https://example.com/image.jpg',
        description: 'Test description',
        paper_style: 'lined',
        font_family: 'serif',
        font_size: 16,
        line_height: 1.5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        archived: false,
      };

      const notebook = notebookRowToNotebook(row);

      expect(notebook.id).toBe('123');
      expect(notebook.userId).toBe('user-456');
      expect(notebook.name).toBe('Test Notebook');
      expect(notebook.coverColor).toBe('#ff0000');
      expect(notebook.coverImage).toBe('https://example.com/image.jpg');
      expect(notebook.description).toBe('Test description');
      expect(notebook.paperStyle).toBe('lined');
      expect(notebook.fontFamily).toBe('serif');
      expect(notebook.fontSize).toBe(16);
      expect(notebook.lineHeight).toBe(1.5);
      expect(notebook.createdAt).toBeInstanceOf(Date);
      expect(notebook.updatedAt).toBeInstanceOf(Date);
      expect(notebook.archived).toBe(false);
    });

    it('should handle optional fields', () => {
      const row: NotebookRow = {
        id: '123',
        user_id: 'user-456',
        name: 'Test Notebook',
        paper_style: 'blank',
        font_family: 'system',
        font_size: 16,
        line_height: 1.5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        archived: false,
      };

      const notebook = notebookRowToNotebook(row);

      expect(notebook.coverColor).toBeUndefined();
      expect(notebook.coverImage).toBeUndefined();
      expect(notebook.description).toBeUndefined();
    });
  });

  describe('notebookToNotebookRow', () => {
    it('should convert Notebook object to database row', () => {
      const notebook = {
        id: '123',
        userId: 'user-456',
        name: 'Test Notebook',
        coverColor: '#ff0000',
        coverImage: 'https://example.com/image.jpg',
        description: 'Test description',
        paperStyle: 'lined' as const,
        fontFamily: 'serif',
        fontSize: 16,
        lineHeight: 1.5,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        archived: false,
      };

      const row = notebookToNotebookRow(notebook);

      expect(row.id).toBe('123');
      expect(row.user_id).toBe('user-456');
      expect(row.name).toBe('Test Notebook');
      expect(row.cover_color).toBe('#ff0000');
      expect(row.cover_image).toBe('https://example.com/image.jpg');
      expect(row.description).toBe('Test description');
      expect(row.paper_style).toBe('lined');
      expect(row.font_family).toBe('serif');
      expect(row.font_size).toBe(16);
      expect(row.line_height).toBe(1.5);
      expect(row.created_at).toBe('2024-01-01T00:00:00.000Z');
      expect(row.updated_at).toBe('2024-01-02T00:00:00.000Z');
      expect(row.archived).toBe(false);
    });
  });

  describe('diaryEntryRowToDiaryEntry', () => {
    it('should convert database row to DiaryEntry object', () => {
      const row: DiaryEntryRow = {
        id: '789',
        user_id: 'user-456',
        notebook_id: '123',
        title: 'Test Entry',
        content: 'Test content',
        date: '2024-01-01T00:00:00Z',
        paper_style: 'grid',
        bookmarked: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const entry = diaryEntryRowToDiaryEntry(row);

      expect(entry.id).toBe('789');
      expect(entry.userId).toBe('user-456');
      expect(entry.notebookId).toBe('123');
      expect(entry.title).toBe('Test Entry');
      expect(entry.content).toBe('Test content');
      expect(entry.date).toBeInstanceOf(Date);
      expect(entry.paperStyle).toBe('grid');
      expect(entry.bookmarked).toBe(true);
      expect(entry.createdAt).toBeInstanceOf(Date);
      expect(entry.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle optional paper_style', () => {
      const row: DiaryEntryRow = {
        id: '789',
        user_id: 'user-456',
        notebook_id: '123',
        title: 'Test Entry',
        content: 'Test content',
        date: '2024-01-01T00:00:00Z',
        bookmarked: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const entry = diaryEntryRowToDiaryEntry(row);

      expect(entry.paperStyle).toBeUndefined();
    });
  });

  describe('diaryEntryToDiaryEntryRow', () => {
    it('should convert DiaryEntry object to database row', () => {
      const entry = {
        id: '789',
        userId: 'user-456',
        notebookId: '123',
        title: 'Test Entry',
        content: 'Test content',
        date: new Date('2024-01-01T00:00:00Z'),
        paperStyle: 'grid' as const,
        bookmarked: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      const row = diaryEntryToDiaryEntryRow(entry);

      expect(row.id).toBe('789');
      expect(row.user_id).toBe('user-456');
      expect(row.notebook_id).toBe('123');
      expect(row.title).toBe('Test Entry');
      expect(row.content).toBe('Test content');
      expect(row.date).toBe('2024-01-01T00:00:00.000Z');
      expect(row.paper_style).toBe('grid');
      expect(row.bookmarked).toBe(true);
      expect(row.created_at).toBe('2024-01-01T00:00:00.000Z');
      expect(row.updated_at).toBe('2024-01-02T00:00:00.000Z');
    });
  });

  describe('mapMigrationResult', () => {
    it('should map database migration result to MigrationResult', () => {
      const dbResult = {
        default_notebook_id: 'notebook-123',
        migrated_entries_count: 42,
      };

      const result = mapMigrationResult(dbResult);

      expect(result.defaultNotebookId).toBe('notebook-123');
      expect(result.migratedEntriesCount).toBe(42);
    });
  });

  describe('mapMigrationStatus', () => {
    it('should map database migration status to MigrationStatus', () => {
      const dbResult = {
        needs_migration: true,
        unmigrated_entries_count: 10,
      };

      const status = mapMigrationStatus(dbResult);

      expect(status.needsMigration).toBe(true);
      expect(status.unmigratedEntriesCount).toBe(10);
    });
  });

  describe('validateNotebookName', () => {
    it('should accept valid notebook names', () => {
      const result = validateNotebookName('My Diary');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty names', () => {
      const result = validateNotebookName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('日记本名称是必需的');
    });

    it('should reject whitespace-only names', () => {
      const result = validateNotebookName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('日记本名称是必需的');
    });

    it('should reject names longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      const result = validateNotebookName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('日记本名称不能超过 100 个字符');
    });
  });

  describe('validateFontSize', () => {
    it('should accept valid font sizes', () => {
      expect(validateFontSize(12).valid).toBe(true);
      expect(validateFontSize(16).valid).toBe(true);
      expect(validateFontSize(24).valid).toBe(true);
    });

    it('should reject font sizes below minimum', () => {
      const result = validateFontSize(11);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('字体大小必须在 12 到 24 之间');
    });

    it('should reject font sizes above maximum', () => {
      const result = validateFontSize(25);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('字体大小必须在 12 到 24 之间');
    });
  });

  describe('validateLineHeight', () => {
    it('should accept valid line heights', () => {
      expect(validateLineHeight(1.2).valid).toBe(true);
      expect(validateLineHeight(1.5).valid).toBe(true);
      expect(validateLineHeight(2.0).valid).toBe(true);
    });

    it('should reject line heights below minimum', () => {
      const result = validateLineHeight(1.1);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('行高必须在 1.2 到 2.0 之间');
    });

    it('should reject line heights above maximum', () => {
      const result = validateLineHeight(2.1);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('行高必须在 1.2 到 2.0 之间');
    });
  });

  describe('validatePaperStyle', () => {
    it('should accept valid paper styles', () => {
      expect(validatePaperStyle('blank').valid).toBe(true);
      expect(validatePaperStyle('lined').valid).toBe(true);
      expect(validatePaperStyle('grid').valid).toBe(true);
      expect(validatePaperStyle('dotted').valid).toBe(true);
      expect(validatePaperStyle('vintage').valid).toBe(true);
    });

    it('should reject invalid paper styles', () => {
      const result = validatePaperStyle('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('无效的纸张样式');
    });
  });

  describe('createDefaultNotebookConfig', () => {
    it('should create default notebook configuration', () => {
      const userId = 'user-123';
      const config = createDefaultNotebookConfig(userId);

      expect(config.userId).toBe(userId);
      expect(config.name).toBe('My Diary');
      expect(config.description).toBe('My personal diary');
      expect(config.paperStyle).toBe('blank');
      expect(config.fontFamily).toBe('system');
      expect(config.fontSize).toBe(16);
      expect(config.lineHeight).toBe(1.5);
      expect(config.archived).toBe(false);
    });
  });
});
