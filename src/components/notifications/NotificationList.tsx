
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, Calendar, AlertTriangle, User, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  isLoading = false
}) => {
  const getNotificationIcon = (contextType: string) => {
    switch (contextType) {
      case 'update_submitted':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'meeting_scheduled':
        return <Calendar className="w-5 h-5 text-green-500" />;
      case 'update_overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'mention':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBadgeColor = (contextType: string) => {
    switch (contextType) {
      case 'update_submitted':
        return 'bg-blue-500';
      case 'meeting_scheduled':
        return 'bg-green-500';
      case 'update_overdue':
        return 'bg-red-500';
      case 'mention':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            You're all caught up! New notifications will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`transition-colors ${!notification.is_read ? 'border-blue-200 bg-blue-50/50' : ''}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.context_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {notification.content}
                      </p>
                      
                      {notification.metadata?.company_name && (
                        <p className="text-xs text-gray-600 mb-1">
                          Company: {notification.metadata.company_name}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                        
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getNotificationBadgeColor(notification.context_type)} text-white border-none`}
                        >
                          {notification.context_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {!notification.is_read && (
                  <Badge variant="secondary" className="text-xs">
                    New
                  </Badge>
                )}
                
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(notification.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotificationList;
