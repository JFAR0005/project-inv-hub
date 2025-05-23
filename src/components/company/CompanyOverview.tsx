
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Globe, Calendar, Mail, Phone, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { truncate } from '@/lib/utils';

interface CompanyOverviewProps {
  company: any;
}

interface Update {
  id: string;
  company_id: string;
  submitted_at: string;
  arr: number | null;
  mrr: number | null;
  raise_status: string | null;
  comments: string | null;
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({ company }) => {
  // Fetch the latest 3 updates for this company
  const { data: recentUpdates, isLoading } = useQuery({
    queryKey: ['recent-updates', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('founder_updates')
        .select('id, company_id, submitted_at, arr, mrr, raise_status, comments')
        .eq('company_id', company.id)
        .order('submitted_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as Update[];
    },
    enabled: !!company.id,
  });
  
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Company Info */}
      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Company Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Building2 className="h-4 w-4 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">{company.name}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{company.location || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Globe className="h-4 w-4 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                  {company.website || 'Not available'}
                </a>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Founded</p>
                <p className="font-medium">
                  {company.founded_year ? company.founded_year : 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${company.email}`} className="font-medium text-blue-600 hover:underline">
                  {company.email || 'Not available'}
                </a>
              </div>
            </div>
            
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a href={`tel:${company.phone}`} className="font-medium">
                  {company.phone || 'Not available'}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">CEO</p>
              <p className="font-medium">{company.ceo_name || 'Not specified'}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">CTO</p>
              <p className="font-medium">{company.cto_name || 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Company Description & Updates */}
      <div className="col-span-1 lg:col-span-2 space-y-6">
        {/* Company Description */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              {company.description || 'No description available for this company.'}
            </p>
          </CardContent>
        </Card>
        
        {/* Recent Updates */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Updates
              </CardTitle>
            </div>
            <CardDescription>
              Latest updates from the company
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : !recentUpdates || recentUpdates.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-muted-foreground">No updates available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUpdates.map((update) => (
                  <div key={update.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">
                        {format(new Date(update.submitted_at), 'MMMM d, yyyy')}
                      </p>
                      {update.raise_status && (
                        <Badge className={getRaiseStatusColor(update.raise_status)}>
                          {update.raise_status}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      {update.arr !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground">ARR</p>
                          <p className="text-sm font-medium">${update.arr.toLocaleString()}</p>
                        </div>
                      )}
                      
                      {update.mrr !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground">MRR</p>
                          <p className="text-sm font-medium">${update.mrr.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    
                    {update.comments && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Comments</p>
                        <p className="text-sm">{truncate(update.comments, 100)}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="flex justify-end pt-2">
                  <Button variant="outline" size="sm" className="flex items-center" onClick={() => document.querySelectorAll('[role="tab"]')[3].click()}>
                    View All Updates
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyOverview;
