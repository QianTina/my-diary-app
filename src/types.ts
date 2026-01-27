/**
 * 心情类型
 */
export type Mood = 'happy' | 'sad' | 'neutral' | 'calm' | 'angry';

/**
 * 天气信息
 */
export interface Weather {
  temp: number;
  description: string;
}

/**
 * 日记条目接口
 */
export interface Diary {
  /** 唯一标识符 */
  id: string;
  /** 标题 */
  title: string;
  /** 日记内容 */
  content: string;
  /** 心情标签 */
  mood: Mood | null;
  /** 天气信息 */
  weather: Weather | null;
  /** 地理位置 */
  location: string;
  /** 标签列表 */
  tags: string[];
  /** 图片URL数组 */
  images: string[];
  /** 是否加密存储 */
  isEncrypted: boolean;
  /** 创建时间 (ISO 字符串) */
  createdAt: string;
  /** 更新时间 (ISO 字符串) */
  updatedAt: string;
}

export interface DiaryRow {
  id: string;
  title: string;
  content: string;
  mood: Mood | null;
  weather: Weather | null;
  location: string;
  tags: string[];
  images: string[];
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
}
