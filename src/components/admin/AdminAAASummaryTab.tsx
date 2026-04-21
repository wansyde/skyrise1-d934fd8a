import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Eye, Power, Pencil, BarChart3, Save, X } from "lucide-react";

interface Props {
  profiles: any[];
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AdminAAASummaryTab = ({ profiles }: Props) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [disableId, setDisableId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editMultiplier, setEditMultiplier] = useState("1");
  const [editPrices, setEditPrices] = useState<string[]>([]);
  const [editCommissions, setEditCommissions] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["admin-aaa-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaa_assignments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000,
  });

  // Pending task records to compute live financial state per assignment
  const { data: taskRecords = [] } = useQuery({
    queryKey: ["admin-aaa-summary-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_records")
        .select("*")
        .eq("task_type", "AAA");
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000,
  });

  const getUserName = (uid: string | null) => {
    if (!uid) return "All Users (Global)";
    const p = profiles.find((p: any) => p.user_id === uid);
    return p?.username || p?.email || uid.slice(0, 8);
  };

  const getProfile = (uid: string | null) =>
    uid ? profiles.find((p: any) => p.user_id === uid) : null;

  const enriched = useMemo(() => {
    return assignments.map((a: any) => {
      const carPrices: number[] = a.car_prices || [];
      const carCommissions: number[] = a.car_commissions || [];
      const multiplier = Number(a.commission_multiplier ?? 1);

      const totalCost = carPrices.reduce((s, p) => s + Number(p || 0), 0);
      const rawCommission = carCommissions.reduce((s, c) => s + Number(c || 0), 0);
      const totalProfit = Math.round(rawCommission * multiplier * 100) / 100;

      // Find linked task record to determine real current state
      const record = taskRecords.find((r: any) => r.assignment_code === a.id);
      const profile = getProfile(a.user_id);
      const balance = Number(profile?.balance ?? 0);

      // Required top-up = absolute deficit if user holding this task has negative balance
      const requiredTopup = record && balance < 0 ? Math.abs(balance) : 0;

      // Final balance after completion = current balance + totalCost (refund) + totalProfit
      // If not yet started, theoretical: starts from 0 → finalBalance = totalProfit (deposit-neutral)
      const finalBalance = record
        ? Math.round((balance + totalCost + totalProfit) * 100) / 100
        : Math.round(totalProfit * 100) / 100;

      const netGain = totalProfit; // commission is the net gain (cost is refunded)

      return {
        ...a,
        profile,
        record,
        carPrices,
        carCommissions,
        multiplier,
        totalCost,
        rawCommission,
        totalProfit,
        requiredTopup,
        finalBalance,
        netGain,
        isCompleted: a.status === "used",
        isDisabled: a.status === "disabled",
      };
    });
  }, [assignments, profiles, taskRecords]);

  const filtered = useMemo(() => {
    return enriched.filter((a: any) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        getUserName(a.user_id).toLowerCase().includes(q) ||
        String(a.id).toLowerCase().includes(q) ||
        (a.profile?.vip_level || "").toLowerCase().includes(q)
      );
    });
  }, [enriched, search, statusFilter]);

  const detail = detailId ? enriched.find((a: any) => a.id === detailId) : null;

  const handleDisable = async () => {
    if (!disableId) return;
    try {
      const { error } = await supabase
        .from("aaa_assignments")
        .update({ status: "disabled", updated_at: new Date().toISOString() })
        .eq("id", disableId);
      if (error) throw error;
      toast.success("Assignment disabled.");
      setDisableId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-aaa-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin-aaa-assignments"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to disable.");
    }
  };

  const startEdit = (a: any) => {
    if (a.isCompleted) {
      toast.error("Cannot edit a completed assignment.");
      return;
    }
    setEditId(a.id);
    setEditMultiplier(String(a.multiplier));
    setEditPrices(a.carPrices.map((p: number) => String(p)));
    setEditCommissions(a.carCommissions.map((c: number) => String(c)));
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditPrices([]);
    setEditCommissions([]);
    setEditMultiplier("1");
  };

  const saveEdit = async () => {
    if (!editId) return;
    const prices = editPrices.map((v) => parseFloat(v));
    const commissions = editCommissions.map((v) => parseFloat(v));
    const mult = parseFloat(editMultiplier);

    if (prices.some((p) => isNaN(p) || p <= 0)) {
      toast.error("All prices must be positive numbers.");
      return;
    }
    if (commissions.some((c) => isNaN(c) || c < 0)) {
      toast.error("Commissions must be non-negative numbers.");
      return;
    }
    if (isNaN(mult) || mult < 1 || mult > 100) {
      toast.error("Multiplier must be between 1 and 100.");
      return;
    }

    setSavingEdit(true);
    try {
      const total = prices.reduce((s, p) => s + p, 0);
      const { error } = await supabase
        .from("aaa_assignments")
        .update({
          car_prices: prices,
          car_commissions: commissions,
          commission_multiplier: mult,
          total_assignment_amount: total,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editId);
      if (error) throw error;
      toast.success("Assignment updated.");
      cancelEdit();
      queryClient.invalidateQueries({ queryKey: ["admin-aaa-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin-aaa-assignments"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to save.");
    } finally {
      setSavingEdit(false);
    }
  };

  const editingAssignment = editId ? enriched.find((a: any) => a.id === editId) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            AAA Summary ({filtered.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Read-only financial overview of every AAA assignment. Cannot submit user tasks here.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search user / ID / tier"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs w-56 pl-8"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded border border-border bg-background px-2 text-xs"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="used">Completed</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Assignment ID</th>
              <th className="px-3 py-2 text-left font-medium">User</th>
              <th className="px-3 py-2 text-left font-medium">Tier</th>
              <th className="px-3 py-2 text-right font-medium">Total Cost</th>
              <th className="px-3 py-2 text-right font-medium">Total Profit</th>
              <th className="px-3 py-2 text-right font-medium">Required Top-up</th>
              <th className="px-3 py-2 text-right font-medium">Final Balance</th>
              <th className="px-3 py-2 text-right font-medium">Net Gain</th>
              <th className="px-3 py-2 text-center font-medium">Status</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">No AAA assignments.</td></tr>
            )}
            {filtered.map((a: any) => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/20">
                <td className="px-3 py-2 font-mono text-[10px]">{String(a.id).slice(0, 8)}…</td>
                <td className="px-3 py-2">{getUserName(a.user_id)}</td>
                <td className="px-3 py-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {a.profile?.vip_level || "—"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(a.totalCost)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-green-500 font-medium">
                  +{fmt(a.totalProfit)}
                </td>
                <td className={`px-3 py-2 text-right tabular-nums font-medium ${a.requiredTopup > 0 ? "text-red-500" : "text-muted-foreground"}`}>
                  {a.requiredTopup > 0 ? fmt(a.requiredTopup) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-bold">
                  {fmt(a.finalBalance)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-green-500">
                  +{fmt(a.netGain)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                    a.status === "active" ? "bg-green-500/15 text-green-500" :
                    a.status === "used" ? "bg-blue-500/15 text-blue-500" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {a.status === "used" ? "completed" : a.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setDetailId(a.id)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      className="h-7 px-2"
                      disabled={a.isCompleted}
                      onClick={() => startEdit(a)}
                      title={a.isCompleted ? "Cannot edit completed" : "Edit"}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      className="h-7 px-2 text-destructive"
                      disabled={a.isDisabled || a.isCompleted}
                      onClick={() => setDisableId(a.id)}
                      title={a.isDisabled ? "Already disabled" : "Disable"}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assignment Detail</DialogTitle>
            <DialogDescription>
              {detail && (
                <>
                  {getUserName(detail.user_id)} · Set {detail.set_number} · Position {detail.task_position}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="space-y-4">
              {/* Car breakdown */}
              <div>
                <p className="text-xs font-medium mb-2">Car Breakdown</p>
                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Car</th>
                        <th className="px-3 py-2 text-right font-medium">Price</th>
                        <th className="px-3 py-2 text-right font-medium">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.car_names || []).map((name: string, i: number) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-3 py-2">{name}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(Number(detail.carPrices[i] || 0))}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-green-500">
                            +{fmt(Number(detail.carCommissions[i] || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="rounded bg-muted/40 p-3">
                  <p className="text-[10px] text-muted-foreground">Total Cost</p>
                  <p className="text-sm font-semibold tabular-nums">{fmt(detail.totalCost)} USDC</p>
                </div>
                <div className="rounded bg-muted/40 p-3">
                  <p className="text-[10px] text-muted-foreground">Raw Commission</p>
                  <p className="text-sm font-semibold tabular-nums">{fmt(detail.rawCommission)} USDC</p>
                </div>
                <div className="rounded bg-muted/40 p-3">
                  <p className="text-[10px] text-muted-foreground">Multiplier</p>
                  <p className="text-sm font-semibold tabular-nums">×{detail.multiplier}</p>
                </div>
                <div className="rounded bg-green-500/10 border border-green-500/30 p-3">
                  <p className="text-[10px] text-muted-foreground">Total Profit</p>
                  <p className="text-sm font-semibold tabular-nums text-green-500">+{fmt(detail.totalProfit)} USDC</p>
                </div>
                <div className={`rounded border p-3 ${detail.requiredTopup > 0 ? "bg-red-500/10 border-red-500/30" : "bg-muted/40 border-transparent"}`}>
                  <p className="text-[10px] text-muted-foreground">Negative / Top-up</p>
                  <p className={`text-sm font-semibold tabular-nums ${detail.requiredTopup > 0 ? "text-red-500" : ""}`}>
                    {detail.requiredTopup > 0 ? `-${fmt(detail.requiredTopup)}` : "0.00"} USDC
                  </p>
                </div>
                <div className="rounded bg-primary/10 border border-primary/30 p-3">
                  <p className="text-[10px] text-muted-foreground">Final Balance (after completion)</p>
                  <p className="text-base font-bold tabular-nums">{fmt(detail.finalBalance)} USDC</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDetailId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={(o) => !o && cancelEdit()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Adjust car prices, commissions, and multiplier. Only allowed before completion.
            </DialogDescription>
          </DialogHeader>

          {editingAssignment && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Multiplier (×)</label>
                <Input
                  type="number" min={1} max={100} step={0.1}
                  value={editMultiplier}
                  onChange={(e) => setEditMultiplier(e.target.value)}
                  className="h-8 text-xs w-32"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Cars</p>
                {(editingAssignment.car_names || []).map((name: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 rounded p-2">
                    <span className="text-xs flex-1 truncate">{name}</span>
                    <Input
                      type="number" min={1}
                      value={editPrices[i] || ""}
                      onChange={(e) => {
                        const next = [...editPrices]; next[i] = e.target.value; setEditPrices(next);
                      }}
                      placeholder="Price"
                      className="h-7 text-xs w-24"
                    />
                    <Input
                      type="number" min={0}
                      value={editCommissions[i] || ""}
                      onChange={(e) => {
                        const next = [...editCommissions]; next[i] = e.target.value; setEditCommissions(next);
                      }}
                      placeholder="Profit"
                      className="h-7 text-xs w-24"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={cancelEdit}>
              <X className="h-3.5 w-3.5 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={saveEdit} disabled={savingEdit}>
              <Save className="h-3.5 w-3.5 mr-1" /> {savingEdit ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable confirm */}
      <AlertDialog open={!!disableId} onOpenChange={(o) => !o && setDisableId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the assignment as disabled so it cannot be picked up. Existing pending records are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisable} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAAASummaryTab;
