
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Building, Calendar, Briefcase } from 'lucide-react';

export interface SearchResult {
  id: string;
  title: string;
  type: 'company' | 'note' | 'meeting' | 'deal';
  content?: string;
  description?: string;
}

interface SearchResultCardProps {
  result: SearchResult;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
  const getIcon = () => {
    switch (result.type) {
      case 'company':
        return <Building className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'deal':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getBadgeColor = () => {
    switch (result.type) {
      case 'company':
        return 'default';
      case 'note':
        return 'secondary';
      case 'meeting':
        return 'outline';
      case 'deal':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getIcon()}
              <h3 className="font-semibold">{result.title}</h3>
              <Badge variant={getBadgeColor()}>
                {result.type}
              </Badge>
            </div>
            {(result.content || result.description) && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {result.content || result.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResultCard;
