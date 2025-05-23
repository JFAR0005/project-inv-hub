
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import GlobalSearchInput from '@/components/search/GlobalSearchInput';
import SearchSuggestions from '@/components/search/SearchSuggestions';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Clock, Bookmark } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    searchResults,
    isLoading,
    clearSearch,
  } = useGlobalSearch();

  React.useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery, searchQuery, setSearchQuery]);

  const [savedSearches] = useState([
    { id: '1', query: 'fintech series A', filters: { types: ['company', 'deal'] } },
    { id: '2', query: 'AI companies California', filters: { types: ['company'] } },
    { id: '3', query: 'board meetings Q4', filters: { types: ['meeting'] } },
  ]);

  const recentSearches = [
    'healthcare startups',
    'due diligence notes',
    'funding rounds 2024',
    'AI portfolio companies',
  ];

  const handleSavedSearchClick = (savedSearch: any) => {
    setSearchQuery(savedSearch.query);
    updateFilters(savedSearch.filters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-1">
          Find companies, notes, meetings, and deals across your portfolio
        </p>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="pt-6">
          <GlobalSearchInput
            placeholder="Search across companies, notes, meetings, and deals..."
            showFilters={true}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with filters and saved searches */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Quick Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {['company', 'note', 'meeting', 'deal'].map((type) => (
                  <Button
                    key={type}
                    variant={filters.types.includes(type as any) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const newTypes = filters.types.includes(type as any)
                        ? filters.types.filter(t => t !== type)
                        : [...filters.types, type as any];
                      updateFilters({ types: newTypes });
                    }}
                    className="text-xs capitalize"
                  >
                    {type}s
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saved Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Saved Searches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {savedSearches.map((search) => (
                <Button
                  key={search.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleSavedSearchClick(search)}
                >
                  {search.query}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentSearches.map((query, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setSearchQuery(query)}
                >
                  {query}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Results Area */}
        <div className="lg:col-span-3">
          {searchQuery ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search Results
                  </CardTitle>
                  <Badge variant="secondary">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground">
                    Results for: <span className="font-medium">"{searchQuery}"</span>
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <SearchSuggestions
                  query={searchQuery}
                  results={searchResults}
                  isLoading={isLoading}
                  onResultSelect={(result) => {
                    // Navigation is handled within SearchSuggestions
                    console.log('Selected result:', result);
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Start Searching</h3>
                  <p className="text-muted-foreground mb-4">
                    Enter a search term to find companies, notes, meetings, and deals
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {recentSearches.slice(0, 3).map((query, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery(query)}
                      >
                        {query}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
