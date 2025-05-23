
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, FileText, Calendar, TrendingUp, User } from 'lucide-react';

interface ActivityItem {
  id: string;
  action_type: string;
  action_data: any;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

interface ActivityFeedProps {
  companyId?: string;
  limit?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ companyId, limit = 20 }) => {
  const { user } = useAuth();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity-feed', companyId, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('activity_feed')
        .select(`
          *,
          user:users!activity_feed_user_id_fkey(id, name, email),
          company:companies!activity_feed_company_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'update':
        return <FileText className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'metric':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getActivityDescription = (activity: ActivityItem) => {
    const { action_type, action_data, user: activityUser, company } = activity;
    const userName = activityUser?.name || activityUser?.email || 'Unknown user';
    const companyName = company?.name || 'Unknown company';

    switch (action_type) {
      case 'comment':
        return action_data?.is_reply
          ? `${userName} replied to a comment on ${companyName}`
          : `${userName} commented on ${companyName}`;
      case 'update':
        return `${userName} submitted an update for ${companyName}`;
      case 'meeting':
        return `${userName} scheduled a meeting with ${companyName}`;
      case 'metric':
        return `${userName} updated metrics for ${companyName}`;
      default:
        return `${userName} performed an action on ${companyName}`;
    }
  };

  const getActivityBadgeColor = (actionType: string) => {
    switch (actionType) {
      case 'comment':
        return 'bg-blue-100 text-blue-800';
      case 'update':
        return 'bg-green-100 text-green-800';
      case 'meeting':
        return 'bg-purple-100 text-purple-800';
      case 'metric':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to safely extract content from action_data
  const getActionDataContent = (actionData: any): string | null => {
    if (!actionData) return null;
    if (typeof actionData === 'object' && actionData.content) {
      return actionData.content;
    }
    return null;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please log in to view activity feed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading activities...</div>
        ) : activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No recent activity to show.
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const content = getActionDataContent(activity.action_data);
              
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {activity.user?.name?.charAt(0) || activity.user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.action_type)}
                      <Badge
                        variant="secondary"
                        className={getActivityBadgeColor(activity.action_type)}
                      >
                        {activity.action_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {getActivityDescription(activity)}
                    </p>
                    {content && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        "{content}..."
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
