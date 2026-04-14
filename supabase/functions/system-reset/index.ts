import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin using their JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await userClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { confirmation_text, admin_password } = body;

    if (confirmation_text !== "RESET SKYRISE") {
      return new Response(JSON.stringify({ error: "Invalid confirmation text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!admin_password || admin_password.length < 1) {
      return new Response(JSON.stringify({ error: "Password required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin password by attempting sign-in
    const verifyClient = createClient(supabaseUrl, anonKey);
    const { error: signInError } = await verifyClient.auth.signInWithPassword({
      email: user.email!,
      password: admin_password,
    });

    if (signInError) {
      return new Response(JSON.stringify({ error: "Incorrect password" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client for deletions
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Get all non-admin user IDs
    const { data: adminRoles } = await adminClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    const adminUserIds = (adminRoles || []).map((r: any) => r.user_id);

    // Get all user IDs that are NOT admins
    const { data: allProfiles } = await adminClient
      .from("profiles")
      .select("user_id");

    const nonAdminUserIds = (allProfiles || [])
      .map((p: any) => p.user_id)
      .filter((id: string) => !adminUserIds.includes(id));

    // Delete data in order (respecting potential FK constraints)
    // 1. ticket_messages
    await adminClient.from("ticket_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 2. support_tickets
    await adminClient.from("support_tickets").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 3. support_messages
    await adminClient.from("support_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 4. task_records
    await adminClient.from("task_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 5. aaa_assignments
    await adminClient.from("aaa_assignments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 6. transactions
    await adminClient.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 7. deposits
    await adminClient.from("deposits").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 8. withdrawals
    await adminClient.from("withdrawals").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 9. user_investments
    await adminClient.from("user_investments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 10. admin_logs
    await adminClient.from("admin_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 11. Delete non-admin user roles
    if (nonAdminUserIds.length > 0) {
      await adminClient.from("user_roles").delete().in("user_id", nonAdminUserIds);
    }

    // 12. Delete non-admin profiles
    if (nonAdminUserIds.length > 0) {
      await adminClient.from("profiles").delete().in("user_id", nonAdminUserIds);
    }

    // 13. Delete non-admin auth users
    for (const uid of nonAdminUserIds) {
      await adminClient.auth.admin.deleteUser(uid);
    }

    // 14. Reset admin profiles (balance, salary, tasks etc.)
    for (const adminId of adminUserIds) {
      await adminClient.from("profiles").update({
        balance: 0,
        advertising_salary: 0,
        escrow_balance: 0,
        tasks_completed_today: 0,
        task_cycle_completed: false,
        current_unlocked_set: 1,
        pending_popup_message: null,
        pending_popup_type: null,
      }).eq("user_id", adminId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        deleted_users: nonAdminUserIds.length,
        message: "System reset complete",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
