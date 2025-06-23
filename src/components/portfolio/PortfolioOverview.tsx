
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, TrendingUp, Users, DollarSign } from 'lucide-react';
import DataLoadingState from '@/components/data/DataLoadingState';

const PortfolioOverview: React.FC = () => {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['portfolio-overview'],
    queryFn: async () => {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*');

      if (error) throw error;

      const totalCompanies = companies?.length || 0;
      const totalARR = companies?.reduce((sum, company) => sum + (company.arr || 0), 0) || 0;
      const averageRunway = companies?.length 
        ? companies.reduce((sum, company) => sum + (company.runway || 0), 0) / companies.length
        : 0;

      return {
        totalCompanies,
        totalARR,
        averageRunway,
        companies: companies || []
      };
    }
  });

  if (isLoading) {
    return <DataLoadingState message="Loading portfolio overview..." />;
  }

  if (!overview) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalCompanies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total ARR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(overview.totalARR / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Runway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(overview.averageRunway)} months
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalCompanies}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Companies */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Portfolio Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overview.companies.slice(0, 5).map((company) => (
              <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{company.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {company.sector && <span>{company.sector}</span>}
                    {company.stage && <Badge variant="outline">{company.stage}</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  {company.arr && (
                    <div className="font-medium">
                      ${(company.arr / 1000000).toFixed(1)}M ARR
                    </div>
                  )}
                  {company.runway && (
                    <div className="text-sm text-muted-foreground">
                      {company.runway} months runway
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioOverview;
