import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateSecurePassword(length = 16): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;

  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);

  // Ensure at least one of each type
  const password = [
    upper[arr[0] % upper.length],
    lower[arr[1] % lower.length],
    digits[arr[2] % digits.length],
    special[arr[3] % special.length],
  ];

  for (let i = 4; i < length; i++) {
    password.push(all[arr[i] % all.length]);
  }

  // Shuffle
  for (let i = password.length - 1; i > 0; i--) {
    const j = arr[i] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, user_id, new_password } = body;

    if (!user_id || typeof user_id !== "string") {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!action || !["reset_password", "generate_password", "login_as_user"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prevent admin from acting on themselves for login_as_user
    if (action === "login_as_user" && user_id === caller.id) {
      return new Response(JSON.stringify({ error: "Cannot impersonate yourself" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = { ...corsHeaders, "Content-Type": "application/json" };

    if (action === "reset_password") {
      if (!new_password || typeof new_password !== "string" || new_password.length < 6) {
        return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
          status: 400, headers: res,
        });
      }

      const { error } = await adminClient.auth.admin.updateUser(user_id, {
        password: new_password,
      });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: res });
      }

      return new Response(JSON.stringify({ success: true, message: "Password reset successfully" }), {
        status: 200, headers: res,
      });
    }

    if (action === "generate_password") {
      const generatedPassword = generateSecurePassword(14);

      const { error } = await adminClient.auth.admin.updateUser(user_id, {
        password: generatedPassword,
      });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: res });
      }

      return new Response(JSON.stringify({
        success: true,
        generated_password: generatedPassword,
        message: "Password generated and set successfully",
      }), { status: 200, headers: res });
    }

    if (action === "login_as_user") {
      // Generate a magic link for the admin to use
      const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(user_id);
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: res });
      }

      const email = userData.user.email;
      if (!email) {
        return new Response(JSON.stringify({ error: "User has no email" }), { status: 400, headers: res });
      }

      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: email,
      });

      if (linkError || !linkData) {
        return new Response(JSON.stringify({ error: linkError?.message || "Failed to generate login link" }), {
          status: 500, headers: res,
        });
      }

      // Extract the token from the generated link properties
      const token_hash = linkData.properties?.hashed_token;
      
      return new Response(JSON.stringify({
        success: true,
        token_hash: token_hash,
        email: email,
        message: "Login link generated",
      }), { status: 200, headers: res });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: res });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
