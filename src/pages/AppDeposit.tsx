import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Clock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useWhatsAppNumber } from "@/hooks/useWhatsAppNumber";

const AppDeposit = () => {
  const [tab, setTab] = useState<"deposit" | "history">("deposit");
  const { user, profile } = useAuth();
  const balance = profile?.balance ?? 0;

  const { data: history } = useQuery({
    queryKey: ["deposit-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  return (
    <AppLayout>
      <div className="flex flex-col min-h-[calc(100vh-5rem)]">
        {/* Header */}
        <div className="flex items-center h-14 px-4 border-b border-border">
          <Link to="/app/profile" className="mr-3 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <h1 className="flex-1 text-center text-base font-semibold tracking-tight pr-8">Deposit</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["deposit", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors relative ${tab === t ? "text-primary" : "text-muted-foreground"}`}
            >
              {t}
              {tab === t && (
                <motion.div
                  layoutId="deposit-tab-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-12 rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 px-4 py-5">
          <AnimatePresence mode="wait">
            {tab === "deposit" ? (
              <motion.div
                key="deposit"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {/* Balance card */}
                <div className="balance-card p-5 rounded-2xl">
                  <span className="text-sm text-white/60">Account Amount</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-semibold tabular-nums">
                      {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm text-white/50 font-medium">AC</span>
                  </div>
                </div>

                {/* Contact button */}
                <Button className="btn-press h-12 w-full gap-2 text-sm">
                  <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                  Contact Customer Service
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                {(history || []).map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="glass-card flex items-center justify-between p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <ArrowDownToLine className="h-4 w-4 text-primary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Deposit</span>
                        <span className="text-xs text-muted-foreground block mt-0.5">
                          {new Date(d.created_at).toLocaleDateString()} · {d.method}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium tabular-nums text-primary">
                        +${Number(d.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-[10px] block mt-0.5 capitalize ${d.status === "pending" ? "text-warning" : d.status === "approved" ? "text-primary" : "text-destructive"}`}>
                        {d.status === "approved" ? "completed" : d.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {(!history || history.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Clock className="h-8 w-8 mb-3 opacity-40" strokeWidth={1.5} />
                    <p className="text-sm">No deposit history yet.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
};

export default AppDeposit;
