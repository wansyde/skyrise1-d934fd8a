import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Known residential / mobile ISP keywords — never flag these
const RESIDENTIAL_ISP_KEYWORDS = [
  "comcast", "xfinity", "at&t", "verizon", "t-mobile", "tmobile",
  "sprint", "spectrum", "cox", "centurylink", "frontier", "mediacom",
  "optimum", "altice", "windstream", "charter", "cablevision",
  "rogers", "bell", "telus", "shaw", "videotron",
  "bt ", "virgin media", "sky broadband", "talktalk", "ee ",
  "vodafone", "orange", "movistar", "telefonica",
  "airtel", "jio", "bsnl", "idea", "reliance",
  "mtn", "safaricom", "glo ", "etisalat", "du ",
  "claro", "tigo", "entel", "personal", "movilnet",
];

function isResidentialOrMobile(isp: string | null): boolean {
  if (!isp) return false;
  const lower = isp.toLowerCase();
  return RESIDENTIAL_ISP_KEYWORDS.some((kw) => lower.includes(kw));
}

interface VpnCheckResult {
  source: string;
  isVpn: boolean;
  isp?: string;
  country?: string;
  region?: string;
  city?: string;
  isMobile?: boolean;
}

// ---------- API 1: ip-api.com (free, no key) ----------
async function checkIpApi(ip: string): Promise<VpnCheckResult> {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,proxy,mobile,hosting`
    );
    if (!res.ok) { await res.text(); return { source: "ip-api", isVpn: false }; }
    const geo = await res.json();
    if (geo.status !== "success") return { source: "ip-api", isVpn: false };

    return {
      source: "ip-api",
      isVpn: geo.proxy === true,
      isp: geo.isp || null,
      country: geo.country,
      region: geo.regionName,
      city: geo.city,
      isMobile: geo.mobile === true,
    };
  } catch (e) {
    console.error("ip-api error:", e);
    return { source: "ip-api", isVpn: false };
  }
}

// ---------- API 2: IPQualityScore ----------
async function checkIpQualityScore(ip: string): Promise<VpnCheckResult> {
  const key = Deno.env.get("IPQUALITYSCORE_API_KEY");
  if (!key) return { source: "ipqualityscore", isVpn: false };
  try {
    const res = await fetch(
      `https://ipqualityscore.com/api/json/ip/${key}/${ip}?strictness=0&allow_public_access_points=true`
    );
    if (!res.ok) { await res.text(); return { source: "ipqualityscore", isVpn: false }; }
    const data = await res.json();
    if (!data.success) return { source: "ipqualityscore", isVpn: false };

    // VPN/proxy/tor but NOT mobile or residential
    const flagged = (data.vpn === true || data.proxy === true || data.tor === true)
      && data.is_crawler !== true;

    return {
      source: "ipqualityscore",
      isVpn: flagged,
      isp: data.ISP || null,
      isMobile: data.mobile === true,
    };
  } catch (e) {
    console.error("ipqualityscore error:", e);
    return { source: "ipqualityscore", isVpn: false };
  }
}

// ---------- API 3: proxycheck.io ----------
async function checkProxyCheck(ip: string): Promise<VpnCheckResult> {
  const key = Deno.env.get("PROXYCHECK_API_KEY");
  if (!key) return { source: "proxycheck", isVpn: false };
  try {
    const res = await fetch(
      `https://proxycheck.io/v2/${ip}?key=${key}&vpn=1&asn=1`
    );
    if (!res.ok) { await res.text(); return { source: "proxycheck", isVpn: false }; }
    const data = await res.json();
    const entry = data[ip];
    if (!entry) return { source: "proxycheck", isVpn: false };

    const flagged = entry.proxy === "yes" || entry.type === "VPN";

    return {
      source: "proxycheck",
      isVpn: flagged,
      isp: entry.provider || null,
    };
  } catch (e) {
    console.error("proxycheck error:", e);
    return { source: "proxycheck", isVpn: false };
  }
}

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

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    let country: string | null = null;
    let region: string | null = null;
    let city: string | null = null;
    let isp: string | null = null;
    let is_vpn = false;
    let connection_type = "unknown";

    let vpn_score_label = "0/3";

    if (clientIp && clientIp !== "unknown" && clientIp !== "127.0.0.1") {
      // Run all 3 checks in parallel
      const [ipApiResult, ipqsResult, proxyCheckResult] = await Promise.all([
        checkIpApi(clientIp),
        checkIpQualityScore(clientIp),
        checkProxyCheck(clientIp),
      ]);

      // Use ip-api for geo data (it's the most complete free source)
      country = ipApiResult.country || null;
      region = ipApiResult.region || null;
      city = ipApiResult.city || null;
      isp = ipApiResult.isp || ipqsResult.isp || proxyCheckResult.isp || null;

      // Determine if mobile
      const isMobile = ipApiResult.isMobile === true || ipqsResult.isMobile === true;

      // ISP safety check — residential/mobile ISPs are never VPN
      const ispSafe = isResidentialOrMobile(isp);

      if (isMobile || ispSafe) {
        // Known mobile/residential — never flag
        is_vpn = false;
        connection_type = isMobile ? "Mobile" : "Residential";
      } else {
        // Multi-API scoring: need >= 2 APIs to agree
        let vpn_score = 0;
        if (ipApiResult.isVpn) vpn_score++;
        if (ipqsResult.isVpn) vpn_score++;
        if (proxyCheckResult.isVpn) vpn_score++;

        console.log(`VPN score for ${clientIp}: ${vpn_score}/3 (ip-api:${ipApiResult.isVpn}, ipqs:${ipqsResult.isVpn}, proxycheck:${proxyCheckResult.isVpn})`);

        is_vpn = vpn_score >= 2;
        connection_type = is_vpn ? "VPN/Proxy" : "Residential";
      }
    }

    // Never block login — just store the detection result
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
        isp,
        is_vpn,
        connection_type,
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, ip: clientIp, country, region, city, isp, is_vpn, connection_type }), {
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
