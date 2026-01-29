/**
 * FontProvider Component
 * 
 * Provides font settings context for diary notebook entries.
 * Loads font families and applies font settings from notebook configuration.
 * 
 * Requirements: 4.1, 4.2
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { Notebook } from '../../types/notebook';
import { FONT_FAMILIES, FONT_SIZE_RANGE, LINE_HEIGHT_RANGE } from '../../types/notebook';

/**
 * Font settings interface
 */
export interface FontSettings {
  /** Font family name */
  fontFamily: string;
  /** Font size in pixels (12-24) */
  fontSize: number;
  /** Line height (1.2-2.0) */
  lineHeight: number;
  /** CSS font-family value */
  fontFamilyCSS: string;
}

/**
 * Font context interface
 */
interface FontContextValue {
  /** Current font settings */
  settings: FontSettings;
  /** Whether fonts are loaded */
  fontsLoaded: boolean;
}

/**
 * Font Context
 */
const FontContext = createContext<FontContextValue | undefined>(undefined);

/**
 * FontProvider Props
 */
interface FontProviderProps {
  /** The notebook providing font settings */
  notebook?: Notebook | null;
  /** Child components */
  children: React.ReactNode;
}

/**
 * Get CSS font-family value from font family name
 */
function getFontFamilyCSS(fontFamily: string): string {
  return FONT_FAMILIES[fontFamily as keyof typeof FONT_FAMILIES] || FONT_FAMILIES.system;
}

/**
 * Validate and clamp font size to valid range
 */
function validateFontSize(size: number): number {
  return Math.max(
    FONT_SIZE_RANGE.min,
    Math.min(FONT_SIZE_RANGE.max, size)
  );
}

/**
 * Validate and clamp line height to valid range
 */
function validateLineHeight(height: number): number {
  return Math.max(
    LINE_HEIGHT_RANGE.min,
    Math.min(LINE_HEIGHT_RANGE.max, height)
  );
}

/**
 * FontProvider component provides font settings context to child components.
 * It loads font families and applies settings from the notebook configuration.
 * 
 * @example
 * ```tsx
 * <FontProvider notebook={activeNotebook}>
 *   <EntryContent entry={entry} />
 * </FontProvider>
 * ```
 */
export const FontProvider: React.FC<FontProviderProps> = ({ notebook, children }) => {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  // Extract and validate font settings from notebook
  const settings = useMemo<FontSettings>(() => {
    const fontFamily = notebook?.fontFamily || 'system';
    const fontSize = validateFontSize(notebook?.fontSize || FONT_SIZE_RANGE.default);
    const lineHeight = validateLineHeight(notebook?.lineHeight || LINE_HEIGHT_RANGE.default);
    const fontFamilyCSS = getFontFamilyCSS(fontFamily);

    return {
      fontFamily,
      fontSize,
      lineHeight,
      fontFamilyCSS,
    };
  }, [notebook?.fontFamily, notebook?.fontSize, notebook?.lineHeight]);

  // Load fonts when component mounts
  useEffect(() => {
    // Check if document.fonts API is available
    if (!document.fonts) {
      setFontsLoaded(true);
      return;
    }

    // Load all font families
    const fontFamiliesToLoad = [
      // Handwriting fonts
      new FontFace('Caveat', 'url(https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap)'),
      new FontFace('Dancing Script', 'url(https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap)'),
      // Serif fonts
      new FontFace('Merriweather', 'url(https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap)'),
      new FontFace('Georgia', 'local("Georgia")'),
      // Sans-serif fonts
      new FontFace('Inter', 'url(https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap)'),
    ];

    // Wait for fonts to load
    Promise.all(
      fontFamiliesToLoad.map(font => 
        font.load().catch(err => {
          console.warn('Failed to load font:', font.family, err);
          return null;
        })
      )
    ).then(() => {
      setFontsLoaded(true);
    });

    // Alternative: Use document.fonts.ready
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  // Create context value
  const contextValue = useMemo<FontContextValue>(
    () => ({
      settings,
      fontsLoaded,
    }),
    [settings, fontsLoaded]
  );

  return (
    <FontContext.Provider value={contextValue}>
      {children}
    </FontContext.Provider>
  );
};

/**
 * Hook to access font settings from context
 * 
 * @throws Error if used outside FontProvider
 * 
 * @example
 * ```tsx
 * function EntryContent() {
 *   const { settings, fontsLoaded } = useFontContext();
 *   
 *   return (
 *     <div style={{
 *       fontFamily: settings.fontFamilyCSS,
 *       fontSize: `${settings.fontSize}px`,
 *       lineHeight: settings.lineHeight,
 *     }}>
 *       Content...
 *     </div>
 *   );
 * }
 * ```
 */
export function useFontContext(): FontContextValue {
  const context = useContext(FontContext);
  
  if (!context) {
    throw new Error('useFontContext must be used within a FontProvider');
  }
  
  return context;
}

/**
 * Hook to get font settings (convenience hook)
 * Returns default settings if used outside FontProvider
 * 
 * @example
 * ```tsx
 * function EntryContent() {
 *   const settings = useFontSettings();
 *   
 *   return (
 *     <div style={{
 *       fontFamily: settings.fontFamilyCSS,
 *       fontSize: `${settings.fontSize}px`,
 *       lineHeight: settings.lineHeight,
 *     }}>
 *       Content...
 *     </div>
 *   );
 * }
 * ```
 */
export function useFontSettings(): FontSettings {
  const context = useContext(FontContext);
  
  if (!context) {
    // Return default settings if used outside provider
    return {
      fontFamily: 'system',
      fontSize: FONT_SIZE_RANGE.default,
      lineHeight: LINE_HEIGHT_RANGE.default,
      fontFamilyCSS: FONT_FAMILIES.system,
    };
  }
  
  return context.settings;
}

export default FontProvider;
