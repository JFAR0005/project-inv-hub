
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, parseISO, isSameDay, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  company_id: string | null;
  companyName?: string;
  participants: { id: string; name: string }[];
}

interface MeetingsCalendarProps {
  view: 'week' | 'month';
}

const MeetingsCalendar = ({ view }: MeetingsCalendarProps) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const startDate = view === 'week' 
    ? startOfWeek(currentDate, { weekStartsOn: 1 })
    : startOfMonth(currentDate);
    
  const endDate = view === 'week'
    ? endOfWeek(currentDate, { weekStartsOn: 1 })
    : endOfMonth(currentDate);
    
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Format dates for query
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();
        
        // Query for meetings where user is creator or participant
        const { data, error } = await supabase
          .from('meetings')
          .select(`
            id,
            title,
            start_time,
            end_time,
            company_id,
            companies(name),
            meeting_participants(user_id, users(id, name))
          `)
          .gte('start_time', startDateStr)
          .lte('start_time', endDateStr)
          .or(`created_by.eq.${user.id},meeting_participants.user_id.eq.${user.id}`);

        if (error) throw error;

        if (data) {
          const formattedMeetings: Meeting[] = data.map(meeting => ({
            id: meeting.id,
            title: meeting.title,
            start_time: meeting.start_time,
            end_time: meeting.end_time,
            company_id: meeting.company_id,
            companyName: meeting.companies?.name,
            participants: Array.isArray(meeting.meeting_participants) 
              ? meeting.meeting_participants.map((p: any) => ({
                  id: p.users?.id || p.user_id,
                  name: p.users?.name || 'Unknown'
                }))
              : []
          }));
          
          setMeetings(formattedMeetings);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
        toast("Error loading meetings", {
          description: "Could not load your meetings. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [user, startDate, endDate]);

  const handlePrevious = () => {
    if (view === 'week') {
      setCurrentDate(prev => addDays(prev, -7));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (view === 'week') {
      setCurrentDate(prev => addDays(prev, 7));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get meetings for a specific day
  const getMeetingsForDay = (date: Date) => {
    return meetings.filter(meeting => 
      isSameDay(parseISO(meeting.start_time), date)
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-medium">
            {view === 'week' 
              ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
              : format(startDate, 'MMMM yyyy')
            }
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-muted-foreground">Loading meetings...</div>
          </div>
        ) : (
          <div className={`grid ${view === 'week' ? 'grid-cols-7' : 'grid-cols-7'} gap-2`}>
            {/* Day headers */}
            {view === 'week' && days.map(day => (
              <div key={day.toString()} className="text-center text-sm font-medium p-2">
                {format(day, 'EEE')}
                <div className={`h-6 w-6 rounded-full mx-auto mt-1 flex items-center justify-center
                  ${isSameDay(day, new Date()) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground'}
                `}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}

            {/* Calendar grid */}
            {days.map(day => (
              <div 
                key={day.toString()} 
                className={`border rounded-md min-h-[100px] ${
                  isSameDay(day, new Date()) ? 'bg-accent/30' : ''
                } ${
                  view === 'month' && !isSameMonth(day, currentDate) ? 'bg-muted/20 opacity-50' : ''
                }`}
              >
                {view === 'month' && (
                  <div className="text-center text-sm font-medium p-1 border-b">
                    {format(day, 'EEE')}
                    <div className={`inline-block ml-1 ${
                      isSameDay(day, new Date()) 
                        ? 'bg-primary text-primary-foreground h-5 w-5 rounded-full' 
                        : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                )}
                
                <div className="p-1">
                  {getMeetingsForDay(day).map(meeting => (
                    <div 
                      key={meeting.id} 
                      className="bg-primary/10 text-primary rounded-sm p-1 mb-1 text-xs cursor-pointer hover:bg-primary/20"
                      title={meeting.title}
                    >
                      <div className="font-medium truncate">{meeting.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(parseISO(meeting.start_time), 'p')}
                      </div>
                      {meeting.companyName && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {meeting.companyName}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingsCalendar;
