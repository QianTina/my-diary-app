/**
 * 纸质风格日记本类型定义
 * 
 * 此文件定义了纸质风格日记本功能的所有 TypeScript 类型和接口
 */

/**
 * 纸张样式类型
 */
export type PaperStyle = 'blank' | 'lined' | 'grid' | 'dotted' | 'vintage';

/**
 * 日记本接口（应用层）
 */
export interface Notebook {
  /** 唯一标识符 */
  id: string;
  /** 用户 ID */
  userId: string;
  /** 日记本名称 */
  name: string;
  /** 封面颜色（可选） */
  coverColor?: string;
  /** 封面图片 URL（可选） */
  coverImage?: string;
  /** 日记本描述（可选） */
  description?: string;
  /** 默认纸张样式 */
  paperStyle: PaperStyle;
  /** 默认字体系列 */
  fontFamily: string;
  /** 默认字体大小（12-24px） */
  fontSize: number;
  /** 默认行高（1.2-2.0） */
  lineHeight: number;
  /** 创建时间 */
  createdAt: Date;
  /** 最后更新时间 */
  updatedAt: Date;
  /** 是否已归档 */
  archived: boolean;
}

/**
 * 日记本数据库行接口（数据库层）
 */
export interface NotebookRow {
  id: string;
  user_id: string;
  name: string;
  cover_color?: string;
  cover_image?: string;
  description?: string;
  paper_style: PaperStyle;
  font_family: string;
  font_size: number;
  line_height: number;
  created_at: string;
  updated_at: string;
  archived: boolean;
}

/**
 * 增强的日记条目接口（包含日记本关联）
 */
export interface DiaryEntry {
  /** 唯一标识符 */
  id: string;
  /** 用户 ID */
  userId: string;
  /** 所属日记本 ID */
  notebookId: string;
  /** 标题 */
  title: string;
  /** 日记内容 */
  content: string;
  /** 日期 */
  date: Date;
  /** 纸张样式覆盖（可选） */
  paperStyle?: PaperStyle;
  /** 是否已添加书签 */
  bookmarked: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 最后更新时间 */
  updatedAt: Date;
}

/**
 * 增强的日记条目数据库行接口
 */
export interface DiaryEntryRow {
  id: string;
  user_id: string;
  notebook_id: string;
  title: string;
  content: string;
  date: string;
  paper_style?: PaperStyle;
  bookmarked: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 用于渲染的页面表示
 */
export interface Page {
  /** 页面中的条目列表 */
  entries: DiaryEntry[];
  /** 页码 */
  pageNumber: number;
  /** 页面位置（左页或右页） */
  side: 'left' | 'right';
}

/**
 * 分页状态
 */
export interface PaginationState {
  /** 当前页码 */
  currentPage: number;
  /** 总页数 */
  totalPages: number;
  /** 可见的页面列表 */
  visiblePages: Page[];
  /** 已加载的页面范围 [起始页, 结束页] */
  loadedPageRange: [number, number];
}

/**
 * 翻页动画配置
 */
export interface PageFlipConfig {
  /** 动画持续时间（毫秒） */
  duration: number;
  /** CSS 缓动函数 */
  easing: string;
  /** 翻页方向 */
  direction: 'forward' | 'backward';
  /** 是否启用减少动画模式 */
  reduceMotion: boolean;
}

/**
 * 页面卷曲效果配置
 */
export interface PageCurlConfig {
  /** 卷曲强度（0-1） */
  intensity: number;
  /** 卷曲位置 */
  position: { x: number; y: number };
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 动画控制器接口
 */
export interface AnimationController {
  /** 执行翻页动画 */
  flipPage: (config: PageFlipConfig) => Promise<void>;
  /** 应用页面卷曲效果 */
  applyCurlEffect: (config: PageCurlConfig) => void;
  /** 移除页面卷曲效果 */
  removeCurlEffect: () => void;
  /** 执行淡入淡出过渡 */
  transitionFade: (duration: number) => Promise<void>;
}

/**
 * 迁移结果接口
 */
export interface MigrationResult {
  /** 默认日记本 ID */
  defaultNotebookId: string;
  /** 迁移的条目数量 */
  migratedEntriesCount: number;
}

/**
 * 迁移状态接口
 */
export interface MigrationStatus {
  /** 是否需要迁移 */
  needsMigration: boolean;
  /** 未迁移的条目数量 */
  unmigratedEntriesCount: number;
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  /** 条目 ID */
  id: string;
  /** 日记本 ID */
  notebookId: string;
  /** 标题 */
  title: string;
  /** 日期 */
  date: Date;
  /** 匹配的内容片段 */
  snippet: string;
  /** 相关性评分 */
  relevance?: number;
}

/**
 * 视图模式类型
 */
export type ViewMode = 'list' | 'grid' | 'reader';

/**
 * 无障碍偏好设置接口
 */
export interface AccessibilityPreferences {
  /** 是否启用减少动画模式 */
  reduceMotion: boolean;
  /** 是否启用高对比度模式 */
  highContrast: boolean;
  /** 是否启用屏幕阅读器模式 */
  screenReader: boolean;
}

/**
 * 环境音效设置接口
 */
export interface AmbientSoundSettings {
  /** 是否启用环境音效 */
  enabled: boolean;
  /** 音量（0-1） */
  volume: number;
  /** 当前选择的音效 */
  currentSound?: string;
}

/**
 * UI 偏好设置接口
 */
export interface UIPreferences {
  /** 视图模式 */
  viewMode: ViewMode;
  /** 是否显示目录 */
  showTableOfContents: boolean;
  /** 是否显示书签面板 */
  showBookmarks: boolean;
  /** 环境音效设置 */
  ambientSound: AmbientSoundSettings;
  /** 无障碍偏好设置 */
  accessibility: AccessibilityPreferences;
}

/**
 * 创建日记本的输入数据
 */
export type CreateNotebookInput = Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 更新日记本的输入数据
 */
export type UpdateNotebookInput = Partial<Omit<Notebook, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

/**
 * 创建日记条目的输入数据
 */
export type CreateDiaryEntryInput = Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 更新日记条目的输入数据
 */
export type UpdateDiaryEntryInput = Partial<Omit<DiaryEntry, 'id' | 'userId' | 'notebookId' | 'createdAt' | 'updatedAt'>>;

/**
 * 字体系列选项
 */
export const FONT_FAMILIES = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  handwriting: '"Caveat", "Dancing Script", cursive',
  serif: '"Merriweather", "Georgia", serif',
  sansSerif: '"Inter", "Helvetica Neue", sans-serif',
} as const;

/**
 * 字体系列类型
 */
export type FontFamily = keyof typeof FONT_FAMILIES;

/**
 * 纸张样式显示名称
 */
export const PAPER_STYLE_NAMES: Record<PaperStyle, string> = {
  blank: '空白',
  lined: '横线',
  grid: '方格',
  dotted: '点阵',
  vintage: '复古',
};

/**
 * 字体大小范围
 */
export const FONT_SIZE_RANGE = {
  min: 12,
  max: 24,
  default: 16,
} as const;

/**
 * 行高范围
 */
export const LINE_HEIGHT_RANGE = {
  min: 1.2,
  max: 2.0,
  default: 1.5,
} as const;
