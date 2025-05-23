
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';

interface PortfolioEmptyProps {
  onAddCompany?: () => void;
  showAddButton?: boolean;
}

const PortfolioEmpty: React.FC<PortfolioEmptyProps> = ({ 
  onAddCompany, 
  showAddButton = false 
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted p-3">
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-muted-foreground">No Companies Found</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Your portfolio appears to be empty or no companies match your current filters.
        </p>
        {showAddButton && onAddCompany && (
          <Button onClick={onAddCompany} className="gap-2">
            <Plus className="h-4 w-4" />
            Add First Company
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioEmpty;
