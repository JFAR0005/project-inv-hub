
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanyNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Company Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The company you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => navigate('/portfolio')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompanyNotFound;
