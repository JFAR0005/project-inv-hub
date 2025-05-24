
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Settings, Shield, Eye } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  last_seen_at?: string;
}

const TeamMemberManagement: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: hasPermission('view:team'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setSelectedMember(null);
      setNewRole('');
      toast({
        title: "Role updated",
        description: "Team member role has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update team member role.",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'partner':
        return <Users className="h-4 w-4" />;
      case 'founder':
        return <Settings className="h-4 w-4" />;
      case 'lp':
        return <Eye className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'partner':
        return 'bg-blue-100 text-blue-800';
      case 'founder':
        return 'bg-green-100 text-green-800';
      case 'lp':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageRoles = hasPermission('manage:users');

  if (!hasPermission('view:team')) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            You don't have permission to view team members.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members ({teamMembers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading team members...</div>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.name?.charAt(0) || member.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name || member.email}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                    {member.last_seen_at && (
                      <div className="text-xs text-gray-400">
                        Last seen: {new Date(member.last_seen_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getRoleBadgeColor(member.role)}>
                    <span className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      {member.role}
                    </span>
                  </Badge>
                  
                  {canManageRoles && member.id !== user?.id && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setNewRole(member.role);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Team Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Member Details</h4>
                            <p className="text-sm text-gray-600">
                              <strong>Name:</strong> {member.name || 'Not set'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Email:</strong> {member.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Current Role:</strong> {member.role}
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Change Role</label>
                            <Select value={newRole} onValueChange={setNewRole}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="partner">Partner</SelectItem>
                                <SelectItem value="founder">Founder</SelectItem>
                                <SelectItem value="lp">Limited Partner</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateRoleMutation.mutate({
                                userId: member.id,
                                role: newRole
                              })}
                              disabled={newRole === member.role || updateRoleMutation.isPending}
                            >
                              Update Role
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamMemberManagement;
