
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Notification types
export type NotificationType = 
  | 'update_submitted'  // When a founder submits an update
  | 'meeting_scheduled' // When a meeting is scheduled
  | 'update_overdue';   // When an update is overdue (30+ days)

// Data specific to each notification type
export type NotificationData = {
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
};

export interface NotificationRequest {
  type: NotificationType;
  company_id: string;
  data: NotificationData;
  recipients?: string[]; // Optional override for default recipients
}

export const useNotifications = () => {
  const { toast } = useToast();

  const sendNotification = async (notification: NotificationRequest) => {
    try {
      // Insert notification into database for tracking
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type: notification.type,
          company_id: notification.company_id,
          data: notification.data,
          recipients: notification.recipients || []
        })
        .select()
        .single();

      if (error) throw error;
      
      // Call the Supabase Edge Function to send the notification
      // This will handle the actual sending via Slack, email, etc.
      const { error: fnError } = await supabase.functions.invoke('send-notifications', {
        body: { notification: data }
      });
      
      if (fnError) throw fnError;
      
      return data;
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Notification Failed",
        description: "There was an error sending the notification",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { sendNotification };
};

// Schedule for automated notifications (30+ days without update)
// This would be handled by a scheduled edge function
export const checkOverdueUpdates = async () => {
  try {
    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (companiesError) throw companiesError;
    
    const today = new Date();
    
    // For each company, check last update
    for (const company of companies || []) {
      // Get most recent update
      const { data: updates, error: updatesError } = await supabase
        .from('founder_updates')
        .select('submitted_at')
        .eq('company_id', company.id)
        .order('submitted_at', { ascending: false })
        .limit(1);
      
      if (updatesError) continue;
      
      // If no updates or last update > 30 days ago
      if (!updates || updates.length === 0) {
        // Company has never submitted an update
        await sendOverdueNotification(company.id, company.name, null);
      } else {
        const lastUpdate = new Date(updates[0].submitted_at);
        const daysSince = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
        
        if (daysSince > 30) {
          await sendOverdueNotification(company.id, company.name, lastUpdate, daysSince);
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error checking overdue updates:', error);
    return { success: false, error };
  }
};

const sendOverdueNotification = async (
  companyId: string,
  companyName: string,
  lastUpdateDate: Date | null,
  daysOverdue: number = 30
) => {
  try {
    // Get associated founders and partners
    const { data: companyUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('company_id', companyId)
      .or('role.eq.founder,role.eq.partner');
    
    if (usersError) throw usersError;
    
    // Create notification recipients list
    const recipients = companyUsers?.map(user => user.email) || [];
    
    // Insert notification
    const { error } = await supabase
      .from('notifications')
      .insert({
        type: 'update_overdue' as NotificationType,
        company_id: companyId,
        data: {
          company_name: companyName,
          days_overdue: daysOverdue,
          last_update_date: lastUpdateDate ? lastUpdateDate.toISOString() : null
        },
        recipients
      });
    
    if (error) throw error;
    
    // Call edge function to send notifications
    await supabase.functions.invoke('send-notifications', {
      body: {
        notification: {
          type: 'update_overdue',
          company_id: companyId,
          data: {
            company_name: companyName,
            days_overdue: daysOverdue,
            last_update_date: lastUpdateDate ? lastUpdateDate.toISOString() : null
          },
          recipients
        }
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending overdue notification:', error);
    return { success: false, error };
  }
};
