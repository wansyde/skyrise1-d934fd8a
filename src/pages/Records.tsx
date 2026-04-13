import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

type TabKey = "completed" | "pending";

interface CarEntry {
  car_name: string;
  car_price: number;
  commission: number;
  car_status: string;
  index: number;
}

interface AAAGroup {
  type: "aaa";
  parentId: string;
  assignment_code: string;
  created_at: string;
  status: "completed" | "pending";
  cars: CarEntry[];
  set_number?: number;
  task_position?: number;
}

interface RegularRecord {
  type: "regular";
  id: string;
  created_at: string;
  car_name: string;
  total_amount: number;
  advertising_salary: number;
  status: "completed" | "pending";
  assignment_code: string;
}

type DisplayItem = AAAGroup | RegularRecord;

const Records = () => {
  const { user, refreshProfile, profile } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as any)?.tab === "pending" ? "pending" : "completed";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const userBalance = Number(profile?.balance ?? 0);

  // Real-time profile subscription for live balance updates
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('records-profile-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` },
        () => {
          refreshProfile();
          queryClient.invalidateQueries({ queryKey: ["task-records"] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, refreshProfile, queryClient]);

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

  const { data: aaaDetails = {} } = useQuery({
    queryKey: ["aaa-details", aaaAssignmentIds],
    enabled: aaaAssignmentIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("aaa_assignments")
        .select("id, commission_multiplier, set_number, task_position")
        .in("id", aaaAssignmentIds);
      const map: Record<string, { multiplier: number; set_number: number; task_position: number }> = {};
      (data ?? []).forEach((a: any) => {
        map[a.id] = {
          multiplier: a.commission_multiplier ?? 1,
          set_number: a.set_number ?? 0,
          task_position: a.task_position ?? 0,
        };
      });
      return map;
    },
  });

  // Build grouped display items
  const displayItems: DisplayItem[] = useMemo(() => {
    const items: DisplayItem[] = [];
    for (const record of records) {
      if (record.task_type === "AAA" && record.car_prices?.length > 0) {
        const carNames = record.car_name.split(', ');
        const cars: CarEntry[] = carNames.map((name: string, i: number) => ({
          car_name: name,
          car_price: record.car_prices[i] ?? 0,
          commission: record.car_commissions?.[i] ?? 0,
          car_status: record.car_statuses?.[i] ?? "pending_insufficient",
          index: i,
        }));
        // Sort: pending first, completed second
        cars.sort((a, b) => {
          const aP = a.car_status === "pending_insufficient" ? 0 : 1;
          const bP = b.car_status === "pending_insufficient" ? 0 : 1;
          return aP - bP;
        });
        const detail = aaaDetails[record.assignment_code];
        items.push({
          type: "aaa",
          parentId: record.id,
          assignment_code: record.assignment_code,
          created_at: record.created_at,
          status: record.status as "completed" | "pending",
          cars,
          set_number: detail?.set_number,
          task_position: detail?.task_position,
        });
      } else {
        items.push({
          type: "regular",
          id: record.id,
          created_at: record.created_at,
          car_name: record.car_name,
          total_amount: Number(record.total_amount),
          advertising_salary: Number(record.advertising_salary),
          status: record.status as "completed" | "pending",
          assignment_code: record.assignment_code,
        });
      }
    }
    return items;
  }, [records, aaaDetails]);

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
        toast.info("One car promoted. Submit the remaining cars to finish this assignment.");
      }
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["task-records"] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit task");
    } finally {
      setSubmittingId(null);
    }
  };

  const filtered = displayItems.filter((item) => {
    return activeTab === "pending" ? item.status === "pending" : item.status === "completed";
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: "completed", label: "Completed" },
    { key: "pending", label: "Pending" },
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
            <p className="text-sm text-muted-foreground">
              {activeTab === "pending" ? "No pending tasks" : "No completed tasks"}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((item, i) => {
            if (item.type === "aaa") {
              const mult = Math.max(aaaDetails[item.assignment_code]?.multiplier ?? 1, 1);
              const canAfford = userBalance >= 0;
              const isSubmitting = submittingId === item.parentId;
              const pendingCount = item.cars.filter(c => c.car_status === "pending_insufficient").length;
              const completedCount = item.cars.filter(c => c.car_status === "completed_partial").length;

              return (
                <motion.div
                  key={item.parentId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-card to-amber-50/20 shadow-sm overflow-hidden"
                >
                  {/* AAA Group Header */}
                  <div className="px-4 py-2.5 border-b border-amber-200/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        AAA
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        Set {item.set_number ?? "?"} · Task {item.task_position ?? "?"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        {completedCount}/{item.cars.length} promoted
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(item.created_at), "MM/dd HH:mm")}
                      </span>
                    </div>
                  </div>

                  {/* Cars list */}
                  <div className="divide-y divide-border/30">
                    {item.cars.map((car) => {
                      const isGreen = car.car_status === "completed_partial";
                      const isRed = car.car_status === "pending_insufficient";
                      return (
                        <div
                          key={`${item.parentId}-car-${car.index}`}
                          className={`px-4 py-3 flex gap-3 items-center ${
                            isRed ? "bg-red-50/30" : isGreen ? "bg-emerald-50/20" : ""
                          }`}
                          onClick={() => {
                            if (isRed && userBalance < 0) {
                              toast("Deposit Required", {
                                description: "Top up your balance to continue this assignment",
                                duration: 3000,
                              });
                              navigate("/app/wallet/deposit");
                            }
                          }}
                        >
                          <CarImage carName={car.car_name} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-semibold leading-snug line-clamp-1">
                                {car.car_name}
                              </p>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                isGreen ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                              }`}>
                                {isGreen ? <><CheckCircle2 className="h-2.5 w-2.5" /> Promoted</> : <><XCircle className="h-2.5 w-2.5" /> Pending</>}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-[9px] text-muted-foreground">Total Amount</p>
                                <p className="text-xs font-bold text-primary">
                                  {car.car_price.toFixed(0)} <span className="text-[9px] font-normal text-muted-foreground">AC</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] text-muted-foreground">Advertising Salary</p>
                                <p className={`text-xs font-bold ${isGreen ? "text-emerald-600" : "text-muted-foreground"}`}>
                                  +{(car.commission * mult).toFixed(2)} <span className="text-[9px] font-normal text-muted-foreground">AC</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {isRed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!canAfford) {
                                  toast("Deposit Required", {
                                    description: "Top up your balance to continue this assignment",
                                    duration: 3000,
                                  });
                                  navigate("/app/wallet/deposit");
                                  return;
                                }
                                handleSubmitPending(item.parentId);
                              }}
                              disabled={isSubmitting || !canAfford}
                              className={`flex-shrink-0 px-3 py-1.5 rounded-full font-semibold text-[10px] transition-all ${
                                canAfford
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                              } disabled:opacity-50`}
                            >
                              {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            }

            // Regular record
            const reg = item as RegularRecord;
            return (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.25 }}
              >
                <div className="rounded-xl border bg-card border-border/50 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(reg.created_at), "yyyy-MM-dd HH:mm")}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      reg.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {reg.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <CarImage carName={reg.car_name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug line-clamp-1 mb-1.5">{reg.car_name}</p>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[9px] text-muted-foreground">Total Amount</p>
                          <p className="text-xs font-bold text-primary">
                            {reg.total_amount.toFixed(0)} <span className="text-[9px] font-normal text-muted-foreground">AC</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">Advertising Salary</p>
                          <p className={`text-xs font-bold ${reg.status === "completed" ? "text-emerald-600" : "text-muted-foreground"}`}>
                            +{reg.advertising_salary.toFixed(2)} <span className="text-[9px] font-normal text-muted-foreground">AC</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
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
