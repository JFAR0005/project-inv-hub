
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Filter, X, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface FilterState {
  search: string;
  sectors: string[];
  stages: string[];
  arrRange: [number, number];
  mrrRange: [number, number];
  runwayRange: [number, number];
  headcountRange: [number, number];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface PortfolioFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableOptions: {
    sectors: string[];
    stages: string[];
    maxARR: number;
    maxMRR: number;
    maxRunway: number;
    maxHeadcount: number;
  };
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const PortfolioFilters: React.FC<PortfolioFiltersProps> = ({
  filters,
  onFiltersChange,
  availableOptions,
  isExpanded,
  onToggleExpanded
}) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSector = (sector: string) => {
    const newSectors = filters.sectors.includes(sector)
      ? filters.sectors.filter(s => s !== sector)
      : [...filters.sectors, sector];
    updateFilter('sectors', newSectors);
  };

  const toggleStage = (stage: string) => {
    const newStages = filters.stages.includes(stage)
      ? filters.stages.filter(s => s !== stage)
      : [...filters.stages, stage];
    updateFilter('stages', newStages);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      sectors: [],
      stages: [],
      arrRange: [0, availableOptions.maxARR],
      mrrRange: [0, availableOptions.maxMRR],
      runwayRange: [0, availableOptions.maxRunway],
      headcountRange: [0, availableOptions.maxHeadcount],
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.sectors.length > 0 ||
    filters.stages.length > 0 ||
    filters.arrRange[0] > 0 || filters.arrRange[1] < availableOptions.maxARR ||
    filters.mrrRange[0] > 0 || filters.mrrRange[1] < availableOptions.maxMRR ||
    filters.runwayRange[0] > 0 || filters.runwayRange[1] < availableOptions.maxRunway ||
    filters.headcountRange[0] > 0 || filters.headcountRange[1] < availableOptions.maxHeadcount;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Portfolio Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[
                  filters.search && 'Search',
                  filters.sectors.length > 0 && `${filters.sectors.length} Sectors`,
                  filters.stages.length > 0 && `${filters.stages.length} Stages`,
                  'Ranges'
                ].filter(Boolean).join(', ')}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onToggleExpanded}>
              {isExpanded ? 'Less Filters' : 'More Filters'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Company Name</SelectItem>
              <SelectItem value="arr">ARR</SelectItem>
              <SelectItem value="mrr">MRR</SelectItem>
              <SelectItem value="runway">Runway</SelectItem>
              <SelectItem value="headcount">Headcount</SelectItem>
              <SelectItem value="created_at">Investment Date</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.sortOrder} 
            onValueChange={(value: 'asc' | 'desc') => updateFilter('sortOrder', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Sector Filter */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Sectors</Label>
              <div className="flex flex-wrap gap-2">
                {availableOptions.sectors.map(sector => (
                  <div key={sector} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sector-${sector}`}
                      checked={filters.sectors.includes(sector)}
                      onCheckedChange={() => toggleSector(sector)}
                    />
                    <label
                      htmlFor={`sector-${sector}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {sector}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Filter */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Stages</Label>
              <div className="flex flex-wrap gap-2">
                {availableOptions.stages.map(stage => (
                  <div key={stage} className="flex items-center space-x-2">
                    <Checkbox
                      id={`stage-${stage}`}
                      checked={filters.stages.includes(stage)}
                      onCheckedChange={() => toggleStage(stage)}
                    />
                    <label
                      htmlFor={`stage-${stage}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {stage}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  ARR Range: {formatCurrency(filters.arrRange[0])} - {formatCurrency(filters.arrRange[1])}
                </Label>
                <Slider
                  value={filters.arrRange}
                  onValueChange={(value) => updateFilter('arrRange', value as [number, number])}
                  max={availableOptions.maxARR}
                  min={0}
                  step={10000}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  MRR Range: {formatCurrency(filters.mrrRange[0])} - {formatCurrency(filters.mrrRange[1])}
                </Label>
                <Slider
                  value={filters.mrrRange}
                  onValueChange={(value) => updateFilter('mrrRange', value as [number, number])}
                  max={availableOptions.maxMRR}
                  min={0}
                  step={1000}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Runway Range: {filters.runwayRange[0]}m - {filters.runwayRange[1]}m
                </Label>
                <Slider
                  value={filters.runwayRange}
                  onValueChange={(value) => updateFilter('runwayRange', value as [number, number])}
                  max={availableOptions.maxRunway}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Headcount Range: {filters.headcountRange[0]} - {filters.headcountRange[1]}
                </Label>
                <Slider
                  value={filters.headcountRange}
                  onValueChange={(value) => updateFilter('headcountRange', value as [number, number])}
                  max={availableOptions.maxHeadcount}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.search}
                <button onClick={() => updateFilter('search', '')} className="ml-1 text-xs">×</button>
              </Badge>
            )}
            {filters.sectors.map(sector => (
              <Badge key={sector} variant="secondary" className="flex items-center gap-1">
                {sector}
                <button onClick={() => toggleSector(sector)} className="ml-1 text-xs">×</button>
              </Badge>
            ))}
            {filters.stages.map(stage => (
              <Badge key={stage} variant="secondary" className="flex items-center gap-1">
                {stage}
                <button onClick={() => toggleStage(stage)} className="ml-1 text-xs">×</button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioFilters;
