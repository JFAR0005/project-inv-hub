
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  type: 'stage' | 'sector' | 'location' | 'growth' | 'arr' | 'runway';
}

interface SearchFiltersProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  activeFilters,
  onRemoveFilter,
  onClearAll
}) => {
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span className="text-xs">{filter.label}: {filter.value}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 ml-1"
                onClick={() => onRemoveFilter(filter.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
