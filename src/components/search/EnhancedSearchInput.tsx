
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { validateData, searchQuerySchema } from '@/utils/dataValidation';

interface SearchInputProps {
  onSearch: (query: string, filters?: any) => void;
  placeholder?: string;
  showFilters?: boolean;
  recentSearches?: string[];
  onClearHistory?: () => void;
}

const EnhancedSearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = "Search companies, notes, and more...",
  showFilters = true,
  recentSearches = [],
  onClearHistory
}) => {
  const [query, setQuery] = useState('');
  const [showRecent, setShowRecent] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (!query.trim()) {
      setValidationError('Please enter a search term');
      return;
    }

    const validation = validateData(searchQuerySchema, { query, filters });
    if (!validation.success) {
      setValidationError(validation.errors?.[0] || 'Invalid search query');
      return;
    }

    setValidationError(null);
    onSearch(query, filters);
    setShowRecent(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setValidationError(null);
    inputRef.current?.focus();
  };

  const selectRecentSearch = (recentQuery: string) => {
    setQuery(recentQuery);
    setShowRecent(false);
    onSearch(recentQuery, filters);
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key] && (Array.isArray(filters[key]) ? filters[key].length > 0 : true)
  );

  return (
    <div className="relative w-full">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setValidationError(null);
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowRecent(recentSearches.length > 0)}
            placeholder={placeholder}
            className={`pl-10 pr-10 ${validationError ? 'border-red-500' : ''}`}
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showFilters && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Search Filters</h4>
                <p className="text-sm text-muted-foreground">
                  Filter implementation would go here
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({})}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        <Button onClick={handleSearch} disabled={!query.trim()}>
          Search
        </Button>
      </div>

      {validationError && (
        <p className="text-sm text-red-500 mt-1">{validationError}</p>
      )}

      {/* Recent Searches Dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
              {onClearHistory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearHistory}
                  className="h-6 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-1">
              {recentSearches.slice(0, 5).map((recentQuery, index) => (
                <button
                  key={index}
                  onClick={() => selectRecentSearch(recentQuery)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center"
                >
                  <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                  {recentQuery}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchInput;
