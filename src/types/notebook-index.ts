/**
 * 纸质风格日记本类型导出索引
 * 
 * 此文件统一导出所有纸质风格日记本相关的类型和接口
 */

// 核心数据类型
export type {
  PaperStyle,
  Notebook,
  NotebookRow,
  DiaryEntry,
  DiaryEntryRow,
  Page,
  PaginationState,
  PageFlipConfig,
  PageCurlConfig,
  AnimationController,
  MigrationResult,
  MigrationStatus,
  SearchResult,
  ViewMode,
  AccessibilityPreferences,
  AmbientSoundSettings,
  UIPreferences,
  CreateNotebookInput,
  UpdateNotebookInput,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
  FontFamily,
} from './notebook';

// 常量
export {
  FONT_FAMILIES,
  PAPER_STYLE_NAMES,
  FONT_SIZE_RANGE,
  LINE_HEIGHT_RANGE,
} from './notebook';

// 服务接口
export type {
  NotebookService,
  EntryService,
  MigrationService,
  PaginationService,
} from './notebook-services';

// Store 接口
export type {
  NotebookStore,
  EntryStore,
  UIStore,
} from './notebook-stores';
