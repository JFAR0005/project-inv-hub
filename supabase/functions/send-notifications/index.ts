
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define notification types
type NotificationType =
  | 'update_submitted'  // When a founder submits an update
  | 'meeting_scheduled' // When a meeting is scheduled
  | 'update_overdue';   // When an update is overdue (30+ days)

// Data specific to each notification type
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

interface Notification {
  id?: string;
  type: NotificationType;
  company_id: string;
  data: NotificationData;
  recipients: string[];
  created_at?: string;
}

serve(async (req) => {
  try {
    // Parse the request body
    const { notification } = await req.json() as { notification: Notification };
    
    if (!notification || !notification.type) {
      return new Response(
        JSON.stringify({ error: "Invalid notification data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Get necessary environment variables for notifications
    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL") || "";
    const emailApiKey = Deno.env.get("EMAIL_API_KEY") || "";
    const slackEnabled = !!slackWebhookUrl;
    const emailEnabled = !!emailApiKey;
    
    // If no notification channels are enabled, return early
    if (!slackEnabled && !emailEnabled) {
      return new Response(
        JSON.stringify({ success: false, error: "No notification channels configured" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const results: any = {
      slack: null,
      email: null,
    };
    
    // Send notification based on type
    switch (notification.type) {
      case "update_submitted":
        if (slackEnabled) {
          results.slack = await sendToSlack(
            slackWebhookUrl,
            formatUpdateSubmittedForSlack(notification)
          );
        }
        
        if (emailEnabled && notification.recipients?.length) {
          results.email = await sendToEmail(
            emailApiKey,
            notification.recipients,
            formatUpdateSubmittedForEmail(notification)
          );
        }
        break;
        
      case "meeting_scheduled":
        if (slackEnabled) {
          results.slack = await sendToSlack(
            slackWebhookUrl,
            formatMeetingScheduledForSlack(notification)
          );
        }
        
        if (emailEnabled && notification.recipients?.length) {
          results.email = await sendToEmail(
            emailApiKey,
            notification.recipients,
            formatMeetingScheduledForEmail(notification)
          );
        }
        break;
        
      case "update_overdue":
        if (slackEnabled) {
          results.slack = await sendToSlack(
            slackWebhookUrl,
            formatUpdateOverdueForSlack(notification)
          );
        }
        
        if (emailEnabled && notification.recipients?.length) {
          results.email = await sendToEmail(
            emailApiKey,
            notification.recipients,
            formatUpdateOverdueForEmail(notification)
          );
        }
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: "Unknown notification type" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification sent",
        channels: {
          slack: slackEnabled,
          email: emailEnabled,
        },
        results
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Helper functions for formatting notifications

// Slack message formatters
function formatUpdateSubmittedForSlack(notification: Notification): any {
  const { company_name, submitter_name, update_link } = notification.data;
  
  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🚨 New Update from ${company_name}`,
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${submitter_name}* has submitted a new company update for *${company_name}*`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `View the update details: ${update_link}`
        }
      }
    ]
  };
}

function formatMeetingScheduledForSlack(notification: Notification): any {
  const { meeting_title, meeting_date, meeting_time, participants } = notification.data;
  
  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `📅 New Meeting: ${meeting_title}`,
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `A new meeting has been scheduled for *${meeting_date}* at *${meeting_time}*`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Participants:*\n${participants?.join(', ') || 'No participants specified'}`
        }
      }
    ]
  };
}

function formatUpdateOverdueForSlack(notification: Notification): any {
  const { company_name, days_overdue, last_update_date } = notification.data;
  
  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `⚠️ Update Overdue: ${company_name}`,
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${company_name}* is overdue for an update`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Days overdue:* ${days_overdue}`
          },
          {
            type: "mrkdwn",
            text: `*Last update:* ${last_update_date ? new Date(last_update_date).toLocaleDateString() : 'Never'}`
          }
        ]
      }
    ]
  };
}

// Email formatters
function formatUpdateSubmittedForEmail(notification: Notification): any {
  const { company_name, submitter_name, update_link } = notification.data;
  
  return {
    subject: `New Update from ${company_name}`,
    body: `
      <h2>New Company Update</h2>
      <p>${submitter_name} has submitted a new company update for ${company_name}.</p>
      <p><a href="${update_link}">View Update Details</a></p>
    `
  };
}

function formatMeetingScheduledForEmail(notification: Notification): any {
  const { meeting_title, meeting_date, meeting_time, participants } = notification.data;
  
  return {
    subject: `New Meeting: ${meeting_title}`,
    body: `
      <h2>${meeting_title}</h2>
      <p>A new meeting has been scheduled for ${meeting_date} at ${meeting_time}.</p>
      <p><strong>Participants:</strong><br>
      ${participants?.join('<br>') || 'No participants specified'}</p>
    `
  };
}

function formatUpdateOverdueForEmail(notification: Notification): any {
  const { company_name, days_overdue, last_update_date } = notification.data;
  
  return {
    subject: `Update Overdue: ${company_name}`,
    body: `
      <h2>Update Overdue</h2>
      <p>${company_name} is overdue for an update.</p>
      <p><strong>Days overdue:</strong> ${days_overdue}</p>
      <p><strong>Last update:</strong> ${last_update_date ? new Date(last_update_date).toLocaleDateString() : 'Never'}</p>
    `
  };
}

// Functions to send notifications through different channels

async function sendToSlack(webhookUrl: string, message: any): Promise<any> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Slack API error: ${error}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error sending Slack notification:", error);
    return { success: false, error: error.message };
  }
}

async function sendToEmail(apiKey: string, recipients: string[], emailContent: any): Promise<any> {
  // This is a mock implementation - you would use your preferred email provider
  // Examples include SendGrid, Mailgun, AWS SES, etc.
  
  try {
    // In a real implementation, you'd call your email provider's API here
    console.log(`Would send email to ${recipients.join(', ')}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`Body: ${emailContent.body}`);
    
    // Mock successful response
    return { success: true, recipients };
  } catch (error) {
    console.error("Error sending email notification:", error);
    return { success: false, error: error.message };
  }
}
