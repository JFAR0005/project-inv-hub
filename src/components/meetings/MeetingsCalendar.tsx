
import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card } from '@/components/ui/card';
import { Meeting, mapMeetingToCalendarEvent } from './types';
import { Skeleton } from '@/components/ui/skeleton';

// Setup the localizer
const localizer = momentLocalizer(moment);

interface MeetingsCalendarProps {
  view: 'week' | 'month';
  meetings: Meeting[];
  isLoading: boolean;
  onEditMeeting: (meeting: Meeting) => void;
}

const MeetingsCalendar: React.FC<MeetingsCalendarProps> = ({
  view,
  meetings,
  isLoading,
  onEditMeeting,
}) => {
  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[600px] w-full" />
      </Card>
    );
  }

  const events = meetings.map(mapMeetingToCalendarEvent);

  return (
    <Card className="p-4 h-[700px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={view === 'week' ? 'week' : 'month'}
        views={['week', 'month', 'day']}
        step={60}
        showMultiDayTimes
        onSelectEvent={(event) => {
          const meeting = event.resource as Meeting;
          if (meeting) {
            onEditMeeting(meeting);
          }
        }}
        eventPropGetter={(event) => ({
          className: 'bg-primary hover:opacity-80',
        })}
        className="h-full"
      />
    </Card>
  );
};

export default MeetingsCalendar;
