import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, ArrowDownToLine, ArrowUpFromLine, DollarSign, Shield, Search, Pencil, Check, X, Trash2, Power, ArrowUpDown, RotateCcw } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Deposit form
  const [depUserId, setDepUserId] = useState("");
  const [depAmount, setDepAmount] = useState("");
  const [depNote, setDepNote] = useState("");
  const [depSubmitting, setDepSubmitting] = useState(false);
  const [depSearch, setDepSearch] = useState("");
  const [depDateFilter, setDepDateFilter] = useState("");

  // Withdrawal form
  const [wdUserId, setWdUserId] = useState("");
  const [wdAmount, setWdAmount] = useState("");
  const [wdNote, setWdNote] = useState("");
  const [wdSubmitting, setWdSubmitting] = useState(false);
  const [wdSearch, setWdSearch] = useState("");
  const [wdDateFilter, setWdDateFilter] = useState("");

  // User detail view
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*");
      return data || [];
    },
  });

  const { data: allDeposits } = useQuery({
    queryKey: ["admin-all-deposits"],
    queryFn: async () => {
      const { data } = await supabase.from("deposits").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: allWithdrawals } = useQuery({
    queryKey: ["admin-all-withdrawals"],
    queryFn: async () => {
      const { data } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const getUserName = (userId: string) => {
    const p = (profiles || []).find((p: any) => p.user_id === userId);
    return p?.username || p?.email || userId.slice(0, 8);
  };

  const getAdminName = (adminId: string | null) => {
    if (!adminId) return "—";
    const p = (profiles || []).find((p: any) => p.user_id === adminId);
    return p?.username || p?.email || "Admin";
  };

  const formatUSTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "short", timeStyle: "short" });
  };

  // Admin deposit
  const handleAdminDeposit = async () => {
    if (!depUserId) { toast.error("Select a user."); return; }
    const amt = parseFloat(depAmount);
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount."); return; }
    setDepSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("admin_deposit", {
        _user_id: depUserId,
        _amount: amt,
        _note: depNote || "",
      } as any);
      if (error) throw error;
      const result = data as any;
      if (result?.error) { toast.error(result.error); return; }
      toast.success(`Deposited $${amt.toLocaleString()} successfully.`);
      setDepAmount(""); setDepNote(""); setDepUserId("");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-deposits"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to deposit.");
    } finally {
      setDepSubmitting(false);
    }
  };

  // Admin withdrawal
  const handleAdminWithdraw = async () => {
    if (!wdUserId) { toast.error("Select a user."); return; }
    const amt = parseFloat(wdAmount);
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount."); return; }
    setWdSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("admin_withdraw", {
        _user_id: wdUserId,
        _amount: amt,
        _note: wdNote || "",
      } as any);
      if (error) throw error;
      const result = data as any;
      if (result?.error) { toast.error(result.error); return; }
      toast.success(`Withdrew $${amt.toLocaleString()} successfully.`);
      setWdAmount(""); setWdNote(""); setWdUserId("");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-withdrawals"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to withdraw.");
    } finally {
      setWdSubmitting(false);
    }
  };

  // User management handlers (kept from original)
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
    if (isNaN(newBalance) || newBalance < 0) { toast.error("Invalid wallet balance value."); return; }
    if (isNaN(newSalary) || newSalary < 0) { toast.error("Invalid advertising salary value."); return; }
    if (isNaN(newTasks) || newTasks < 0) { toast.error("Invalid tasks completed value."); return; }
    if (!VIP_LEVELS.includes(editVipLevel)) { toast.error("Invalid VIP level."); return; }
    const { error } = await supabase
      .from("profiles")
      .update({ balance: newBalance, advertising_salary: newSalary, vip_level: editVipLevel, tasks_completed_today: newTasks })
      .eq("user_id", userId);
    if (error) { toast.error("Failed to update user."); return; }
    toast.success("User updated successfully.");
    setEditingUser(null);
    queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
  };

  const handleToggleTaskAccess = async (userId: string, currentStatus: string) => {
    setProcessingId(userId);
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const { error } = await supabase.from("profiles").update({ status: newStatus } as any).eq("user_id", userId).select();
      if (error) { toast.error("Failed to update task access: " + error.message); return; }
      toast.success(`Task access ${newStatus === "active" ? "enabled" : "disabled"}.`);
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUser(userId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) { toast.error("Not authenticated."); return; }
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/delete-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ user_id: userId }),
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.error || "Failed to delete user."); return; }
      toast.success("User deleted permanently.");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user.");
    } finally {
      setDeletingUser(null);
    }
  };

  const handleResetCycle = async (userId: string) => {
    setProcessingId(userId);
    try {
      const { error } = await supabase.from("profiles").update({ task_cycle_completed: false, tasks_completed_today: 0 } as any).eq("user_id", userId);
      if (error) { toast.error("Failed to reset task cycle: " + error.message); return; }
      toast.success("Task cycle reset successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    } finally {
      setProcessingId(null);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const totalUsers = profiles?.length ?? 0;
  const totalAUM = profiles?.reduce((s, p: any) => s + Number(p.balance), 0) ?? 0;

  const filteredProfiles = (profiles || [])
    .filter((p: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (p.username || "").toLowerCase().includes(q) || (p.email || "").toLowerCase().includes(q) || (p.full_name || "").toLowerCase().includes(q) || (p.phone || "").toLowerCase().includes(q);
    })
    .sort((a: any, b: any) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case "username": aVal = (a.username || "").toLowerCase(); bVal = (b.username || "").toLowerCase(); break;
        case "balance": aVal = Number(a.balance); bVal = Number(b.balance); break;
        case "advertising_salary": aVal = Number(a.advertising_salary); bVal = Number(b.advertising_salary); break;
        case "created_at": aVal = new Date(a.created_at).getTime(); bVal = new Date(b.created_at).getTime(); break;
        case "status": aVal = a.status || "active"; bVal = b.status || "active"; break;
        default: return 0;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  // Filter deposits
  const filteredDeposits = (allDeposits || []).filter((d: any) => {
    if (depSearch) {
      const name = getUserName(d.user_id).toLowerCase();
      if (!name.includes(depSearch.toLowerCase())) return false;
    }
    if (depDateFilter) {
      const dDate = new Date(d.created_at).toISOString().slice(0, 10);
      if (dDate !== depDateFilter) return false;
    }
    return true;
  });

  // Filter withdrawals
  const filteredWithdrawals = (allWithdrawals || []).filter((w: any) => {
    if (wdSearch) {
      const name = getUserName(w.user_id).toLowerCase();
      if (!name.includes(wdSearch.toLowerCase())) return false;
    }
    if (wdDateFilter) {
      const wDate = new Date(w.created_at).toISOString().slice(0, 10);
      if (wDate !== wdDateFilter) return false;
    }
    return true;
  });

  // User detail
  const selectedUser = selectedUserId ? (profiles || []).find((p: any) => p.user_id === selectedUserId) : null;
  const userDeposits = selectedUserId ? (allDeposits || []).filter((d: any) => d.user_id === selectedUserId) : [];
  const userWithdrawals = selectedUserId ? (allWithdrawals || []).filter((w: any) => w.user_id === selectedUserId) : [];
  const userTotalDeposits = userDeposits.reduce((s: number, d: any) => s + Number(d.amount), 0);
  const userTotalWithdrawals = userWithdrawals.reduce((s: number, w: any) => s + Number(w.amount), 0);

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users },
    { label: "Total Deposits", value: String(allDeposits?.length ?? 0), icon: ArrowDownToLine },
    { label: "Total Withdrawals", value: String(allWithdrawals?.length ?? 0), icon: ArrowUpFromLine },
    { label: "Total AUM", value: `$${(totalAUM / 1000).toFixed(1)}K`, icon: DollarSign },
  ];

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th className="px-5 py-3 font-medium cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort(field)}>
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-primary" : "text-muted-foreground/50"}`} />
      </span>
    </th>
  );

  // User select dropdown for forms
  const UserSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded border border-border bg-background px-3 text-sm">
      <option value="">Select a user...</option>
      {(profiles || []).sort((a: any, b: any) => (a.username || "").localeCompare(b.username || "")).map((p: any) => (
        <option key={p.user_id} value={p.user_id}>{p.username || p.email} — ${Number(p.balance).toLocaleString()}</option>
      ))}
    </select>
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

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">User Details: {(selectedUser as any).username || (selectedUser as any).email}</h2>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedUserId(null)}>
              <X className="h-3 w-3 mr-1" /> Close
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">Total Deposits</span>
              <div className="text-lg font-semibold text-green-400 tabular-nums">${userTotalDeposits.toLocaleString()}</div>
            </div>
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">Total Withdrawals</span>
              <div className="text-lg font-semibold text-red-400 tabular-nums">${userTotalWithdrawals.toLocaleString()}</div>
            </div>
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">Current Balance</span>
              <div className="text-lg font-semibold tabular-nums">${Number((selectedUser as any).balance).toLocaleString()}</div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Recent Deposits</h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {userDeposits.slice(0, 10).map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                    <span className="tabular-nums text-green-400">+${Number(d.amount).toLocaleString()}</span>
                    <span className="text-muted-foreground">{formatUSTime(d.created_at)}</span>
                  </div>
                ))}
                {userDeposits.length === 0 && <p className="text-xs text-muted-foreground">No deposits.</p>}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Recent Withdrawals</h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {userWithdrawals.slice(0, 10).map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                    <span className="tabular-nums text-red-400">-${Number(w.amount).toLocaleString()}</span>
                    <span className="text-muted-foreground">{formatUSTime(w.created_at)}</span>
                  </div>
                ))}
                {userWithdrawals.length === 0 && <p className="text-xs text-muted-foreground">No withdrawals.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users">
          <div className="glass-card overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-medium">User Management</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search username, email, phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-8 text-xs" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-border text-left text-xs text-muted-foreground">
                    <SortHeader field="username">Username</SortHeader>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">IP Address</th>
                    <th className="px-5 py-3 font-medium">Country</th>
                    <th className="px-5 py-3 font-medium">Region</th>
                    <th className="px-5 py-3 font-medium">Referral Code</th>
                    <th className="px-5 py-3 font-medium">Referred By</th>
                    <th className="px-5 py-3 font-medium">Referrals</th>
                    <SortHeader field="balance">Wallet Balance</SortHeader>
                    <SortHeader field="advertising_salary">Ad Salary</SortHeader>
                    <th className="px-5 py-3 font-medium">VIP Level</th>
                    <th className="px-5 py-3 font-medium">Tasks Today</th>
                    <SortHeader field="status">Task Access</SortHeader>
                    <th className="px-5 py-3 font-medium">Cycle</th>
                    <SortHeader field="created_at">Registered</SortHeader>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map((u: any) => (
                    <tr key={u.user_id} className="border-t border-border cursor-pointer hover:bg-muted/20" onClick={() => setSelectedUserId(u.user_id)}>
                      <td className="px-5 py-3 text-sm font-medium">{u.username || "—"}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{u.email || "—"}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{u.phone || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{u.ip_address || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{u.country || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{u.region || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{u.referral_code || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {u.referred_by ? (() => { const r = (profiles || []).find((p: any) => p.user_id === u.referred_by); return r ? r.username || r.email : u.referred_by; })() : "—"}
                      </td>
                      <td className="px-5 py-3 text-sm tabular-nums">{(profiles || []).filter((p: any) => p.referred_by === u.user_id).length}</td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        {editingUser === u.user_id ? (
                          <Input type="number" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="h-7 w-28 text-xs" min={0} />
                        ) : (
                          <span className="text-sm tabular-nums">${Number(u.balance).toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        {editingUser === u.user_id ? (
                          <Input type="number" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} className="h-7 w-28 text-xs" min={0} />
                        ) : (
                          <span className="text-sm tabular-nums">${Number(u.advertising_salary ?? 0).toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        {editingUser === u.user_id ? (
                          <select value={editVipLevel} onChange={(e) => setEditVipLevel(e.target.value)} className="h-7 rounded border border-border bg-background px-2 text-xs">
                            {VIP_LEVELS.map((level) => (<option key={level} value={level}>{level}</option>))}
                          </select>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{u.vip_level || "Junior"}</span>
                        )}
                      </td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        {editingUser === u.user_id ? (
                          <Input type="number" value={editTasksCompleted} onChange={(e) => setEditTasksCompleted(e.target.value)} className="h-7 w-20 text-xs" min={0} />
                        ) : (
                          <span className="text-sm tabular-nums">{u.tasks_completed_today ?? 0}</span>
                        )}
                      </td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleTaskAccess(u.user_id, u.status || "active")}
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${(u.status || "active") === "active" ? "bg-green-500/15 text-green-400 hover:bg-green-500/25" : "bg-destructive/15 text-destructive hover:bg-destructive/25"}`}
                        >
                          <Power className="h-3 w-3" />
                          {(u.status || "active") === "active" ? "ON" : "OFF"}
                        </button>
                      </td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        {u.task_cycle_completed ? (
                          <button onClick={() => handleResetCycle(u.user_id)} disabled={processingId === u.user_id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors">
                            <RotateCcw className="h-3 w-3" /> Reset
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Active</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        {editingUser === u.user_id ? (
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => saveBalances(u.user_id)}><Check className="h-3.5 w-3.5 text-green-400" /></Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={cancelEditing}><X className="h-3.5 w-3.5 text-destructive" /></Button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => startEditing(u)}><Pencil className="h-3 w-3" /> Edit</Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10" disabled={deletingUser === u.user_id}><Trash2 className="h-3 w-3" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to delete <strong>{u.username || u.email}</strong>? This action is irreversible.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(u.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Permanently</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredProfiles.length === 0 && (
                    <tr><td colSpan={14} className="px-5 py-6 text-center text-sm text-muted-foreground">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* DEPOSITS TAB */}
        <TabsContent value="deposits">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Deposit Form */}
            <div className="glass-card p-5 space-y-4">
              <h2 className="text-sm font-medium flex items-center gap-2"><ArrowDownToLine className="h-4 w-4 text-green-400" /> Record Deposit</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Select User</label>
                  <UserSelect value={depUserId} onChange={setDepUserId} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Amount ($)</label>
                  <Input type="number" placeholder="0.00" value={depAmount} onChange={(e) => setDepAmount(e.target.value)} min={0} step="0.01" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Note (optional)</label>
                  <Input placeholder="e.g. via customer service" value={depNote} onChange={(e) => setDepNote(e.target.value)} />
                </div>
                <Button onClick={handleAdminDeposit} disabled={depSubmitting} className="w-full">
                  {depSubmitting ? "Processing..." : "Submit Deposit"}
                </Button>
              </div>
            </div>

            {/* Deposit Records */}
            <div className="md:col-span-2 glass-card overflow-hidden">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-sm font-medium">All Deposits</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search username..." value={depSearch} onChange={(e) => setDepSearch(e.target.value)} className="pl-9 h-8 text-xs w-40" />
                  </div>
                  <Input type="date" value={depDateFilter} onChange={(e) => setDepDateFilter(e.target.value)} className="h-8 text-xs w-36" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-t border-border text-left text-xs text-muted-foreground">
                      <th className="px-5 py-3 font-medium">Username</th>
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">Note</th>
                      <th className="px-5 py-3 font-medium">Date (US)</th>
                      <th className="px-5 py-3 font-medium">Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeposits.map((d: any) => (
                      <tr key={d.id} className="border-t border-border">
                        <td className="px-5 py-3 text-sm font-medium">{getUserName(d.user_id)}</td>
                        <td className="px-5 py-3 text-sm tabular-nums text-green-400">+${Number(d.amount).toLocaleString()}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{d.admin_note || "—"}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{formatUSTime(d.created_at)}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{getAdminName(d.wallet_address)}</td>
                      </tr>
                    ))}
                    {filteredDeposits.length === 0 && (
                      <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-muted-foreground">No deposits found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* WITHDRAWALS TAB */}
        <TabsContent value="withdrawals">
          <div className="space-y-6">
            {/* Admin manual withdrawal form */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-5 space-y-4">
                <h2 className="text-sm font-medium flex items-center gap-2"><ArrowUpFromLine className="h-4 w-4 text-red-400" /> Record Withdrawal</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Select User</label>
                    <UserSelect value={wdUserId} onChange={setWdUserId} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Amount ($)</label>
                    <Input type="number" placeholder="0.00" value={wdAmount} onChange={(e) => setWdAmount(e.target.value)} min={0} step="0.01" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Note (optional)</label>
                    <Input placeholder="e.g. manual payout" value={wdNote} onChange={(e) => setWdNote(e.target.value)} />
                  </div>
                  <Button onClick={handleAdminWithdraw} disabled={wdSubmitting} variant="destructive" className="w-full">
                    {wdSubmitting ? "Processing..." : "Submit Withdrawal"}
                  </Button>
                </div>
              </div>

              {/* Withdrawal Requests */}
              <div className="md:col-span-2 glass-card overflow-hidden">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-sm font-medium">Withdrawal Requests</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="Search username..." value={wdSearch} onChange={(e) => setWdSearch(e.target.value)} className="pl-9 h-8 text-xs w-40" />
                    </div>
                    <Input type="date" value={wdDateFilter} onChange={(e) => setWdDateFilter(e.target.value)} className="h-8 text-xs w-36" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-t border-border text-left text-xs text-muted-foreground">
                        <th className="px-5 py-3 font-medium">Username</th>
                        <th className="px-5 py-3 font-medium">Amount</th>
                        <th className="px-5 py-3 font-medium">Crypto Address</th>
                        <th className="px-5 py-3 font-medium">Note</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Date (US)</th>
                        <th className="px-5 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWithdrawals.map((w: any) => (
                        <tr key={w.id} className="border-t border-border">
                          <td className="px-5 py-3 text-sm font-medium">{getUserName(w.user_id)}</td>
                          <td className="px-5 py-3 text-sm tabular-nums text-red-400">-${Number(w.amount).toLocaleString()}</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground font-mono max-w-[180px] truncate" title={w.wallet_address || ""}>
                            {w.wallet_address && !w.wallet_address.match(/^[0-9a-f]{8}-/) ? w.wallet_address : "—"}
                          </td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">{w.admin_note || "—"}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${w.status === "pending" ? "bg-amber-500/15 text-amber-400" : "bg-green-500/15 text-green-400"}`}>
                              {w.status === "approved" ? "completed" : w.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">{formatUSTime(w.created_at)}</td>
                          <td className="px-5 py-3">
                            {w.status === "pending" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1.5 text-green-400 border-green-400/30 hover:bg-green-500/10"
                                disabled={processingId === w.id}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setProcessingId(w.id);
                                  try {
                                    const { error } = await supabase
                                      .from("withdrawals")
                                      .update({ status: "completed", admin_note: w.admin_note || "Processed by admin", updated_at: new Date().toISOString() })
                                      .eq("id", w.id);
                                    if (error) throw error;
                                    // Also update the matching transaction
                                    await supabase
                                      .from("transactions")
                                      .update({ status: "approved" } as any)
                                      .eq("user_id", w.user_id)
                                      .eq("type", "withdrawal")
                                      .eq("status", "pending")
                                      .eq("amount", -Number(w.amount));
                                    toast.success("Withdrawal marked as completed.");
                                    queryClient.invalidateQueries({ queryKey: ["admin-all-withdrawals"] });
                                  } catch (err: any) {
                                    toast.error(err.message || "Failed to update status.");
                                  } finally {
                                    setProcessingId(null);
                                  }
                                }}
                              >
                                <Check className="h-3 w-3" /> Complete
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Done</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredWithdrawals.length === 0 && (
                        <tr><td colSpan={7} className="px-5 py-6 text-center text-sm text-muted-foreground">No withdrawals found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminPanel;
