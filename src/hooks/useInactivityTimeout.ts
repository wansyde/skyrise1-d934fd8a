import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

const { useEffect, useCallback, useRef } = React;

// Long timeout so admins / power users don't get logged out mid-task.
// Was 30 minutes; bumped to 12 hours for stability.
const INACTIVITY_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours

export const useInactivityTimeout = (isAuthenticated: boolean) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(async () => {
    sessionStorage.removeItem("hasSeenBonusPopup");
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isAuthenticated) {
      timerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    }
  }, [isAuthenticated, handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [isAuthenticated, resetTimer]);
};
