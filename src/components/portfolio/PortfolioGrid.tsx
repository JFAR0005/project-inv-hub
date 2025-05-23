
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';
import { CompanyCardData } from './CompanyCard';
import CompanyCard from './CompanyCard';
import { isAfter, subDays } from 'date-fns';

const PortfolioGrid: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyCardData[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);

  const showSensitiveData = user?.role === 'admin' || user?.role === 'partner';

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'partner' || user.role === 'lp')) {
      fetchCompanies();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [companies, searchTerm, sectorFilter, stageFilter, statusFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (companiesError) throw companiesError;

      // Fetch latest founder updates
      const { data: updatesData, error: updatesError } = await supabase
        .from('founder_updates')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (updatesError) throw updatesError;

      // Group updates by company and get the latest one
      const updatesByCompany = updatesData.reduce((acc: Record<string, any>, update) => {
        if (!acc[update.company_id] || new Date(update.submitted_at) > new Date(acc[update.company_id].submitted_at)) {
          acc[update.company_id] = update;
        }
        return acc;
      }, {});

      // Combine company data with latest metrics
      const companiesWithMetrics: CompanyCardData[] = companiesData.map(company => {
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

      setCompanies(companiesWithMetrics);

      // Extract unique sectors and stages for filters
      const uniqueSectors = Array.from(new Set(companiesData.map(c => c.sector).filter(Boolean))) as string[];
      const uniqueStages = Array.from(new Set(companiesData.map(c => c.stage).filter(Boolean))) as string[];
      
      setSectors(uniqueSectors);
      setStages(uniqueStages);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...companies];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(term) ||
        (company.sector && company.sector.toLowerCase().includes(term))
      );
    }

    // Sector filter
    if (sectorFilter) {
      filtered = filtered.filter(company => company.sector === sectorFilter);
    }

    // Stage filter
    if (stageFilter) {
      filtered = filtered.filter(company => company.stage === stageFilter);
    }

    // Status filter
    if (statusFilter === 'raising') {
      filtered = filtered.filter(company => company.raise_status === 'Raising');
    } else if (statusFilter === 'attention') {
      filtered = filtered.filter(company => company.needs_attention);
    }

    setFilteredCompanies(filtered);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sectors</SelectItem>
              {sectors.map(sector => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Stages</SelectItem>
              {stages.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="raising">Raising</SelectItem>
              <SelectItem value="attention">Needs Attention</SelectItem>
            </SelectContent>
          </Select>

          {user?.role === 'admin' && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          )}
        </div>
      </div>

      {/* Company Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {companies.length === 0 
              ? 'No companies in the portfolio yet.'
              : 'No companies match your current filters.'
            }
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <CompanyCard 
              key={company.id} 
              company={company}
              showSensitiveData={showSensitiveData}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioGrid;
