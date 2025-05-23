
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, Search, ArrowUpDown, AlertCircle, CheckCircle } from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

export interface Company {
  id: string;
  name: string;
  sector: string;
  location: string;
  investment_date: string;
  investment_amount: number;
  status: string;
  latest_update?: {
    submitted_at: string;
    arr: number;
    raise_status: string;
  };
}

interface PortfolioListProps {
  companies?: Company[];
}

const PortfolioList: React.FC<PortfolioListProps> = ({ companies: initialCompanies }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUpdateStatus, setFilterUpdateStatus] = useState('all');
  
  // Fetch portfolio companies with latest update info
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['portfolio-companies-with-updates'],
    queryFn: async () => {
      // Fetch companies
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // For each company, fetch its latest update
      const companiesWithUpdates = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: updates } = await supabase
            .from('founder_updates')
            .select('submitted_at, arr, raise_status')
            .eq('company_id', company.id)
            .order('submitted_at', { ascending: false })
            .limit(1);
          
          return {
            ...company,
            latest_update: updates && updates.length > 0 ? updates[0] : null
          };
        })
      );
      
      return companiesWithUpdates;
    },
    // If initialCompanies is provided, don't run this query
    enabled: !initialCompanies,
  });
  
  // Use either initialCompanies or fetched companies
  const displayCompanies = initialCompanies || companies;
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get update status
  const getUpdateStatus = (latestUpdate: any) => {
    if (!latestUpdate || !latestUpdate.submitted_at) return 'never';
    
    const lastUpdateDate = new Date(latestUpdate.submitted_at);
    const today = new Date();
    const daysSinceUpdate = differenceInDays(today, lastUpdateDate);
    
    if (daysSinceUpdate > 30) return 'overdue';
    return 'recent';
  };
  
  // Filter companies based on search, status and update status
  const filteredCompanies = displayCompanies
    .filter(company => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        company.name.toLowerCase().includes(searchLower) ||
        company.sector.toLowerCase().includes(searchLower) ||
        company.location.toLowerCase().includes(searchLower);
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
      
      // Update status filter
      const updateStatus = getUpdateStatus(company.latest_update);
      const matchesUpdateStatus = 
        filterUpdateStatus === 'all' || 
        (filterUpdateStatus === 'needs-update' && updateStatus === 'overdue') ||
        (filterUpdateStatus === 'updated' && updateStatus === 'recent');
      
      return matchesSearch && matchesStatus && matchesUpdateStatus;
    });
  
  // Sort companies
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    let aValue: any = a[sortField as keyof Company];
    let bValue: any = b[sortField as keyof Company];
    
    // Handle sorting for nested fields
    if (sortField === 'latest_arr') {
      aValue = a.latest_update?.arr || 0;
      bValue = b.latest_update?.arr || 0;
    } else if (sortField === 'latest_update_date') {
      aValue = a.latest_update?.submitted_at ? new Date(a.latest_update.submitted_at).getTime() : 0;
      bValue = b.latest_update?.submitted_at ? new Date(b.latest_update.submitted_at).getTime() : 0;
    }
    
    // Numeric comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // Default comparison
    return 0;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Exited': return 'bg-blue-100 text-blue-800';
      case 'Acquired': return 'bg-purple-100 text-purple-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRaiseStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Not Raising': return 'bg-gray-100 text-gray-800';
      case 'Preparing': return 'bg-blue-100 text-blue-800';
      case 'Raising': return 'bg-green-100 text-green-800';
      case 'Closing': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Exited">Exited</SelectItem>
              <SelectItem value="Acquired">Acquired</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterUpdateStatus} onValueChange={setFilterUpdateStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Updates</SelectItem>
              <SelectItem value="needs-update">Needs Update</SelectItem>
              <SelectItem value="updated">Recently Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Companies Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Company Name
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('sector')}
              >
                <div className="flex items-center gap-1">
                  Sector
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('latest_update_date')}
              >
                <div className="flex items-center gap-1">
                  Last Update
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('latest_arr')}
              >
                <div className="flex items-center gap-1">
                  Latest ARR
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Raise Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No companies found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              sortedCompanies.map((company) => {
                const updateStatus = getUpdateStatus(company.latest_update);
                
                return (
                  <TableRow key={company.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/company/${company.id}`)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {updateStatus === 'overdue' ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : updateStatus === 'recent' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : null}
                        {company.name}
                      </div>
                    </TableCell>
                    <TableCell>{company.sector}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(company.status)}>
                        {company.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {company.latest_update?.submitted_at ? (
                        <div className={cn(
                          updateStatus === 'overdue' && 'text-destructive font-medium',
                          updateStatus === 'recent' && 'text-green-600'
                        )}>
                          {format(new Date(company.latest_update.submitted_at), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-destructive font-medium">Never Updated</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.latest_update?.arr ? (
                        `$${company.latest_update.arr.toLocaleString()}`
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {company.latest_update?.raise_status ? (
                        <Badge className={getRaiseStatusColor(company.latest_update.raise_status)}>
                          {company.latest_update.raise_status}
                        </Badge>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="flex items-center gap-1">
                        View <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PortfolioList;
