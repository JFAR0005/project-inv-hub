
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow, subDays, parseISO } from 'date-fns';

interface HealthIndicatorsProps {
  lastUpdate?: string;
  raiseStatus?: string;
  className?: string;
}

export const UpdateFreshnessIndicator: React.FC<{ lastUpdate?: string; className?: string }> = ({ 
  lastUpdate, 
  className = "" 
}) => {
  if (!lastUpdate) {
    return (
      <Badge variant="destructive" className={`flex items-center gap-1 ${className}`}>
        <AlertTriangle className="h-3 w-3" />
        No Updates
      </Badge>
    );
  }

  const updateDate = parseISO(lastUpdate);
  const thirtyDaysAgo = subDays(new Date(), 30);
  const isOverdue = updateDate < thirtyDaysAgo;

  if (isOverdue) {
    return (
      <Badge variant="destructive" className={`flex items-center gap-1 ${className}`}>
        <AlertTriangle className="h-3 w-3" />
        {formatDistanceToNow(updateDate, { addSuffix: true })}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
      <CheckCircle className="h-3 w-3" />
      {formatDistanceToNow(updateDate, { addSuffix: true })}
    </Badge>
  );
};

export const RaiseStatusIndicator: React.FC<{ raiseStatus?: string; className?: string }> = ({ 
  raiseStatus, 
  className = "" 
}) => {
  if (!raiseStatus) {
    return <span className="text-muted-foreground text-sm">Not specified</span>;
  }

  const status = raiseStatus.toLowerCase();
  
  if (status.includes('active') || status.includes('raising')) {
    return (
      <Badge className={`bg-green-500 text-white flex items-center gap-1 ${className}`}>
        <TrendingUp className="h-3 w-3" />
        {raiseStatus}
      </Badge>
    );
  } else if (status.includes('planned') || status.includes('preparing')) {
    return (
      <Badge className={`bg-yellow-500 text-white flex items-center gap-1 ${className}`}>
        <Clock className="h-3 w-3" />
        {raiseStatus}
      </Badge>
    );
  } else {
    return <Badge variant="outline" className={className}>{raiseStatus}</Badge>;
  }
};

export const HealthIndicators: React.FC<HealthIndicatorsProps> = ({ 
  lastUpdate, 
  raiseStatus, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <UpdateFreshnessIndicator lastUpdate={lastUpdate} />
      <RaiseStatusIndicator raiseStatus={raiseStatus} />
    </div>
  );
};

export default HealthIndicators;
