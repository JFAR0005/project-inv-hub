
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  Building2,
  FileText,
  Users,
  Bookmark,
  History
} from 'lucide-react';
import { useAdvancedSearch, SearchResult } from '@/hooks/useAdvancedSearch';
import { format } from 'date-fns';

interface AdvancedSearchComponentProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
}

const AdvancedSearchComponent: React.FC<AdvancedSearchComponentProps> = ({
  onResultClick,
  placeholder = "Search companies, notes, meetings..."
}) => {
  const { 
    filters, 
    updateFilters, 
    resetFilters, 
    searchResults, 
    isLoading, 
    getSuggestions,
    searchData 
  } = useAdvancedSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get unique values for filter options
  const filterOptions = {
    sectors: [...new Set(searchData?.companies.map(c => c.sector).filter(Boolean))],
    stages: [...new Set(searchData?.companies.map(c => c.stage).filter(Boolean))],
    riskLevels: ['Low', 'Medium', 'High']
  };

  const handleSearchChange = (value: string) => {
    updateFilters({ query: value });
    const newSuggestions = getSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(value.length > 0 && newSuggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    updateFilters({ query: suggestion });
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'company': return <Building2 className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={filters.query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-20"
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 px-2"
            >
              <Filter className="h-4 w-4" />
            </Button>
            {(filters.query || showFilters) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetFilters();
                  setShowFilters(false);
                }}
                className="h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center gap-2">
                  <History className="h-3 w-3 text-muted-foreground" />
                  <span dangerouslySetInnerHTML={{ 
                    __html: highlightMatch(suggestion, filters.query) 
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {(filters.sectors.length > 0 || filters.stages.length > 0 || filters.riskLevels.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {filters.sectors.map(sector => (
            <Badge key={sector} variant="secondary" className="gap-1">
              {sector}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ 
                  sectors: filters.sectors.filter(s => s !== sector) 
                })}
              />
            </Badge>
          ))}
          {filters.stages.map(stage => (
            <Badge key={stage} variant="secondary" className="gap-1">
              {stage}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ 
                  stages: filters.stages.filter(s => s !== stage) 
                })}
              />
            </Badge>
          ))}
          {filters.riskLevels.map(risk => (
            <Badge key={risk} variant="secondary" className="gap-1">
              {risk} Risk
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ 
                  riskLevels: filters.riskLevels.filter(r => r !== risk) 
                })}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="dates">Dates</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Search in:</Label>
                  <div className="flex gap-4 mt-2">
                    {[
                      { value: 'company', label: 'Companies', icon: Building2 },
                      { value: 'note', label: 'Notes', icon: FileText },
                      { value: 'meeting', label: 'Meetings', icon: Users }
                    ].map(({ value, label, icon: Icon }) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={value}
                          checked={filters.entityTypes.includes(value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilters({ 
                                entityTypes: [...filters.entityTypes, value] 
                              });
                            } else {
                              updateFilters({ 
                                entityTypes: filters.entityTypes.filter(t => t !== value) 
                              });
                            }
                          }}
                        />
                        <Label htmlFor={value} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Sectors</Label>
                    <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                      {filterOptions.sectors.map(sector => (
                        <div key={sector} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sector-${sector}`}
                            checked={filters.sectors.includes(sector)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilters({ sectors: [...filters.sectors, sector] });
                              } else {
                                updateFilters({ 
                                  sectors: filters.sectors.filter(s => s !== sector) 
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`sector-${sector}`} className="text-sm">
                            {sector}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Stages</Label>
                    <div className="space-y-2 mt-2">
                      {filterOptions.stages.map(stage => (
                        <div key={stage} className="flex items-center space-x-2">
                          <Checkbox
                            id={`stage-${stage}`}
                            checked={filters.stages.includes(stage)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilters({ stages: [...filters.stages, stage] });
                              } else {
                                updateFilters({ 
                                  stages: filters.stages.filter(s => s !== stage) 
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`stage-${stage}`} className="text-sm">
                            {stage}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Risk Levels</Label>
                    <div className="space-y-2 mt-2">
                      {filterOptions.riskLevels.map(risk => (
                        <div key={risk} className="flex items-center space-x-2">
                          <Checkbox
                            id={`risk-${risk}`}
                            checked={filters.riskLevels.includes(risk)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilters({ riskLevels: [...filters.riskLevels, risk] });
                              } else {
                                updateFilters({ 
                                  riskLevels: filters.riskLevels.filter(r => r !== risk) 
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`risk-${risk}`} className="text-sm">
                            {risk}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      ARR Range
                    </Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min ARR"
                          value={filters.arrRange.min || ''}
                          onChange={(e) => updateFilters({
                            arrRange: { 
                              ...filters.arrRange, 
                              min: e.target.value ? Number(e.target.value) : null 
                            }
                          })}
                        />
                        <Input
                          type="number"
                          placeholder="Max ARR"
                          value={filters.arrRange.max || ''}
                          onChange={(e) => updateFilters({
                            arrRange: { 
                              ...filters.arrRange, 
                              max: e.target.value ? Number(e.target.value) : null 
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Growth Range (%)
                    </Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min Growth"
                          value={filters.growthRange.min || ''}
                          onChange={(e) => updateFilters({
                            growthRange: { 
                              ...filters.growthRange, 
                              min: e.target.value ? Number(e.target.value) : null 
                            }
                          })}
                        />
                        <Input
                          type="number"
                          placeholder="Max Growth"
                          value={filters.growthRange.max || ''}
                          onChange={(e) => updateFilters({
                            growthRange: { 
                              ...filters.growthRange, 
                              max: e.target.value ? Number(e.target.value) : null 
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dates" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start mt-2">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.start 
                            ? format(filters.dateRange.start, 'PPP')
                            : 'Pick start date'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.start}
                          onSelect={(date) => updateFilters({
                            dateRange: { ...filters.dateRange, start: date }
                          })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start mt-2">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.end 
                            ? format(filters.dateRange.end, 'PPP')
                            : 'Pick end date'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.end}
                          onSelect={(date) => updateFilters({
                            dateRange: { ...filters.dateRange, end: date }
                          })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Search Results ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onResultClick?.(result)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium" dangerouslySetInnerHTML={{
                          __html: highlightMatch(result.title, filters.query)
                        }} />
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                        {result.matchedFields.length > 0 && (
                          <div className="flex gap-1">
                            {result.matchedFields.map(field => (
                              <Badge key={field} variant="secondary" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {result.subtitle}
                        </p>
                      )}
                      {result.description && (
                        <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{
                          __html: highlightMatch(result.description, filters.query)
                        }} />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Score: {result.relevanceScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {filters.query && searchResults.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No results found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearchComponent;
