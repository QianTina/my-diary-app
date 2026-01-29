/**
 * NotebookListView Component
 * 
 * Displays notebooks in list or grid layout with search and create functionality.
 * Integrates with NotebookStore for state management.
 * 
 * Requirements: 1.8, 8.2
 */

import React, { useState, useEffect } from 'react';
import { Plus, Grid, List, Search } from 'lucide-react';
import { NotebookCard } from './NotebookCard';
import { useNotebookStore } from '../../store/notebookStore';
import type { Notebook } from '../../types/notebook';
import './NotebookListView.css';

/**
 * NotebookListView component props
 */
export interface NotebookListViewProps {
  /** Callback when user clicks to create a new notebook */
  onCreateNotebook?: () => void;
  /** Callback when user clicks to open a notebook */
  onOpenNotebook?: (notebook: Notebook) => void;
  /** Callback when user clicks to edit a notebook */
  onEditNotebook?: (notebook: Notebook) => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * NotebookListView component displays all notebooks in list or grid layout
 * with search, filter, and create functionality.
 * 
 * @example
 * ```tsx
 * <NotebookListView
 *   onCreateNotebook={() => setShowCreateForm(true)}
 *   onOpenNotebook={(nb) => navigate(`/notebook/${nb.id}`)}
 *   onEditNotebook={(nb) => setEditingNotebook(nb)}
 * />
 * ```
 */
export const NotebookListView: React.FC<NotebookListViewProps> = ({
  onCreateNotebook,
  onOpenNotebook,
  onEditNotebook,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { 
    notebooks, 
    loading, 
    error, 
    fetchNotebooks, 
    deleteNotebook, 
    archiveNotebook 
  } = useNotebookStore();

  // Fetch notebooks on mount
  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);

  // Filter notebooks based on search query
  const filteredNotebooks = notebooks.filter(notebook => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      notebook.name.toLowerCase().includes(query) ||
      notebook.description?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (notebook: Notebook) => {
    if (showDeleteConfirm === notebook.id) {
      try {
        await deleteNotebook(notebook.id);
        setShowDeleteConfirm(null);
      } catch (error) {
        console.error('Failed to delete notebook:', error);
      }
    } else {
      setShowDeleteConfirm(notebook.id);
      // Auto-cancel after 3 seconds
      setTimeout(() => {
        setShowDeleteConfirm(null);
      }, 3000);
    }
  };

  const handleArchive = async (notebook: Notebook) => {
    try {
      await archiveNotebook(notebook.id);
    } catch (error) {
      console.error('Failed to archive notebook:', error);
    }
  };

  return (
    <div className={`notebook-list-view ${className}`}>
      {/* Header */}
      <div className="notebook-list-view__header">
        <div className="notebook-list-view__title-section">
          <h1 className="notebook-list-view__title">我的日记本</h1>
          <p className="notebook-list-view__subtitle">
            共 {filteredNotebooks.length} 个日记本
          </p>
        </div>

        <div className="notebook-list-view__actions">
          {/* Search bar */}
          <div className="notebook-list-view__search">
            <Search className="notebook-list-view__search-icon" size={20} />
            <input
              type="text"
              className="notebook-list-view__search-input"
              placeholder="搜索日记本..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="搜索日记本"
            />
          </div>

          {/* View mode toggle */}
          <div className="notebook-list-view__view-toggle" role="group" aria-label="视图模式">
            <button
              className={`notebook-list-view__view-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="网格视图"
              title="网格视图"
            >
              <Grid size={20} />
            </button>
            <button
              className={`notebook-list-view__view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="列表视图"
              title="列表视图"
            >
              <List size={20} />
            </button>
          </div>

          {/* Create button */}
          {onCreateNotebook && (
            <button
              className="notebook-list-view__create-button"
              onClick={onCreateNotebook}
              aria-label="创建新日记本"
            >
              <Plus size={20} />
              <span>创建日记本</span>
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="notebook-list-view__error" role="alert">
          <p>加载失败: {error}</p>
          <button onClick={() => fetchNotebooks()}>重试</button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="notebook-list-view__loading" role="status" aria-live="polite">
          <div className="notebook-list-view__spinner" />
          <p>加载中...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredNotebooks.length === 0 && (
        <div className="notebook-list-view__empty">
          {searchQuery ? (
            <>
              <p>没有找到匹配的日记本</p>
              <button onClick={() => setSearchQuery('')}>清除搜索</button>
            </>
          ) : (
            <>
              <p>还没有日记本</p>
              {onCreateNotebook && (
                <button onClick={onCreateNotebook}>创建第一个日记本</button>
              )}
            </>
          )}
        </div>
      )}

      {/* Notebooks grid/list */}
      {!loading && filteredNotebooks.length > 0 && (
        <div 
          className={`notebook-list-view__grid ${viewMode === 'list' ? 'notebook-list-view__grid--list' : ''}`}
          role="list"
        >
          {filteredNotebooks.map((notebook) => (
            <div key={notebook.id} role="listitem">
              <NotebookCard
                notebook={notebook}
                onOpen={onOpenNotebook}
                onEdit={onEditNotebook}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
              
              {/* Delete confirmation */}
              {showDeleteConfirm === notebook.id && (
                <div className="notebook-list-view__delete-confirm">
                  <p>再次点击删除按钮确认删除</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotebookListView;
