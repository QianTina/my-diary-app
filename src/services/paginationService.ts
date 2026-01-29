/**
 * 分页服务实现
 * 
 * 此服务负责计算页面布局、管理可见页面和预加载相邻页面
 * 
 * 验证需求：5.5, 9.1, 9.2
 */

import type { DiaryEntry, Page } from '../types/notebook';
import type { PaginationService as IPaginationService } from '../types/notebook-services';

/**
 * 估算单个条目在给定视口和字体大小下需要的高度（像素）
 * 
 * 这是一个简化的估算，基于以下假设：
 * - 标题占用约 2 行（考虑到标题通常较大）
 * - 内容按字符数和行宽估算行数
 * - 每行高度 = fontSize * lineHeight（使用默认 1.5）
 * - 平均每行约 50 个字符（考虑中英文混合）
 * - 额外的边距和间距约占 20%
 */
function estimateEntryHeight(entry: DiaryEntry, fontSize: number): number {
  const lineHeight = 1.5; // 默认行高
  const charsPerLine = 50; // 平均每行字符数
  const titleLines = 2; // 标题占用行数
  const marginMultiplier = 1.2; // 边距系数
  
  // 计算标题高度（标题通常使用较大字体，约 1.5 倍）
  const titleHeight = titleLines * fontSize * 1.5 * lineHeight;
  
  // 计算内容高度
  const contentLength = entry.content.length;
  const contentLines = Math.ceil(contentLength / charsPerLine);
  const contentHeight = contentLines * fontSize * lineHeight;
  
  // 日期和元数据高度（约 1 行）
  const metadataHeight = fontSize * lineHeight;
  
  // 总高度（包含边距）
  const totalHeight = (titleHeight + contentHeight + metadataHeight) * marginMultiplier;
  
  return totalHeight;
}

/**
 * 分页服务实现类
 */
class PaginationServiceImpl implements IPaginationService {
  // 缓存计算结果以提高性能
  private pageCache: Map<string, Page[]> = new Map();
  
  /**
   * 生成缓存键
   */
  private getCacheKey(entries: DiaryEntry[], viewportHeight: number, fontSize: number): string {
    const entryIds = entries.map(e => e.id).join(',');
    return `${entryIds}-${viewportHeight}-${fontSize}`;
  }
  
  /**
   * 根据条目内容和视口尺寸计算页面布局
   * 
   * 算法：
   * 1. 遍历所有条目
   * 2. 估算每个条目的高度
   * 3. 将条目分配到页面，确保不超过视口高度
   * 4. 为桌面视图创建左右页面对
   * 
   * @param entries - 条目列表（按日期排序）
   * @param viewportHeight - 视口高度（像素）
   * @param fontSize - 字体大小（像素）
   * @returns 页面列表
   */
  calculatePages(entries: DiaryEntry[], viewportHeight: number, fontSize: number): Page[] {
    // 检查缓存
    const cacheKey = this.getCacheKey(entries, viewportHeight, fontSize);
    const cached = this.pageCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // 如果没有条目，返回空页面
    if (entries.length === 0) {
      return [];
    }
    
    const pages: Page[] = [];
    let currentPageEntries: DiaryEntry[] = [];
    let currentPageHeight = 0;
    let pageNumber = 1;
    
    // 为页面内容预留一些空间（页眉、页脚、边距等）
    const usableHeight = viewportHeight * 0.85; // 使用 85% 的视口高度
    
    for (const entry of entries) {
      const entryHeight = estimateEntryHeight(entry, fontSize);
      
      // 如果当前页面加上新条目会超过可用高度，创建新页面
      if (currentPageHeight + entryHeight > usableHeight && currentPageEntries.length > 0) {
        // 确定页面位置（奇数页在右，偶数页在左）
        const side = pageNumber % 2 === 1 ? 'right' : 'left';
        
        pages.push({
          entries: [...currentPageEntries],
          pageNumber,
          side,
        });
        
        // 重置当前页面
        currentPageEntries = [];
        currentPageHeight = 0;
        pageNumber++;
      }
      
      // 将条目添加到当前页面
      currentPageEntries.push(entry);
      currentPageHeight += entryHeight;
    }
    
    // 添加最后一页（如果有内容）
    if (currentPageEntries.length > 0) {
      const side = pageNumber % 2 === 1 ? 'right' : 'left';
      pages.push({
        entries: [...currentPageEntries],
        pageNumber,
        side,
      });
    }
    
    // 缓存结果
    this.pageCache.set(cacheKey, pages);
    
    return pages;
  }
  
  /**
   * 获取当前可见的页面（当前页 + 相邻页）
   * 
   * 根据需求 9.1 和 9.2，系统应该只加载：
   * - 当前页面 (N)
   * - 前一页 (N-1)
   * - 后一页 (N+1)
   * 
   * @param allPages - 所有页面
   * @param currentPage - 当前页码（从 1 开始）
   * @returns 可见页面列表
   */
  getVisiblePages(allPages: Page[], currentPage: number): Page[] {
    if (allPages.length === 0) {
      return [];
    }
    
    // 确保页码在有效范围内
    const validCurrentPage = Math.max(1, Math.min(currentPage, allPages.length));
    
    // 计算需要加载的页面范围
    const startPage = Math.max(1, validCurrentPage - 1);
    const endPage = Math.min(allPages.length, validCurrentPage + 1);
    
    // 过滤出可见页面（页码从 1 开始，数组索引从 0 开始）
    const visiblePages = allPages.filter(page => 
      page.pageNumber >= startPage && page.pageNumber <= endPage
    );
    
    return visiblePages;
  }
  
  /**
   * 预加载相邻页面
   * 
   * 返回需要预加载的页码列表，用于提前加载资源
   * 
   * @param currentPage - 当前页码（从 1 开始）
   * @param totalPages - 总页数
   * @returns 需要预加载的页码列表
   */
  preloadAdjacentPages(currentPage: number, totalPages: number): number[] {
    if (totalPages === 0) {
      return [];
    }
    
    // 确保页码在有效范围内
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
    
    const pagesToPreload: number[] = [];
    
    // 预加载前一页
    if (validCurrentPage > 1) {
      pagesToPreload.push(validCurrentPage - 1);
    }
    
    // 预加载后一页
    if (validCurrentPage < totalPages) {
      pagesToPreload.push(validCurrentPage + 1);
    }
    
    return pagesToPreload;
  }
  
  /**
   * 清除缓存
   * 
   * 当条目发生变化时应该调用此方法
   */
  clearCache(): void {
    this.pageCache.clear();
  }
}

// 导出单例实例
export const paginationService = new PaginationServiceImpl();

// 也导出类，以便测试时可以创建新实例
export { PaginationServiceImpl };
