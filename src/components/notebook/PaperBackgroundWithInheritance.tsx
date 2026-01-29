/**
 * PaperBackgroundWithInheritance Component
 * 
 * Enhanced version of PaperBackground that automatically resolves paper style
 * from entry override or notebook default using the usePaperStyle hook.
 * 
 * This component implements:
 * - Property 10: Paper Style Inheritance
 * - Property 11: Paper Style Override
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import React from 'react';
import { usePaperStyle } from '../../hooks/usePaperStyle';
import { PaperBackground } from './PaperBackground';
import type { DiaryEntry, Notebook } from '../../types/notebook';

interface PaperBackgroundWithInheritanceProps {
  /** The diary entry (optional) - if provided and has paperStyle, it overrides notebook default */
  entry?: DiaryEntry | null;
  /** The notebook - provides default paper style */
  notebook?: Notebook | null;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * PaperBackgroundWithInheritance component automatically resolves the effective
 * paper style using inheritance rules:
 * 1. If entry has explicit paperStyle, use it (override)
 * 2. Otherwise, use notebook's default paperStyle (inheritance)
 * 3. If neither exists, fallback to 'blank'
 */
export const PaperBackgroundWithInheritance: React.FC<PaperBackgroundWithInheritanceProps> = ({
  entry,
  notebook,
  className,
}) => {
  // Resolve effective paper style using inheritance hook
  const paperStyle = usePaperStyle(entry, notebook);
  
  return (
    <PaperBackground 
      paperStyle={paperStyle} 
      className={className}
    />
  );
};

export default PaperBackgroundWithInheritance;
