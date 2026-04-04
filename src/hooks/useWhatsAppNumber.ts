import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWhatsAppNumber = () => {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("support_settings")
        .select("value")
        .eq("key", "whatsapp_number")
        .single();
      if (data?.value) setNumber(data.value);
      setLoading(false);
    };
    fetch();

    // Subscribe to changes for real-time sync
    const channel = supabase
      .channel("whatsapp-number-sync")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "support_settings",
      }, (payload) => {
        const row = payload.new as { key: string; value: string } | undefined;
        if (row && row.key === "whatsapp_number") {
          setNumber(row.value);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const url = number
    ? `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=Hello%20I%20need%20help%20with%20my%20account.`
    : null;

  return { number, url, loading, available: !!number };
};
