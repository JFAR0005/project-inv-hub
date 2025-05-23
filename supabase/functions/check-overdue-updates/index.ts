
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

serve(async (req) => {
  try {
    // Initialize Supabase client with the provided service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, name");
    
    if (companiesError) {
      throw companiesError;
    }
    
    const today = new Date();
    const overdueCompanies = [];
    
    // For each company, check last update
    for (const company of companies || []) {
      // Get most recent update
      const { data: updates, error: updatesError } = await supabase
        .from("founder_updates")
        .select("submitted_at")
        .eq("company_id", company.id)
        .order("submitted_at", { ascending: false })
        .limit(1);
      
      if (updatesError) {
        console.error(`Error fetching updates for company ${company.id}:`, updatesError);
        continue;
      }
      
      // Calculate days since last update
      let isOverdue = false;
      let daysSince = null;
      let lastUpdateDate = null;
      
      if (!updates || updates.length === 0) {
        // Company has never submitted an update
        isOverdue = true;
        daysSince = 30; // Default overdue days
      } else {
        lastUpdateDate = new Date(updates[0].submitted_at);
        daysSince = Math.floor((today.getTime() - lastUpdateDate.getTime()) / (1000 * 3600 * 24));
        
        if (daysSince > 30) {
          isOverdue = true;
        }
      }
      
      if (isOverdue) {
        overdueCompanies.push({
          company_id: company.id,
          company_name: company.name,
          days_overdue: daysSince,
          last_update_date: lastUpdateDate?.toISOString() || null
        });
      }
    }
    
    // For each overdue company, create and send notification
    const notifications = [];
    
    for (const company of overdueCompanies) {
      // Get associated founders and partners
      const { data: companyUsers, error: usersError } = await supabase
        .from("users")
        .select("id, email, role")
        .eq("company_id", company.company_id)
        .or("role.eq.founder,role.eq.partner");
      
      if (usersError) {
        console.error(`Error fetching users for company ${company.company_id}:`, usersError);
        continue;
      }
      
      // Create notification recipients list
      const recipients = companyUsers?.map(user => user.email) || [];
      
      // Create notification
      const { data: notification, error: notifError } = await supabase
        .from("notifications")
        .insert({
          type: "update_overdue",
          company_id: company.company_id,
          data: {
            company_name: company.company_name,
            days_overdue: company.days_overdue,
            last_update_date: company.last_update_date
          },
          recipients
        })
        .select()
        .single();
      
      if (notifError) {
        console.error(`Error creating notification for company ${company.company_id}:`, notifError);
        continue;
      }
      
      // Send notification via edge function
      const { error: fnError } = await supabase.functions.invoke("send-notifications", {
        body: { notification }
      });
      
      if (fnError) {
        console.error(`Error sending notification for company ${company.company_id}:`, fnError);
        continue;
      }
      
      notifications.push(notification);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        overdue_count: overdueCompanies.length,
        notifications_sent: notifications.length
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking overdue updates:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
