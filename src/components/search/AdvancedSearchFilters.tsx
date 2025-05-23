
import React, { useState } from 'react';
import { 
  Filter, 
  Save,
  Check,
  ChevronsUpDown,
  X
} from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSearch, SearchFilters } from '@/context/SearchContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface AdvancedSearchFiltersProps {
  onApplyFilters: (filters: SearchFilters) => void;
}

const AdvancedSearchFilters = ({ onApplyFilters }: AdvancedSearchFiltersProps) => {
  const { filters, setFilters, savedSearches, addSavedSearch } = useSearch();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  // Fetch available sectors and stages for filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['portfolio-filter-options'],
    queryFn: async () => {
      // Get unique sectors
      const { data: sectors } = await supabase
        .from('companies')
        .select('sector')
        .not('sector', 'is', null);
      
      // Get unique stages
      const { data: stages } = await supabase
        .from('companies')
        .select('stage')
        .not('stage', 'is', null);
      
      // Get unique statuses (from raise_status in founder_updates)
      const { data: statuses } = await supabase
        .from('founder_updates')
        .select('raise_status')
        .not('raise_status', 'is', null);
      
      return {
        sectors: [...new Set(sectors?.map(item => item.sector).filter(Boolean))],
        stages: [...new Set(stages?.map(item => item.stage).filter(Boolean))],
        statuses: [...new Set(statuses?.map(item => item.raise_status).filter(Boolean))],
      };
    }
  });
  
  const handleUpdateLocalFilters = (key: keyof SearchFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSaveSearch = () => {
    if (searchName.trim()) {
      addSavedSearch(searchName);
      setSaveDialogOpen(false);
      setSearchName("");
    }
  };
  
  const handleApplyFilters = () => {
    setFilters(localFilters);
    onApplyFilters(localFilters);
    setPopoverOpen(false);
  };
  
  const handleReset = () => {
    const resetFilters: SearchFilters = {
      types: ['company', 'note', 'meeting', 'deal'], // Include the required types property
      query: '',
      sectors: [],
      stages: [],
      metrics: {},
      statuses: [],
      sortBy: 'name',
      sortDirection: 'asc',
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };
  
  return (
    <div className="flex items-center gap-2">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {Object.values(filters).some(val => 
              Array.isArray(val) ? val.length > 0 : 
              typeof val === 'object' ? Object.keys(val).length > 0 : 
              val !== '' && val !== 'name' && val !== 'asc'
            ) && (
              <Badge variant="secondary" className="ml-1 rounded-full">
                Active
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle>Advanced Filters</CardTitle>
              <CardDescription>
                Filter portfolio companies by multiple criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sectors */}
              <div className="space-y-2">
                <Label>Sectors</Label>
                <Command className="border rounded-md">
                  <CommandInput placeholder="Search sectors..." />
                  <CommandEmpty>No sectors found.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {filterOptions?.sectors.map(sector => (
                      <CommandItem
                        key={sector}
                        onSelect={() => {
                          const newSectors = localFilters.sectors.includes(sector)
                            ? localFilters.sectors.filter(s => s !== sector)
                            : [...localFilters.sectors, sector];
                          handleUpdateLocalFilters('sectors', newSectors);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={localFilters.sectors.includes(sector)} 
                            onCheckedChange={() => {}}
                          />
                          {sector}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
                {localFilters.sectors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {localFilters.sectors.map(sector => (
                      <Badge key={sector} variant="secondary" className="gap-1">
                        {sector}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleUpdateLocalFilters(
                            'sectors', 
                            localFilters.sectors.filter(s => s !== sector)
                          )} 
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Stages */}
              <div className="space-y-2">
                <Label>Stages</Label>
                <Command className="border rounded-md">
                  <CommandInput placeholder="Search stages..." />
                  <CommandEmpty>No stages found.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {filterOptions?.stages.map(stage => (
                      <CommandItem
                        key={stage}
                        onSelect={() => {
                          const newStages = localFilters.stages.includes(stage)
                            ? localFilters.stages.filter(s => s !== stage)
                            : [...localFilters.stages, stage];
                          handleUpdateLocalFilters('stages', newStages);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={localFilters.stages.includes(stage)} 
                            onCheckedChange={() => {}}
                          />
                          {stage}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </div>
              
              {/* ARR Range */}
              <div className="space-y-2">
                <Label>ARR Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Min</Label>
                    <Input 
                      type="number" 
                      placeholder="Min ARR" 
                      value={localFilters.metrics.arr?.min || ''} 
                      onChange={(e) => handleUpdateLocalFilters('metrics', {
                        ...localFilters.metrics,
                        arr: {
                          ...localFilters.metrics.arr,
                          min: e.target.value ? Number(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max</Label>
                    <Input 
                      type="number" 
                      placeholder="Max ARR" 
                      value={localFilters.metrics.arr?.max || ''} 
                      onChange={(e) => handleUpdateLocalFilters('metrics', {
                        ...localFilters.metrics,
                        arr: {
                          ...localFilters.metrics.arr,
                          max: e.target.value ? Number(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div className="space-y-2">
                <Label>Raise Status</Label>
                <Command className="border rounded-md">
                  <CommandInput placeholder="Search statuses..." />
                  <CommandEmpty>No statuses found.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {filterOptions?.statuses.map(status => (
                      <CommandItem
                        key={status}
                        onSelect={() => {
                          const newStatuses = localFilters.statuses.includes(status)
                            ? localFilters.statuses.filter(s => s !== status)
                            : [...localFilters.statuses, status];
                          handleUpdateLocalFilters('statuses', newStatuses);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={localFilters.statuses.includes(status)} 
                            onCheckedChange={() => {}}
                          />
                          {status}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </div>
              
              {/* Sort */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex gap-2">
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={localFilters.sortBy}
                    onChange={(e) => handleUpdateLocalFilters('sortBy', e.target.value)}
                  >
                    <option value="name">Name</option>
                    <option value="arr">ARR</option>
                    <option value="growth">Growth</option>
                    <option value="runway">Runway</option>
                    <option value="last_update">Last Updated</option>
                  </select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateLocalFilters(
                      'sortDirection', 
                      localFilters.sortDirection === 'asc' ? 'desc' : 'asc'
                    )}
                  >
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between pt-2">
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Save Search
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Current Search</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="search-name">Search Name</Label>
                      <Input
                        id="search-name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Enter a name for this search"
                        className="mt-2"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveSearch}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AdvancedSearchFilters;
