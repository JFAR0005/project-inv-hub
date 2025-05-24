
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const demoUsers = [
      {
        email: 'admin@blacknova.vc',
        password: 'demo',
        role: 'admin',
        name: 'Admin User'
      },
      {
        email: 'capital@blacknova.vc',
        password: 'demo',
        role: 'capital_team',
        name: 'Capital Team Member'
      },
      {
        email: 'partner@blacknova.vc',
        password: 'demo',
        role: 'partner',
        name: 'Partner'
      },
      {
        email: 'founder@blacknova.vc',
        password: 'demo',
        role: 'founder',
        name: 'Founder'
      }
    ]

    const results = []

    for (const user of demoUsers) {
      try {
        // First check if user already exists
        const { data: existingAuth } = await supabaseClient.auth.admin.listUsers()
        const existingUser = existingAuth?.users?.find(u => u.email === user.email)
        
        let authUserId = existingUser?.id

        if (!existingUser) {
          // Create auth user
          const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              name: user.name
            }
          })

          if (authError) {
            console.error(`Error creating auth user ${user.email}:`, authError)
            results.push({ email: user.email, success: false, error: authError.message })
            continue
          }
          
          authUserId = authData.user.id
        }

        // Create/update user profile
        const { error: profileError } = await supabaseClient
          .from('users')
          .upsert({
            id: authUserId,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error(`Error creating/updating profile for ${user.email}:`, profileError)
          results.push({ email: user.email, success: false, error: profileError.message })
        } else {
          results.push({ 
            email: user.email, 
            success: true, 
            action: existingUser ? 'updated' : 'created' 
          })
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error)
        results.push({ email: user.email, success: false, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ message: 'Demo users creation completed', results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in create-demo-users function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
