
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import PortfolioStats from '@/components/portfolio/PortfolioStats';
import PortfolioViewToggle from '@/components/portfolio/PortfolioViewToggle';
import EnhancedCompanyCard from '@/components/portfolio/EnhancedCompanyCard';
import PortfolioList from '@/components/portfolio/PortfolioList';
import { Loader2 } from 'lucide-react';

const EnhancedPortfolio = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['enhanced-portfolio-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Add mock data for demonstration
      return data?.map(company => ({
        ...company,
        growth: Math.floor(Math.random() * 50) - 10, // Random growth between -10% and 40%
        runway: Math.floor(Math.random() * 24) + 6, // Random runway between 6-30 months
        needs_attention: Math.random() > 0.7, // 30% chance of needing attention
        last_update: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        raise_status: ['Not Raising', 'Preparing', 'Raising', 'Closed'][Math.floor(Math.random() * 4)]
      })) || [];
    },
  });

  // Filter companies based on search and filters
  const filteredCompanies = companies?.filter(company => {
    const matchesSearch = !searchTerm || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.sector?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || company.stage === stageFilter;
    const matchesSector = sectorFilter === 'all' || company.sector === sectorFilter;
    
    return matchesSearch && matchesStage && matchesSector;
  }) || [];

  // Calculate portfolio stats
  const portfolioStats = {
    totalCompanies: companies?.length || 0,
    totalValuation: companies?.reduce((sum, company) => sum + (company.arr || 0), 0) || 0,
    averageGrowth: companies?.length 
      ? (companies.reduce((sum, company) => sum + (company.growth || 0), 0) / companies.length)
      : 0,
    activeCompanies: companies?.filter(company => company.stage !== 'Exited').length || 0
  };

  // Get unique sectors for filter
  const sectors = Array.from(new Set(companies?.map(company => company.sector).filter(Boolean))) as string[];

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
            <CardTitle>Error Loading Portfolio</CardTitle>
            <CardDescription>Failed to load portfolio companies</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Enhanced Portfolio</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive view of your portfolio companies with advanced insights
        </p>
      </div>

      <PortfolioStats {...portfolioStats} />

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Seed">Seed</SelectItem>
              <SelectItem value="Series A">Series A</SelectItem>
              <SelectItem value="Series B">Series B</SelectItem>
              <SelectItem value="Series C+">Series C+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map(sector => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <PortfolioViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Company Display */}
      {view === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <EnhancedCompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <PortfolioList companies={filteredCompanies} />
      )}

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium">No companies found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedPortfolio;
