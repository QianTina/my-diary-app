/**
 * Unit tests for MigrationService
 * MigrationService 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MigrationService } from './migrationService';

// Mock Supabase client
vi.mock('../utils/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('MigrationService', () => {
  let service: MigrationService;
  const mockUserId = 'test-user-id';
  const mockNotebookId = 'test-notebook-id';

  beforeEach(() => {
    service = new MigrationService();
    vi.clearAllMocks();
  });

  describe('createDefaultNotebook', () => {
    it('should create a default notebook when none exists', async () => {
      const mockRow = {
        id: mockNotebookId,
        user_id: mockUserId,
        name: 'My Diary',
        cover_color: null,
        cover_image: null,
        description: 'My personal diary',
        paper_style: 'blank',
        font_family: 'system',
        font_size: 16,
        line_height: 1.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived: false,
      };

      const { supabase } = await import('../utils/supabase');
      
      // Mock check for existing notebook (returns empty array)
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq2 = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      
      // Mock insert new notebook
      const mockSingle = vi.fn().mockResolvedValue({ data: mockRow, error: null });
      const mockSelectInsert = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelectInsert });
      
      const mockFrom = vi.fn()
        .mockReturnValueOnce({ select: mockSelect }) // First call for check
        .mockReturnValueOnce({ insert: mockInsert }); // Second call for insert
      
      (supabase as any).from = mockFrom;

      const result = await service.createDefaultNotebook(mockUserId);

      expect(result).toBeDefined();
      expect(result.name).toBe('My Diary');
      expect(result.userId).toBe(mockUserId);
      expect(result.paperStyle).toBe('blank');
      expect(result.fontSize).toBe(16);
      expect(result.lineHeight).toBe(1.5);
    });

    it('should return existing default notebook if it already exists', async () => {
      const mockRow = {
        id: mockNotebookId,
        user_id: mockUserId,
        name: 'My Diary',
        cover_color: null,
        cover_image: null,
        description: 'My personal diary',
        paper_style: 'blank',
        font_family: 'system',
        font_size: 16,
        line_height: 1.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived: false,
      };

      const { supabase } = await import('../utils/supabase');
      
      // Mock check for existing notebook (returns existing notebook)
      const mockLimit = vi.fn().mockResolvedValue({ data: [mockRow], error: null });
      const mockEq2 = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase as any).from = mockFrom;

      const result = await service.createDefaultNotebook(mockUserId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockNotebookId);
      expect(result.name).toBe('My Diary');
    });

    it('should throw error when userId is empty', async () => {
      await expect(service.createDefaultNotebook('')).rejects.toThrow('User ID is required');
    });
  });

  describe('migrateExistingEntries', () => {
    it('should migrate entries using RPC function', async () => {
      const { supabase } = await import('../utils/supabase');
      
      // Mock notebook verification
      const mockSingle = vi.fn().mockResolvedValue({ 
        data: { id: mockNotebookId }, 
        error: null 
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase as any).from = mockFrom;
      
      // Mock RPC call
      const mockRpcData = [
        {
          default_notebook_id: mockNotebookId,
          migrated_entries_count: 5,
        },
      ];
      (supabase as any).rpc = vi.fn().mockResolvedValue({ 
        data: mockRpcData, 
        error: null 
      });

      const result = await service.migrateExistingEntries(mockUserId, mockNotebookId);

      expect(result).toBeDefined();
      expect(result.defaultNotebookId).toBe(mockNotebookId);
      expect(result.migratedEntriesCount).toBe(5);
      expect(supabase.rpc).toHaveBeenCalledWith('migrate_user_to_notebooks', {
        target_user_id: mockUserId,
      });
    });

    it('should throw error when userId is empty', async () => {
      await expect(
        service.migrateExistingEntries('', mockNotebookId)
      ).rejects.toThrow('User ID is required');
    });

    it('should throw error when defaultNotebookId is empty', async () => {
      await expect(
        service.migrateExistingEntries(mockUserId, '')
      ).rejects.toThrow('Default notebook ID is required');
    });

    it('should throw error when notebook does not exist', async () => {
      const { supabase } = await import('../utils/supabase');
      
      // Mock notebook verification (not found)
      const mockSingle = vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Not found' } 
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase as any).from = mockFrom;

      await expect(
        service.migrateExistingEntries(mockUserId, mockNotebookId)
      ).rejects.toThrow('Default notebook not found or does not belong to user');
    });
  });

  describe('checkMigrationStatus', () => {
    it('should return migration status when entries need migration', async () => {
      const { supabase } = await import('../utils/supabase');
      
      const mockRpcData = [
        {
          needs_migration: true,
          unmigrated_entries_count: 10,
        },
      ];
      (supabase as any).rpc = vi.fn().mockResolvedValue({ 
        data: mockRpcData, 
        error: null 
      });

      const result = await service.checkMigrationStatus(mockUserId);

      expect(result).toBeDefined();
      expect(result.needsMigration).toBe(true);
      expect(result.unmigratedEntriesCount).toBe(10);
      expect(supabase.rpc).toHaveBeenCalledWith('check_migration_status', {
        target_user_id: mockUserId,
      });
    });

    it('should return no migration needed when no unmigrated entries', async () => {
      const { supabase } = await import('../utils/supabase');
      
      const mockRpcData = [
        {
          needs_migration: false,
          unmigrated_entries_count: 0,
        },
      ];
      (supabase as any).rpc = vi.fn().mockResolvedValue({ 
        data: mockRpcData, 
        error: null 
      });

      const result = await service.checkMigrationStatus(mockUserId);

      expect(result).toBeDefined();
      expect(result.needsMigration).toBe(false);
      expect(result.unmigratedEntriesCount).toBe(0);
    });

    it('should return no migration needed when RPC returns empty data', async () => {
      const { supabase } = await import('../utils/supabase');
      
      (supabase as any).rpc = vi.fn().mockResolvedValue({ 
        data: [], 
        error: null 
      });

      const result = await service.checkMigrationStatus(mockUserId);

      expect(result).toBeDefined();
      expect(result.needsMigration).toBe(false);
      expect(result.unmigratedEntriesCount).toBe(0);
    });

    it('should throw error when userId is empty', async () => {
      await expect(service.checkMigrationStatus('')).rejects.toThrow('User ID is required');
    });
  });

  describe('data conversion', () => {
    it('should correctly convert snake_case to camelCase for notebook', async () => {
      const mockRow = {
        id: mockNotebookId,
        user_id: mockUserId,
        name: 'My Diary',
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
      
      // Mock check for existing notebook (returns existing notebook)
      const mockLimit = vi.fn().mockResolvedValue({ data: [mockRow], error: null });
      const mockEq2 = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase as any).from = mockFrom;

      const result = await service.createDefaultNotebook(mockUserId);

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
