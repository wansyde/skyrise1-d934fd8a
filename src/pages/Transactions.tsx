import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";

const formatETDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

interface ProfitRecord {
  id: string;
  created_at: string;
  advertising_salary: number;
  car_name: string;
  total_amount: number;
  type: "task" | "referral";
  description?: string;
}

const Transactions = () => {
  const { user } = useAuth();

  const { data: records, isLoading } = useQuery({
    queryKey: ["profits-history-full", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [tasksRes, referralsRes] = await Promise.all([
        supabase
          .from("task_records")
          .select("id, created_at, advertising_salary, car_name, total_amount")
          .eq("user_id", user!.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("transactions")
          .select("id, created_at, amount, description")
          .eq("user_id", user!.id)
          .eq("type", "referral_bonus")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      const tasks: ProfitRecord[] = (tasksRes.data || []).map((r) => ({
        ...r,
        type: "task" as const,
      }));

      const referrals: ProfitRecord[] = (referralsRes.data || []).map((r) => ({
        id: r.id,
        created_at: r.created_at,
        advertising_salary: Number(r.amount),
        car_name: r.description || "Referral Bonus",
        total_amount: 0,
        type: "referral" as const,
        description: r.description || "",
      }));

      return [...tasks, ...referrals].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/app/profile" className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <h1 className="text-lg font-semibold">Advertising Profits</h1>
        </div>

        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground py-12">Loading...</div>
        ) : !records || records.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No profits earned yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {records.map((r, i) => {
              const isReferral = r.type === "referral";
              return (
                <div
                  key={r.id || i}
                  className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                    isReferral
                      ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex items-center justify-center h-9 w-9 rounded-full flex-shrink-0 ${
                      isReferral
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-primary/10"
                    }`}>
                      {isReferral ? (
                        <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                      ) : (
                        <DollarSign className="h-4 w-4 text-primary" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {isReferral ? "Referral Bonus" : r.car_name || "Advertising Profit"}
                        </p>
                        {isReferral && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-200 text-amber-800 dark:bg-amber-800/50 dark:text-amber-300 flex-shrink-0">
                            Referral
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatETDate(r.created_at)} ET
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className={`text-sm font-semibold tabular-nums ${
                      isReferral ? "text-amber-600 dark:text-amber-400" : "text-success"
                    }`}>
                      +{Math.abs(Number(r.advertising_salary)).toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">USDC</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Transactions;
