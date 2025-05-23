
import React, { createContext, useContext, useState, useCallback } from 'react';
import { SearchFilters } from '@/types/search';

interface SearchContextType {
  globalQuery: string;
  setGlobalQuery: (query: string) => void;
  globalFilters: SearchFilters;
  setGlobalFilters: (filters: SearchFilters) => void;
  updateGlobalFilters: (filters: Partial<SearchFilters>) => void;
  clearGlobalSearch: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalFilters, setGlobalFilters] = useState<SearchFilters>({
    types: ['company', 'note', 'meeting', 'deal'],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'fintech companies',
    'due diligence notes',
    'board meetings',
    'series A deals',
  ]);

  const updateGlobalFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setGlobalFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearGlobalSearch = useCallback(() => {
    setGlobalQuery('');
    setGlobalFilters({
      types: ['company', 'note', 'meeting', 'deal'],
    });
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 9)]);
    }
  }, [recentSearches]);

  const value = {
    globalQuery,
    setGlobalQuery,
    globalFilters,
    setGlobalFilters,
    updateGlobalFilters,
    clearGlobalSearch,
    recentSearches,
    addRecentSearch,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearchContext = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};
