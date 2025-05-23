
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Meeting } from '@/pages/Meetings';

const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  start_time: z.date(),
  end_time: z.date(),
  location: z.string().optional(),
  description: z.string().optional(),
  company_id: z.string().optional(),
  participants: z.array(z.string()).optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

interface Company {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MeetingScheduleFormProps {
  onSuccess: () => void;
  meeting?: Meeting | null;
}

const MeetingScheduleForm: React.FC<MeetingScheduleFormProps> = ({ onSuccess, meeting }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    meeting ? new Date(meeting.start_time) : new Date()
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: meeting ? {
      title: meeting.title,
      start_time: new Date(meeting.start_time),
      end_time: new Date(meeting.end_time),
      location: meeting.location || '',
      description: meeting.description || '',
      company_id: meeting.company_id || '',
      participants: meeting.participants || [],
    } : {
      start_time: new Date(),
      end_time: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
      participants: [],
    }
  });

  const startTime = watch('start_time');

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const currentStart = startTime || new Date();
      const newStart = new Date(selectedDate);
      newStart.setHours(currentStart.getHours(), currentStart.getMinutes());
      
      const newEnd = new Date(newStart);
      newEnd.setHours(newStart.getHours() + 1);
      
      setValue('start_time', newStart);
      setValue('end_time', newEnd);
    }
  }, [selectedDate, setValue]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const onSubmit = async (data: MeetingFormValues) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const meetingData = {
        title: data.title,
        start_time: data.start_time.toISOString(),
        end_time: data.end_time.toISOString(),
        location: data.location || null,
        description: data.description || null,
        company_id: data.company_id || null,
        created_by: user.id,
      };

      let meetingId: string;

      if (meeting) {
        // Update existing meeting
        const { error } = await supabase
          .from('meetings')
          .update(meetingData)
          .eq('id', meeting.id);

        if (error) throw error;
        meetingId = meeting.id;
      } else {
        // Create new meeting
        const { data: newMeeting, error } = await supabase
          .from('meetings')
          .insert(meetingData)
          .select()
          .single();

        if (error) throw error;
        meetingId = newMeeting.id;
      }

      // Handle participants
      if (data.participants && data.participants.length > 0) {
        // Delete existing participants
        await supabase
          .from('meeting_participants')
          .delete()
          .eq('meeting_id', meetingId);

        // Add new participants
        const participantData = data.participants.map(userId => ({
          meeting_id: meetingId,
          user_id: userId,
        }));

        const { error: participantError } = await supabase
          .from('meeting_participants')
          .insert(participantData);

        if (participantError) throw participantError;
      }

      toast({
        title: "Success",
        description: meeting ? "Meeting updated successfully" : "Meeting scheduled successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving meeting:', error);
      toast({
        title: "Error",
        description: "Failed to save meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Meeting Title *</Label>
        <Input
          id="title"
          placeholder="Enter meeting title"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time *</Label>
          <Input
            id="start_time"
            type="time"
            {...register('start_time', {
              setValueAs: (value) => {
                if (!selectedDate) return new Date();
                const [hours, minutes] = value.split(':');
                const date = new Date(selectedDate);
                date.setHours(parseInt(hours), parseInt(minutes));
                return date;
              }
            })}
            defaultValue={meeting ? format(new Date(meeting.start_time), 'HH:mm') : '09:00'}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_time">End Time *</Label>
        <Input
          id="end_time"
          type="time"
          {...register('end_time', {
            setValueAs: (value) => {
              if (!selectedDate) return new Date();
              const [hours, minutes] = value.split(':');
              const date = new Date(selectedDate);
              date.setHours(parseInt(hours), parseInt(minutes));
              return date;
            }
          })}
          defaultValue={meeting ? format(new Date(meeting.end_time), 'HH:mm') : '10:00'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_id">Company</Label>
        <Select
          value={watch('company_id') || ''}
          onValueChange={(value) => setValue('company_id', value)}
        >
          <SelectTrigger>
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

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="Meeting location or video call link"
          {...register('location')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Meeting agenda or notes"
          {...register('description')}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Participants</Label>
        <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
          {users.filter(u => u.id !== user?.id).map((userOption) => (
            <div key={userOption.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`participant-${userOption.id}`}
                checked={watch('participants')?.includes(userOption.id) || false}
                onChange={(e) => {
                  const participants = watch('participants') || [];
                  if (e.target.checked) {
                    setValue('participants', [...participants, userOption.id]);
                  } else {
                    setValue('participants', participants.filter(id => id !== userOption.id));
                  }
                }}
                className="rounded"
              />
              <label
                htmlFor={`participant-${userOption.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {userOption.name} ({userOption.role})
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : meeting ? "Update Meeting" : "Schedule Meeting"}
        </Button>
      </div>
    </form>
  );
};

export default MeetingScheduleForm;
