
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, AlertTriangle, Calendar, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationBanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = React.useState<string[]>([]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['banner-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mention_notifications')
        .select('*')
        .eq('mentioned_user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 30 * 1000, // Check every 30 seconds
  });

  const activeNotifications = notifications.filter(n => !dismissed.includes(n.id));

  const getNotificationIcon = (contextType: string) => {
    switch (contextType) {
      case 'update_overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'meeting_scheduled':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'mention':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleDismiss = (notificationId: string) => {
    setDismissed(prev => [...prev, notificationId]);
  };

  const handleViewAll = () => {
    navigate('/notifications');
  };

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-semibold text-sm">New Notifications</h3>
              <p className="text-xs text-muted-foreground">
                You have {activeNotifications.length} unread notification{activeNotifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleViewAll}>
              View All
            </Button>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {activeNotifications.map((notification) => (
            <div 
              key={notification.id}
              className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
            >
              <div className="flex items-center space-x-2 flex-1">
                {getNotificationIcon(notification.context_type)}
                <span className="text-sm truncate">{notification.content}</span>
                <Badge variant="secondary" className="text-xs">
                  {notification.context_type.replace('_', ' ')}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleDismiss(notification.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationBanner;
