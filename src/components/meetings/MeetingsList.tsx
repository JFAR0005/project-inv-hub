import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users } from 'lucide-react';

// Mock meetings data - in a real app, this would come from an API
const MOCK_MEETINGS = [
  {
    id: '1',
    title: 'Monthly Portfolio Review',
    datetime: 'Tomorrow, 10:00 AM',
    attendees: ['Admin User', 'Venture Partner', 'Founder User'],
    description: 'Review Q2 performance and discuss growth strategy',
    type: 'review',
  },
  {
    id: '2',
    title: 'Product Demo with Tech Startup',
    datetime: 'Wed May 7, 2:00 PM',
    attendees: ['Admin User', 'Founder User'],
    description: 'Preview of new product features',
    type: '1on1',
  },
  {
    id: '3',
    title: 'Investment Committee Meeting',
    datetime: 'Thu May 8, 9:00 AM',
    attendees: ['Admin User', 'Venture Partner'],
    description: 'Discuss potential investments for Q3',
    type: 'group',
  },
  {
    id: '4',
    title: 'Pitch Session - SaaS Startup',
    datetime: 'Fri May 9, 3:00 PM',
    attendees: ['Admin User', 'Venture Partner', 'Founder User'],
    description: 'Initial pitch for funding',
    type: 'pitch',
  },
];

const MeetingsList = () => {
  const { user } = useAuth();

  // Filter meetings based on user role
  const filteredMeetings = MOCK_MEETINGS.filter(meeting => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'partner' && !meeting.title.includes('Investment Committee')) return true;
    if (user?.role === 'founder' && meeting.attendees.includes('Founder User')) return true;
    return false;
  });

  const handleScheduleClick = () => {
    // Find the schedule tab trigger and programmatically select it
    const scheduleTabTrigger = document.querySelector('[value="schedule"]');
    if (scheduleTabTrigger instanceof HTMLElement) {
      scheduleTabTrigger.click();
    }
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
                <Calendar className="h-3.5 w-3.5" /> {meeting.datetime}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {meeting.description}
              </p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">
                  {meeting.attendees.length} attendees
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
