import { Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const FloatingSupportButton = () => {
  const location = useLocation();
  
  // Hide on Starting page and Support Chat page
  if (location.pathname === "/app/starting") return null;
  if (location.pathname === "/app/support") return null;

  return (
    <Link
      to="/app/support"
      className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:brightness-110 transition-all"
      aria-label="Customer Support"
    >
      <MessageCircle className="h-5 w-5" />
    </Link>
  );
};

export default FloatingSupportButton;
