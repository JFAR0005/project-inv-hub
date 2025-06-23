
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, TrendingUp, AlertTriangle } from 'lucide-react';

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  companiesCount: number;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  onSuggestionClick,
  companiesCount
}) => {
  const suggestions = [
    { label: 'Companies needing updates', value: 'needs_attention:true', icon: AlertTriangle },
    { label: 'Currently raising', value: 'raising:true', icon: TrendingUp },
    { label: 'High growth companies', value: 'growth:high', icon: TrendingUp },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Quick searches</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.value}
              variant="outline"
              size="sm"
              onClick={() => onSuggestionClick(suggestion.value)}
              className="flex items-center gap-2"
            >
              <suggestion.icon className="h-3 w-3" />
              {suggestion.label}
            </Button>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Search across {companiesCount} portfolio companies
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchSuggestions;
