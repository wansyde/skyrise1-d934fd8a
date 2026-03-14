import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, ArrowDownToLine, ArrowUpFromLine, DollarSign, Shield } from "lucide-react";

const adminStats = [
  { label: "Total Users", value: "1,247", icon: Users },
  { label: "Pending Deposits", value: "23", icon: ArrowDownToLine },
  { label: "Pending Withdrawals", value: "8", icon: ArrowUpFromLine },
  { label: "Total AUM", value: "$2.4M", icon: DollarSign },
];

const pendingDeposits = [
  { id: "DEP-091", user: "alice@example.com", amount: "$5,000.00", method: "USDT", date: "Mar 14, 2026" },
  { id: "DEP-090", user: "bob@example.com", amount: "$10,000.00", method: "BTC", date: "Mar 14, 2026" },
  { id: "DEP-089", user: "carol@example.com", amount: "$2,500.00", method: "Bank", date: "Mar 13, 2026" },
];

const pendingWithdrawals = [
  { id: "WTH-034", user: "dave@example.com", amount: "$1,000.00", method: "USDT", date: "Mar 14, 2026" },
  { id: "WTH-033", user: "eve@example.com", amount: "$3,200.00", method: "Bank", date: "Mar 13, 2026" },
];

const AdminPanel = () => {
  const [holdingId, setHoldingId] = useState<string | null>(null);

  const handleApprove = (id: string, type: string) => {
    setHoldingId(id);
    setTimeout(() => {
      setHoldingId(null);
      toast.success(`${type} ${id} approved. Ledger updated.`);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" strokeWidth={1.5} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage users, deposits, and withdrawals.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {adminStats.map((stat) => (
          <div key={stat.label} className="vault-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Pending Deposits */}
      <div className="glass-card overflow-hidden mb-6">
        <div className="p-5">
          <h2 className="text-sm font-medium">Pending Deposits</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingDeposits.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{d.id}</td>
                  <td className="px-5 py-3 text-sm">{d.user}</td>
                  <td className="px-5 py-3 text-sm tabular-nums">{d.amount}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{d.method}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{d.date}</td>
                  <td className="px-5 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="btn-press text-xs h-7"
                      disabled={holdingId === d.id}
                      onMouseDown={() => handleApprove(d.id, "Deposit")}
                    >
                      {holdingId === d.id ? "Confirming..." : "Approve"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Withdrawals */}
      <div className="glass-card overflow-hidden">
        <div className="p-5">
          <h2 className="text-sm font-medium">Pending Withdrawals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingWithdrawals.map((w) => (
                <tr key={w.id} className="border-t border-border">
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{w.id}</td>
                  <td className="px-5 py-3 text-sm">{w.user}</td>
                  <td className="px-5 py-3 text-sm tabular-nums">{w.amount}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{w.method}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{w.date}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-press text-xs h-7"
                        disabled={holdingId === w.id}
                        onMouseDown={() => handleApprove(w.id, "Withdrawal")}
                      >
                        {holdingId === w.id ? "Confirming..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-press text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => toast.success(`Withdrawal ${w.id} rejected.`)}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
