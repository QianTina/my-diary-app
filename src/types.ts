/**
 * 日记条目接口
 */
export interface Diary {
  /** 唯一标识符 */
  id: string;
  /** 日记内容 */
  content: string;
  /** 创建时间 (ISO 字符串) */
  createdAt: string;
}
