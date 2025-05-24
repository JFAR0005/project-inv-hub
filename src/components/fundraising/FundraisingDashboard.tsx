
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

interface LPLead {
  id: string;
  name: string;
  type: 'Individual' | 'Family Office' | 'Institutional';
  status: 'Contacted' | 'Interested' | 'In DD' | 'Committed' | 'Declined';
  estimated_commitment?: number;
  confirmed_commitment?: number;
}

interface FundraisingDashboardProps {
  lpLeads: LPLead[];
}

const FundraisingDashboard: React.FC<FundraisingDashboardProps> = ({ lpLeads }) => {
  // Calculate summary metrics
  const totalEstimated = lpLeads.reduce((sum, lead) => sum + (lead.estimated_commitment || 0), 0);
  const totalConfirmed = lpLeads.reduce((sum, lead) => sum + (lead.confirmed_commitment || 0), 0);
  const totalLeads = lpLeads.length;
  const committedLeads = lpLeads.filter(lead => lead.status === 'Committed').length;

  // Status breakdown for bar chart
  const statusCounts = lpLeads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + (lead.estimated_commitment || 0);
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([status, amount]) => ({
    status,
    amount,
    count: lpLeads.filter(lead => lead.status === status).length
  }));

  // Type breakdown for pie chart
  const typeCounts = lpLeads.reduce((acc, lead) => {
    acc[lead.type] = (acc[lead.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstimated)}</div>
            <p className="text-xs text-muted-foreground">
              Across {totalLeads} leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Confirmed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalConfirmed)}</div>
            <p className="text-xs text-muted-foreground">
              From {committedLeads} committed LPs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalLeads > 0 ? Math.round((committedLeads / totalLeads) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Leads to commitment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lpLeads.filter(lead => !['Committed', 'Declined'].includes(lead.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Commitment Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${formatCurrency(Number(value))} (${statusData.find(d => d.amount === value)?.count || 0} leads)`,
                    'Amount'
                  ]}
                />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Contacted', 'Interested', 'In DD', 'Committed', 'Declined'].map((status) => {
              const leads = lpLeads.filter(lead => lead.status === status);
              const totalAmount = leads.reduce((sum, lead) => sum + (lead.estimated_commitment || 0), 0);
              
              return (
                <div key={status} className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold">{leads.length}</div>
                  <div className="text-sm text-muted-foreground">{status}</div>
                  <div className="text-sm font-medium mt-1">
                    {formatCurrency(totalAmount)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundraisingDashboard;
