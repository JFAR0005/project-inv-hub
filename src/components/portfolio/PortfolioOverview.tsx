
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, Building2 } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';

interface PortfolioMetrics {
  totalCompanies: number;
  totalARR: number;
  avgGrowthRate: number;
  companiesNeedingAttention: number;
  activelyRaising: number;
  totalHeadcount: number;
}

interface CompanyWithMetrics {
  id: string;
  name: string;
  sector: string | null;
  stage: string | null;
  latest_arr: number | null;
  latest_mrr: number | null;
  latest_runway: number | null;
  latest_headcount: number | null;
  latest_growth: number | null;
  raise_status: string | null;
  last_update: string | null;
  needs_attention: boolean;
}

const PortfolioOverview: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [topCompanies, setTopCompanies] = useState<CompanyWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'partner' || user.role === 'lp')) {
      fetchPortfolioData();
    }
  }, [user]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);

      // Fetch companies with their latest updates
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*');

      if (companiesError) throw companiesError;

      // Fetch latest founder updates for each company
      const { data: updates, error: updatesError } = await supabase
        .from('founder_updates')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (updatesError) throw updatesError;

      // Group updates by company and get the latest one
      const updatesByCompany = updates.reduce((acc: Record<string, any>, update) => {
        if (!acc[update.company_id] || new Date(update.submitted_at) > new Date(acc[update.company_id].submitted_at)) {
          acc[update.company_id] = update;
        }
        return acc;
      }, {});

      // Combine company data with latest metrics
      const companiesWithMetrics: CompanyWithMetrics[] = companies.map(company => {
        const latestUpdate = updatesByCompany[company.id];
        const needsAttention = !latestUpdate || 
          isAfter(new Date(), subDays(new Date(latestUpdate.submitted_at), -30)) ||
          (latestUpdate && latestUpdate.runway !== null && latestUpdate.runway < 6);

        return {
          id: company.id,
          name: company.name,
          sector: company.sector,
          stage: company.stage,
          latest_arr: latestUpdate?.arr || null,
          latest_mrr: latestUpdate?.mrr || null,
          latest_runway: latestUpdate?.runway || null,
          latest_headcount: latestUpdate?.headcount || null,
          latest_growth: latestUpdate?.growth || null,
          raise_status: latestUpdate?.raise_status || null,
          last_update: latestUpdate?.submitted_at || null,
          needs_attention: needsAttention,
        };
      });

      // Calculate portfolio metrics
      const totalCompanies = companies.length;
      const totalARR = companiesWithMetrics.reduce((sum, company) => 
        sum + (company.latest_arr || 0), 0);
      const companiesWithGrowth = companiesWithMetrics.filter(c => c.latest_growth !== null);
      const avgGrowthRate = companiesWithGrowth.length > 0 
        ? companiesWithGrowth.reduce((sum, c) => sum + (c.latest_growth || 0), 0) / companiesWithGrowth.length
        : 0;
      const companiesNeedingAttention = companiesWithMetrics.filter(c => c.needs_attention).length;
      const activelyRaising = companiesWithMetrics.filter(c => c.raise_status === 'Raising').length;
      const totalHeadcount = companiesWithMetrics.reduce((sum, company) => 
        sum + (company.latest_headcount || 0), 0);

      setMetrics({
        totalCompanies,
        totalARR,
        avgGrowthRate,
        companiesNeedingAttention,
        activelyRaising,
        totalHeadcount,
      });

      // Get top performing companies by ARR
      const sortedCompanies = companiesWithMetrics
        .filter(c => c.latest_arr !== null)
        .sort((a, b) => (b.latest_arr || 0) - (a.latest_arr || 0))
        .slice(0, 5);

      setTopCompanies(sortedCompanies);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio ARR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalARR)}</div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.totalCompanies} companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgGrowthRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring revenue growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Headcount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalHeadcount}</div>
            <p className="text-xs text-muted-foreground">
              Total employees across portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies Raising</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activelyRaising}</div>
            <p className="text-xs text-muted-foreground">
              Currently fundraising
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{metrics.companiesNeedingAttention}</div>
            <p className="text-xs text-muted-foreground">
              Overdue updates or low runway
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Size</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Active portfolio companies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Companies */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Companies</CardTitle>
          <CardDescription>
            Ranked by Annual Recurring Revenue (ARR)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCompanies.map((company, index) => (
              <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{company.name}</div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {company.sector && (
                        <Badge variant="outline">{company.sector}</Badge>
                      )}
                      {company.stage && (
                        <Badge variant="secondary">{company.stage}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {formatCurrency(company.latest_arr || 0)}
                  </div>
                  {company.latest_growth !== null && (
                    <div className="flex items-center text-sm">
                      {company.latest_growth >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={company.latest_growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {company.latest_growth}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {topCompanies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No companies with ARR data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioOverview;
