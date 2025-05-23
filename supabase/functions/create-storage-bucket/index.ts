
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
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Create storage bucket if it doesn't exist
    const { data, error } = await supabaseAdmin.storage.createBucket('company_files', {
      public: true,
      fileSizeLimit: 10485760, // 10MB limit
      allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint', 'application/x-iwork-keynote-sffkey']
    });

    if (error && !error.message.includes('already exists')) {
      throw error;
    }

    // Set up bucket policy to allow public read access but authenticated write
    const bucketId = 'company_files';
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, bucket: bucketId }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating storage bucket:", error);
    
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
