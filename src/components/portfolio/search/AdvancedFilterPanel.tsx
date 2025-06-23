
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  type: string;
}

interface AdvancedFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (criteria: FilterCriteria, activeFilters: ActiveFilter[]) => void;
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
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  const handleApply = () => {
    const criteria: FilterCriteria = {
      stages: selectedStages,
      sectors: selectedSectors,
      locations: [],
      arrRange: [0, 100000000],
      growthRange: [-50, 200],
      runwayRange: [0, 48],
      raisingStatus: [],
      needsAttention: null
    };

    const activeFilters: ActiveFilter[] = [
      ...selectedStages.map(stage => ({
        id: `stage-${stage}`,
        label: 'Stage',
        value: stage,
        type: 'stage'
      })),
      ...selectedSectors.map(sector => ({
        id: `sector-${sector}`,
        label: 'Sector',
        value: sector,
        type: 'sector'
      }))
    ];

    onApplyFilters(criteria, activeFilters);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div>
            <Label className="text-sm font-medium">Stages</Label>
            <div className="space-y-2 mt-2">
              {availableOptions.stages.map((stage) => (
                <div key={stage} className="flex items-center space-x-2">
                  <Checkbox
                    id={`stage-${stage}`}
                    checked={selectedStages.includes(stage)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStages([...selectedStages, stage]);
                      } else {
                        setSelectedStages(selectedStages.filter(s => s !== stage));
                      }
                    }}
                  />
                  <Label htmlFor={`stage-${stage}`}>{stage}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Sectors</Label>
            <div className="space-y-2 mt-2">
              {availableOptions.sectors.map((sector) => (
                <div key={sector} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sector-${sector}`}
                    checked={selectedSectors.includes(sector)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSectors([...selectedSectors, sector]);
                      } else {
                        setSelectedSectors(selectedSectors.filter(s => s !== sector));
                      }
                    }}
                  />
                  <Label htmlFor={`sector-${sector}`}>{sector}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilterPanel;
