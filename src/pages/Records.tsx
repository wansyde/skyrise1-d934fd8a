import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState, useCallback } from "react";
import { Car, Star, Loader2 } from "lucide-react";
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
    <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-muted/30 flex items-center justify-center overflow-hidden relative">
      {!loaded && !errored && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Car className="h-6 w-6 text-muted-foreground/30" strokeWidth={1.5} />
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
      toast.success("Task completed successfully!");
      refreshProfile();
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
        <div className="flex border-b border-border/50 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
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

        {/* Records List */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">No records yet.</p>
          </div>
        )}

        <div className="space-y-6">
          {filtered.map((record, i) => {
            const isAAA = (record as any).task_type === "AAA";
            const isPending = record.status === "pending";

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                {/* Date & Status header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(record.created_at), "yyyy-MM-dd HH:mm:ss")}
                    </span>
                    {isAAA && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        AAA
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-3 py-1 rounded-md ${
                      record.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {record.status === "completed" ? "Completed" : "Pending"}
                  </span>
                </div>

                {/* Card */}
                <div className={`rounded-2xl border p-4 shadow-sm ${
                  isAAA ? "bg-gradient-to-br from-card to-amber-50/30 border-amber-200/50" : "bg-card border-border/50"
                }`}>
                  <div className="flex gap-4">
                    <CarImage carName={record.car_name} />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug line-clamp-2 mb-3">
                        {record.car_name}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-0.5">Total Amount</p>
                          <p className="text-sm font-bold text-primary">
                            {Number(record.total_amount)} <span className="text-[10px] font-normal text-muted-foreground">USDC</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-0.5">
                            {isAAA ? "AAA Profit" : "Advertising salary"}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {Number(record.advertising_salary).toFixed(2)} <span className="text-[10px] font-normal text-muted-foreground">USDC</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AAA Breakdown for pending tasks */}
                  {isPending && isAAA && (record as any).car_prices?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-2">Car Breakdown</p>
                      <div className="space-y-1.5">
                        {record.car_name.split(', ').map((carName: string, ci: number) => (
                          <div key={ci} className="flex items-center justify-between text-xs bg-muted/20 rounded-lg px-3 py-1.5">
                            <span className="truncate font-medium">{carName}</span>
                            <span className="font-bold text-primary ml-2">
                              {(record as any).car_prices?.[ci] != null ? Number((record as any).car_prices[ci]).toFixed(2) : '—'} USDC
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs mt-2 pt-2 border-t border-border/20">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold text-primary">{Number(record.total_amount).toFixed(2)} USDC</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Profit to earn</span>
                        <span className="font-bold text-emerald-600">+{Number(record.advertising_salary).toFixed(2)} USDC</span>
                      </div>
                    </div>
                  )}

                  {/* Submit button for pending AAA tasks */}
                  {isPending && isAAA && (
                    <div className="mt-4 pt-3 border-t border-border/30">
                      {userBalance < 0 ? (
                        <p className="text-[11px] text-destructive font-medium">
                          Insufficient balance. Please deposit to clear your negative balance before continuing.
                        </p>
                      ) : (
                        <>
                          <p className="text-[11px] text-muted-foreground mb-2">
                            Your balance is sufficient. Submit to complete and earn your profit.
                          </p>
                          <button
                            onClick={() => handleSubmitPending(record.id)}
                            disabled={submittingId === record.id}
                            className="w-full py-2.5 rounded-xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                            style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.3)" }}
                          >
                            {submittingId === record.id ? (
                              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...</>
                            ) : (
                              "Submit"
                            )}
                          </button>
                        </>
                      )}
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
