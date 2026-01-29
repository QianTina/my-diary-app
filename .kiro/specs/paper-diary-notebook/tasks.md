# 实施计划：纸质风格日记本

## 概述

本实施计划将纸质日记本功能分解为增量的、可测试的步骤。该方法遵循自下而上的策略：首先是数据库架构和迁移，然后是数据服务、状态管理、核心 UI 组件、动画，最后是集成。每个主要组件都包括基于属性的测试，以验证设计文档中的正确性属性。

## 任务

- [x] 1. 数据库架构和迁移设置
  - 创建包含所有必需字段和约束的 notebooks 表
  - 向 diary_entries 表添加 notebook_id、paper_style 和 bookmarked 列
  - 创建性能索引（user_id、notebook_id、全文搜索）
  - 创建 updated_at 时间戳的触发器
  - 编写迁移脚本以创建默认日记本并分配现有条目
  - _需求: 1.1, 1.2, 1.3, 2.1, 2.2, 2.5, 12.1, 12.2_

- [x] 1.1 为迁移数据保留编写属性测试
  - **属性 26：迁移数据保留**
  - **验证：需求 12.4, 12.5**

- [x] 1.2 为引用完整性编写属性测试
  - **属性 9：引用完整性**
  - **验证：需求 2.5**

- [x] 2. 核心 TypeScript 类型和接口
  - 定义 Notebook、DiaryEntry、Page、PaginationState 接口
  - 定义 PaperStyle 类型和字体相关类型
  - 定义服务接口（NotebookService、EntryService、MigrationService）
  - 定义 store 接口（NotebookStore、EntryStore、UIStore）
  - 定义动画接口（PageFlipConfig、AnimationController）
  - _需求: 全部（基础类型）_

- [ ] 3. Supabase 服务层
  - [x] 3.1 实现 NotebookService
    - 实现 getNotebooks、getNotebook、createNotebook、updateNotebook、deleteNotebook、archiveNotebook
    - 为数据库操作添加错误处理
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7_

  - [x] 3.2 为日记本创建验证编写属性测试
    - **属性 1：日记本创建验证**
    - **验证：需求 1.2**

  - [ ] 3.3 为默认设置分配编写属性测试
    - **属性 2：默认设置分配**
    - **验证：需求 1.3**

  - [ ] 3.4 为日记本字段可变性编写属性测试
    - **属性 3：日记本字段可变性**
    - **验证：需求 1.4**

  - [ ] 3.5 为级联删除编写属性测试
    - **属性 4：级联删除**
    - **验证：需求 1.6, 2.4**

  - [ ] 3.6 为归档保留编写属性测试
    - **属性 5：归档保留**
    - **验证：需求 1.7**

  - [x] 3.7 实现 EntryService
    - 实现 getEntriesForNotebook、getEntry、createEntry、updateEntry、deleteEntry
    - 实现带全文搜索的 searchEntries
    - 为数据库操作添加错误处理
    - _需求: 2.1, 2.3, 8.1, 8.2, 8.3_

  - [ ] 3.8 为条目-日记本关联编写属性测试
    - **属性 6：条目-日记本关联**
    - **验证：需求 2.1**

  - [ ] 3.9 为日记本过滤编写属性测试
    - **属性 8：日记本过滤**
    - **验证：需求 2.3**

  - [ ] 3.10 为搜索范围覆盖编写属性测试
    - **属性 18：搜索范围覆盖**
    - **验证：需求 8.1**

  - [ ] 3.11 为上下文搜索范围编写属性测试
    - **属性 19：上下文搜索范围**
    - **验证：需求 8.2, 8.3**

  - [ ] 3.12 为搜索结果完整性编写属性测试
    - **属性 20：搜索结果完整性**
    - **验证：需求 8.4**

  - [x] 3.13 实现 MigrationService
    - 实现 createDefaultNotebook、migrateExistingEntries、checkMigrationStatus
    - 为原子迁移添加事务支持
    - _需求: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 3.14 为迁移分配编写属性测试
    - **属性 7：迁移分配**
    - **验证：需求 2.2, 12.2**

  - [ ] 3.15 为迁移条目默认值编写属性测试
    - **属性 27：迁移条目默认值**
    - **验证：需求 12.3**

- [ ] 4. 检查点 - 确保服务层测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 5. Zustand 状态管理 stores
  - [x] 5.1 实现 NotebookStore
    - 创建包含 notebooks 数组、activeNotebook、loading、error 状态的 store
    - 实现 fetchNotebooks、createNotebook、updateNotebook、deleteNotebook、archiveNotebook 操作
    - 添加乐观更新以获得更好的用户体验
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7_

  - [ ] 5.2 为设置持久化往返编写属性测试
    - **属性 12：设置持久化往返**
    - **验证：需求 3.5, 4.5**

  - [x] 5.3 实现 EntryStore
    - 创建包含 entries 数组、loading、error 状态的 store
    - 实现 fetchEntriesForNotebook、createEntry、updateEntry、deleteEntry、toggleBookmark、searchEntries 操作
    - 为书签添加乐观更新
    - _需求: 2.1, 2.3, 7.1, 7.5, 8.1, 8.2, 8.3_

  - [ ] 5.4 为书签持久化编写属性测试
    - **属性 15：书签持久化**
    - **验证：需求 7.1, 7.5**

  - [x] 5.5 实现 UIStore
    - 创建包含 viewMode、paginationState、无障碍偏好的 store
    - 实现导航操作（navigateToPage、navigateNext、navigatePrevious、jumpToDate）
    - 实现 UI 切换操作（目录、书签、环境音效）
    - 为用户偏好添加 localStorage 持久化
    - _需求: 7.2, 9.1, 9.2, 10.2, 10.3, 11.1, 11.4_

  - [ ] 5.6 为环境音效偏好持久化编写属性测试
    - **属性 25：环境音效偏好持久化**
    - **验证：需求 11.4**

- [ ] 6. 分页和导航逻辑
  - [x] 6.1 实现 PaginationService
    - 实现 calculatePages 函数（条目内容 → 基于视口的页面）
    - 实现 getVisiblePages 函数（当前页面 → 可见 + 相邻页面）
    - 实现 preloadAdjacentPages 函数
    - 添加记忆化以提高性能
    - _需求: 5.5, 9.1, 9.2_

  - [ ] 6.2 为分页一致性编写属性测试
    - **属性 14：分页一致性**
    - **验证：需求 5.5**

  - [ ] 6.3 为页面加载策略编写属性测试
    - **属性 21：页面加载策略**
    - **验证：需求 9.1, 9.2**

  - [x] 6.4 实现日期导航逻辑
    - 实现 jumpToDate 函数（日期 → 页码）
    - Implement table of contents generation
    - _Requirements: 7.2, 7.3_

  - [ ] 6.5 Write property test for date navigation
    - **Property 16: Date Navigation**
    - **Validates: Requirements 7.2**

  - [ ] 6.6 Write property test for table of contents completeness
    - **Property 17: Table of Contents Completeness**
    - **Validates: Requirements 7.3**

- [ ] 7. Checkpoint - Ensure pagination and navigation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Paper background components
  - [x] 8.1 Create PaperBackground component
    - Implement SVG patterns for blank, lined, grid, dotted, vintage styles
    - Add paper texture overlay
    - Make responsive to container size
    - _Requirements: 3.1, 3.4_

  - [ ] 8.2 Write unit tests for paper style rendering
    - Test each paper style renders correct SVG pattern
    - Test texture overlay is applied
    - _Requirements: 3.1_

  - [x] 8.3 Implement paper style inheritance logic
    - Create hook to resolve effective paper style (entry override or notebook default)
    - _Requirements: 3.2, 3.3_

  - [ ] 8.4 Write property test for paper style inheritance
    - **Property 10: Paper Style Inheritance**
    - **Validates: Requirements 3.2**

  - [ ] 8.5 Write property test for paper style override
    - **Property 11: Paper Style Override**
    - **Validates: Requirements 3.3**

- [ ] 9. Font customization components
  - [x] 9.1 Create FontProvider component
    - Implement font family loading (system, handwriting, serif, sans-serif)
    - Create context for font settings
    - Apply font settings to entry content
    - _Requirements: 4.1, 4.2_

  - [ ] 9.2 Write property test for font settings inheritance
    - **Property 13: Font Settings Inheritance**
    - **Validates: Requirements 4.2**

  - [ ] 9.3 Write unit tests for font size and line height validation
    - Test boundary values (12px-24px for size, 1.2-2.0 for line height)
    - Test values outside range are rejected
    - _Requirements: 4.3, 4.4_

- [ ] 10. Page display components
  - [x] 10.1 Create Page component
    - Render single page with paper background
    - Display entry content with proper typography
    - Add page number
    - Add shadows and depth effects
    - _Requirements: 5.3, 5.4_

  - [x] 10.2 Create PageSpread component (desktop)
    - Render two pages side-by-side
    - Add book spine in center
    - Make responsive to viewport width
    - _Requirements: 5.1_

  - [x] 10.3 Create SinglePage component (mobile)
    - Render single page view
    - Make responsive to mobile viewport
    - _Requirements: 5.2_

  - [ ] 10.4 Write unit tests for responsive layout
    - Test desktop viewport shows PageSpread
    - Test mobile viewport shows SinglePage
    - _Requirements: 5.1, 5.2_

- [ ] 11. Animation system
  - [x] 11.1 Implement AnimationController with Framer Motion
    - Implement flipPage function with realistic page flip animation
    - Implement applyCurlEffect for hover effect
    - Implement transitionFade for reduced motion mode
    - Add 60fps performance monitoring
    - _Requirements: 6.1, 6.2, 6.7, 6.8, 10.3_

  - [ ] 11.2 Write unit tests for animation configuration
    - Test animation respects reduceMotion preference
    - Test animation duration and easing
    - _Requirements: 10.3_

  - [x] 11.3 Implement gesture handlers
    - Add swipe left/right handlers for touch devices
    - Add keyboard arrow key handlers
    - Integrate with navigation actions
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

  - [ ] 11.4 Write unit tests for gesture and keyboard navigation
    - Test swipe gestures trigger navigation
    - Test arrow keys trigger navigation
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [ ] 12. Checkpoint - Ensure core UI components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Notebook management UI
  - [x] 13.1 Create NotebookCard component
    - Display notebook name, cover, description
    - Add edit and delete buttons
    - Add archive button
    - _Requirements: 1.4, 1.5, 1.6, 1.7_

  - [x] 13.2 Create NotebookListView component
    - Display notebooks in list or grid layout
    - Add create notebook button
    - Add search bar
    - Integrate with NotebookStore
    - _Requirements: 1.8, 8.2_

  - [x] 13.3 Create NotebookForm component
    - Form for creating/editing notebooks
    - Input fields for name, cover, description, paper style, font settings
    - Validation for required fields and ranges
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ] 13.4 Write unit tests for notebook form validation
    - Test name is required
    - Test font size and line height validation
    - _Requirements: 1.2, 4.3, 4.4_

- [ ] 14. Navigation controls UI
  - [x] 14.1 Create NavigationControls component
    - Previous/next page buttons
    - Page indicator (current/total)
    - Jump to date button
    - Table of contents button
    - Bookmarks button
    - _Requirements: 6.1, 6.2, 7.2, 7.3, 7.4_

  - [x] 14.2 Create TableOfContents component
    - Display list of all entries with dates and titles
    - Make entries clickable to navigate
    - Add virtual scrolling for performance
    - _Requirements: 7.3, 7.4_

  - [x] 14.3 Create BookmarkPanel component
    - Display bookmarked entries
    - Make entries clickable to navigate
    - _Requirements: 7.1, 7.5_

- [ ] 15. Search UI
  - [x] 15.1 Create SearchBar component
    - Input field with debounced search (300ms)
    - Display search results with date, title, snippet
    - Make results clickable to navigate
    - Show loading state during search
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 15.2 Write unit tests for search debouncing
    - Test search is debounced by 300ms
    - Test rapid typing doesn't trigger multiple searches
    - _Requirements: 8.1_

- [ ] 16. Accessibility features
  - [ ] 16.1 Add ARIA labels and roles to all interactive elements
    - Add labels to buttons, inputs, navigation controls
    - Add roles to custom components
    - Add descriptions for complex interactions
    - _Requirements: 10.1_

  - [ ] 16.2 Write property test for accessibility attributes presence
    - **Property 23: Accessibility Attributes Presence**
    - **Validates: Requirements 10.1**

  - [ ] 16.3 Implement keyboard navigation
    - Add keyboard shortcuts for all navigation actions
    - Add visible focus indicators
    - Add keyboard shortcut help panel
    - _Requirements: 10.4, 10.5_

  - [ ] 16.4 Write property test for keyboard navigation completeness
    - **Property 24: Keyboard Navigation Completeness**
    - **Validates: Requirements 10.5**

  - [ ] 16.5 Implement accessibility preferences
    - Add high contrast mode toggle
    - Add reduce motion mode toggle
    - Persist preferences in localStorage
    - _Requirements: 10.2, 10.3_

  - [ ] 16.6 Write unit tests for accessibility preferences
    - Test high contrast mode applies correct styles
    - Test reduce motion mode uses fade transitions
    - _Requirements: 10.2, 10.3_

- [ ] 17. Visual enhancements
  - [x] 17.1 Create BookCover component
    - Display notebook cover with color/image
    - Add book spine design
    - Add realistic shadows
    - _Requirements: 5.4_

  - [x] 17.2 Implement ambient sound system
    - Add audio player for background music/ambient sounds
    - Provide at least 3 sound options
    - Add volume control
    - Add enable/disable toggle
    - Persist preferences
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 17.3 Write unit tests for ambient sound controls
    - Test enable/disable toggles playback
    - Test volume control adjusts audio level
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 18. Caching and performance optimization
  - [ ] 18.1 Implement cache manager
    - Cache notebook settings in memory
    - Cache adjacent pages
    - Invalidate cache on CRUD operations
    - _Requirements: 9.4_

  - [ ] 18.2 Write property test for notebook settings caching
    - **Property 22: Notebook Settings Caching**
    - **Validates: Requirements 9.4**

  - [ ] 18.3 Optimize images and assets
    - Add responsive image loading
    - Compress paper textures
    - Lazy load fonts
    - _Requirements: 9.5_

- [ ] 19. Integration and wiring
  - [x] 19.1 Create NotebookReaderView component
    - Integrate all sub-components (pages, navigation, TOC, bookmarks)
    - Connect to stores
    - Handle loading and error states
    - _Requirements: All_

  - [x] 19.2 Create App routing
    - Route for notebook list view
    - Route for notebook reader view
    - Handle navigation between views
    - _Requirements: All_

  - [ ] 19.3 Add error boundaries
    - Catch and display errors gracefully
    - Add retry mechanisms
    - Log errors for debugging
    - _Requirements: Error Handling_

  - [ ] 19.4 Write integration tests
    - Test complete user flows (create notebook → add entry → navigate → search)
    - Test error scenarios
    - _Requirements: All_

- [ ] 20. Migration execution
  - [ ] 20.1 Create migration UI
    - Display migration progress
    - Show success/error messages
    - Handle migration on first login after upgrade
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 20.2 Test migration with sample data
    - Create test dataset with existing entries
    - Run migration
    - Verify all entries assigned to default notebook
    - Verify data preservation
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 21. Final checkpoint - Ensure all tests pass and feature is complete
  - Run full test suite (unit + property tests)
  - Test on desktop and mobile viewports
  - Test accessibility with screen reader
  - Verify performance (animations, loading times)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error conditions
- Checkpoints ensure incremental validation throughout implementation
- The implementation follows a bottom-up approach: data layer → services → state → UI → integration
- All property tests should run with minimum 100 iterations using fast-check library
