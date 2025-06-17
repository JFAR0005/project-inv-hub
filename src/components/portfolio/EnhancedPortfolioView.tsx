
import React, { useState, useMemo } from 'react';
import { useRetryableQuery } from '@/hooks/useRetryableQuery';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Grid, List, TrendingUp, AlertTriangle } from 'lucide-react';
import { getSupabaseErrorMessage } from '@/utils/errorMessages';

interface CompanyWithHealth {
  id: string;
  name: string;
  stage: string;
  sector: string;
  arr: number;
  mrr: number;
  burn_rate: number;
  runway: number;
  headcount: number;
  health_score: number;
  last_update: string;
}

const EnhancedPortfolioView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { 
    data: companies = [], 
    isLoading, 
    error,
    manualRetry 
  } = useRetryableQuery(
    ['enhanced-portfolio', searchTerm, stageFilter, sectorFilter],
    async () => {
      try {
        let query = supabase
          .from('companies')
          .select('*')
          .order('name');

        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }
        if (stageFilter !== 'all') {
          query = query.eq('stage', stageFilter);
        }
        if (sectorFilter !== 'all') {
          query = query.eq('sector', sectorFilter);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(company => ({
          ...company,
          health_score: calculateHealthScore(company),
          last_update: '2024-01-15' // Mock data
        }));
      } catch (error) {
        throw new Error(getSupabaseErrorMessage(error));
      }
    },
    {
      staleTime: 30000,
      enabled: true,
      maxRetries: 3
    }
  );

  const calculateHealthScore = (company: any): number => {
    let score = 70; // Base score
    
    if (company.arr > 1000000) score += 10;
    if (company.burn_rate < 50000) score += 10;
    if (company.runway > 12) score += 10;
    
    return Math.min(100, Math.max(0, score));
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = !searchTerm || 
        company.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = stageFilter === 'all' || company.stage === stageFilter;
      const matchesSector = sectorFilter === 'all' || company.sector === sectorFilter;
      
      return matchesSearch && matchesStage && matchesSector;
    });
  }, [companies, searchTerm, stageFilter, sectorFilter]);

  const healthStats = useMemo(() => {
    const healthy = filteredCompanies.filter(c => c.health_score >= 80).length;
    const warning = filteredCompanies.filter(c => c.health_score >= 60 && c.health_score < 80).length;
    const critical = filteredCompanies.filter(c => c.health_score < 60).length;
    
    return { healthy, warning, critical };
  }, [filteredCompanies]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Error Loading Portfolio</h3>
          </div>
          <p className="text-red-700 mb-4">{error.message}</p>
          <Button onClick={manualRetry} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Portfolio Overview</h1>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredCompanies.length}</div>
            <div className="text-sm text-muted-foreground">Total Companies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{healthStats.healthy}</div>
            <div className="text-sm text-muted-foreground">Healthy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{healthStats.warning}</div>
            <div className="text-sm text-muted-foreground">Warning</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{healthStats.critical}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="Seed">Seed</SelectItem>
            <SelectItem value="Series A">Series A</SelectItem>
            <SelectItem value="Series B">Series B</SelectItem>
            <SelectItem value="Series C">Series C</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            <SelectItem value="FinTech">FinTech</SelectItem>
            <SelectItem value="HealthTech">HealthTech</SelectItem>
            <SelectItem value="AI/ML">AI/ML</SelectItem>
            <SelectItem value="CleanTech">CleanTech</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Company Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <Badge 
                    variant={company.health_score >= 80 ? 'default' : 
                             company.health_score >= 60 ? 'secondary' : 'destructive'}
                  >
                    {company.health_score}% Health
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stage:</span>
                    <span>{company.stage || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ARR:</span>
                    <span>${(company.arr || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Runway:</span>
                    <span>{company.runway || 0} months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team:</span>
                    <span>{company.headcount || 0} people</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredCompanies.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">No companies found matching your criteria.</div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPortfolioView;
