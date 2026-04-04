import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useWhatsAppNumber } from "@/hooks/useWhatsAppNumber";

const FloatingSupportButton = () => {
  const location = useLocation();
  const { url, available } = useWhatsAppNumber();

  // Hide on Starting page and Support Chat page
  if (location.pathname === "/app/starting") return null;
  if (location.pathname === "/app/support") return null;

  if (!available) return null;

  return (
    <a
      href={url!}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:brightness-110 transition-all"
      aria-label="Customer Support"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
};

export default FloatingSupportButton;
