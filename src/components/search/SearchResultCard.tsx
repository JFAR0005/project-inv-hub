
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, FileText, CalendarDays, TrendingUp } from 'lucide-react';

export interface SearchResult {
  id: string;
  type: 'company' | 'note' | 'meeting' | 'deal';
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, any>;
  url?: string;
  relevanceScore?: number;
}

interface SearchResultCardProps {
  result: SearchResult;
  onClick?: (result: SearchResult) => void;
}

const getResultIcon = (type: string) => {
  switch (type) {
    case 'company':
      return <Briefcase className="h-4 w-4" />;
    case 'note':
      return <FileText className="h-4 w-4" />;
    case 'meeting':
      return <CalendarDays className="h-4 w-4" />;
    case 'deal':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getResultColor = (type: string) => {
  switch (type) {
    case 'company':
      return 'bg-blue-100 text-blue-800';
    case 'note':
      return 'bg-green-100 text-green-800';
    case 'meeting':
      return 'bg-purple-100 text-purple-800';
    case 'deal':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(result);
    } else if (result.url) {
      window.location.href = result.url;
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${getResultColor(result.type)}`}>
            {getResultIcon(result.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {result.title}
              </h3>
              <Badge variant="secondary" className="text-xs capitalize">
                {result.type}
              </Badge>
            </div>
            {result.subtitle && (
              <p className="text-xs text-gray-600 mb-1">
                {result.subtitle}
              </p>
            )}
            {result.description && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {result.description}
              </p>
            )}
            {result.metadata && (
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                  value && (
                    <span key={key} className="text-xs text-gray-400">
                      {key}: {String(value)}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResultCard;
