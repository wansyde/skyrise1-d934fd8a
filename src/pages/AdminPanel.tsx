import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, ArrowDownToLine, ArrowUpFromLine, DollarSign, Shield } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminPanel = () => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*");
      return data || [];
    },
  });

  const { data: pendingDeposits } = useQuery({
    queryKey: ["admin-pending-deposits"],
    queryFn: async () => {
      const { data } = await supabase
        .from("deposits")
        .select("*, profiles!deposits_user_id_fkey(full_name, email)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: pendingWithdrawals } = useQuery({
    queryKey: ["admin-pending-withdrawals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("withdrawals")
        .select("*, profiles!withdrawals_user_id_fkey(full_name, email)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleApproveDeposit = async (deposit: any) => {
    setProcessingId(deposit.id);
    // Update deposit status
    await supabase.from("deposits").update({ status: "approved" }).eq("id", deposit.id);
    // Update user balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("user_id", deposit.user_id)
      .single();
    if (profile) {
      await supabase
        .from("profiles")
        .update({ balance: Number(profile.balance) + Number(deposit.amount) })
        .eq("user_id", deposit.user_id);
    }
    // Update transaction status
    await supabase
      .from("transactions")
      .update({ status: "approved" })
      .eq("user_id", deposit.user_id)
      .eq("type", "deposit")
      .eq("status", "pending")
      .eq("amount", deposit.amount);

    toast.success(`Deposit $${Number(deposit.amount).toLocaleString()} approved.`);
    setProcessingId(null);
    queryClient.invalidateQueries({ queryKey: ["admin-pending-deposits"] });
    queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
  };

  const handleApproveWithdrawal = async (withdrawal: any) => {
    setProcessingId(withdrawal.id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("user_id", withdrawal.user_id)
      .single();

    if (profile && Number(profile.balance) >= Number(withdrawal.amount)) {
      await supabase.from("withdrawals").update({ status: "approved" }).eq("id", withdrawal.id);
      await supabase
        .from("profiles")
        .update({ balance: Number(profile.balance) - Number(withdrawal.amount) })
        .eq("user_id", withdrawal.user_id);
      await supabase
        .from("transactions")
        .update({ status: "approved" })
        .eq("user_id", withdrawal.user_id)
        .eq("type", "withdrawal")
        .eq("status", "pending");
      toast.success(`Withdrawal $${Number(withdrawal.amount).toLocaleString()} approved.`);
    } else {
      toast.error("Insufficient user balance.");
    }
    setProcessingId(null);
    queryClient.invalidateQueries({ queryKey: ["admin-pending-withdrawals"] });
    queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
  };

  const handleRejectWithdrawal = async (withdrawal: any) => {
    await supabase.from("withdrawals").update({ status: "rejected" }).eq("id", withdrawal.id);
    await supabase
      .from("transactions")
      .update({ status: "rejected" })
      .eq("user_id", withdrawal.user_id)
      .eq("type", "withdrawal")
      .eq("status", "pending");
    toast.success("Withdrawal rejected.");
    queryClient.invalidateQueries({ queryKey: ["admin-pending-withdrawals"] });
  };

  const totalUsers = profiles?.length ?? 0;
  const totalAUM = profiles?.reduce((s, p) => s + Number(p.balance), 0) ?? 0;

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users },
    { label: "Pending Deposits", value: String(pendingDeposits?.length ?? 0), icon: ArrowDownToLine },
    { label: "Pending Withdrawals", value: String(pendingWithdrawals?.length ?? 0), icon: ArrowUpFromLine },
    { label: "Total AUM", value: `$${(totalAUM / 1000).toFixed(1)}K`, icon: DollarSign },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" strokeWidth={1.5} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage users, deposits, and withdrawals.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {stats.map((stat) => (
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
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {(pendingDeposits || []).map((d: any) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm">{d.profiles?.email || "—"}</td>
                  <td className="px-5 py-3 text-sm tabular-nums">${Number(d.amount).toLocaleString()}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{d.method}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="btn-press text-xs h-7"
                      disabled={processingId === d.id}
                      onClick={() => handleApproveDeposit(d)}
                    >
                      {processingId === d.id ? "..." : "Approve"}
                    </Button>
                  </td>
                </tr>
              ))}
              {(!pendingDeposits || pendingDeposits.length === 0) && (
                <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-muted-foreground">No pending deposits.</td></tr>
              )}
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
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {(pendingWithdrawals || []).map((w: any) => (
                <tr key={w.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm">{w.profiles?.email || "—"}</td>
                  <td className="px-5 py-3 text-sm tabular-nums">${Number(w.amount).toLocaleString()}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{w.method}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-press text-xs h-7"
                        disabled={processingId === w.id}
                        onClick={() => handleApproveWithdrawal(w)}
                      >
                        {processingId === w.id ? "..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-press text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleRejectWithdrawal(w)}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!pendingWithdrawals || pendingWithdrawals.length === 0) && (
                <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-muted-foreground">No pending withdrawals.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
