
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  RefreshCw, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Search,
  Download,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

interface CompanyUpdateHistoryProps {
  companyId: string;
}

interface UpdateWithAnalytics {
  id: string;
  company_id: string;
  submitted_by: string;
  submitted_at: string;
  arr: number | null;
  mrr: number | null;
  burn_rate: number | null;
  runway: number | null;
  headcount: number | null;
  churn: number | null;
  growth: number | null;
  raise_status: string | null;
  raise_target_amount: number | null;
  comments: string | null;
  requested_intros: string | null;
  deck_url: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  // Analytics fields
  arrGrowth?: number;
  mrrGrowth?: number;
  headcountGrowth?: number;
  burnChange?: number;
  runwayChange?: number;
}

const CompanyUpdateHistory: React.FC<CompanyUpdateHistoryProps> = ({ companyId }) => {
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: updates, isLoading, error, refetch } = useQuery({
    queryKey: ['company-update-history', companyId, filterPeriod, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('founder_updates')
        .select(`
          *,
          user:submitted_by (id, name, email)
        `)
        .eq('company_id', companyId)
        .order('submitted_at', { ascending: false });

      // Apply date filter
      if (filterPeriod !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (filterPeriod) {
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1y':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('submitted_at', startDate.toISOString());
      }

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('raise_status', filterStatus);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data and calculate growth metrics
      const transformedData = (data || []).map((update, index, array) => {
        const previousUpdate = array[index + 1]; // Next in array is chronologically previous
        
        return {
          ...update,
          user: Array.isArray(update.user) && update.user.length > 0 ? update.user[0] : null,
          // Calculate growth metrics
          arrGrowth: previousUpdate?.arr && update.arr ? 
            ((update.arr - previousUpdate.arr) / previousUpdate.arr) * 100 : null,
          mrrGrowth: previousUpdate?.mrr && update.mrr ? 
            ((update.mrr - previousUpdate.mrr) / previousUpdate.mrr) * 100 : null,
          headcountGrowth: previousUpdate?.headcount && update.headcount ? 
            update.headcount - previousUpdate.headcount : null,
          burnChange: previousUpdate?.burn_rate && update.burn_rate ? 
            update.burn_rate - previousUpdate.burn_rate : null,
          runwayChange: previousUpdate?.runway && update.runway ? 
            update.runway - previousUpdate.runway : null,
        } as UpdateWithAnalytics;
      });
      
      return transformedData;
    },
    enabled: !!companyId,
  });

  // Filter updates based on search term
  const filteredUpdates = updates?.filter(update => 
    !searchTerm || 
    update.comments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    update.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    update.raise_status?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getRaiseStatusColor = (status: string | null) => {
    switch (status) {
      case 'Not Raising': return 'bg-gray-100 text-gray-800';
      case 'Preparing': return 'bg-blue-100 text-blue-800';
      case 'Raising': return 'bg-green-100 text-green-800';
      case 'Closing': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrowthIcon = (value: number | null) => {
    if (!value) return null;
    return value > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const formatGrowthValue = (value: number | null, isPercentage = true) => {
    if (!value) return 'N/A';
    const formatted = isPercentage ? `${value.toFixed(1)}%` : value.toString();
    return value > 0 ? `+${formatted}` : formatted;
  };

  const exportToCSV = () => {
    if (!filteredUpdates?.length) return;
    
    const headers = ['Date', 'ARR', 'MRR', 'Burn Rate', 'Runway', 'Headcount', 'Raise Status', 'Comments'];
    const csvContent = [
      headers.join(','),
      ...filteredUpdates.map(update => [
        format(new Date(update.submitted_at), 'yyyy-MM-dd'),
        update.arr || '',
        update.mrr || '',
        update.burn_rate || '',
        update.runway || '',
        update.headcount || '',
        update.raise_status || '',
        `"${update.comments?.replace(/"/g, '""') || ''}"` // Escape quotes
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company-updates-${companyId}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load update history. Please try again.
        </AlertDescription>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Update History</h3>
          <p className="text-sm text-muted-foreground">
            {filteredUpdates.length} update{filteredUpdates.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          {filteredUpdates.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search updates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Time Period</Label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Raise Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Not Raising">Not Raising</SelectItem>
                    <SelectItem value="Preparing">Preparing</SelectItem>
                    <SelectItem value="Raising">Raising</SelectItem>
                    <SelectItem value="Closing">Closing</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setFilterPeriod('all');
                    setFilterStatus('all');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Updates List */}
      {filteredUpdates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Updates Found</h3>
            <p className="text-muted-foreground">
              {updates?.length === 0 
                ? "No updates have been submitted for this company yet."
                : "No updates match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUpdates.map((update, index) => (
            <Card key={update.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(update.submitted_at), 'MMMM d, yyyy')}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      From {update.user?.name || 'Unknown User'}
                      {index === 0 && <Badge variant="outline" className="text-xs">Latest</Badge>}
                    </CardDescription>
                  </div>
                  {update.raise_status && (
                    <Badge className={getRaiseStatusColor(update.raise_status)}>
                      {update.raise_status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {update.arr !== null && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">ARR</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-medium">${update.arr.toLocaleString()}</p>
                        {update.arrGrowth !== null && (
                          <div className="flex items-center gap-1 text-sm">
                            {getGrowthIcon(update.arrGrowth)}
                            <span className={update.arrGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatGrowthValue(update.arrGrowth)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {update.mrr !== null && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">MRR</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-medium">${update.mrr.toLocaleString()}</p>
                        {update.mrrGrowth !== null && (
                          <div className="flex items-center gap-1 text-sm">
                            {getGrowthIcon(update.mrrGrowth)}
                            <span className={update.mrrGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatGrowthValue(update.mrrGrowth)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {update.burn_rate !== null && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Monthly Burn</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-medium">${update.burn_rate.toLocaleString()}</p>
                        {update.burnChange !== null && (
                          <div className="flex items-center gap-1 text-sm">
                            {getGrowthIcon(-update.burnChange)} {/* Negative because lower burn is better */}
                            <span className={update.burnChange < 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatGrowthValue(update.burnChange, false)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {update.headcount !== null && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Team Size</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-medium">{update.headcount}</p>
                        {update.headcountGrowth !== null && update.headcountGrowth !== 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            {getGrowthIcon(update.headcountGrowth)}
                            <span className={update.headcountGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatGrowthValue(update.headcountGrowth, false)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Secondary Metrics */}
                {(update.runway !== null || update.churn !== null || update.growth !== null) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {update.runway !== null && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Runway</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{update.runway} months</p>
                            {update.runwayChange !== null && update.runwayChange !== 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                {getGrowthIcon(update.runwayChange)}
                                <span className={update.runwayChange > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatGrowthValue(update.runwayChange, false)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {update.churn !== null && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Churn Rate</p>
                          <p className="font-medium">{update.churn}%</p>
                        </div>
                      )}
                      
                      {update.growth !== null && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Growth Rate</p>
                          <p className="font-medium">{update.growth}%</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {/* Comments and Additional Info */}
                {(update.comments || update.requested_intros) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      {update.comments && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Comments</p>
                          <p className="text-sm leading-relaxed">{update.comments}</p>
                        </div>
                      )}
                      
                      {update.requested_intros && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Requested Introductions</p>
                          <p className="text-sm leading-relaxed">{update.requested_intros}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {/* Fundraising Info */}
                {update.raise_target_amount && update.raise_status && update.raise_status !== 'Not Raising' && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Target Amount</p>
                        <p className="font-medium">${update.raise_target_amount.toLocaleString()}</p>
                      </div>
                      
                      {update.deck_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(update.deck_url!, '_blank')}
                        >
                          View Deck
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyUpdateHistory;
