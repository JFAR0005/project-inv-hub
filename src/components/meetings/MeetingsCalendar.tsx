
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Plus, MapPin } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string[];
  created_at: string;
}

const MeetingsCalendar: React.FC = () => {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const { data: meetings, isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as Meeting[];
    }
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return meetings?.filter(meeting => new Date(meeting.start_time) > now) || [];
  };

  const getTodaysMeetings = () => {
    const today = new Date().toDateString();
    return meetings?.filter(meeting => 
      new Date(meeting.start_time).toDateString() === today
    ) || [];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
        </div>
        <div className="text-center py-8">Loading meetings...</div>
      </div>
    );
  }

  const upcomingMeetings = getUpcomingMeetings();
  const todaysMeetings = getTodaysMeetings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">
            Manage your meetings and calendar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView('day')}>
            Day
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView('week')}>
            Week
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView('month')}>
            Month
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>
      </div>

      {/* Today's Meetings */}
      {todaysMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{meeting.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                      </span>
                      {meeting.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {meeting.location}
                        </span>
                      )}
                    </div>
                    {meeting.description && (
                      <p className="text-sm text-muted-foreground mt-2">{meeting.description}</p>
                    )}
                  </div>
                  <Badge variant="default">Today</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No upcoming meetings</h3>
              <p className="text-muted-foreground">
                Schedule your first meeting to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingMeetings.slice(0, 10).map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{meeting.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(meeting.start_time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                      </span>
                      {meeting.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {meeting.location}
                        </span>
                      )}
                    </div>
                    {meeting.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{meeting.description}</p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {Math.ceil((new Date(meeting.start_time).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingsCalendar;
