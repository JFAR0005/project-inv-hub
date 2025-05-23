
export interface MeetingFormValues {
  title: string;
  start_time: Date;
  end_time: Date;
  location: string;
  description: string;
  company_id: string;
  participants: string[];
}

export interface MeetingParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  company_id?: string;
  company_name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
}

export const mapMeetingToCalendarEvent = (meeting: Meeting): CalendarEvent => {
  return {
    id: meeting.id,
    title: meeting.title,
    start: new Date(meeting.start_time),
    end: new Date(meeting.end_time),
    resource: meeting,
  };
};
