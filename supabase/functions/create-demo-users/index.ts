
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Demo users to create
    const demoUsers = [
      {
        email: 'admin@blacknova.vc',
        password: 'demo123',
        role: 'admin',
        name: 'Admin User'
      },
      {
        email: 'partner@blacknova.vc',
        password: 'demo123',
        role: 'partner',
        name: 'Partner User'
      },
      {
        email: 'founder@blacknova.vc',
        password: 'demo123',
        role: 'founder',
        name: 'Founder User'
      },
      {
        email: 'capital@blacknova.vc',
        password: 'demo123',
        role: 'capital_team',
        name: 'Capital Team User'
      }
    ]

    const results = []

    for (const user of demoUsers) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role
          }
        })

        if (authError) {
          console.error(`Failed to create auth user ${user.email}:`, authError)
          results.push({ email: user.email, success: false, error: authError.message })
          continue
        }

        // Create or update profile
        const { error: profileError } = await supabaseAdmin
          .from('users')
          .upsert({
            id: authData.user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is_active: true
          })

        if (profileError) {
          console.error(`Failed to create profile for ${user.email}:`, profileError)
          results.push({ email: user.email, success: false, error: profileError.message })
        } else {
          results.push({ email: user.email, success: true })
        }

      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error)
        results.push({ email: user.email, success: false, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
