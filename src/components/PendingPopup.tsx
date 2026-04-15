import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_TYPES = ["reset", "bonus"];

const PendingPopup = () => {
  const { profile, refreshProfile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!profile) {
      hasChecked.current = false;
      return;
    }

    // Only check once per profile load to avoid flickering
    if (hasChecked.current) return;

    const type = profile.pending_popup_type;
    const msg = profile.pending_popup_message;

    // Only show allowed popup types (bonus/reset)
    if (!msg || !type || !ALLOWED_TYPES.includes(type)) return;

    // Only show once per session
    if (sessionStorage.getItem("hasSeenBonusPopup")) return;

    hasChecked.current = true;
    setMessage(msg);
    setVisible(true);
    sessionStorage.setItem("hasSeenBonusPopup", "true");
  }, [profile]);

  // Also poll once on mount after a short delay to catch late profile loads
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (visible || hasChecked.current) return;
      if (sessionStorage.getItem("hasSeenBonusPopup")) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("pending_popup_type, pending_popup_message, user_id")
        .eq("user_id", user.id)
        .single();

      if (data?.pending_popup_message && data?.pending_popup_type && ALLOWED_TYPES.includes(data.pending_popup_type)) {
        hasChecked.current = true;
        setMessage(data.pending_popup_message);
        setVisible(true);
        sessionStorage.setItem("hasSeenBonusPopup", "true");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [visible]);

  const handleClose = async () => {
    setVisible(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ pending_popup_message: null, pending_popup_type: null })
        .eq("user_id", user.id);
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
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <div className="flex flex-col items-center text-center gap-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>

              <h3 className="text-base font-semibold tracking-tight text-foreground font-[Montserrat]">
                Bonus Reward
              </h3>

              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {message}
              </p>

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
