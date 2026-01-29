/**
 * SearchBar Component
 * 
 * Search bar with debounced search (300ms) for diary entries.
 * Displays search results with date, title, and snippet.
 * Results are clickable to navigate to specific pages.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Calendar, Loader } from 'lucide-react';
import type { SearchResult } from '../../types/notebook';
import './SearchBar.css';

/**
 * SearchBar component props
 */
export interface SearchBarProps {
  /** Callback when search is performed */
  onSearch: (query: string) => Promise<SearchResult[]>;
  /** Callback when a search result is clicked */
  onResultClick: (result: SearchResult) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Format date for display
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Highlight search query in text
 */
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, index) => 
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="search-bar__highlight">{part}</mark>
    ) : (
      part
    )
  );
};

/**
 * SearchBar component with debounced search and results display
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   onSearch={async (query) => await searchEntries(query)}
 *   onResultClick={(result) => navigateToEntry(result.id)}
 *   placeholder="搜索日记..."
 * />
 * ```
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onResultClick,
  placeholder = '搜索日记...',
  debounceDelay = 300,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await onSearch(searchQuery);
      setResults(searchResults);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('搜索失败，请重试');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [onSearch]);

  // Handle input change with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, debounceDelay);
    } else {
      setResults([]);
      setShowResults(false);
      setLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, debounceDelay, performSearch]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    setShowResults(false);
    setQuery('');
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  return (
    <div ref={searchBarRef} className={`search-bar ${className}`}>
      {/* Input */}
      <div className="search-bar__input-wrapper">
        <Search className="search-bar__icon" size={20} />
        <input
          type="text"
          className="search-bar__input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
          aria-label="搜索日记"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={showResults}
        />
        {loading && (
          <Loader className="search-bar__loading" size={20} />
        )}
        {query && !loading && (
          <button
            className="search-bar__clear"
            onClick={handleClear}
            aria-label="清除搜索"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Results */}
      {showResults && (
        <div 
          id="search-results"
          className="search-bar__results"
          role="listbox"
          aria-label="搜索结果"
        >
          {error && (
            <div className="search-bar__error" role="alert">
              {error}
            </div>
          )}

          {!error && results.length === 0 && !loading && (
            <div className="search-bar__empty">
              没有找到匹配的日记
            </div>
          )}

          {!error && results.length > 0 && (
            <div className="search-bar__results-list">
              {results.map((result) => (
                <button
                  key={result.id}
                  className="search-bar__result"
                  onClick={() => handleResultClick(result)}
                  role="option"
                  aria-selected="false"
                >
                  <div className="search-bar__result-header">
                    <div className="search-bar__result-date">
                      <Calendar size={14} />
                      <span>{formatDate(result.date)}</span>
                    </div>
                  </div>
                  <div className="search-bar__result-title">
                    {highlightText(result.title || '无标题', query)}
                  </div>
                  <div className="search-bar__result-snippet">
                    {highlightText(result.snippet, query)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
