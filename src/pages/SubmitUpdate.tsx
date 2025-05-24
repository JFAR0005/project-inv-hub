
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';
import SubmitUpdateForm from '@/components/company/SubmitUpdateForm';

const SubmitUpdate = () => {
  const { user } = useAuth();

  const { data: company, isLoading } = useQuery({
    queryKey: ['user-company', user?.companyId],
    queryFn: async () => {
      if (!user?.companyId) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.companyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.companyId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user?.companyId || !company) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              No Company Associated
            </CardTitle>
            <CardDescription>
              You need to be associated with a company to submit updates.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Submit Update</h1>
        <p className="text-muted-foreground mt-2">
          Share your company's progress with investors
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Submitting for: <span className="font-medium">{company.name}</span>
        </p>
      </div>

      <SubmitUpdateForm 
        companyId={user.companyId}
        companyName={company.name}
      />
    </div>
  );
};

export default SubmitUpdate;
