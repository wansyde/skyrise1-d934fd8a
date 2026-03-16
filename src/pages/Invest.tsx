import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Invest = () => {
  const { user, profile } = useAuth();

  const { data: plans } = useQuery({
    queryKey: ["investment-plans"],
    queryFn: async () => {
      const { data } = await supabase
        .from("investment_plans")
        .select("*")
        .eq("is_active", true)
        .order("min_amount", { ascending: true });
      return data || [];
    },
  });

  const handleActivate = async (plan: any) => {
    if (!user) return;
    const balance = profile?.balance ?? 0;
    if (balance < plan.min_amount) {
      toast.error(`Insufficient balance. Minimum investment: $${plan.min_amount.toLocaleString()}`);
      return;
    }

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + plan.duration_days);

    const { error } = await supabase.from("user_investments").insert({
      user_id: user.id,
      plan_id: plan.id,
      amount: plan.min_amount,
      ends_at: endsAt.toISOString(),
    });

    if (error) {
      toast.error("Failed to activate plan: " + error.message);
    } else {
      // Deduct from balance
      await supabase
        .from("profiles")
        .update({ balance: balance - plan.min_amount })
        .eq("user_id", user.id);

      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "investment",
        amount: -plan.min_amount,
        status: "approved",
        description: `Invested in ${plan.name}`,
      });

      toast.success(`${plan.name} plan activated!`);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Investment Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a plan that fits your goals.</p>
        </div>

        <div className="flex flex-col gap-4">
          {(plans || []).map((plan, i) => {
            const featured = plan.name === "Alpha Growth";
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`glass-card p-5 ${featured ? "ring-1 ring-primary/30" : ""}`}
              >
                {featured && (
                  <span className="mb-3 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
                    Popular
                  </span>
                )}
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-semibold">{plan.name}</h3>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-semibold tabular-nums">{plan.rate}%</span>
                    <span className="text-xs text-muted-foreground">/ mo</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <span className="text-[10px] text-muted-foreground block">Min</span>
                    <span className="text-xs font-medium">${plan.min_amount.toLocaleString()}</span>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <span className="text-[10px] text-muted-foreground block">Max</span>
                    <span className="text-xs font-medium">{plan.max_amount ? `$${plan.max_amount.toLocaleString()}` : "Unlimited"}</span>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <span className="text-[10px] text-muted-foreground block">Lock</span>
                    <span className="text-xs font-medium">{plan.duration_days} Days</span>
                  </div>
                </div>

                <ul className="mt-3 flex flex-col gap-1.5">
                  {(plan.features || []).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-success shrink-0" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className="btn-press mt-4 w-full gap-2 text-xs"
                  variant={featured ? "default" : "outline"}
                  onClick={() => handleActivate(plan)}
                >
                  Activate Plan <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Invest;
