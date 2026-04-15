import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
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
    // Clear the popup from the backend
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-violet-600 to-purple-800 p-6 text-white shadow-2xl"
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/15">
                <Gift className="h-7 w-7 text-yellow-300" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">🎉 Bonus Reward</h3>
              <p className="text-sm leading-relaxed text-white/90">{message}</p>
              <button
                onClick={handleClose}
                className="mt-2 w-full py-2.5 rounded-xl bg-white text-purple-700 font-semibold text-sm hover:bg-white/90 transition-colors"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PendingPopup;
