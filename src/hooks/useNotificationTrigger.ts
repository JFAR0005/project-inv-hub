
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationData {
  // For update_submitted
  company_name?: string;
  submitter_name?: string;
  update_link?: string;
  
  // For meeting_scheduled
  meeting_title?: string;
  meeting_date?: string;
  meeting_time?: string;
  participants?: string[];
  
  // For update_overdue
  days_overdue?: number;
  last_update_date?: string;
}

type NotificationType =
  | 'update_submitted'
  | 'meeting_scheduled'
  | 'update_overdue';

interface NotificationPayload {
  type: NotificationType;
  company_id: string;
  data: NotificationData;
  recipients: string[];
}

export const useNotificationTrigger = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const triggerNotification = async (payload: NotificationPayload): Promise<boolean> => {
    try {
      console.log('Triggering notification:', payload);
      
      // Call the send-notifications edge function
      const { data, error } = await supabase.functions.invoke('send-notifications', {
        body: { notification: payload }
      });
      
      if (error) {
        console.error('Notification error:', error);
        throw error;
      }
      
      console.log('Notification sent successfully:', data);
      
      toast({
        title: "Notification sent",
        description: "The notification has been successfully delivered.",
      });
      
      return true;
    } catch (error) {
      console.error('Error triggering notification:', error);
      
      toast({
        title: "Notification failed",
        description: "There was a problem sending the notification. Please try again later.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  // Helper for when a founder submits an update
  const notifyUpdateSubmitted = async (companyId: string, companyName: string, updateId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Get partners associated with this company or all partners for now
      const { data: partners } = await supabase
        .from('users')
        .select('email, name')
        .eq('role', 'partner');
        
      const recipients = partners?.map(partner => partner.email) || [];
      
      if (recipients.length === 0) {
        console.warn('No partners found to notify');
        return false;
      }
      
      return triggerNotification({
        type: 'update_submitted',
        company_id: companyId,
        data: {
          company_name: companyName,
          submitter_name: user.name || user.email,
          update_link: `${window.location.origin}/company-profile/${companyId}?tab=updates`,
        },
        recipients,
      });
    } catch (error) {
      console.error('Error in notifyUpdateSubmitted:', error);
      return false;
    }
  };
  
  // Helper for when a meeting is scheduled
  const notifyMeetingScheduled = async (
    companyId: string, 
    meetingTitle: string, 
    meetingDate: string, 
    meetingTime: string, 
    participantEmails: string[]
  ): Promise<boolean> => {
    if (!user) return false;
    
    return triggerNotification({
      type: 'meeting_scheduled',
      company_id: companyId,
      data: {
        meeting_title: meetingTitle,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        participants: participantEmails,
      },
      recipients: participantEmails,
    });
  };
  
  // Helper for overdue updates
  const notifyUpdateOverdue = async (
    companyId: string,
    companyName: string,
    daysOverdue: number,
    lastUpdateDate: string | null
  ): Promise<boolean> => {
    try {
      // Get company founder and assigned partners
      const { data: company } = await supabase
        .from('companies')
        .select('founder_email')
        .eq('id', companyId)
        .single();
        
      const { data: partners } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'partner');
      
      const recipients = [
        ...(company?.founder_email ? [company.founder_email] : []),
        ...(partners?.map(p => p.email) || [])
      ];
      
      if (recipients.length === 0) {
        console.warn('No recipients found for overdue notification');
        return false;
      }
      
      return triggerNotification({
        type: 'update_overdue',
        company_id: companyId,
        data: {
          company_name: companyName,
          days_overdue: daysOverdue,
          last_update_date: lastUpdateDate,
        },
        recipients,
      });
    } catch (error) {
      console.error('Error in notifyUpdateOverdue:', error);
      return false;
    }
  };
  
  return {
    triggerNotification,
    notifyUpdateSubmitted,
    notifyMeetingScheduled,
    notifyUpdateOverdue,
  };
};
