/**
 * NotebookReaderPage
 * 
 * Main page for reading a notebook with all integrated features:
 * - Page display (single/spread)
 * - Navigation controls
 * - Table of contents
 * - Bookmarks
 * - Search
 * - Ambient sound
 * 
 * Requirements: All
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PageSpread, 
  SinglePage, 
  NavigationControls,
  TableOfContents,
  BookmarkPanel,
  SearchBar,
  AmbientSoundPlayer,
  FontProvider,
} from '../components/notebook';
import { useNotebookStore } from '../store/notebookStore';
import { useEntryStore } from '../store/entryStore';
import { useUIStore } from '../store/uiStore';
import { useGestureHandlers } from '../hooks/useGestureHandlers';
import type { TOCEntry, BookmarkEntry, SearchResult } from '../components/notebook';
import './NotebookReaderPage.css';

/**
 * NotebookReaderPage component
 */
export const NotebookReaderPage: React.FC = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const navigate = useNavigate();

  const { notebooks, fetchNotebooks, loading: notebooksLoading } = useNotebookStore();
  const { entries, fetchEntriesForNotebook, searchEntries, loading: entriesLoading } = useEntryStore();
  const { 
    paginationState, 
    navigateNext, 
    navigatePrevious,
    navigateToPage,
    toggleTableOfContents,
    toggleBookmarks,
  } = useUIStore();

  const [showTOC, setShowTOC] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Get current notebook
  const notebook = notebooks.find(nb => nb.id === notebookId);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch data
  useEffect(() => {
    if (!notebookId) return;
    
    fetchNotebooks();
    fetchEntriesForNotebook(notebookId);
  }, [notebookId, fetchNotebooks, fetchEntriesForNotebook]);

  // Gesture handlers
  const { ref: gestureRef } = useGestureHandlers({
    onSwipeLeft: navigateNext,
    onSwipeRight: navigatePrevious,
    onArrowLeft: navigatePrevious,
    onArrowRight: navigateNext,
  });

  // Handle search
  const handleSearch = async (query: string): Promise<SearchResult[]> => {
    if (!notebookId) return [];
    return await searchEntries(query, notebookId);
  };

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    // Navigate to the entry's page
    // In a real implementation, this would calculate the correct page number
    console.log('Navigate to entry:', result.id);
  };

  // Handle TOC entry click
  const handleTOCEntryClick = (entry: TOCEntry) => {
    navigateToPage(entry.pageNumber);
    setShowTOC(false);
  };

  // Handle bookmark entry click
  const handleBookmarkEntryClick = (entry: BookmarkEntry) => {
    navigateToPage(entry.pageNumber);
    setShowBookmarks(false);
  };

  // Loading state
  if (notebooksLoading || entriesLoading) {
    return (
      <div className="notebook-reader-page notebook-reader-page--loading">
        <div className="notebook-reader-page__spinner" />
        <p>加载中...</p>
      </div>
    );
  }

  // Error state - notebook not found
  if (!notebook) {
    return (
      <div className="notebook-reader-page notebook-reader-page--error">
        <h2>日记本未找到</h2>
        <p>请检查链接是否正确</p>
        <button onClick={() => navigate('/notebooks')}>返回日记本列表</button>
      </div>
    );
  }

  // Get current pages
  const { currentPage, totalPages, visiblePages } = paginationState;
  const leftPage = visiblePages.find(p => p.side === 'left');
  const rightPage = visiblePages.find(p => p.side === 'right');

  return (
    <FontProvider
      fontFamily={notebook.fontFamily}
      fontSize={notebook.fontSize}
      lineHeight={notebook.lineHeight}
    >
      <div className="notebook-reader-page" ref={gestureRef}>
        {/* Header */}
        <div className="notebook-reader-page__header">
          <button
            className="notebook-reader-page__back"
            onClick={() => navigate('/notebooks')}
            aria-label="返回"
          >
            ← 返回
          </button>

          <h1 className="notebook-reader-page__title">{notebook.name}</h1>

          <div className="notebook-reader-page__actions">
            <SearchBar
              onSearch={handleSearch}
              onResultClick={handleSearchResultClick}
              placeholder="搜索日记..."
            />
            <AmbientSoundPlayer />
          </div>
        </div>

        {/* Main content */}
        <div className="notebook-reader-page__content">
          {entries.length === 0 ? (
            <div className="notebook-reader-page__empty">
              <p>这个日记本还没有条目</p>
              <button onClick={() => navigate(`/write?notebookId=${notebookId}`)}>
                写第一篇日记
              </button>
            </div>
          ) : (
            <>
              {isMobile ? (
                <SinglePage
                  page={leftPage || rightPage}
                  paperStyle={notebook.paperStyle}
                />
              ) : (
                <PageSpread
                  leftPage={leftPage}
                  rightPage={rightPage}
                  paperStyle={notebook.paperStyle}
                />
              )}
            </>
          )}
        </div>

        {/* Navigation controls */}
        {entries.length > 0 && (
          <NavigationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={navigatePrevious}
            onNextPage={navigateNext}
            onShowTableOfContents={() => setShowTOC(true)}
            onShowBookmarks={() => setShowBookmarks(true)}
            canGoPrevious={currentPage > 1}
            canGoNext={currentPage < totalPages}
          />
        )}

        {/* Table of contents */}
        {showTOC && (
          <TableOfContents
            entries={entries}
            currentPage={currentPage}
            onEntryClick={handleTOCEntryClick}
            onClose={() => setShowTOC(false)}
          />
        )}

        {/* Bookmarks */}
        {showBookmarks && (
          <BookmarkPanel
            entries={entries}
            currentPage={currentPage}
            onEntryClick={handleBookmarkEntryClick}
            onClose={() => setShowBookmarks(false)}
          />
        )}
      </div>
    </FontProvider>
  );
};

export default NotebookReaderPage;
