import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate token using getClaims
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Get IP from headers
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Geolocate
    let country = null;
    let region = null;
    let city = null;

    if (clientIp && clientIp !== "unknown" && clientIp !== "127.0.0.1") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,country,regionName,city`);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.status === "success") {
            country = geo.country;
            region = geo.regionName;
            city = geo.city;
          }
        }
      } catch (e) {
        console.error("Geolocation lookup failed:", e);
      }
    }

    // Update profile with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        ip_address: clientIp,
        last_login_ip: clientIp,
        last_login_at: new Date().toISOString(),
        ...(country && { country }),
        ...(region && { region }),
        ...(city && { city }),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, ip: clientIp, country, region, city }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Track login error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
