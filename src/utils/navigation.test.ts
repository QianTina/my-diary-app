/**
 * 导航工具模块测试
 * 
 * 测试日期导航和目录生成功能
 */

import { describe, it, expect } from 'vitest';
import {
  jumpToDate,
  generateTableOfContents,
  findPageByEntryId,
  getPageByNumber,
  getBookmarkedEntries,
  isValidPageNumber,
  getNextPage,
  getPreviousPage,
  type TableOfContentsEntry,
} from './navigation';
import type { DiaryEntry, Page } from '../types/notebook';

// 辅助函数：创建测试用的日记条目
function createTestEntry(
  id: string,
  title: string,
  date: Date,
  bookmarked: boolean = false
): DiaryEntry {
  return {
    id,
    userId: 'test-user',
    notebookId: 'test-notebook',
    title,
    content: `Content for ${title}`,
    date,
    bookmarked,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// 辅助函数：创建测试用的页面
function createTestPage(pageNumber: number, entries: DiaryEntry[]): Page {
  return {
    pageNumber,
    entries,
    side: pageNumber % 2 === 1 ? 'right' : 'left',
  };
}

describe('jumpToDate', () => {
  it('should find the page number for a matching date', () => {
    const targetDate = new Date('2024-01-15');
    const pages: Page[] = [
      createTestPage(1, [
        createTestEntry('1', 'Entry 1', new Date('2024-01-10')),
        createTestEntry('2', 'Entry 2', new Date('2024-01-12')),
      ]),
      createTestPage(2, [
        createTestEntry('3', 'Entry 3', new Date('2024-01-15')),
        createTestEntry('4', 'Entry 4', new Date('2024-01-18')),
      ]),
      createTestPage(3, [
        createTestEntry('5', 'Entry 5', new Date('2024-01-20')),
      ]),
    ];

    const result = jumpToDate(pages, targetDate);
    expect(result).toBe(2);
  });

  it('should return null when no matching date is found', () => {
    const targetDate = new Date('2024-01-25');
    const pages: Page[] = [
      createTestPage(1, [
        createTestEntry('1', 'Entry 1', new Date('2024-01-10')),
        createTestEntry('2', 'Entry 2', new Date('2024-01-12')),
      ]),
      createTestPage(2, [
        createTestEntry('3', 'Entry 3', new Date('2024-01-15')),
      ]),
    ];

    const result = jumpToDate(pages, targetDate);
    expect(result).toBeNull();
  });

  it('should match dates ignoring time component', () => {
    const targetDate = new Date('2024-01-15T10:30:00');
    const pages: Page[] = [
      createTestPage(1, [
        createTestEntry('1', 'Entry 1', new Date('2024-01-15T18:45:00')),
      ]),
    ];

    const result = jumpToDate(pages, targetDate);
    expect(result).toBe(1);
  });

  it('should return the first matching page when multiple entries have the same date', () => {
    const targetDate = new Date('2024-01-15');
    const pages: Page[] = [
      createTestPage(1, [
        createTestEntry('1', 'Entry 1', new Date('2024-01-15')),
      ]),
      createTestPage(2, [
        createTestEntry('2', 'Entry 2', new Date('2024-01-15')),
      ]),
    ];

    const result = jumpToDate(pages, targetDate);
    expect(result).toBe(1);
  });

  it('should handle empty pages array', () => {
    const targetDate = new Date('2024-01-15');
    const pages: Page[] = [];

    const result = jumpToDate(pages, targetDate);
    expect(result).toBeNull();
  });

  it('should handle pages with empty entries', () => {
    const targetDate = new Date('2024-01-15');
    const pages: Page[] = [
      createTestPage(1, []),
      createTestPage(2, []),
    ];

    const result = jumpToDate(pages, targetDate);
    expect(result).toBeNull();
  });
});

describe('generateTableOfContents', () => {
  it('should generate table of contents with all entries', () => {
    const pages: Page[] = [
      createTestPage(1, [
        createTestEntry('1', 'First Entry', new Date('2024-01-10')),
        createTestEntry('2', 'Second Entry', new Date('2024-01-12')),
      ]),
      createTestPage(2, [
        createTestEntry('3', 'Third Entry', new Date('2024-01-15')),
      ]),
      createTestPage(3, [
        createTestEntry('4', 'Fourth Entry', new Date('2024-01-18')),
        createTestEntry('5', 'Fifth Entry', new Date('2024-01-20')),
      ]),
    ];

    const toc = generateTableOfContents(pages);

    expect(toc).toHaveLength(5);
    expect(toc[0]).toEqual({
      id: '1',
      title: 'First Entry',
      date: new Date('2024-01-10'),
      pageNumber: 1,
    });
    expect(toc[2]).toEqual({
      id: '3',
      title: 'Third Entry',
      date: new Date('2024-01-15'),
      pageNumber: 2,
    });
    expect(toc[4]).toEqual({
      id: '5',
      title: 'Fifth Entry',
      date: new Date('2024-01-20'),
      pageNumber: 3,
    });
  });

  it('should return empty array for empty pages', () => {
    const pages: Page[] = [];
    const toc = generateTableOfContents(pages);
    expect(toc).toEqual([]);
  });

  it('should handle pages with no entries', () => {
    const pages: Page[] = [
      createTestPage(1, []),
      createTestPage(2, []),
    ];
    const toc = generateTableOfContents(pages);
    expect(toc).toEqual([]);
  });

  it('should preserve entry order across pages', () => {
    const pages: Page[] = [
      createTestPage(1, [
        createTestEntry('1', 'Entry A', new Date('2024-01-10')),
      ]),
      createTestPage(2, [
        createTestEntry('2', 'Entry B', new Date('2024-01-12')),
      ]),
      createTestPage(3, [
        createTestEntry('3', 'Entry C', new Date('2024-01-15')),
      ]),
    ];

    const toc = generateTableOfContents(pages);

    expect(toc.map(e => e.title)).toEqual(['Entry A', 'Entry B', 'Entry C']);
    expect(toc.map(e => e.pageNumber)).toEqual([1, 2, 3]);
  });
});

describe('findPageByEntryId', () => {
  it('should find the page number for a given entry ID', () => {
    const pages: Page[] = [
      createTestPage(1, [
        createTestEntry('entry-1', 'Entry 1', new Date('2024-01-10')),
      ]),
      createTestPage(2, [
        createTestEntry('entry-2', 'Entry 2', new Date('2024-01-12')),
        createTestEntry('entry-3', 'Entry 3', new Date('2024-01-15')),
      ]),
    ];

    expect(findPageByEntryId(pages, 'entry-1')).toBe(1);
    expect(findPageByEntryId(pages, 'entry-2')).toBe(2);
    expect(findPageByEntryId(pages, 'entry-3')).toBe(2);
  });

  it('should return null when entry ID is not found', () => {
    const pages: Page[] = [
      createTestPage(1, [
        createTestEntry('entry-1', 'Entry 1', new Date('2024-01-10')),
      ]),
    ];

    expect(findPageByEntryId(pages, 'non-existent')).toBeNull();
  });

  it('should handle empty pages array', () => {
    expect(findPageByEntryId([], 'entry-1')).toBeNull();
  });
});

describe('getPageByNumber', () => {
  it('should return the page with the given page number', () => {
    const pages: Page[] = [
      createTestPage(1, [createTestEntry('1', 'Entry 1', new Date())]),
      createTestPage(2, [createTestEntry('2', 'Entry 2', new Date())]),
      createTestPage(3, [createTestEntry('3', 'Entry 3', new Date())]),
    ];

    const page = getPageByNumber(pages, 2);
    expect(page).not.toBeNull();
    expect(page?.pageNumber).toBe(2);
    expect(page?.entries[0].id).toBe('2');
  });

  it('should return null when page number is not found', () => {
    const pages: Page[] = [
      createTestPage(1, [createTestEntry('1', 'Entry 1', new Date())]),
    ];

    expect(getPageByNumber(pages, 5)).toBeNull();
  });

  it('should handle empty pages array', () => {
    expect(getPageByNumber([], 1)).toBeNull();
  });
});

describe('getBookmarkedEntries', () => {
  it('should return only bookmarked entries', () => {
    const pages: Page[] = [
      createTestPage(1, [
        createTestEntry('1', 'Entry 1', new Date('2024-01-10'), true),
        createTestEntry('2', 'Entry 2', new Date('2024-01-12'), false),
      ]),
      createTestPage(2, [
        createTestEntry('3', 'Entry 3', new Date('2024-01-15'), true),
        createTestEntry('4', 'Entry 4', new Date('2024-01-18'), false),
      ]),
      createTestPage(3, [
        createTestEntry('5', 'Entry 5', new Date('2024-01-20'), true),
      ]),
    ];

    const bookmarked = getBookmarkedEntries(pages);

    expect(bookmarked).toHaveLength(3);
    expect(bookmarked.map(e => e.id)).toEqual(['1', '3', '5']);
    expect(bookmarked.map(e => e.pageNumber)).toEqual([1, 2, 3]);
  });

  it('should return empty array when no entries are bookmarked', () => {
    const pages: Page[] = [
      createTestPage(1, [
        createTestEntry('1', 'Entry 1', new Date('2024-01-10'), false),
        createTestEntry('2', 'Entry 2', new Date('2024-01-12'), false),
      ]),
    ];

    const bookmarked = getBookmarkedEntries(pages);
    expect(bookmarked).toEqual([]);
  });

  it('should handle empty pages array', () => {
    const bookmarked = getBookmarkedEntries([]);
    expect(bookmarked).toEqual([]);
  });
});

describe('isValidPageNumber', () => {
  it('should return true for valid page numbers', () => {
    expect(isValidPageNumber(1, 10)).toBe(true);
    expect(isValidPageNumber(5, 10)).toBe(true);
    expect(isValidPageNumber(10, 10)).toBe(true);
  });

  it('should return false for page numbers out of range', () => {
    expect(isValidPageNumber(0, 10)).toBe(false);
    expect(isValidPageNumber(11, 10)).toBe(false);
    expect(isValidPageNumber(-1, 10)).toBe(false);
  });

  it('should return false for non-integer page numbers', () => {
    expect(isValidPageNumber(1.5, 10)).toBe(false);
    expect(isValidPageNumber(2.9, 10)).toBe(false);
  });

  it('should handle edge case of zero total pages', () => {
    expect(isValidPageNumber(1, 0)).toBe(false);
    expect(isValidPageNumber(0, 0)).toBe(false);
  });
});

describe('getNextPage', () => {
  it('should return the next page number', () => {
    expect(getNextPage(1, 10)).toBe(2);
    expect(getNextPage(5, 10)).toBe(6);
    expect(getNextPage(9, 10)).toBe(10);
  });

  it('should return null when on the last page', () => {
    expect(getNextPage(10, 10)).toBeNull();
  });

  it('should handle single page', () => {
    expect(getNextPage(1, 1)).toBeNull();
  });
});

describe('getPreviousPage', () => {
  it('should return the previous page number', () => {
    expect(getPreviousPage(2)).toBe(1);
    expect(getPreviousPage(5)).toBe(4);
    expect(getPreviousPage(10)).toBe(9);
  });

  it('should return null when on the first page', () => {
    expect(getPreviousPage(1)).toBeNull();
  });
});
