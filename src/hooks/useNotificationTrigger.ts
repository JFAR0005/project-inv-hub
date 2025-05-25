
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationData {
  // For update_submitted
  company_name?: string;
  submitter_name?: string;
  update_link?: string;
  assigned_partner?: string;
  
  // For meeting_scheduled
  meeting_title?: string;
  meeting_date?: string;
  meeting_time?: string;
  participants?: string[];
  meeting_link?: string;
  
  // For update_overdue
  days_overdue?: number;
  last_update_date?: string;
  founder_email?: string;
  partner_email?: string;
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
      // Get company details including assigned partner
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();
        
      // Get deals to find assigned partner
      const { data: deal } = await supabase
        .from('deals')
        .select(`
          lead_partner,
          users!deals_lead_partner_fkey(name, email)
        `)
        .eq('company_id', companyId)
        .single();
        
      // Get all partners as fallback
      const { data: partners } = await supabase
        .from('users')
        .select('email, name')
        .eq('role', 'partner');
      
      const assignedPartner = deal?.users as any;
      const recipients = assignedPartner?.email 
        ? [assignedPartner.email] 
        : partners?.map(partner => partner.email) || [];
      
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
          update_link: `${window.location.origin}/company/${companyId}?tab=updates`,
          assigned_partner: assignedPartner?.name || 'Unassigned',
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
    participantEmails: string[],
    meetingLink?: string
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
        meeting_link: meetingLink,
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
      // Get company founder from users table by company_id
      const { data: founder } = await supabase
        .from('users')
        .select('email, name')
        .eq('company_id', companyId)
        .eq('role', 'founder')
        .single();
        
      // Get assigned partner from deals
      const { data: deal } = await supabase
        .from('deals')
        .select(`
          lead_partner,
          users!deals_lead_partner_fkey(name, email)
        `)
        .eq('company_id', companyId)
        .single();
        
      // Get all partners as fallback
      const { data: partners } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'partner');
      
      const assignedPartner = deal?.users as any;
      const recipients = [
        ...(founder?.email ? [founder.email] : []),
        ...(assignedPartner?.email ? [assignedPartner.email] : partners?.map(p => p.email) || [])
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
          founder_email: founder?.email,
          partner_email: assignedPartner?.email,
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
