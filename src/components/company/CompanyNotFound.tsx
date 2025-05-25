
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompanyNotFoundProps {
  message?: string;
}

const CompanyNotFound: React.FC<CompanyNotFoundProps> = ({ 
  message = "The company you're looking for doesn't exist or you don't have permission to view it." 
}) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      <Building className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Company Not Found</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      <Button onClick={() => navigate('/portfolio')} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Portfolio
      </Button>
    </div>
  );
};

export default CompanyNotFound;
