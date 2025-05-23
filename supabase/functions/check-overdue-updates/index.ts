
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Create a Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Get all companies with their latest updates
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        founder_updates (
          submitted_at
        )
      `);

    if (companiesError) {
      throw new Error(`Error fetching companies: ${companiesError.message}`);
    }

    const overdueCompanies = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Check each company for overdue updates
    for (const company of companies) {
      const latestUpdate = company.founder_updates
        ?.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0];

      if (!latestUpdate || new Date(latestUpdate.submitted_at) < thirtyDaysAgo) {
        overdueCompanies.push({
          id: company.id,
          name: company.name,
          lastUpdateDate: latestUpdate?.submitted_at || null
        });
      }
    }

    console.log(`Found ${overdueCompanies.length} companies with overdue updates`);

    // Send notifications for overdue companies
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (n8nWebhookUrl && overdueCompanies.length > 0) {
      for (const company of overdueCompanies) {
        try {
          const notificationData = {
            type: 'overdue_update',
            company_id: company.id,
            company_name: company.name,
            timestamp: new Date().toISOString(),
            data: {
              company_name: company.name,
              days_overdue: Math.floor((Date.now() - (company.lastUpdateDate ? new Date(company.lastUpdateDate).getTime() : Date.now() - (60 * 24 * 60 * 60 * 1000))) / (24 * 60 * 60 * 1000)),
              last_update_date: company.lastUpdateDate,
              update_link: `${Deno.env.get('SUPABASE_URL')}/companies/${company.id}`
            }
          };

          await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationData),
          });

          console.log(`Sent overdue notification for ${company.name}`);
        } catch (error) {
          console.error(`Failed to send notification for ${company.name}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Checked for overdue updates`,
        overdueCount: overdueCompanies.length,
        overdueCompanies: overdueCompanies.map(c => c.name)
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
    console.error("Error checking overdue updates:", error);
    
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
