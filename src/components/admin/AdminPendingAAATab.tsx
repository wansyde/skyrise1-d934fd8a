import { useState, useMemo } from "react";
import MiniCalculator from "./MiniCalculator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, AlertTriangle, ArrowUpDown, DollarSign, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type SortMode = "deficit_desc" | "oldest" | "highest_value";

interface Props {
  profiles: any[];
}

const AdminPendingAAATab = ({ profiles }: Props) => {
  const queryClient = useQueryClient();
  const [sortMode, setSortMode] = useState<SortMode>("deficit_desc");
  const [search, setSearch] = useState("");
  const [depositUserId, setDepositUserId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);

  const { data: pendingRecords, isLoading } = useQuery({
    queryKey: ["admin-pending-aaa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_records")
        .select("*")
        .eq("status", "pending")
        .eq("task_type", "AAA")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000,
  });

  const { data: assignments } = useQuery({
    queryKey: ["admin-aaa-assignments-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase.from("aaa_assignments").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const enrichedRecords = useMemo(() => {
    if (!pendingRecords) return [];

    return pendingRecords.map((rec: any) => {
      const profile = profiles.find((p: any) => p.user_id === rec.user_id);
      const assignment = (assignments || []).find((a: any) => a.id === rec.assignment_code);
      const balance = Number(profile?.balance ?? 0);
      const escrow = Number(profile?.escrow_balance ?? 0);
      const multiplier = assignment?.commission_multiplier ?? 1;

      const carPrices: number[] = rec.car_prices || [];
      const carStatuses: string[] = rec.car_statuses || [];
      const carCommissions: number[] = rec.car_commissions || [];
      const carNames: string[] = assignment?.car_names || [];

      const totalCars = carPrices.length;
      const completedCars = carStatuses.filter((s: string) => s === "completed_partial").length;
      const remainingCars = totalCars - completedCars;

      const remainingCost = carPrices.reduce((sum: number, price: number, i: number) => {
        return carStatuses[i] === "pending_insufficient" ? sum + price : sum;
      }, 0);

      // Required deposit = absolute value of negative balance only
      const deficit = balance < 0 ? Math.abs(balance) : 0;

      const totalRawCommission = carCommissions.reduce((s: number, c: number) => s + c, 0);
      const finalCommission = totalRawCommission * multiplier;

      return {
        ...rec,
        profile,
        assignment,
        balance,
        escrow,
        multiplier,
        carNames,
        totalCars,
        completedCars,
        remainingCars,
        remainingCost,
        deficit,
        totalRawCommission,
        finalCommission,
      };
    });
  }, [pendingRecords, profiles, assignments]);

  const filtered = useMemo(() => {
    let items = enrichedRecords;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((r: any) =>
        (r.profile?.username || "").toLowerCase().includes(q) ||
        (r.profile?.email || "").toLowerCase().includes(q)
      );
    }
    items.sort((a: any, b: any) => {
      switch (sortMode) {
        case "deficit_desc": return b.deficit - a.deficit;
        case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "highest_value": return b.finalCommission - a.finalCommission;
        default: return 0;
      }
    });
    return items;
  }, [enrichedRecords, search, sortMode]);

  const handleQuickDeposit = async (userId: string) => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount."); return; }
    setDepositing(true);
    try {
      const { data, error } = await supabase.rpc("admin_deposit", {
        _user_id: userId, _amount: amt, _note: "Quick deposit for AAA completion",
      } as any);
      if (error) throw error;
      const result = data as any;
      if (result?.error) { toast.error(result.error); return; }
      toast.success(`Deposited ${amt.toLocaleString()} USDC successfully.`);
      setDepositUserId(null);
      setDepositAmount("");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-aaa"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to deposit.");
    } finally {
      setDepositing(false);
    }
  };

  const handleDeletePending = async (recordId: string, userId: string) => {
    if (!confirm("Delete this pending AAA record? This cannot be undone.")) return;
    try {
      // Delete the task record
      const { error } = await supabase.from("task_records").delete().eq("id", recordId);
      if (error) throw error;
      toast.success("Pending AAA record deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-aaa"] });
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete.");
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "short", timeStyle: "short" });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground text-sm">Loading pending AAA assignments...</div>;
  }

  if (!filtered.length) {
    return (
      <div className="text-center py-12">
        <Check className="h-8 w-8 text-green-400 mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">No pending AAA assignments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Pending AAA Assignments ({filtered.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Users with incomplete AAA tasks requiring deposits</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs w-40"
          />
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="h-8 rounded border border-border bg-background px-2 text-xs"
          >
            <option value="deficit_desc">Highest Deficit</option>
            <option value="oldest">Oldest Pending</option>
            <option value="highest_value">Highest Value</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        {filtered.map((rec: any) => (
          <div key={rec.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
            {/* User header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{rec.profile?.username || rec.profile?.email || rec.user_id.slice(0, 8)}</span>
                <span className="text-xs text-muted-foreground ml-2">Set {rec.assignment?.set_number ?? "?"} · Pos {rec.assignment?.task_position ?? "?"}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{formatTime(rec.created_at)}</span>
            </div>

            {/* Financial summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded bg-muted/50 p-2">
                <span className="text-[10px] text-muted-foreground block">Balance</span>
                <span className={`text-sm font-semibold tabular-nums ${rec.balance < 0 ? "text-red-400" : ""}`}>
                  {rec.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
              </div>
              <div className="rounded bg-muted/50 p-2">
                <span className="text-[10px] text-muted-foreground block">Required Deposit</span>
                <span className={`text-sm font-semibold tabular-nums ${rec.deficit > 0 ? "text-red-400" : "text-green-400"}`}>
                  {rec.deficit > 0 ? `${rec.deficit.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC` : "0.00 USDC"}
                </span>
              </div>
              <div className="rounded bg-muted/50 p-2">
                <span className="text-[10px] text-muted-foreground block">Remaining Cars Cost</span>
                <span className="text-sm font-semibold tabular-nums">
                  {rec.remainingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
              </div>
              <div className="rounded bg-muted/50 p-2">
                <span className="text-[10px] text-muted-foreground block">Pending Earnings</span>
                <span className="text-sm font-semibold tabular-nums text-amber-400">
                  {rec.escrow.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
              </div>
            </div>

            {/* Car progress */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-muted-foreground">Cars: {rec.completedCars}/{rec.totalCars} completed</span>
                <span className="text-[10px] text-muted-foreground">· AAA Multiplier: ×{rec.multiplier}</span>
                <span className="text-[10px] text-muted-foreground">· Final Commission: {rec.finalCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {(rec.car_prices as number[]).map((price: number, i: number) => {
                  const status = (rec.car_statuses as string[])[i];
                  const commission = (rec.car_commissions as number[])[i] || 0;
                  const name = rec.carNames[i] || `Car ${i + 1}`;
                  const isCompleted = status === "completed_partial";
                  return (
                    <div
                      key={i}
                      className={`rounded px-2 py-1.5 text-[10px] border ${
                        isCompleted
                          ? "border-green-500/30 bg-green-500/10"
                          : "border-red-500/30 bg-red-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        {isCompleted ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <X className="h-3 w-3 text-red-400" />
                        )}
                        <span className="font-medium truncate">{name}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {price.toLocaleString()} USDC · +{commission.toLocaleString()} USDC
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-border/50">
              {depositUserId === rec.user_id ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="h-7 text-xs w-28"
                  />
                  <Button size="sm" className="h-7 text-xs" onClick={() => handleQuickDeposit(rec.user_id)} disabled={depositing}>
                    {depositing ? "..." : "Confirm"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setDepositUserId(null); setDepositAmount(""); }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => { setDepositUserId(rec.user_id); setDepositAmount(rec.deficit > 0 ? String(rec.deficit) : ""); }}
                  >
                    <DollarSign className="h-3 w-3" /> Adjust Balance
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleDeletePending(rec.id, rec.user_id)}
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <MiniCalculator />
    </div>
  );
};

export default AdminPendingAAATab;
