import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const [number, setNumber] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("support_settings")
        .select("value")
        .eq("key", "whatsapp_number")
        .single();
      if (data?.value) setNumber(data.value);
    };
    fetch();
  }, []);

  if (!number) return null;

  const url = `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=Hello%20I%20need%20help%20with%20my%20account.`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-sm font-medium"
      aria-label="WhatsApp Support"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
