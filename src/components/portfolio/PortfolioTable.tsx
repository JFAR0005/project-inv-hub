
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, TrendingUp, TrendingDown, ExternalLink, Search, Filter } from 'lucide-react';
import { format, isAfter, subDays } from 'date-fns';

interface CompanyWithHealth {
  id: string;
  name: string;
  sector: string | null;
  stage: string | null;
  last_update: string | null;
  latest_arr: number | null;
  latest_mrr: number | null;
  latest_growth: number | null;
  latest_runway: number | null;
  raise_status: string | null;
  needs_attention: boolean;
  days_since_update: number;
  assigned_partner: string | null;
}

const PortfolioTable: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyWithHealth[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [raiseFilter, setRaiseFilter] = useState('all');
  const [updateFilter, setUpdateFilter] = useState('all');

  useEffect(() => {
    if (user && ['admin', 'partner', 'lp'].includes(user.role)) {
      fetchCompaniesWithHealth();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [companies, searchTerm, raiseFilter, updateFilter]);

  const fetchCompaniesWithHealth = async () => {
    try {
      setLoading(true);

      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
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

      // Process companies with health data
      const companiesWithHealth: CompanyWithHealth[] = companiesData.map(company => {
        const latestUpdate = updatesByCompany[company.id];
        const lastUpdateDate = latestUpdate ? new Date(latestUpdate.submitted_at) : null;
        const daysSinceUpdate = lastUpdateDate 
          ? Math.floor((new Date().getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        const needsAttention = !latestUpdate || daysSinceUpdate > 30 || 
          (latestUpdate && latestUpdate.runway !== null && latestUpdate.runway < 6);

        return {
          id: company.id,
          name: company.name,
          sector: company.sector,
          stage: company.stage,
          last_update: latestUpdate?.submitted_at || null,
          latest_arr: latestUpdate?.arr || null,
          latest_mrr: latestUpdate?.mrr || null,
          latest_growth: latestUpdate?.growth || null,
          latest_runway: latestUpdate?.runway || null,
          raise_status: latestUpdate?.raise_status || null,
          needs_attention: needsAttention,
          days_since_update: daysSinceUpdate,
          assigned_partner: null, // TODO: Add partner assignment logic
        };
      });

      setCompanies(companiesWithHealth);
    } catch (error) {
      console.error('Error fetching companies with health:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = companies;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.sector && company.sector.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Raise status filter
    if (raiseFilter !== 'all') {
      if (raiseFilter === 'raising') {
        filtered = filtered.filter(company => company.raise_status === 'Raising');
      } else if (raiseFilter === 'not-raising') {
        filtered = filtered.filter(company => company.raise_status !== 'Raising');
      }
    }

    // Update filter
    if (updateFilter !== 'all') {
      if (updateFilter === 'overdue') {
        filtered = filtered.filter(company => company.needs_attention);
      } else if (updateFilter === 'recent') {
        filtered = filtered.filter(company => company.days_since_update <= 30);
      }
    }

    setFilteredCompanies(filtered);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const getRaiseStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Raising':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Raising</Badge>;
      case 'Closed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Closed</Badge>;
      case 'Planning':
        return <Badge variant="secondary">Planning</Badge>;
      case 'Not Raising':
        return <Badge variant="outline">Not Raising</Badge>;
      default:
        return status ? <Badge variant="outline">{status}</Badge> : <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getUpdateHealthBadge = (company: CompanyWithHealth) => {
    if (company.days_since_update > 30) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (company.days_since_update <= 7) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Recent</Badge>;
    } else if (company.days_since_update <= 14) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Due Soon</Badge>;
    }
    return <Badge variant="secondary">On Track</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Portfolio Health Dashboard
        </CardTitle>
        <CardDescription>
          Monitor update status, fundraising activity, and portfolio health across all companies
        </CardDescription>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={raiseFilter} onValueChange={setRaiseFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by raise status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Raise Status</SelectItem>
              <SelectItem value="raising">Currently Raising</SelectItem>
              <SelectItem value="not-raising">Not Raising</SelectItem>
            </SelectContent>
          </Select>

          <Select value={updateFilter} onValueChange={setUpdateFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by updates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Updates</SelectItem>
              <SelectItem value="overdue">Overdue Updates</SelectItem>
              <SelectItem value="recent">Recent Updates</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Update Health</TableHead>
                <TableHead>Raise Status</TableHead>
                <TableHead>Latest ARR</TableHead>
                <TableHead>Growth</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow 
                  key={company.id}
                  className={company.needs_attention ? 'bg-red-50 border-red-200' : ''}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {company.needs_attention && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {company.sector && (
                            <Badge variant="outline" className="text-xs">{company.sector}</Badge>
                          )}
                          {company.stage && (
                            <Badge variant="secondary" className="text-xs">{company.stage}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {company.last_update ? (
                      <div>
                        <div className="text-sm">
                          {format(new Date(company.last_update), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {company.days_since_update} days ago
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No updates</div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {getUpdateHealthBadge(company)}
                  </TableCell>
                  
                  <TableCell>
                    {getRaiseStatusBadge(company.raise_status)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">{formatCurrency(company.latest_arr)}</div>
                  </TableCell>
                  
                  <TableCell>
                    {company.latest_growth !== null ? (
                      <div className="flex items-center">
                        {company.latest_growth >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={company.latest_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {company.latest_growth}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/companies/${company.id}`}>
                        View Details
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No companies match the current filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{companies.length}</div>
            <div className="text-sm text-muted-foreground">Total Companies</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {companies.filter(c => c.needs_attention).length}
            </div>
            <div className="text-sm text-muted-foreground">Need Attention</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {companies.filter(c => c.raise_status === 'Raising').length}
            </div>
            <div className="text-sm text-muted-foreground">Currently Raising</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {companies.filter(c => c.days_since_update <= 7).length}
            </div>
            <div className="text-sm text-muted-foreground">Recent Updates</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioTable;
