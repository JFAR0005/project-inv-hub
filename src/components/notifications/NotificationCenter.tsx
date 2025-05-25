
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NotificationList from './NotificationList';

interface Notification {
  id: string;
  mentioning_user_id: string;
  mentioned_user_id: string;
  content: string;
  context_type: string;
  context_id: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    company_name?: string;
    update_type?: string;
    meeting_title?: string;
    days_overdue?: number;
  };
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mention_notifications')
        .select('*')
        .eq('mentioned_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('mention_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('mention_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('mention_notifications')
        .update({ is_read: true })
        .eq('mentioned_user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "All notifications marked as read",
        description: "Your notifications have been updated.",
      });
    },
  });

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.is_read;
      case 'mentions':
        return notification.context_type === 'mention';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with mentions and portfolio activity
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={() => markAllAsRead.mutate()} variant="outline">
            <Check className="w-4 h-4 mr-2" />
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setFilter('all')}>
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" onClick={() => setFilter('unread')}>
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="mentions" onClick={() => setFilter('mentions')}>
            Mentions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={(id) => markAsRead.mutate(id)}
            onDelete={(id) => deleteNotification.mutate(id)}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
