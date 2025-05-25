
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, UserPlus, X, Eye } from 'lucide-react';
import DataLoadingState from '@/components/data/DataLoadingState';

interface CompanyAssignment {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  assigned_at: string;
  companies: {
    name: string;
  };
  users: {
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Company {
  id: string;
  name: string;
}

const AdminCompanyAssignments: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('founder');

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['admin-company-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          *,
          companies(name),
          users(name, email)
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['admin-companies-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async ({ companyId, userId, role }: { companyId: string; userId: string; role: string }) => {
      const { error } = await supabase
        .from('company_users')
        .insert({
          company_id: companyId,
          user_id: userId,
          role,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          action: 'company_assignment_created',
          target_type: 'company_assignment',
          target_id: companyId,
          details: { company_id: companyId, user_id: userId, role }
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-company-assignments'] });
      setIsCreateDialogOpen(false);
      setSelectedCompany('');
      setSelectedUser('');
      setSelectedRole('founder');
      toast({
        title: "Assignment created",
        description: "User has been assigned to company successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment.",
        variant: "destructive",
      });
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('company_users')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          action: 'company_assignment_deleted',
          target_type: 'company_assignment',
          target_id: assignmentId
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-company-assignments'] });
      toast({
        title: "Assignment removed",
        description: "User assignment has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove assignment.",
        variant: "destructive",
      });
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'founder':
        return 'bg-green-100 text-green-800';
      case 'partner':
        return 'bg-purple-100 text-purple-800';
      case 'capital_team':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isLoading = assignmentsLoading || usersLoading || companiesLoading;

  if (isLoading) {
    return <DataLoadingState />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Assignments ({assignments.length})
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Company Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="user">User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Assignment Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="founder">Founder</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="capital_team">Capital Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => createAssignmentMutation.mutate({
                    companyId: selectedCompany,
                    userId: selectedUser,
                    role: selectedRole
                  })}
                  disabled={createAssignmentMutation.isPending || !selectedCompany || !selectedUser}
                  className="w-full"
                >
                  Create Assignment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{assignment.companies?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{assignment.users?.name || assignment.users?.email}</span>
                </div>
                <Badge className={getRoleBadgeColor(assignment.role)}>
                  {assignment.role}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {new Date(assignment.assigned_at).toLocaleDateString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAssignmentMutation.mutate(assignment.id)}
                  disabled={removeAssignmentMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {assignments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No company assignments found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCompanyAssignments;
