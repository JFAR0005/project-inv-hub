
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  type: string;
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
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Filters:</span>
      {activeFilters.map((filter) => (
        <Badge key={filter.id} variant="secondary" className="flex items-center gap-1">
          <span className="text-xs">{filter.label}:</span>
          <span>{filter.value}</span>
          <button
            onClick={() => onRemoveFilter(filter.id)}
            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-xs"
      >
        Clear all
      </Button>
    </div>
  );
};

export default SearchFilters;
