// Cleanup KYC files automatically:
//   - Pending/submitted KYC older than 7 days  -> delete files + nullify columns
//   - Verified KYC older than 30 days          -> delete files + nullify file URL columns (keep verification metadata)
//
// Designed to be invoked by a daily cron. Idempotent and safe to run multiple times.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "kyc-documents";

interface ProfileRow {
  user_id: string;
  kyc_status: string;
  kyc_submitted_at: string | null;
  kyc_front_url: string | null;
  kyc_back_url: string | null;
  kyc_selfie_url: string | null;
}

/** Extract a storage path from either a stored path or a legacy public URL. */
function extractPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("http")) {
    const marker = `/${BUCKET}/`;
    const idx = value.indexOf(marker);
    if (idx === -1) return null;
    try {
      return decodeURIComponent(value.slice(idx + marker.length).split("?")[0]);
    } catch {
      return null;
    }
  }
  return value;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  const sevenDaysAgo = new Date(now - SEVEN_DAYS).toISOString();
  const thirtyDaysAgo = new Date(now - THIRTY_DAYS).toISOString();

  let pendingExpired = 0;
  let verifiedExpired = 0;
  let filesDeleted = 0;
  const errors: string[] = [];

  try {
    // 1) PENDING / SUBMITTED older than 7 days
    const { data: pending } = await supabase
      .from("profiles")
      .select("user_id,kyc_status,kyc_submitted_at,kyc_front_url,kyc_back_url,kyc_selfie_url")
      .in("kyc_status", ["pending", "submitted", "rejected"])
      .lt("kyc_submitted_at", sevenDaysAgo)
      .not("kyc_submitted_at", "is", null);

    for (const row of (pending ?? []) as ProfileRow[]) {
      const paths = [row.kyc_front_url, row.kyc_back_url, row.kyc_selfie_url]
        .map(extractPath)
        .filter((p): p is string => !!p);

      if (paths.length > 0) {
        const { error: rmErr } = await supabase.storage.from(BUCKET).remove(paths);
        if (rmErr) {
          errors.push(`pending remove ${row.user_id}: ${rmErr.message}`);
        } else {
          filesDeleted += paths.length;
        }
      }

      const { error: updErr } = await supabase
        .from("profiles")
        .update({
          kyc_front_url: null,
          kyc_back_url: null,
          kyc_selfie_url: null,
          kyc_status: row.kyc_status === "rejected" ? "rejected" : "expired",
        })
        .eq("user_id", row.user_id);
      if (updErr) errors.push(`pending update ${row.user_id}: ${updErr.message}`);
      else pendingExpired++;
    }

    // 2) VERIFIED older than 30 days  -> delete raw images, KEEP verification metadata
    const { data: verified } = await supabase
      .from("profiles")
      .select("user_id,kyc_status,kyc_submitted_at,kyc_front_url,kyc_back_url,kyc_selfie_url")
      .eq("kyc_status", "verified")
      .lt("kyc_submitted_at", thirtyDaysAgo)
      .not("kyc_submitted_at", "is", null);

    for (const row of (verified ?? []) as ProfileRow[]) {
      const paths = [row.kyc_front_url, row.kyc_back_url, row.kyc_selfie_url]
        .map(extractPath)
        .filter((p): p is string => !!p);

      if (paths.length === 0) continue; // already cleaned

      const { error: rmErr } = await supabase.storage.from(BUCKET).remove(paths);
      if (rmErr) {
        errors.push(`verified remove ${row.user_id}: ${rmErr.message}`);
        continue;
      }
      filesDeleted += paths.length;

      const { error: updErr } = await supabase
        .from("profiles")
        .update({
          kyc_front_url: null,
          kyc_back_url: null,
          kyc_selfie_url: null,
          // keep kyc_status='verified', kyc_name, kyc_id_type, kyc_submitted_at
        })
        .eq("user_id", row.user_id);
      if (updErr) errors.push(`verified update ${row.user_id}: ${updErr.message}`);
      else verifiedExpired++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        pending_expired: pendingExpired,
        verified_expired: verifiedExpired,
        files_deleted: filesDeleted,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
