
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

interface LPLead {
  id: string;
  name: string;
  type: 'Individual' | 'Family Office' | 'Institutional';
  status: 'Contacted' | 'Interested' | 'In DD' | 'Committed' | 'Declined';
  estimated_commitment?: number;
  confirmed_commitment?: number;
  next_followup_date?: string;
}

interface FundraisingPipelineSummaryProps {
  lpLeads: LPLead[];
}

const FundraisingPipelineSummary: React.FC<FundraisingPipelineSummaryProps> = ({ lpLeads }) => {
  // Calculate pipeline data for bar chart
  const pipelineData = ['Contacted', 'Interested', 'In DD', 'Committed', 'Declined'].map(status => {
    const leads = lpLeads.filter(lead => lead.status === status);
    const count = leads.length;
    const totalEstimated = leads.reduce((sum, lead) => sum + (lead.estimated_commitment || 0), 0);
    const totalConfirmed = leads.reduce((sum, lead) => sum + (lead.confirmed_commitment || 0), 0);
    
    return {
      status,
      count,
      estimated: totalEstimated,
      confirmed: totalConfirmed
    };
  });

  // Calculate LP type distribution for pie chart
  const typeData = ['Individual', 'Family Office', 'Institutional'].map(type => {
    const count = lpLeads.filter(lead => lead.type === type).length;
    return {
      type,
      count,
      value: count
    };
  }).filter(item => item.count > 0);

  // Calculate follow-up metrics
  const today = new Date();
  const upcomingFollowUps = lpLeads.filter(lead => {
    if (!lead.next_followup_date) return false;
    const followupDate = new Date(lead.next_followup_date);
    const daysDiff = Math.ceil((followupDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff <= 7;
  }).length;

  const overdueFollowUps = lpLeads.filter(lead => {
    if (!lead.next_followup_date) return false;
    const followupDate = new Date(lead.next_followup_date);
    return followupDate < today;
  }).length;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(lpLeads.reduce((sum, lead) => sum + (lead.estimated_commitment || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated commitments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(lpLeads.reduce((sum, lead) => sum + (lead.confirmed_commitment || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Committed capital
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active LPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lpLeads.filter(lead => !['Committed', 'Declined'].includes(lead.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              In pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overdueFollowUps}
            </div>
            <p className="text-xs text-muted-foreground">
              Overdue • {upcomingFollowUps} this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by Stage Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="status" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === 'estimated' ? 'Estimated' : 'Confirmed'
                  ]}
                  labelFormatter={(label) => `${label} (${pipelineData.find(d => d.status === label)?.count || 0} LPs)`}
                />
                <Bar dataKey="estimated" fill="#8884d8" name="estimated" />
                <Bar dataKey="confirmed" fill="#82ca9d" name="confirmed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LP Type Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>LP Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count, value }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} LPs`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stage Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Stage</th>
                  <th className="text-right p-2">Count</th>
                  <th className="text-right p-2">Estimated</th>
                  <th className="text-right p-2">Confirmed</th>
                  <th className="text-right p-2">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {pipelineData.map((stage) => (
                  <tr key={stage.status} className="border-b">
                    <td className="p-2 font-medium">{stage.status}</td>
                    <td className="text-right p-2">{stage.count}</td>
                    <td className="text-right p-2">{formatCurrency(stage.estimated)}</td>
                    <td className="text-right p-2">{formatCurrency(stage.confirmed)}</td>
                    <td className="text-right p-2">
                      {stage.estimated > 0 
                        ? `${Math.round((stage.confirmed / stage.estimated) * 100)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundraisingPipelineSummary;
