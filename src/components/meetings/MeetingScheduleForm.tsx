
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { format, addHours, parse } from 'date-fns';
import { Clock, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface MeetingScheduleFormProps {
  onSuccess?: () => void;
  initialDate?: Date;
}

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Company = {
  id: string;
  name: string;
};

const MeetingScheduleForm = ({ onSuccess, initialDate }: MeetingScheduleFormProps) => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(initialDate || new Date());
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error loading users:', error);
        toast("Failed to load users", { description: "Please try again later." });
      }
    };

    const fetchCompanies = async () => {
      try {
        // For founders, only show their company
        if (user?.role === 'founder' && user.companyId) {
          const { data, error } = await supabase
            .from('companies')
            .select('id, name')
            .eq('id', user.companyId)
            .single();

          if (error) throw error;
          setCompanies(data ? [data] : []);
          setCompanyId(user.companyId);
        } else {
          // For admins and partners, show all companies
          const { data, error } = await supabase
            .from('companies')
            .select('id, name');

          if (error) throw error;
          setCompanies(data || []);
        }
      } catch (error) {
        console.error('Error loading companies:', error);
        toast("Failed to load companies", { description: "Please try again later." });
      }
    };

    fetchUsers();
    fetchCompanies();
  }, [user]);

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const handleAttendeeToggle = (userId: string) => {
    setAttendees(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !title || attendees.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Convert time strings to full datetime
      const dateStr = format(date, 'yyyy-MM-dd');
      const startDateTime = parse(`${dateStr} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
      const endDateTime = parse(`${dateStr} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());

      // Save meeting to database
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title,
          description,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location,
          company_id: companyId || null,
          created_by: user?.id,
        })
        .select('id')
        .single();

      if (meetingError) throw meetingError;

      // Add meeting participants
      const participantPromises = attendees.map(attendeeId => 
        supabase
          .from('meeting_participants')
          .insert({
            meeting_id: meetingData.id,
            user_id: attendeeId
          })
      );

      // Also add the creator as a participant if not already included
      if (!attendees.includes(user?.id as string)) {
        participantPromises.push(
          supabase
            .from('meeting_participants')
            .insert({
              meeting_id: meetingData.id,
              user_id: user?.id
            })
        );
      }

      await Promise.all(participantPromises);

      toast("Meeting Scheduled", {
        description: `Your meeting "${title}" has been scheduled for ${format(startDateTime, 'PPP p')}`,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setAttendees([]);
      setDate(new Date());
      setStartTime('09:00');
      setEndTime('10:00');

      // Callback on success
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error("Failed to schedule meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const timeOptions = generateTimeOptions();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="required">Meeting Title</Label>
        <Input
          id="title"
          placeholder="Enter meeting title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="border rounded-md"
            disabled={(date) => date < new Date()}
          />
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startTime" className="required">Start Time</Label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger id="startTime">
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={`start-${time}`} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endTime" className="required">End Time</Label>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger id="endTime">
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem 
                    key={`end-${time}`} 
                    value={time}
                    disabled={time <= startTime}
                  >
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="Office, Virtual, or meeting link"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      
      {user?.role !== 'founder' && (
        <div className="space-y-2">
          <Label htmlFor="company">Company (Optional)</Label>
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger id="company">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No company</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="description">Notes (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Meeting agenda or additional information"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="required">Attendees</Label>
        <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto space-y-2">
          {users.filter(u => u.id !== user?.id).map((attendee) => (
            <div 
              key={attendee.id}
              className={`flex items-center justify-between p-2 rounded-md ${
                attendees.includes(attendee.id) ? 'bg-primary/10' : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  {attendee.name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-medium">{attendee.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{attendee.role}</div>
                </div>
              </div>
              <Checkbox
                checked={attendees.includes(attendee.id)}
                onCheckedChange={() => handleAttendeeToggle(attendee.id)}
              />
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-muted-foreground text-center py-4">
              No users found
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Scheduling...' : 'Schedule Meeting'}
        </Button>
      </div>
    </form>
  );
};

export default MeetingScheduleForm;
