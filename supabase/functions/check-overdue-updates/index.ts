
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
    console.log('Checking for overdue updates...');
    
    // Create a Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, founder_email');

    if (companiesError) {
      throw new Error(`Error fetching companies: ${companiesError.message}`);
    }

    // Get latest updates for each company
    const { data: updates, error: updatesError } = await supabase
      .from('founder_updates')
      .select('company_id, submitted_at')
      .order('submitted_at', { ascending: false });

    if (updatesError) {
      throw new Error(`Error fetching updates: ${updatesError.message}`);
    }

    // Create a map of latest updates by company
    const latestUpdatesByCompany = new Map();
    updates?.forEach(update => {
      if (!latestUpdatesByCompany.has(update.company_id)) {
        latestUpdatesByCompany.set(update.company_id, update);
      }
    });

    const overdueCompanies = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Check each company for overdue updates
    companies?.forEach(company => {
      const latestUpdate = latestUpdatesByCompany.get(company.id);
      
      if (!latestUpdate) {
        // No updates ever submitted
        overdueCompanies.push({
          ...company,
          daysOverdue: 999,
          lastUpdateDate: null
        });
      } else {
        const lastUpdateDate = new Date(latestUpdate.submitted_at);
        if (lastUpdateDate < thirtyDaysAgo) {
          const daysDiff = Math.floor((new Date().getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));
          overdueCompanies.push({
            ...company,
            daysOverdue: daysDiff,
            lastUpdateDate: latestUpdate.submitted_at
          });
        }
      }
    });

    console.log(`Found ${overdueCompanies.length} companies with overdue updates`);

    // If we have overdue companies, trigger notifications
    if (overdueCompanies.length > 0) {
      for (const company of overdueCompanies) {
        try {
          // Call the send-notifications function for each overdue company
          const { error: notificationError } = await supabase.functions.invoke('send-notifications', {
            body: {
              notification: {
                type: 'update_overdue',
                company_id: company.id,
                data: {
                  company_name: company.name,
                  days_overdue: company.daysOverdue,
                  last_update_date: company.lastUpdateDate
                },
                recipients: [
                  company.founder_email,
                  // Add partners who should be notified
                ].filter(Boolean)
              }
            }
          });

          if (notificationError) {
            console.error(`Failed to send notification for ${company.name}:`, notificationError);
          } else {
            console.log(`Sent overdue notification for ${company.name}`);
          }
        } catch (error) {
          console.error(`Error sending notification for ${company.name}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${companies?.length || 0} companies, found ${overdueCompanies.length} overdue`,
        overdueCompanies: overdueCompanies.map(c => ({ name: c.name, daysOverdue: c.daysOverdue }))
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
