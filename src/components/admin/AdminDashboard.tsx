
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Building2, FileText, Activity } from 'lucide-react';
import AdminUserManagement from './AdminUserManagement';
import AdminCompanyAssignments from './AdminCompanyAssignments';
import AdminAuditLogs from './AdminAuditLogs';
import AdminSystemHealth from './AdminSystemHealth';

const AdminDashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();

  if (!hasPermission('admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You don't have permission to access admin tools.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            System administration and management tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium">Admin Access</span>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <AdminCompanyAssignments />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AdminAuditLogs />
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <AdminSystemHealth />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
