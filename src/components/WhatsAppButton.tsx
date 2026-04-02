import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Headphones } from "lucide-react";

const WhatsAppButton = () => {
  const [number, setNumber] = useState("");

  useEffect(() => {
    const fetchNumber = async () => {
      const { data } = await supabase
        .from("support_settings")
        .select("value")
        .eq("key", "whatsapp_number")
        .single();
      if (data?.value) setNumber(data.value);
    };
    fetchNumber();
  }, []);

  if (!number) return null;

  const url = `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=Hello%20I%20need%20help%20with%20my%20account.`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-20 right-6 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
      aria-label="WhatsApp Support"
    >
      <Headphones className="h-5 w-5" />
    </a>
  );
};

export default WhatsAppButton;
