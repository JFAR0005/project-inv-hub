
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const EmptyDocuments: React.FC = () => {
  return (
    <Card>
      <CardContent className="py-6 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
        <p className="text-muted-foreground mb-4">
          There are no documents uploaded for this company yet.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyDocuments;
