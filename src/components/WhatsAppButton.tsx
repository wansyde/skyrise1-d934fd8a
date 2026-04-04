import { Headphones } from "lucide-react";
import { useWhatsAppNumber } from "@/hooks/useWhatsAppNumber";

const WhatsAppButton = () => {
  const { url, available } = useWhatsAppNumber();

  if (!available) return null;

  return (
    <a
      href={url!}
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
