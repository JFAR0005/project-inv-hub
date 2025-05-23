
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
    const { company_id, update_id } = await req.json();
    
    if (!company_id || !update_id) {
      throw new Error("Missing required parameters: company_id and update_id");
    }

    // Create a Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .single();

    if (companyError) {
      throw new Error(`Error fetching company: ${companyError.message}`);
    }

    // Get update details
    const { data: update, error: updateError } = await supabase
      .from('founder_updates')
      .select('*')
      .eq('id', update_id)
      .single();

    if (updateError) {
      throw new Error(`Error fetching update: ${updateError.message}`);
    }

    // In a real implementation, this would send an email or Slack notification
    // For now, we'll just log the information
    console.log(`New update submitted for ${company.name}`);
    console.log(`ARR: $${update.arr}, MRR: $${update.mrr}, Burn Rate: $${update.burn_rate}`);
    console.log(`Runway: ${update.runway} months, Headcount: ${update.headcount}`);
    console.log(`Fundraising Status: ${update.raise_status}`);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent for update from ${company.name}` 
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
    
    // Return error response
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
