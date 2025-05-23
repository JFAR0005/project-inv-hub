
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import SearchSuggestions from './SearchSuggestions';
import SearchFilters from './SearchFilters';

interface GlobalSearchInputProps {
  placeholder?: string;
  showFilters?: boolean;
  onResultSelect?: (result: any) => void;
}

const GlobalSearchInput: React.FC<GlobalSearchInputProps> = ({
  placeholder = "Search companies, notes, meetings...",
  showFilters = true,
  onResultSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    searchResults,
    isLoading,
    clearSearch,
  } = useGlobalSearch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowFiltersPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleClearSearch = () => {
    clearSearch();
    setIsOpen(false);
  };

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return false;
  }).length;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(searchQuery.length > 0)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="h-7 w-7 p-0 relative"
            >
              <Filter className="h-3 w-3" />
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <SearchSuggestions
            query={searchQuery}
            results={searchResults}
            isLoading={isLoading}
            onResultSelect={(result) => {
              onResultSelect?.(result);
              setIsOpen(false);
            }}
          />
        </div>
      )}

      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 p-4">
          <SearchFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onClose={() => setShowFiltersPanel(false)}
          />
        </div>
      )}
    </div>
  );
};

export default GlobalSearchInput;
