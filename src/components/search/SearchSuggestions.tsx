
import React from 'react';
import { SearchResult } from '@/types/search';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  FileText, 
  Calendar, 
  TrendingUp,
  Clock,
  MapPin,
  User 
} from 'lucide-react';

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
  onResultSelect,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company': return <Building2 className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'deal': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'company': return 'bg-blue-100 text-blue-800';
      case 'note': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'deal': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No results found for "{query}"</p>
        <p className="text-sm">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  const groupedResults = results.reduce((groups, result) => {
    const type = result.type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="max-h-80 overflow-y-auto">
      {Object.entries(groupedResults).map(([type, typeResults]) => (
        <div key={type} className="border-b last:border-b-0">
          <div className="px-4 py-2 bg-muted/50 text-sm font-medium capitalize flex items-center gap-2">
            {getTypeIcon(type)}
            {type}s ({typeResults.length})
          </div>
          <div className="py-1">
            {typeResults.map((result) => (
              <Button
                key={result.id}
                variant="ghost"
                className="w-full justify-start p-4 h-auto hover:bg-muted/50"
                onClick={() => {
                  window.location.href = result.url;
                  onResultSelect(result);
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">
                        {result.title}
                      </h4>
                      <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                        {result.type}
                      </Badge>
                    </div>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    )}
                    {result.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {result.description}
                      </p>
                    )}
                    {result.metadata && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {result.metadata.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {result.metadata.location}
                          </span>
                        )}
                        {result.metadata.created_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(result.metadata.created_at).toLocaleDateString()}
                          </span>
                        )}
                        {result.metadata.author_id && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Author
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchSuggestions;
