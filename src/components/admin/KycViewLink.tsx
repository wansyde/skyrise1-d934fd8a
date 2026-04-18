import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  /** Either a storage path like "<user_id>/id-front.jpg" or a legacy public URL. */
  value: string | null | undefined;
}

const BUCKET = "kyc-documents";

/**
 * Extract the storage path from a value that might be:
 *   - a bare storage path (preferred new format)
 *   - a legacy full public URL containing "/kyc-documents/<path>"
 */
function extractPath(value: string): string | null {
  if (!value) return null;
  if (value.startsWith("http")) {
    const marker = `/${BUCKET}/`;
    const idx = value.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(value.slice(idx + marker.length).split("?")[0]);
  }
  return value;
}

const KycViewLink = ({ value }: Props) => {
  const [loading, setLoading] = useState(false);

  if (!value) return <span className="text-xs text-muted-foreground">—</span>;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const path = extractPath(value);
    if (!path) {
      toast.error("Document path is invalid.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, 60); // 60-second expiry
      if (error || !data?.signedUrl) throw error || new Error("No URL");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error("Could not open document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
      View
    </button>
  );
};

export default KycViewLink;
