import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const plans = [
  {
    name: "Starter",
    rate: "8%",
    period: "Monthly",
    min: "$500",
    max: "$9,999",
    duration: "30 Days",
    dailyReturn: "$1.33 – $26.66",
    features: ["Daily accrual", "Standard support", "Basic analytics"],
  },
  {
    name: "Alpha Growth",
    rate: "12%",
    period: "Monthly",
    min: "$10,000",
    max: "$49,999",
    duration: "60 Days",
    dailyReturn: "$40.00 – $199.99",
    features: ["Hourly accrual", "Priority support", "Advanced analytics", "Express withdrawals"],
    featured: true,
  },
  {
    name: "Institutional",
    rate: "18%",
    period: "Monthly",
    min: "$50,000",
    max: "Unlimited",
    duration: "90 Days",
    dailyReturn: "$300.00+",
    features: ["Real-time accrual", "Dedicated manager", "Full analytics", "Instant withdrawals", "API access"],
  },
];

const Invest = () => (
  <AppLayout>
    <div className="px-4 py-5">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Investment Plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a plan that fits your goals.</p>
      </div>

      <div className="flex flex-col gap-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`glass-card p-5 ${plan.featured ? "ring-1 ring-primary/30" : ""}`}
          >
            {plan.featured && (
              <span className="mb-3 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
                Popular
              </span>
            )}
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold">{plan.name}</h3>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-semibold tabular-nums">{plan.rate}</span>
                <span className="text-xs text-muted-foreground">/ mo</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <span className="text-[10px] text-muted-foreground block">Min</span>
                <span className="text-xs font-medium">{plan.min}</span>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <span className="text-[10px] text-muted-foreground block">Max</span>
                <span className="text-xs font-medium">{plan.max}</span>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <span className="text-[10px] text-muted-foreground block">Lock</span>
                <span className="text-xs font-medium">{plan.duration}</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Est. daily return: <span className="text-foreground font-medium">{plan.dailyReturn}</span>
            </div>

            <ul className="mt-3 flex flex-col gap-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-success shrink-0" strokeWidth={2} />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              className="btn-press mt-4 w-full gap-2 text-xs"
              variant={plan.featured ? "default" : "outline"}
              onClick={() => toast.info("Investment activation will be available after connecting your backend.")}
            >
              Activate Plan <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default Invest;
