// ============================================
// Entry Service
// 日记条目服务
// ============================================
// This service handles all diary entry-related operations with Supabase
// 此服务处理所有与 Supabase 相关的日记条目操作

import { supabase } from '../utils/supabase';
import type {
  DiaryEntry,
  DiaryEntryRow,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
  SearchResult,
} from '../types/notebook';
import type { EntryService as IEntryService } from '../types/notebook-services';

// ============================================
// Helper Functions
// 辅助函数
// ============================================

/**
 * Convert database row (snake_case) to application object (camelCase)
 * 将数据库行（snake_case）转换为应用对象（camelCase）
 */
function rowToEntry(row: any): DiaryEntry {
  return {
    id: row.id,
    userId: row.user_id,
    notebookId: row.notebook_id,
    title: row.title || '',
    content: row.content,
    // Use created_at as the date field
    date: new Date(row.created_at),
    paperStyle: row.paper_style,
    bookmarked: row.bookmarked || false,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Convert application object (camelCase) to database row (snake_case)
 * 将应用对象（camelCase）转换为数据库行（snake_case）
 */
function entryToRow(entry: Partial<DiaryEntry>): any {
  const row: any = {};
  
  if (entry.userId !== undefined) row.user_id = entry.userId;
  if (entry.notebookId !== undefined) row.notebook_id = entry.notebookId;
  if (entry.title !== undefined) row.title = entry.title;
  if (entry.content !== undefined) row.content = entry.content;
  // Map date to created_at for database
  if (entry.date !== undefined) row.created_at = entry.date.toISOString();
  if (entry.paperStyle !== undefined) row.paper_style = entry.paperStyle;
  if (entry.bookmarked !== undefined) row.bookmarked = entry.bookmarked;
  
  return row;
}

// ============================================
// Entry Service Class
// 日记条目服务类
// ============================================

export class EntryService implements IEntryService {
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
    console.error(`EntryService ${operation} error:`, error);
    
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(`${operation} failed: ${String(error.message)}`);
    }
    
    throw new Error(`${operation} failed: Unknown error`);
  }

  /**
   * Get all entries for a specific notebook
   * 获取特定日记本的所有条目
   */
  async getEntriesForNotebook(notebookId: string): Promise<DiaryEntry[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('notebook_id', notebookId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'getEntriesForNotebook');
      }

      if (!data) {
        return [];
      }

      return data.map(rowToEntry);
    } catch (error) {
      this.handleError(error, 'getEntriesForNotebook');
    }
  }

  /**
   * Get a single entry by ID
   * 根据 ID 获取单个条目
   */
  async getEntry(id: string): Promise<DiaryEntry> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        this.handleError(error, 'getEntry');
      }

      if (!data) {
        throw new Error('Entry not found');
      }

      return rowToEntry(data);
    } catch (error) {
      this.handleError(error, 'getEntry');
    }
  }

  /**
   * Create a new entry
   * 创建新条目
   */
  async createEntry(entry: CreateDiaryEntryInput): Promise<DiaryEntry> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Validate required fields
      if (!entry.title || entry.title.trim().length === 0) {
        throw new Error('Entry title is required');
      }

      if (!entry.content || entry.content.trim().length === 0) {
        throw new Error('Entry content is required');
      }

      if (!entry.notebookId) {
        throw new Error('Notebook ID is required');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Verify notebook exists and belongs to user
      const { data: notebookData, error: notebookError } = await supabase
        .from('notebooks')
        .select('id')
        .eq('id', entry.notebookId)
        .eq('user_id', userId)
        .single();

      if (notebookError || !notebookData) {
        throw new Error('Notebook not found');
      }

      // Convert to database format
      const row = entryToRow({
        ...entry,
        userId,
      });

      const { data, error } = await supabase
        .from('diaries')
        .insert(row)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'createEntry');
      }

      if (!data) {
        throw new Error('Failed to create entry');
      }

      return rowToEntry(data);
    } catch (error) {
      this.handleError(error, 'createEntry');
    }
  }

  /**
   * Update an existing entry
   * 更新现有条目
   */
  async updateEntry(id: string, updates: UpdateDiaryEntryInput): Promise<DiaryEntry> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Validate title if provided
      if (updates.title !== undefined && updates.title.trim().length === 0) {
        throw new Error('Entry title cannot be empty');
      }

      // Validate content if provided
      if (updates.content !== undefined && updates.content.trim().length === 0) {
        throw new Error('Entry content cannot be empty');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Convert to database format
      const row = entryToRow(updates);

      const { data, error } = await supabase
        .from('diaries')
        .update(row)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'updateEntry');
      }

      if (!data) {
        throw new Error('Entry not found');
      }

      return rowToEntry(data);
    } catch (error) {
      this.handleError(error, 'updateEntry');
    }
  }

  /**
   * Delete an entry
   * 删除条目
   */
  async deleteEntry(id: string): Promise<void> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('diaries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        this.handleError(error, 'deleteEntry');
      }
    } catch (error) {
      this.handleError(error, 'deleteEntry');
    }
  }

  /**
   * Search entries with full-text search
   * 使用全文搜索搜索条目
   */
  async searchEntries(userId: string, query: string, notebookId?: string): Promise<SearchResult[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      if (!query || query.trim().length === 0) {
        return [];
      }

      // Truncate query if too long
      const sanitizedQuery = query.trim().substring(0, 500);

      // Build the query
      let dbQuery = supabase
        .from('diaries')
        .select('id, notebook_id, title, content, created_at')
        .eq('user_id', userId);

      // Add notebook filter if provided
      if (notebookId) {
        dbQuery = dbQuery.eq('notebook_id', notebookId);
      }

      // Use full-text search on title and content
      // PostgreSQL full-text search using to_tsvector
      dbQuery = dbQuery.or(`title.ilike.%${sanitizedQuery}%,content.ilike.%${sanitizedQuery}%`);

      // Order by created_at descending
      dbQuery = dbQuery.order('created_at', { ascending: false });

      const { data, error } = await dbQuery;

      if (error) {
        this.handleError(error, 'searchEntries');
      }

      if (!data) {
        return [];
      }

      // Convert to SearchResult format with snippets
      return data.map((row) => {
        // Create snippet from content (first 150 characters with match context)
        const content = row.content || '';
        const title = row.title || '';
        const lowerQuery = sanitizedQuery.toLowerCase();
        
        let snippet = '';
        
        // Try to find match in content
        const contentLower = content.toLowerCase();
        const matchIndex = contentLower.indexOf(lowerQuery);
        
        if (matchIndex !== -1) {
          // Extract context around match
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(content.length, matchIndex + lowerQuery.length + 100);
          snippet = (start > 0 ? '...' : '') + 
                   content.substring(start, end) + 
                   (end < content.length ? '...' : '');
        } else {
          // No match in content, use beginning
          snippet = content.substring(0, 150) + (content.length > 150 ? '...' : '');
        }

        return {
          id: row.id,
          notebookId: row.notebook_id,
          title: title,
          date: new Date(row.created_at),
          snippet: snippet,
        };
      });
    } catch (error) {
      this.handleError(error, 'searchEntries');
    }
  }
}

// Export singleton instance
export const entryService = new EntryService();
