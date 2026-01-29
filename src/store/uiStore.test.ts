/**
 * UI Store 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUIStore } from './uiStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('UIStore', () => {
  beforeEach(() => {
    // 清空 localStorage 和重置 store
    localStorageMock.clear();
    useUIStore.setState({
      viewMode: 'list',
      paginationState: {
        currentPage: 1,
        totalPages: 0,
        visiblePages: [],
        loadedPageRange: [1, 1],
      },
      showTableOfContents: false,
      showBookmarks: false,
      ambientSoundEnabled: false,
      ambientSoundVolume: 0.5,
      reduceMotion: false,
      highContrast: false,
    });
  });

  describe('setViewMode', () => {
    it('should update view mode and persist to localStorage', () => {
      const { setViewMode } = useUIStore.getState();
      
      setViewMode('grid');
      
      expect(useUIStore.getState().viewMode).toBe('grid');
      expect(localStorage.getItem('paper-diary-ui-view-mode')).toBe('"grid"');
    });

    it('should update view mode to reader', () => {
      const { setViewMode } = useUIStore.getState();
      
      setViewMode('reader');
      
      expect(useUIStore.getState().viewMode).toBe('reader');
    });
  });

  describe('navigateToPage', () => {
    beforeEach(() => {
      // 设置初始分页状态
      useUIStore.setState({
        paginationState: {
          currentPage: 1,
          totalPages: 10,
          visiblePages: [],
          loadedPageRange: [1, 1],
        },
      });
    });

    it('should navigate to valid page number', () => {
      const { navigateToPage } = useUIStore.getState();
      
      navigateToPage(5);
      
      const state = useUIStore.getState();
      expect(state.paginationState.currentPage).toBe(5);
      expect(state.paginationState.loadedPageRange).toEqual([4, 6]);
    });

    it('should not navigate to page number less than 1', () => {
      const { navigateToPage } = useUIStore.getState();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      navigateToPage(0);
      
      expect(useUIStore.getState().paginationState.currentPage).toBe(1);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should not navigate to page number greater than totalPages', () => {
      const { navigateToPage } = useUIStore.getState();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      navigateToPage(11);
      
      expect(useUIStore.getState().paginationState.currentPage).toBe(1);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle edge case at first page', () => {
      const { navigateToPage } = useUIStore.getState();
      
      navigateToPage(1);
      
      const state = useUIStore.getState();
      expect(state.paginationState.currentPage).toBe(1);
      expect(state.paginationState.loadedPageRange).toEqual([1, 2]);
    });

    it('should handle edge case at last page', () => {
      const { navigateToPage } = useUIStore.getState();
      
      navigateToPage(10);
      
      const state = useUIStore.getState();
      expect(state.paginationState.currentPage).toBe(10);
      expect(state.paginationState.loadedPageRange).toEqual([9, 10]);
    });
  });

  describe('navigateNext', () => {
    beforeEach(() => {
      useUIStore.setState({
        paginationState: {
          currentPage: 5,
          totalPages: 10,
          visiblePages: [],
          loadedPageRange: [4, 6],
        },
      });
    });

    it('should navigate to next page', () => {
      const { navigateNext } = useUIStore.getState();
      
      navigateNext();
      
      expect(useUIStore.getState().paginationState.currentPage).toBe(6);
    });

    it('should not navigate beyond last page', () => {
      useUIStore.setState({
        paginationState: {
          currentPage: 10,
          totalPages: 10,
          visiblePages: [],
          loadedPageRange: [9, 10],
        },
      });
      
      const { navigateNext } = useUIStore.getState();
      navigateNext();
      
      expect(useUIStore.getState().paginationState.currentPage).toBe(10);
    });
  });

  describe('navigatePrevious', () => {
    beforeEach(() => {
      useUIStore.setState({
        paginationState: {
          currentPage: 5,
          totalPages: 10,
          visiblePages: [],
          loadedPageRange: [4, 6],
        },
      });
    });

    it('should navigate to previous page', () => {
      const { navigatePrevious } = useUIStore.getState();
      
      navigatePrevious();
      
      expect(useUIStore.getState().paginationState.currentPage).toBe(4);
    });

    it('should not navigate before first page', () => {
      useUIStore.setState({
        paginationState: {
          currentPage: 1,
          totalPages: 10,
          visiblePages: [],
          loadedPageRange: [1, 2],
        },
      });
      
      const { navigatePrevious } = useUIStore.getState();
      navigatePrevious();
      
      expect(useUIStore.getState().paginationState.currentPage).toBe(1);
    });
  });

  describe('toggleTableOfContents', () => {
    it('should toggle table of contents visibility', () => {
      const { toggleTableOfContents } = useUIStore.getState();
      
      expect(useUIStore.getState().showTableOfContents).toBe(false);
      
      toggleTableOfContents();
      expect(useUIStore.getState().showTableOfContents).toBe(true);
      
      toggleTableOfContents();
      expect(useUIStore.getState().showTableOfContents).toBe(false);
    });

    it('should close bookmarks when opening table of contents', () => {
      useUIStore.setState({ showBookmarks: true });
      
      const { toggleTableOfContents } = useUIStore.getState();
      toggleTableOfContents();
      
      expect(useUIStore.getState().showTableOfContents).toBe(true);
      expect(useUIStore.getState().showBookmarks).toBe(false);
    });
  });

  describe('toggleBookmarks', () => {
    it('should toggle bookmarks visibility', () => {
      const { toggleBookmarks } = useUIStore.getState();
      
      expect(useUIStore.getState().showBookmarks).toBe(false);
      
      toggleBookmarks();
      expect(useUIStore.getState().showBookmarks).toBe(true);
      
      toggleBookmarks();
      expect(useUIStore.getState().showBookmarks).toBe(false);
    });

    it('should close table of contents when opening bookmarks', () => {
      useUIStore.setState({ showTableOfContents: true });
      
      const { toggleBookmarks } = useUIStore.getState();
      toggleBookmarks();
      
      expect(useUIStore.getState().showBookmarks).toBe(true);
      expect(useUIStore.getState().showTableOfContents).toBe(false);
    });
  });

  describe('setAmbientSound', () => {
    it('should enable ambient sound and persist to localStorage', () => {
      const { setAmbientSound } = useUIStore.getState();
      
      setAmbientSound(true);
      
      expect(useUIStore.getState().ambientSoundEnabled).toBe(true);
      expect(localStorage.getItem('paper-diary-ui-ambient-sound-enabled')).toBe('true');
    });

    it('should set ambient sound volume', () => {
      const { setAmbientSound } = useUIStore.getState();
      
      setAmbientSound(true, 0.7);
      
      expect(useUIStore.getState().ambientSoundEnabled).toBe(true);
      expect(useUIStore.getState().ambientSoundVolume).toBe(0.7);
      expect(localStorage.getItem('paper-diary-ui-ambient-sound-volume')).toBe('0.7');
    });

    it('should clamp volume to 0-1 range', () => {
      const { setAmbientSound } = useUIStore.getState();
      
      setAmbientSound(true, 1.5);
      expect(useUIStore.getState().ambientSoundVolume).toBe(1);
      
      setAmbientSound(true, -0.5);
      expect(useUIStore.getState().ambientSoundVolume).toBe(0);
    });

    it('should not change volume if not provided', () => {
      useUIStore.setState({ ambientSoundVolume: 0.8 });
      
      const { setAmbientSound } = useUIStore.getState();
      setAmbientSound(false);
      
      expect(useUIStore.getState().ambientSoundEnabled).toBe(false);
      expect(useUIStore.getState().ambientSoundVolume).toBe(0.8);
    });
  });

  describe('setAccessibilityPreference', () => {
    it('should set reduce motion preference', () => {
      const { setAccessibilityPreference } = useUIStore.getState();
      
      setAccessibilityPreference('reduceMotion', true);
      
      expect(useUIStore.getState().reduceMotion).toBe(true);
      expect(localStorage.getItem('paper-diary-ui-reduce-motion')).toBe('true');
    });

    it('should set high contrast preference', () => {
      const { setAccessibilityPreference } = useUIStore.getState();
      
      setAccessibilityPreference('highContrast', true);
      
      expect(useUIStore.getState().highContrast).toBe(true);
      expect(localStorage.getItem('paper-diary-ui-high-contrast')).toBe('true');
    });

    it('should warn on invalid preference key', () => {
      const { setAccessibilityPreference } = useUIStore.getState();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      setAccessibilityPreference('invalidKey', true);
      
      expect(consoleSpy).toHaveBeenCalledWith('Invalid accessibility preference key: invalidKey');
      
      consoleSpy.mockRestore();
    });
  });

  describe('loadPreferences', () => {
    it('should load preferences from localStorage', () => {
      // 设置 localStorage 中的值
      localStorage.setItem('paper-diary-ui-view-mode', '"grid"');
      localStorage.setItem('paper-diary-ui-ambient-sound-enabled', 'true');
      localStorage.setItem('paper-diary-ui-ambient-sound-volume', '0.8');
      localStorage.setItem('paper-diary-ui-reduce-motion', 'true');
      localStorage.setItem('paper-diary-ui-high-contrast', 'true');
      
      const { loadPreferences } = useUIStore.getState();
      loadPreferences();
      
      const state = useUIStore.getState();
      expect(state.viewMode).toBe('grid');
      expect(state.ambientSoundEnabled).toBe(true);
      expect(state.ambientSoundVolume).toBe(0.8);
      expect(state.reduceMotion).toBe(true);
      expect(state.highContrast).toBe(true);
    });

    it('should use default values if localStorage is empty', () => {
      const { loadPreferences } = useUIStore.getState();
      loadPreferences();
      
      const state = useUIStore.getState();
      expect(state.viewMode).toBe('list');
      expect(state.ambientSoundEnabled).toBe(false);
      expect(state.ambientSoundVolume).toBe(0.5);
      expect(state.reduceMotion).toBe(false);
      expect(state.highContrast).toBe(false);
    });
  });

  describe('savePreferences', () => {
    it('should save all preferences to localStorage', () => {
      // 设置一些状态
      useUIStore.setState({
        viewMode: 'reader',
        ambientSoundEnabled: true,
        ambientSoundVolume: 0.9,
        reduceMotion: true,
        highContrast: false,
      });
      
      const { savePreferences } = useUIStore.getState();
      savePreferences();
      
      expect(localStorage.getItem('paper-diary-ui-view-mode')).toBe('"reader"');
      expect(localStorage.getItem('paper-diary-ui-ambient-sound-enabled')).toBe('true');
      expect(localStorage.getItem('paper-diary-ui-ambient-sound-volume')).toBe('0.9');
      expect(localStorage.getItem('paper-diary-ui-reduce-motion')).toBe('true');
      expect(localStorage.getItem('paper-diary-ui-high-contrast')).toBe('false');
    });
  });

  describe('jumpToDate', () => {
    it('should log the date (placeholder implementation)', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { jumpToDate } = useUIStore.getState();
      const testDate = new Date('2024-01-15');
      
      jumpToDate(testDate);
      
      expect(consoleSpy).toHaveBeenCalledWith('jumpToDate called with date:', testDate);
      
      consoleSpy.mockRestore();
    });
  });
});
