import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import SkyriseLogo from "@/components/SkyriseLogo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, ArrowDownToLine, ArrowUpFromLine, Shield, Search, Pencil, Check, X, Trash2, Power, ArrowUpDown, RotateCcw, ScrollText, UserCog, ShieldCheck, Eye, Link2, MessageSquare, Star, AlertTriangle, Bomb } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VIP_LEVELS } from "@/lib/vip-config";
import AdminSupportTab from "@/components/admin/AdminSupportTab";
import AdminAAATab from "@/components/admin/AdminAAATab";
import AdminPendingAAATab from "@/components/admin/AdminPendingAAATab";
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

const logAdminAction = async (actionType: string, targetUserId?: string | null, description?: string) => {
  try {
    await supabase.rpc("log_admin_action", {
      _action_type: actionType,
      _target_user_id: targetUserId || null,
      _description: description || "",
    } as any);
  } catch (e) {
    console.error("Failed to log admin action:", e);
  }
};

const AdminPanel = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleAdminLogout = async () => {
    await signOut();
    navigate("/admin-sky-987");
  };
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editVipLevel, setEditVipLevel] = useState("");
  const [editTasksCompleted, setEditTasksCompleted] = useState("");
  const [editCreditScore, setEditCreditScore] = useState("");
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

  // Log filters
  const [logSearch, setLogSearch] = useState("");
  const [logActionFilter, setLogActionFilter] = useState("");
  const [logAdminFilter, setLogAdminFilter] = useState("");

  const [adminSearch, setAdminSearch] = useState("");
  const [kycSearch, setKycSearch] = useState("");
  const [kycFilter, setKycFilter] = useState<string>("");
  const [refSearch, setRefSearch] = useState("");

  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.error("Admin profiles query: No active session");
        throw new Error("Not authenticated");
      }
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        console.error("Admin profiles query error:", error);
        throw error;
      }
      console.log("Admin profiles loaded:", data?.length || 0);
      return data || [];
    },
    retry: 2,
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

  const { data: adminRoles } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*").in("role", ["admin", "moderator"]);
      return data || [];
    },
  });

  const { data: adminLogs } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(500);
      return (data || []) as any[];
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
        _user_id: depUserId, _amount: amt, _note: depNote || "",
      } as any);
      if (error) throw error;
      const result = data as any;
      if (result?.error) { toast.error(result.error); return; }
      toast.success(`Deposited ${amt.toLocaleString()} AC successfully.`);
      setDepAmount(""); setDepNote(""); setDepUserId("");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
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
        _user_id: wdUserId, _amount: amt, _note: wdNote || "",
      } as any);
      if (error) throw error;
      const result = data as any;
      if (result?.error) { toast.error(result.error); return; }
      toast.success(`Withdrew ${amt.toLocaleString()} AC successfully.`);
      setWdAmount(""); setWdNote(""); setWdUserId("");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to withdraw.");
    } finally {
      setWdSubmitting(false);
    }
  };

  const startEditing = (user: any) => {
    setEditingUser(user.user_id);
    setEditBalance(String(user.balance));
    setEditSalary(String(user.advertising_salary ?? 0));
    setEditVipLevel(user.vip_level || "Junior");
    setEditTasksCompleted(String(user.tasks_completed_today ?? 0));
    setEditCreditScore(String(user.credit_score ?? 100));
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditBalance(""); setEditSalary(""); setEditVipLevel(""); setEditTasksCompleted(""); setEditCreditScore("");
  };

  const saveBalances = async (userId: string) => {
    const newBalance = parseFloat(editBalance);
    const newSalary = parseFloat(editSalary);
    const newTasks = parseInt(editTasksCompleted);
    const newCreditScore = parseInt(editCreditScore);
    if (isNaN(newBalance) || newBalance < 0) { toast.error("Invalid wallet balance value."); return; }
    if (isNaN(newSalary) || newSalary < 0) { toast.error("Invalid advertising salary value."); return; }
    if (isNaN(newTasks) || newTasks < 0) { toast.error("Invalid tasks completed value."); return; }
    if (isNaN(newCreditScore) || newCreditScore < 0 || newCreditScore > 100) { toast.error("Credit score must be 0–100."); return; }
    if (!VIP_LEVELS.includes(editVipLevel)) { toast.error("Invalid VIP level."); return; }

    const oldUser = (profiles || []).find((p: any) => p.user_id === userId);

    // Determine popup message based on what changed
    let popupMessage: string | null = null;
    let popupType: string | null = null;

    if (oldUser) {
      const vipChanged = oldUser.vip_level !== editVipLevel;
      const tasksReset = newTasks < (oldUser.tasks_completed_today ?? 0);
      const balanceIncreased = newBalance > Number(oldUser.balance);

      if (vipChanged) {
        popupMessage = `Congratulations! You have been upgraded to ${editVipLevel} Promoter. You now have access to enhanced rewards and exclusive promotional campaigns.`;
        popupType = "upgrade";
      } else if (tasksReset) {
        popupMessage = `Every time users complete three sets of promotional assignments, can instantly contact the platform's customer service to claim a random bonus ranging from 1 to 1,000 AC.`;
        popupType = "reset";
      } else if (balanceIncreased) {
        popupMessage = `Your wallet has been credited with ${(newBalance - Number(oldUser.balance)).toFixed(2)} AC. Your new balance is ${newBalance.toFixed(2)} AC.`;
        popupType = "deposit";
      }
    }

    const updatePayload: any = { balance: newBalance, advertising_salary: newSalary, vip_level: editVipLevel, tasks_completed_today: newTasks, credit_score: newCreditScore };
    if (popupMessage) {
      updatePayload.pending_popup_message = popupMessage;
      updatePayload.pending_popup_type = popupType;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", userId);
    if (error) { toast.error("Failed to update user."); return; }

    // Log changes
    const changes: string[] = [];
    if (oldUser && Number(oldUser.balance) !== newBalance) changes.push(`Balance: ${oldUser.balance} → ${newBalance} AC`);
    if (oldUser && Number(oldUser.advertising_salary) !== newSalary) changes.push(`Salary: ${oldUser.advertising_salary} → ${newSalary} AC`);
    if (oldUser && oldUser.vip_level !== editVipLevel) changes.push(`VIP: ${oldUser.vip_level} → ${editVipLevel}`);
    if (oldUser && oldUser.tasks_completed_today !== newTasks) changes.push(`Tasks: ${oldUser.tasks_completed_today} → ${newTasks}`);
    if (oldUser && Number((oldUser as any).credit_score ?? 100) !== newCreditScore) changes.push(`Credit: ${(oldUser as any).credit_score ?? 100}% → ${newCreditScore}%`);
    if (changes.length > 0) {
      await logAdminAction("user_update", userId, changes.join("; "));
    }

    toast.success("User updated successfully.");
    setEditingUser(null);
    queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
  };

  const handleToggleTaskAccess = async (userId: string, currentStatus: string) => {
    setProcessingId(userId);
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const { error } = await supabase.from("profiles").update({ status: newStatus } as any).eq("user_id", userId).select();
      if (error) { toast.error("Failed to update task access: " + error.message); return; }
      await logAdminAction("task_access_toggle", userId, `Task access ${newStatus === "active" ? "enabled" : "disabled"}`);
      toast.success(`Task access ${newStatus === "active" ? "enabled" : "disabled"}.`);
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUser(userId);
    const userName = getUserName(userId);
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
      await logAdminAction("user_delete", userId, `Deleted user: ${userName}`);
      toast.success("User deleted permanently.");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user.");
    } finally {
      setDeletingUser(null);
    }
  };

  const handleResetCycle = async (userId: string) => {
    setProcessingId(userId);
    try {
      const { error } = await supabase.from("profiles").update({ task_cycle_completed: false, tasks_completed_today: 0, current_unlocked_set: 1 } as any).eq("user_id", userId);
      if (error) { toast.error("Failed to reset task cycle: " + error.message); return; }
      await logAdminAction("task_cycle_reset", userId, "Reset task cycle (all sets)");
      toast.success("Task cycle reset successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnlockNextSet = async (userId: string, currentSet: number) => {
    setProcessingId(userId);
    try {
      const nextSet = Math.min(currentSet + 1, 3);
      const { error } = await supabase.from("profiles").update({ current_unlocked_set: nextSet } as any).eq("user_id", userId);
      if (error) { toast.error("Failed to unlock set: " + error.message); return; }
      await logAdminAction("set_unlock", userId, `Unlocked set ${nextSet}`);
      toast.success(`Set ${nextSet} unlocked successfully.`);
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    } finally {
      setProcessingId(null);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const totalUsers = profiles?.length ?? 0;
  

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
    if (depSearch) { const name = getUserName(d.user_id).toLowerCase(); if (!name.includes(depSearch.toLowerCase())) return false; }
    if (depDateFilter) { const dDate = new Date(d.created_at).toISOString().slice(0, 10); if (dDate !== depDateFilter) return false; }
    return true;
  });

  // Filter withdrawals
  const filteredWithdrawals = (allWithdrawals || []).filter((w: any) => {
    if (wdSearch) { const name = getUserName(w.user_id).toLowerCase(); if (!name.includes(wdSearch.toLowerCase())) return false; }
    if (wdDateFilter) { const wDate = new Date(w.created_at).toISOString().slice(0, 10); if (wDate !== wdDateFilter) return false; }
    return true;
  });

  // Admins list
  const adminUsers = (adminRoles || []).map((role: any) => {
    const profile = (profiles || []).find((p: any) => p.user_id === role.user_id);
    return { ...role, profile };
  }).filter((a: any) => {
    if (!adminSearch) return true;
    const q = adminSearch.toLowerCase();
    return (a.profile?.username || "").toLowerCase().includes(q) || (a.profile?.email || "").toLowerCase().includes(q);
  });

  // Filter logs
  const actionTypes = [...new Set((adminLogs || []).map((l: any) => l.action_type))];
  const adminNames = [...new Set((adminLogs || []).map((l: any) => l.admin_username).filter(Boolean))];
  const filteredLogs = (adminLogs || []).filter((l: any) => {
    if (logSearch) {
      const q = logSearch.toLowerCase();
      if (!(l.target_username || "").toLowerCase().includes(q) && !(l.admin_username || "").toLowerCase().includes(q) && !(l.description || "").toLowerCase().includes(q)) return false;
    }
    if (logActionFilter && l.action_type !== logActionFilter) return false;
    if (logAdminFilter && l.admin_username !== logAdminFilter) return false;
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
  ];

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th className="px-5 py-3 font-medium cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort(field)}>
      <span className="inline-flex items-center gap-1">{children}<ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-primary" : "text-muted-foreground/50"}`} /></span>
    </th>
  );

  const UserSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded border border-border bg-background px-3 text-sm">
      <option value="">Select a user...</option>
      {(profiles || []).sort((a: any, b: any) => (a.username || "").localeCompare(b.username || "")).map((p: any) => (
        <option key={p.user_id} value={p.user_id}>{p.username || p.email} — {Number(p.balance).toLocaleString()} AC</option>
      ))}
    </select>
  );

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "user_delete": return "bg-destructive/15 text-destructive";
      case "user_update": return "bg-amber-500/15 text-amber-400";
      case "deposit": return "bg-green-500/15 text-green-400";
      case "withdrawal": case "withdrawal_complete": return "bg-red-500/15 text-red-400";
      case "task_access_toggle": case "task_cycle_reset": return "bg-blue-500/15 text-blue-400";
      case "kyc_verify": return "bg-emerald-500/15 text-emerald-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-6">
        <Link to="/" className="flex items-center">
          <SkyriseLogo className="h-10 w-auto" />
        </Link>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign Out
        </button>
      </header>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLogoutModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowLogoutModal(false)}
            >
              <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <LogOut className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Are you sure you want to log out?</h3>
                <p className="text-sm text-muted-foreground mb-6">You will be redirected to the admin login page.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 rounded-xl border border-border bg-muted/50 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Stay
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="p-6 lg:p-8">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" strokeWidth={1.5} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage users, deposits, withdrawals, and view activity logs.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
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
              <div className="text-lg font-semibold text-green-400 tabular-nums">{userTotalDeposits.toLocaleString()} AC</div>
            </div>
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">Total Withdrawals</span>
              <div className="text-lg font-semibold text-red-400 tabular-nums">{userTotalWithdrawals.toLocaleString()} AC</div>
            </div>
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">Current Balance</span>
              <div className="text-lg font-semibold tabular-nums">{Number((selectedUser as any).balance).toLocaleString()} AC</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">Current IP</span>
              <div className="text-sm font-mono mt-1">{(selectedUser as any).ip_address || "—"}</div>
            </div>
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">Last Login IP</span>
              <div className="text-sm font-mono mt-1">{(selectedUser as any).last_login_ip || "—"}</div>
            </div>
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">Country</span>
              <div className="text-sm mt-1">{(selectedUser as any).country || "—"}</div>
            </div>
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">Region / City</span>
              <div className="text-sm mt-1">{[(selectedUser as any).region, (selectedUser as any).city].filter(Boolean).join(", ") || "—"}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">ISP</span>
              <div className="text-sm mt-1">{(selectedUser as any).isp || "—"}</div>
            </div>
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">Connection Type</span>
              <div className="text-sm mt-1">{(selectedUser as any).connection_type || "—"}</div>
            </div>
            <div className="vault-card p-4">
              <span className="text-xs text-muted-foreground">VPN Status</span>
              <div className="mt-1">
                {(selectedUser as any).is_vpn ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-destructive/15 text-destructive">⚠️ VPN/Proxy Detected</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">✅ Normal</span>
                )}
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Recent Deposits</h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {userDeposits.slice(0, 10).map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                    <span className="tabular-nums text-green-400">+{Number(d.amount).toLocaleString()} AC</span>
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
                    <span className="tabular-nums text-red-400">-{Number(w.amount).toLocaleString()} AC</span>
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
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="aaa" className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5" />AAA</TabsTrigger>
          <TabsTrigger value="pending-aaa" className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Pending</TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5" />Referrals</TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />KYC</TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-1.5"><UserCog className="h-3.5 w-3.5" />Admins</TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1.5"><ScrollText className="h-3.5 w-3.5" />Logs</TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />Support</TabsTrigger>
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
                    <th className="px-5 py-3 font-medium">VPN</th>
                    <th className="px-5 py-3 font-medium">Referral Code</th>
                    <th className="px-5 py-3 font-medium">Referred By</th>
                    <th className="px-5 py-3 font-medium">Referrals</th>
                    <SortHeader field="balance">Wallet Balance</SortHeader>
                    <SortHeader field="advertising_salary">Ad Salary</SortHeader>
                    <th className="px-5 py-3 font-medium">VIP Level</th>
                    <th className="px-5 py-3 font-medium">Tasks Today</th>
                    <th className="px-5 py-3 font-medium">Credit Score</th>
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
                      <td className="px-5 py-3">
                        {u.is_vpn ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">⚠️ VPN</span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">✅</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{u.referral_code || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {u.referred_by ? (() => { const r = (profiles || []).find((p: any) => p.user_id === u.referred_by); return r ? r.username || r.email : u.referred_by; })() : "—"}
                      </td>
                      <td className="px-5 py-3 text-sm tabular-nums">{(profiles || []).filter((p: any) => p.referred_by === u.user_id).length}</td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        {editingUser === u.user_id ? (
                          <Input type="number" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="h-7 w-28 text-xs" min={0} />
                        ) : (
                          <span className="text-sm tabular-nums">{Number(u.balance).toLocaleString()} AC</span>
                        )}
                      </td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        {editingUser === u.user_id ? (
                          <Input type="number" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} className="h-7 w-28 text-xs" min={0} />
                        ) : (
                          <span className="text-sm tabular-nums">{Number(u.advertising_salary ?? 0).toLocaleString()} AC</span>
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
                        {editingUser === u.user_id ? (
                          <div className="flex items-center gap-2">
                            <Input type="number" value={editCreditScore} onChange={(e) => setEditCreditScore(e.target.value)} className="h-7 w-20 text-xs" min={0} max={100} />
                            <span className="text-xs text-muted-foreground">%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${u.credit_score ?? 100}%`, backgroundColor: (u.credit_score ?? 100) >= 80 ? 'hsl(var(--primary))' : (u.credit_score ?? 100) >= 50 ? 'hsl(45 93% 47%)' : 'hsl(var(--destructive))' }} />
                            </div>
                            <span className="text-xs tabular-nums font-medium">{u.credit_score ?? 100}%</span>
                          </div>
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs tabular-nums font-medium">Set {u.current_unlocked_set ?? 1}/3</span>
                          {u.task_cycle_completed ? (
                            <button onClick={() => handleResetCycle(u.user_id)} disabled={processingId === u.user_id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors">
                              <RotateCcw className="h-2.5 w-2.5" /> Reset
                            </button>
                          ) : (u.tasks_completed_today ?? 0) >= (u.current_unlocked_set ?? 1) * 40 && (u.current_unlocked_set ?? 1) < 3 ? (
                            <button onClick={() => handleUnlockNextSet(u.user_id, u.current_unlocked_set ?? 1)} disabled={processingId === u.user_id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-colors">
                              Unlock
                            </button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Active</span>
                          )}
                        </div>
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
                    <tr><td colSpan={17} className="px-5 py-6 text-center text-sm text-muted-foreground">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* DEPOSITS TAB */}
        <TabsContent value="deposits">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-5 space-y-4">
              <h2 className="text-sm font-medium flex items-center gap-2"><ArrowDownToLine className="h-4 w-4 text-green-400" /> Record Deposit</h2>
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">Select User</label><UserSelect value={depUserId} onChange={setDepUserId} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Amount (AC)</label><Input type="number" placeholder="0.00" value={depAmount} onChange={(e) => setDepAmount(e.target.value)} min={0} step="0.01" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Note (optional)</label><Input placeholder="e.g. via customer service" value={depNote} onChange={(e) => setDepNote(e.target.value)} /></div>
                <Button onClick={handleAdminDeposit} disabled={depSubmitting} className="w-full">{depSubmitting ? "Processing..." : "Submit Deposit"}</Button>
              </div>
            </div>
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
                        <td className="px-5 py-3 text-sm tabular-nums text-green-400">+{Number(d.amount).toLocaleString()} AC</td>
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
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-5 space-y-4">
                <h2 className="text-sm font-medium flex items-center gap-2"><ArrowUpFromLine className="h-4 w-4 text-red-400" /> Record Withdrawal</h2>
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">Select User</label><UserSelect value={wdUserId} onChange={setWdUserId} /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Amount (AC)</label><Input type="number" placeholder="0.00" value={wdAmount} onChange={(e) => setWdAmount(e.target.value)} min={0} step="0.01" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Note (optional)</label><Input placeholder="e.g. manual payout" value={wdNote} onChange={(e) => setWdNote(e.target.value)} /></div>
                  <Button onClick={handleAdminWithdraw} disabled={wdSubmitting} variant="destructive" className="w-full">{wdSubmitting ? "Processing..." : "Submit Withdrawal"}</Button>
                </div>
              </div>
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
                          <td className="px-5 py-3 text-sm tabular-nums text-red-400">-{Number(w.amount).toLocaleString()} AC</td>
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
                                size="sm" variant="outline"
                                className="h-7 text-xs gap-1.5 text-green-400 border-green-400/30 hover:bg-green-500/10"
                                disabled={processingId === w.id}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setProcessingId(w.id);
                                  try {
                                    const { error } = await supabase.from("withdrawals").update({ status: "completed", admin_note: w.admin_note || "Processed by admin", updated_at: new Date().toISOString() }).eq("id", w.id);
                                    if (error) throw error;
                                    await supabase.from("transactions").update({ status: "approved" } as any).eq("user_id", w.user_id).eq("type", "withdrawal").eq("status", "pending").eq("amount", -Number(w.amount));
                                    await logAdminAction("withdrawal_complete", w.user_id, `Completed withdrawal of ${Number(w.amount).toLocaleString()} AC`);
                                    toast.success("Withdrawal marked as completed.");
                                    queryClient.invalidateQueries({ queryKey: ["admin-all-withdrawals"] });
                                    queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
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

        {/* KYC TAB */}
        <TabsContent value="kyc">
          <div className="glass-card overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> KYC Verification</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search username..." value={kycSearch} onChange={(e) => setKycSearch(e.target.value)} className="pl-9 h-8 text-xs w-40" />
                </div>
                <select value={kycFilter} onChange={(e) => setKycFilter(e.target.value)} className="h-8 rounded border border-border bg-background px-2 text-xs">
                  <option value="">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Username</th>
                    <th className="px-5 py-3 font-medium">Full Name</th>
                    <th className="px-5 py-3 font-medium">ID Type</th>
                    <th className="px-5 py-3 font-medium">ID Number</th>
                    <th className="px-5 py-3 font-medium">ID Front</th>
                    <th className="px-5 py-3 font-medium">ID Back</th>
                    <th className="px-5 py-3 font-medium">Selfie</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Submitted</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(profiles || [])
                    .filter((p: any) => {
                      if (kycFilter && p.kyc_status !== kycFilter) return false;
                      if (kycSearch) {
                        const q = kycSearch.toLowerCase();
                        return (p.username || "").toLowerCase().includes(q) || (p.kyc_name || "").toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .filter((p: any) => p.kyc_status !== "pending" || kycFilter === "pending")
                    .sort((a: any, b: any) => {
                      if (a.kyc_status === "submitted" && b.kyc_status !== "submitted") return -1;
                      if (b.kyc_status === "submitted" && a.kyc_status !== "submitted") return 1;
                      return new Date(b.kyc_submitted_at || b.created_at).getTime() - new Date(a.kyc_submitted_at || a.created_at).getTime();
                    })
                    .map((p: any) => (
                      <tr key={p.user_id} className="border-t border-border">
                        <td className="px-5 py-3 text-sm font-medium">{p.username || "—"}</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{p.kyc_name || "—"}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{p.kyc_id_type || "—"}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{p.kyc_id_number || "—"}</td>
                        <td className="px-5 py-3">
                          {p.kyc_front_url ? (
                            <a href={p.kyc_front_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                              <Eye className="h-3 w-3" /> View
                            </a>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-5 py-3">
                          {p.kyc_back_url ? (
                            <a href={p.kyc_back_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                              <Eye className="h-3 w-3" /> View
                            </a>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-5 py-3">
                          {p.kyc_selfie_url ? (
                            <a href={p.kyc_selfie_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                              <Eye className="h-3 w-3" /> View
                            </a>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                            p.kyc_status === "verified" ? "bg-green-500/15 text-green-400" :
                            p.kyc_status === "submitted" ? "bg-amber-500/15 text-amber-400" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {p.kyc_status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{p.kyc_submitted_at ? formatUSTime(p.kyc_submitted_at) : "—"}</td>
                        <td className="px-5 py-3">
                          {p.kyc_status === "submitted" ? (
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-xs gap-1.5 text-green-400 border-green-400/30 hover:bg-green-500/10"
                              disabled={processingId === p.user_id}
                              onClick={async (e) => {
                                e.stopPropagation();
                                setProcessingId(p.user_id);
                                try {
                                  const { error } = await supabase.from("profiles").update({ kyc_status: "verified" } as any).eq("user_id", p.user_id);
                                  if (error) throw error;
                                  await logAdminAction("kyc_verify", p.user_id, `Verified KYC for ${p.username || p.email}`);
                                  toast.success(`KYC verified for ${p.username || p.email}.`);
                                  queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
                                  queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
                                } catch (err: any) {
                                  toast.error(err.message || "Failed to verify KYC.");
                                } finally {
                                  setProcessingId(null);
                                }
                              }}
                            >
                              <Check className="h-3 w-3" /> Verify
                            </Button>
                          ) : p.kyc_status === "verified" ? (
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-xs gap-1.5 text-amber-400 border-amber-400/30 hover:bg-amber-500/10"
                              disabled={processingId === p.user_id}
                              onClick={async (e) => {
                                e.stopPropagation();
                                setProcessingId(p.user_id);
                                try {
                                  const { error } = await supabase.from("profiles").update({
                                    kyc_status: "pending",
                                    kyc_name: null,
                                    kyc_id_number: null,
                                    kyc_id_type: null,
                                    kyc_front_url: null,
                                    kyc_back_url: null,
                                    kyc_selfie_url: null,
                                    kyc_submitted_at: null,
                                  } as any).eq("user_id", p.user_id);
                                  if (error) throw error;
                                  await logAdminAction("kyc_reset", p.user_id, `Reset KYC for ${p.username || p.email}`);
                                  toast.success(`KYC reset for ${p.username || p.email}. They can now resubmit.`);
                                  queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
                                  queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
                                } catch (err: any) {
                                  toast.error(err.message || "Failed to reset KYC.");
                                } finally {
                                  setProcessingId(null);
                                }
                              }}
                            >
                              <RotateCcw className="h-3 w-3" /> Reset KYC
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  {(profiles || []).filter((p: any) => p.kyc_status !== "pending" || kycFilter === "pending").length === 0 && (
                    <tr><td colSpan={10} className="px-5 py-6 text-center text-sm text-muted-foreground">No KYC submissions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ADMINS TAB */}
        <TabsContent value="admins">
          <div className="glass-card overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-medium flex items-center gap-2"><UserCog className="h-4 w-4 text-primary" /> Authorized Admins</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search admin..." value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className="pl-9 h-8 text-xs" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Username</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Last Login (US)</th>
                    <th className="px-5 py-3 font-medium">Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((admin: any) => (
                    <tr key={admin.id} className="border-t border-border">
                      <td className="px-5 py-3 text-sm font-medium">{admin.profile?.username || "—"}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{admin.profile?.email || "—"}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{admin.role}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">Active</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{admin.profile?.last_login_at ? formatUSTime(admin.profile.last_login_at) : "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{formatUSTime(admin.created_at)}</td>
                    </tr>
                  ))}
                  {adminUsers.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-6 text-center text-sm text-muted-foreground">No admins found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ACTIVITY LOGS TAB */}
        <TabsContent value="logs">
          <div className="glass-card overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-medium flex items-center gap-2"><ScrollText className="h-4 w-4 text-primary" /> Admin Activity Log</h2>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search..." value={logSearch} onChange={(e) => setLogSearch(e.target.value)} className="pl-9 h-8 text-xs w-40" />
                </div>
                <select value={logActionFilter} onChange={(e) => setLogActionFilter(e.target.value)} className="h-8 rounded border border-border bg-background px-2 text-xs">
                  <option value="">All Actions</option>
                  {actionTypes.map((t) => (<option key={t} value={t}>{t.replace(/_/g, " ")}</option>))}
                </select>
                <select value={logAdminFilter} onChange={(e) => setLogAdminFilter(e.target.value)} className="h-8 rounded border border-border bg-background px-2 text-xs">
                  <option value="">All Admins</option>
                  {adminNames.map((n) => (<option key={n} value={n}>{n}</option>))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Admin</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium">Target User</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 font-medium">Date (US)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log: any) => (
                    <tr key={log.id} className="border-t border-border">
                      <td className="px-5 py-3 text-sm font-medium">{log.admin_username || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getActionColor(log.action_type)}`}>
                          {log.action_type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{log.target_username || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground max-w-[300px] truncate" title={log.description}>{log.description || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{formatUSTime(log.created_at)}</td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-muted-foreground">No activity logs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        {/* REFERRALS TAB */}
        <TabsContent value="referrals">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" />Referral Tracking</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={refSearch} onChange={(e) => setRefSearch(e.target.value)} className="pl-9 h-8 text-xs" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">User</th>
                    <th className="px-4 py-3 text-left font-medium">Referral Code</th>
                    <th className="px-4 py-3 text-left font-medium">Referred By</th>
                    <th className="px-4 py-3 text-center font-medium">Referral Count</th>
                    <th className="px-4 py-3 text-left font-medium">Referred Users</th>
                  </tr>
                </thead>
                <tbody>
                  {(profiles || [])
                    .filter((p: any) => {
                      if (!refSearch) return true;
                      const q = refSearch.toLowerCase();
                      return (p.username || "").toLowerCase().includes(q) || (p.email || "").toLowerCase().includes(q) || (p.referral_code || "").toLowerCase().includes(q);
                    })
                    .map((p: any) => {
                      const referredUsers = (profiles || []).filter((r: any) => r.referred_by === p.user_id || r.referred_by === p.referral_code);
                      const referrerProfile = p.referred_by ? (profiles || []).find((r: any) => r.user_id === p.referred_by || r.referral_code === p.referred_by) : null;
                      return (
                        <tr key={p.user_id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium">{p.username || p.email}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded">{p.referral_code || "—"}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{referrerProfile ? (referrerProfile as any).username || (referrerProfile as any).email : p.referred_by || "—"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-bold ${referredUsers.length > 0 ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                              {referredUsers.length}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {referredUsers.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {referredUsers.map((ru: any) => (
                                  <span key={ru.user_id} className="text-xs bg-muted px-2 py-0.5 rounded">{ru.username || ru.email}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No referrals</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* AAA Tab */}
        <TabsContent value="aaa">
          <AdminAAATab profiles={profiles || []} />
        </TabsContent>

        {/* Pending AAA Tab */}
        <TabsContent value="pending-aaa">
          <AdminPendingAAATab profiles={profiles || []} />
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <AdminSupportTab />
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;