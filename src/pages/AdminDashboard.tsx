
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';
import DataLoadingState from '@/components/data/DataLoadingState';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminAuditLogs from '@/components/admin/AdminAuditLogs';

const AdminDashboard = () => {
  const { user, hasPermission } = useAuth();

  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [
        usersResult,
        companiesResult,
        dealsResult,
        lpLeadsResult,
        recentUpdatesResult,
        upcomingMeetingsResult
      ] = await Promise.all([
        supabase.from('users').select('role').eq('is_active', true),
        supabase.from('companies').select('id'),
        supabase.from('deals').select('id, stage'),
        supabase.from('lp_leads').select('confirmed_commitment'),
        supabase.from('founder_updates').select('*, companies(name)').order('submitted_at', { ascending: false }).limit(5),
        supabase.from('meetings').select('*, companies(name)').gte('start_time', new Date().toISOString()).order('start_time').limit(5)
      ]);

      const usersByRole = usersResult.data?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalCommittedFunds = lpLeadsResult.data?.reduce((sum, lead) => 
        sum + (lead.confirmed_commitment || 0), 0) || 0;

      const activeDeals = dealsResult.data?.filter(deal => 
        ['Discovery', 'Screening', 'Due Diligence', 'Partner Review'].includes(deal.stage)).length || 0;

      return {
        usersByRole,
        totalUsers: usersResult.data?.length || 0,
        totalCompanies: companiesResult.data?.length || 0,
        totalDeals: dealsResult.data?.length || 0,
        activeDeals,
        totalCommittedFunds,
        recentUpdates: recentUpdatesResult.data || [],
        upcomingMeetings: upcomingMeetingsResult.data || []
      };
    },
    enabled: hasPermission('manage:users'),
  });

  if (!hasPermission('manage:users')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <DataLoadingState />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System overview and management tools
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                <div className="flex gap-2 mt-2">
                  {Object.entries(stats?.usersByRole || {}).map(([role, count]) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Companies</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCompanies}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeDeals}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats?.totalDeals} total deals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LP Commitments</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(stats?.totalCommittedFunds || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Founder Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentUpdates.map((update) => (
                    <div key={update.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{update.companies?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ARR: ${(update.arr || 0).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(update.submitted_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                  {(!stats?.recentUpdates || stats.recentUpdates.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">No recent updates</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {meeting.companies?.name || 'General'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(meeting.start_time).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                  {(!stats?.upcomingMeetings || stats.upcomingMeetings.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">No upcoming meetings</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="audit">
          <AdminAuditLogs />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System configuration settings will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
