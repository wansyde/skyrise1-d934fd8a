import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";

type TabKey = "all" | "pending" | "completed";

const Records = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("all");

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
          {filtered.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              {/* Date & Status header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(record.created_at), "yyyy-MM-dd HH:mm:ss")}
                </span>
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
              <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
                <div className="flex gap-4">
                  {/* Car Image */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-muted/30 flex items-center justify-center overflow-hidden">
                    {record.car_image_url ? (
                      <img
                        src={record.car_image_url}
                        alt={record.car_name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-lg" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug line-clamp-2 mb-3">
                      {record.car_name}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">Total Amount</p>
                        <p className="text-sm font-bold text-primary">
                          {Number(record.total_amount)} <span className="text-[10px] font-normal text-muted-foreground">AC</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">Advertising salary</p>
                        <p className="text-sm font-bold text-primary">
                          {Number(record.advertising_salary).toFixed(2)} <span className="text-[10px] font-normal text-muted-foreground">AC</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Records;
