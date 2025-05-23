
import React from 'react';
import { SearchFilters as SearchFiltersType } from '@/types/search';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: Partial<SearchFiltersType>) => void;
  onClose: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
}) => {
  const contentTypes = [
    { id: 'company', label: 'Companies' },
    { id: 'note', label: 'Notes' },
    { id: 'meeting', label: 'Meetings' },
    { id: 'deal', label: 'Deals' },
  ];

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.types, type as any]
      : filters.types.filter(t => t !== type);
    
    onFiltersChange({ types: newTypes });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      types: ['company', 'note', 'meeting', 'deal'],
      dateRange: undefined,
      sectors: [],
      stages: [],
      statuses: [],
      tags: [],
      authors: [],
      companies: [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Search Filters</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-2">Content Types</h4>
          <div className="grid grid-cols-2 gap-2">
            {contentTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={filters.types.includes(type.id as any)}
                  onCheckedChange={(checked) => 
                    handleTypeChange(type.id, checked as boolean)
                  }
                />
                <label 
                  htmlFor={type.id} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(filters.types.length < 4 || filters.sectors?.length || filters.stages?.length) && (
          <div>
            <h4 className="text-sm font-medium mb-2">Active Filters</h4>
            <div className="flex flex-wrap gap-1">
              {filters.types.length < 4 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.types.length} content type{filters.types.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {filters.sectors?.map(sector => (
                <Badge key={sector} variant="outline" className="text-xs">
                  {sector}
                </Badge>
              ))}
              {filters.stages?.map(stage => (
                <Badge key={stage} variant="outline" className="text-xs">
                  {stage}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
