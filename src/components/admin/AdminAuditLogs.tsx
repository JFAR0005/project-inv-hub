
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileText, Search } from 'lucide-react';
import DataLoadingState from '@/components/data/DataLoadingState';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  timestamp: string;
  users?: {
    name: string;
    email: string;
  };
}

const AdminAuditLogs: React.FC = () => {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs', actionFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          users(name, email)
        `)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,target_type.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'user_created':
      case 'company_created':
      case 'deal_created':
        return 'bg-green-100 text-green-800';
      case 'user_updated':
      case 'company_updated':
      case 'deal_updated':
        return 'bg-blue-100 text-blue-800';
      case 'user_deleted':
      case 'company_deleted':
      case 'deal_deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDetails = (details: any) => {
    if (!details) return '';
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  if (isLoading) {
    return <DataLoadingState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Audit Logs ({logs.length})
        </CardTitle>
        
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="user_created">User Created</SelectItem>
              <SelectItem value="user_updated">User Updated</SelectItem>
              <SelectItem value="user_deleted">User Deleted</SelectItem>
              <SelectItem value="company_created">Company Created</SelectItem>
              <SelectItem value="company_updated">Company Updated</SelectItem>
              <SelectItem value="deal_created">Deal Created</SelectItem>
              <SelectItem value="deal_updated">Deal Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={getActionBadgeColor(log.action)}>
                    {log.action.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium">
                    {log.users?.name || log.users?.email || 'System'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {log.target_type} - {log.target_id?.slice(0, 8)}...
                  </span>
                </div>
                
                {log.details && (
                  <div className="text-sm text-gray-600">
                    <strong>Details:</strong> {formatDetails(log.details)}
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No audit logs found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAuditLogs;
