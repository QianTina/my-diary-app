// ============================================
// Notebook Service
// 日记本服务
// ============================================
// This service handles all notebook-related operations with Supabase
// 此服务处理所有与 Supabase 相关的日记本操作

import { supabase } from '../utils/supabase';
import type {
  Notebook,
  NotebookRow,
  CreateNotebookInput,
  UpdateNotebookInput,
} from '../types/notebook';
import type { NotebookService as INotebookService } from '../types/notebook-services';

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

/**
 * Convert application object (camelCase) to database row (snake_case)
 * 将应用对象（camelCase）转换为数据库行（snake_case）
 */
function notebookToRow(notebook: Partial<Notebook>): Partial<NotebookRow> {
  const row: Partial<NotebookRow> = {};
  
  if (notebook.userId !== undefined) row.user_id = notebook.userId;
  if (notebook.name !== undefined) row.name = notebook.name;
  if (notebook.coverColor !== undefined) row.cover_color = notebook.coverColor;
  if (notebook.coverImage !== undefined) row.cover_image = notebook.coverImage;
  if (notebook.description !== undefined) row.description = notebook.description;
  if (notebook.paperStyle !== undefined) row.paper_style = notebook.paperStyle;
  if (notebook.fontFamily !== undefined) row.font_family = notebook.fontFamily;
  if (notebook.fontSize !== undefined) row.font_size = notebook.fontSize;
  if (notebook.lineHeight !== undefined) row.line_height = notebook.lineHeight;
  if (notebook.archived !== undefined) row.archived = notebook.archived;
  
  return row;
}

// ============================================
// Notebook Service Class
// 日记本服务类
// ============================================

export class NotebookService implements INotebookService {
  /**
   * Get current authenticated user ID
   * 获取当前认证用户 ID
   */
  private async getCurrentUserId(): Promise<string | null> {
    if (!supabase) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Handle Supabase errors
   * 处理 Supabase 错误
   */
  private handleError(error: unknown, operation: string): never {
    console.error(`NotebookService ${operation} error:`, error);
    
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(`${operation} failed: ${String(error.message)}`);
    }
    
    throw new Error(`${operation} failed: Unknown error`);
  }

  /**
   * Get all notebooks for the current user
   * 获取当前用户的所有日记本
   */
  async getNotebooks(userId: string): Promise<Notebook[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', userId)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'getNotebooks');
      }

      if (!data) {
        return [];
      }

      return data.map(rowToNotebook);
    } catch (error) {
      this.handleError(error, 'getNotebooks');
    }
  }

  /**
   * Get a single notebook by ID
   * 根据 ID 获取单个日记本
   */
  async getNotebook(id: string): Promise<Notebook> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        this.handleError(error, 'getNotebook');
      }

      if (!data) {
        throw new Error('Notebook not found');
      }

      return rowToNotebook(data);
    } catch (error) {
      this.handleError(error, 'getNotebook');
    }
  }

  /**
   * Create a new notebook
   * 创建新日记本
   */
  async createNotebook(notebook: CreateNotebookInput): Promise<Notebook> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Validate required fields
      if (!notebook.name || notebook.name.trim().length === 0) {
        throw new Error('Notebook name is required');
      }

      // Validate font size range (12-24)
      if (notebook.fontSize < 12 || notebook.fontSize > 24) {
        throw new Error('Font size must be between 12 and 24');
      }

      // Validate line height range (1.2-2.0)
      if (notebook.lineHeight < 1.2 || notebook.lineHeight > 2.0) {
        throw new Error('Line height must be between 1.2 and 2.0');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Convert to database format
      const row = notebookToRow({
        ...notebook,
        userId,
      });

      const { data, error } = await supabase
        .from('notebooks')
        .insert(row)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'createNotebook');
      }

      if (!data) {
        throw new Error('Failed to create notebook');
      }

      return rowToNotebook(data);
    } catch (error) {
      this.handleError(error, 'createNotebook');
    }
  }

  /**
   * Update an existing notebook
   * 更新现有日记本
   */
  async updateNotebook(id: string, updates: UpdateNotebookInput): Promise<Notebook> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Validate name if provided
      if (updates.name !== undefined && updates.name.trim().length === 0) {
        throw new Error('Notebook name cannot be empty');
      }

      // Validate font size if provided
      if (updates.fontSize !== undefined && (updates.fontSize < 12 || updates.fontSize > 24)) {
        throw new Error('Font size must be between 12 and 24');
      }

      // Validate line height if provided
      if (updates.lineHeight !== undefined && (updates.lineHeight < 1.2 || updates.lineHeight > 2.0)) {
        throw new Error('Line height must be between 1.2 and 2.0');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Convert to database format
      const row = notebookToRow(updates);

      const { data, error } = await supabase
        .from('notebooks')
        .update(row)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'updateNotebook');
      }

      if (!data) {
        throw new Error('Notebook not found');
      }

      return rowToNotebook(data);
    } catch (error) {
      this.handleError(error, 'updateNotebook');
    }
  }

  /**
   * Delete a notebook
   * 删除日记本
   */
  async deleteNotebook(id: string): Promise<void> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        this.handleError(error, 'deleteNotebook');
      }
    } catch (error) {
      this.handleError(error, 'deleteNotebook');
    }
  }

  /**
   * Archive a notebook
   * 归档日记本
   */
  async archiveNotebook(id: string): Promise<void> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('notebooks')
        .update({ archived: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        this.handleError(error, 'archiveNotebook');
      }
    } catch (error) {
      this.handleError(error, 'archiveNotebook');
    }
  }
}

// Export singleton instance
export const notebookService = new NotebookService();
