
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleGuard from '@/components/layout/RoleGuard';
import AdvancedSearchComponent from '@/components/search/AdvancedSearchComponent';
import SavedSearches from '@/components/search/SavedSearches';
import { SearchFilters, SearchResult } from '@/hooks/useAdvancedSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Bookmark, TrendingUp } from 'lucide-react';

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    query: '',
    entityTypes: ['company', 'note', 'meeting'],
    sectors: [],
    stages: [],
    riskLevels: [],
    dateRange: { start: null, end: null },
    arrRange: { min: null, max: null },
    growthRange: { min: null, max: null },
  });

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'company':
        navigate(`/company/${result.id}`);
        break;
      case 'note':
        navigate(`/notes?highlight=${result.id}`);
        break;
      case 'meeting':
        navigate(`/meetings?highlight=${result.id}`);
        break;
    }
  };

  const handleLoadSavedSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
  };

  return (
    <RoleGuard allowedRoles={['admin', 'partner', 'analyst', 'lp']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Search</h1>
          <p className="text-gray-600 mt-1">
            Search across companies, notes, and meetings with advanced filtering
          </p>
        </div>

        {/* Search Interface */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <AdvancedSearchComponent
              onResultClick={handleResultClick}
              placeholder="Search companies, notes, meetings..."
            />
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <SavedSearches
              onLoadSearch={handleLoadSavedSearch}
              currentFilters={currentFilters}
            />
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { term: 'High growth companies', count: 24 },
                    { term: 'Series A fintech', count: 18 },
                    { term: 'Q4 board meetings', count: 15 },
                    { term: 'Due diligence notes', count: 12 },
                    { term: 'SaaS metrics', count: 10 },
                    { term: 'Healthcare startups', count: 8 }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setCurrentFilters({
                        ...currentFilters,
                        query: item.term
                      })}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.term}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} searches
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Search Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Search Operators</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use quotes for exact phrases: "Series A"</li>
                  <li>• Use - to exclude terms: fintech -crypto</li>
                  <li>• Use OR for alternatives: SaaS OR software</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Filters</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Filter by content type, sector, or stage</li>
                  <li>• Set date ranges for time-specific searches</li>
                  <li>• Use metric ranges to find specific companies</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Saved Searches</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Save complex searches for reuse</li>
                  <li>• Track usage statistics</li>
                  <li>• Quick access to frequent searches</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
};

export default AdvancedSearch;
