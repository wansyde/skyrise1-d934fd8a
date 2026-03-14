import DashboardLayout from "@/components/layout/DashboardLayout";
import { TrendingUp, Clock } from "lucide-react";

const investments = [
  {
    plan: "Alpha Growth",
    amount: "$10,000.00",
    rate: "12%/mo",
    started: "Feb 1, 2026",
    accrued: "$1,440.00",
    status: "Active",
    progress: 70,
  },
];

const Investments = () => (
  <DashboardLayout>
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight">Active Investments</h1>
      <p className="mt-1 text-sm text-muted-foreground">Track your portfolio allocations and returns.</p>
    </div>

    <div className="flex flex-col gap-4">
      {investments.map((inv) => (
        <div key={inv.plan} className="vault-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <h3 className="font-semibold">{inv.plan}</h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Rate: {inv.rate} · Started: {inv.started}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {inv.status}
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Committed</span>
              <div className="mt-1 text-lg font-semibold tabular-nums">{inv.amount}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Accrued Returns</span>
              <div className="mt-1 text-lg font-semibold tabular-nums text-success">{inv.accrued}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Lock period progress</span>
              <span>{inv.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${inv.progress}%` }} />
            </div>
          </div>
        </div>
      ))}

      {investments.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-3" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">No active investments. Commit funds to a plan to get started.</p>
        </div>
      )}
    </div>
  </DashboardLayout>
);

export default Investments;
