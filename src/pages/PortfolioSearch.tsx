import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PortfolioSkeleton from '@/components/portfolio/PortfolioSkeleton';
import PortfolioError from '@/components/portfolio/PortfolioError';
import PortfolioEmpty from '@/components/portfolio/PortfolioEmpty';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import PortfolioTable from '@/components/portfolio/PortfolioTable';
import AdvancedSearchFilters from '@/components/search/AdvancedSearchFilters';
import SearchInput from '@/components/search/SearchInput';
import { useSearch, SearchFilters } from '@/context/SearchContext';
import { Search, LayoutGrid, List, CircleDollarSign } from 'lucide-react';

const PortfolioSearch: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { filters, setFilters } = useSearch();
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);

  // Fetch all companies
  const { data: companies = [], isLoading, error, refetch } = useQuery({
    queryKey: ['portfolio-search'],
    queryFn: async () => {
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*, founder_updates(submitted_at, arr, mrr, raise_status, burn_rate, runway)');
      
      if (error) throw error;

      // Process data to include latest update info
      return companiesData.map(company => {
        const updates = company.founder_updates || [];
        const sortedUpdates = [...updates].sort((a, b) => 
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        );
        
        return {
          ...company,
          latest_update: sortedUpdates.length > 0 ? sortedUpdates[0] : null,
        };
      });
    },
    staleTime: 60000, // 1 minute
  });

  // Apply filters whenever they change
  useEffect(() => {
    if (!companies.length) return;

    let results = [...companies];

    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(company => 
        company.name.toLowerCase().includes(query) || 
        company.sector?.toLowerCase().includes(query) || 
        company.description?.toLowerCase().includes(query)
      );
    }

    // Apply sector filter
    if (filters.sectors.length > 0) {
      results = results.filter(company => 
        company.sector && filters.sectors.includes(company.sector)
      );
    }

    // Apply stage filter
    if (filters.stages.length > 0) {
      results = results.filter(company => 
        company.stage && filters.stages.includes(company.stage)
      );
    }

    // Apply status filter
    if (filters.statuses.length > 0) {
      results = results.filter(company => 
        company.latest_update?.raise_status && 
        filters.statuses.includes(company.latest_update.raise_status)
      );
    }

    // Apply metrics filters
    if (filters.metrics.arr?.min || filters.metrics.arr?.max) {
      results = results.filter(company => {
        const arr = company.latest_update?.arr || company.arr || 0;
        const min = filters.metrics.arr?.min;
        const max = filters.metrics.arr?.max;
        
        if (min !== undefined && max !== undefined) {
          return arr >= min && arr <= max;
        } else if (min !== undefined) {
          return arr >= min;
        } else if (max !== undefined) {
          return arr <= max;
        }
        return true;
      });
    }

    // Apply sorting
    results.sort((a, b) => {
      let valueA, valueB;
      
      switch (filters.sortBy) {
        case 'arr':
          valueA = a.latest_update?.arr || a.arr || 0;
          valueB = b.latest_update?.arr || b.arr || 0;
          break;
        case 'runway':
          valueA = a.latest_update?.runway || 0;
          valueB = b.latest_update?.runway || 0;
          break;
        case 'last_update':
          valueA = a.latest_update ? new Date(a.latest_update.submitted_at).getTime() : 0;
          valueB = b.latest_update ? new Date(b.latest_update.submitted_at).getTime() : 0;
          break;
        case 'name':
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
      }
      
      if (filters.sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredCompanies(results);
  }, [companies, searchQuery, filters]);

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin']}>
        <Layout>
          <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Portfolio Search</h1>
                <p className="text-muted-foreground mt-1">
                  Advanced search and filtering for your portfolio
                </p>
              </div>
            </div>
            <PortfolioSkeleton viewMode="grid" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin']}>
        <Layout>
          <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Portfolio Search</h1>
                <p className="text-muted-foreground mt-1">
                  Advanced search and filtering for your portfolio
                </p>
              </div>
            </div>
            <PortfolioError error={error as Error} onRetry={refetch} />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Portfolio Search</h1>
              <p className="text-muted-foreground mt-1">
                Advanced search and filtering for your portfolio
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}>
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                {viewMode === 'grid' ? ' Table View' : ' Grid View'}
              </Button>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies..."
                  onClear={() => setSearchQuery('')}
                />
              </div>
              <div className="flex gap-2">
                <AdvancedSearchFilters onApplyFilters={(f) => setFilters(f)} />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Found {filteredCompanies.length} companies
              </div>
            </div>
          </div>

          {companies.length === 0 ? (
            <PortfolioEmpty />
          ) : filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-bold mb-2">No results found</h2>
              <p className="text-muted-foreground">
                No companies match your search criteria. Try adjusting your filters.
              </p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    query: '',
                    sectors: [],
                    stages: [],
                    metrics: {},
                    statuses: [],
                    sortBy: 'name',
                    sortDirection: 'asc',
                  });
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <Tabs value={viewMode}>
              <TabsContent value="grid" className="mt-0">
                <PortfolioGrid companies={filteredCompanies} />
              </TabsContent>
              <TabsContent value="table" className="mt-0">
                <PortfolioTable companies={filteredCompanies} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default PortfolioSearch;
