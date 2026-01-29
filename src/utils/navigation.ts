/**
 * 导航工具模块
 * 
 * 此模块提供日期导航和目录生成功能
 * 
 * 验证需求：7.2, 7.3
 */

import type { DiaryEntry, Page } from '../types/notebook';

/**
 * 目录条目接口
 */
export interface TableOfContentsEntry {
  /** 条目 ID */
  id: string;
  /** 条目标题 */
  title: string;
  /** 条目日期 */
  date: Date;
  /** 所在页码 */
  pageNumber: number;
}

/**
 * 根据日期查找包含该日期条目的页码
 * 
 * 算法：
 * 1. 遍历所有页面
 * 2. 检查每个页面中的条目
 * 3. 查找日期匹配的条目
 * 4. 返回该条目所在的页码
 * 
 * 日期匹配规则：
 * - 比较年、月、日（忽略时间部分）
 * - 如果找到匹配的条目，返回其所在页码
 * - 如果没有找到，返回 null
 * 
 * @param pages - 页面列表
 * @param targetDate - 目标日期
 * @returns 页码（从 1 开始），如果未找到则返回 null
 * 
 * 验证需求 7.2：当用户请求跳转到特定日期时，系统应导航到包含该日期条目的页面
 */
export function jumpToDate(pages: Page[], targetDate: Date): number | null {
  // 标准化目标日期（只保留年月日）
  const normalizedTargetDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  
  // 遍历所有页面
  for (const page of pages) {
    // 检查页面中的每个条目
    for (const entry of page.entries) {
      // 标准化条目日期（只保留年月日）
      const entryDate = new Date(entry.date);
      const normalizedEntryDate = new Date(
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate()
      );
      
      // 比较日期（忽略时间部分）
      if (normalizedEntryDate.getTime() === normalizedTargetDate.getTime()) {
        return page.pageNumber;
      }
    }
  }
  
  // 未找到匹配的条目
  return null;
}

/**
 * 生成目录
 * 
 * 算法：
 * 1. 遍历所有页面
 * 2. 提取每个条目的 ID、标题、日期
 * 3. 记录条目所在的页码
 * 4. 返回目录条目列表
 * 
 * 目录条目按照它们在页面中出现的顺序排列
 * 
 * @param pages - 页面列表
 * @returns 目录条目列表
 * 
 * 验证需求 7.3：当用户打开目录时，系统应显示所有条目的列表，包括日期和标题
 */
export function generateTableOfContents(pages: Page[]): TableOfContentsEntry[] {
  const tableOfContents: TableOfContentsEntry[] = [];
  
  // 遍历所有页面
  for (const page of pages) {
    // 遍历页面中的每个条目
    for (const entry of page.entries) {
      tableOfContents.push({
        id: entry.id,
        title: entry.title,
        date: entry.date,
        pageNumber: page.pageNumber,
      });
    }
  }
  
  return tableOfContents;
}

/**
 * 根据条目 ID 查找页码
 * 
 * 这是一个辅助函数，用于支持从目录或搜索结果导航到特定条目
 * 
 * @param pages - 页面列表
 * @param entryId - 条目 ID
 * @returns 页码（从 1 开始），如果未找到则返回 null
 */
export function findPageByEntryId(pages: Page[], entryId: string): number | null {
  for (const page of pages) {
    const hasEntry = page.entries.some(entry => entry.id === entryId);
    if (hasEntry) {
      return page.pageNumber;
    }
  }
  
  return null;
}

/**
 * 获取指定页码的页面
 * 
 * @param pages - 页面列表
 * @param pageNumber - 页码（从 1 开始）
 * @returns 页面对象，如果未找到则返回 null
 */
export function getPageByNumber(pages: Page[], pageNumber: number): Page | null {
  const page = pages.find(p => p.pageNumber === pageNumber);
  return page || null;
}

/**
 * 获取书签条目列表
 * 
 * 从所有页面中提取已添加书签的条目，并返回它们的目录信息
 * 
 * @param pages - 页面列表
 * @returns 书签条目列表
 */
export function getBookmarkedEntries(pages: Page[]): TableOfContentsEntry[] {
  const bookmarkedEntries: TableOfContentsEntry[] = [];
  
  for (const page of pages) {
    for (const entry of page.entries) {
      if (entry.bookmarked) {
        bookmarkedEntries.push({
          id: entry.id,
          title: entry.title,
          date: entry.date,
          pageNumber: page.pageNumber,
        });
      }
    }
  }
  
  return bookmarkedEntries;
}

/**
 * 验证页码是否有效
 * 
 * @param pageNumber - 页码
 * @param totalPages - 总页数
 * @returns 是否有效
 */
export function isValidPageNumber(pageNumber: number, totalPages: number): boolean {
  return pageNumber >= 1 && pageNumber <= totalPages && Number.isInteger(pageNumber);
}

/**
 * 获取下一页页码
 * 
 * @param currentPage - 当前页码
 * @param totalPages - 总页数
 * @returns 下一页页码，如果已是最后一页则返回 null
 */
export function getNextPage(currentPage: number, totalPages: number): number | null {
  if (currentPage < totalPages) {
    return currentPage + 1;
  }
  return null;
}

/**
 * 获取上一页页码
 * 
 * @param currentPage - 当前页码
 * @returns 上一页页码，如果已是第一页则返回 null
 */
export function getPreviousPage(currentPage: number): number | null {
  if (currentPage > 1) {
    return currentPage - 1;
  }
  return null;
}
