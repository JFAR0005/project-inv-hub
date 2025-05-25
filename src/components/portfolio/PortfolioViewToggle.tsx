
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';

interface PortfolioViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const PortfolioViewToggle: React.FC<PortfolioViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center border rounded-lg">
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="rounded-r-none"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="rounded-l-none"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PortfolioViewToggle;
