
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import SearchResultCard, { SearchResult } from './SearchResultCard';
import EmptySearchState from './EmptySearchState';
import SearchSkeleton from './SearchSkeleton';
import SearchErrorBoundary from '@/components/error/SearchErrorBoundary';
import { supabase } from '@/integrations/supabase/client';
import { useRetryableQuery } from '@/hooks/useRetryableQuery';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import EnhancedSearchInput from './EnhancedSearchInput';
import UserFeedback from '@/components/feedback/UserFeedback';

type SearchCategory = 'all' | 'companies' | 'notes' | 'meetings';

interface CompanyResult {
  id: string;
  name: string;
  description?: string;
  type: 'company';
}

interface NoteResult {
  id: string;
  title: string;
  content: string;
  type: 'note';
}

interface MeetingResult {
  id: string;
  title: string;
  description?: string;
  type: 'meeting';
}

const searchCompanies = async (query: string): Promise<CompanyResult[]> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, description')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (error) {
      console.error('Company search error:', error);
      return [];
    }

    return (data || []).map(company => ({
      ...company,
      type: 'company' as const,
    }));
  } catch (error) {
    console.error('Company search failed:', error);
    return [];
  }
};

const searchNotes = async (query: string): Promise<NoteResult[]> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content')
      .ilike('title', `%${query}%`)
      .limit(5);

    if (error) {
      console.error('Notes search error:', error);
      return [];
    }

    return (data || []).map(note => ({
      ...note,
      type: 'note' as const,
    }));
  } catch (error) {
    console.error('Notes search failed:', error);
    return [];
  }
};

const searchMeetings = async (query: string): Promise<MeetingResult[]> => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('id, title, description')
      .ilike('title', `%${query}%`)
      .limit(5);

    if (error) {
      console.error('Meetings search error:', error);
      return [];
    }

    return (data || []).map(meeting => ({
      ...meeting,
      type: 'meeting' as const,
    }));
  } catch (error) {
    console.error('Meetings search failed:', error);
    return [];
  }
};

const GlobalSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const { 
    data: searchResults = [], 
    isLoading, 
    error,
    manualRetry 
  } = useRetryableQuery(
    ['global-search', searchQuery, activeCategory],
    async () => {
      if (!searchQuery.trim()) return [];
      
      console.log('Performing global search:', { searchQuery, activeCategory });
      
      const searchPromises = [];
      
      if (activeCategory === 'all' || activeCategory === 'companies') {
        searchPromises.push(searchCompanies(searchQuery));
      }
      
      if (activeCategory === 'all' || activeCategory === 'notes') {
        searchPromises.push(searchNotes(searchQuery));
      }
      
      if (activeCategory === 'all' || activeCategory === 'meetings') {
        searchPromises.push(searchMeetings(searchQuery));
      }
      
      const results = await Promise.all(searchPromises);
      return results.flat();
    },
    {
      enabled: searchQuery.length >= 2,
      staleTime: 30000,
      maxRetries: 2,
    }
  );

  const handleSearch = (query: string, filters?: any) => {
    setSearchQuery(query);
    
    // Add to recent searches
    if (query.trim()) {
      const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    toast({
      title: "Search History Cleared",
      description: "Your recent searches have been cleared.",
    });
  };

  if (error) {
    return <SearchErrorBoundary error={error as Error} onRetry={manualRetry} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <EnhancedSearchInput
            onSearch={handleSearch}
            placeholder="Search companies, notes, meetings, and more..."
            showFilters={true}
            recentSearches={recentSearches}
            onClearHistory={clearRecentSearches}
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowFeedback(true)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'companies', 'notes', 'meetings'] as SearchCategory[]).map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Search Results */}
      {searchQuery.length < 2 ? (
        <EmptySearchState type="start-typing" />
      ) : isLoading ? (
        <SearchSkeleton count={6} />
      ) : searchResults.length === 0 ? (
        <EmptySearchState query={searchQuery} type="no-results" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </h3>
          </div>
          <div className="grid gap-4">
            {searchResults.map((result) => (
              <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
            ))}
          </div>
        </div>
      )}

      <UserFeedback 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        context="Global Search"
      />
    </div>
  );
};

export default GlobalSearch;
