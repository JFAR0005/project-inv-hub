import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Bookmark, Edit2, Search } from 'lucide-react';
import { SearchFilters } from '@/hooks/useAdvancedSearch';

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
  lastUsed: Date;
  useCount: number;
}

interface SavedSearchesProps {
  onLoadSearch: (filters: SearchFilters) => void;
  currentFilters: SearchFilters;
}

const SavedSearches: React.FC<SavedSearchesProps> = ({
  onLoadSearch,
  currentFilters
}) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((search: any) => ({
          ...search,
          createdAt: new Date(search.createdAt),
          lastUsed: new Date(search.lastUsed)
        }));
        setSavedSearches(parsed);
      } catch (error) {
        console.error('Error loading saved searches:', error);
      }
    }
  }, []);

  // Save searches to localStorage
  const saveToLocalStorage = (searches: SavedSearch[]) => {
    localStorage.setItem('savedSearches', JSON.stringify(searches));
    setSavedSearches(searches);
  };

  const saveCurrentSearch = () => {
    if (!searchName.trim()) return;

    const newSearch: SavedSearch = {
      id: crypto.randomUUID(),
      name: searchName,
      filters: currentFilters,
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 0
    };

    const updated = [...savedSearches, newSearch];
    saveToLocalStorage(updated);
    setSearchName('');
    setShowSaveDialog(false);
  };

  const loadSearch = (search: SavedSearch) => {
    // Update use count and last used
    const updated = savedSearches.map(s =>
      s.id === search.id
        ? { ...s, lastUsed: new Date(), useCount: s.useCount + 1 }
        : s
    );
    saveToLocalStorage(updated);
    onLoadSearch(search.filters);
  };

  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    saveToLocalStorage(updated);
  };

  const getFilterSummary = (filters: SearchFilters) => {
    const parts = [];
    
    if (filters.query) parts.push(`"${filters.query}"`);
    if (filters.entityTypes.length < 3) parts.push(`Types: ${filters.entityTypes.join(', ')}`);
    if (filters.sectors.length > 0) parts.push(`Sectors: ${filters.sectors.slice(0, 2).join(', ')}${filters.sectors.length > 2 ? '...' : ''}`);
    if (filters.stages.length > 0) parts.push(`Stages: ${filters.stages.slice(0, 2).join(', ')}${filters.stages.length > 2 ? '...' : ''}`);
    if (filters.arrRange.min || filters.arrRange.max) {
      const min = filters.arrRange.min ? `$${filters.arrRange.min}K` : '';
      const max = filters.arrRange.max ? `$${filters.arrRange.max}K` : '';
      parts.push(`ARR: ${min || '0'}-${max || '∞'}`);
    }

    return parts.join(' • ') || 'No filters';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Saved Searches
            </CardTitle>
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Save Current Search
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Search</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Search Name</label>
                    <Input
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="Enter a name for this search..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Current Filters</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getFilterSummary(currentFilters)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveCurrentSearch} disabled={!searchName.trim()}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {savedSearches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved searches yet</p>
              <p className="text-sm">Save your current search to quickly access it later</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSearches
                .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
                .map((search) => (
                  <div
                    key={search.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{search.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            Used {search.useCount} times
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getFilterSummary(search.filters)}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {search.createdAt.toLocaleDateString()}</span>
                          <span>Last used: {search.lastUsed.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadSearch(search)}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSearch(search.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SavedSearches;
