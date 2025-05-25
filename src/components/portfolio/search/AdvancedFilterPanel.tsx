
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { ActiveFilter } from './SearchFilters';

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

interface AdvancedFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterCriteria, activeFilters: ActiveFilter[]) => void;
  availableOptions: {
    stages: string[];
    sectors: string[];
    locations: string[];
  };
}

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  availableOptions
}) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    stages: [],
    sectors: [],
    locations: [],
    arrRange: [0, 100000000],
    growthRange: [-50, 200],
    runwayRange: [0, 48],
    raisingStatus: [],
    needsAttention: null
  });

  const handleStageToggle = (stage: string) => {
    setFilters(prev => ({
      ...prev,
      stages: prev.stages.includes(stage)
        ? prev.stages.filter(s => s !== stage)
        : [...prev.stages, stage]
    }));
  };

  const handleSectorToggle = (sector: string) => {
    setFilters(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }));
  };

  const handleApply = () => {
    const activeFilters: ActiveFilter[] = [];
    
    // Add stage filters
    filters.stages.forEach(stage => {
      activeFilters.push({
        id: `stage-${stage}`,
        label: 'Stage',
        value: stage,
        type: 'stage'
      });
    });

    // Add sector filters
    filters.sectors.forEach(sector => {
      activeFilters.push({
        id: `sector-${sector}`,
        label: 'Sector',
        value: sector,
        type: 'sector'
      });
    });

    // Add ARR range if not default
    if (filters.arrRange[0] > 0 || filters.arrRange[1] < 100000000) {
      activeFilters.push({
        id: 'arr-range',
        label: 'ARR',
        value: `$${(filters.arrRange[0] / 1000000).toFixed(1)}M - $${(filters.arrRange[1] / 1000000).toFixed(1)}M`,
        type: 'arr'
      });
    }

    // Add growth range if not default
    if (filters.growthRange[0] > -50 || filters.growthRange[1] < 200) {
      activeFilters.push({
        id: 'growth-range',
        label: 'Growth',
        value: `${filters.growthRange[0]}% - ${filters.growthRange[1]}%`,
        type: 'growth'
      });
    }

    onApplyFilters(filters, activeFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      stages: [],
      sectors: [],
      locations: [],
      arrRange: [0, 100000000],
      growthRange: [-50, 200],
      runwayRange: [0, 48],
      raisingStatus: [],
      needsAttention: null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stages */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Investment Stage</Label>
            <div className="flex flex-wrap gap-2">
              {availableOptions.stages.map(stage => (
                <Button
                  key={stage}
                  variant={filters.stages.includes(stage) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStageToggle(stage)}
                >
                  {stage}
                </Button>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Sector</Label>
            <div className="flex flex-wrap gap-2">
              {availableOptions.sectors.map(sector => (
                <Button
                  key={sector}
                  variant={filters.sectors.includes(sector) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSectorToggle(sector)}
                >
                  {sector}
                </Button>
              ))}
            </div>
          </div>

          {/* ARR Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              ARR Range: ${(filters.arrRange[0] / 1000000).toFixed(1)}M - ${(filters.arrRange[1] / 1000000).toFixed(1)}M
            </Label>
            <Slider
              value={filters.arrRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, arrRange: value as [number, number] }))}
              max={100000000}
              min={0}
              step={1000000}
              className="w-full"
            />
          </div>

          {/* Growth Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Growth Range: {filters.growthRange[0]}% - {filters.growthRange[1]}%
            </Label>
            <Slider
              value={filters.growthRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, growthRange: value as [number, number] }))}
              max={200}
              min={-50}
              step={5}
              className="w-full"
            />
          </div>

          {/* Runway Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Runway: {filters.runwayRange[0]} - {filters.runwayRange[1]} months
            </Label>
            <Slider
              value={filters.runwayRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, runwayRange: value as [number, number] }))}
              max={48}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleReset}>
              Reset All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedFilterPanel;
