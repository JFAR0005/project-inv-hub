
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText, Briefcase, CalendarDays } from 'lucide-react';

interface EmptySearchStateProps {
  query?: string;
  type?: 'no-results' | 'start-typing';
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
          <h3 className="text-lg font-medium mb-2">Start Your Search</h3>
          <p className="text-muted-foreground mb-6">
            Search across companies, notes, meetings, and more
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Companies</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Notes</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4" />
              <span>Meetings</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Results Found</h3>
        <p className="text-muted-foreground">
          {query 
            ? `No results found for "${query}". Try adjusting your search terms.`
            : 'No results found. Try different search terms.'
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptySearchState;
