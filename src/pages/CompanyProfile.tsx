import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { UserRole } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyOverview from '@/components/company/CompanyOverview';
import CompanyMetrics from '@/components/company/CompanyMetrics';
import CompanyDocuments from '@/components/company/CompanyDocuments';
import CompanyUpdates from '@/components/company/CompanyUpdates';

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch company data
  const { data: company, isLoading, error } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      if (!id) throw new Error('Company ID is required');
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
  
  // Determine if the user is allowed to access this company
  const hasAccess = () => {
    if (!user || !id) return false;
    
    // Admins can access all companies
    if (user.role === 'admin') return true;
    
    // Partners can access assigned companies (simplified check)
    if (user.role === 'partner') return true; // In reality, would check assignments
    
    // Founders can only access their own company
    if (user.role === 'founder') return user.companyId === id;
    
    return false;
  };

  return (
    <ProtectedRoute
      requiredRoles={['admin', 'partner', 'founder']}
      requiresOwnership={user?.role === 'founder'}
      resourceOwnerId={id}
    >
      <div className="container mx-auto py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-destructive">Error Loading Company</h2>
            <p className="text-muted-foreground mt-2">Failed to load company details</p>
          </div>
        ) : company ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">{company.name}</h1>
                <p className="text-muted-foreground mt-1">{company.sector} • {company.location}</p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <CompanyOverview company={company} />
              </TabsContent>
              
              <TabsContent value="metrics">
                <CompanyMetrics companyId={id} />
              </TabsContent>
              
              <TabsContent value="documents">
                <CompanyDocuments companyId={id} />
              </TabsContent>
              
              <TabsContent value="updates">
                <CompanyUpdates companyId={id} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Company Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested company could not be found</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default CompanyProfile;
