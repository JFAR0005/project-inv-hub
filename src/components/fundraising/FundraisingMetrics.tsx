
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Users, Target, Clock, AlertCircle } from 'lucide-react';

interface LPLead {
  id: string;
  name: string;
  type: 'Individual' | 'Family Office' | 'Institutional';
  status: 'Contacted' | 'Interested' | 'In DD' | 'Committed' | 'Declined';
  estimated_commitment?: number;
  confirmed_commitment?: number;
  next_followup_date?: string;
}

interface FundraisingMetricsProps {
  lpLeads: LPLead[];
}

const FundraisingMetrics: React.FC<FundraisingMetricsProps> = ({ lpLeads }) => {
  // Calculate metrics
  const totalEstimated = lpLeads.reduce((sum, lead) => sum + (lead.estimated_commitment || 0), 0);
  const totalConfirmed = lpLeads.reduce((sum, lead) => sum + (lead.confirmed_commitment || 0), 0);
  const conversionRate = totalEstimated > 0 ? (totalConfirmed / totalEstimated) * 100 : 0;
  
  const statusCounts = lpLeads.reduce((counts, lead) => {
    counts[lead.status] = (counts[lead.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const typeCounts = lpLeads.reduce((counts, lead) => {
    counts[lead.type] = (counts[lead.type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Calculate follow-up metrics
  const today = new Date();
  const overdueFollowUps = lpLeads.filter(lead => {
    if (!lead.next_followup_date) return false;
    return new Date(lead.next_followup_date) < today;
  }).length;

  const upcomingFollowUps = lpLeads.filter(lead => {
    if (!lead.next_followup_date) return false;
    const followupDate = new Date(lead.next_followup_date);
    const daysDiff = Math.ceil((followupDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff <= 7;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Pipeline Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalEstimated)}</div>
          <p className="text-xs text-muted-foreground">
            Estimated commitments from {lpLeads.length} LPs
          </p>
        </CardContent>
      </Card>

      {/* Confirmed Commitments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalConfirmed)}</div>
          <p className="text-xs text-muted-foreground">
            {statusCounts['Committed'] || 0} committed LPs
          </p>
          <Progress value={conversionRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {conversionRate.toFixed(1)}% conversion rate
          </p>
        </CardContent>
      </Card>

      {/* Active Pipeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Pipeline</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {(statusCounts['Contacted'] || 0) + (statusCounts['Interested'] || 0) + (statusCounts['In DD'] || 0)}
          </div>
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-xs">
              <span>Contacted</span>
              <Badge variant="secondary">{statusCounts['Contacted'] || 0}</Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span>Interested</span>
              <Badge variant="secondary">{statusCounts['Interested'] || 0}</Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span>In DD</span>
              <Badge variant="secondary">{statusCounts['In DD'] || 0}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overdue</span>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <Badge variant="destructive">{overdueFollowUps}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">This Week</span>
              <Badge variant="outline">{upcomingFollowUps}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LP Type Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">LP Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{typeCounts['Individual'] || 0}</div>
              <p className="text-xs text-muted-foreground">Individual</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{typeCounts['Family Office'] || 0}</div>
              <p className="text-xs text-muted-foreground">Family Office</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{typeCounts['Institutional'] || 0}</div>
              <p className="text-xs text-muted-foreground">Institutional</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Health */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Pipeline Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Declined Rate</span>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">
                  {lpLeads.length > 0 ? ((statusCounts['Declined'] || 0) / lpLeads.length * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Deal Size</span>
              <span className="text-sm font-medium">
                {lpLeads.length > 0 ? formatCurrency(totalEstimated / lpLeads.length) : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pipeline Velocity</span>
              <Badge variant="outline">
                {((statusCounts['Interested'] || 0) + (statusCounts['In DD'] || 0))} moving forward
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundraisingMetrics;
