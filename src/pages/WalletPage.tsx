import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const WalletPage = () => {
  const { profile } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const balance = profile?.balance ?? 0;

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <div className="mb-5">
          <h1 className="text-xl font-semibold tracking-tight">Wallet</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your funds and transactions.</p>
        </div>

        <div className="balance-card p-5 mb-5">
          <span className="text-sm text-white/70">Available Balance</span>
          <div className="text-3xl font-semibold tabular-nums mt-1">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button asChild className="btn-press gap-2 h-12">
            <Link to="/app/wallet/deposit">
              <ArrowDownToLine className="h-4 w-4" strokeWidth={1.5} />
              Deposit
            </Link>
          </Button>
          <Button asChild variant="outline" className="btn-press gap-2 h-12">
            <Link to="/app/wallet/withdraw">
              <ArrowUpFromLine className="h-4 w-4" strokeWidth={1.5} />
              Withdraw
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Transaction History</h3>
          <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col gap-2">
          {(transactions || []).map((tx, i) => {
            const positive = Number(tx.amount) >= 0;
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="glass-card flex items-center justify-between p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${positive ? "bg-success/10" : "bg-muted"}`}>
                    {positive ? (
                      <ArrowDownToLine className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
                    ) : (
                      <ArrowUpFromLine className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium capitalize">{tx.type}</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString()} · {tx.method || "System"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium tabular-nums ${positive ? "text-success" : "text-foreground"}`}>
                    {positive ? "+" : ""}${Math.abs(Number(tx.amount)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`text-[10px] block mt-0.5 ${tx.status === "pending" ? "text-warning" : "text-success"}`}>
                    {tx.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
          {(!transactions || transactions.length === 0) && (
            <div className="glass-card p-8 text-center text-sm text-muted-foreground">
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default WalletPage;
