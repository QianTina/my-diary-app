/**
 * 纸张样式继承 Hook
 * 
 * 此 Hook 实现纸张样式的继承逻辑：
 * - 如果条目有显式的 paper_style 覆盖，使用条目的样式
 * - 否则，使用日记本的默认 paper_style
 * 
 * 验证：
 * - 属性 10：纸张样式继承
 * - 属性 11：纸张样式覆盖
 */

import { useMemo } from 'react';
import type { PaperStyle, DiaryEntry, Notebook } from '../types/notebook';

/**
 * 解析条目的有效纸张样式
 * 
 * @param entry - 日记条目（可选）
 * @param notebook - 所属日记本（可选）
 * @returns 有效的纸张样式
 * 
 * @example
 * // 条目有覆盖样式
 * const style = usePaperStyle(entry, notebook); // 返回 entry.paperStyle
 * 
 * @example
 * // 条目没有覆盖样式
 * const style = usePaperStyle(entry, notebook); // 返回 notebook.paperStyle
 * 
 * @example
 * // 只有日记本
 * const style = usePaperStyle(undefined, notebook); // 返回 notebook.paperStyle
 */
export function usePaperStyle(
  entry?: DiaryEntry | null,
  notebook?: Notebook | null
): PaperStyle {
  return useMemo(() => {
    // 属性 11：纸张样式覆盖
    // 如果条目有显式的 paper_style 值，使用条目的样式
    if (entry?.paperStyle) {
      return entry.paperStyle;
    }
    
    // 属性 10：纸张样式继承
    // 否则，使用日记本的默认 paper_style
    if (notebook?.paperStyle) {
      return notebook.paperStyle;
    }
    
    // 默认回退到空白样式
    return 'blank';
  }, [entry?.paperStyle, notebook?.paperStyle]);
}

/**
 * 解析条目的有效字体设置
 * 
 * @param notebook - 所属日记本（可选）
 * @returns 有效的字体设置
 * 
 * @example
 * const fontSettings = useFontSettings(notebook);
 * // 返回 { fontFamily: 'system', fontSize: 16, lineHeight: 1.5 }
 */
export function useFontSettings(notebook?: Notebook | null) {
  return useMemo(() => {
    if (!notebook) {
      return {
        fontFamily: 'system',
        fontSize: 16,
        lineHeight: 1.5,
      };
    }
    
    return {
      fontFamily: notebook.fontFamily,
      fontSize: notebook.fontSize,
      lineHeight: notebook.lineHeight,
    };
  }, [notebook?.fontFamily, notebook?.fontSize, notebook?.lineHeight]);
}

/**
 * 获取纸张样式的 CSS 类名
 * 
 * @param paperStyle - 纸张样式
 * @returns CSS 类名
 */
export function getPaperStyleClassName(paperStyle: PaperStyle): string {
  return `paper-style-${paperStyle}`;
}

/**
 * 获取字体系列的 CSS 值
 * 
 * @param fontFamily - 字体系列名称
 * @returns CSS font-family 值
 */
export function getFontFamilyCSS(fontFamily: string): string {
  const fontFamilies: Record<string, string> = {
    system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    handwriting: '"Caveat", "Dancing Script", cursive',
    serif: '"Merriweather", "Georgia", serif',
    sansSerif: '"Inter", "Helvetica Neue", sans-serif',
  };
  
  return fontFamilies[fontFamily] || fontFamilies.system;
}
