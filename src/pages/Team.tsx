
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeamMemberManagement from '@/components/team/TeamMemberManagement';
import MentionsNotificationPanel from '@/components/mentions/MentionsNotificationPanel';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { Users, MessageSquare, Activity } from 'lucide-react';

const Team: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Collaboration</h1>
        <p className="text-gray-600">
          Manage team members, view mentions, and track team activity across the platform.
        </p>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="mentions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mentions
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <TeamMemberManagement />
        </TabsContent>

        <TabsContent value="mentions">
          <MentionsNotificationPanel />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeed limit={50} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Team;
