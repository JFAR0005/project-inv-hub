
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

type Meeting = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description: string | null;
  location: string | null;
  created_by: string;
  participants: string[];
  type: 'review' | '1on1' | 'group' | 'pitch';
};

const MeetingsList = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch meetings where user is the creator or a participant
        const { data, error } = await supabase
          .from('meetings')
          .select(`
            id,
            title,
            start_time,
            end_time,
            description,
            location,
            created_by,
            meeting_participants(user_id)
          `)
          .or(`created_by.eq.${user.id},meeting_participants.user_id.eq.${user.id}`);

        if (error) throw error;

        // Fallback to mock data if no meetings found
        if (!data || data.length === 0) {
          // Using the existing mock data for now
          setMeetings([
            {
              id: '1',
              title: 'Monthly Portfolio Review',
              start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
              end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
              description: 'Review Q2 performance and discuss growth strategy',
              location: null,
              created_by: user.id,
              participants: ['Admin User', 'Venture Partner', 'Founder User'],
              type: 'review',
            },
            {
              id: '2',
              title: 'Product Demo with Tech Startup',
              start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
              end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
              description: 'Preview of new product features',
              location: null,
              created_by: user.id,
              participants: ['Admin User', 'Founder User'],
              type: '1on1',
            },
            {
              id: '3',
              title: 'Investment Committee Meeting',
              start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
              end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
              description: 'Discuss potential investments for Q3',
              location: null,
              created_by: user.id,
              participants: ['Admin User', 'Venture Partner'],
              type: 'group',
            },
          ]);
        } else {
          // Transform Supabase data to our Meeting type
          const formattedMeetings = data.map(meeting => ({
            id: meeting.id,
            title: meeting.title,
            start_time: meeting.start_time,
            end_time: meeting.end_time,
            description: meeting.description,
            location: meeting.location,
            created_by: meeting.created_by,
            participants: meeting.meeting_participants.map((p: any) => p.user_id),
            // Determine meeting type based on number of participants
            type: meeting.title.toLowerCase().includes('pitch') 
              ? 'pitch' as const
              : meeting.title.toLowerCase().includes('review')
                ? 'review' as const
                : meeting.meeting_participants.length > 1
                  ? 'group' as const
                  : '1on1' as const
          }));
          
          setMeetings(formattedMeetings);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
        toast({
          title: "Error loading meetings",
          description: "Could not load your meetings. Please try again later."
        });
        // Fallback to mock data on error
        setMeetings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [user]);

  // Filter meetings based on user role
  const filteredMeetings = meetings.filter(meeting => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'partner' && !meeting.title.includes('Investment Committee')) return true;
    if (user?.role === 'founder' && meeting.participants.includes(user.id)) return true;
    return false;
  });

  const handleScheduleClick = () => {
    // Find the schedule tab trigger and programmatically select it
    const scheduleTabTrigger = document.querySelector('[value="schedule"]');
    if (scheduleTabTrigger instanceof HTMLElement) {
      scheduleTabTrigger.click();
    }
  };
  
  // Format datetime
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dayStr = '';
    if (date.toDateString() === today.toDateString()) {
      dayStr = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dayStr = 'Tomorrow';
    } else {
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      dayStr = date.toLocaleDateString('en-US', options);
    }
    
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dayStr}, ${timeStr}`;
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {filteredMeetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{meeting.title}</CardTitle>
                <Button variant="ghost" size="sm">
                  <Clock className="h-4 w-4 mr-1" /> {meeting.type === 'group' ? 'Group' : meeting.type === 'review' ? 'Review' : meeting.type === 'pitch' ? 'Pitch' : '1:1'}
                </Button>
              </div>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {formatDateTime(meeting.start_time)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {meeting.description || 'No description provided'}
              </p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">
                  {meeting.participants.length} attendees
                </div>
              </div>
              <div className="flex mt-4 gap-2">
                <Button variant="outline" size="sm" className="text-xs">Reschedule</Button>
                <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredMeetings.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
          <div className="mb-2 p-4 bg-background rounded-full border">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No upcoming meetings</h3>
          <p className="text-muted-foreground text-center mb-4">
            You don't have any scheduled meetings.
          </p>
          <Button variant="outline" onClick={handleScheduleClick}>
            Schedule a Meeting
          </Button>
        </div>
      )}
    </div>
  );
};

export default MeetingsList;
