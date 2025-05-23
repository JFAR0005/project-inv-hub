
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import Layout from '@/components/layout/Layout';
import MeetingsCalendar from '@/components/meetings/MeetingsCalendar';
import MeetingsList from '@/components/meetings/MeetingsList';
import CalendarIntegration from '@/components/meetings/CalendarIntegration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MeetingScheduleForm from '@/components/meetings/MeetingScheduleForm';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define Meeting type for TypeScript
export interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  company_id: string | null;
  company_name?: string;
  location: string | null;
  description: string | null;
  created_by: string;
  created_at: string;
  participants?: string[];
}

const Meetings = () => {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<'week' | 'month'>('week');
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch meetings using React Query with role-based filtering
  const { data: meetings, isLoading, isError, refetch } = useQuery({
    queryKey: ['meetings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let meetingsQuery;
      
      // Apply role-based filtering
      if (user.role === 'admin') {
        // Admins can see all meetings
        meetingsQuery = supabase
          .from('meetings')
          .select(`
            *,
            companies (id, name),
            meeting_participants (user_id)
          `);
      } else {
        // VPs and Founders can only see meetings they're involved in
        const { data: participantMeetings, error: participantError } = await supabase
          .from('meeting_participants')
          .select('meeting_id')
          .eq('user_id', user.id);
        
        if (participantError) {
          throw new Error(participantError.message);
        }
        
        const meetingIds = participantMeetings?.map(pm => pm.meeting_id) || [];
        
        // Include meetings they created or are participants in
        meetingsQuery = supabase
          .from('meetings')
          .select(`
            *,
            companies (id, name),
            meeting_participants (user_id)
          `)
          .or(`created_by.eq.${user.id},id.in.(${meetingIds.join(',')})`);
      }
      
      const { data, error } = await meetingsQuery;
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Format the meetings with participant data
      return data.map(meeting => ({
        ...meeting,
        company_name: meeting.companies?.name || 'No company',
        participants: meeting.meeting_participants?.map(p => p.user_id) || [],
      }));
    },
    enabled: !!user,
  });

  const handleScheduleSuccess = () => {
    setIsScheduleDialogOpen(false);
    setEditingMeeting(null);
    refetch();
    toast({
      title: "Success",
      description: editingMeeting ? "Meeting has been updated" : "Meeting has been scheduled",
    });
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsScheduleDialogOpen(true);
  };

  const handleCreateMeeting = () => {
    setEditingMeeting(null);
    setIsScheduleDialogOpen(true);
  };

  // Check permissions for meeting creation
  const canCreateMeeting = user && ['admin', 'partner', 'founder'].includes(user.role);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Meetings</h1>
            <p className="text-muted-foreground mt-1">
              Schedule and manage meetings with founders and team members
            </p>
          </div>
          {canCreateMeeting && (
            <Button onClick={handleCreateMeeting}>
              <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="list">Upcoming Meetings</TabsTrigger>
            <TabsTrigger value="integrations">Calendar Integrations</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="mt-4">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Calendar View</h2>
              <div className="flex space-x-2">
                <Button 
                  variant={activeView === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={activeView === 'month' ? 'default' : 'outline'}
                  size="sm" 
                  onClick={() => setActiveView('month')}
                >
                  Month
                </Button>
              </div>
            </div>
            <MeetingsCalendar 
              view={activeView} 
              meetings={meetings || []} 
              isLoading={isLoading} 
              onEditMeeting={handleEditMeeting}
            />
          </TabsContent>
          <TabsContent value="list" className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
            <MeetingsList 
              meetings={meetings || []} 
              isLoading={isLoading} 
              onEditMeeting={handleEditMeeting}
            />
          </TabsContent>
          <TabsContent value="integrations" className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Calendar Integrations</h2>
            <CalendarIntegration />
          </TabsContent>
        </Tabs>

        {isError && (
          <div className="text-center py-8">
            <p className="text-destructive">Failed to load meetings. Please try again.</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Schedule Meeting Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingMeeting ? 'Edit Meeting' : 'Schedule a Meeting'}</DialogTitle>
          </DialogHeader>
          <MeetingScheduleForm 
            onSuccess={handleScheduleSuccess} 
            meeting={editingMeeting}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Meetings;
