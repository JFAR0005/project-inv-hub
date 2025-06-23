
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Calendar,
  Bell,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { usePortfolioHealth } from '@/hooks/usePortfolioHealth';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import NotificationBanner from '@/components/notifications/NotificationBanner';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: healthData, isLoading } = usePortfolioHealth();
  const { overdueCompanies, totalCompanies } = useNotificationSystem();

  const stats = [
    {
      title: 'Total Companies',
      value: healthData?.totalCompanies || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Need Updates',
      value: healthData?.companiesNeedingUpdate || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Actively Raising',
      value: healthData?.companiesRaising || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Recent Updates',
      value: healthData?.recentUpdates || 0,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || user?.email}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your portfolio today.
        </p>
      </div>

      {/* Notification Banner */}
      <NotificationBanner />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Cards */}
      {overdueCompanies.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Overdue Updates Alert
            </CardTitle>
            <CardDescription>
              {overdueCompanies.length} compan{overdueCompanies.length !== 1 ? 'ies' : 'y'} {overdueCompanies.length !== 1 ? 'have' : 'has'} not submitted updates in over 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {overdueCompanies.slice(0, 3).map((company, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="destructive">{company.daysSinceUpdate}d overdue</Badge>
                    <span className="text-sm font-medium">{company.name}</span>
                  </div>
                ))}
                {overdueCompanies.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    +{overdueCompanies.length - 3} more companies
                  </p>
                )}
              </div>
              <Button onClick={() => navigate('/portfolio')} variant="outline">
                View Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/portfolio')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Portfolio Overview</h3>
                <p className="text-sm text-gray-600">View all portfolio companies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/analytics')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600">Portfolio performance metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/notifications')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-gray-600">Manage notification settings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
