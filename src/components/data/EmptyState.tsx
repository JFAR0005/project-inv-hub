
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileX, Plus, Search, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) => {
  const defaultIcon = <FileX className="h-12 w-12 text-muted-foreground" />;

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="mb-4">
          {icon || defaultIcon}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        
        {description && (
          <p className="text-muted-foreground mb-6 max-w-md">
            {description}
          </p>
        )}
        
        <div className="flex gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {actionLabel}
            </Button>
          )}
          
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
