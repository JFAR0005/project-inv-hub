
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.2.3";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceRole);

serve(async (req) => {
  try {
    // This function can be triggered via a scheduled task or manually
    const DAYS_OVERDUE_THRESHOLD = 30; // Companies with no updates in 30 days are considered overdue
    const now = new Date();
    const overdueDate = new Date();
    overdueDate.setDate(now.getDate() - DAYS_OVERDUE_THRESHOLD);

    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, name");

    if (companiesError) {
      throw new Error(`Error fetching companies: ${companiesError.message}`);
    }

    const notifications = [];
    const notificationsEndpoint = `${supabaseUrl}/functions/v1/send-notifications`;

    for (const company of companies) {
      // Get the latest update for each company
      const { data: updates, error: updatesError } = await supabase
        .from("founder_updates")
        .select("submitted_at")
        .eq("company_id", company.id)
        .order("submitted_at", { ascending: false })
        .limit(1);

      if (updatesError) {
        console.error(`Error fetching updates for company ${company.id}: ${updatesError.message}`);
        continue;
      }

      const lastUpdate = updates && updates.length > 0 ? updates[0] : null;
      const lastUpdateDate = lastUpdate ? new Date(lastUpdate.submitted_at) : null;

      // If no updates or last update is older than the threshold
      if (!lastUpdate || lastUpdateDate < overdueDate) {
        // Get the company details
        const { data: companyDetails, error: companyError } = await supabase
          .from("companies")
          .select("name")
          .eq("id", company.id)
          .single();

        if (companyError) {
          console.error(`Error fetching company details for ${company.id}: ${companyError.message}`);
          continue;
        }

        // Get founder and partner contacts for this company
        const { data: contacts, error: contactsError } = await supabase
          .from("users")
          .select("id, email, role")
          .or(`role.eq.founder,role.eq.partner`)
          .eq("company_id", company.id);

        if (contactsError) {
          console.error(`Error fetching contacts for company ${company.id}: ${contactsError.message}`);
          continue;
        }

        const founderEmails = contacts
          .filter((user) => user.role === "founder")
          .map((user) => user.email);

        const partnerEmails = contacts
          .filter((user) => user.role === "partner")
          .map((user) => user.email);

        // Calculate days overdue
        const daysOverdue = lastUpdateDate 
          ? Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24))
          : DAYS_OVERDUE_THRESHOLD + 10; // If no updates, set a default higher than threshold

        // Create notification object
        const notification = {
          type: "update_overdue",
          company_id: company.id,
          data: {
            company_name: companyDetails.name,
            days_overdue: daysOverdue,
            last_update_date: lastUpdateDate ? lastUpdateDate.toISOString() : null,
          },
          recipients: [...founderEmails, ...partnerEmails],
        };

        console.log(`Sending overdue notification for ${companyDetails.name}: ${daysOverdue} days overdue`);

        // Send the notification
        try {
          const response = await fetch(notificationsEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseServiceRole}`,
            },
            body: JSON.stringify({ notification }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to send notification: ${errorText}`);
          }

          notifications.push({
            company: companyDetails.name,
            status: "success",
            days_overdue: daysOverdue,
          });
        } catch (error) {
          console.error(`Error sending notification for ${companyDetails.name}:`, error);
          notifications.push({
            company: companyDetails.name,
            status: "failed",
            error: error.message,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: companies.length,
        notifications,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in check-overdue-updates function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
