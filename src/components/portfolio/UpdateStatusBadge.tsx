
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

interface UpdateStatusBadgeProps {
  lastUpdateDate?: string | null;
  className?: string;
}

const UpdateStatusBadge: React.FC<UpdateStatusBadgeProps> = ({ 
  lastUpdateDate, 
  className = "" 
}) => {
  if (!lastUpdateDate) {
    return (
      <Badge variant="destructive" className={`flex items-center gap-1 ${className}`}>
        <AlertTriangle className="h-3 w-3" />
        No Updates
      </Badge>
    );
  }

  const daysSince = differenceInDays(new Date(), parseISO(lastUpdateDate));

  if (daysSince <= 7) {
    return (
      <Badge className={`bg-green-500 hover:bg-green-600 flex items-center gap-1 ${className}`}>
        <CheckCircle className="h-3 w-3" />
        Recent
      </Badge>
    );
  } else if (daysSince <= 30) {
    return (
      <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
        <Clock className="h-3 w-3" />
        {daysSince}d ago
      </Badge>
    );
  } else {
    return (
      <Badge variant="destructive" className={`flex items-center gap-1 ${className}`}>
        <AlertTriangle className="h-3 w-3" />
        {daysSince}d overdue
      </Badge>
    );
  }
};

export default UpdateStatusBadge;
