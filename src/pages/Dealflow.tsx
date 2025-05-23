
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search,
  Shield,
  AlertTriangle 
} from 'lucide-react';

// Define a local Deal type
type DealflowDeal = {
  id: string;
  stage: string;
  status: string;
  valuation_expectation?: number;
  companies?: {
    id: string;
    name: string;
    sector: string;
    location: string;
  } | null;
  lead_partner_data?: {
    id: string;
    name: string | null;
    email: string | null;
    role: string | null;
    team: string | null;
  } | null;
};

const Dealflow = () => {
  const { user, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Only admins and partners can access this page
  if (!user || !['admin', 'partner'].includes(user.role)) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You don't have permission to access the dealflow page.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Your role: <span className="font-medium capitalize">{user?.role || 'Unknown'}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Required roles: Admin, Partner
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Fetch deals with company information
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', searchTerm, selectedStage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          companies (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // For now, return the data as is since we don't have lead partner lookup working
      return (data || []) as DealflowDeal[];
    },
  });

  // Fetch deal analytics
  const { data: analytics } = useQuery({
    queryKey: ['deal-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('stage, status');
      
      if (error) throw error;

      const totalDeals = data.length;
      const activeDeals = data.filter(deal => deal.status === 'Active').length;
      const fundedDeals = data.filter(deal => deal.stage === 'Funded').length;
      const rejectedDeals = data.filter(deal => deal.stage === 'Rejected').length;

      const stageDistribution = data.reduce((acc: Record<string, number>, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1;
        return acc;
      }, {});

      return {
        totalDeals,
        activeDeals,
        fundedDeals,
        rejectedDeals,
        stageDistribution,
        conversionRate: totalDeals > 0 ? ((fundedDeals / totalDeals) * 100).toFixed(1) : '0'
      };
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

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = !searchTerm || 
      deal.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.companies?.sector?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = selectedStage === 'all' || deal.stage === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  return (
    <ProtectedRoute requiredRoles={['admin', 'partner']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dealflow</h1>
              <p className="text-gray-600 mt-1">Manage your investment pipeline and opportunities</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Deal
            </Button>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Deals</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalDeals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Deals</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.activeDeals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Funded</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.fundedDeals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search companies or sectors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedStage === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedStage('all')}
                    size="sm"
                  >
                    All
                  </Button>
                  {['Discovery', 'DD', 'IC', 'Funded', 'Rejected'].map((stage) => (
                    <Button
                      key={stage}
                      variant={selectedStage === stage ? 'default' : 'outline'}
                      onClick={() => setSelectedStage(stage)}
                      size="sm"
                    >
                      {stage}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deals Content */}
          <Tabs defaultValue="pipeline" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {['Discovery', 'DD', 'IC', 'Funded', 'Rejected'].map((stage) => (
                  <div key={stage} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{stage}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {filteredDeals.filter(deal => deal.stage === stage).length}
                      </Badge>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      {filteredDeals
                        .filter(deal => deal.stage === stage)
                        .map((deal) => (
                          <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm truncate">{deal.companies?.name || 'Unknown'}</h4>
                                  <Badge className={`text-xs ${deal.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {deal.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 truncate">{deal.companies?.sector || 'Unknown'}</p>
                                <p className="text-xs text-gray-500 truncate">{deal.companies?.location || 'Unknown'}</p>
                                {deal.valuation_expectation && (
                                  <p className="text-xs font-medium">
                                    ${(deal.valuation_expectation / 1000000).toFixed(1)}M
                                  </p>
                                )}
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs py-1"
                                  >
                                    Edit
                                  </Button>
                                  {stage === 'DD' && (
                                    <Button
                                      size="sm"
                                      className="flex-1 text-xs py-1"
                                    >
                                      DD
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cards" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">Card View</h3>
                <p>Card view will be available soon</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Stage Distribution</CardTitle>
                      <CardDescription>Number of deals in each stage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(analytics.stageDistribution).map(([stage, count]) => (
                          <div key={stage} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{stage}</span>
                            <Badge className={getStageColor(stage)}>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pipeline Health</CardTitle>
                      <CardDescription>Key metrics and performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Conversion Rate</span>
                          <span className="text-lg font-bold text-green-600">{analytics.conversionRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Deals</span>
                          <span className="text-lg font-bold">{analytics.activeDeals}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Success Rate</span>
                          <span className="text-lg font-bold text-blue-600">
                            {analytics.totalDeals > 0 ? 
                              ((analytics.fundedDeals / (analytics.fundedDeals + analytics.rejectedDeals || 1)) * 100).toFixed(1) 
                              : '0'}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Dealflow;
