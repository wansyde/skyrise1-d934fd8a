import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

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

const recentActivity = [
  { type: "ROI Earned", amount: "+$120.00", time: "2h ago", positive: true },
  { type: "Deposit", amount: "+$5,000.00", time: "1d ago", positive: true },
  { type: "Withdrawal", amount: "-$1,000.00", time: "3d ago", positive: false },
];

const Home = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <AppLayout>
      <div className="px-4 py-5">
        {/* Greeting */}
        <div className="mb-5">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-xl font-semibold tracking-tight">John Doe</h1>
        </div>

        {/* Balance card */}
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
            {balanceVisible ? "$15,200.00" : "••••••"}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white/80">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+12.4% this month</span>
          </div>

          {/* Mini chart */}
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

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="glass-card p-4">
            <span className="text-xs text-muted-foreground">Active Investment</span>
            <div className="text-lg font-semibold tabular-nums mt-1">$10,000</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success">+8.2%</span>
            </div>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-muted-foreground">Daily Earnings</span>
            <div className="text-lg font-semibold tabular-nums mt-1">$40.00</div>
            <div className="mt-2">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: "70%" }} />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">70% of cycle</span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
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

        {/* Investment progress */}
        <div className="glass-card p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Active Plan</h3>
            <span className="text-xs text-success flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Active
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Alpha Growth</span>
            <span className="text-xs text-muted-foreground">12%/mo</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold tabular-nums">$10,000</span>
            <span className="text-sm font-medium text-success tabular-nums">+$1,440</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: "70%" }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">42 of 60 days</span>
            <span className="text-[10px] text-muted-foreground">70%</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Recent Activity</h3>
            <Link to="/app/wallet" className="text-xs text-primary">View All</Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="glass-card flex items-center justify-between p-3.5"
              >
                <div>
                  <span className="text-sm font-medium">{item.type}</span>
                  <span className="text-xs text-muted-foreground block mt-0.5">{item.time}</span>
                </div>
                <span className={`text-sm font-medium tabular-nums ${item.positive ? "text-success" : "text-foreground"}`}>
                  {item.amount}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
