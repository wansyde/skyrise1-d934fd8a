import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState, useCallback, useMemo } from "react";
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

interface FlatRecord {
  id: string;
  parentId: string;
  created_at: string;
  task_type: string;
  car_name: string;
  car_price: number;
  commission: number;
  status: "completed" | "pending";
  car_status: string;
  assignment_code: string;
  // For regular tasks
  total_amount: number;
  advertising_salary: number;
}

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

  // Flatten AAA records into per-car entries
  const flatRecords: FlatRecord[] = useMemo(() => {
    const result: FlatRecord[] = [];
    for (const record of records) {
      if (record.task_type === "AAA" && record.car_prices?.length > 0) {
        const carNames = record.car_name.split(', ');
        for (let i = 0; i < carNames.length; i++) {
          result.push({
            id: `${record.id}-car-${i}`,
            parentId: record.id,
            created_at: record.created_at,
            task_type: "AAA",
            car_name: carNames[i],
            car_price: record.car_prices[i] ?? 0,
            commission: record.car_commissions?.[i] ?? 0,
            status: record.status as "completed" | "pending",
            car_status: record.car_statuses?.[i] ?? "pending_insufficient",
            assignment_code: record.assignment_code,
            total_amount: record.car_prices[i] ?? 0,
            advertising_salary: record.car_commissions?.[i] ?? 0,
          });
        }
      } else {
        result.push({
          id: record.id,
          parentId: record.id,
          created_at: record.created_at,
          task_type: record.task_type,
          car_name: record.car_name,
          car_price: Number(record.total_amount),
          commission: Number(record.advertising_salary),
          status: record.status as "completed" | "pending",
          car_status: record.status === "completed" ? "completed_partial" : "pending_insufficient",
          assignment_code: record.assignment_code,
          total_amount: Number(record.total_amount),
          advertising_salary: Number(record.advertising_salary),
        });
      }
    }
    return result;
  }, [records]);

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


  const filtered = flatRecords.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") {
      if (r.task_type === "AAA") return r.car_status === "pending_insufficient";
      return r.status === "pending";
    }
    if (r.task_type === "AAA") return r.car_status === "completed_partial";
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
            const isGreen = record.car_status === "completed_partial";
            const isRed = record.car_status === "pending_insufficient";
            const mult = isAAA ? Math.max(multipliers[record.assignment_code] ?? 1, 1) : 1;

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.25 }}
              >
                <div className={`rounded-xl border p-3 shadow-sm ${
                  isAAA
                    ? isGreen
                      ? "bg-gradient-to-br from-card to-emerald-50/30 border-emerald-200/50"
                      : isRed
                        ? "bg-gradient-to-br from-card to-red-50/30 border-red-200/50"
                        : "bg-gradient-to-br from-card to-amber-50/30 border-amber-200/50"
                    : "bg-card border-border/50"
                }`}>
                  {/* Header */}
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
                    {isAAA ? (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isGreen ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}>
                        {isGreen ? (
                          <><CheckCircle2 className="h-3 w-3" /> Completed</>
                        ) : (
                          <><XCircle className="h-3 w-3" /> Pending</>
                        )}
                      </span>
                    ) : (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        record.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {record.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    )}
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
                          <p className="text-[9px] text-muted-foreground">Total Amount</p>
                          <p className="text-xs font-bold text-primary">
                            {record.car_price.toFixed(0)} <span className="text-[9px] font-normal text-muted-foreground">AC</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">Advertising Salary</p>
                          <p className={`text-xs font-bold ${isGreen || record.status === "completed" ? "text-emerald-600" : "text-muted-foreground"}`}>
                            +{(isAAA ? record.commission * mult : record.commission).toFixed(2)} <span className="text-[9px] font-normal text-muted-foreground">AC</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit button for each pending AAA car */}
                  {isAAA && isRed && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <button
                        onClick={() => {
                          if (userBalance < 0) {
                            toast.error("Insufficient balance. Please make a deposit to continue.");
                            return;
                          }
                          handleSubmitPending(record.parentId);
                        }}
                        disabled={submittingId === record.parentId}
                        className="w-full py-2 rounded-lg font-semibold text-[11px] tracking-wide flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                      >
                        {submittingId === record.parentId ? (
                          <><Loader2 className="h-3 w-3 animate-spin" /> Processing...</>
                        ) : (
                          "Submit"
                        )}
                      </button>
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

export default Records;
