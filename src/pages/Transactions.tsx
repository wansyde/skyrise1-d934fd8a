import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Transactions = () => {
  const { user } = useAuth();

  const { data: records, isLoading } = useQuery({
    queryKey: ["profits-history-full", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("task_records")
        .select("created_at, advertising_salary")
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/app/profile" className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <h1 className="text-lg font-semibold">Transactions</h1>
        </div>

        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground py-12">Loading...</div>
        ) : !records || records.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No profits earned yet.
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-border bg-card">
            {records.map((r, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                    <DollarSign className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Advertising Profit</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums text-primary">+${Number(r.advertising_salary).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Transactions;
