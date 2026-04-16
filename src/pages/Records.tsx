import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Car, Loader2, CheckCircle2, XCircle } from "lucide-react";
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

interface FlatCard {
  id: string;
  parentRecordId: string;
  created_at: string;
  car_name: string;
  total_amount: number;
  advertising_salary: number;
  status: "completed" | "pending";
  assignment_code: string;
  isAAA: boolean;
  carIndex?: number;
  carStatus?: string;
  commissionMultiplier?: number;
}

const Records = () => {
  const { user, refreshProfile, profile } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as any)?.tab === "pending" ? "pending" : "completed";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const userBalance = Number(profile?.balance ?? 0);

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
        .select("id, commission_multiplier")
        .in("id", aaaAssignmentIds);
      const map: Record<string, number> = {};
      (data ?? []).forEach((a: any) => {
        map[a.id] = a.commission_multiplier ?? 1;
      });
      return map;
    },
  });

  // Build flat card list
  const flatCards: FlatCard[] = useMemo(() => {
    const cards: FlatCard[] = [];
    for (const record of records) {
      if (record.task_type === "AAA" && record.car_prices?.length > 0) {
        const carNames = record.car_name.split(', ');
        const mult = Math.max(aaaDetails[record.assignment_code] ?? 1, 1);

        // Build car entries, sort pending first
        const carEntries = carNames.map((name: string, i: number) => ({
          name,
          price: record.car_prices[i] ?? 0,
          commission: record.car_commissions?.[i] ?? 0,
          carStatus: record.car_statuses?.[i] ?? "pending_insufficient",
          index: i,
        }));

        carEntries.sort((a, b) => {
          const aP = a.carStatus === "pending_insufficient" ? 0 : 1;
          const bP = b.carStatus === "pending_insufficient" ? 0 : 1;
          return aP - bP;
        });

        // If parent record is still pending, ALL cars (promoted + unpromoted) belong in Pending tab.
        // Only when the parent record is fully completed do they move to Completed tab.
        const parentPending = record.status === "pending";
        for (const car of carEntries) {
          cards.push({
            id: `${record.id}-car-${car.index}`,
            parentRecordId: record.id,
            created_at: record.created_at,
            car_name: car.name,
            total_amount: car.price,
            advertising_salary: car.commission * mult,
            status: parentPending ? "pending" : "completed",
            assignment_code: record.assignment_code,
            isAAA: true,
            carIndex: car.index,
            carStatus: car.carStatus,
            commissionMultiplier: mult,
          });
        }
      } else {
        cards.push({
          id: record.id,
          parentRecordId: record.id,
          created_at: record.created_at,
          car_name: record.car_name,
          total_amount: Number(record.total_amount),
          advertising_salary: Number(record.advertising_salary),
          status: record.status as "completed" | "pending",
          assignment_code: record.assignment_code,
          isAAA: false,
        });
      }
    }
    return cards;
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

  const filtered = flatCards.filter((card) =>
    activeTab === "pending" ? card.status === "pending" : card.status === "completed"
  );

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

        <div className="space-y-3">
          {(() => {
            // Track which parent records have already shown a Submit button in the pending tab
            const submitShownForRecord = new Set<string>();
            return filtered.map((card, i) => {
            const isPending = card.status === "pending";
            const isAAAred = card.isAAA && card.carStatus === "pending_insufficient";
            const isAAAgreen = card.isAAA && card.carStatus === "completed_partial";
            const isSubmitting = submittingId === card.parentRecordId;
            // Only show Submit on the FIRST promoted card per parent record, and only in Pending tab
            let showSubmit = false;
            if (activeTab === "pending" && isAAAgreen && isPending && !submitShownForRecord.has(card.parentRecordId)) {
              showSubmit = true;
              submitShownForRecord.add(card.parentRecordId);
            }

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.25 }}
              >
                <div
                  className="rounded-xl border bg-card border-border/50 p-3 shadow-sm"
                  onClick={() => {
                    if (isAAAred && userBalance < 0) {
                      toast("Deposit Required", {
                        description: "Top up your balance to continue this assignment",
                        duration: 3000,
                      });
                      navigate("/app/wallet/deposit");
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(card.created_at), "yyyy-MM-dd HH:mm")}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-0.5 ${
                      isPending
                        ? (isAAAred ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {isAAAred && <><XCircle className="h-2.5 w-2.5" /> Pending</>}
                      {isAAAgreen && <><CheckCircle2 className="h-2.5 w-2.5" /> Promoted</>}
                      {!card.isAAA && (isPending ? "Pending" : "Completed")}
                    </span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <CarImage carName={card.car_name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug line-clamp-1 mb-1.5">{card.car_name}</p>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[9px] text-muted-foreground">Total Amount</p>
                          <p className="text-xs font-bold text-primary">
                            {card.total_amount.toFixed(0)} <span className="text-[9px] font-normal text-muted-foreground">USDC</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">Advertising Salary</p>
                          <p className={`text-xs font-bold ${
                            card.status === "completed" ? "text-emerald-600" : "text-muted-foreground"
                          }`}>
                            +{card.advertising_salary.toFixed(2)} <span className="text-[9px] font-normal text-muted-foreground">USDC</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {showSubmit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (userBalance < 0) {
                            toast("Insufficient balance", {
                              description: "Please deposit to continue.",
                              duration: 3000,
                            });
                            navigate("/app/wallet/deposit");
                            return;
                          }
                          handleSubmitPending(card.parentRecordId);
                        }}
                        disabled={isSubmitting || userBalance < 0}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full font-semibold text-[10px] transition-all ${
                          userBalance >= 0
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                        } disabled:opacity-50`}
                      >
                        {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
            });
          })()}
        </div>
      </div>
    </AppLayout>
  );
};

export default Records;
