
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase'; 
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

const MAX_PARTICIPANTS = 20;

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  description: z.string().optional(),
  date: z.date({
    required_error: "Please select a date.",
  }),
  startTime: z.string().min(1, {
    message: "Start time is required.",
  }),
  endTime: z.string().min(1, {
    message: "End time is required.",
  }),
  location: z.string().optional(),
  companyId: z.string().optional(),
  participants: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MeetingScheduleFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  isEditMode?: boolean;
  participants?: any[];
}

export default function MeetingScheduleForm({
  onSubmit,
  onCancel,
  initialData,
  isEditMode = false,
  participants = [],
}: MeetingScheduleFormProps) {
  const [availableParticipants, setAvailableParticipants] = useState<any[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { notifyMeetingScheduled } = useNotificationTrigger();

  // Initialize the form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: new Date(initialData.date || initialData.start_time),
      startTime: initialData.start_time ? format(new Date(initialData.start_time), 'HH:mm') : '',
      endTime: initialData.end_time ? format(new Date(initialData.end_time), 'HH:mm') : '',
    } : {
      title: '',
      description: '',
      date: new Date(),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      companyId: '',
      participants: [],
    }
  });

  useEffect(() => {
    // Fetch users who can be added as participants
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role');
        
      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      
      setAvailableParticipants(data || []);
    };
    
    // Fetch companies for dropdown
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name');
        
      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }
      
      setCompanies(data || []);
    };
    
    fetchUsers();
    fetchCompanies();
    
    // Set selected participants if in edit mode
    if (isEditMode && participants.length > 0) {
      setSelectedParticipants(participants);
    }
  }, [isEditMode, participants]);
  
  const handleSubmitForm = async (formData: FormData) => {
    if (selectedParticipants.length === 0) {
      toast({
        title: 'No participants selected',
        description: 'Please select at least one participant for the meeting.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format date and time properly for database
      const startDateTime = new Date(formData.date);
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes);
      
      const endDateTime = new Date(formData.date);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes);
      
      // Check if end time is after start time
      if (endDateTime <= startDateTime) {
        toast({
          title: 'Invalid time range',
          description: 'End time must be after start time.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // Prepare data for submission
      const meetingData = {
        title: formData.title,
        description: formData.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: formData.location,
        company_id: formData.companyId || null,
        created_by: user?.id,
        participants: selectedParticipants.map(p => p.id),
      };
      
      // Submit the data
      const result = await onSubmit(meetingData);
      
      // If successful, send notification to participants
      if (result && result.id) {
        const participantEmails = selectedParticipants.map(p => p.email);
        
        await notifyMeetingScheduled(
          formData.companyId || 'general',
          formData.title,
          format(startDateTime, 'PPP'),
          format(startDateTime, 'h:mm a'),
          participantEmails
        );
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule the meeting. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleParticipant = (participant: any) => {
    const isSelected = selectedParticipants.some(p => p.id === participant.id);
    
    if (isSelected) {
      setSelectedParticipants(selectedParticipants.filter(p => p.id !== participant.id));
    } else {
      if (selectedParticipants.length >= MAX_PARTICIPANTS) {
        toast({
          title: 'Too many participants',
          description: `You cannot add more than ${MAX_PARTICIPANTS} participants.`,
          variant: 'destructive',
        });
        return;
      }
      setSelectedParticipants([...selectedParticipants, participant]);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Title</FormLabel>
                <FormControl>
                  <Input placeholder="Meeting Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Zoom / Office / etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Company</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="">None</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Meeting details, agenda, etc."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Participants</FormLabel>
            <div className="border rounded-md p-4 mt-2">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Selected: {selectedParticipants.length}/{MAX_PARTICIPANTS}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedParticipants.map(participant => (
                    <div 
                      key={participant.id}
                      className="flex items-center gap-1 bg-primary/10 rounded px-2 py-1 text-sm"
                    >
                      <span>{participant.name}</span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0"
                        onClick={() => toggleParticipant(participant)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {availableParticipants.map(participant => (
                    <div 
                      key={participant.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox 
                        id={`participant-${participant.id}`}
                        checked={selectedParticipants.some(p => p.id === participant.id)}
                        onCheckedChange={() => toggleParticipant(participant)}
                      />
                      <label 
                        htmlFor={`participant-${participant.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between w-full"
                      >
                        <span>{participant.name}</span>
                        <span className="text-muted-foreground">{participant.email}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Schedule Meeting'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
