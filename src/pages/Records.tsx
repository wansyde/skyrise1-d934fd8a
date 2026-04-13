import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState, useCallback } from "react";
import { Car, Star, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { getCarImage } from "@/lib/car-images";
import { toast } from "sonner";

const FALLBACK_CAR = "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop&q=80";

const CarImage = ({ carName }: { carName: string }) => {
  const resolvedSrc = getCarImage(carName);
  const [imgSrc, setImgSrc] = useState(resolvedSrc);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const handleError = useCallback(() => {
    if (!errored) {
      setErrored(true);
      setImgSrc(FALLBACK_CAR);
    }
  }, [errored]);

  return (
    <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden relative">
      {!loaded && !errored && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Car className="h-5 w-5 text-muted-foreground/30" strokeWidth={1.5} />
        </div>
      )}
      <img
        src={imgSrc}
        alt={carName}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

type TabKey = "all" | "pending" | "completed";

const Records = () => {
  const { user, refreshProfile, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const userBalance = Number(profile?.balance ?? 0);

  const { data: records = [] } = useQuery({
    queryKey: ["task-records", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("task_records")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  // Fetch multipliers for AAA records
  const aaaAssignmentIds = records
    .filter(r => r.task_type === "AAA" && r.assignment_code)
    .map(r => r.assignment_code);

  const { data: multipliers = {} } = useQuery({
    queryKey: ["aaa-multipliers", aaaAssignmentIds],
    enabled: aaaAssignmentIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("aaa_assignments")
        .select("id, commission_multiplier")
        .in("id", aaaAssignmentIds);
      const map: Record<string, number> = {};
      (data ?? []).forEach((a: any) => { map[a.id] = a.commission_multiplier ?? 1; });
      return map;
    },
  });

  const handleSubmitPending = async (recordId: string) => {
    setSubmittingId(recordId);
    try {
      const { data, error } = await supabase.rpc("submit_pending_task" as any, {
        _record_id: recordId,
      });
      if (error) throw error;
      const result = data as any;
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      if (result.all_completed) {
        toast.success("All cars completed! Escrow released to your balance.");
      } else {
        toast.info("Some cars completed. Deposit more funds to finish the remaining cars.");
      }
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["task-records"] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit task");
    } finally {
      setSubmittingId(null);
    }
  };

  const filtered = records.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return r.status === "pending";
    return r.status === "completed";
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <AppLayout>
      <div className="px-4 py-5 min-h-screen">
        {/* Tabs */}
        <div className="flex border-b border-border/50 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 pb-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="records-tab-indicator"
                  className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">No records yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((record, i) => {
            const isAAA = record.task_type === "AAA";
            const isPending = record.status === "pending";
            const carStatuses: string[] = record.car_statuses || [];
            const carCommissions: number[] = record.car_commissions || [];
            const hasRedCars = carStatuses.some(s => s === "pending_insufficient");
            const allGreen = carStatuses.length > 0 && carStatuses.every(s => s === "completed_partial");

            // Calculate multiplier & final earnings for AAA
            const mult = isAAA ? Math.max(multipliers[record.assignment_code] ?? 1, 1) : 1;
            const rawCommission = carCommissions.reduce((s, c) => s + (c ?? 0), 0);
            const finalEarnings = isAAA ? +(rawCommission * mult).toFixed(2) : Number(record.advertising_salary);

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.25 }}
              >
                {/* Card */}
                <div className={`rounded-xl border p-3 shadow-sm ${
                  isAAA ? "bg-gradient-to-br from-card to-amber-50/30 border-amber-200/50" : "bg-card border-border/50"
                }`}>
                  {/* Header row: date + status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(record.created_at), "yyyy-MM-dd HH:mm")}
                      </span>
                      {isAAA && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                          <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          AAA
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        record.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {record.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </div>

                  {/* Main content */}
                  <div className="flex gap-3">
                    <CarImage carName={record.car_name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug line-clamp-1 mb-1.5">
                        {record.car_name}
                      </p>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[9px] text-muted-foreground">Amount</p>
                          <p className="text-xs font-bold text-primary">
                            {Number(record.total_amount)} <span className="text-[9px] font-normal text-muted-foreground">AC</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">
                            {isAAA ? "Final Earnings" : "Salary"}
                          </p>
                          <p className="text-xs font-bold text-emerald-600">
                            +{finalEarnings.toFixed(2)} <span className="text-[9px] font-normal text-muted-foreground">AC</span>
                          </p>
                        </div>
                        {isAAA && mult > 1 && (
                          <div>
                            <p className="text-[9px] text-muted-foreground">AAA Multiplier</p>
                            <p className="text-xs font-bold text-amber-600">×{mult}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AAA Per-Car Breakdown — compact */}
                  {isAAA && record.car_prices?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <div className="space-y-1">
                        {record.car_name.split(', ').map((carName: string, ci: number) => {
                          const status = carStatuses[ci];
                          const isGreen = status === "completed_partial";
                          const isRed = status === "pending_insufficient";
                          const commission = carCommissions[ci] ?? 0;

                          return (
                            <div key={ci} className={`flex items-center justify-between text-[11px] rounded-md px-2 py-1.5 ${
                              isGreen ? "bg-emerald-50 border border-emerald-200/50" :
                              isRed ? "bg-red-50 border border-red-200/50" :
                              "bg-muted/20"
                            }`}>
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                {isGreen && <CheckCircle2 className="h-3 w-3 text-emerald-600 flex-shrink-0" />}
                                {isRed && <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />}
                                <span className="truncate font-medium">{carName}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-1">
                                <span className="font-bold text-primary">
                                  {record.car_prices?.[ci] != null ? Number(record.car_prices[ci]).toFixed(0) : '—'}
                                </span>
                                {commission > 0 && (
                                  <span className="text-[9px] font-semibold text-emerald-600">+{commission.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Earnings summary — always visible */}
                      <div className="mt-1.5 pt-1.5 border-t border-border/20 space-y-0.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Raw Commission</span>
                          <span className="font-semibold">{rawCommission.toFixed(2)} AC</span>
                        </div>
                        {mult > 1 && (
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">AAA Multiplier</span>
                            <span className="font-semibold text-amber-600">×{mult}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-foreground">Final Earnings</span>
                          <span className="font-bold text-emerald-600">+{finalEarnings.toFixed(2)} AC</span>
                        </div>
                      </div>
                      {isPending && (
                        <div className="mt-1 space-y-0.5">
                          {greenCount(carStatuses) > 0 && (
                            <p className="text-[9px] text-emerald-600 font-medium">
                              ✓ {greenCount(carStatuses)} car(s) completed — held in escrow
                            </p>
                          )}
                          {hasRedCars && (
                            <p className="text-[9px] text-destructive font-medium">
                              ✗ {carStatuses.filter(s => s === "pending_insufficient").length} car(s) pending — insufficient balance
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit button for pending AAA tasks */}
                  {isPending && isAAA && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      {hasRedCars && userBalance <= 0 ? (
                        <p className="text-[10px] text-destructive font-medium">
                          Insufficient balance. Deposit funds to complete remaining cars.
                        </p>
                      ) : hasRedCars ? (
                        <button
                          onClick={() => handleSubmitPending(record.id)}
                          disabled={submittingId === record.id}
                          className="w-full py-2 rounded-lg font-semibold text-[11px] tracking-wide flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                        >
                          {submittingId === record.id ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Processing...</>
                          ) : (
                            "Complete Remaining Cars"
                          )}
                        </button>
                      ) : allGreen ? (
                        <button
                          onClick={() => handleSubmitPending(record.id)}
                          disabled={submittingId === record.id}
                          className="w-full py-2 rounded-lg font-semibold text-[11px] tracking-wide flex items-center justify-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all"
                        >
                          {submittingId === record.id ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Releasing...</>
                          ) : (
                            "Release Escrow & Complete"
                          )}
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

function greenCount(statuses: string[]): number {
  return statuses.filter(s => s === "completed_partial").length;
}

export default Records;
