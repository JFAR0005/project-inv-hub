
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SearchFilters {
  query: string;
  sectors: string[];
  stages: string[];
  metrics: {
    arr?: { min?: number; max?: number };
    growth?: { min?: number; max?: number };
    runway?: { min?: number; max?: number };
  };
  statuses: string[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  lastUpdated?: number; // days
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
}

interface SearchContextType {
  globalQuery: string;
  setGlobalQuery: (query: string) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  savedSearches: SavedSearch[];
  setSavedSearches: (searches: SavedSearch[]) => void;
  addSavedSearch: (name: string) => void;
  removeSavedSearch: (id: string) => void;
  applySavedSearch: (id: string) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
}

const defaultFilters: SearchFilters = {
  query: '',
  sectors: [],
  stages: [],
  metrics: {},
  statuses: [],
  sortBy: 'name',
  sortDirection: 'asc',
};

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [globalQuery, setGlobalQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const addSavedSearch = (name: string) => {
    const newSavedSearch: SavedSearch = {
      id: crypto.randomUUID(),
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };
    setSavedSearches((prev) => [...prev, newSavedSearch]);
  };

  const removeSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((search) => search.id !== id));
  };

  const applySavedSearch = (id: string) => {
    const savedSearch = savedSearches.find((search) => search.id === id);
    if (savedSearch) {
      setFilters(savedSearch.filters);
    }
  };

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const newSearches = prev.filter((s) => s !== query);
      return [query, ...newSearches].slice(0, 10);
    });
  };

  return (
    <SearchContext.Provider
      value={{
        globalQuery,
        setGlobalQuery,
        filters,
        setFilters,
        savedSearches,
        setSavedSearches,
        addSavedSearch,
        removeSavedSearch,
        applySavedSearch,
        recentSearches,
        addRecentSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
