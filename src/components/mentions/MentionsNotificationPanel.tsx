
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMentions } from '@/hooks/useMentions';
import { formatDistanceToNow } from 'date-fns';
import { User, MessageSquare, FileText, Upload } from 'lucide-react';

const MentionsNotificationPanel: React.FC = () => {
  const { mentions, fetchMentions, markMentionRead } = useMentions();

  useEffect(() => {
    fetchMentions();
  }, []);

  const getContextIcon = (contextType: string) => {
    switch (contextType) {
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'update':
        return <Upload className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const unreadCount = mentions.filter(m => !m.is_read).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Mentions
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mentions.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No mentions yet
          </p>
        ) : (
          <div className="space-y-3">
            {mentions.map((mention) => (
              <div
                key={mention.id}
                className={`p-3 rounded-lg border ${
                  mention.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getContextIcon(mention.context_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {mention.mentioning_user?.name || 'Unknown user'}
                        </span>
                        <span className="text-sm text-gray-500">
                          mentioned you in a {mention.context_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        "{mention.content}..."
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(mention.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  {!mention.is_read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markMentionRead(mention.id)}
                    >
                      Mark as read
                    </Button>
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

export default MentionsNotificationPanel;
