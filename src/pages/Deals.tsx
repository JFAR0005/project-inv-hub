
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const Deals = () => {
  const { user } = useAuth();

  const { data: deals, isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          companies (
            name,
            sector,
            location
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Discovery': return 'bg-blue-100 text-blue-800';
      case 'DD': return 'bg-yellow-100 text-yellow-800';
      case 'IC': return 'bg-purple-100 text-purple-800';
      case 'Funded': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Deals</CardTitle>
            <CardDescription>Failed to load deals data</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Deals</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage investment opportunities
        </p>
      </div>

      <div className="grid gap-6">
        {deals?.map((deal) => (
          <Card key={deal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {deal.companies?.name || 'Unknown Company'}
                  </CardTitle>
                  <CardDescription>
                    {deal.companies?.sector} • {deal.companies?.location}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStageColor(deal.stage)}>
                    {deal.stage}
                  </Badge>
                  <Badge variant={deal.status === 'Active' ? 'default' : 'secondary'}>
                    {deal.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valuation</p>
                  <p className="text-lg font-semibold">
                    {deal.valuation_expectation 
                      ? `$${(deal.valuation_expectation / 1000000).toFixed(1)}M`
                      : 'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-lg font-semibold">
                    {new Date(deal.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-lg font-semibold">
                    {new Date(deal.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {deals?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No deals found</h3>
            <p className="text-muted-foreground mt-2">
              Start tracking investment opportunities
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Deals;
