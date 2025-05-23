
import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  X, 
  Save, 
  History,
  TrendingUp,
  Building2,
  MapPin,
  DollarSign,
  Users
} from 'lucide-react';

export interface SearchFilters {
  query: string;
  sectors: string[];
  stages: string[];
  locations: string[];
  arrRange: [number, number];
  growthRange: [number, number];
  headcountRange: [number, number];
  riskLevels: string[];
}

interface Company {
  id: string;
  name: string;
  sector: string;
  stage: string;
  location: string;
  arr: number;
  growth: number;
  headcount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface AdvancedSearchProps {
  companies: Company[];
  onFiltersChange: (companies: Company[]) => void;
  onFiltersUpdate?: (filters: SearchFilters) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  companies,
  onFiltersChange,
  onFiltersUpdate
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sectors: [],
    stages: [],
    locations: [],
    arrRange: [0, 10000000],
    growthRange: [-50, 200],
    headcountRange: [0, 1000],
    riskLevels: []
  });

  const [savedFilters, setSavedFilters] = useState<{name: string, filters: SearchFilters}[]>([]);
  const [filterName, setFilterName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const sectors = [...new Set(companies.map(c => c.sector).filter(Boolean))];
    const stages = [...new Set(companies.map(c => c.stage).filter(Boolean))];
    const locations = [...new Set(companies.map(c => c.location).filter(Boolean))];
    const riskLevels = ['Low', 'Medium', 'High'];

    const maxARR = Math.max(...companies.map(c => c.arr || 0));
    const maxHeadcount = Math.max(...companies.map(c => c.headcount || 0));

    return {
      sectors,
      stages,
      locations,
      riskLevels,
      maxARR: Math.ceil(maxARR / 1000000) * 1000000,
      maxHeadcount: Math.ceil(maxHeadcount / 100) * 100
    };
  }, [companies]);

  // Filter companies based on current filters
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const searchableText = [
          company.name,
          company.sector,
          company.stage,
          company.location
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }

      // Sector filter
      if (filters.sectors.length > 0 && !filters.sectors.includes(company.sector)) {
        return false;
      }

      // Stage filter
      if (filters.stages.length > 0 && !filters.stages.includes(company.stage)) {
        return false;
      }

      // Location filter
      if (filters.locations.length > 0 && !filters.locations.includes(company.location)) {
        return false;
      }

      // ARR range filter
      const arr = company.arr || 0;
      if (arr < filters.arrRange[0] || arr > filters.arrRange[1]) {
        return false;
      }

      // Growth range filter
      const growth = company.growth || 0;
      if (growth < filters.growthRange[0] || growth > filters.growthRange[1]) {
        return false;
      }

      // Headcount range filter
      const headcount = company.headcount || 0;
      if (headcount < filters.headcountRange[0] || headcount > filters.headcountRange[1]) {
        return false;
      }

      // Risk level filter
      if (filters.riskLevels.length > 0 && !filters.riskLevels.includes(company.riskLevel)) {
        return false;
      }

      return true;
    });
  }, [companies, filters]);

  // Update parent component when filtered companies change
  useEffect(() => {
    onFiltersChange(filteredCompanies);
    onFiltersUpdate?.(filters);
  }, [filteredCompanies, filters, onFiltersChange, onFiltersUpdate]);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'sectors' | 'stages' | 'locations' | 'riskLevels', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      sectors: [],
      stages: [],
      locations: [],
      arrRange: [0, filterOptions.maxARR],
      growthRange: [-50, 200],
      headcountRange: [0, filterOptions.maxHeadcount],
      riskLevels: []
    });
  };

  const saveFilter = () => {
    if (filterName.trim()) {
      setSavedFilters(prev => [
        ...prev.filter(f => f.name !== filterName),
        { name: filterName, filters }
      ]);
      setFilterName('');
    }
  };

  const loadFilter = (savedFilter: {name: string, filters: SearchFilters}) => {
    setFilters(savedFilter.filters);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const activeFiltersCount = [
    filters.query,
    ...filters.sectors,
    ...filters.stages,
    ...filters.locations,
    ...filters.riskLevels
  ].filter(Boolean).length + 
  (filters.arrRange[0] > 0 || filters.arrRange[1] < filterOptions.maxARR ? 1 : 0) +
  (filters.growthRange[0] > -50 || filters.growthRange[1] < 200 ? 1 : 0) +
  (filters.headcountRange[0] > 0 || filters.headcountRange[1] < filterOptions.maxHeadcount ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies, sectors, stages..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10"
          />
        </div>
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Advanced Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Building2 className="h-4 w-4 inline mr-1" />
                    Sectors
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {filterOptions.sectors.map(sector => (
                      <Badge
                        key={sector}
                        variant={filters.sectors.includes(sector) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayFilter('sectors', sector)}
                      >
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    Stages
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {filterOptions.stages.map(stage => (
                      <Badge
                        key={stage}
                        variant={filters.stages.includes(stage) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayFilter('stages', stage)}
                      >
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Locations
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {filterOptions.locations.slice(0, 6).map(location => (
                      <Badge
                        key={location}
                        variant={filters.locations.includes(location) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayFilter('locations', location)}
                      >
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Range Filters */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    ARR Range: {formatCurrency(filters.arrRange[0])} - {formatCurrency(filters.arrRange[1])}
                  </label>
                  <Slider
                    value={filters.arrRange}
                    onValueChange={(value) => updateFilter('arrRange', value as [number, number])}
                    max={filterOptions.maxARR}
                    step={100000}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Growth Rate: {filters.growthRange[0]}% - {filters.growthRange[1]}%
                  </label>
                  <Slider
                    value={filters.growthRange}
                    onValueChange={(value) => updateFilter('growthRange', value as [number, number])}
                    min={-50}
                    max={200}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Users className="h-4 w-4 inline mr-1" />
                    Headcount: {filters.headcountRange[0]} - {filters.headcountRange[1]}
                  </label>
                  <Slider
                    value={filters.headcountRange}
                    onValueChange={(value) => updateFilter('headcountRange', value as [number, number])}
                    max={filterOptions.maxHeadcount}
                    step={10}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Risk Levels</label>
                  <div className="flex gap-2">
                    {filterOptions.riskLevels.map(risk => (
                      <Badge
                        key={risk}
                        variant={filters.riskLevels.includes(risk) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayFilter('riskLevels', risk)}
                      >
                        {risk}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Save Filters */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Filter name..."
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={saveFilter} size="sm" disabled={!filterName.trim()}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {savedFilters.length > 0 && (
                    <div>
                      <label className="text-xs text-muted-foreground">Saved Filters:</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {savedFilters.map(saved => (
                          <Badge
                            key={saved.name}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => loadFilter(saved)}
                          >
                            <History className="h-3 w-3 mr-1" />
                            {saved.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.query}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('query', '')}
              />
            </Badge>
          )}
          {filters.sectors.map(sector => (
            <Badge key={sector} variant="secondary" className="gap-1">
              {sector}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('sectors', sector)}
              />
            </Badge>
          ))}
          {filters.stages.map(stage => (
            <Badge key={stage} variant="secondary" className="gap-1">
              {stage}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('stages', stage)}
              />
            </Badge>
          ))}
          {filters.locations.map(location => (
            <Badge key={location} variant="secondary" className="gap-1">
              {location}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('locations', location)}
              />
            </Badge>
          ))}
          {filters.riskLevels.map(risk => (
            <Badge key={risk} variant="secondary" className="gap-1">
              {risk} Risk
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('riskLevels', risk)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCompanies.length} of {companies.length} companies
      </div>
    </div>
  );
};

export default AdvancedSearch;
