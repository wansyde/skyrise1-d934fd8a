import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, ArrowDownToLine, ArrowUpFromLine, DollarSign, Shield, Search, Pencil, Check, X, Trash2, Power, ArrowUpDown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VIP_LEVELS } from "@/lib/vip-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SortField = "username" | "balance" | "advertising_salary" | "created_at" | "status";
type SortDir = "asc" | "desc";

const AdminPanel = () => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editVipLevel, setEditVipLevel] = useState("");
  const [editTasksCompleted, setEditTasksCompleted] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
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
        .select("*, profiles!deposits_user_id_fkey(full_name, email, username)")
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
        .select("*, profiles!withdrawals_user_id_fkey(full_name, email, username)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleApproveDeposit = async (deposit: any) => {
    setProcessingId(deposit.id);
    await supabase.from("deposits").update({ status: "approved" }).eq("id", deposit.id);
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

  const startEditing = (user: any) => {
    setEditingUser(user.user_id);
    setEditBalance(String(user.balance));
    setEditSalary(String(user.advertising_salary ?? 0));
    setEditVipLevel(user.vip_level || "Junior");
    setEditTasksCompleted(String(user.tasks_completed_today ?? 0));
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditBalance("");
    setEditSalary("");
    setEditVipLevel("");
    setEditTasksCompleted("");
  };

  const saveBalances = async (userId: string) => {
    const newBalance = parseFloat(editBalance);
    const newSalary = parseFloat(editSalary);
    const newTasks = parseInt(editTasksCompleted);
    if (isNaN(newBalance) || newBalance < 0) {
      toast.error("Invalid wallet balance value.");
      return;
    }
    if (isNaN(newSalary) || newSalary < 0) {
      toast.error("Invalid advertising salary value.");
      return;
    }
    if (isNaN(newTasks) || newTasks < 0) {
      toast.error("Invalid tasks completed value.");
      return;
    }
    if (!VIP_LEVELS.includes(editVipLevel)) {
      toast.error("Invalid VIP level.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        balance: newBalance,
        advertising_salary: newSalary,
        vip_level: editVipLevel,
        tasks_completed_today: newTasks,
      })
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to update user.");
      return;
    }
    toast.success("User updated successfully.");
    setEditingUser(null);
    queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
  };

  const handleToggleTaskAccess = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "restricted" : "active";
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to update task access.");
      return;
    }
    toast.success(`Task access ${newStatus === "active" ? "enabled" : "disabled"}.`);
    queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUser(userId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast.error("Not authenticated.");
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to delete user.");
        return;
      }
      toast.success("User deleted permanently.");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user.");
    } finally {
      setDeletingUser(null);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const totalUsers = profiles?.length ?? 0;
  const totalAUM = profiles?.reduce((s, p) => s + Number(p.balance), 0) ?? 0;

  const filteredProfiles = (profiles || [])
    .filter((p: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (p.username || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.full_name || "").toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q)
      );
    })
    .sort((a: any, b: any) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case "username":
          aVal = (a.username || "").toLowerCase();
          bVal = (b.username || "").toLowerCase();
          break;
        case "balance":
          aVal = Number(a.balance);
          bVal = Number(b.balance);
          break;
        case "advertising_salary":
          aVal = Number(a.advertising_salary);
          bVal = Number(b.advertising_salary);
          break;
        case "created_at":
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        case "status":
          aVal = a.status || "active";
          bVal = b.status || "active";
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users },
    { label: "Pending Deposits", value: String(pendingDeposits?.length ?? 0), icon: ArrowDownToLine },
    { label: "Pending Withdrawals", value: String(pendingWithdrawals?.length ?? 0), icon: ArrowUpFromLine },
    { label: "Total AUM", value: `$${(totalAUM / 1000).toFixed(1)}K`, icon: DollarSign },
  ];

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-5 py-3 font-medium cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-primary" : "text-muted-foreground/50"}`} />
      </span>
    </th>
  );

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

      {/* User Management */}
      <div className="glass-card overflow-hidden mb-6">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-medium">User Management</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search username, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border text-left text-xs text-muted-foreground">
                <SortHeader field="username">Username</SortHeader>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Referral Code</th>
                <th className="px-5 py-3 font-medium">Referred By</th>
                <th className="px-5 py-3 font-medium">Referrals</th>
                <SortHeader field="balance">Wallet Balance</SortHeader>
                <SortHeader field="advertising_salary">Ad Salary</SortHeader>
                <th className="px-5 py-3 font-medium">VIP Level</th>
                <th className="px-5 py-3 font-medium">Tasks Today</th>
                <SortHeader field="status">Task Access</SortHeader>
                <SortHeader field="created_at">Registered</SortHeader>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((u: any) => (
                <tr key={u.user_id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm font-medium">{u.username || "—"}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{u.email || "—"}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{u.phone || "—"}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{u.referral_code || "—"}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {u.referred_by
                      ? (() => {
                          const referrer = (profiles || []).find((p: any) => p.user_id === u.referred_by);
                          return referrer ? referrer.username || referrer.email : u.referred_by;
                        })()
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-sm tabular-nums">
                    {(profiles || []).filter((p: any) => p.referred_by === u.user_id).length}
                  </td>
                  <td className="px-5 py-3">
                    {editingUser === u.user_id ? (
                      <Input type="number" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="h-7 w-28 text-xs" min={0} />
                    ) : (
                      <span className="text-sm tabular-nums">${Number(u.balance).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingUser === u.user_id ? (
                      <Input type="number" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} className="h-7 w-28 text-xs" min={0} />
                    ) : (
                      <span className="text-sm tabular-nums">${Number(u.advertising_salary ?? 0).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingUser === u.user_id ? (
                      <select
                        value={editVipLevel}
                        onChange={(e) => setEditVipLevel(e.target.value)}
                        className="h-7 rounded border border-border bg-background px-2 text-xs"
                      >
                        {VIP_LEVELS.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{u.vip_level || "Junior"}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingUser === u.user_id ? (
                      <Input type="number" value={editTasksCompleted} onChange={(e) => setEditTasksCompleted(e.target.value)} className="h-7 w-20 text-xs" min={0} />
                    ) : (
                      <span className="text-sm tabular-nums">{u.tasks_completed_today ?? 0}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleTaskAccess(u.user_id, u.status || "active")}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        (u.status || "active") === "active"
                          ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                          : "bg-destructive/15 text-destructive hover:bg-destructive/25"
                      }`}
                    >
                      <Power className="h-3 w-3" />
                      {(u.status || "active") === "active" ? "ON" : "OFF"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    {editingUser === u.user_id ? (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => saveBalances(u.user_id)}>
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={cancelEditing}>
                          <X className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => startEditing(u)}>
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                              disabled={deletingUser === u.user_id}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete <strong>{u.username || u.email}</strong>? This action is irreversible. All account data, balances, and task records will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(u.user_id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Permanently
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProfiles.length === 0 && (
                <tr><td colSpan={13} className="px-5 py-6 text-center text-sm text-muted-foreground">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
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
                  <td className="px-5 py-3 text-sm">{d.profiles?.username || d.profiles?.email || "—"}</td>
                  <td className="px-5 py-3 text-sm tabular-nums">${Number(d.amount).toLocaleString()}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{d.method}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <Button size="sm" variant="outline" className="btn-press text-xs h-7" disabled={processingId === d.id} onClick={() => handleApproveDeposit(d)}>
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
                  <td className="px-5 py-3 text-sm">{w.profiles?.username || w.profiles?.email || "—"}</td>
                  <td className="px-5 py-3 text-sm tabular-nums">${Number(w.amount).toLocaleString()}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{w.method}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="btn-press text-xs h-7" disabled={processingId === w.id} onClick={() => handleApproveWithdrawal(w)}>
                        {processingId === w.id ? "..." : "Approve"}
                      </Button>
                      <Button size="sm" variant="outline" className="btn-press text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleRejectWithdrawal(w)}>
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
