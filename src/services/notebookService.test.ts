/**
 * Unit tests for NotebookService
 * NotebookService 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotebookService } from './notebookService';
import type { CreateNotebookInput, UpdateNotebookInput } from '../types/notebook';

// Mock Supabase client
vi.mock('../utils/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('NotebookService', () => {
  let service: NotebookService;
  const mockUserId = 'test-user-id';
  const mockNotebookId = 'test-notebook-id';

  beforeEach(() => {
    service = new NotebookService();
    vi.clearAllMocks();
  });

  describe('createNotebook', () => {
    it('should create a notebook with valid input', async () => {
      const input: CreateNotebookInput = {
        userId: mockUserId,
        name: 'My Diary',
        paperStyle: 'lined',
        fontFamily: 'system',
        fontSize: 16,
        lineHeight: 1.5,
        archived: false,
      };

      const mockRow = {
        id: mockNotebookId,
        user_id: mockUserId,
        name: 'My Diary',
        cover_color: null,
        cover_image: null,
        description: null,
        paper_style: 'lined',
        font_family: 'system',
        font_size: 16,
        line_height: 1.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived: false,
      };

      const { supabase } = await import('../utils/supabase');
      const mockSingle = vi.fn().mockResolvedValue({ data: mockRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      
      (supabase as any).from = mockFrom;
      (supabase as any).auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } });

      const result = await service.createNotebook(input);

      expect(result).toBeDefined();
      expect(result.name).toBe('My Diary');
      expect(result.userId).toBe(mockUserId);
      expect(result.paperStyle).toBe('lined');
    });

    it('should throw error when name is empty', async () => {
      const input: CreateNotebookInput = {
        userId: mockUserId,
        name: '',
        paperStyle: 'blank',
        fontFamily: 'system',
        fontSize: 16,
        lineHeight: 1.5,
        archived: false,
      };

      const { supabase } = await import('../utils/supabase');
      (supabase as any).auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } });

      await expect(service.createNotebook(input)).rejects.toThrow('Notebook name is required');
    });

    it('should throw error when font size is out of range', async () => {
      const input: CreateNotebookInput = {
        userId: mockUserId,
        name: 'Test Notebook',
        paperStyle: 'blank',
        fontFamily: 'system',
        fontSize: 30, // Invalid: > 24
        lineHeight: 1.5,
        archived: false,
      };

      const { supabase } = await import('../utils/supabase');
      (supabase as any).auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } });

      await expect(service.createNotebook(input)).rejects.toThrow('Font size must be between 12 and 24');
    });

    it('should throw error when line height is out of range', async () => {
      const input: CreateNotebookInput = {
        userId: mockUserId,
        name: 'Test Notebook',
        paperStyle: 'blank',
        fontFamily: 'system',
        fontSize: 16,
        lineHeight: 2.5, // Invalid: > 2.0
        archived: false,
      };

      const { supabase } = await import('../utils/supabase');
      (supabase as any).auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } });

      await expect(service.createNotebook(input)).rejects.toThrow('Line height must be between 1.2 and 2.0');
    });
  });

  describe('updateNotebook', () => {
    it('should update notebook with valid input', async () => {
      const updates: UpdateNotebookInput = {
        name: 'Updated Diary',
        coverColor: '#ff0000',
      };

      const mockRow = {
        id: mockNotebookId,
        user_id: mockUserId,
        name: 'Updated Diary',
        cover_color: '#ff0000',
        cover_image: null,
        description: null,
        paper_style: 'lined',
        font_family: 'system',
        font_size: 16,
        line_height: 1.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived: false,
      };

      const { supabase } = await import('../utils/supabase');
      const mockSingle = vi.fn().mockResolvedValue({ data: mockRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq2 = vi.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });
      const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
      
      (supabase as any).from = mockFrom;
      (supabase as any).auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } });

      const result = await service.updateNotebook(mockNotebookId, updates);

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Diary');
      expect(result.coverColor).toBe('#ff0000');
    });

    it('should throw error when updating name to empty string', async () => {
      const updates: UpdateNotebookInput = {
        name: '',
      };

      const { supabase } = await import('../utils/supabase');
      (supabase as any).auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } });

      await expect(service.updateNotebook(mockNotebookId, updates)).rejects.toThrow('Notebook name cannot be empty');
    });
  });

  describe('getNotebooks', () => {
    it('should return list of notebooks', async () => {
      const mockRows = [
        {
          id: 'notebook-1',
          user_id: mockUserId,
          name: 'Notebook 1',
          cover_color: null,
          cover_image: null,
          description: null,
          paper_style: 'lined',
          font_family: 'system',
          font_size: 16,
          line_height: 1.5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived: false,
        },
        {
          id: 'notebook-2',
          user_id: mockUserId,
          name: 'Notebook 2',
          cover_color: '#ff0000',
          cover_image: null,
          description: 'Test description',
          paper_style: 'blank',
          font_family: 'serif',
          font_size: 18,
          line_height: 1.8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived: false,
        },
      ];

      const { supabase } = await import('../utils/supabase');
      const mockOrder = vi.fn().mockResolvedValue({ data: mockRows, error: null });
      const mockEq2 = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase as any).from = mockFrom;

      const result = await service.getNotebooks(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Notebook 1');
      expect(result[1].name).toBe('Notebook 2');
    });

    it('should return empty array when no notebooks exist', async () => {
      const { supabase } = await import('../utils/supabase');
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq2 = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase as any).from = mockFrom;

      const result = await service.getNotebooks(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getNotebook', () => {
    it('should return a single notebook', async () => {
      const mockRow = {
        id: mockNotebookId,
        user_id: mockUserId,
        name: 'My Notebook',
        cover_color: null,
        cover_image: null,
        description: null,
        paper_style: 'lined',
        font_family: 'system',
        font_size: 16,
        line_height: 1.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived: false,
      };

      const { supabase } = await import('../utils/supabase');
      const mockSingle = vi.fn().mockResolvedValue({ data: mockRow, error: null });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase as any).from = mockFrom;
      (supabase as any).auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } });

      const result = await service.getNotebook(mockNotebookId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockNotebookId);
      expect(result.name).toBe('My Notebook');
    });
  });

  describe('deleteNotebook', () => {
    it('should delete a notebook', async () => {
      const { supabase } = await import('../utils/supabase');
      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
      const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });
      
      (supabase as any).from = mockFrom;
      (supabase as any).auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } });

      await expect(service.deleteNotebook(mockNotebookId)).resolves.not.toThrow();
    });
  });

  describe('archiveNotebook', () => {
    it('should archive a notebook', async () => {
      const { supabase } = await import('../utils/supabase');
      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });
      const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
      
      (supabase as any).from = mockFrom;
      (supabase as any).auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } });

      await expect(service.archiveNotebook(mockNotebookId)).resolves.not.toThrow();
    });
  });

  describe('data conversion', () => {
    it('should correctly convert snake_case to camelCase', async () => {
      const mockRow = {
        id: mockNotebookId,
        user_id: mockUserId,
        name: 'Test',
        cover_color: '#ff0000',
        cover_image: 'http://example.com/image.jpg',
        description: 'Test description',
        paper_style: 'vintage',
        font_family: 'serif',
        font_size: 18,
        line_height: 1.8,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        archived: false,
      };

      const { supabase } = await import('../utils/supabase');
      const mockSingle = vi.fn().mockResolvedValue({ data: mockRow, error: null });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase as any).from = mockFrom;
      (supabase as any).auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } });

      const result = await service.getNotebook(mockNotebookId);

      expect(result.userId).toBe(mockUserId);
      expect(result.coverColor).toBe('#ff0000');
      expect(result.coverImage).toBe('http://example.com/image.jpg');
      expect(result.paperStyle).toBe('vintage');
      expect(result.fontFamily).toBe('serif');
      expect(result.fontSize).toBe(18);
      expect(result.lineHeight).toBe(1.8);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });
});
