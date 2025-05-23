
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  type: 'update_submitted' | 'meeting_scheduled' | 'overdue_update';
  company_id: string;
  data: {
    company_name?: string;
    submitter_name?: string;
    meeting_title?: string;
    meeting_time?: string;
    participants?: string[];
    update_link?: string;
    meeting_link?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const payload: NotificationPayload = await req.json();
    console.log('Notification payload received:', payload);

    // Create a Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
          status: 500,
        }
      );
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', payload.company_id)
      .single();

    if (companyError) {
      throw new Error(`Error fetching company: ${companyError.message}`);
    }

    // Prepare notification data for n8n
    const notificationData = {
      type: payload.type,
      company_id: payload.company_id,
      company_name: company.name,
      timestamp: new Date().toISOString(),
      ...payload.data
    };

    // Send to n8n webhook
    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed with status: ${webhookResponse.status}`);
    }

    console.log('Notification sent successfully to n8n');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent for ${payload.type}`,
        company: company.name
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 500,
      }
    );
  }
});
