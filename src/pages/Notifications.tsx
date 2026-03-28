import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type NotifType = "deposit" | "withdrawal";

interface Notification {
  id: string;
  type: NotifType;
  amount: number;
  status: string;
  method: string | null;
  created_at: string;
  wallet_address: string | null;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  approved: { icon: CheckCircle, color: "text-success", label: "Completed" },
  completed: { icon: CheckCircle, color: "text-success", label: "Completed" },
  pending: { icon: Clock, color: "text-warning", label: "Pending" },
  rejected: { icon: AlertCircle, color: "text-destructive", label: "Rejected" },
};

const Notifications = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal">("all");

  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: deps }, { data: wds }] = await Promise.all([
        supabase
          .from("deposits")
          .select("id, amount, status, method, created_at, wallet_address")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("withdrawals")
          .select("id, amount, status, method, created_at, wallet_address")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      const items: Notification[] = [
        ...(deps || []).map((d) => ({ ...d, type: "deposit" as NotifType })),
        ...(wds || []).map((w) => ({ ...w, type: "withdrawal" as NotifType })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return items;
    },
  });

  const filtered = (notifications || []).filter(
    (n) => filter === "all" || n.type === filter
  );

  const pendingCount = (notifications || []).filter((n) => n.status === "pending").length;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-[calc(100vh-5rem)]">
        {/* Header */}
        <div className="flex items-center h-14 px-4 border-b border-border">
          <Link to="/app/profile" className="mr-3 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <h1 className="flex-1 text-center text-base font-semibold tracking-tight pr-8">Notifications</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-4 py-3 border-b border-border">
          {(["all", "deposit", "withdrawal"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f === "deposit" ? "Deposits" : "Withdrawals"}
            </button>
          ))}
          {pendingCount > 0 && (
            <div className="ml-auto flex items-center">
              <Badge variant="destructive" className="text-[10px] h-5 px-2">
                {pendingCount} pending
              </Badge>
            </div>
          )}
        </div>

        <div className="flex-1 px-4 py-4">
          <div className="flex flex-col gap-2.5">
            {filtered.map((n, i) => {
              const sc = statusConfig[n.status] || statusConfig.pending;
              const StatusIcon = sc.icon;
              const isDeposit = n.type === "deposit";

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isDeposit ? "bg-success/10" : "bg-primary/10"
                    }`}>
                      {isDeposit ? (
                        <ArrowDownToLine className="h-4.5 w-4.5 text-success" strokeWidth={1.5} />
                      ) : (
                        <ArrowUpFromLine className="h-4.5 w-4.5 text-primary" strokeWidth={1.5} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold capitalize">{n.type}</span>
                        <span className={`text-sm font-semibold tabular-nums ${isDeposit ? "text-success" : "text-foreground"}`}>
                          {isDeposit ? "+" : "-"}${Math.abs(n.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <StatusIcon className={`h-3 w-3 ${sc.color}`} strokeWidth={2} />
                        <span className={`text-[11px] font-medium ${sc.color}`}>{sc.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{n.method || "System"}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground">{formatDate(n.created_at)}</span>
                        <span className="text-[10px] text-muted-foreground">{formatTime(n.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Clock className="h-8 w-8 mb-3 opacity-40" strokeWidth={1.5} />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Notifications;
