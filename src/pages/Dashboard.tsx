import DashboardLayout from "@/components/layout/DashboardLayout";
import { Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const chartData = [
  { name: "Jan", value: 4000 }, { name: "Feb", value: 5200 }, { name: "Mar", value: 4800 },
  { name: "Apr", value: 6100 }, { name: "May", value: 7300 }, { name: "Jun", value: 8500 },
  { name: "Jul", value: 9200 }, { name: "Aug", value: 10100 }, { name: "Sep", value: 11400 },
  { name: "Oct", value: 12800 }, { name: "Nov", value: 13500 }, { name: "Dec", value: 15200 },
];

const stats = [
   { label: "Total Balance", value: "15,200.00} USDC", icon: Wallet, change: "+12.4%" },
   { label: "Active Investment", value: "10,000.00} USDC", icon: TrendingUp, change: "+8.2%" },
   { label: "Total Deposited", value: "18,500.00} USDC", icon: ArrowDownToLine },
   { label: "Total Withdrawn", value: "3,300.00} USDC", icon: ArrowUpFromLine },
];

const transactions = [
   { id: "TXN-0041", type: "Deposit", amount: "+5,000.00} USDC", status: "Approved", date: "Mar 12, 2026" },
   { id: "TXN-0040", type: "ROI", amount: "+120.00} USDC", status: "Approved", date: "Mar 11, 2026" },
   { id: "TXN-0039", type: "Withdrawal", amount: "-1,000.00} USDC", status: "Pending", date: "Mar 10, 2026" },
   { id: "TXN-0038", type: "Deposit", amount: "+3,500.00} USDC", status: "Approved", date: "Mar 8, 2026" },
   { id: "TXN-0037", type: "ROI", amount: "+95.00} USDC", status: "Approved", date: "Mar 7, 2026" },
];

const Dashboard = () => (
  <DashboardLayout>
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight">Portfolio Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back. Here's your portfolio summary.</p>
    </div>

    {/* Stats */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="vault-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            <stat.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">{stat.value}</div>
          {stat.change && (
            <span className="mt-1 inline-block text-xs text-success">{stat.change}</span>
          )}
        </div>
      ))}
    </div>

    {/* Chart */}
    <div className="glass-card mt-6 p-6">
      <h2 className="text-sm font-medium text-muted-foreground">Portfolio Growth</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217.2, 91.2%, 59.8%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(217.2, 91.2%, 59.8%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k USDC`} />
            <Tooltip
              contentStyle={{
                background: "hsl(240, 10%, 6%)",
                border: "1px solid hsl(240, 5%, 12%)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#f2f2f2",
              }}
              formatter={(value: number) => [`${value.toLocaleString()} USDC`, "Balance"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(217.2, 91.2%, 59.8%)"
              strokeWidth={2}
              fill="url(#areaGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Transactions */}
    <div className="glass-card mt-6 overflow-hidden">
      <div className="flex items-center justify-between p-5">
        <h2 className="text-sm font-medium">Recent Transactions</h2>
        <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t border-border transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{tx.id}</td>
                <td className="px-5 py-3 text-sm">{tx.type}</td>
                <td className={`px-5 py-3 text-sm tabular-nums ${tx.amount.startsWith("+") ? "text-success" : "text-foreground"}`}>
                  {tx.amount}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${tx.status === "Pending" ? "status-pending" : "status-approved"}`}>
                    {tx.status === "Pending" && <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />}
                    {tx.status === "Approved" && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                    {tx.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default Dashboard;
