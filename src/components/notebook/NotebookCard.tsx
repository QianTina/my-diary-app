/**
 * NotebookCard Component
 * 
 * Displays a notebook card with name, cover, description, and action buttons.
 * Includes edit, delete, and archive functionality.
 * 
 * Requirements: 1.4, 1.5, 1.6, 1.7
 */

import React, { useState } from 'react';
import { Edit2, Trash2, Archive, BookOpen } from 'lucide-react';
import { PaperBackgroundWithInheritance } from './PaperBackgroundWithInheritance';
import { useFontSettings } from './FontProvider';
import type { Notebook } from '../../types/notebook';
import './NotebookCard.css';

/**
 * NotebookCard component props
 */
export interface NotebookCardProps {
  /** The notebook to display */
  notebook: Notebook;
  /** Callback when user clicks to open the notebook */
  onOpen?: (notebook: Notebook) => void;
  /** Callback when user clicks edit button */
  onEdit?: (notebook: Notebook) => void;
  /** Callback when user clicks delete button */
  onDelete?: (notebook: Notebook) => void;
  /** Callback when user clicks archive button */
  onArchive?: (notebook: Notebook) => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * NotebookCard component displays a notebook with its cover, name, description,
 * and action buttons (edit, delete, archive).
 * 
 * @example
 * ```tsx
 * <NotebookCard
 *   notebook={notebook}
 *   onOpen={(nb) => navigate(`/notebook/${nb.id}`)}
 *   onEdit={(nb) => setEditingNotebook(nb)}
 *   onDelete={(nb) => handleDelete(nb)}
 *   onArchive={(nb) => handleArchive(nb)}
 * />
 * ```
 */
export const NotebookCard: React.FC<NotebookCardProps> = ({
  notebook,
  onOpen,
  onEdit,
  onDelete,
  onArchive,
  className = '',
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleCardClick = () => {
    if (onOpen) {
      onOpen(notebook);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(notebook);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notebook);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(notebook);
    }
  };

  return (
    <div 
      className={`notebook-card ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      role="button"
      tabIndex={0}
      aria-label={`打开日记本: ${notebook.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Cover */}
      <div 
        className="notebook-card__cover"
        style={{
          backgroundColor: notebook.coverColor || '#f3f4f6',
          backgroundImage: notebook.coverImage ? `url(${notebook.coverImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="notebook-card__cover-overlay">
          <BookOpen className="notebook-card__cover-icon" size={32} />
          <h3 className="notebook-card__cover-title">{notebook.name}</h3>
        </div>
      </div>

      {/* Preview */}
      <div className="notebook-card__preview">
        <PaperBackgroundWithInheritance 
          notebook={notebook}
          className="notebook-card__preview-background"
        />
        <div className="notebook-card__preview-content">
          <p className="notebook-card__preview-text">
            {notebook.description || '暂无描述'}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="notebook-card__info">
        <div className="notebook-card__meta">
          <span className="notebook-card__meta-item">
            📄 {notebook.paperStyle}
          </span>
          <span className="notebook-card__meta-item">
            🔤 {notebook.fontFamily}
          </span>
          <span className="notebook-card__meta-item">
            📏 {notebook.fontSize}px
          </span>
        </div>
        
        {notebook.description && (
          <p className="notebook-card__description">
            {notebook.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div 
        className={`notebook-card__actions ${showActions ? 'notebook-card__actions--visible' : ''}`}
        role="group"
        aria-label="日记本操作"
      >
        {onEdit && (
          <button
            className="notebook-card__action notebook-card__action--edit"
            onClick={handleEdit}
            aria-label="编辑日记本"
            title="编辑"
          >
            <Edit2 size={16} />
          </button>
        )}
        
        {onArchive && (
          <button
            className="notebook-card__action notebook-card__action--archive"
            onClick={handleArchive}
            aria-label="归档日记本"
            title="归档"
          >
            <Archive size={16} />
          </button>
        )}
        
        {onDelete && (
          <button
            className="notebook-card__action notebook-card__action--delete"
            onClick={handleDelete}
            aria-label="删除日记本"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Archived badge */}
      {notebook.archived && (
        <div className="notebook-card__badge" aria-label="已归档">
          已归档
        </div>
      )}
    </div>
  );
};

export default NotebookCard;
