
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, Settings, Shield, Eye, UserPlus, Edit } from 'lucide-react';
import DataLoadingState from '@/components/data/DataLoadingState';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_seen_at?: string;
  company_id?: string;
}

const AdminUserManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    name: '',
    role: 'founder'
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*, companies(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          action: 'user_updated',
          target_type: 'user',
          target_id: userId,
          details: updates
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
      setNewRole('');
      toast({
        title: "User updated",
        description: "User information has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserData) => {
      // In a real implementation, you'd create the auth user first
      // For now, we'll just create the user record
      const { error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          is_active: true
        });

      if (error) throw error;

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          action: 'user_created',
          target_type: 'user',
          details: userData
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreateDialogOpen(false);
      setNewUserData({ email: '', name: '', role: 'founder' });
      toast({
        title: "User created",
        description: "New user has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'capital_team':
        return <Users className="h-4 w-4" />;
      case 'partner':
        return <Users className="h-4 w-4" />;
      case 'founder':
        return <Settings className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'capital_team':
        return 'bg-blue-100 text-blue-800';
      case 'partner':
        return 'bg-purple-100 text-purple-800';
      case 'founder':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <DataLoadingState />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management ({users.length})
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUserData.role} onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="capital_team">Capital Team</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="founder">Founder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => createUserMutation.mutate(newUserData)}
                  disabled={createUserMutation.isPending || !newUserData.email || !newUserData.name}
                  className="w-full"
                >
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.name || user.email}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  {user.last_seen_at && (
                    <div className="text-xs text-gray-400">
                      Last seen: {new Date(user.last_seen_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={getRoleBadgeColor(user.role)}>
                  <span className="flex items-center gap-1">
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                </Badge>
                
                {!user.is_active && (
                  <Badge variant="destructive">Inactive</Badge>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setNewRole(user.role);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">User Details</h4>
                        <p className="text-sm text-gray-600">
                          <strong>Name:</strong> {user.name || 'Not set'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {user.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Current Role:</strong> {user.role}
                        </p>
                      </div>
                      
                      <div>
                        <Label>Change Role</Label>
                        <Select value={newRole} onValueChange={setNewRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="capital_team">Capital Team</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="founder">Founder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateUserMutation.mutate({
                            userId: user.id,
                            updates: { role: newRole }
                          })}
                          disabled={newRole === user.role || updateUserMutation.isPending}
                        >
                          Update Role
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => updateUserMutation.mutate({
                            userId: user.id,
                            updates: { is_active: !user.is_active }
                          })}
                          disabled={updateUserMutation.isPending}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserManagement;
