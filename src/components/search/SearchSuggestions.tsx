
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SearchResultCard, { SearchResult } from './SearchResultCard';
import SearchSkeleton from './SearchSkeleton';
import EmptySearchState from './EmptySearchState';

interface SearchSuggestionsProps {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  onResultSelect: (result: SearchResult) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  results,
  isLoading,
  onResultSelect
}) => {
  if (isLoading) {
    return <SearchSkeleton count={5} />;
  }

  if (results.length === 0) {
    return <EmptySearchState query={query} type="no-results" />;
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div key={`${result.type}-${result.id}`} onClick={() => onResultSelect(result)}>
          <SearchResultCard result={result} />
        </div>
      ))}
    </div>
  );
};

export default SearchSuggestions;
