
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, ChevronRight, AlertCircle, Search } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, isAfter } from 'date-fns';

interface CompanyWithUpdates {
  id: string;
  name: string;
  sector: string | null;
  stage: string | null;
  arr: number | null;
  mrr: number | null;
  burn_rate: number | null;
  runway: number | null;
  headcount: number | null;
  churn: number | null;
  raise_status: string | null;
  deck_url: string | null;
  last_update: string | null;
  needs_attention: boolean;
}

export default function Portfolio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<CompanyWithUpdates[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithUpdates[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [uniqueStages, setUniqueStages] = useState<string[]>([]);
  const [uniqueSectors, setUniqueSectors] = useState<string[]>([]);

  // Access control check for non-admin users
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'partner' && user.role !== 'lp') {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have access to this page",
        variant: "destructive",
      });
    }
  }, [user, navigate, toast]);

  // Fetch company data
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Fetch all companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*');
          
        if (companiesError) throw companiesError;
        
        // Fetch all founder updates
        const { data: updatesData, error: updatesError } = await supabase
          .from('founder_updates')
          .select('*')
          .order('submitted_at', { ascending: false });
          
        if (updatesError) throw updatesError;
        
        // Group updates by company
        const updatesByCompany = updatesData.reduce((acc: Record<string, any[]>, update) => {
          if (!acc[update.company_id]) {
            acc[update.company_id] = [];
          }
          acc[update.company_id].push(update);
          return acc;
        }, {});
        
        // Combine company data with latest update info
        const companiesWithUpdates: CompanyWithUpdates[] = companiesData.map((company) => {
          const companyUpdates = updatesByCompany[company.id] || [];
          const latestUpdate = companyUpdates[0]; // First one is the most recent
          
          const needsAttention = latestUpdate 
            ? (isAfter(new Date(), addDays(new Date(latestUpdate.submitted_at), 30)) || // No update in 30+ days
               latestUpdate.raise_status === 'Raising') // Currently raising
            : true; // No updates at all
          
          return {
            id: company.id,
            name: company.name,
            sector: company.sector,
            stage: company.stage,
            arr: latestUpdate?.arr || null,
            mrr: latestUpdate?.mrr || null,
            burn_rate: latestUpdate?.burn_rate || null,
            runway: latestUpdate?.runway || null,
            headcount: latestUpdate?.headcount || null,
            churn: latestUpdate?.churn || null,
            raise_status: latestUpdate?.raise_status || null,
            deck_url: latestUpdate?.deck_url || null,
            last_update: latestUpdate ? latestUpdate.submitted_at : null,
            needs_attention: needsAttention,
          };
        });
        
        setCompanies(companiesWithUpdates);
        setFilteredCompanies(companiesWithUpdates);
        
        // Extract unique stages and sectors for filters
        const stages = Array.from(new Set(companiesData.map(c => c.stage).filter(Boolean))) as string[];
        const sectors = Array.from(new Set(companiesData.map(c => c.sector).filter(Boolean))) as string[];
        
        setUniqueStages(stages);
        setUniqueSectors(sectors);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        toast({
          title: "Error",
          description: "Failed to load portfolio data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanies();
  }, [user, toast]);

  // Apply filters when filter values change
  useEffect(() => {
    if (companies.length === 0) return;
    
    let filtered = [...companies];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(term) || 
        (company.sector && company.sector.toLowerCase().includes(term)) ||
        (company.stage && company.stage.toLowerCase().includes(term))
      );
    }
    
    // Apply stage filter
    if (stageFilter) {
      filtered = filtered.filter(company => company.stage === stageFilter);
    }
    
    // Apply sector filter
    if (sectorFilter) {
      filtered = filtered.filter(company => company.sector === sectorFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      if (statusFilter === 'raising') {
        filtered = filtered.filter(company => company.raise_status === 'Raising');
      } else if (statusFilter === 'needs_update') {
        filtered = filtered.filter(company => 
          !company.last_update || 
          isAfter(new Date(), addDays(new Date(company.last_update), 30))
        );
      } else if (statusFilter === 'needs_attention') {
        filtered = filtered.filter(company => company.needs_attention);
      }
    }
    
    setFilteredCompanies(filtered);
  }, [companies, searchTerm, stageFilter, sectorFilter, statusFilter]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center py-8">Loading portfolio data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Portfolio Overview</h1>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Portfolio Updates</CardTitle>
            <CardDescription>
              View and filter company metrics, updates, and status across the portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  prefixIcon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Stages</SelectItem>
                    {uniqueStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sectors</SelectItem>
                    {uniqueSectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="raising">Raising</SelectItem>
                    <SelectItem value="needs_update">Needs Update</SelectItem>
                    <SelectItem value="needs_attention">Needs Attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Company</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>ARR</TableHead>
                    <TableHead>Raise Status</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id} className={company.needs_attention ? 'bg-amber-50' : ''}>
                        <TableCell>
                          <div className="font-medium">
                            {company.name}
                            {company.needs_attention && (
                              <AlertCircle className="h-4 w-4 text-amber-500 inline ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {company.sector || 'Unknown sector'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{company.stage || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell>
                          {company.arr !== null 
                            ? `$${company.arr.toLocaleString()}` 
                            : 'No data'}
                        </TableCell>
                        <TableCell>
                          {company.raise_status ? (
                            company.raise_status === 'Raising' 
                              ? <Badge variant="destructive">{company.raise_status}</Badge>
                              : <Badge variant="secondary">{company.raise_status}</Badge>
                          ) : (
                            <span className="text-muted-foreground">No data</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {company.last_update 
                            ? format(new Date(company.last_update), 'PP')
                            : <Badge variant="outline">No updates</Badge>
                          }
                          {company.last_update && isAfter(new Date(), addDays(new Date(company.last_update), 30)) && (
                            <div className="text-sm text-amber-600 mt-1">
                              Update overdue
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {company.deck_url && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/companies/${company.id}?tab=documents`}>
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">View Deck</span>
                                </Link>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/companies/${company.id}`}>
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">View Company</span>
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No companies found matching the current filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
