import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const chartData = [
  { v: 400 }, { v: 520 }, { v: 480 }, { v: 610 }, { v: 730 },
  { v: 850 }, { v: 920 }, { v: 1010 }, { v: 1140 }, { v: 1280 },
  { v: 1350 }, { v: 1520 },
];

const quickActions = [
  { label: "Deposit", href: "/app/wallet/deposit", emoji: "💰" },
  { label: "Withdraw", href: "/app/wallet/withdraw", emoji: "💸" },
  { label: "Invest", href: "/app/invest", emoji: "📈" },
  { label: "History", href: "/app/wallet", emoji: "📋" },
];

const Home = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { profile } = useAuth();

  const { data: investments } = useQuery({
    queryKey: ["user-investments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_investments")
        .select("*, investment_plans(*)")
        .eq("status", "active");
      return data || [];
    },
  });

  const { data: recentTxns } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const balance = profile?.balance ?? 0;
  const activeInvestment = investments?.[0];
  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) ?? 0;

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <div className="mb-5">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-xl font-semibold tracking-tight">{profile?.full_name || "User"}</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="balance-card p-5 mb-5"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-white/70">Total Balance</span>
            <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-white/60 hover:text-white transition-colors">
              {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          <div className="text-3xl font-semibold tabular-nums mb-3">
            {balanceVisible ? `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
          </div>
          <div className="h-12 mt-3 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} fill="url(#balGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="glass-card p-4">
            <span className="text-xs text-muted-foreground">Active Investment</span>
            <div className="text-lg font-semibold tabular-nums mt-1">${totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-muted-foreground">Accrued Returns</span>
            <div className="text-lg font-semibold tabular-nums mt-1 text-success">
              ${(investments?.reduce((s, i) => s + Number(i.accrued_return), 0) ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="glass-card flex flex-col items-center gap-1.5 py-3 px-2 text-center hover:bg-card/80 transition-colors btn-press"
            >
              <span className="text-xl">{action.emoji}</span>
              <span className="text-[11px] font-medium text-muted-foreground">{action.label}</span>
            </Link>
          ))}
        </div>

        {activeInvestment && (
          <div className="glass-card p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Active Plan</h3>
              <span className="text-xs text-success flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{(activeInvestment as any).investment_plans?.name}</span>
              <span className="text-xs text-muted-foreground">{(activeInvestment as any).investment_plans?.rate}%/mo</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold tabular-nums">${Number(activeInvestment.amount).toLocaleString()}</span>
              <span className="text-sm font-medium text-success tabular-nums">+${Number(activeInvestment.accrued_return).toLocaleString()}</span>
            </div>
            {(() => {
              const start = new Date(activeInvestment.started_at).getTime();
              const end = new Date(activeInvestment.ends_at).getTime();
              const now = Date.now();
              const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
              const daysElapsed = Math.floor((now - start) / 86400000);
              const totalDays = Math.floor((end - start) / 86400000);
              return (
                <>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{daysElapsed} of {totalDays} days</span>
                    <span className="text-[10px] text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Recent Activity</h3>
            <Link to="/app/wallet" className="text-xs text-primary">View All</Link>
          </div>
          <div className="flex flex-col gap-2">
            {(recentTxns || []).map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="glass-card flex items-center justify-between p-3.5"
              >
                <div>
                  <span className="text-sm font-medium capitalize">{tx.type}</span>
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`text-sm font-medium tabular-nums ${Number(tx.amount) >= 0 ? "text-success" : "text-foreground"}`}>
                  {Number(tx.amount) >= 0 ? "+" : ""}${Math.abs(Number(tx.amount)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </motion.div>
            ))}
            {(!recentTxns || recentTxns.length === 0) && (
              <div className="glass-card p-6 text-center text-sm text-muted-foreground">
                No transactions yet. Make your first deposit to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
