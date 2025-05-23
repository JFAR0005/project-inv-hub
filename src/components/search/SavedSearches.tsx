
import React from 'react';
import {
  Clock,
  Save,
  X,
  Play,
  Search,
  Bookmark
} from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch } from '@/context/SearchContext';

const SavedSearches = () => {
  const { 
    savedSearches, 
    removeSavedSearch, 
    applySavedSearch, 
    recentSearches,
    setGlobalQuery
  } = useSearch();
  
  const formatSearchFilters = (filters: any) => {
    const parts = [];
    
    if (filters.sectors?.length) {
      parts.push(`${filters.sectors.length} sectors`);
    }
    
    if (filters.stages?.length) {
      parts.push(`${filters.stages.length} stages`);
    }
    
    if (filters.statuses?.length) {
      parts.push(`${filters.statuses.length} status filters`);
    }
    
    if (filters.metrics?.arr?.min || filters.metrics?.arr?.max) {
      parts.push('ARR range');
    }
    
    if (parts.length === 0) {
      return 'Basic search';
    }
    
    return parts.join(', ');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bookmark className="h-4 w-4" />
          <span className="hidden sm:inline">Saved Searches</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Tabs defaultValue="saved">
          <div className="border-b px-3">
            <TabsList className="h-12 bg-transparent">
              <TabsTrigger value="saved" className="flex items-center gap-1">
                <Save className="h-3.5 w-3.5" />
                <span>Saved</span>
                {savedSearches.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{savedSearches.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Recent</span>
                {recentSearches.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{recentSearches.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="saved" className="space-y-4 p-0">
            <ScrollArea className="h-[280px]">
              {savedSearches.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <Save className="h-10 w-10 mb-2 opacity-50" />
                  <p>No saved searches yet</p>
                  <p className="text-sm">Save your filters for quick access</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {savedSearches.map((search) => (
                    <div 
                      key={search.id}
                      className="flex items-center justify-between gap-2 p-2 hover:bg-muted rounded-md transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{search.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatSearchFilters(search.filters)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(search.createdAt)}
                        </p>
                      </div>
                      <div className="flex">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => applySavedSearch(search.id)}
                          title="Apply this search"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
                          onClick={() => removeSavedSearch(search.id)}
                          title="Delete this search"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {savedSearches.length > 0 && (
              <div className="border-t p-3">
                <p className="text-xs text-muted-foreground">
                  Saved searches are stored in your browser and not synced across devices.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-4 p-0">
            <ScrollArea className="h-[280px]">
              {recentSearches.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <Clock className="h-10 w-10 mb-2 opacity-50" />
                  <p>No recent searches</p>
                  <p className="text-sm">Your search history will appear here</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {recentSearches.map((search, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between gap-2 p-2 hover:bg-muted rounded-md transition-colors"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                        <p className="truncate">{search}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setGlobalQuery(search)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {recentSearches.length > 0 && (
              <div className="border-t p-3">
                <p className="text-xs text-muted-foreground">
                  Recent searches are stored in your browser and not synced across devices.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default SavedSearches;
