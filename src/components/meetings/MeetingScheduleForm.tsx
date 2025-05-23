
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Meeting } from '@/pages/Meetings';
import { MeetingFormValues, MeetingParticipant, Company } from './types';

// Define schema for form validation
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  start_time: z.date({ required_error: 'Start time is required' }),
  end_time: z.date({ required_error: 'End time is required' }),
  location: z.string().optional(),
  description: z.string().optional(),
  company_id: z.string().optional(),
  participants: z.array(z.string()).min(1, 'At least one participant is required'),
}).refine((data) => data.end_time > data.start_time, {
  message: "End time must be after start time",
  path: ["end_time"],
});

interface MeetingScheduleFormProps {
  onSuccess: () => void;
  meeting?: Meeting | null;
}

const MeetingScheduleForm: React.FC<MeetingScheduleFormProps> = ({
  onSuccess,
  meeting = null,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<MeetingParticipant[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      start_time: new Date(),
      end_time: new Date(new Date().setHours(new Date().getHours() + 1)),
      location: '',
      description: '',
      company_id: '',
      participants: user ? [user.id] : [],
    },
  });

  // Fetch companies and users for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies based on user role
        let companiesQuery = supabase.from('companies').select('id, name');
        
        if (user?.role === 'founder' && user.companyId) {
          // Founders can only select their own company
          companiesQuery = companiesQuery.eq('id', user.companyId);
        }
        
        const { data: companiesData, error: companiesError } = await companiesQuery.order('name', { ascending: true });

        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
        } else {
          setCompanies(companiesData || []);
        }

        // Fetch users for participants
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, role')
          .order('name', { ascending: true });

        if (usersError) {
          console.error('Error fetching users:', usersError);
        } else {
          setUsers(usersData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  // Set form values if editing a meeting
  useEffect(() => {
    if (meeting) {
      const fetchParticipants = async () => {
        try {
          const { data: participantData, error: participantError } = await supabase
            .from('meeting_participants')
            .select('user_id')
            .eq('meeting_id', meeting.id);

          if (participantError) {
            console.error('Error fetching participants:', participantError);
            return;
          }

          const participantIds = participantData?.map(p => p.user_id) || [];

          form.reset({
            title: meeting.title,
            start_time: new Date(meeting.start_time),
            end_time: new Date(meeting.end_time),
            location: meeting.location || '',
            description: meeting.description || '',
            company_id: meeting.company_id || '',
            participants: participantIds,
          });
        } catch (error) {
          console.error('Error setting form values:', error);
        }
      };

      fetchParticipants();
    }
  }, [meeting, form]);

  const onSubmit = async (values: MeetingFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to schedule meetings",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let meetingId: string;

      if (meeting) {
        // Update existing meeting
        const { data: updatedMeeting, error: updateError } = await supabase
          .from('meetings')
          .update({
            title: values.title,
            start_time: values.start_time.toISOString(),
            end_time: values.end_time.toISOString(),
            location: values.location || null,
            description: values.description || null,
            company_id: values.company_id || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', meeting.id)
          .select()
          .single();

        if (updateError) throw updateError;
        meetingId = meeting.id;

        // Delete existing participants
        const { error: deleteParticipantsError } = await supabase
          .from('meeting_participants')
          .delete()
          .eq('meeting_id', meeting.id);

        if (deleteParticipantsError) throw deleteParticipantsError;
      } else {
        // Insert new meeting
        const { data: newMeeting, error: insertError } = await supabase
          .from('meetings')
          .insert({
            title: values.title,
            start_time: values.start_time.toISOString(),
            end_time: values.end_time.toISOString(),
            location: values.location || null,
            description: values.description || null,
            company_id: values.company_id || null,
            created_by: user.id,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        meetingId = newMeeting.id;
      }

      // Insert participants
      if (values.participants.length > 0) {
        const participantsToInsert = values.participants.map(participantId => ({
          meeting_id: meetingId,
          user_id: participantId,
        }));

        const { error: participantsError } = await supabase
          .from('meeting_participants')
          .insert(participantsToInsert);

        if (participantsError) throw participantsError;
      }

      // TODO: Send notifications to participants (implement with edge function)
      console.log('Meeting scheduled successfully. TODO: Send notifications to participants.');

      onSuccess();
    } catch (error) {
      console.error('Error saving meeting:', error);
      toast({
        title: "Error",
        description: "Failed to save meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Title*</FormLabel>
              <FormControl>
                <Input placeholder="Enter meeting title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Time*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="pl-3 text-left font-normal flex justify-between items-center"
                      >
                        {field.value ? format(field.value, "PPP p") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':').map(Number);
                          const newDate = new Date(field.value);
                          newDate.setHours(hours);
                          newDate.setMinutes(minutes);
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Time*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="pl-3 text-left font-normal flex justify-between items-center"
                      >
                        {field.value ? format(field.value, "PPP p") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':').map(Number);
                          const newDate = new Date(field.value);
                          newDate.setHours(hours);
                          newDate.setMinutes(minutes);
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <Select
                value={field.value || ""}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">No company</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter meeting location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="participants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Participants*</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="border border-input rounded-md p-2 min-h-10">
                    <div className="flex flex-wrap gap-1">
                      {field.value.map(userId => {
                        const selectedUser = users.find(u => u.id === userId);
                        return selectedUser ? (
                          <div key={userId} className="bg-primary/10 px-2 py-1 rounded-md flex items-center">
                            <span className="text-sm">{selectedUser.name}</span>
                            <button
                              type="button"
                              className="ml-1 text-gray-500 hover:text-gray-700"
                              onClick={() => {
                                field.onChange(field.value.filter(id => id !== userId));
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ) : null;
                      })}
                      <select
                        className="flex-grow min-w-[100px] border-0 focus:ring-0 focus:outline-none bg-transparent text-sm"
                        onChange={(e) => {
                          if (e.target.value && !field.value.includes(e.target.value)) {
                            field.onChange([...field.value, e.target.value]);
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">Add participant...</option>
                        {users
                          .filter(user => !field.value.includes(user.id))
                          .map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter meeting details" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => onSuccess()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {meeting ? 'Update Meeting' : 'Schedule Meeting'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MeetingScheduleForm;
