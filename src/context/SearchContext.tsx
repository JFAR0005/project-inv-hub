
import React, { createContext, useContext, useState, useCallback } from 'react';
import { SearchFilters } from '@/types/search';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
}

interface SearchContextType {
  globalQuery: string;
  setGlobalQuery: (query: string) => void;
  globalFilters: SearchFilters;
  setGlobalFilters: (filters: SearchFilters) => void;
  updateGlobalFilters: (filters: Partial<SearchFilters>) => void;
  clearGlobalSearch: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  // Additional properties for saved searches and filters
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  savedSearches: SavedSearch[];
  addSavedSearch: (name: string) => void;
  removeSavedSearch: (id: string) => void;
  applySavedSearch: (id: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalFilters, setGlobalFilters] = useState<SearchFilters>({
    types: ['company', 'note', 'meeting', 'deal'],
  });
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['company', 'note', 'meeting', 'deal'],
    sectors: [],
    stages: [],
    metrics: {},
    statuses: [],
    sortBy: 'name',
    sortDirection: 'asc',
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'fintech companies',
    'due diligence notes',
    'board meetings',
    'series A deals',
  ]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

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

  const addSavedSearch = useCallback((name: string) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query: globalQuery,
      filters: globalFilters,
      createdAt: new Date().toISOString(),
    };
    setSavedSearches(prev => [newSearch, ...prev]);
  }, [globalQuery, globalFilters]);

  const removeSavedSearch = useCallback((id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  }, []);

  const applySavedSearch = useCallback((id: string) => {
    const search = savedSearches.find(s => s.id === id);
    if (search) {
      setGlobalQuery(search.query);
      setGlobalFilters(search.filters);
    }
  }, [savedSearches]);

  const value = {
    globalQuery,
    setGlobalQuery,
    globalFilters,
    setGlobalFilters,
    updateGlobalFilters,
    clearGlobalSearch,
    recentSearches,
    addRecentSearch,
    filters,
    setFilters,
    savedSearches,
    addSavedSearch,
    removeSavedSearch,
    applySavedSearch,
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

// Export useSearch as an alias for useSearchContext
export const useSearch = useSearchContext;

// Export SearchFilters type
export type { SearchFilters };
