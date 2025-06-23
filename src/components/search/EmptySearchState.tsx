
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, AlertCircle } from 'lucide-react';

interface EmptySearchStateProps {
  query?: string;
  type?: 'start-typing' | 'no-results';
}

const EmptySearchState: React.FC<EmptySearchStateProps> = ({ 
  query, 
  type = 'no-results' 
}) => {
  if (type === 'start-typing') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Start Searching</h3>
          <p className="text-muted-foreground">
            Type at least 2 characters to begin searching
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Results Found</h3>
        <p className="text-muted-foreground">
          {query 
            ? `No results found for "${query}". Try different keywords.`
            : 'No results found. Try different search terms.'
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptySearchState;
