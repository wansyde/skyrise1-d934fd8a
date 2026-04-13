import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import SkyriseLogo from "@/components/SkyriseLogo";

// Only these popup types are allowed to show
const ALLOWED_TYPES = ["upgrade", "reset", "bonus", "info"];
// These are blocked (transaction-related)
const BLOCKED_TYPES = ["deposit", "withdrawal", "balance"];

const PendingPopup = () => {
  const { profile, refreshProfile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [popupType, setPopupType] = useState("");

  useEffect(() => {
    if (!profile?.pending_popup_message) return;

    const type = profile.pending_popup_type || "info";

    // Block transaction-related popups - silently clear them
    if (BLOCKED_TYPES.includes(type)) {
      clearPopup();
      return;
    }

    // Session guard: only show once per login session
    const seen = sessionStorage.getItem("hasSeenBonusPopup");
    if (seen === "true") {
      clearPopup();
      return;
    }

    setMessage(profile.pending_popup_message);
    setPopupType(type);
    setVisible(true);
    sessionStorage.setItem("hasSeenBonusPopup", "true");
  }, [profile?.pending_popup_message]);

  const clearPopup = async () => {
    if (profile?.user_id) {
      await supabase
        .from("profiles")
        .update({ pending_popup_message: null, pending_popup_type: null } as any)
        .eq("user_id", profile.user_id);
      refreshProfile();
    }
  };

  const dismiss = async () => {
    setVisible(false);
    await clearPopup();
  };

  const getIcon = () => {
    switch (popupType) {
      case "upgrade":
        return (
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="hsl(var(--primary))" opacity="0.9"/>
            </svg>
          </div>
        );
      case "reset":
        return (
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4v6h6M23 20v-6h-6" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case "bonus":
        return (
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="hsl(var(--primary))" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-6"
          >
            <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
              <div className="px-8 pt-7 pb-8 text-center">
                <div className="flex justify-center mb-4">
                  <SkyriseLogo className="h-10 w-auto" />
                </div>
                {getIcon()}
                <p className="text-sm leading-relaxed text-foreground/80 font-medium" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  {message}
                </p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <button
                    onClick={dismiss}
                    className="flex items-center justify-center mx-auto h-9 w-9 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={dismiss}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PendingPopup;
