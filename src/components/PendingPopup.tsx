import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PendingPopup = () => {
  const { profile, refreshProfile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile) return;

    const type = profile.pending_popup_type;
    const msg = profile.pending_popup_message;

    // Only show bonus/reset popups — skip upgrade/deposit
    if (!msg || !type || type === "upgrade" || type === "deposit") return;

    // Only show once per session
    if (sessionStorage.getItem("hasSeenBonusPopup")) return;

    setMessage(msg);
    setVisible(true);
    sessionStorage.setItem("hasSeenBonusPopup", "true");
  }, [profile]);

  const handleClose = async () => {
    setVisible(false);
    if (profile?.user_id) {
      await supabase
        .from("profiles")
        .update({ pending_popup_message: null, pending_popup_type: null })
        .eq("user_id", profile.user_id);
      refreshProfile();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-[340px] rounded-3xl border border-border/40 bg-card p-7 shadow-xl"
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <div className="flex flex-col items-center text-center gap-5">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold tracking-tight text-foreground font-[Montserrat]">
                Bonus Reward
              </h3>

              {/* Message */}
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {message}
              </p>

              {/* CTA */}
              <button
                onClick={handleClose}
                className="mt-1 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm tracking-wide hover:opacity-90 transition-opacity"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PendingPopup;
