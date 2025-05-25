
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, AlertTriangle, Building2 } from 'lucide-react';

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  companiesCount: number;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  onSuggestionClick,
  companiesCount
}) => {
  const suggestions = [
    {
      icon: AlertTriangle,
      label: 'Companies needing updates',
      query: 'needs_attention:true',
      count: Math.floor(companiesCount * 0.3),
      color: 'text-amber-600'
    },
    {
      icon: TrendingUp,
      label: 'High growth companies',
      query: 'growth:>20',
      count: Math.floor(companiesCount * 0.25),
      color: 'text-green-600'
    },
    {
      icon: Building2,
      label: 'Series A companies',
      query: 'stage:"Series A"',
      count: Math.floor(companiesCount * 0.4),
      color: 'text-blue-600'
    },
    {
      icon: AlertTriangle,
      label: 'Low runway (<12 months)',
      query: 'runway:<12',
      count: Math.floor(companiesCount * 0.2),
      color: 'text-red-600'
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Quick Searches</span>
        </div>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start p-2 h-auto"
              onClick={() => onSuggestionClick(suggestion.query)}
            >
              <div className="flex items-center gap-3 w-full">
                <suggestion.icon className={`h-4 w-4 ${suggestion.color}`} />
                <div className="flex-1 text-left">
                  <div className="text-sm">{suggestion.label}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {suggestion.count}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchSuggestions;
