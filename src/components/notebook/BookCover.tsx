/**
 * BookCover Component
 * 
 * Displays notebook cover with color/image, book spine design, and realistic shadows.
 * Creates a 3D book appearance for the notebook.
 * 
 * Requirements: 5.4
 */

import React from 'react';
import type { Notebook } from '../../types/notebook';
import './BookCover.css';

/**
 * BookCover component props
 */
export interface BookCoverProps {
  /** Notebook data */
  notebook: Notebook;
  /** Whether to show the spine */
  showSpine?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Optional className for additional styling */
  className?: string;
  /** Callback when cover is clicked */
  onClick?: () => void;
}

/**
 * BookCover component displays a realistic book cover
 * 
 * @example
 * ```tsx
 * <BookCover
 *   notebook={notebook}
 *   showSpine={true}
 *   size="medium"
 *   onClick={() => openNotebook(notebook.id)}
 * />
 * ```
 */
export const BookCover: React.FC<BookCoverProps> = ({
  notebook,
  showSpine = false,
  size = 'medium',
  className = '',
  onClick,
}) => {
  const coverStyle: React.CSSProperties = {
    backgroundColor: notebook.coverColor || '#8B7355',
    backgroundImage: notebook.coverImage ? `url(${notebook.coverImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div 
      className={`book-cover book-cover--${size} ${className} ${onClick ? 'book-cover--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Book spine (left side) */}
      {showSpine && (
        <div className="book-cover__spine" style={{ backgroundColor: notebook.coverColor || '#8B7355' }}>
          <div className="book-cover__spine-text">
            {notebook.name}
          </div>
        </div>
      )}

      {/* Front cover */}
      <div className="book-cover__front" style={coverStyle}>
        {/* Cover overlay for texture */}
        <div className="book-cover__texture" />
        
        {/* Cover content */}
        <div className="book-cover__content">
          <div className="book-cover__title">
            {notebook.name}
          </div>
          {notebook.description && (
            <div className="book-cover__description">
              {notebook.description}
            </div>
          )}
        </div>

        {/* Cover shine effect */}
        <div className="book-cover__shine" />
      </div>

      {/* Book pages edge (right side) */}
      <div className="book-cover__pages">
        {/* Multiple page layers for depth */}
        <div className="book-cover__page-layer" />
        <div className="book-cover__page-layer" />
        <div className="book-cover__page-layer" />
      </div>
    </div>
  );
};

export default BookCover;
