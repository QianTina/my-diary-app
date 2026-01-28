import { supabase } from '../utils/supabase';
import type { Diary, DiaryRow, Mood } from '../types';

/**
 * 搜索过滤器接口
 */
export interface SearchFilters {
  tags?: string[];
  mood?: Mood;
  startDate?: Date;
  endDate?: Date;
}

/**
 * 日期范围接口
 */
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * 搜索服务类
 * 负责处理日记搜索、过滤和搜索历史管理
 */
class SearchService {
  private historyKey = 'diary_search_history';
  private maxHistoryItems = 10;

  /**
   * 执行搜索
   * @param query 搜索查询文本
   * @param filters 搜索过滤器
   * @returns 匹配的日记条目数组
   */
  async search(query: string, filters: SearchFilters = {}): Promise<Diary[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // 构建查询
    let queryBuilder = supabase
      .from('diaries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // 标签过滤 - 使用 contains 确保包含所有选定的标签
    if (filters.tags && filters.tags.length > 0) {
      queryBuilder = queryBuilder.contains('tags', filters.tags);
    }

    // 心情过滤
    if (filters.mood) {
      queryBuilder = queryBuilder.eq('mood', filters.mood);
    }

    // 日期范围过滤
    if (filters.startDate) {
      queryBuilder = queryBuilder.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      queryBuilder = queryBuilder.lte('created_at', endOfDay.toISOString());
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    // 转换数据库行为 Diary 对象
    let results = this.convertRowsToDiaries(data || []);

    // 客户端全文搜索（因为 Supabase 的全文搜索需要额外配置）
    if (query.trim()) {
      const searchTerms = query.trim().toLowerCase().split(/\s+/);
      results = results.filter(diary => {
        const searchableText = `${diary.title} ${diary.content}`.toLowerCase();
        // 返回包含任一搜索词的条目
        return searchTerms.some(term => searchableText.includes(term));
      });
    }

    return results;
  }

  /**
   * 将数据库行转换为 Diary 对象
   */
  private convertRowsToDiaries(rows: DiaryRow[]): Diary[] {
    return rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      content: row.content,
      mood: row.mood,
      weather: row.weather,
      location: row.location,
      tags: row.tags || [],
      images: row.images || [],
      isEncrypted: row.is_encrypted || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  /**
   * 高亮文本中的匹配项
   * @param text 要高亮的文本
   * @param query 搜索查询
   * @returns 带有 <mark> 标签的 HTML 字符串
   */
  highlightMatches(text: string, query: string): string {
    if (!query.trim()) return text;

    const words = query.trim().split(/\s+/);
    let highlighted = text;

    words.forEach(word => {
      const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
    });

    return highlighted;
  }

  /**
   * 截断内容到指定长度
   * @param content 内容文本
   * @param maxLength 最大长度（默认 150）
   * @returns 截断后的文本
   */
  truncateContent(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  /**
   * 保存搜索到历史记录
   * @param query 搜索查询
   */
  async saveToHistory(query: string): Promise<void> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    try {
      // 获取当前用户 ID
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const history = this.getHistory(user.id);

      // 移除重复项（如果存在）
      const filtered = history.filter(q => q !== trimmedQuery);

      // 添加到开头
      const updated = [trimmedQuery, ...filtered].slice(0, this.maxHistoryItems);

      // 保存到 localStorage
      localStorage.setItem(
        `${this.historyKey}_${user.id}`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.warn('Failed to save search history:', error);
      // 不抛出错误，因为这不是关键功能
    }
  }

  /**
   * 获取搜索历史
   * @param userId 用户 ID
   * @returns 搜索历史数组
   */
  getHistory(userId?: string): string[] {
    try {
      if (!userId) return [];
      const stored = localStorage.getItem(`${this.historyKey}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to get search history:', error);
      return [];
    }
  }

  /**
   * 清除搜索历史
   * @param userId 用户 ID
   */
  clearHistory(userId?: string): void {
    try {
      if (!userId) return;
      localStorage.removeItem(`${this.historyKey}_${userId}`);
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// 导出单例实例
export const searchService = new SearchService();
