
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Users, 
  Building2, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import DataLoadingState from '@/components/data/DataLoadingState';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  totalUpdates: number;
  recentUpdates: number;
  overdueCompanies: number;
}

const AdminSystemHealth: React.FC = () => {
  const { data: systemStats, isLoading } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async (): Promise<SystemStats> => {
      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, is_active, last_seen_at');

      if (usersError) throw usersError;

      // Fetch companies
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id');

      if (companiesError) throw companiesError;

      // Fetch updates
      const { data: updates, error: updatesError } = await supabase
        .from('founder_updates')
        .select('id, submitted_at, company_id');

      if (updatesError) throw updatesError;

      // Calculate stats
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const activeUsers = users?.filter(user => 
        user.is_active && user.last_seen_at && 
        new Date(user.last_seen_at) > thirtyDaysAgo
      ).length || 0;

      const recentUpdates = updates?.filter(update => 
        new Date(update.submitted_at) > sevenDaysAgo
      ).length || 0;

      // Calculate overdue companies
      const updatesByCompany = new Map();
      updates?.forEach(update => {
        const companyId = update.company_id;
        if (!updatesByCompany.has(companyId) || 
            new Date(update.submitted_at) > new Date(updatesByCompany.get(companyId).submitted_at)) {
          updatesByCompany.set(companyId, update);
        }
      });

      const overdueCompanies = companies?.filter(company => {
        const latestUpdate = updatesByCompany.get(company.id);
        if (!latestUpdate) return true;
        const daysSince = Math.floor((now.getTime() - new Date(latestUpdate.submitted_at).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince > 30;
      }).length || 0;

      return {
        totalUsers: users?.length || 0,
        activeUsers,
        totalCompanies: companies?.length || 0,
        totalUpdates: updates?.length || 0,
        recentUpdates,
        overdueCompanies
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return <DataLoadingState />;
  }

  if (!systemStats) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Unable to Load System Health</h3>
          <p className="text-muted-foreground">
            There was an error loading system statistics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const userActivityRate = systemStats.totalUsers > 0 
    ? Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100)
    : 0;

  const updateComplianceRate = systemStats.totalCompanies > 0
    ? Math.round(((systemStats.totalCompanies - systemStats.overdueCompanies) / systemStats.totalCompanies) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.activeUsers} active in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4" />
              Portfolio Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.overdueCompanies} need updates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4" />
              Total Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUpdates}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.recentUpdates} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Database className="h-4 w-4" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Operational</span>
            </div>
            <p className="text-xs text-muted-foreground">All systems running</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Activity Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Users (30 days)</span>
              <Badge variant={userActivityRate > 70 ? 'default' : userActivityRate > 40 ? 'secondary' : 'destructive'}>
                {userActivityRate}%
              </Badge>
            </div>
            <Progress value={userActivityRate} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {systemStats.activeUsers} out of {systemStats.totalUsers} users have been active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Update Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Up-to-date Companies</span>
              <Badge variant={updateComplianceRate > 80 ? 'default' : updateComplianceRate > 60 ? 'secondary' : 'destructive'}>
                {updateComplianceRate}%
              </Badge>
            </div>
            <Progress value={updateComplianceRate} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {systemStats.totalCompanies - systemStats.overdueCompanies} companies have recent updates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {systemStats.overdueCompanies > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              {systemStats.overdueCompanies} companies haven't submitted updates in over 30 days. 
              Consider reaching out to encourage regular reporting.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSystemHealth;
