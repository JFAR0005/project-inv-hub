
import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, SortAsc } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdvancedFilterPanel from './AdvancedFilterPanel';
import SearchFilters, { ActiveFilter } from './SearchFilters';
import SearchSuggestions from './SearchSuggestions';

interface Company {
  id: string;
  name: string;
  sector: string;
  stage: string;
  location: string;
  arr?: number;
  growth?: number;
  runway?: number;
  needs_attention?: boolean;
  raise_status?: string;
}

interface PortfolioSearchProps {
  companies: Company[];
  onFilteredCompanies: (companies: Company[]) => void;
  showSuggestions?: boolean;
}

interface FilterCriteria {
  stages: string[];
  sectors: string[];
  locations: string[];
  arrRange: [number, number];
  growthRange: [number, number];
  runwayRange: [number, number];
  raisingStatus: string[];
  needsAttention: boolean | null;
}

const PortfolioSearch: React.FC<PortfolioSearchProps> = ({
  companies,
  onFilteredCompanies,
  showSuggestions = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    stages: [],
    sectors: [],
    locations: [],
    arrRange: [0, 100000000],
    growthRange: [-50, 200],
    runwayRange: [0, 48],
    raisingStatus: [],
    needsAttention: null
  });

  // Get available filter options
  const availableOptions = useMemo(() => {
    const stages = Array.from(new Set(companies.map(c => c.stage).filter(Boolean)));
    const sectors = Array.from(new Set(companies.map(c => c.sector).filter(Boolean)));
    const locations = Array.from(new Set(companies.map(c => c.location).filter(Boolean)));
    
    return { stages, sectors, locations };
  }, [companies]);

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies.filter(company => {
      // Text search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!company.name.toLowerCase().includes(searchLower) &&
            !company.sector?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Stage filter
      if (filterCriteria.stages.length > 0 && !filterCriteria.stages.includes(company.stage)) {
        return false;
      }

      // Sector filter
      if (filterCriteria.sectors.length > 0 && !filterCriteria.sectors.includes(company.sector)) {
        return false;
      }

      // ARR range
      if (company.arr !== undefined) {
        if (company.arr < filterCriteria.arrRange[0] || company.arr > filterCriteria.arrRange[1]) {
          return false;
        }
      }

      // Growth range
      if (company.growth !== undefined) {
        if (company.growth < filterCriteria.growthRange[0] || company.growth > filterCriteria.growthRange[1]) {
          return false;
        }
      }

      // Runway range
      if (company.runway !== undefined) {
        if (company.runway < filterCriteria.runwayRange[0] || company.runway > filterCriteria.runwayRange[1]) {
          return false;
        }
      }

      // Needs attention filter
      if (filterCriteria.needsAttention !== null && company.needs_attention !== filterCriteria.needsAttention) {
        return false;
      }

      return true;
    });

    // Sort companies
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Company];
      let bValue: any = b[sortBy as keyof Company];

      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [companies, searchTerm, filterCriteria, sortBy, sortOrder]);

  // Update parent component when filtered companies change
  useEffect(() => {
    onFilteredCompanies(filteredAndSortedCompanies);
  }, [filteredAndSortedCompanies, onFilteredCompanies]);

  const handleApplyFilters = (newCriteria: FilterCriteria, newActiveFilters: ActiveFilter[]) => {
    setFilterCriteria(newCriteria);
    setActiveFilters(newActiveFilters);
  };

  const handleRemoveFilter = (filterId: string) => {
    const updatedFilters = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updatedFilters);

    // Reset corresponding filter criteria
    const filter = activeFilters.find(f => f.id === filterId);
    if (filter) {
      const newCriteria = { ...filterCriteria };
      
      if (filter.type === 'stage') {
        newCriteria.stages = newCriteria.stages.filter(s => s !== filter.value);
      } else if (filter.type === 'sector') {
        newCriteria.sectors = newCriteria.sectors.filter(s => s !== filter.value);
      } else if (filter.type === 'arr') {
        newCriteria.arrRange = [0, 100000000];
      } else if (filter.type === 'growth') {
        newCriteria.growthRange = [-50, 200];
      }
      
      setFilterCriteria(newCriteria);
    }
  };

  const handleClearAllFilters = () => {
    setActiveFilters([]);
    setFilterCriteria({
      stages: [],
      sectors: [],
      locations: [],
      arrRange: [0, 100000000],
      growthRange: [-50, 200],
      runwayRange: [0, 48],
      raisingStatus: [],
      needsAttention: null
    });
    setSearchTerm('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Parse suggestion and apply filters
    if (suggestion === 'needs_attention:true') {
      setFilterCriteria(prev => ({ ...prev, needsAttention: true }));
      setActiveFilters(prev => [...prev, {
        id: 'needs-attention',
        label: 'Status',
        value: 'Needs Updates',
        type: 'stage'
      }]);
    }
    // Add more suggestion parsing logic as needed
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies by name, sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(true)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilters.length > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {activeFilters.length}
            </span>
          )}
        </Button>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="stage">Stage</SelectItem>
            <SelectItem value="arr">ARR</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="runway">Runway</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <SortAsc className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Active Filters */}
      <SearchFilters
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Search Suggestions */}
      {showSuggestions && activeFilters.length === 0 && !searchTerm && (
        <SearchSuggestions
          onSuggestionClick={handleSuggestionClick}
          companiesCount={companies.length}
        />
      )}

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={handleApplyFilters}
        availableOptions={availableOptions}
      />
    </div>
  );
};

export default PortfolioSearch;
