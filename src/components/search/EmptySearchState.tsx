
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileX } from 'lucide-react';

interface EmptySearchStateProps {
  type?: 'start-typing' | 'no-results';
  query?: string;
}

const EmptySearchState: React.FC<EmptySearchStateProps> = ({ 
  type = 'start-typing', 
  query 
}) => {
  if (type === 'start-typing') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Start Searching</h3>
          <p className="text-muted-foreground">
            Type at least 2 characters to search companies, notes, meetings, and more.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Results Found</h3>
        <p className="text-muted-foreground">
          No results found for "{query}". Try adjusting your search terms.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptySearchState;
