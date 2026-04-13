import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ArrowLeft, TrendingUp } from "lucide-react";
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

const Transactions = () => {
  const { user } = useAuth();

  const { data: records, isLoading } = useQuery({
    queryKey: ["profits-history-full", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("task_records")
        .select("id, created_at, advertising_salary, car_name, total_amount")
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  const totalProfit = records?.reduce((sum, r) => sum + Number(r.advertising_salary), 0) ?? 0;

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/app/profile" className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <h1 className="text-lg font-semibold">Advertising Profits</h1>
        </div>

        {/* Summary card */}
        {records && records.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Earned</p>
                <p className="text-lg font-bold tabular-nums text-primary">
                  +{totalProfit.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">AC</span>
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{records.length} records</span>
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground py-12">Loading...</div>
        ) : !records || records.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No profits earned yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {records.map((r, i) => (
              <div
                key={r.id || i}
                className="rounded-xl border border-border bg-card px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 flex-shrink-0">
                    <DollarSign className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.car_name || "Advertising Profit"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatETDate(r.created_at)} ET
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="text-sm font-semibold tabular-nums text-primary">
                    +{Number(r.advertising_salary).toFixed(2)}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">AC</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Transactions;
