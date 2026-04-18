import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// IMPORTANT: This function is timezone-safe.
// The promotion window is 10:00–22:00 Eastern Time, so the daily counter must
// reset at the start of an ET day, NOT at UTC midnight (which lands inside the
// active promotion window and wipes user progress mid-session).
// We delegate to the SQL function `reset_tasks_for_new_et_day`, which only
// resets users whose last_task_reset is from a previous ET day.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase.rpc("reset_tasks_for_new_et_day");
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, result: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
