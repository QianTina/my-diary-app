// ============================================
// Migration Service
// 迁移服务
// ============================================
// This service handles data migration for the paper diary notebook feature
// 此服务处理纸质日记本功能的数据迁移
//
// Usage Example:
// 使用示例：
//
// import { migrationService } from './services/migrationService';
//
// // Check if user needs migration
// // 检查用户是否需要迁移
// const status = await migrationService.checkMigrationStatus(userId);
// if (status.needsMigration) {
//   // Create default notebook
//   // 创建默认日记本
//   const notebook = await migrationService.createDefaultNotebook(userId);
//   
//   // Migrate existing entries
//   // 迁移现有条目
//   const result = await migrationService.migrateExistingEntries(userId, notebook.id);
//   console.log(`Migrated ${result.migratedEntriesCount} entries`);
// }
//
// Note: The migration uses database RPC functions for atomic operations
// 注意：迁移使用数据库 RPC 函数进行原子操作

import { supabase } from '../utils/supabase';
import type {
  Notebook,
  NotebookRow,
  MigrationResult,
  MigrationStatus,
} from '../types/notebook';
import type { MigrationService as IMigrationService } from '../types/notebook-services';

// ============================================
// Helper Functions
// 辅助函数
// ============================================

/**
 * Convert database row (snake_case) to application object (camelCase)
 * 将数据库行（snake_case）转换为应用对象（camelCase）
 */
function rowToNotebook(row: NotebookRow): Notebook {
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

// ============================================
// Migration Service Class
// 迁移服务类
// ============================================

export class MigrationService implements IMigrationService {
  /**
   * Handle Supabase errors
   * 处理 Supabase 错误
   */
  private handleError(error: unknown, operation: string): never {
    console.error(`MigrationService ${operation} error:`, error);
    
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(`${operation} failed: ${String(error.message)}`);
    }
    
    throw new Error(`${operation} failed: Unknown error`);
  }

  /**
   * Create a default notebook for the user
   * 为用户创建默认日记本
   * 
   * This method creates a "My Diary" notebook with default settings.
   * If a default notebook already exists, it returns the existing one.
   * 
   * @param userId - User ID
   * @returns The created or existing default notebook
   */
  async createDefaultNotebook(userId: string): Promise<Notebook> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      if (!userId || userId.trim().length === 0) {
        throw new Error('User ID is required');
      }

      // Check if default notebook already exists
      const { data: existingNotebooks, error: checkError } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', userId)
        .eq('name', 'My Diary')
        .limit(1);

      if (checkError) {
        this.handleError(checkError, 'createDefaultNotebook (check existing)');
      }

      // If default notebook exists, return it
      if (existingNotebooks && existingNotebooks.length > 0) {
        return rowToNotebook(existingNotebooks[0]);
      }

      // Create new default notebook
      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          user_id: userId,
          name: 'My Diary',
          description: 'My personal diary',
          paper_style: 'blank',
          font_family: 'system',
          font_size: 16,
          line_height: 1.5,
          archived: false,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'createDefaultNotebook (insert)');
      }

      if (!data) {
        throw new Error('Failed to create default notebook');
      }

      return rowToNotebook(data);
    } catch (error) {
      this.handleError(error, 'createDefaultNotebook');
    }
  }

  /**
   * Migrate existing entries to the default notebook
   * 迁移现有条目到默认日记本
   * 
   * This method uses the database RPC function to perform atomic migration
   * of all entries without a notebook_id to the specified default notebook.
   * The migration is performed in a transaction to ensure data consistency.
   * 
   * @param userId - User ID
   * @param defaultNotebookId - Default notebook ID
   * @returns Migration result with notebook ID and count of migrated entries
   */
  async migrateExistingEntries(
    userId: string,
    defaultNotebookId: string
  ): Promise<MigrationResult> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      if (!userId || userId.trim().length === 0) {
        throw new Error('User ID is required');
      }

      if (!defaultNotebookId || defaultNotebookId.trim().length === 0) {
        throw new Error('Default notebook ID is required');
      }

      // Verify the notebook exists and belongs to the user
      const { data: notebook, error: notebookError } = await supabase
        .from('notebooks')
        .select('id')
        .eq('id', defaultNotebookId)
        .eq('user_id', userId)
        .single();

      if (notebookError || !notebook) {
        throw new Error('Default notebook not found or does not belong to user');
      }

      // Call the database RPC function to perform migration
      // This function handles the migration atomically in a transaction
      const { data, error } = await supabase
        .rpc('migrate_user_to_notebooks', {
          target_user_id: userId,
        });

      if (error) {
        this.handleError(error, 'migrateExistingEntries (RPC)');
      }

      if (!data || data.length === 0) {
        throw new Error('Migration RPC function returned no data');
      }

      // The RPC function returns an array with one row
      const result = data[0];

      return {
        defaultNotebookId: result.default_notebook_id,
        migratedEntriesCount: result.migrated_entries_count,
      };
    } catch (error) {
      this.handleError(error, 'migrateExistingEntries');
    }
  }

  /**
   * Check the migration status for a user
   * 检查用户的迁移状态
   * 
   * This method checks if the user has any entries that need migration
   * (entries without a notebook_id).
   * 
   * @param userId - User ID
   * @returns Migration status indicating if migration is needed and count of unmigrated entries
   */
  async checkMigrationStatus(userId: string): Promise<MigrationStatus> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      if (!userId || userId.trim().length === 0) {
        throw new Error('User ID is required');
      }

      // Call the database RPC function to check migration status
      const { data, error } = await supabase
        .rpc('check_migration_status', {
          target_user_id: userId,
        });

      if (error) {
        this.handleError(error, 'checkMigrationStatus (RPC)');
      }

      if (!data || data.length === 0) {
        // If no data returned, assume no migration needed
        return {
          needsMigration: false,
          unmigratedEntriesCount: 0,
        };
      }

      // The RPC function returns an array with one row
      const result = data[0];

      return {
        needsMigration: result.needs_migration,
        unmigratedEntriesCount: result.unmigrated_entries_count,
      };
    } catch (error) {
      this.handleError(error, 'checkMigrationStatus');
    }
  }
}

// Export singleton instance
export const migrationService = new MigrationService();
