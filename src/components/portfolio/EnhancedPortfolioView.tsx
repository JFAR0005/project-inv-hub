
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdvancedSearch, { SearchFilters } from './AdvancedSearch';
import SmartSuggestions from './SmartSuggestions';
import PortfolioGrid from './PortfolioGrid';
import PortfolioTable from './PortfolioTable';
import PortfolioSkeleton from './PortfolioSkeleton';
import PortfolioError from './PortfolioError';
import PortfolioEmpty from './PortfolioEmpty';
import PortfolioHealthDashboard from './PortfolioHealthDashboard';
import { 
  LayoutGrid, 
  List, 
  Download,
  Settings,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  sector: string;
  stage: string;
  location: string;
  arr: number;
  growth: number;
  headcount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  website?: string;
  logo_url?: string;
  description?: string;
  burn_rate?: number;
  runway?: number;
  churn_rate?: number;
  mrr?: number;
  last_update?: string;
  raise_status?: string;
  needs_attention?: boolean;
}

const EnhancedPortfolioView: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'overview'>('grid');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Fetch companies and their latest updates with optimized query
  const { 
    data: companies = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['enhanced-portfolio', user?.id],
    queryFn: async () => {
      console.log('Fetching portfolio data with update freshness...');
      
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        throw companiesError;
      }

      const { data: updates, error: updatesError } = await supabase
        .from('founder_updates')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (updatesError) {
        console.error('Error fetching updates:', updatesError);
        throw updatesError;
      }

      // Get latest update for each company - optimized with Map
      const updatesByCompany = new Map();
      updates.forEach(update => {
        if (!updatesByCompany.has(update.company_id)) {
          updatesByCompany.set(update.company_id, update);
        }
      });

      // Transform companies data with memoized calculations
      return companiesData.map(company => {
        const latestUpdate = updatesByCompany.get(company.id);
        const arr = latestUpdate?.arr || company.arr || 0;
        const growth = latestUpdate?.growth || 0;
        const headcount = latestUpdate?.headcount || company.headcount || 0;
        const burnRate = latestUpdate?.burn_rate || company.burn_rate || 0;
        const runway = latestUpdate?.runway || company.runway || 0;

        // Calculate update freshness
        const lastUpdateDate = latestUpdate?.submitted_at;
        const daysSinceUpdate = lastUpdateDate 
          ? Math.floor((new Date().getTime() - new Date(lastUpdateDate).getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        
        const needsAttention = !lastUpdateDate || daysSinceUpdate > 30;
        const isRaising = latestUpdate?.raise_status?.toLowerCase().includes('raising') || 
                         latestUpdate?.raise_status?.toLowerCase().includes('active') || false;

        // Optimized risk calculation
        const riskLevel = calculateRiskLevel(growth, runway, burnRate, arr);

        return {
          id: company.id,
          name: company.name,
          sector: company.sector || 'Other',
          stage: company.stage || 'Unknown',
          location: company.location || 'Unknown',
          arr,
          growth,
          headcount,
          riskLevel,
          website: company.website,
          logo_url: company.logo_url,
          description: company.description,
          burn_rate: burnRate,
          runway,
          churn_rate: latestUpdate?.churn || company.churn_rate,
          mrr: latestUpdate?.mrr || company.mrr,
          last_update: lastUpdateDate,
          raise_status: latestUpdate?.raise_status,
          needs_attention: needsAttention
        };
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!user
  });

  // Memoized risk calculation function
  const calculateRiskLevel = useCallback((growth: number, runway: number, burnRate: number, arr: number): 'Low' | 'Medium' | 'High' => {
    let riskScore = 0;
    
    if (growth < 0) riskScore += 2;
    else if (growth < 10) riskScore += 1;
    
    if (runway && runway < 6) riskScore += 2;
    else if (runway && runway < 12) riskScore += 1;
    
    if (burnRate > 0 && arr > 0) {
      const burnMultiple = burnRate / (arr / 12);
      if (burnMultiple > 4) riskScore += 2;
      else if (burnMultiple > 2) riskScore += 1;
    }

    return riskScore >= 4 ? 'High' : riskScore >= 2 ? 'Medium' : 'Low';
  }, []);

  // Calculate health metrics
  const healthMetrics = useMemo(() => {
    const total = companies.length;
    const needingUpdates = companies.filter(c => c.needs_attention).length;
    const raising = companies.filter(c => c.raise_status?.toLowerCase().includes('raising') || c.raise_status?.toLowerCase().includes('active')).length;
    
    return {
      total,
      needingUpdates,
      raising,
      percentageNeedingUpdates: total ? Math.round((needingUpdates / total) * 100) : 0,
      percentageRaising: total ? Math.round((raising / total) * 100) : 0
    };
  }, [companies]);

  // Memoized suggestion handler
  const handleSuggestionClick = useCallback((suggestion: string) => {
    console.log('Applying suggestion filter:', suggestion);
    // This would typically trigger filter updates in the AdvancedSearch component
  }, []);

  // Optimized export function
  const exportData = useCallback(() => {
    const csvContent = [
      ['Company', 'Sector', 'Stage', 'Location', 'ARR', 'Growth Rate', 'Headcount', 'Risk Level', 'Burn Rate', 'Runway', 'Last Update', 'Raise Status', 'Needs Attention'].join(','),
      ...filteredCompanies.map(company => [
        `"${company.name}"`,
        `"${company.sector}"`,
        `"${company.stage}"`,
        `"${company.location}"`,
        company.arr || 0,
        company.growth || 0,
        company.headcount || 0,
        company.riskLevel,
        company.burn_rate || 0,
        company.runway || 0,
        company.last_update || 'Never',
        company.raise_status || 'Not specified',
        company.needs_attention ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-companies-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredCompanies]);

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-600 mt-1">Advanced portfolio management and insights</p>
          </div>
        </div>
        <PortfolioError error={error as Error} onRetry={() => refetch()} />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-600 mt-1">Advanced portfolio management and insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        <PortfolioSkeleton viewMode={viewMode} />
      </div>
    );
  }

  // Empty state
  if (!companies.length) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-600 mt-1">Advanced portfolio management and insights</p>
          </div>
        </div>
        <PortfolioEmpty showAddButton={user?.role === 'admin'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600 mt-1">
            Advanced portfolio management and insights
          </p>
          {/* Health Summary */}
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-gray-600">{healthMetrics.total} companies</span>
            {healthMetrics.needingUpdates > 0 && (
              <Badge variant="destructive" className="text-xs">
                {healthMetrics.needingUpdates} need updates
              </Badge>
            )}
            {healthMetrics.raising > 0 && (
              <Badge className="bg-green-500 text-xs">
                {healthMetrics.raising} raising
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            {showSuggestions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <AdvancedSearch
        companies={companies}
        onFiltersChange={setFilteredCompanies}
        onFiltersUpdate={setCurrentFilters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* View Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overview')}
              >
                <Activity className="h-4 w-4 mr-2" />
                Health
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{filteredCompanies.length} companies</span>
              {currentFilters && (
                <Badge variant="secondary">
                  Filtered
                </Badge>
              )}
            </div>
          </div>

          {/* Portfolio Content */}
          {filteredCompanies.length === 0 ? (
            <PortfolioEmpty />
          ) : (
            <Tabs value={viewMode} className="w-full">
              <TabsContent value="grid" className="mt-0">
                <PortfolioGrid companies={filteredCompanies} />
              </TabsContent>
              <TabsContent value="table" className="mt-0">
                <PortfolioTable companies={filteredCompanies} />
              </TabsContent>
              <TabsContent value="overview" className="mt-0">
                <PortfolioHealthDashboard />
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Sidebar */}
        {showSuggestions && (
          <div className="lg:col-span-1">
            <SmartSuggestions
              companies={filteredCompanies}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPortfolioView;
