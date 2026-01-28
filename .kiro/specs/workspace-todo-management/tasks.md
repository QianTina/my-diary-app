# Implementation Plan: Workspace Todo Management

## Overview

This implementation plan breaks down the workspace todo management feature into incremental, testable steps. Each task builds on previous work, with property-based tests integrated throughout to catch errors early. The plan follows a bottom-up approach: database → services → state management → UI components → integration.

## Tasks

- [x] 1. Set up database schema and RLS policies
  - Create Supabase migration files for tasks, categories, and task_diary_links tables
  - Implement Row Level Security policies for user data isolation
  - Create database indexes for performance optimization
  - Add database constraints (CHECK, UNIQUE, FOREIGN KEY)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 1.1 Write property test for RLS policies
  - **Property 32: User Data Isolation**
  - **Property 33: Cross-User Access Denial**
  - **Property 34: Unauthenticated Access Denial**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.5**

- [x] 2. Create TypeScript types and interfaces
  - Define core types (Task, Category, TaskDiaryLink, TaskPriority, TaskStatus)
  - Define input types (CreateTaskInput, UpdateTaskInput, CreateCategoryInput)
  - Define filter and statistics types
  - Create extended types with relations (TaskWithCategory, TaskWithLinks)
  - _Requirements: All requirements (foundational)_

- [x] 3. Implement Task Service with validation
  - [x] 3.1 Create TaskService class with Supabase client integration
    - Implement createTask with title validation
    - Implement getTask and getTasks with user filtering
    - Implement updateTask with validation
    - Implement deleteTask
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 3.2 Write property tests for task CRUD operations
    - **Property 1: Task Creation with Valid Input**
    - **Property 2: Task Title Validation**
    - **Property 3: Task Update Persistence**
    - **Property 4: Task Deletion**
    - **Property 5: Task Description Storage**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.2**

  - [x] 3.3 Implement task status operations
    - Implement completeTask (set status and completed_at)
    - Implement uncompleteTask (clear completed_at)
    - _Requirements: 5.1, 5.2_

  - [ ]* 3.4 Write property tests for task completion
    - **Property 19: Task Completion with Timestamp**
    - **Property 20: Task Uncompletion Round Trip**
    - **Property 21: Completion Preserves Task Properties**
    - **Validates: Requirements 5.1, 5.2, 5.4**

- [x] 4. Implement Category Service
  - [x] 4.1 Create category CRUD operations
    - Implement createCategory with name validation
    - Implement getCategories with user filtering
    - Implement updateCategory
    - Implement deleteCategory with cascade to tasks
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7_

  - [ ]* 4.2 Write property tests for category operations
    - **Property 6: Category Creation and User Association**
    - **Property 7: Category Name Validation**
    - **Property 8: Task-Category Association**
    - **Property 9: Category Deletion Cascades to Tasks**
    - **Property 10: Task Category Cardinality**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.7**

- [x] 5. Implement priority and due date handling
  - [x] 5.1 Add priority validation and sorting
    - Validate priority values (high, medium, low)
    - Implement priority-based sorting
    - Set default priority to medium
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 5.2 Write property tests for priority handling
    - **Property 11: Priority Validation**
    - **Property 12: Priority Sorting**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

  - [x] 5.3 Add due date validation and handling
    - Validate ISO 8601 date format
    - Implement due date sorting
    - Implement overdue detection logic
    - Allow null due dates
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 5.4 Write property tests for due date handling
    - **Property 13: Due Date ISO 8601 Format**
    - **Property 14: Due Date Clearing**
    - **Property 15: Due Date Sorting**
    - **Property 16: Overdue Task Detection**
    - **Property 17: Tasks Without Due Dates**
    - **Property 18: Invalid Date Rejection**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

- [ ] 6. Checkpoint - Ensure all service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement task filtering and search
  - [ ] 7.1 Create filter logic in TaskService
    - Implement status filtering
    - Implement priority filtering
    - Implement category filtering
    - Implement due date filtering (overdue, today, week, month)
    - Implement search query matching (title and description)
    - Implement combined filter logic (AND)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 7.2 Write property tests for filtering
    - **Property 22: Combined Filter Logic**
    - **Property 23: Filter Clearing**
    - **Property 24: Search Query Matching**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

- [ ] 8. Implement task statistics
  - [ ] 8.1 Create statistics calculation in TaskService
    - Calculate total, completed, incomplete, overdue counts
    - Calculate completion rate percentage
    - Group statistics by priority and category
    - Support date range filtering for statistics
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [ ]* 8.2 Write property tests for statistics
    - **Property 36: Task Statistics Accuracy**
    - **Property 37: Statistics Date Range Filtering**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6**

- [ ] 9. Implement diary link operations
  - [ ] 9.1 Create diary link CRUD in TaskService
    - Implement linkTaskToDiary (create bidirectional link)
    - Implement unlinkTaskFromDiary
    - Implement getTasksForDiaryEntry
    - Handle diary deletion (cascade delete links, preserve tasks)
    - Support multiple diary links per task
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 9.2 Write property tests for diary links
    - **Property 28: Task-Diary Link Creation**
    - **Property 29: Task-Diary Link Deletion**
    - **Property 30: Diary Deletion Preserves Tasks**
    - **Property 31: Task Multiple Diary Links**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

- [ ] 10. Checkpoint - Ensure all service and integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Create Zustand store for task state management
  - [x] 11.1 Implement task store with actions
    - Create store with state (tasks, categories, filters, viewMode, selectedTask)
    - Implement loadTasks and loadCategories actions
    - Implement createTask, updateTask, deleteTask actions with optimistic updates
    - Implement completeTask and uncompleteTask actions
    - Implement category CRUD actions
    - Add error handling and loading states
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 5.1, 5.2_

  - [x] 11.2 Implement filter and view state management
    - Implement setFilters and clearFilters actions
    - Implement setViewMode action
    - Implement getFilteredTasks computed selector
    - Implement getStatistics computed selector
    - Preserve filters when switching views
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.3_

  - [ ]* 11.3 Write property tests for store state management
    - **Property 25: View Mode Filter Preservation**
    - **Property 38: Cache Invalidation on Update**
    - **Property 39: Task Persistence**
    - **Validates: Requirements 7.3, 15.5, 16.1**

  - [x] 11.4 Add persistence middleware
    - Use Zustand persist middleware for filters and viewMode
    - Store to localStorage
    - _Requirements: 15.4_

- [x] 12. Create base UI components
  - [x] 12.1 Create TaskCard component
    - Display task title, description, priority, status, due date, category
    - Show completion checkbox
    - Show priority badge with color coding
    - Show category badge
    - Show due date with overdue indicator
    - Add edit and delete action buttons
    - Support dark/light theme
    - Add ARIA labels for accessibility
    - _Requirements: 5.3, 11.4, 11.5, 11.6, 12.1, 12.2, 12.3, 12.4_

  - [ ]* 12.2 Write unit tests for TaskCard
    - Test rendering with various task properties
    - Test completion checkbox interaction
    - Test edit and delete button clicks
    - Test accessibility (ARIA labels, keyboard navigation)
    - _Requirements: 5.3, 11.4, 11.5, 11.6_

  - [x] 12.3 Create TaskForm component
    - Create form for task creation and editing
    - Add title input with validation
    - Add description textarea
    - Add priority select dropdown
    - Add category select dropdown
    - Add due date picker
    - Show validation errors
    - Support bilingual labels (Chinese/English)
    - Add ARIA labels and error announcements
    - _Requirements: 1.1, 1.3, 1.5, 1.6, 3.1, 3.5, 4.1, 4.6, 11.4, 11.5, 13.1, 13.2_

  - [ ]* 12.4 Write unit tests for TaskForm
    - Test form validation
    - Test form submission
    - Test error display
    - Test accessibility
    - _Requirements: 1.6, 3.5, 4.6, 11.4, 11.5_

- [x] 13. Create filter and search components
  - [x] 13.1 Create TaskFilters component
    - Create status filter dropdown
    - Create priority filter dropdown
    - Create category filter dropdown
    - Create due date filter dropdown
    - Create search input with debouncing (300ms)
    - Add clear filters button
    - Support bilingual labels
    - Make responsive for mobile/tablet/desktop
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 11.1, 11.2, 11.3, 13.1, 13.2_

  - [ ]* 13.2 Write unit tests for TaskFilters
    - Test filter selection
    - Test search input debouncing
    - Test clear filters
    - Test responsive layout
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7_

- [-] 14. Create task list and kanban views
  - [x] 14.1 Create TaskListView component
    - Display tasks in vertical list format
    - Use virtual scrolling for > 50 tasks
    - Show all task properties in compact format
    - Support sorting (priority, due date)
    - Show empty state when no tasks
    - Make responsive for mobile/tablet/desktop
    - _Requirements: 7.1, 7.4, 11.1, 11.2, 11.3, 15.3_

  - [ ]* 14.2 Write unit tests for TaskListView
    - Test task rendering
    - Test empty state
    - Test sorting
    - Test responsive layout
    - _Requirements: 7.1, 7.4, 11.1, 11.2, 11.3_

  - [ ] 14.3 Create TaskKanbanView component
    - Display tasks in columns (by priority or status)
    - Implement drag-and-drop with react-beautiful-dnd or dnd-kit
    - Update task priority/status on drop
    - Show task count per column
    - Make responsive (single column on mobile, multiple on desktop)
    - _Requirements: 7.2, 7.5, 11.1, 11.2, 11.3_

  - [ ]* 14.4 Write unit tests for TaskKanbanView
    - Test column rendering
    - Test drag-and-drop logic
    - Test responsive layout
    - _Requirements: 7.2, 7.5, 11.1, 11.2, 11.3_

- [x] 15. Create main task management page
  - [x] 15.1 Create TaskManagementPage component
    - Create page header with title (bilingual)
    - Add "New Task" button
    - Add view mode toggle (List/Kanban)
    - Add statistics button/panel
    - Integrate TaskFilters component
    - Conditionally render TaskListView or TaskKanbanView
    - Handle loading and error states
    - Make fully responsive
    - _Requirements: 7.1, 7.2, 7.3, 11.1, 11.2, 11.3, 13.1, 13.2, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [ ]* 15.2 Write integration tests for TaskManagementPage
    - Test task creation flow
    - Test task editing flow
    - Test task deletion flow
    - Test filter application
    - Test view switching
    - _Requirements: 1.1, 1.3, 1.4, 6.6, 7.3_

- [x] 16. Create category management UI
  - [x] 16.1 Create CategoryManager component
    - Display list of categories
    - Add "New Category" button and form
    - Show category color picker
    - Add edit and delete actions
    - Show task count per category
    - Support bilingual labels
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 13.1, 13.2_

  - [ ]* 16.2 Write unit tests for CategoryManager
    - Test category creation
    - Test category editing
    - Test category deletion
    - Test validation
    - _Requirements: 2.1, 2.4, 2.7_

- [ ] 17. Checkpoint - Ensure all UI tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Implement calendar integration
  - [x] 18.1 Integrate tasks into calendar view
    - Fetch tasks with due dates for calendar display
    - Display tasks on calendar dates with priority indicators
    - Handle task click to show details
    - Support task creation from calendar date
    - Update calendar when task due dates change
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 18.2 Write property tests for calendar integration
    - **Property 26: Calendar Task Display**
    - **Property 27: Calendar Task Creation**
    - **Validates: Requirements 8.1, 8.3**

  - [ ]* 18.3 Write integration tests for calendar
    - Test task display on calendar
    - Test task creation from calendar
    - Test task update reflects in calendar
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 19. Implement diary entry integration
  - [x] 19.1 Add task linking to diary entries
    - Add "Link Task" button in diary entry view
    - Show linked tasks in diary entry
    - Support unlinking tasks
    - Add "Link to Diary" button in task view
    - Show linked diary entries in task details
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 19.2 Write integration tests for diary links
    - Test linking task to diary
    - Test unlinking task from diary
    - Test viewing linked tasks from diary
    - Test viewing linked diaries from task
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 20. Implement task statistics dashboard
  - [x] 20.1 Create TaskStats component
    - Display total, completed, incomplete, overdue counts
    - Display completion rate with progress bar
    - Show statistics by priority (chart or list)
    - Show statistics by category (chart or list)
    - Add date range filter for statistics
    - Support bilingual labels
    - Make responsive
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 13.1, 13.2_

  - [ ]* 20.2 Write unit tests for TaskStats
    - Test statistics display
    - Test date range filtering
    - Test responsive layout
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [ ] 21. Add internationalization (i18n)
  - [ ] 21.1 Set up i18next configuration
    - Install i18next and react-i18next
    - Create translation files (en.json, zh.json)
    - Configure language detection
    - Set up fallback to English
    - Add language switcher component
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ] 21.2 Add translations for all UI text
    - Translate task management page
    - Translate forms and validation messages
    - Translate filters and buttons
    - Translate statistics labels
    - Translate error messages
    - _Requirements: 13.1, 13.2_

  - [ ]* 21.3 Write property test for language switching
    - **Property 35: Language Switch Preserves Task Content**
    - **Validates: Requirements 13.4**

- [ ] 22. Implement error handling and retry logic
  - [ ] 22.1 Add error handling to TaskService
    - Implement retry logic with exponential backoff (3 attempts)
    - Handle network errors
    - Handle validation errors
    - Handle RLS policy violations
    - Return structured error responses
    - _Requirements: 16.2, 16.3_

  - [ ] 22.2 Add error display to UI
    - Create ErrorMessage component
    - Display validation errors in forms
    - Display network errors with retry option
    - Display user-friendly error messages (bilingual)
    - Log errors for debugging
    - _Requirements: 16.2, 16.3_

  - [ ]* 22.3 Write unit tests for error handling
    - Test retry logic
    - Test error message display
    - Test error recovery
    - _Requirements: 16.2, 16.3_

- [ ] 23. Add performance optimizations
  - [ ] 23.1 Implement caching in Zustand store
    - Cache task list with 5-minute TTL
    - Cache categories
    - Invalidate cache on mutations
    - _Requirements: 15.4, 15.5_

  - [ ] 23.2 Optimize React components
    - Add React.memo to TaskCard
    - Use useMemo for filtered tasks
    - Use useCallback for event handlers
    - Implement virtual scrolling in TaskListView
    - Debounce search input (300ms)
    - _Requirements: 15.1, 15.2, 15.3_

  - [ ]* 23.3 Write performance tests
    - Test initial load time
    - Test large task list rendering
    - Test filter performance
    - _Requirements: 15.1, 15.2, 15.3_

- [ ] 24. Add accessibility improvements
  - [ ] 24.1 Enhance keyboard navigation
    - Add keyboard shortcuts (n for new task, / for search, etc.)
    - Ensure all interactive elements are keyboard accessible
    - Add focus management for modals and forms
    - Add skip links
    - _Requirements: 11.4_

  - [ ] 24.2 Enhance screen reader support
    - Add ARIA labels to all interactive elements
    - Add ARIA live regions for dynamic updates
    - Use semantic HTML throughout
    - Add descriptive alt text for icons
    - _Requirements: 11.5_

  - [ ]* 24.3 Run accessibility audits
    - Run axe-core automated tests
    - Test with screen readers (NVDA, JAWS, VoiceOver)
    - Test keyboard navigation
    - Verify WCAG AA compliance
    - _Requirements: 11.4, 11.5, 11.6_

- [ ] 25. Final checkpoint - End-to-end testing
  - [ ] 25.1 Run full test suite
    - Run all unit tests
    - Run all property-based tests
    - Run all integration tests
    - Verify test coverage > 80%
    - _Requirements: All requirements_

  - [ ] 25.2 Manual testing checklist
    - Test task creation, editing, deletion
    - Test category management
    - Test filtering and search
    - Test calendar integration
    - Test diary integration
    - Test statistics
    - Test theme switching
    - Test language switching
    - Test responsive layouts (mobile, tablet, desktop)
    - Test accessibility
    - _Requirements: All requirements_

  - [ ] 25.3 Performance verification
    - Test with 100+ tasks
    - Verify initial load < 2 seconds
    - Verify operation feedback < 100ms
    - Test on mobile devices
    - _Requirements: 15.1, 15.2_

- [ ] 26. Documentation and cleanup
  - [ ] 26.1 Add code documentation
    - Document TaskService methods with JSDoc
    - Document Zustand store actions
    - Document component props with TypeScript
    - Add README for task management feature
    - _Requirements: All requirements_

  - [ ] 26.2 Code cleanup
    - Remove console.logs
    - Remove unused imports
    - Format code with Prettier
    - Run ESLint and fix issues
    - _Requirements: All requirements_

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP development
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities to address issues
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples, edge cases, and UI interactions
- Integration tests validate end-to-end user flows
- The implementation follows a bottom-up approach: database → services → state → UI → integration
- All UI components must support dark/light themes and bilingual text (Chinese/English)
- All interactive components must be keyboard accessible and screen reader friendly
