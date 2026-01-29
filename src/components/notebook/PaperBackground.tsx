/**
 * PaperBackground Component
 * 
 * Renders paper background patterns with texture overlay for the diary notebook.
 * Supports multiple paper styles: blank, lined, grid, dotted, and vintage.
 * 
 * Requirements: 3.1, 3.4
 */

import React from 'react';
import type { PaperStyle } from '../../types/notebook';
import './PaperBackground.css';

interface PaperBackgroundProps {
  /** The paper style to render */
  paperStyle: PaperStyle;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * PaperBackground component renders SVG patterns for different paper styles
 * with a subtle paper texture overlay.
 */
export const PaperBackground: React.FC<PaperBackgroundProps> = ({
  paperStyle,
  className = '',
}) => {
  return (
    <div className={`paper-background paper-background--${paperStyle} ${className}`}>
      <svg className="paper-background__pattern" width="100%" height="100%">
        <defs>
          {/* Lined paper pattern */}
          <pattern
            id="lined-pattern"
            x="0"
            y="0"
            width="100%"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="31"
              x2="100%"
              y2="31"
              stroke="#d1d5db"
              strokeWidth="1"
            />
          </pattern>

          {/* Grid paper pattern */}
          <pattern
            id="grid-pattern"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="24"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="0"
              x2="24"
              y2="0"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </pattern>

          {/* Dotted paper pattern */}
          <pattern
            id="dotted-pattern"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="1" fill="#d1d5db" />
          </pattern>

          {/* Vintage paper pattern - combination of lines and texture */}
          <pattern
            id="vintage-pattern"
            x="0"
            y="0"
            width="100%"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="35"
              x2="100%"
              y2="35"
              stroke="#c4b5a0"
              strokeWidth="1"
              opacity="0.6"
            />
          </pattern>

          {/* Paper texture noise filter */}
          <filter id="paper-texture">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              result="noise"
            />
            <feDiffuseLighting
              in="noise"
              lightingColor="#f9f7f4"
              surfaceScale="1"
              result="light"
            >
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feComposite
              in="SourceGraphic"
              in2="light"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="0"
              k4="0"
            />
          </filter>
        </defs>

        {/* Render the appropriate pattern based on paperStyle */}
        {paperStyle === 'lined' && (
          <rect width="100%" height="100%" fill="url(#lined-pattern)" />
        )}
        {paperStyle === 'grid' && (
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        )}
        {paperStyle === 'dotted' && (
          <rect width="100%" height="100%" fill="url(#dotted-pattern)" />
        )}
        {paperStyle === 'vintage' && (
          <rect width="100%" height="100%" fill="url(#vintage-pattern)" />
        )}
        {paperStyle === 'blank' && (
          <rect width="100%" height="100%" fill="transparent" />
        )}
      </svg>

      {/* Paper texture overlay */}
      <div className="paper-background__texture" aria-hidden="true" />
    </div>
  );
};

export default PaperBackground;
