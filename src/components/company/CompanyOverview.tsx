
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database } from '@/integrations/supabase/types';
import { Building2, MapPin, Globe, Users, DollarSign, TrendingUp, Calendar, AlertCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import CommentSection from '@/components/comments/CommentSection';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type Company = Database['public']['Tables']['companies']['Row'];
type FounderUpdate = Database['public']['Tables']['founder_updates']['Row'];

interface CompanyOverviewProps {
  company: Company;
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({ company }) => {
  const [recentUpdates, setRecentUpdates] = useState<FounderUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentUpdates = async () => {
      if (!company.id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('founder_updates')
          .select('*')
          .eq('company_id', company.id)
          .order('submitted_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentUpdates(data || []);
      } catch (err) {
        console.error('Error fetching recent updates:', err);
        setError('Failed to load recent updates.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentUpdates();
  }, [company.id]);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number | null) => {
    if (!num) return 'Not specified';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getRaiseStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    let variant = 'secondary';
    
    if (status.toLowerCase().includes('active') || status.toLowerCase().includes('raising')) {
      variant = 'success';
    } else if (status.toLowerCase().includes('planned')) {
      variant = 'warning';
    } else if (status.toLowerCase().includes('not')) {
      variant = 'outline';
    }
    
    return <Badge variant={variant as any}>{status}</Badge>;
  };

  const getUpdateAge = (updateDate: string | null) => {
    if (!updateDate) return null;
    
    const today = new Date();
    const submitted = new Date(updateDate);
    const diffTime = Math.abs(today.getTime() - submitted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Company Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{company.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.sector && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{company.sector}</Badge>
                  <span className="text-sm text-muted-foreground">Sector</span>
                </div>
              )}
              
              {company.stage && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{company.stage}</Badge>
                  <span className="text-sm text-muted-foreground">Stage</span>
                </div>
              )}
              
              {company.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{company.location}</span>
                </div>
              )}
              
              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {new URL(company.website).hostname}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : recentUpdates.length > 0 ? (
              <div className="space-y-4">
                {recentUpdates.map((update) => (
                  <Card key={update.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(update.submitted_at), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getRaiseStatusBadge(update.raise_status)}
                            {update.arr && (
                              <span className="font-medium">
                                ARR: {formatCurrency(update.arr)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          {getUpdateAge(update.submitted_at) && getUpdateAge(update.submitted_at)! > 30 ? (
                            <Badge variant="destructive">
                              {getUpdateAge(update.submitted_at)} days old
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {getUpdateAge(update.submitted_at)} days old
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Burn Rate</span>
                          <span className="font-medium">{formatCurrency(update.burn_rate)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Runway</span>
                          <span className="font-medium">
                            {update.runway ? `${update.runway} months` : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Headcount</span>
                          <span className="font-medium">{formatNumber(update.headcount)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">MRR</span>
                          <span className="font-medium">{formatCurrency(update.mrr)}</span>
                        </div>
                      </div>
                      
                      {update.comments && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Comments</div>
                          <p className="text-sm line-clamp-2">{update.comments}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Updates Found</h3>
                <p className="text-muted-foreground mb-4">
                  This company hasn't submitted any updates yet.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate(`/company-profile/${company.id}/updates`)}>
              View All Updates <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{formatCurrency(company.arr)}</p>
                <p className="text-sm text-muted-foreground">ARR</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{formatCurrency(company.mrr)}</p>
                <p className="text-sm text-muted-foreground">MRR</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{formatNumber(company.headcount)}</p>
                <p className="text-sm text-muted-foreground">Headcount</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold">{formatCurrency(company.burn_rate)}</p>
                <p className="text-sm text-muted-foreground">Monthly Burn</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold">{company.runway ? `${company.runway}mo` : 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Runway</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold">{company.churn_rate ? `${company.churn_rate}%` : 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <CommentSection companyId={company.id} />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <ActivityFeed companyId={company.id} limit={10} />
      </div>
    </div>
  );
};

export default CompanyOverview;
